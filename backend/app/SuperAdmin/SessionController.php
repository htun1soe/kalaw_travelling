<?php

namespace App\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    public function csrf(Request $request): JsonResponse
    {
        return response()->json(['token' => $request->session()->token()])
            ->header('Cache-Control', 'no-store');
    }

    public function login(Request $request, DevelopmentAccount $developmentAccount): JsonResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string', 'alpha_dash:ascii', 'max:64'],
            'password' => ['required', 'string', 'max:72'],
        ]);

        $password = $credentials['password'];
        $login = [
            'username' => Str::lower($credentials['username']),
            'password' => $password,
        ];
        if (! $developmentAccount->sync()) {
            $login['managed_by_env'] = null;
        }

        if (strlen($password) > 72 || str_contains($password, "\0") || ! Auth::guard('superadmin')->attempt($login)) {
            return response()->json(['message' => 'Username or password is incorrect.'], 401);
        }

        $request->session()->regenerate();

        return $this->me($request);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'username' => $request->user('superadmin')->username,
            'role' => 'super_admin',
        ])
            ->header('Cache-Control', 'no-store');
    }

    public function logout(Request $request): Response
    {
        Auth::guard('superadmin')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
