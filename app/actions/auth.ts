"use server";
// ─── app/actions/auth.ts ──────────────────────────────────────────────────────
// Server Actions de autenticación: login, signup, logout.
//
// PATRÓN CRÍTICO: redirect() DEBE estar fuera de cualquier try/catch,
// ya que internamente lanza una excepción NEXT_REDIRECT.
// ──────────────────────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSession, deleteSession } from "@/lib/session";
import {
  LoginSchema,
  SignupSchema,
  type LoginFormState,
  type SignupFormState,
  type SessionPayload,
} from "@/lib/definitions";

// ─── login ────────────────────────────────────────────────────────────────────

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

  // Variables para pasar entre try/catch y redirect (que debe ir fuera)
  let userId: string | null = null;
  let userRole: SessionPayload["role"] = "customer";

  try {
    // 2. Buscar usuario en la BD via Supabase REST API
    const { data: user, error: queryError } = await supabaseAdmin
      .from("users")
      .select("id, email, hashed_password, role")
      .eq("email", email)
      .maybeSingle(); // maybeSingle() no lanza error si no encuentra filas

    if (queryError) {
      console.error("[login] Error de DB:", queryError.message, queryError.code);
      return { message: "Error de conexión. Intentá de nuevo en unos minutos." };
    }

    if (!user) {
      // Mismo mensaje para usuario no encontrado — evita user enumeration
      return { message: "Email o contraseña incorrectos." };
    }

    // 3. Verificar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(
      password,
      user.hashed_password as string
    );

    if (!passwordMatch) {
      return { message: "Email o contraseña incorrectos." };
    }

    // 4. Crear sesión JWT en cookie HttpOnly
    await createSession(user.id as string, user.role as SessionPayload["role"]);

    userId = user.id as string;
    userRole = user.role as SessionPayload["role"];

    console.log(`[login] ✅ Usuario autenticado: ${email} (${userId})`);
  } catch (err) {
    // Cualquier error inesperado → devolver mensaje al cliente
    console.error("[login] Error inesperado:", err);
    return { message: "Error interno del servidor. Intentá de nuevo." };
  }

  // 5. Redirigir — FUERA del try/catch para que Next.js lo maneje correctamente
  redirect("/");
}

// ─── signup ───────────────────────────────────────────────────────────────────

export async function signup(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  // 1. Validar con Zod
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

  try {
    // 2. Verificar que el email no exista ya
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("[signup] Error al verificar email:", checkError.message);
      return { message: "Error de conexión. Intentá de nuevo." };
    }

    if (existing) {
      return {
        errors: { email: ["Este email ya está registrado. Iniciá sesión."] },
      };
    }

    // 3. Hash de contraseña (bcrypt factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Insertar usuario
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        email,
        hashed_password: hashedPassword,
        role: "customer",
      })
      .select("id, role")
      .single();

    if (userError || !newUser) {
      console.error("[signup] Error al crear usuario:", userError?.message);
      return { message: "Error al crear la cuenta. Intentá de nuevo." };
    }

    // 5. Insertar perfil (no bloqueante — el usuario ya existe aunque falle el perfil)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: newUser.id, full_name: fullName });

    if (profileError) {
      console.error("[signup] Error al crear perfil:", profileError.message);
      // Continuamos — el usuario puede completar su perfil después
    }

    // 6. Crear sesión JWT
    await createSession(
      newUser.id as string,
      newUser.role as SessionPayload["role"]
    );

    console.log(`[signup] ✅ Usuario registrado: ${email} (${newUser.id})`);
  } catch (err) {
    console.error("[signup] Error inesperado:", err);
    return { message: "Error interno del servidor. Intentá de nuevo." };
  }

  // 7. Redirigir — FUERA del try/catch
  redirect("/");
}

// ─── logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await deleteSession();
  } catch (err) {
    console.error("[logout] Error al eliminar sesión:", err);
  }
  redirect("/login");
}
