// ─── proxy.ts ─────────────────────────────────────────────────────────────────
// Proxy de Next.js 16 — protección de rutas via sesión JWT.
// Archivo renombrado desde middleware.ts (deprecado en Next.js 16).
//
// IMPORTANTE: Corre en Edge Runtime — NO hacer queries a la BD aquí.
// Solo verificar el JWT de la cookie (decrypt con jose, Edge-compatible).
// ──────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session-edge";

// ─── Configuración de rutas ───────────────────────────────────────────────────

/** Rutas que requieren sesión activa */
const PROTECTED_ROUTES = [
  "/checkout",
  "/mi-cuenta",
  "/admin",
];

/** Rutas que redirigen al inicio si el usuario YA está autenticado */
const AUTH_ONLY_ROUTES = ["/login", "/registro"];

// ─── Función proxy (nombre requerido por Next.js 16) ─────────────────────────

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(
    (route) => pathname === route
  );

  // Leer y descifrar la sesión de la cookie
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);
  const isAuthenticated = !!session?.userId;

  // ── Ruta protegida sin sesión → redirigir a login ──
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Ruta de auth con sesión activa → redirigir a inicio ──
  if (isAuthOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── Rutas de admin sin rol admin → redirigir a inicio ──
  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
