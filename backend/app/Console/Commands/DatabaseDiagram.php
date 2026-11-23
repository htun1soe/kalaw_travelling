<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Schema\Builder;
use Illuminate\Filesystem\LockableFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/** @phpstan-type Relation array{child: string, parent: string, columns: string, referenced: string, onDelete: string, onUpdate: string} */
class DatabaseDiagram extends Command
{
    protected $signature = 'db:diagram';

    protected $description = 'Generate the schema diagram, column reference, and table purpose guide from MariaDB';

    public function handle(): void
    {
        $lock = new LockableFile(storage_path('framework/cache/database-schema.lock'), 'c');
        $lock->getExclusiveLock(true);
        try {
            foreach ($this->documents() as $file => $document) {
                $path = base_path('../docs/'.$file);
                if (! File::exists($path) || File::get($path) !== $document) {
                    File::replace($path, $document, 0644);
                    $this->info('Updated docs/'.$file);
                }
            }
        } finally {
            $lock->close();
        }
    }

    /** @return array<string, string> */
    private function documents(): array
    {
        $schemas = [];
        $relations = [];
        $dictionary = [];
        $guide = [
            '# Database and table guide', '',
            'Each entry describes what one row represents and how Laravel uses it. For column types and keys, see the [schema diagram and column reference](DATABASE_SCHEMA.md).', '',
        ];
        $connections = ['application' => DB::connection(), 'administration' => DB::connection(config('superadmin.connection'))];
        $schemaNames = array_map(fn ($db) => $db->getDatabaseName(), $connections);

        foreach (array_unique($schemaNames) as $role => $schema) {
            $builder = $connections[$role]->getSchemaBuilder();
            $tables = collect($builder->getTables($schema))->sortBy('name', SORT_STRING)->values();
            $schemas[$schema] = [];
            $guide[] = '## '.self::code($schema);
            $guide[] = '';
            $notes = [];
            foreach (array_keys($schemaNames, $schema, true) as $schemaRole) {
                $guide[] = config("table_guide.$schemaRole.purpose");
                $guide[] = '';
                $notes = array_replace($notes, config("table_guide.$schemaRole.tables"));
            }
            $guide[] = '| Table | Purpose and use |';
            $guide[] = '| --- | --- |';
            $dictionary[] = '## '.self::code($schema).' · '.count($tables).(count($tables) === 1 ? ' table' : ' tables');
            $dictionary[] = '';
            foreach ($tables as $metadata) {
                $table = $metadata['name'];
                $schemas[$schema][] = $table;
                [$details, $edges, $primary] = $this->describeTable($builder, $schema, $table);
                $purpose = $notes[$table] ?? $this->describeNewTable($metadata['comment'], $primary);
                $guide[] = '| '.self::code($table).' | '.$purpose.' |';
                array_push($dictionary, ...$details);
                array_push($relations, ...$edges);
            }
            $guide[] = '';
        }

        $intro = [
            '# Database schema', '',
            'Generated from MariaDB metadata. [Table purposes and relationships](DATABASE_TABLES.md) · [Application flow and refresh instructions](DATABASE.md)', '',
            '## Table map', '',
            'Each group is a database. An arrow points from a foreign key to its referenced column. Tables without declared relationships share a box.', '',
        ];

        $guide[] = '## Foreign key relationships';
        $guide[] = '';
        $guide[] = 'Each row is a constraint enforced by MariaDB. The last two columns describe what happens to child rows when the referenced parent key changes or the parent row is deleted. Application-managed associations, such as password resets by email, are explained with their tables above.';
        $guide[] = '';
        if ($relations) {
            $guide[] = '| Child table and columns | Parent table and columns | On update | On delete |';
            $guide[] = '| --- | --- | --- | --- |';
            foreach ($relations as $fk) {
                $child = self::code($fk['child'].' ('.$fk['columns'].')');
                $parent = self::code($fk['parent'].' ('.$fk['referenced'].')');
                $guide[] = "| $child | $parent | ".$fk['onUpdate'].' | '.$fk['onDelete'].' |';
            }
        } else {
            $guide[] = 'These schemas currently declare no foreign keys.';
        }
        $guide[] = '';
        $guide[] = 'See the [database developer guide](DATABASE.md#keep-the-documentation-current) for refresh instructions and how to document a new table.';
        $guide[] = '';

        return [
            'DATABASE_SCHEMA.md' => implode("\n", [...$intro, ...$this->diagram($schemas, $relations), '', 'PK = primary key. FK = foreign key.', '', ...$dictionary]),
            'DATABASE_TABLES.md' => implode("\n", $guide),
        ];
    }

