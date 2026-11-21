<?php

use App\Http\Controllers\Api\HousingController;
use App\Http\Controllers\Api\TestingController;
use App\SuperAdmin\SessionController;
use Illuminate\Support\Facades\Route;

Route::get('/testing', TestingController::class);
Route::get('/testing/database', [TestingController::class, 'database']);

Route::middleware('web')->prefix('auth')->controller(SessionController::class)->group(function () {
    Route::get('/csrf', 'csrf');
    Route::post('/login', 'login')->middleware('throttle:super-admin-login');
    Route::get('/me', 'me')->middleware(['auth:superadmin', 'can:access-super-admin']);
    Route::post('/logout', 'logout')->middleware('auth:superadmin');
});

// Public, read-only: used by the client site.
Route::get('/housing', [HousingController::class, 'index']);
Route::get('/housing/{housing}', [HousingController::class, 'show'])->whereNumber('housing');

// Super-admin writes. The web group supplies the session and CSRF protection.
Route::middleware(['web', 'auth:superadmin', 'can:access-super-admin'])
    ->prefix('admin/housing')
    ->controller(HousingController::class)
    ->group(function () {
        Route::post('/', 'store');
        Route::put('/{housing}', 'update')->whereNumber('housing');
        Route::delete('/{housing}', 'destroy')->whereNumber('housing');
    });
