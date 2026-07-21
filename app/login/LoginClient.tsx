"use client";
// ─── app/login/LoginClient.tsx ────────────────────────────────────────────────
// Formulario de inicio de sesión conectado a la Server Action login().
// Usa useActionState (React 19) para manejar estado y errores del servidor.
// ──────────────────────────────────────────────────────────────────────────────

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";

// ─── Icon: ojo para mostrar/ocultar contraseña ────────────────────────────────

function IconEye({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
    >
      {visible ? (
        <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LoginClient() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [showPassword, setShowPassword] = useState(false);

  // useActionState conecta el formulario con la Server Action.
  // - state: errores de validación o mensaje de error del servidor
  // - action: función a pasar al <form action={...}>
  // - pending: true mientras la Server Action está ejecutando
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main
      id="main-content"
      className="flex min-h-[calc(100vh-200px)] flex-1 items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">

        {/* ── Logo ── */}
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Volver al inicio">
            <Image
              src="/logo-hiper.png"
              alt="Hipermaxi"
              width={120}
              height={52}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* ── Card ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_40px_rgba(0,0,0,0.10)] ring-1 ring-slate-100">

          {/* Header */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-6">
            <h1 className="text-xl font-extrabold text-white">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-orange-100">
              Accedé a tus pedidos y promociones exclusivas
            </p>
          </div>

          {/* Formulario — action={action} conecta con la Server Action */}
          <form action={action} noValidate className="flex flex-col gap-5 px-8 py-6">

            {/* Error global del servidor (credenciales incorrectas, etc.) */}
            {state?.message && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{state.message}</span>
              </div>
            )}

            {/* Campo: Email */}
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={pending}
                defaultValue=""
                aria-describedby={state?.errors?.email ? "email-error" : undefined}
                placeholder="tucorreo@ejemplo.com"
                className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  state?.errors?.email
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                }`}
              />
              {state?.errors?.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-500">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Campo: Contraseña */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                  Contraseña
                </label>
                <Link
                  href="/recuperar-contrasena"
                  className="text-xs font-medium text-orange-500 transition-colors hover:text-orange-600"
                >
                  ¿Olvidaste la tuya?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={pending}
                  defaultValue=""
                  aria-describedby={state?.errors?.password ? "password-error" : undefined}
                  placeholder="••••••••"
                  className={`h-11 w-full rounded-xl border px-4 pr-10 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 disabled:opacity-60 ${
                    state?.errors?.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                />
                <IconEye
                  visible={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                />
              </div>
              {state?.errors?.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-500">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? (
                <>
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" d="M12 3v3m0 12v3M3 12h3m12 0h3" />
                  </svg>
                  Verificando…
                </>
              ) : (
                "Ingresar"
              )}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs font-medium text-slate-400">¿no tenés cuenta?</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Link a registro */}
            <Link
              href={`/registro?redirect=${encodeURIComponent(redirect)}`}
              className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700 transition-all hover:border-orange-400 hover:text-orange-600"
            >
              Crear cuenta gratis
            </Link>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          🔒 Tu información está protegida y encriptada.
        </p>
      </div>
    </main>
  );
}
