<?php

use Illuminate\Support\Facades\DB;

test('the testing endpoint returns the API connection payload', function () {
    $this->getJson('/api/testing')
        ->assertOk()
        ->assertJson([
            'status' => 'success',
            'message' => 'Kalaw Traveling API is running',
            'version' => '1.0.0',
        ]);
});

test('the database check connects to the configured database', function () {
    DB::shouldReceive('selectOne')->with('SELECT 1')->once()->andReturn((object) ['connected' => 1]);

    $this->getJson('/api/testing/database')
        ->assertOk()
        ->assertExactJson(['status' => 'connected']);
});

test('the database check reports an unavailable database without exposing connection details', function () {
    DB::shouldReceive('selectOne')->with('SELECT 1')->once()
        ->andThrow(new PDOException('Private connection details'));

    $this->getJson('/api/testing')->assertOk();
    $this->getJson('/api/testing/database')
        ->assertServiceUnavailable()
        ->assertExactJson(['status' => 'unavailable']);
});
