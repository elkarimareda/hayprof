import {
  linkProvider,
  unlinkProvider,
  type SocialAccount,
  type SocialProvider,
} from "@/apis/social";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Link, Shield } from "lucide-react";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import type { User } from "@/Models/Auth";

function SocialAccounts({
  errors,
  user,
}: {
  errors?: Record<SocialProvider, string> | undefined;
  user: User | null;
}) {
  const { t } = useTranslation();

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(
    user?.social_accounts || []
  );
  const [loadingSocial, setLoadingSocial] = useState<Record<string, boolean>>(
    {}
  );
  const supportedProviders: { name: SocialProvider; label: string }[] = [
    { name: "google", label: "Google" },
    { name: "facebook", label: "Facebook" },
  ];

  // Helper function to get provider icon
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return <FaGoogle className="w-5 h-5 text-red-500" />;
      case "facebook":
        return <FaFacebook className="w-5 h-5 text-blue-600" />;
      default:
        return <Link className="w-5 h-5 text-gray-500" />;
    }
  };

  // Check if a provider is linked
  const isProviderLinked = (provider: string) => {
    return socialAccounts.some((account) => account.provider === provider);
  };

  // Handle linking a social account
  const handleLinkAccount = async (provider: SocialProvider) => {
    try {
      setLoadingSocial((prev) => ({ ...prev, [provider]: true }));
      const response = await linkProvider(provider);
      setSocialAccounts(response.user.social_accounts || []);
    } catch (error) {
      console.error(`Failed to link ${provider} account:`, error);
    } finally {
      setLoadingSocial((prev) => ({ ...prev, [provider]: false }));
    }
  };

  // Handle unlinking a social account
  const handleUnlinkAccount = async (provider: SocialProvider) => {
    try {
      setLoadingSocial((prev) => ({ ...prev, [provider]: true }));
      const response = await unlinkProvider(provider);
      setSocialAccounts(response.user.social_accounts || []);
    } catch (error) {
      console.error(`Failed to unlink ${provider} account:`, error);
    } finally {
      setLoadingSocial((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t("user_profile.linked_accounts", "Linked Accounts")}
        </h2>
        <p className="text-gray-600">
          {t(
            "user_profile_social.linked_accounts_desc",
            "Connect your social accounts for easier sign-in and enhanced security."
          )}
        </p>
      </div>

      <div className="grid gap-4">
        {supportedProviders.map((provider) => {
          const isLinked = isProviderLinked(provider.name);
          const linkedAccount = socialAccounts.find(
            (account) => account.provider === provider.name
          );
          const error = errors && errors[provider.name];

          return (
            <Card
              key={provider.name}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getProviderIcon(provider.name)}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {provider.label}
                      </h3>
                      {isLinked && linkedAccount ? (
                        <p className="text-sm text-gray-600">
                          {t("user_profile_social.connected", "Connected")} as{" "}
                          {linkedAccount.provider_email}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {t(
                            "user_profile_social.not_connected",
                            "Not connected"
                          )}
                        </p>
                      )}
                      {error && <div className="text-red-500">{error}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLinked ? (
                      <>
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          {t("user_profile_social.connected", "Connected")}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlinkAccount(provider.name)}
                          disabled={loadingSocial[provider.name]}
                        >
                          {loadingSocial[provider.name]
                            ? t("user_profile_social.unlinking", "Unlinking...")
                            : t("user_profile_social.unlink", "Unlink")}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkAccount(provider.name)}
                        disabled={loadingSocial[provider.name]}
                      >
                        {loadingSocial[provider.name]
                          ? t("user_profile_social.linking", "Linking...")
                          : t(
                              "user_profile_social.link_account",
                              "Link Account"
                            )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {socialAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • You have {socialAccounts.length} account
                {socialAccounts.length !== 1 ? "s" : ""} linked
              </p>
              <p>• Linked accounts can be used for faster sign-in</p>
              <p>• You can unlink accounts at any time</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SocialAccounts;
