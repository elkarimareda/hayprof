import { createFileRoute, redirect } from "@tanstack/react-router";
import { courseSchema, type CourseInputs } from "@/validators/courseSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Field from "@/components/ui/Field";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
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

function Course() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const lastProcessedSessionCount = useRef<number>(1);

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      subject: null,
      proficiency_level: undefined,
      description: "",
      thumbnail: null,
      price_per_student: 0,
      count_session: 1,
      duration_session: 1.5,
      min_students: 1,
      max_students: 10,
      course_date: new Date().toISOString().split("T")[0],
      schedule: [
        {
          date: "",
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
  const countSessions = form.watch("count_session");
  const selectedSubjectId = form.watch("subject");

  // Check if selected subject is a language subject
  const isLanguageSubject = useMemo(() => {
    if (!selectedSubjectId || !subjects.length) return false;
    const selectedSubject = subjects.find(
      (s) => s.id === Number(selectedSubjectId)
    );
    return selectedSubject?.name.toLowerCase().includes("language") || false;
  }, [selectedSubjectId, subjects]);

  // Helper function to sync schedule with session count
  const syncScheduleWithSessionCount = useCallback(() => {
    const currentSessionCount = Number(countSessions || 1);
    const courseDate = form.getValues("course_date");

    // Use course date or today as base date
    const baseDate = courseDate || new Date().toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    // Ensure we use today or later as the minimum date
    const startDate = baseDate >= today ? baseDate : today;

    // Clear existing schedule
    const fieldsToRemove = fields.length;
    for (let i = 0; i < fieldsToRemove; i++) {
      remove(0);
    }

    // Add new schedule slots based on current session count
    for (let i = 0; i < currentSessionCount; i++) {
      // Calculate date for each session (spread over days)
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + i * 7); // Weekly intervals

      // Set default time to 9:00 AM
      const defaultDateTime =
        sessionDate.toISOString().split("T")[0] + "T09:00";

      append({
        date: defaultDateTime,
      });
    }
  }, [countSessions, form, append, remove, fields.length]);

  // Reset proficiency level when switching from language to non-language subject
  useEffect(() => {
    if (!isLanguageSubject) {
      form.setValue("proficiency_level", undefined);
    }
  }, [isLanguageSubject, form]);

  // Automatically update schedule when count_session changes (safe implementation)
  useEffect(() => {
    const currentSessionCount = Number(countSessions || 1);
    const MIN_SESSIONS = 1;
    const MAX_SESSIONS = 20;

    // Determine the valid session count
    let validSessionCount = currentSessionCount;
    if (currentSessionCount < MIN_SESSIONS) {
      validSessionCount = MIN_SESSIONS;
    } else if (currentSessionCount > MAX_SESSIONS) {
      validSessionCount = MAX_SESSIONS;
    }

    // Only update if the session count actually changed and is different from what we last processed
    if (validSessionCount !== lastProcessedSessionCount.current) {
      // Update the ref to prevent re-triggering
      lastProcessedSessionCount.current = validSessionCount;

      // If the valid count is different from current, update the form field
      if (validSessionCount !== currentSessionCount) {
        form.setValue("count_session", validSessionCount);
      }

      // Trigger the schedule update with the valid count
      syncScheduleWithSessionCount();
    }
  }, [countSessions, syncScheduleWithSessionCount, form]);

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

              <Field
                control={form.control}
                name="course_date"
                label={t("course.course_date")}
                type="date"
                error={form.formState.errors.course_date}
                min={new Date().toISOString().split("T")[0]}
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

                <Field
                  control={form.control}
                  name="count_session"
                  type="number"
                  min="1"
                  max="20"
                  label={t("course.count_session")}
                  error={form.formState.errors.count_session}
                />
              </div>

              <div className="space-y-2">
                <Field
                  control={form.control}
                  name="duration_session"
                  type="number"
                  label={t("course.duration_session_hours")}
                  error={form.formState.errors.duration_session}
                />
                <div className="text-xs text-muted-foreground">
                  {t("course.duration_session_help")}
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

              <div className="text-sm text-muted-foreground mb-4">
                {t("course.schedule_auto_generated_datetime", {
                  count: Number(countSessions || 0),
                })}
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-medium">
                      {t("course.session_number", { number: index + 1 })}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Field
                      control={form.control}
                      name={`schedule.${index}.date`}
                      type="datetime"
                      label={t("course.date_time")}
                      error={form.formState.errors.schedule?.[index]?.date}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              ))}
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
