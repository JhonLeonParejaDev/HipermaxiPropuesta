"use server";
// ─── app/actions/auth.ts ──────────────────────────────────────────────────────
// Server Actions de autenticación: login, signup, logout.
//
// Son funciones del servidor — nunca se exponen al bundle del cliente.
// El cliente solo recibe un reference ID para llamarlas via POST.
//
// Patrón: FormData → Zod validate → DB query → createSession → redirect
// ──────────────────────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { createSession, deleteSession } from "@/lib/session";
import {
  LoginSchema,
  SignupSchema,
  type LoginFormState,
  type SignupFormState,
} from "@/lib/definitions";

// ─── login ────────────────────────────────────────────────────────────────────

/**
 * Server Action de inicio de sesión.
 * Uso con useActionState:
 *   const [state, action, pending] = useActionState(login, undefined)
 */
export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. Validar campos con Zod
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  // 2. Buscar usuario en la BD
  let user;
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    user = result[0];
  } catch {
    return { message: "Error de conexión. Intentá de nuevo." };
  }

  // 3. Verificar que el usuario existe y la contraseña es correcta
  // Usamos el mismo mensaje genérico para ambos casos (evita user enumeration)
  if (!user) {
    return { message: "Email o contraseña incorrectos." };
  }

  const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!passwordMatch) {
    return { message: "Email o contraseña incorrectos." };
  }

  // 4. Crear sesión JWT en cookie HttpOnly
  await createSession(user.id, user.role);

  // 5. Redirigir — redirect() lanza una excepción interna de Next.js,
  //    debe ir FUERA de try/catch para no ser capturada accidentalmente
  redirect("/");
}

// ─── signup ───────────────────────────────────────────────────────────────────

/**
 * Server Action de registro de nuevo usuario.
 */
export async function signup(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  // 1. Validar campos con Zod
  const validated = SignupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { fullName, email, password } = validated.data;

  // 2. Verificar que el email no exista ya
  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return {
        errors: { email: ["Este email ya está registrado. Iniciá sesión."] },
      };
    }
  } catch {
    return { message: "Error de conexión. Intentá de nuevo." };
  }

  // 3. Hash de la contraseña (bcrypt, factor 12)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 4. Insertar usuario y perfil en una transacción
  let newUser;
  try {
    newUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email, hashedPassword, role: "customer" })
        .returning({ id: users.id, role: users.role });

      // Crear perfil asociado
      await tx.insert(profiles).values({
        id: user.id,
        fullName,
      });

      return user;
    });
  } catch {
    return { message: "Error al crear la cuenta. Intentá de nuevo." };
  }

  // 5. Crear sesión y redirigir
  await createSession(newUser.id, newUser.role);
  redirect("/");
}

// ─── logout ───────────────────────────────────────────────────────────────────

/**
 * Server Action de cierre de sesión.
 * Llamar desde un <form action={logout}> o startTransition.
 */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
