# Social Authentication Setup

This file documents the social authentication setup using Laravel Socialite.

## Available Providers

The following social authentication providers are configured:

- **Google** - OAuth 2.0
- **Facebook** - OAuth 2.0  
- **Twitter** - OAuth 2.0
- **GitHub** - OAuth 2.0

## Environment Variables

Add these variables to your `.env` file:

```env
# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/social/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/auth/social/facebook/callback

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:8000/api/auth/social/twitter/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/auth/social/github/callback
```

## API Endpoints

### Public Authentication (No Authentication Required)

#### Get Authorization URL
```
GET /api/auth/social/{provider}/redirect
```
**Providers:** `google`, `facebook`, `twitter`, `github`

**Response:**
```json
{
  "status": "success",
  "redirect_url": "https://provider.com/oauth/authorize?client_id=..."
}
```

#### Handle OAuth Callback
```
GET /api/auth/social/{provider}/callback
```
**Providers:** `google`, `facebook`, `twitter`, `github`

**Response:** Redirects to frontend with query parameters

**Success Redirect:** `{FRONTEND_URL}/auth/callback?status=success&token={token}&user={base64_user_data}&provider={provider}&message=Successfully+logged+in+with+{provider}`

**Error Redirect:** `{FRONTEND_URL}/auth/callback?status=error&message=Failed+to+authenticate&error={error_message}`

**User Data (base64 encoded JSON):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "user_type": "student",
  "avatar": "https://lh3.googleusercontent.com/...",
  "provider": "google"
}
```

### Authenticated User Social Account Management

#### Link Social Account
```
POST /api/auth/social/{provider}/link
Authorization: Bearer {token}
```
**Providers:** `google`, `facebook`, `twitter`, `github`

Links a social provider to the currently authenticated user.

**Response:**
```json
{
  "status": "success",
  "message": "Successfully linked google account",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "user_type": "student", 
    "avatar": "https://lh3.googleusercontent.com/...",
    "provider": "google"
  }
}
```

#### Unlink Social Account
```
DELETE /api/auth/social/unlink
Authorization: Bearer {token}
```

Removes social provider link from the currently authenticated user.

**Response:**
```json
{
  "status": "success",
  "message": "Successfully unlinked google account",
  "user": {
    "id": 1,
    "name": "John Doe", 
    "email": "john@example.com",
    "user_type": "student",
    "provider": null
  }
}
```

## Frontend Integration

### 1. Redirect to Social Provider

```javascript
// Get authorization URL
const response = await fetch('/api/auth/social/google/redirect');
const data = await response.json();

if (data.status === 'success') {
  // Redirect user to provider
  window.location.href = data.redirect_url;
}
```

### 2. Handle Frontend Callback

After successful OAuth, users will be redirected to your frontend with query parameters:

```javascript
// On your frontend callback page (e.g., /auth/callback)
const urlParams = new URLSearchParams(window.location.search);
const status = urlParams.get('status');

if (status === 'success') {
  const token = urlParams.get('token');
  const userDataEncoded = urlParams.get('user');
  const provider = urlParams.get('provider');
  const message = urlParams.get('message');
  
  // Decode user data
  const userData = JSON.parse(atob(userDataEncoded));
  
  // Store authentication data
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  
  // Show success message
  console.log(message); // "Successfully logged in with google"
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
  
} else if (status === 'error') {
  const errorMessage = urlParams.get('message');
  const error = urlParams.get('error');
  
  // Handle error
  console.error('Authentication failed:', errorMessage, error);
  alert('Login failed: ' + errorMessage);
  
  // Redirect to login page
  window.location.href = '/login';
}
```

### 3. Link Account for Existing Users

```javascript
const response = await fetch('/api/auth/social/google/link', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (data.status === 'success') {
  console.log('Account linked successfully');
}
```

## Database Schema

The social authentication adds these fields to the `users` table:

- `provider` (string, nullable) - The social provider name (google, facebook, etc.)
- `provider_id` (string, nullable) - The user ID from the social provider
- `avatar` (string, nullable) - Profile picture URL from social provider
- `email_verified_at` (timestamp, nullable) - Made nullable for social logins

## Security Features

1. **Account Linking Prevention:** Cannot link a social account that's already linked to another user
2. **Email Matching:** If a user signs up with a social provider using an email that already exists, it links to the existing account
3. **Password Protection:** Users who signed up via social login cannot unlink their account unless they set a password first
4. **Token Generation:** Uses Laravel Sanctum for API token generation
5. **Stateless OAuth:** Uses stateless OAuth flow suitable for API-based applications

## Provider Setup Instructions

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your redirect URI: `http://localhost:8000/api/auth/social/google/callback`

### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure Valid OAuth Redirect URIs: `http://localhost:8000/api/auth/social/facebook/callback`

### Twitter OAuth Setup
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Enable OAuth 2.0 with PKCE
4. Add callback URL: `http://localhost:8000/api/auth/social/twitter/callback`

### GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:8000/api/auth/social/github/callback`