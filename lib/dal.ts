// ─── lib/dal.ts ───────────────────────────────────────────────────────────────
// Data Access Layer (DAL) — centraliza la lógica de autorización y acceso
// a datos del usuario autenticado.
//
// Patrón recomendado por Next.js 16 para evitar exponer datos sensibles
// a componentes no autorizados.
//
// Referencia: nextjs.org/docs/app/guides/authentication#creating-a-data-access-layer
// ──────────────────────────────────────────────────────────────────────────────

import "server-only";
import { cache } from "react";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import type { SessionPayload } from "@/lib/definitions";

// ─── verifySession ────────────────────────────────────────────────────────────

/**
 * Verifica la sesión actual.
 * Usa React.cache() para deduplicar llamadas en el mismo render tree.
 * Retorna null si no hay sesión válida (usuario no autenticado).
 */
export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  return getSession();
});

// ─── getUser ──────────────────────────────────────────────────────────────────

/**
 * Obtiene el usuario completo (con perfil) de la BD si hay sesión activa.
 * Cacheado por React para no consultar la BD múltiples veces por render.
 *
 * Uso en Server Components:
 *   const user = await getUser();
 *   if (!user) redirect('/login');
 */
export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session?.userId) return null;

  try {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        // Datos del perfil
        fullName: profiles.fullName,
        phone: profiles.phone,
        avatarUrl: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.id))
      .where(eq(users.id, session.userId))
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    console.error("[DAL] Error al obtener usuario:", error);
    return null;
  }
});

// ─── isAdmin ──────────────────────────────────────────────────────────────────

/**
 * Verifica si el usuario actual tiene rol de administrador.
 * Útil para condicionar UI en Server Components sin ir a la BD.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await verifySession();
  return session?.role === "admin";
}

// ─── requireAuth ──────────────────────────────────────────────────────────────

/**
 * Lanza un error si no hay sesión activa.
 * Usar en Server Actions que requieren autenticación.
 *
 * Ejemplo:
 *   const session = await requireAuth();
 *   // Si llega aquí, session es válida
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await verifySession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
