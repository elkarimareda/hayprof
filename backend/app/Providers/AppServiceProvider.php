<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\BigBlueButtonService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Event;
use App\Events\CourseCreated;
use App\Events\StudentEnrolled;
use App\Listeners\CreateMeetingForCourse;
use App\Listeners\UpdateMeetingForEnrollment;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
        $this->app->singleton(BigBlueButtonService::class, function ($app) {
            return new BigBlueButtonService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register event listeners
        Event::listen(CourseCreated::class, CreateMeetingForCourse::class);
        Event::listen(StudentEnrolled::class, UpdateMeetingForEnrollment::class);

        // Gate definitions
        Gate::define('create-meeting', function ($user) {
            return $user->can('create meetings');
        });

        Gate::define('moderate-meeting', function ($user, $meetingId) {
            return $user->can('moderate meetings') || $user->ownsMeeting($meetingId);
        });

        Gate::define('view-recordings', function ($user) {
            return $user->can('view recordings');
        });

        // Register admin route middleware alias
        if ($this->app->bound('router')) {
            $this->app['router']->aliasMiddleware('admin', \App\Http\Middleware\AdminMiddleware::class);
        }
    }
}
