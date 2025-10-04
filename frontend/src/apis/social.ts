import api from "@/lib/request";
import type { UserType } from "@/Models/Auth";

export interface SocialAuthRedirectResponse {
  status: "success";
  redirect_url: string;
}

export interface SocialAuthCallbackResponse {
  status: "success";
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    user_type: UserType;
    avatar?: string;
    provider: string;
  };
  token: string;
}

export interface SocialAuthError {
  status: "error";
  message: string;
}

export interface SocialAccount {
  provider: string;
  provider_email: string;
  provider_id: string;
  linked_at: string;
}

export interface UserWithSocialAccounts {
  id: number;
  name: string;
  email: string;
  user_type: UserType;
  social_accounts: SocialAccount[];
}

export type SocialProvider = "google" | "facebook";

/**
 * Get the OAuth authorization URL for a social provider
 */
export const getSocialAuthRedirect = async (
  provider: SocialProvider
): Promise<SocialAuthRedirectResponse> => {
  const response = await api.get(`/auth/social/${provider}/redirect`);
  return response.data;
};

/**
 * Handle the OAuth callback from a social provider
 */
export const handleSocialAuthCallback = async (
  provider: SocialProvider,
  searchParams: string
): Promise<SocialAuthCallbackResponse> => {
  const response = await api.get(
    `/auth/social/${provider}/callback?${searchParams}`
  );
  return response.data;
};

/**
 * Link a social account to the currently authenticated user
 */
export const linkSocialAccount = async (
  provider: SocialProvider
): Promise<SocialAuthCallbackResponse> => {
  const response = await api.post(`/auth/social/${provider}/link`);
  return response.data;
};

/**
 * Unlink the current user's social account
 */
export const unlinkSocialAccount = async (): Promise<{
  status: "success";
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    user_type: UserType;
    provider: null;
  };
}> => {
  const response = await api.delete("/auth/social/unlink");
  return response.data;
};

/**
 * Initiate social authentication flow
 * This will redirect the user to the social provider's authorization page
 */
export const initiateSocialAuth = async (
  provider: SocialProvider
): Promise<void> => {
  try {
    const response = await getSocialAuthRedirect(provider);
    if (response.status === "success") {
      // Redirect user to the provider's authorization page
      window.location.href = response.redirect_url;
    }
  } catch (error) {
    console.error(`Failed to initiate ${provider} authentication:`, error);
    throw error;
  }
};

/**
 * Complete social authentication after OAuth callback
 * This should be called on the callback page to exchange the code for a token
 */
export const completeSocialAuth = async (
  provider: SocialProvider
): Promise<SocialAuthCallbackResponse> => {
  try {
    const searchParams = window.location.search.substring(1); // Remove the '?' prefix
    const response = await handleSocialAuthCallback(provider, searchParams);

    if (response.status === "success") {
      // Store the authentication token and user info
      localStorage.setItem("auth-token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    console.error(`Failed to complete ${provider} authentication:`, error);
    throw error;
  }
};

/**
 * Link a specific social provider to the current user's account
 */
export const linkProvider = async (
  provider: SocialProvider
): Promise<{
  status: "success";
  message: string;
  user: UserWithSocialAccounts;
}> => {
  const response = await api.post(`/auth/social/${provider}/link`);
  if (response.data.status === "redirect_required") {
    window.location.href = response.data.redirect_url;
  }
  return response.data;
};

/**
 * Unlink a specific social provider from the current user's account
 */
export const unlinkProvider = async (
  provider: SocialProvider
): Promise<{
  status: "success";
  message: string;
  user: UserWithSocialAccounts;
}> => {
  const response = await api.delete(`/auth/social/${provider}/unlink`);
  return response.data;
};
