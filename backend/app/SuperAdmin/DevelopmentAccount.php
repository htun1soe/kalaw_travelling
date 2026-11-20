<?php

namespace App\SuperAdmin;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DevelopmentAccount
{
    public function sync(): bool
    {
        if (! app()->isLocal()) {
            return false;
        }

        $username = config('superadmin.username');
        $password = config('superadmin.password');

        if (! is_string($username) || ! is_string($password)) {
            return false;
        }

        $username = Str::lower(trim($username));
        if (! preg_match('/\A[a-z0-9_-]{1,64}\z/', $username) || mb_strlen($password) < 12 || strlen($password) > 72 || str_contains($password, "\0")) {
            return false;
        }

        $account = SuperAdmin::query()->where('managed_by_env', true)->first();
        if ($account?->username === $username && Hash::check($password, $account->password)) {
            return true;
        }

        SuperAdmin::query()->updateOrCreate(
            ['managed_by_env' => true],
            ['username' => $username, 'password' => Hash::make($password)],
        );

        return true;
    }
}
