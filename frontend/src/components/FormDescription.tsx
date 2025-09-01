import {
  teacherDescriptionSchema,
  type TeacherDescriptionRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { Form } from "@/components/ui/form";
import { useTranslation } from "react-i18next";

interface Props {
  onNext: (data: { description: TeacherDescriptionRegistrationInputs }) => void;
  onPrevious: () => void;
}

function FormDescription({ onPrevious, onNext }: Props) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(teacherDescriptionSchema),
    defaultValues: {
      yourself: "",
      experience: "",
      motivation: "",
      headline: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: TeacherDescriptionRegistrationInputs) => {
    console.log("Form submitted with data:", data);
    onNext({ description: data });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field
          control={form.control}
          name="yourself"
          type="textarea"
          label={t("descriptions.yourself")}
          error={form.formState.errors.yourself}
        />
        <Field
          control={form.control}
          name="experience"
          type="textarea"
          label={t("descriptions.experience")}
          error={form.formState.errors.experience}
        />
        <Field
          control={form.control}
          name="motivation"
          type="textarea"
          label={t("descriptions.motivation")}
          error={form.formState.errors.motivation}
        />
        <Field
          control={form.control}
          name="headline"
          type="textarea"
          label={t("descriptions.headline")}
          error={form.formState.errors.headline}
        />
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

export default FormDescription;
