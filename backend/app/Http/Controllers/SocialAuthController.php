<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\SocialAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect to social provider
     */
    public function redirectToProvider(string $provider): JsonResponse
    {
        try {
            $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
            
            return response()->json([
                'status' => 'success',
                'redirect_url' => $url
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to redirect to ' . $provider,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle callback from social provider
     */
    public function handleProviderCallback(string $provider): RedirectResponse
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            
            // Check if this is a linking request (state parameter)
            $state = request('state');
            if ($state) {
                try {
                    $linkingData = json_decode(base64_decode($state), true);
                    if ($linkingData && $linkingData['action'] === 'link') {
                        return $this->handleAccountLinking($provider, $socialUser, $linkingData);
                    }
                } catch (\Exception $e) {
                    // Invalid state, continue with normal login flow
                }
            }
            
            // Normal login/registration flow
            // Check if this social account already exists
            $socialAccount = SocialAccount::where('provider', $provider)
                                        ->where('provider_id', $socialUser->getId())
                                        ->first();

            if ($socialAccount) {
                // Social account exists - update and login
                $socialAccount->updateFromProvider($socialUser);
                $user = $socialAccount->user;
            } else {
                // Social account doesn't exist - check if user exists by email
                $user = User::where('email', $socialUser->getEmail())->first();
                
                if ($user) {
                    // User exists - create new social account link
                    $socialAccount = $user->socialAccounts()->create([
                        'provider' => $provider,
                        'provider_id' => $socialUser->getId(),
                        'provider_email' => $socialUser->getEmail(),
                        'avatar' => $socialUser->getAvatar(),
                        'provider_data' => [
                            'name' => $socialUser->getName(),
                            'nickname' => $socialUser->getNickname(),
                            'raw' => $socialUser->getRaw(),
                        ],
                    ]);
                } else {
                    // Create new user and social account
                    $user = User::create([
                        'name' => $socialUser->getName(),
                        'email' => $socialUser->getEmail(),
                        'email_verified_at' => now(),
                        'password' => Hash::make(uniqid()), // Random password for social users
                        'user_type' => 'student', // Default to student, can be changed later
                    ]);

                    // Create the social account
                    $socialAccount = $user->socialAccounts()->create([
                        'provider' => $provider,
                        'provider_id' => $socialUser->getId(),
                        'provider_email' => $socialUser->getEmail(),
                        'avatar' => $socialUser->getAvatar(),
                        'provider_data' => [
                            'name' => $socialUser->getName(),
                            'nickname' => $socialUser->getNickname(),
                            'raw' => $socialUser->getRaw(),
                        ],
                    ]);
                }
            }

            // Create access token
            $token = $user->createToken('SocialLogin')->plainTextToken;

            // Prepare user data with all social accounts
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'avatar' => $user->getPrimaryAvatar(),
                'social_accounts' => $user->socialAccounts->map(function ($account) {
                    return [
                        'provider' => $account->provider,
                        'provider_email' => $account->provider_email,
                        'avatar' => $account->avatar,
                    ];
                }),
                'linked_providers' => $user->getLinkedProviders(),
            ];

            // Get frontend URL from environment or use default
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            
            // Build redirect URL with user data and token
            $redirectUrl = $frontendUrl . '/auth/callback?' . http_build_query([
                'status' => 'success',
                'token' => $token,
                'user' => base64_encode(json_encode($userData)),
                'provider' => $provider,
                'message' => 'Successfully logged in with ' . $provider
            ]);

            // Redirect to frontend
            return redirect($redirectUrl);

        } catch (\Exception $e) {
            // Redirect to frontend with error
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $redirectUrl = $frontendUrl . '/auth/callback?' . http_build_query([
                'status' => 'error',
                'message' => 'Failed to authenticate with ' . $provider,
                'error' => $e->getMessage()
            ]);
            
            return redirect($redirectUrl);
        }
    }

    /**
     * Handle account linking callback
     */
    private function handleAccountLinking(string $provider, $socialUser, array $linkingData): RedirectResponse
    {
        try {
            $user = User::find($linkingData['user_id']);
            
            if (!$user) {
                throw new \Exception('User not found for linking');
            }

            // Check if user already has this provider linked
            if ($user->hasSocialAccount($provider)) {
                throw new \Exception('Account is already linked to ' . $provider);
            }

            // Check if this social account is already linked to another user
            $existingSocialAccount = SocialAccount::where('provider', $provider)
                                                ->where('provider_id', $socialUser->getId())
                                                ->first();

            if ($existingSocialAccount) {
                throw new \Exception('This ' . $provider . ' account is already linked to another user');
            }

            // Create the social account link
            $user->socialAccounts()->create([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'provider_email' => $socialUser->getEmail(),
                'avatar' => $socialUser->getAvatar(),
                'provider_data' => [
                    'name' => $socialUser->getName(),
                    'nickname' => $socialUser->getNickname(),
                    'raw' => $socialUser->getRaw(),
                ],
            ]);

            // Prepare user data with updated social accounts
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'avatar' => $user->getPrimaryAvatar(),
                'social_accounts' => $user->fresh()->socialAccounts->map(function ($account) {
                    return [
                        'provider' => $account->provider,
                        'provider_email' => $account->provider_email,
                        'avatar' => $account->avatar,
                    ];
                }),
                'linked_providers' => $user->fresh()->getLinkedProviders(),
            ];

            // Get frontend URL from environment or use default
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            
            // Build redirect URL with linking success data
            $redirectUrl = $frontendUrl . '/profile?' . http_build_query([
                'status' => 'success',
                'action' => 'link',
                'provider' => $provider,
                'message' => 'Successfully linked ' . $provider . ' account',
                'user' => base64_encode(json_encode($userData))
            ]);

            return redirect($redirectUrl);

        } catch (\Exception $e) {
            // Get frontend URL from environment or use default
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            
            // Build redirect URL with linking error
            $redirectUrl = $frontendUrl . '/profile?' . http_build_query([
                'status' => 'error',
                'action' => 'link',
                'provider' => $provider,
                'message' => 'Failed to link ' . $provider . ' account',
                'error' => $e->getMessage()
            ]);

            return redirect($redirectUrl);
        }
    }

    /**
     * Link social account to existing authenticated user (Using existing callback)
     */
    public function linkAccount(Request $request, string $provider): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authentication required to link accounts'
                ], 401);
            }

            // Check if user already has this provider linked
            if ($user->hasSocialAccount($provider)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Account is already linked to ' . $provider
                ], 400);
            }

            // Create linking state with user information
            $linkingState = base64_encode(json_encode([
                'user_id' => $user->id,
                'action' => 'link',
                'provider' => $provider,
                'timestamp' => time()
            ]));

            // Use the regular callback URL with linking state
            $url = Socialite::driver($provider)
                ->stateless()
                ->with(['state' => $linkingState])
                ->redirect()
                ->getTargetUrl();
            
            return response()->json([
                'status' => 'redirect_required',
                'redirect_url' => $url,
                'message' => 'Authorization required to link ' . $provider . ' account'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to initiate ' . $provider . ' account linking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unlink specific social account from user
     */
    public function unlinkAccount(Request $request, string $provider): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authentication required to unlink accounts'
                ], 401);
            }

            $socialAccount = $user->getSocialAccount($provider);
            
            if (!$socialAccount) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No ' . $provider . ' account linked to this user'
                ], 400);
            }

            // Check if user has other ways to login (password or other social accounts)
            $hasPassword = $user->password && !Hash::check(uniqid(), $user->password);
            $hasOtherSocialAccounts = $user->socialAccounts()->where('provider', '!=', $provider)->exists();
            
            if (!$hasPassword && !$hasOtherSocialAccounts) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot unlink ' . $provider . ' account. Please set a password or link another social account first.'
                ], 400);
            }

            // Delete the social account
            $socialAccount->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully unlinked ' . $provider . ' account',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'avatar' => $user->getPrimaryAvatar(),
                    'social_accounts' => $user->fresh()->socialAccounts->map(function ($account) {
                        return [
                            'provider' => $account->provider,
                            'provider_email' => $account->provider_email,
                            'avatar' => $account->avatar,
                        ];
                    }),
                    'linked_providers' => $user->fresh()->getLinkedProviders(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to unlink ' . $provider . ' account',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}