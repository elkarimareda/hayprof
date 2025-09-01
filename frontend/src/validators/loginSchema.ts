import z from "zod";

export const loginSchema = z.object({
  identifier: z.union([
    z.email("Email invalide").min(1, "Email requis"),
    z
      .string()
      .min(1, "Phone number is required")
      .max(20, "Phone number cannot exceed 20 characters"),
  ]),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  remember: z.boolean(),
});
export type LoginInputs = z.infer<typeof loginSchema>;
