<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function getConnection(): ?string
    {
        return config('superadmin.connection');
    }

    public function up(): void
    {
        Schema::connection($this->getConnection())->create('super_admin', function (Blueprint $table) {
            $table->id();
            $table->string('username', 64)->unique();
            $table->string('password');
            $table->boolean('managed_by_env')->nullable()->unique();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->dropIfExists('super_admin');
    }
};
