<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Runs on the default connection, which points at the kalaw_db schema.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('housing', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('area');
            $table->string('price')->nullable();
            $table->text('description')->nullable();
            $table->string('purpose', 20)->nullable();      // For sale / For rent
            $table->string('type', 30)->nullable();         // House, Apartment, ...
            $table->string('availability', 20)->nullable(); // Available, Reserved, Closed
            $table->timestamps();
        });

        Schema::create('housing_contact', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_id')->constrained('housing')->cascadeOnDelete();
            $table->string('name');
            $table->string('phonenumber', 50);
            $table->string('address', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('housing_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('housing_id')->constrained('housing')->cascadeOnDelete();
            $table->string('path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('housing_images');
        Schema::dropIfExists('housing_contact');
        Schema::dropIfExists('housing');
    }
};
