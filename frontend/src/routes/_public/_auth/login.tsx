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

export const Route = createFileRoute("/_public/_auth/login")({
  component: Login,
});

function Login() {
  const { t } = useTranslation();
  const { auth } = Route.useRouteContext();
  const navigate = Route.useNavigate();

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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("login_account")}</CardTitle>
      </CardHeader>
      <CardContent>
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
