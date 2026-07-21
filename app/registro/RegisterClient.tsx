"use client";
// ─── app/registro/RegisterClient.tsx ─────────────────────────────────────────
// Formulario de registro conectado a la Server Action signup().
// ──────────────────────────────────────────────────────────────────────────────

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signup } from "@/app/actions/auth";

function IconEye({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={visible ? "Ocultar" : "Mostrar"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1.5 text-xs text-red-500">{errors[0]}</p>;
}

function inputClass(hasError: boolean) {
  return `h-11 w-full rounded-xl border px-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 disabled:opacity-60 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
  }`;
}

export default function RegisterClient() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <main id="main-content" className="flex min-h-[calc(100vh-200px)] flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Volver al inicio">
            <Image src="/logo-hiper.png" alt="Hipermaxi" width={120} height={52} className="h-12 w-auto object-contain" priority />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_40px_rgba(0,0,0,0.10)] ring-1 ring-slate-100">

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-xl font-extrabold text-white">Crear cuenta</h1>
            <p className="mt-1 text-sm text-blue-100">Rápido y gratis — guardá tus pedidos y ofertas</p>
          </div>

          <form action={action} noValidate className="flex flex-col gap-4 px-8 py-6">

            {state?.message && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{state.message}</span>
              </div>
            )}

            {/* Nombre completo */}
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-xs font-semibold text-slate-700">Nombre completo</label>
              <input id="reg-name" name="fullName" type="text" autoComplete="name" disabled={pending}
                placeholder="Juan Pérez" className={inputClass(!!state?.errors?.fullName)} />
              <FieldError errors={state?.errors?.fullName} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label>
              <input id="reg-email" name="email" type="email" autoComplete="email" disabled={pending}
                placeholder="tucorreo@ejemplo.com" className={inputClass(!!state?.errors?.email)} />
              <FieldError errors={state?.errors?.email} />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-xs font-semibold text-slate-700">Contraseña</label>
              <div className="relative">
                <input id="reg-password" name="password" type={showPw ? "text" : "password"} autoComplete="new-password"
                  disabled={pending} placeholder="Mínimo 8 caracteres" className={`${inputClass(!!state?.errors?.password)} pr-10`} />
                <IconEye visible={showPw} onClick={() => setShowPw(v => !v)} />
              </div>
              <FieldError errors={state?.errors?.password} />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="reg-confirm" className="mb-1.5 block text-xs font-semibold text-slate-700">Confirmar contraseña</label>
              <div className="relative">
                <input id="reg-confirm" name="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password"
                  disabled={pending} placeholder="Repetí la contraseña" className={`${inputClass(!!state?.errors?.confirmPassword)} pr-10`} />
                <IconEye visible={showConfirm} onClick={() => setShowConfirm(v => !v)} />
              </div>
              <FieldError errors={state?.errors?.confirmPassword} />
            </div>

            <button type="submit" disabled={pending}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70">
              {pending ? (
                <>
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" d="M12 3v3m0 12v3M3 12h3m12 0h3" />
                  </svg>
                  Creando cuenta…
                </>
              ) : "Crear cuenta"}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Al registrarte aceptás nuestros{" "}
              <Link href="/terminos" className="text-orange-500 hover:underline">Términos de uso</Link>{" "}
              y{" "}
              <Link href="/privacidad" className="text-orange-500 hover:underline">Política de privacidad</Link>.
            </p>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs font-medium text-slate-400">¿ya tenés cuenta?</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <Link href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700 transition-all hover:border-blue-400 hover:text-blue-600">
              Iniciar sesión
            </Link>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">🔒 Tu información está protegida y encriptada.</p>
      </div>
    </main>
  );
}
