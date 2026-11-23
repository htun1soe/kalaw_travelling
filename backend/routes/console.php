<?php

use Illuminate\Console\Events\CommandFinished;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

if (app()->environment('local')) {
    // Workbench and other SQL clients can also change either database.
    Schedule::command('db:diagram')->everyMinute();

    Event::listen(CommandFinished::class, function (CommandFinished $event) {
        $migrations = ['migrate', 'migrate:rollback', 'migrate:refresh', 'migrate:reset', 'migrate:fresh'];
        if ($event->exitCode !== 0 || ! in_array($event->command, $migrations, true) || $event->input->hasParameterOption('--pretend')) {
            return;
        }

        try {
            Artisan::call('db:diagram', [], $event->output);
        } catch (Throwable $error) {
            report($error);
            $event->output->writeln('<comment>Database documentation refresh failed. Run php artisan db:diagram to retry.</comment>');
        }
    });
}
