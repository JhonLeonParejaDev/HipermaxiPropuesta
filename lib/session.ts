// ─── lib/session.ts ───────────────────────────────────────────────────────────
// Gestión de sesiones stateless via JWT (jose) almacenado en cookie HttpOnly.
//
// Patrón oficial de Next.js 16 (App Router):
//   https://nextjs.org/docs/app/guides/authentication#stateless-sessions
//
// "server-only" garantiza que las claves secretas nunca lleguen al bundle del cliente.
// ──────────────────────────────────────────────────────────────────────────────

import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/lib/definitions";

// ─── Configuración ────────────────────────────────────────────────────────────

const SESSION_COOKIE = "hipermaxi_session";
const SESSION_DURATION_DAYS = 7;

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET no está configurado. " +
      "Generá una clave con: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
  }
  return new TextEncoder().encode(secret);
}

// ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

/** Cifra el payload en un JWT firmado con HS256 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSecretKey());
}

/** Descifra y verifica el JWT. Retorna null si es inválido o expirado. */
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as string,
      role: payload.role as SessionPayload["role"],
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    // Token inválido, expirado, o manipulado
    return null;
  }
}

// ─── Cookie management ────────────────────────────────────────────────────────

/**
 * Crea la sesión y la guarda en una cookie HttpOnly segura.
 * Llamar desde Server Actions después de verificar credenciales.
 */
export async function createSession(
  userId: string,
  role: SessionPayload["role"] = "customer"
): Promise<void> {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );
  const token = await encrypt({ userId, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Renueva la expiración de la sesión activa.
 * Llamar desde el middleware en cada request del usuario autenticado.
 */
export async function updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);

  if (!session) return;

  const newExpiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );
  const newToken = await encrypt({ ...session, expiresAt: newExpiresAt });

  cookieStore.set(SESSION_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: newExpiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Elimina la sesión (logout).
 * Llamar desde la Server Action de logout.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Lee la sesión actual sin renovarla.
 * Útil para el middleware y Server Components.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return decrypt(token);
}

export { SESSION_COOKIE };
