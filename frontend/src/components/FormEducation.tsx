import {
  teacherEducationSchema,
  type TeacherEducationRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Field from "@/components/ui/Field";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface Props {
  onNext: (data: TeacherEducationRegistrationInputs) => void;
  onPrevious: () => void;
}

function FormEducation({ onPrevious, onNext }: Props) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(teacherEducationSchema),
    defaultValues: {
      educations: [
        {
          university: "",
          degree: "",
          degree_type: "",
          specialization: "",
          year_of_study_start: "",
          year_of_study_end: "",
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "educations",
  });

  const onSubmit = async (data: TeacherEducationRegistrationInputs) => {
    console.log("Form submitted with data:", data);
    onNext(data);
  };

  const emptyEducation = {
    university: "",
    degree: "",
    degree_type: "",
    specialization: "",
    year_of_study_start: "",
    year_of_study_end: "",
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.educations?.message && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.educations.message}
          </p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 p-4 border rounded-lg">
            <Field
              control={form.control}
              name={`educations.${index}.university`}
              label={t("university")}
              error={form.formState.errors.educations?.[index]?.university}
            />
            <Field
              control={form.control}
              name={`educations.${index}.degree`}
              label={t("degree")}
              error={form.formState.errors.educations?.[index]?.degree}
            />
            <Field
              control={form.control}
              name={`educations.${index}.degree_type`}
              label={t("degree_type")}
              error={form.formState.errors.educations?.[index]?.degree_type}
            />
            <Field
              control={form.control}
              name={`educations.${index}.specialization`}
              label={t("specialization")}
              error={form.formState.errors.educations?.[index]?.specialization}
            />
            <Field
              control={form.control}
              name={`educations.${index}.year_of_study_start`}
              label={t("year_of_study_start")}
              error={
                form.formState.errors.educations?.[index]?.year_of_study_start
              }
            />
            <Field
              control={form.control}
              name={`educations.${index}.year_of_study_end`}
              label={t("year_of_study_end")}
              error={
                form.formState.errors.educations?.[index]?.year_of_study_end
              }
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                {`${t("remove")} ${t("onboarding.education")}`}
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append(emptyEducation)}
        >
          {`${t("add")} ${t("onboarding.education")}`}
        </Button>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onPrevious()}>
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

export default FormEducation;
