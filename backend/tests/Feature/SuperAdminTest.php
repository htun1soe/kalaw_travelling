<?php

use App\Models\User;
use App\SuperAdmin\SuperAdmin;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;

if (getenv('TEST_DATABASE_URL')) {
    uses(RefreshDatabase::class);
}

beforeEach(function () {
    if (config('database.default') !== 'testing') {
        $this->markTestSkipped('Set TEST_DATABASE_URL to a dedicated test database.');
    }

    config(['app.key' => 'base64:'.base64_encode(random_bytes(32))]);
});

test('local sign-in syncs the environment account with a hashed password', function () {
    app()->instance('env', 'local');
    $this->withoutMiddleware(PreventRequestForgery::class);
    config(['superadmin.username' => 'Owner', 'superadmin.password' => 'Fixture-only password 42']);

    $this->postJson('/api/auth/login', ['username' => 'OWNER', 'password' => 'Fixture-only password 42'])
        ->assertOk()->assertExactJson(['username' => 'owner', 'role' => 'super_admin']);
    $owner = SuperAdmin::query()->where('managed_by_env', true)->firstOrFail();
    expect($owner->username)->toBe('owner')
        ->and(Hash::check('Fixture-only password 42', $owner->password))->toBeTrue();
    $this->postJson('/api/auth/logout')->assertNoContent();

    config(['superadmin.username' => 'renamed-owner', 'superadmin.password' => 'New fixture password 43']);
    $this->postJson('/api/auth/login', ['username' => 'owner', 'password' => 'Fixture-only password 42'])
        ->assertUnauthorized();
    $this->postJson('/api/auth/login', ['username' => 'renamed-owner', 'password' => 'New fixture password 43'])
        ->assertOk();
    expect($owner->fresh()->username)->toBe('renamed-owner')
        ->and(SuperAdmin::query()->count())->toBe(1);
});

test('the environment account is restricted to local development', function () {
    config(['superadmin.username' => 'owner', 'superadmin.password' => 'Fixture-only password 42']);
    $credentials = ['username' => 'owner', 'password' => 'Fixture-only password 42'];
    $this->postJson('/api/auth/login', $credentials)->assertUnauthorized();
    expect(SuperAdmin::query()->count())->toBe(0);

    $account = SuperAdmin::query()->create([
        'username' => 'owner',
        'password' => Hash::make($credentials['password']),
        'managed_by_env' => true,
    ]);
    $this->postJson('/api/auth/login', $credentials)->assertUnauthorized();
    $this->actingAs($account, 'superadmin')->getJson('/api/auth/me')->assertForbidden();
});

test('a regular user is denied super-admin login and access', function () {
    $user = User::factory()->create(['name' => 'regular', 'role' => 'super_admin']);

    $this->get('/api/auth/me')->assertUnauthorized();
    $this->postJson('/api/auth/login', ['username' => 'regular', 'password' => 'password'])
        ->assertUnauthorized();
    $this->assertGuest('superadmin');

    $this->actingAs($user, 'web')->getJson('/api/auth/me')->assertUnauthorized();
});

test('super-admins can sign in, restore a session, and sign out', function () {
    $owner = SuperAdmin::query()->create(['username' => 'owner', 'password' => Hash::make('password')]);

    $this->getJson('/api/auth/csrf')->assertOk()->assertJsonStructure(['token']);
    $this->postJson('/api/auth/login', ['username' => 'OWNER', 'password' => 'password'])
        ->assertOk()
        ->assertExactJson(['username' => 'owner', 'role' => 'super_admin']);
    $this->assertAuthenticatedAs($owner, 'superadmin');
    $this->getJson('/api/auth/me')->assertOk()->assertJsonPath('username', $owner->username);

    $this->postJson('/api/auth/logout')->assertNoContent();
    $this->getJson('/api/auth/me')->assertUnauthorized();
});

test('super-admins pass application-wide policies', function () {
    Gate::define('manage-venues', fn () => false);

    $owner = SuperAdmin::query()->create(['username' => 'owner', 'password' => Hash::make('password')]);
    $user = User::factory()->create();

    expect($owner->can('manage-venues'))->toBeTrue()
        ->and($user->can('manage-venues'))->toBeFalse();
});

test('repeated super-admin login failures are rate limited', function () {
    $credentials = ['username' => 'unknown', 'password' => 'incorrect'];

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->postJson('/api/auth/login', $credentials)->assertUnauthorized();
    }

    $this->postJson('/api/auth/login', $credentials)->assertTooManyRequests();
});
