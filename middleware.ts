// ─── middleware.ts ────────────────────────────────────────────────────────────
// Middleware de Next.js — protección de rutas via sesión JWT.
//
// IMPORTANTE: El middleware corre en el Edge Runtime.
// Por eso solo leemos el JWT de la cookie (decrypt con jose, Edge-compatible).
// NUNCA hacer queries a la BD aquí — es demasiado lento y no es Edge-compatible.
//
// Patrón: "optimistic checks" — verificar el JWT (rápido) en middleware,
// y hacer la verificación real contra la BD dentro de cada Server Action o
// en el Server Component via getUser() del DAL.
// ──────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

// ─── Configuración de rutas ───────────────────────────────────────────────────

/** Rutas que requieren sesión activa */
const PROTECTED_ROUTES = [
  "/checkout",
  "/mi-cuenta",
  "/mi-cuenta/pedidos",
  "/admin",
];

/** Rutas que redirigen al inicio si el usuario YA está autenticado */
const AUTH_ONLY_ROUTES = ["/login", "/registro"];

// ─── Middleware ───────────────────────────────────────────────────────────────

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Verificar si la ruta actual coincide con las protegidas/auth-only
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
  // (evita que un usuario logueado vea la pantalla de login)
  if (isAuthOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── Ruta de admin sin rol admin → 403 ──
  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Excluir archivos estáticos, imágenes de Next.js y API routes del middleware.

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
