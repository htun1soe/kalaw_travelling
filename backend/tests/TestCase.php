<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $app = parent::createApplication();
        $databaseUrl = getenv('TEST_DATABASE_URL');

        if ($databaseUrl !== false && $databaseUrl !== '') {
            $config = $app->make('config');
            $config->set('database.connections.testing', ['url' => $databaseUrl, 'prefix' => '']);
            $config->set('database.default', 'testing');
            $config->set('superadmin.connection', 'testing');
        }

        return $app;
    }
}
