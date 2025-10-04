<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('meetings')) {
            return;
        }

        // If teacher_id column exists, drop its FK first (if present) then the column
        if (Schema::hasColumn('meetings', 'teacher_id')) {
            // Try to find the foreign key constraint name in information_schema
            $database = DB::getDatabaseName();
            $constraint = DB::table('information_schema.key_column_usage')
                ->select('constraint_name')
                ->where('table_schema', $database)
                ->where('table_name', 'meetings')
                ->where('column_name', 'teacher_id')
                ->whereNotNull('referenced_table_name')
                ->value('constraint_name');

            if ($constraint) {
                DB::statement("ALTER TABLE `meetings` DROP FOREIGN KEY `{$constraint}`");
            }

            Schema::table('meetings', function (Blueprint $table) {
                if (Schema::hasColumn('meetings', 'teacher_id')) {
                    $table->dropColumn('teacher_id');
                }
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('meetings')) {
            return;
        }

        Schema::table('meetings', function (Blueprint $table) {
            if (!Schema::hasColumn('meetings', 'teacher_id')) {
                $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade')->after('course_id');
            }
        });
    }
};
