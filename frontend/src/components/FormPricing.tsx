import {
  teacherPricingSchema,
  type TeacherPricingRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { Form } from "@/components/ui/form";
import { useTranslation } from "react-i18next";

interface Props {
  onNext: (data: TeacherPricingRegistrationInputs) => void;
  onPrevious: () => void;
}

function FormPricing({ onPrevious, onNext }: Props) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(teacherPricingSchema),
    defaultValues: {
      pricing: 0,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: TeacherPricingRegistrationInputs) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field
          control={form.control}
          name="pricing"
          type="number"
          label={t("pricing")}
          error={form.formState.errors.pricing}
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

export default FormPricing;
