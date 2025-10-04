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
import { yearOptions } from "@/lib/utils";

interface Props {
  onNext: (data: TeacherCertificationRegistrationInputs) => void;
  onPrevious: () => void;
}

function FormCertification({ onPrevious, onNext }: Props) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(teacherCertificationSchema),
    defaultValues: {
      certifications: [],
    },
    mode: "onBlur", // Changed to onBlur for better validation trigger
    reValidateMode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const onSubmit = async (data: TeacherCertificationRegistrationInputs) => {
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
        <div className="mb-4">
          <h3 className="text-lg font-medium">{t("certifications")}</h3>
          <p className="text-sm text-gray-600">
            {t("certifications_optional_description")}
          </p>
        </div>

        {form.formState.errors.certifications?.message && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.certifications.message}
          </p>
        )}

        {fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">{t("no_certifications_added")}</p>
            <Button type="button" onClick={() => append(emptyCertification)}>
              {`${t("add")} ${t("onboarding.certification")}`}
            </Button>
          </div>
        ) : (
          <>
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
                  error={
                    form.formState.errors.certifications?.[index]?.certificate
                  }
                />
                <Field
                  control={form.control}
                  name={`certifications.${index}.description`}
                  label={t("description")}
                  type="textarea"
                  error={
                    form.formState.errors.certifications?.[index]?.description
                  }
                />
                <Field
                  control={form.control}
                  name={`certifications.${index}.issue_by`}
                  label={t("issue_by")}
                  error={
                    form.formState.errors.certifications?.[index]?.issue_by
                  }
                />
                <Field
                  control={form.control}
                  name={`certifications.${index}.year_of_study_start`}
                  label={t("year_of_study_start")}
                  type="select"
                  options={yearOptions}
                  error={
                    form.formState.errors.certifications?.[index]
                      ?.year_of_study_start
                  }
                />
                <Field
                  control={form.control}
                  name={`certifications.${index}.year_of_study_end`}
                  label={t("year_of_study_end")}
                  type="select"
                  options={yearOptions}
                  error={
                    form.formState.errors.certifications?.[index]
                      ?.year_of_study_end
                  }
                />
                {fields.length > 0 && (
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
          </>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onPrevious()}>
            {t("previous")}
          </Button>
          <Button type="submit">{t("next")}</Button>
        </div>
      </form>
    </Form>
  );
}

export default FormCertification;
