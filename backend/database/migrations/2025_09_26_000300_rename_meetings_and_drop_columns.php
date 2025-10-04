<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rename table if it exists
        if (Schema::hasTable('big_blue_button_meetings')) {
            Schema::rename('big_blue_button_meetings', 'meetings');
        }

        // Drop unwanted columns and student relationship
        if (Schema::hasTable('meetings')) {
            Schema::table('meetings', function (Blueprint $table) {
                // Drop foreign key to student if exists
                if (Schema::hasColumn('meetings', 'student_id')) {
                    try {
                        $table->dropForeign(['student_id']);
                    } catch (\Exception $e) {
                        // ignore if constraint doesn't exist
                    }
                    $table->dropColumn('student_id');
                }

                if (Schema::hasColumn('meetings', 'name')) {
                    $table->dropColumn('name');
                }

                if (Schema::hasColumn('meetings', 'duration')) {
                    $table->dropColumn('duration');
                }

                if (Schema::hasColumn('meetings', 'scheduled_at')) {
                    try {
                        $table->dropIndex(['scheduled_at']);
                    } catch (\Exception $e) {
                        // ignore
                    }
                    $table->dropColumn('scheduled_at');
                }

                if (Schema::hasColumn('meetings', 'max_participants')) {
                    $table->dropColumn('max_participants');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('meetings')) {
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

        // Rename back
        if (Schema::hasTable('meetings')) {
            Schema::rename('meetings', 'big_blue_button_meetings');
        }
    }
};
