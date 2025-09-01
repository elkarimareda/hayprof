// Register.tsx
import { createFileRoute } from "@tanstack/react-router";
import api from "@/utils/request";
import { UserType } from "@/Models/Auth";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { useForm } from "react-hook-form";
import {
  userSchema,
  type UserRegistrationInputs,
} from "@/validators/onboarding/userSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const Route = createFileRoute("/_auth/register")({
  component: Register,
  validateSearch: (search: Record<string, unknown>): { type: UserType } => {
    return {
      type: (search?.type as UserType) ?? UserType.student,
    };
  },
});

function Register() {
  const { type } = Route.useSearch();
  const { t } = useTranslation();

  // Use the conditional type properly
  const form = useForm<UserRegistrationInputs<typeof type>>({
    resolver: zodResolver(userSchema(type)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      birth_date: "",
      phone_number: "",
      user_type: type,
      ...(type === UserType.teacher ? { biography: "" } : {}),
    },
    mode: "onChange",
  });

  const onSubmit = async (data: UserRegistrationInputs<typeof type>) => {
    try {
      const response = await api.post("/register", data);
      console.log("Registration successful:", response.data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("register_title", { context: type })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field
              control={form.control}
              label={t("name")}
              name="name"
              error={form.formState.errors.name}
            />
            <Field
              control={form.control}
              label={t("email")}
              type="email"
              name="email"
              error={form.formState.errors.email}
            />
            <Field
              control={form.control}
              label={t("password")}
              type="password"
              name="password"
              error={form.formState.errors.password}
            />
            <Field
              control={form.control}
              label="Confirm Password"
              type="password"
              name="password_confirmation"
              error={form.formState.errors.password_confirmation}
            />
            <Field
              control={form.control}
              label={t("birth_date")}
              type="date"
              name="birth_date"
              error={form.formState.errors.birth_date}
            />
            <Field
              control={form.control}
              label={t("phone")}
              type="tel"
              name="phone_number"
              error={form.formState.errors.phone_number}
            />

            {type === UserType.teacher && (
              <Field
                control={form.control}
                label={t("biography")}
                type="textarea"
                name="biography"
                error={form.formState.errors.biography}
              />
            )}

            <input type="hidden" value={type} {...form.register("user_type")} />

            <Button type="submit">{t("register")}</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full">
          <p className="mt-2">
            {t("have_account")}{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("login")}
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
