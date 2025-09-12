<?php

return [
    'server_base_url' => env('BBB_SERVER_BASE_URL', 'https://your-bbb-server.com/bigbluebutton/'),
    'server_salt' => env('BBB_SERVER_SALT', 'your-secret-salt'),
    'default_meeting_duration' => env('BBB_DEFAULT_MEETING_DURATION', 0), // 0 = unlimited
    'default_max_participants' => env('BBB_DEFAULT_MAX_PARTICIPANTS', 0), // 0 = unlimited
    'timeout' => env('BBB_TIMEOUT', 30),
    'retry_attempts' => env('BBB_RETRY_ATTEMPTS', 3),
    'cache_ttl' => env('BBB_CACHE_TTL', 300), // 5 minutes
];