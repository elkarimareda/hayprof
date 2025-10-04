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
            $table->timestamp('validated_at')->nullable()->after('is_validated');
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete()->after('validated_at');
            $table->text('validation_notes')->nullable()->after('validated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Drop foreign key first if it exists
            if (Schema::hasColumn('courses', 'validated_by')) {
                $table->dropForeign(['validated_by']);
                $table->dropColumn('validated_by');
            }

            if (Schema::hasColumn('courses', 'validated_at')) {
                $table->dropColumn('validated_at');
            }

            if (Schema::hasColumn('courses', 'validation_notes')) {
                $table->dropColumn('validation_notes');
            }
        });
    }
};
