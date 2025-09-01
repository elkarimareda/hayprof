import { createFileRoute, redirect } from "@tanstack/react-router";
import { courseSchema, type CourseInputs } from "@/validators/courseSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Field from "@/components/ui/Field";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo, useState, useEffect } from "react";
import { getSubjects, type Subject } from "@/apis/reference";
import { createCourse } from "@/apis/courses";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/_app/course")({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.user_type !== "teacher") {
      throw redirect({
        to: "/", // Redirect to specific teacher onboarding
      });
    }
  },
  component: Course,
});

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Helper function to calculate total hours from schedule
const calculateTotalHours = (
  schedule: Array<{ start_time: string; end_time: string }>
) => {
  return schedule.reduce((total, slot) => {
    if (!slot.start_time || !slot.end_time) return total;
    const startTime = new Date(`2000-01-01T${slot.start_time}:00`);
    const endTime = new Date(`2000-01-01T${slot.end_time}:00`);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return total + (hours > 0 ? hours : 0);
  }, 0);
};

function Course() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      subject: null,
      proficiency_level: undefined,
      description: "",
      thumbnail: null,
      price_per_student: 0,
      number_of_hours: 1.5,
      min_students: 1,
      max_students: 10,
      schedule: [
        {
          day_of_week: "monday" as const,
          start_time: "09:00",
          end_time: "10:30",
        },
      ],
    },
    mode: "onChange",
  });

  // Load subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await getSubjects();
        setSubjects(response.subjects);
      } catch (error) {
        console.error("Failed to load subjects:", error);
      }
    };
    loadSubjects();
  }, []);

  // Transform subjects for Field component
  const subjectOptions = useMemo(
    () =>
      subjects.map((subject) => ({
        label: subject.name,
        value: subject.id.toString(),
      })),
    [subjects]
  );

  // Proficiency level options for language subjects
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  const onSubmit = async (data: CourseInputs) => {
    try {
      const response = await createCourse(data);
      toast.success(response.message);

      // Reset form after successful submission
      form.reset();
    } catch (error: unknown) {
      console.error("Error creating course:", error);

      const apiError = error as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };

      if (apiError.response?.data?.errors) {
        // Handle validation errors
        const errors = apiError.response.data.errors;
        Object.keys(errors).forEach((key) => {
          form.setError(key as keyof CourseInputs, { message: errors[key][0] });
        });
      } else {
        toast.error(
          apiError.response?.data?.message || "Error creating course"
        );
      }
    }
  };

  // Watch form values for real-time calculation
  const schedule = form.watch("schedule");
  const numberHours = form.watch("number_of_hours");
  const selectedSubjectId = form.watch("subject");

  // Check if selected subject is a language subject
  const isLanguageSubject = useMemo(() => {
    if (!selectedSubjectId || !subjects.length) return false;
    const selectedSubject = subjects.find(
      (s) => s.id === Number(selectedSubjectId)
    );
    return selectedSubject?.name.toLowerCase().includes("language") || false;
  }, [selectedSubjectId, subjects]);

  // Reset proficiency level when switching from language to non-language subject
  useEffect(() => {
    if (!isLanguageSubject) {
      form.setValue("proficiency_level", undefined);
    }
  }, [isLanguageSubject, form]);

  // Calculate total hours from current schedule
  const totalScheduleHours = useMemo(() => {
    return calculateTotalHours(schedule);
  }, [schedule]);

  const hoursMatch = totalScheduleHours >= Number(numberHours || 0);

  const addScheduleSlot = () => {
    append({
      day_of_week: "monday" as const,
      start_time: "",
      end_time: "",
    });
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Course Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t("course.basic_info")}
              </h3>

              <Field
                control={form.control}
                name="title"
                label={t("course.title")}
                error={form.formState.errors.title}
              />

              <Field
                control={form.control}
                name="subject"
                label={t("course.subject")}
                type="combobox"
                options={subjectOptions}
                error={form.formState.errors.subject}
              />

              {isLanguageSubject && (
                <Field
                  control={form.control}
                  name="proficiency_level"
                  label={t("course.proficiency_level")}
                  type="select"
                  options={proficiencyOptions}
                  error={form.formState.errors.proficiency_level}
                />
              )}

              <Field
                control={form.control}
                name="thumbnail"
                label={t("course.thumbnail")}
                type="file"
                accept="image/*"
                error={form.formState.errors.thumbnail}
              />

              <Field
                control={form.control}
                name="description"
                label={t("course.description")}
                type="textarea"
                error={form.formState.errors.description}
              />
            </div>

            {/* Pricing and Capacity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t("course.pricing_capacity")}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  control={form.control}
                  name="price_per_student"
                  type="number"
                  label={t("course.price_per_student")}
                  error={form.formState.errors.price_per_student}
                />

                <div className="space-y-2">
                  <Field
                    control={form.control}
                    name="number_of_hours"
                    type="number"
                    label={t("course.number_of_hours")}
                    error={form.formState.errors.number_of_hours}
                  />
                  <div className="text-sm text-muted-foreground">
                    {t("course.schedule_hours_info", {
                      scheduled: totalScheduleHours.toFixed(1),
                      required: Number(numberHours || 0).toFixed(1),
                      match: hoursMatch ? "✓" : "✗",
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  control={form.control}
                  name="min_students"
                  type="number"
                  label={t("course.min_students")}
                  error={form.formState.errors.min_students}
                />

                <Field
                  control={form.control}
                  name="max_students"
                  type="number"
                  label={t("course.max_students")}
                  error={form.formState.errors.max_students}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("course.schedule")}</h3>

              {form.formState.errors.schedule?.message && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.schedule.message}
                </p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("course.day_of_week")}
                      </label>
                      <Select
                        value={form.watch(`schedule.${index}.day_of_week`)}
                        onValueChange={(value) =>
                          form.setValue(
                            `schedule.${index}.day_of_week`,
                            value as (typeof DAYS_OF_WEEK)[number]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day} value={day}>
                              {t(`days.${day}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.schedule?.[index]?.day_of_week && (
                        <p className="text-red-500 text-sm">
                          {
                            form.formState.errors.schedule[index]?.day_of_week
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    <Field
                      control={form.control}
                      name={`schedule.${index}.start_time`}
                      type="time"
                      label={t("course.start_time")}
                      error={
                        form.formState.errors.schedule?.[index]?.start_time
                      }
                    />

                    <Field
                      control={form.control}
                      name={`schedule.${index}.end_time`}
                      type="time"
                      label={t("course.end_time")}
                      error={form.formState.errors.schedule?.[index]?.end_time}
                    />
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="w-full"
                    >
                      {t("course.remove_schedule")}
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addScheduleSlot}
                className="w-full"
              >
                {t("course.add_schedule")}
              </Button>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="submit" disabled={!form.formState.isValid}>
                {t("save")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
