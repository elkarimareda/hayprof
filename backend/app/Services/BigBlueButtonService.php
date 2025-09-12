<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;
use InvalidArgumentException;

readonly class BigBlueButtonService
{
    private readonly string $baseUrl;
    private readonly string $salt;
    private readonly int $timeout;
    private readonly int $retryAttempts;
    private readonly int $cacheTtl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('bigbluebutton.server_base_url'), '/') . '/';
        $this->salt = config('bigbluebutton.server_salt');
        $this->timeout = config('bigbluebutton.timeout', 30);
        $this->retryAttempts = config('bigbluebutton.retry_attempts', 3);
        $this->cacheTtl = config('bigbluebutton.cache_ttl', 300);
    }

    /**
     * Create a new meeting
     */
    public function createMeeting(array $params): array
    {
        $defaultParams = [
            'allowStartStopRecording' => 'true',
            'autoStartRecording' => 'false',
            'record' => 'false',
            'duration' => config('bigbluebutton.default_meeting_duration'),
            'maxParticipants' => config('bigbluebutton.default_max_participants'),
        ];

        $params = [...$defaultParams, ...$params];
        
        // Required parameters validation
        if (!isset($params['name']) || !isset($params['meetingID'])) {
            throw new InvalidArgumentException('Meeting name and meetingID are required');
        }

        $response = $this->makeApiCall('create', $params);
        
        return $this->parseXmlResponse($response);
    }

    /**
     * Join a meeting
     */
    public function joinMeeting(string $meetingId, string $userName, string $password, array $options = []): string
    {
        $params = [
            'meetingID' => $meetingId,
            'fullName' => $userName,
            'password' => $password,
            'redirect' => 'true',
            ...$options
        ];

        return $this->buildUrl('join', $params);
    }

    /**
     * Get meeting info with caching
     */
    public function getMeetingInfo(string $meetingId, string $moderatorPassword): array
    {
        $cacheKey = "bbb_meeting_info_{$meetingId}";
        
        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($meetingId, $moderatorPassword) {
            $params = [
                'meetingID' => $meetingId,
                'password' => $moderatorPassword,
            ];

            $response = $this->makeApiCall('getMeetingInfo', $params);
            
            return $this->parseXmlResponse($response);
        });
    }

    /**
     * End a meeting
     */
    public function endMeeting(string $meetingId, string $moderatorPassword): array
    {
        $params = [
            'meetingID' => $meetingId,
            'password' => $moderatorPassword,
        ];

        // Clear cache when meeting ends
        Cache::forget("bbb_meeting_info_{$meetingId}");
        Cache::forget('bbb_meetings_list');

        $response = $this->makeApiCall('end', $params);
        
        return $this->parseXmlResponse($response);
    }

    /**
     * Get meetings list with caching
     */
    public function getMeetings(): array
    {
        return Cache::remember('bbb_meetings_list', $this->cacheTtl, function () {
            $response = $this->makeApiCall('getMeetings');
            return $this->parseXmlResponse($response);
        });
    }

    /**
     * Check if meeting is running
     */
    public function isMeetingRunning(string $meetingId): bool
    {
        $params = ['meetingID' => $meetingId];
        $response = $this->makeApiCall('isMeetingRunning', $params);
        $data = $this->parseXmlResponse($response);
        
        return isset($data['running']) && $data['running'] === 'true';
    }

    /**
     * Get recordings with caching
     */
    public function getRecordings(?string $meetingId = null): array
    {
        $cacheKey = $meetingId ? "bbb_recordings_{$meetingId}" : 'bbb_recordings_all';
        
        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($meetingId) {
            $params = [];
            if ($meetingId) {
                $params['meetingID'] = $meetingId;
            }

            $response = $this->makeApiCall('getRecordings', $params);
            
            return $this->parseXmlResponse($response);
        });
    }

    /**
     * Delete recordings
     */
    public function deleteRecordings(string $recordId): array
    {
        $params = ['recordID' => $recordId];
        
        // Clear recordings cache
        Cache::flush(); // Or use more specific cache tags if available
        
        $response = $this->makeApiCall('deleteRecordings', $params);
        
        return $this->parseXmlResponse($response);
    }

    /**
     * Generate a secure hash for API calls
     */
    private function generateChecksum(string $method, string $queryString): string
    {
        return hash('sha1', $method . $queryString . $this->salt);
    }

    /**
     * Build URL with checksum
     */
    private function buildUrl(string $method, array $params = []): string
    {
        $queryString = http_build_query($params);
        $checksum = $this->generateChecksum($method, $queryString);
        
        return $this->baseUrl . "api/{$method}?" . $queryString . "&checksum=" . $checksum;
    }

    /**
     * Make API call to BigBlueButton server with retry logic
     */
    private function makeApiCall(string $method, array $params = []): string
    {
        $url = $this->buildUrl($method, $params);

        try {
            $response = Http::timeout($this->timeout)
                ->retry($this->retryAttempts, 100)
                ->get($url);
            
            if (!$response->successful()) {
                throw new Exception("HTTP Error: {$response->status()} - {$response->body()}");
            }

            return $response->body();
        } catch (Exception $e) {
            Log::error("BigBlueButton API Error", [
                'method' => $method,
                'params' => $params,
                'url' => $url,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Parse XML response to array
     */
    private function parseXmlResponse(string $xmlString): array
    {
        $xml = simplexml_load_string($xmlString);
        
        if ($xml === false) {
            throw new Exception('Invalid XML response from BigBlueButton server');
        }

        return json_decode(json_encode($xml), true);
    }
}