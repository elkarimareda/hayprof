import {
  teacherCertificationSchema,
  type TeacherCertificationRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Field from "@/components/ui/Field";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface Props {
  onNext: (data: TeacherCertificationRegistrationInputs) => void;
  onPrevious: () => void;
}

function FormCertification({ onPrevious, onNext }: Props) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(teacherCertificationSchema),
    defaultValues: {
      certifications: [
        {
          subject: "",
          certificate: "",
          description: "",
          issue_by: "",
          year_of_study_start: "",
          year_of_study_end: "",
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const onSubmit = async (data: TeacherCertificationRegistrationInputs) => {
    console.log("Form submitted with data:", data);
    onNext(data);
  };

  const emptyCertification = {
    subject: "",
    certificate: "",
    description: "",
    issue_by: "",
    year_of_study_start: "",
    year_of_study_end: "",
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.certifications?.message && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.certifications.message}
          </p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 p-4 border rounded-lg">
            <Field
              control={form.control}
              name={`certifications.${index}.subject`}
              label={t("subject")}
              error={form.formState.errors.certifications?.[index]?.subject}
            />
            <Field
              control={form.control}
              name={`certifications.${index}.certificate`}
              label={t("certificate")}
              error={form.formState.errors.certifications?.[index]?.certificate}
            />
            <Field
              control={form.control}
              name={`certifications.${index}.description`}
              label={t("description")}
              type="textarea"
              error={form.formState.errors.certifications?.[index]?.description}
            />
            <Field
              control={form.control}
              name={`certifications.${index}.issue_by`}
              label={t("issue_by")}
              error={form.formState.errors.certifications?.[index]?.issue_by}
            />
            <Field
              control={form.control}
              name={`certifications.${index}.year_of_study_start`}
              label={t("year_of_study_start")}
              error={
                form.formState.errors.certifications?.[index]
                  ?.year_of_study_start
              }
            />
            <Field
              control={form.control}
              name={`certifications.${index}.year_of_study_end`}
              label={t("year_of_study_end")}
              error={
                form.formState.errors.certifications?.[index]?.year_of_study_end
              }
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                {`${t("remove")} ${t("onboarding.certification")}`}
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append(emptyCertification)}
        >
          {`${t("add")} ${t("onboarding.certification")}`}
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

export default FormCertification;
