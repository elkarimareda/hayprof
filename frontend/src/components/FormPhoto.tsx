import {
  teacherPhotoSchema,
  type TeacherPhotoRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { Form } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";

interface Props {
  onNext: (data: TeacherPhotoRegistrationInputs) => void;
  onPrevious: () => void;
  isLoading: boolean;
}

function FormPhoto({ onPrevious, onNext, isLoading }: Props) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(teacherPhotoSchema),
    defaultValues: {
      photo: undefined,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: TeacherPhotoRegistrationInputs) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field
          control={form.control}
          name="photo"
          type="file"
          accept="image/*"
          label={t("photo")}
          error={form.formState.errors.photo}
        />
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => onPrevious()}
            disabled={isLoading}
          >
            {t("previous")}
          </Button>
          <Button type="submit" disabled={!form.formState.isValid || isLoading}>
            {isLoading && <LoaderCircle className="mr-2 animate-spin" />}
            {t("next")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default FormPhoto;
