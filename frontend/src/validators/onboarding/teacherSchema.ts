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
  country: z.string(),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  languages: z
    .array(
      z.object({
        language_id: z.coerce.number().min(1, "Language is required"),
        proficiency_level: z.enum([
          "native",
          "beginner",
          "elementary",
          "intermediate",
          "upper_intermediate",
          "advanced",
          "proficient",
        ]),
      })
    )
    .min(1, "At least one language is required"),
});

export type TeacherAboutRegistrationInputs = z.infer<typeof teacherAboutSchema>;

export const teacherPhotoSchema = z.object({
  photo: z
    .array(z.instanceof(File))
    .min(1, "Photo is required")
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ),
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
    issue_by: z.string().min(1, "Issuer is required"),
    year_of_study_start: z
      .string()
      .min(1, "Start year is required")
      .refine((val) => {
        const year = parseInt(val);
        return year >= 1950 && year <= new Date().getFullYear() + 5;
      }, "Invalid start year"),
    year_of_study_end: z
      .string()
      .min(1, "End year is required")
      .refine((val) => {
        const year = parseInt(val);
        return year >= 1950 && year <= new Date().getFullYear() + 5;
      }, "Invalid end year"),
  })
  .refine(
    (data) => {
      const startYear = parseInt(data.year_of_study_start);
      const endYear = parseInt(data.year_of_study_end);
      return startYear < endYear;
    },
    {
      message: "Start year must be before end year",
      path: ["year_of_study_end"], // Attach error to specific field
    }
  );

// Wrap in array schema
export const teacherCertificationSchema = z.object({
  certifications: z.array(singleCertificationSchema).optional().default([]),
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
      .min(1, "Start year is required")
      .refine((val) => {
        const year = parseInt(val);
        return year >= 1950 && year <= new Date().getFullYear() + 5;
      }, "Invalid start year"),
    year_of_study_end: z
      .string()
      .min(1, "End year is required")
      .refine((val) => {
        const year = parseInt(val);
        return year >= 1950 && year <= new Date().getFullYear() + 5;
      }, "Invalid end year"),
  })
  .refine(
    (data) => {
      const startYear = parseInt(data.year_of_study_start);
      const endYear = parseInt(data.year_of_study_end);
      return startYear < endYear;
    },
    {
      message: "Start year must be before end year",
      path: ["year_of_study_end"], // Attach error to specific field
    }
  );

// Wrap in array schema
export const teacherEducationSchema = z.object({
  educations: z.array(singleEducationSchema).optional().default([]),
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

// Teacher Languages Schema - using same proficiency levels as course proficiency
export const teacherLanguagesSchema = z.object({
  languages: z
    .array(
      z.object({
        language_id: z.coerce.number().min(1, "Language is required"),
        proficiency_level: z.enum([
          "beginner",
          "elementary",
          "intermediate",
          "upper_intermediate",
          "advanced",
          "proficient",
        ]),
      })
    )
    .min(1, "At least one language is required"),
});

export type TeacherLanguagesRegistrationInputs = z.infer<
  typeof teacherLanguagesSchema
>;
