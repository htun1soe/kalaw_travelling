<?php

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
