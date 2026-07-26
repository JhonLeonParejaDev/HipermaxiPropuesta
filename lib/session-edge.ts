// ─── lib/session-edge.ts ──────────────────────────────────────────────────────
// Versión Edge Runtime del módulo de sesión.
// SOLO contiene decrypt() y SESSION_COOKIE — sin "server-only" ni "next/headers".
//
// Importar desde middleware.ts (Edge Runtime).
// Para Server Actions y Server Components, usar lib/session.ts.
// ──────────────────────────────────────────────────────────────────────────────

import { jwtVerify } from "jose";
import type { SessionPayload } from "@/lib/definitions";

export const SESSION_COOKIE = "hipermaxi_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // En middleware esto no debe lanzar — devolvemos null en decrypt()
    return new Uint8Array(0);
  }
  return new TextEncoder().encode(secret);
}

/**
 * Descifra y verifica el JWT de sesión.
 * Edge Runtime compatible — usa solo jose (no Node.js APIs).
 * Retorna null si el token es inválido, expirado, o SESSION_SECRET no está set.
 */
export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  const key = getSecretKey();
  if (key.length === 0) return null; // SESSION_SECRET no configurado
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as string,
      role: payload.role as SessionPayload["role"],
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return null;
  }
}
