import {
  teacherAboutSchema,
  type TeacherAboutRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { Form } from "@/components/ui/form";
import countries from "@/data/countries.json";
import axios from "axios";
import { format, subYears } from "date-fns";
import { getLanguages } from "@/apis/reference";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Language } from "@/Models/Common";

interface Props {
  onNext: (data: TeacherAboutRegistrationInputs) => void;
}

function FormAbout({ onNext }: Props) {
  const { t } = useTranslation();
  const [languages, setLanguages] = useState<Language[]>([]);

  const form = useForm({
    resolver: zodResolver(teacherAboutSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      country: "",
      birth_date: format(subYears(new Date(), 18), "yyyy-MM-dd"),
      languages: [
        {
          language_id: 0,
          proficiency_level: "intermediate" as const,
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  // Load languages on component mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await getLanguages({ is_active: true });
        setLanguages(response.languages);
      } catch {
        toast.error(t("errors.failed_to_load_languages"));
      }
    };
    loadLanguages();
  }, [t]);

  // Transform languages for Field component
  const languageOptions = useMemo(
    () =>
      languages.map((language) => ({
        label: language.name,
        value: language.id.toString(),
      })),
    [languages]
  );

  // Proficiency level options - using same structure as course proficiency
  const proficiencyOptions = useMemo(
    () => [
      { label: t("language.proficiency.native"), value: "native" },
      { label: t("language.proficiency.beginner"), value: "beginner" },
      { label: t("language.proficiency.elementary"), value: "elementary" },
      { label: t("language.proficiency.intermediate"), value: "intermediate" },
      {
        label: t("language.proficiency.upper_intermediate"),
        value: "upper_intermediate",
      },
      { label: t("language.proficiency.advanced"), value: "advanced" },
      { label: t("language.proficiency.proficient"), value: "proficient" },
    ],
    [t]
  );

  // Detect user's country using ipapi.co
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await axios.get(
          "https://ipapi.co/json?access_key=f0225e9aa8d65a03d8edfcf5578ee502"
        );
        if (response.data.country_code) {
          form.setValue("country", response.data.country_code);
          localStorage.setItem("hayprof_country", response.data.country_code);
        }
      } catch {
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
    onNext(data);
  };

  const addLanguage = () => {
    append({
      language_id: 0,
      proficiency_level: "intermediate" as const,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
            name="birth_date"
            label={t("birth_date")}
            type="date"
            error={form.formState.errors.birth_date}
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
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {t("languages.spoken_languages")}
          </h3>
          <p className="text-sm text-gray-600">
            {t("languages.spoken_languages_description")}
          </p>

          {form.formState.errors.languages?.message && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.languages.message}
            </p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  control={form.control}
                  name={`languages.${index}.language_id`}
                  label={t("languages.language")}
                  type="combobox"
                  options={languageOptions}
                  error={form.formState.errors.languages?.[index]?.language_id}
                />

                <Field
                  control={form.control}
                  name={`languages.${index}.proficiency_level`}
                  label={t("languages.proficiency_level")}
                  type="select"
                  options={proficiencyOptions}
                  error={
                    form.formState.errors.languages?.[index]?.proficiency_level
                  }
                />
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  className="w-full"
                >
                  {t("languages.remove_language")}
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addLanguage}
            className="w-full"
          >
            {t("languages.add_language")}
          </Button>
        </div>

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
