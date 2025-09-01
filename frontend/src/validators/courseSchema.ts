import { z } from "zod";

// Helper function to calculate hours from time slots
const calculateTotalHours = (
  schedule: Array<{ start_time: string; end_time: string }>
) => {
  return schedule.reduce((total, slot) => {
    const startTime = new Date(`2000-01-01T${slot.start_time}:00`);
    const endTime = new Date(`2000-01-01T${slot.end_time}:00`);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0);
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
    number_of_hours: z.coerce
      .number({ error: "Number of hours must be a number" })
      .positive("Must be positive")
      .min(0.5, "At least 0.5 hours required")
      .multipleOf(0.5, "Hours must be in 0.5 hour increments"),
    min_students: z.coerce
      .number({ error: "Minimum students must be a number" })
      .int("Must be a whole number")
      .positive("Must be positive")
      .min(1, "At least 1 student required"),
    max_students: z.coerce
      .number({ error: "Maximum students must be a number" })
      .int("Must be a whole number")
      .positive("Must be positive"),
    schedule: z
      .array(
        z.object({
          day_of_week: z.enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ]),
          start_time: z.string().min(1, "Start time is required"),
          end_time: z.string().min(1, "End time is required"),
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
      const totalScheduledHours = calculateTotalHours(data.schedule);
      return totalScheduledHours >= data.number_of_hours;
    },
    {
      message: "Scheduled time slots must meet minimum hour requirements",
      path: ["schedule"],
    }
  );

export type CourseInputs = z.infer<typeof courseSchema>;
