<?php

namespace App\SuperAdmin;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * @property string $username
 * @property string $password
 * @property bool|null $managed_by_env
 */
#[Fillable(['username', 'password', 'managed_by_env'])]
#[Hidden(['password', 'remember_token'])]
class SuperAdmin extends Authenticatable
{
    protected $table = 'super_admin';

    public function getConnectionName(): ?string
    {
        return config('superadmin.connection');
    }

    public function canAccessDashboard(): bool
    {
        return ! $this->managed_by_env || app()->isLocal();
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['managed_by_env' => 'boolean'];
    }
}
