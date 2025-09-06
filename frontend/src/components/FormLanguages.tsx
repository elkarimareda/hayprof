import {
  teacherLanguagesSchema,
  type TeacherLanguagesRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Field from "@/components/ui/Field";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { getLanguages, type Language } from "@/apis/reference";
import { toast } from "sonner";

interface Props {
  onNext: (data: TeacherLanguagesRegistrationInputs) => void;
  onPrevious: () => void;
}

function FormLanguages({ onPrevious, onNext }: Props) {
  const { t } = useTranslation();
  const [languages, setLanguages] = useState<Language[]>([]);

  const form = useForm({
    resolver: zodResolver(teacherLanguagesSchema),
    defaultValues: {
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
      } catch (error) {
        console.error("Failed to load languages:", error);
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
      { label: t("course.proficiency.beginner"), value: "beginner" },
      { label: t("course.proficiency.elementary"), value: "elementary" },
      { label: t("course.proficiency.intermediate"), value: "intermediate" },
      {
        label: t("course.proficiency.upper_intermediate"),
        value: "upper_intermediate",
      },
      { label: t("course.proficiency.advanced"), value: "advanced" },
      { label: t("course.proficiency.proficient"), value: "proficient" },
    ],
    [t]
  );

  const onSubmit = async (data: TeacherLanguagesRegistrationInputs) => {
    console.log("Languages form submitted with data:", data);
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
          <Button variant="outline" onClick={onPrevious}>
            {t("previous")}
          </Button>
          <Button type="submit" disabled={!form.formState.isValid}>
            {t("next")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default FormLanguages;
