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
        Schema::table('courses', function (Blueprint $table) {
            // First change column type to integer with larger capacity
            $table->integer('duration_session')->change();
        });
        
        // Then convert existing hours to minutes (multiply by 60)
        \DB::statement('UPDATE courses SET duration_session = ROUND(duration_session * 60)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert back to hours (divide by 60)
        \DB::statement('UPDATE courses SET duration_session = duration_session / 60');
        
        Schema::table('courses', function (Blueprint $table) {
            // Change back to decimal
            $table->decimal('duration_session', 3, 1)->change();
        });
    }
};
