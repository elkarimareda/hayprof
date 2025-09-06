<?php

namespace App\Console\Commands;

use App\Models\Media;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanExpiredMedia extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:clean-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete expired temporary media and orphaned files not in database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting media cleanup...');

        // 1. Delete expired temporary media (older than 1 minute with no association)
        $expired = Media::whereNull('mediable_id')
            ->where('created_at', '<', Carbon::now()->subMinute())
            ->get();

        $expiredCount = 0;
        foreach ($expired as $media) {
            if ($media->file_path && Storage::exists($media->file_path)) {
                Storage::delete($media->file_path);
            }
            if ($media->thumbnail_path && Storage::exists($media->thumbnail_path)) {
                Storage::delete($media->thumbnail_path);
            }
            $media->delete();
            $expiredCount++;
        }

        $this->info("Deleted {$expiredCount} expired temporary media files.");

        // 2. Delete orphaned files that exist in storage but not in database
        $orphanedCount = 0;
        $allFiles = Storage::allFiles('medias'); // Assuming media files are stored in 'medias' directory

        // Get all file paths from database
        $dbFilePaths = Media::whereNotNull('file_path')->pluck('file_path')->toArray();
        $dbThumbnailPaths = Media::whereNotNull('thumbnail_path')->pluck('thumbnail_path')->toArray();
        $allDbPaths = array_merge($dbFilePaths, $dbThumbnailPaths);

        foreach ($allFiles as $filePath) {
            // Skip if file exists in database
            if (in_array($filePath, $allDbPaths)) {
                continue;
            }

            // Delete orphaned file
            Storage::delete($filePath);
            $orphanedCount++;
            $this->line("Deleted orphaned file: {$filePath}");
        }

        $this->info("Deleted {$orphanedCount} orphaned media files.");
        $this->info("Total cleanup completed: {$expiredCount} expired + {$orphanedCount} orphaned = " . ($expiredCount + $orphanedCount) . " files deleted.");
    }
}
