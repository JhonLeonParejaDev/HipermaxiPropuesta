// ─── lib/dal.ts ───────────────────────────────────────────────────────────────
// Data Access Layer (DAL) — centraliza la lógica de autorización y acceso
// a datos del usuario autenticado.
//
// Usa el cliente admin de Supabase (REST API) para queries — no requiere
// conexión TCP directa a PostgreSQL.
// ──────────────────────────────────────────────────────────────────────────────

import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import type { SessionPayload } from "@/lib/definitions";

// ─── verifySession ────────────────────────────────────────────────────────────

/**
 * Verifica la sesión JWT de la cookie.
 * Cacheado con React.cache() para no re-leer la cookie múltiples veces.
 */
export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  return getSession();
});

// ─── getUser ──────────────────────────────────────────────────────────────────

/**
 * Obtiene el usuario completo (con perfil) de la BD si hay sesión activa.
 * React.cache() garantiza una sola query por render tree.
 */
export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session?.userId) return null;

  const { data, error } = await supabaseAdmin
    .from("users")
    .select(`
      id,
      email,
      role,
      email_verified,
      created_at,
      profiles (
        full_name,
        phone,
        avatar_url
      )
    `)
    .eq("id", session.userId)
    .single();

  if (error || !data) {
    console.error("[DAL] Error al obtener usuario:", error?.message);
    return null;
  }

  // Aplanar la relación de perfil
  const profile = Array.isArray(data.profiles)
    ? data.profiles[0]
    : data.profiles;

  return {
    id: data.id,
    email: data.email,
    role: data.role as SessionPayload["role"],
    emailVerified: data.email_verified,
    createdAt: new Date(data.created_at),
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
});

// ─── isAdmin ──────────────────────────────────────────────────────────────────

export async function isAdmin(): Promise<boolean> {
  const session = await verifySession();
  return session?.role === "admin";
}

// ─── requireAuth ──────────────────────────────────────────────────────────────

/**
 * Lanza un error si no hay sesión. Usar en Server Actions protegidas.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await verifySession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
