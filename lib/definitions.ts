// ─── lib/definitions.ts ───────────────────────────────────────────────────────
// Schemas Zod para validación en Server Actions y tipos de FormState.
// Importar en Server Actions (server-only) y en Client Components (para tipos).
// ──────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Login ────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: "Ingresá un email válido." })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, { message: "Ingresá tu contraseña." }),
});

// ─── Signup ───────────────────────────────────────────────────────────────────

export const SignupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
      .trim(),
    email: z
      .string()
      .email({ message: "Ingresá un email válido." })
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
      .regex(/[A-Za-z]/, { message: "Debe contener al menos una letra." })
      .regex(/[0-9]/, { message: "Debe contener al menos un número." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

// ─── FormState types ──────────────────────────────────────────────────────────
// Patrón de Next.js 16 para useActionState

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type SignupFormState =
  | {
      errors?: {
        fullName?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;

// ─── Session Payload ──────────────────────────────────────────────────────────
// Lo que se almacena cifrado en el JWT de sesión

export interface SessionPayload {
  userId: string;
  role: "customer" | "admin" | "staff";
  expiresAt: Date;
}
