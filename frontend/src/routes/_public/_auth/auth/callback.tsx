import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

// User data interface for decoded user information
interface UserData {
  id: number;
  name: string;
  email: string;
  user_type: string;
  avatar?: string;
  provider: string;
}

const searchSchema = z.object({
  provider: z.enum(["google", "facebook", "twitter", "github"]).optional(),
  status: z.enum(["success", "error"]),
  token: z.string().optional(),
  user: z.string().optional(), // base64 encoded JSON string
});

export const Route = createFileRoute("/_public/_auth/auth/callback")({
  component: AuthCallback,
  validateSearch: searchSchema,
});

function AuthCallback() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract provider from URL search params or state
        const provider = search.provider;
        const callbackStatus = search.status;
        const encodedUser = search.user;

        if (!provider || !["google", "facebook"].includes(provider)) {
          setErrorMessage("Unable to determine authentication provider");
          return;
        }

        if (callbackStatus === "success" && search.token && encodedUser) {
          // Decode the base64 encoded user data
          try {
            const decodedUserJson = atob(encodedUser);
            const userData: UserData = JSON.parse(decodedUserJson);

            // Store authentication data
            localStorage.setItem("auth-token", search.token);
            localStorage.setItem("user", JSON.stringify(userData));

            console.log("Decoded user data:", userData);

            // Redirect to dashboard after a brief delay
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (decodeError) {
            console.error("Failed to decode user data:", decodeError);
            setErrorMessage("Failed to process user information");
            return;
          }
        } else {
          setErrorMessage("Authentication failed");
        }
      } catch (error) {
        console.error("Callback handling error:", error);
        setErrorMessage("An unexpected error occurred");
      }
    };

    handleCallback();
  }, [navigate, search]);

  const handleRetry = () => {
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {search.status === "success" && "Sign in successful!"}
            {search.status === "error" && "Sign in failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {search.status === "success" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">
                  You have been successfully signed in. Redirecting to
                  homepage...
                </p>
              </div>
            )}

            {search.status === "error" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-red-600 text-sm">{errorMessage}</p>
                <button
                  onClick={handleRetry}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