    /** @param list<string> $primary */
    private function describeNewTable(?string $comment, array $primary): string
    {
        if ($comment !== null && trim($comment) !== '') {
            // Table comments are database text. Render Markdown punctuation literally in the guide.
            $text = preg_replace('/\s+/u', ' ', trim($comment));

            return str_replace('|', '&#124;', addcslashes(htmlspecialchars($text, ENT_NOQUOTES | ENT_SUBSTITUTE), '\\\\`*_[]~$'));
        }

        $key = $primary ? ' The primary key is '.self::code(implode(', ', $primary)).'.' : ' MariaDB declares no primary key.';

        return 'Business purpose pending.'.$key;
    }

    /** @return array{list<string>, list<Relation>, list<string>} */
    private function describeTable(Builder $builder, string $schema, string $table): array
    {
        $primary = collect($builder->getIndexes($table))->firstWhere('primary', true);
        $keys = array_fill_keys($primary['columns'] ?? [], ['PK']);
        $references = [];
        $edges = [];
        foreach (collect($builder->getForeignKeys($table))->sortBy('name') as $fk) {
            $target = $fk['foreign_schema'].'.'.$fk['foreign_table'];
            $columns = implode(', ', $fk['columns']);
            $targets = implode(', ', $fk['foreign_columns']);
            $edges[] = [
                'child' => "$schema.$table", 'parent' => $target,
                'columns' => $columns, 'referenced' => $targets,
                'onDelete' => strtoupper($fk['on_delete']), 'onUpdate' => strtoupper($fk['on_update']),
            ];
            $references[] = self::code($columns).' → '.self::code("$target ($targets)").' · ON DELETE '.strtoupper($fk['on_delete']);
            $references[] = '';
            foreach ($fk['columns'] as $column) {
                $keys[$column][] = 'FK';
            }
        }
        $lines = ['### '.self::code($table), '', '| Column | SQL type | Nullable | Key |', '| --- | --- | --- | --- |'];
        foreach ($builder->getColumns($table) as $column) {
            $key = implode(', ', array_unique($keys[$column['name']] ?? []));
            $lines[] = '| '.self::code($column['name']).' | '.self::code($column['type']).' | '.($column['nullable'] ? 'Yes' : 'No').' | '.$key.' |';
        }

        return [[...$lines, '', ...$references], $edges, $primary['columns'] ?? []];
    }

    /**
     * @param  array<string, list<string>>  $schemas
     * @param  list<Relation>  $relations
     * @return list<string>
     */
    private function diagram(array $schemas, array $relations): array
    {
        $nodes = [];
        foreach ($relations as $relation) {
            foreach ([$relation['child'], $relation['parent']] as $table) {
                $nodes[$table] ??= 't'.count($nodes);
            }
        }
        $lines = ['```mermaid', 'flowchart LR'];
        $external = $nodes;
        foreach (array_keys($schemas) as $i => $schema) {
            $lines[] = '    subgraph db'.$i.'["'.self::label($schema).'"]';
            $standalone = [];
            foreach ($schemas[$schema] as $table) {
                $qualified = "$schema.$table";
                if (isset($nodes[$qualified])) {
                    $lines[] = '        '.$nodes[$qualified].'["'.self::label($table).'"]';
                    unset($external[$qualified]);
                } else {
                    $standalone[] = self::label($table);
                }
            }
            if ($standalone || ! $schemas[$schema]) {
                $rows = array_map(fn ($pair) => implode(' · ', $pair), array_chunk($standalone, 2));
                $lines[] = '        other'.$i.'["'.(implode('<br/>', $rows) ?: 'No tables').'"]';
            }
            $lines[] = '    end';
        }
        foreach ($external as $qualified => $id) {
            $lines[] = '    '.$id.'["'.self::label($qualified).'"]';
        }
        foreach ($relations as $relation) {
            $label = self::label($relation['columns'].' → '.$relation['referenced']);
            $lines[] = '    '.$nodes[$relation['child']].' -->|"'.$label.'"| '.$nodes[$relation['parent']];
        }
        $lines[] = '```';

        return $lines;
    }

    private static function label(string $value): string
    {
        // Mermaid uses decimal entities inside quoted labels.
        return preg_replace_callback('/[\x00-\x1f"#&<>|`\\\\]/', fn ($match) => '#'.ord($match[0]).';', $value);
    }

    private static function code(string $value): string
    {
        if (preg_match('/^[\w ().,-]+$/uD', $value)) {
            return '`'.$value.'`';
        }

        return '<code>'.str_replace('|', '&#124;', htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE)).'</code>';
    }
}
