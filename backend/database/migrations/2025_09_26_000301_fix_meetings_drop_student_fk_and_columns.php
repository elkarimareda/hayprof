<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        // If the meetings table doesn't exist, nothing to do
        if (!Schema::hasTable('meetings')) {
            return;
        }

        // Try to find and drop any foreign key on student_id
        try {
            $dbName = DB::select('select database() as db')[0]->db;
            $rows = DB::select(
                'select constraint_name from information_schema.key_column_usage where table_schema = ? and table_name = ? and column_name = ?',
                [$dbName, 'meetings', 'student_id']
            );

            foreach ($rows as $row) {
                $constraint = $row->constraint_name;
                try {
                    DB::statement("ALTER TABLE `meetings` DROP FOREIGN KEY `{$constraint}`");
                } catch (\Exception $e) {
                    // ignore
                }
            }
        } catch (\Exception $e) {
            // ignore any DB inspection errors
        }

        // Now drop unwanted columns if they exist
        Schema::table('meetings', function (Blueprint $table) {
            if (Schema::hasColumn('meetings', 'student_id')) {
                try { $table->dropColumn('student_id'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('meetings', 'name')) {
                try { $table->dropColumn('name'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('meetings', 'duration')) {
                try { $table->dropColumn('duration'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('meetings', 'scheduled_at')) {
                try { $table->dropColumn('scheduled_at'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('meetings', 'max_participants')) {
                try { $table->dropColumn('max_participants'); } catch (\Exception $e) { }
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('meetings')) {
            return;
        }

        Schema::table('meetings', function (Blueprint $table) {
            if (!Schema::hasColumn('meetings', 'name')) {
                $table->string('name')->after('meeting_id');
            }
            if (!Schema::hasColumn('meetings', 'max_participants')) {
                $table->unsignedInteger('max_participants')->nullable()->after('is_recording');
            }
            if (!Schema::hasColumn('meetings', 'duration')) {
                $table->unsignedInteger('duration')->nullable()->after('max_participants');
            }
            if (!Schema::hasColumn('meetings', 'scheduled_at')) {
                $table->timestamp('scheduled_at')->nullable()->after('duration');
                $table->index('scheduled_at');
            }
            if (!Schema::hasColumn('meetings', 'student_id')) {
                $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('cascade')->after('teacher_id');
            }
        });
    }
};
