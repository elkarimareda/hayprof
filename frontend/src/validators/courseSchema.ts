import { z } from "zod";

// Helper function to calculate total sessions from schedule
const calculateTotalSessions = (schedule: Array<{ date: string }>) => {
  return schedule.filter((slot) => slot.date).length;
};

export const courseSchema = z
  .object({
    title: z
      .string()
      .min(1, "Course title is required")
      .max(100, "Title cannot exceed 100 characters"),
    subject: z.coerce.number().min(1, "Subject is required"),
    proficiency_level: z
      .enum([
        "beginner",
        "elementary",
        "intermediate",
        "upper_intermediate",
        "advanced",
        "proficient",
      ])
      .optional(),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description cannot exceed 500 characters"),
    thumbnail: z
      .any()
      .transform((files) => files?.[0] || files) // Handle both File and FileList
      .refine((file) => file instanceof File, "Course thumbnail is required")
      .refine(
        (file) => file?.size <= 5000000,
        "Thumbnail must be less than 5MB"
      )
      .refine(
        (file) => ["image/jpeg", "image/jpg", "image/png"].includes(file?.type),
        "Only JPEG, JPG and PNG formats are supported"
      ),
    price_per_student: z.coerce
      .number({ error: "Price must be a number" })
      .positive("Price must be positive")
      .min(1, "Price should be at least 1"),
    count_session: z.coerce
      .number({ error: "Number of sessions must be a number" })
      .int("Must be a whole number")
      .positive("Must be positive")
      .min(1, "At least 1 session required")
      .max(20, "At most 20 sessions allowed"),
    duration_session: z.coerce
      .number({ error: "Session duration must be a number (in hours)" })
      .positive("Duration must be positive")
      .min(0.5, "Session must be at least 0.5 hours (30 minutes)")
      .max(8, "Session cannot exceed 8 hours")
      .multipleOf(
        0.5,
        "Duration must be in 0.5 hour increments (e.g., 1, 1.5, 2)"
      ),
    min_students: z.coerce
      .number({ error: "Minimum students must be a number" })
      .int("Must be a whole number")
      .positive("Must be positive")
      .min(1, "At least 1 student required"),
    max_students: z.coerce
      .number({ error: "Maximum students must be a number" })
      .int("Must be a whole number")
      .positive("Must be positive"),
    course_date: z.string().min(1, "Course date is required"),
    schedule: z
      .array(
        z.object({
          date: z.string().min(1, "Date and time is required"),
        })
      )
      .min(1, "At least one schedule slot is required"),
  })
  .refine((data) => data.max_students >= data.min_students, {
    message:
      "Maximum students must be greater than or equal to minimum students",
    path: ["max_students"],
  })
  .refine(
    (data) => {
      const totalScheduledSessions = calculateTotalSessions(data.schedule);
      return totalScheduledSessions >= data.count_session;
    },
    {
      message: "Number of scheduled sessions must match the count of sessions",
      path: ["schedule"],
    }
  );

export type CourseInputs = z.infer<typeof courseSchema>;
