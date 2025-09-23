import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInputs } from "@/validators/loginSchema";
import Field from "@/components/ui/Field";
import { Form } from "@/components/ui/form";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { initiateSocialAuth } from "@/apis/social";
import { useState } from "react";

export const Route = createFileRoute("/_public/_auth/login")({
  component: Login,
});

function Login() {
  const { t } = useTranslation();
  const { auth } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const [socialLoading, setSocialLoading] = useState<{
    facebook: boolean;
    google: boolean;
  }>({ facebook: false, google: false });

  const form = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginInputs) => {
    try {
      await auth.login(data.identifier, data.password);
      navigate({ to: "/" });
    } catch {
      form.setError("password", {
        type: "manual",
        message: "Identifiants incorrects",
      });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setSocialLoading((prev) => ({ ...prev, facebook: true }));
      await initiateSocialAuth("facebook");
    } catch (error) {
      console.error("Facebook login error:", error);
      // Show user-friendly error message
      form.setError("root", {
        type: "manual",
        message: "Failed to connect with Facebook. Please try again.",
      });
    } finally {
      setSocialLoading((prev) => ({ ...prev, facebook: false }));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setSocialLoading((prev) => ({ ...prev, google: true }));
      await initiateSocialAuth("google");
    } catch (error) {
      console.error("Google login error:", error);
      // Show user-friendly error message
      form.setError("root", {
        type: "manual",
        message: "Failed to connect with Google. Please try again.",
      });
    } finally {
      setSocialLoading((prev) => ({ ...prev, google: false }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("login_account")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display form-level errors */}
        {form.formState.errors.root && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 hover:bg-blue-50 border-blue-200"
            onClick={handleFacebookLogin}
            disabled={socialLoading.facebook || socialLoading.google}
          >
            {socialLoading.facebook ? (
              <LoaderCircle className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <FaFacebook className="w-5 h-5 text-blue-600" />
            )}
            {t("login_with_facebook")}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 hover:bg-red-50 border-red-200"
            onClick={handleGoogleLogin}
            disabled={socialLoading.facebook || socialLoading.google}
          >
            {socialLoading.google ? (
              <LoaderCircle className="w-5 h-5 animate-spin text-red-600" />
            ) : (
              <FaGoogle className="w-5 h-5 text-red-600" />
            )}
            {t("login_with_google")}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              {t("or_continue_with")}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email/Phone Field */}
            <Field
              control={form.control}
              name="identifier"
              label={`${t("email")} / ${t("phone")}`}
              error={form.formState.errors.identifier}
            />

            {/* Password Field */}
            <Field
              control={form.control}
              label={t("password")}
              type="password"
              name="password"
              error={form.formState.errors.password}
            />

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <Controller
                name="remember"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 block text-sm cursor-pointer"
                    >
                      {t("remember_me")}
                    </label>
                  </div>
                )}
              />
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
                className="w-full"
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center">
                    <LoaderCircle className="animate-spin mr-2" />
                    {t("loading")}
                  </span>
                ) : (
                  t("login")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full">
          <a
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t("forget_password")}
          </a>
          <p className="mt-2">
            {t("no_account")}{" "}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("register")}
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
