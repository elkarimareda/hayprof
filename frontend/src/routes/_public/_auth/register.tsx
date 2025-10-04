// Register.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import api from "@/lib/request";
import { UserType } from "@/Models/Auth";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { useForm, type FieldErrors } from "react-hook-form";
import {
  userSchema,
  type TeacherRegistrationInputs,
  type UserRegistrationInputs,
} from "@/validators/onboarding/userSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useEffect } from "react";
import { format, subYears } from "date-fns";

export const Route = createFileRoute("/_public/_auth/register")({
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
  const navigate = Route.useNavigate();

  // Use the conditional type properly
  const form = useForm<UserRegistrationInputs<typeof type>>({
    resolver: zodResolver(userSchema(type)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      birth_date: format(subYears(new Date(), 18), "yyyy-MM-dd"),
      phone_number: "",
      user_type: type,
      ...(type === UserType.teacher ? { biography: "" } : {}),
    },
    mode: "onChange",
  });

  const handleTypeChange = (value: string) => {
    const newType = value as UserType;
    navigate({
      to: "/register",
      search: { type: newType },
      replace: true,
    });
  };

  const onSubmit = async (data: UserRegistrationInputs<typeof type>) => {
    try {
      await api.post("/register", data);
      navigate({ to: "/login" });
      toast.success(t("registration_success"));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    form.setValue("user_type", type);
  }, [type, form]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("register_title", { context: type })}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* User Type Tabs */}
        <Tabs value={type} onValueChange={handleTypeChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={UserType.student}>{t("student")}</TabsTrigger>
            <TabsTrigger value={UserType.teacher}>{t("teacher")}</TabsTrigger>
          </TabsList>
        </Tabs>

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
              label={t("confirm_password")}
              type="password"
              name="password_confirmation"
              error={form.formState.errors.password_confirmation}
            />
            <Field
              control={form.control}
              label={t("birth_date")}
              type="date"
              name="birth_date"
              max={format(subYears(new Date(), 18), "yyyy-MM-dd")}
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
                error={
                  (
                    form.formState
                      .errors as FieldErrors<TeacherRegistrationInputs>
                  ).biography
                }
              />
            )}
            <Button type="submit">{t("register")}</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full">
          <p className="mt-2">
            {t("have_account")} <Link to="/login">{t("login")}</Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
