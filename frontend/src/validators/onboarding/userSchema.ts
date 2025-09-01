// userSchema.ts
import { UserType } from "@/Models/Auth";
import z from "zod";

const userSchemaBase = z
  .object({
    name: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name cannot exceed 100 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(1, "Password confirmation is required"),
    birth_date: z
      .string()
      .min(1, "Birth date is required")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      }),
    phone_number: z
      .string()
      .min(1, "Phone number is required")
      .max(20, "Phone number cannot exceed 20 characters"),
    user_type: z.enum(UserType),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

const studentSchema = userSchemaBase;

const teacherSchema = userSchemaBase.extend({
  biography: z.string().max(500, "Biography cannot exceed 500 characters"),
});

// Function to get the appropriate schema based on user type
export const userSchema = (type: UserType) => {
  return type === "student" ? studentSchema : teacherSchema;
};

// Type definitions for better type safety
export type StudentRegistrationInputs = z.infer<typeof studentSchema>;
export type TeacherRegistrationInputs = z.infer<typeof teacherSchema>;

// Conditional type for dynamic type inference
export type UserRegistrationInputs<T extends UserType = UserType> =
  T extends "student" ? StudentRegistrationInputs : TeacherRegistrationInputs;
