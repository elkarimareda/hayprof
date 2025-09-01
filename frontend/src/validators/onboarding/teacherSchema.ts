import z from "zod";

export const teacherAboutSchema = z.object({
  firstname: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  lastname: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  country: z.string(),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number cannot exceed 20 characters"),
});

export type TeacherAboutRegistrationInputs = z.infer<typeof teacherAboutSchema>;

export const teacherPhotoSchema = z.object({
  photo: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Photo is required")
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/webp"].includes(files[0]?.type),
      "Only JPEG, PNG and WebP images are allowed"
    ),
});

export type TeacherPhotoRegistrationInputs = z.infer<typeof teacherPhotoSchema>;

// Define single certification schema
const singleCertificationSchema = z
  .object({
    subject: z.string().min(1, "Subject is required"),
    certificate: z.string().min(1, "Certificate is required"),
    description: z.string().optional(),
    issue_by: z.string(),
    year_of_study_start: z
      .string()
      .min(4, "Year of study incorrect")
      .max(4, "Year of study incorrect"),
    year_of_study_end: z
      .string()
      .min(4, "Year of study incorrect")
      .max(4, "Year of study incorrect"),
  })
  .refine(
    (data) => Number(data.year_of_study_start) < Number(data.year_of_study_end),
    {
      message: "Year of study start must be before year of study end",
      path: ["year_of_study_end"], // Attach error to specific field
    }
  );

// Wrap in array schema
export const teacherCertificationSchema = z.object({
  certifications: z.array(singleCertificationSchema).min(1, {
    message: "At least one certification is required",
  }),
});

export type TeacherCertificationRegistrationInputs = z.infer<
  typeof teacherCertificationSchema
>;

// Define single education schema
const singleEducationSchema = z
  .object({
    university: z.string().min(1, "University is required"),
    degree: z.string().min(1, "Degree is required"),
    degree_type: z.string().min(1, "Degree type is required"),
    specialization: z.string().min(1, "Specialization is required"),
    year_of_study_start: z
      .string()
      .min(4, "Year of study incorrect")
      .max(4, "Year of study incorrect"),
    year_of_study_end: z
      .string()
      .min(4, "Year of study incorrect")
      .max(4, "Year of study incorrect"),
  })
  .refine(
    (data) => Number(data.year_of_study_start) < Number(data.year_of_study_end),
    {
      message: "Year of study start must be before year of study end",
      path: ["year_of_study_end"], // Attach error to specific field
    }
  );

// Wrap in array schema
export const teacherEducationSchema = z.object({
  educations: z.array(singleEducationSchema).min(1, {
    message: "At least one education entry is required",
  }),
});

export type TeacherEducationRegistrationInputs = z.infer<
  typeof teacherEducationSchema
>;

export const teacherDescriptionSchema = z.object({
  yourself: z
    .string()
    .min(1, "Description is required")
    .max(400, "Description cannot exceed 400 characters"),
  experience: z
    .string()
    .min(1, "Experience is required")
    .max(400, "Experience cannot exceed 400 characters"),
  motivation: z
    .string()
    .min(1, "Motivation is required")
    .max(400, "Motivation cannot exceed 400 characters"),
  headline: z
    .string()
    .min(1, "Headline is required")
    .max(100, "Headline cannot exceed 100 characters"),
});

export type TeacherDescriptionRegistrationInputs = z.infer<
  typeof teacherDescriptionSchema
>;

export const teacherVideoSchema = z.object({
  video: z.instanceof(Blob),
  thumbnails: z.instanceof(Blob).optional(),
});

export type TeacherVideoRegistrationInputs = z.infer<typeof teacherVideoSchema>;

export const teacherAvailabilitySchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
});

export type TeacherAvailabilityRegistrationInputs = z.infer<
  typeof teacherAvailabilitySchema
>;

export const teacherPricingSchema = z.object({
  pricing: z.coerce
    .number({
      error: "Pricing must be a number",
    })
    .int()
    .positive()
    .min(1, { message: "Pricing should be at least 1" }),
});

export type TeacherPricingRegistrationInputs = z.infer<
  typeof teacherPricingSchema
>;
