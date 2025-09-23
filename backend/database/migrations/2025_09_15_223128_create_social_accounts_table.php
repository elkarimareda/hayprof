<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('provider'); // google, facebook, twitter, github, etc.
            $table->string('provider_id'); // Social provider user ID
            $table->string('provider_email')->nullable(); // Email from social provider
            $table->string('avatar')->nullable(); // Profile picture from social provider
            $table->json('provider_data')->nullable(); // Store additional provider data
            $table->timestamps();

            // Ensure one account per provider per user
            $table->unique(['user_id', 'provider']);
            // Ensure one provider account can't be linked to multiple users
            $table->unique(['provider', 'provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
