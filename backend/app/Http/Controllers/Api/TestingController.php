<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use PDOException;

class TestingController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Kalaw Traveling API is running',
            'version' => '1.0.0',
        ]);
    }

    public function database(): JsonResponse
    {
        try {
            DB::selectOne('SELECT 1');
        } catch (InvalidArgumentException|PDOException) {
            return response()->json(['status' => 'unavailable'], 503)
                ->header('Cache-Control', 'no-store');
        }

        return response()->json(['status' => 'connected'])
            ->header('Cache-Control', 'no-store');
    }
}
