import {
  teacherAboutSchema,
  type TeacherAboutRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { t } from "i18next";
import { Form } from "@/components/ui/form";
import countries from "@/data/countries.json";
import axios from "axios";
import { format, subYears } from "date-fns";

interface Props {
  onNext: (data: TeacherAboutRegistrationInputs) => void;
}

function FormAbout({ onNext }: Props) {
  const form = useForm({
    resolver: zodResolver(teacherAboutSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      country: "",
      birth_date: format(subYears(new Date(), 18), "yyyy-MM-dd"),
      phone_number: "",
    },
    mode: "onChange",
  });

  // Detect user's country using ipapi.co
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await axios.get(
          "https://ipapi.co/json?access_key=f0225e9aa8d65a03d8edfcf5578ee502"
        );
        if (response.data.country_code) {
          console.log("Detected country:", response.data.country_code);
          form.setValue("country", response.data.country_code);
          localStorage.setItem("hayprof_country", response.data.country_code);
        }
      } catch (error) {
        console.log("Failed to detect country:", error);
        // Fallback to browser language detection
        if (typeof window !== "undefined" && window.navigator.language) {
          const lang = window.navigator.language;
          const code = lang.split("-")[1];
          if (code) {
            form.setValue("country", code.toUpperCase());
          }
        }
      }
    };

    const savedCountry = localStorage.getItem("hayprof_country");
    if (savedCountry) {
      form.setValue("country", savedCountry);
    } else {
      detectCountry();
    }
  }, [form]);

  const onSubmit = async (data: TeacherAboutRegistrationInputs) => {
    console.log("Form submitted with data:", data);
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field
          control={form.control}
          name="firstname"
          label={t("first_name")}
          error={form.formState.errors.firstname}
        />
        <Field
          control={form.control}
          name="lastname"
          label={t("last_name")}
          error={form.formState.errors.lastname}
        />
        <Field
          control={form.control}
          name="email"
          label={t("email")}
          type="email"
          error={form.formState.errors.email}
        />
        <Field
          control={form.control}
          name="birth_date"
          label={t("birth_date")}
          type="date"
          error={form.formState.errors.birth_date}
        />
        <Field
          control={form.control}
          name="phone_number"
          label={t("phone")}
          type="tel"
          error={form.formState.errors.phone_number}
        />
        <Field
          control={form.control}
          name="country"
          type="combobox"
          options={countries.map((country) => ({
            value: country.alpha2,
            label: country.name,
          }))}
          label={t("country")}
          error={form.formState.errors.country}
        />
        <div className="flex justify-end gap-4 mt-6">
          <Button type="submit" disabled={!form.formState.isValid}>
            {t("next")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default FormAbout;
