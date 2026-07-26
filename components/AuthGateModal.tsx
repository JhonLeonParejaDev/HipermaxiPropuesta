"use client";
// ─── components/AuthGateModal.tsx ─────────────────────────────────────────────
// Modal de autenticación que se muestra ANTES del checkout.
// Ofrece tres caminos para maximizar la conversión:
//   1. Iniciar sesión  → redirige a /login?redirect=/checkout
//   2. Registrarse     → redirige a /registro?redirect=/checkout
//   3. Invitado        → solicita email y continúa directo al checkout
//
// El componente es completamente stateless respecto a la auth real:
// cuando exista NextAuth/Auth.js, simplemente verificar session aquí
// y saltear el modal si el usuario ya está logueado.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
  /** Llamado cuando el usuario elige continuar (ya sea logueado o como invitado) */
  onContinueAsGuest: (email: string) => void;
  totalPrice: number;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconClose() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconUserPlus() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

// ─── Beneficios de crear cuenta ───────────────────────────────────────────────

const ACCOUNT_BENEFITS = [
  "Guarda tu historial de pedidos",
  "Re-comprá tus productos favoritos en 1 clic",
  "Recibí ofertas exclusivas por email",
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AuthGateModal({
  open,
  onClose,
  onContinueAsGuest,
  totalPrice,
}: AuthGateModalProps) {
  // "options" = pantalla inicial con 3 botones
  // "guest"   = formulario de email para invitado
  const [view, setView] = useState<"options" | "guest">("options");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setView("options");
      setEmail("");
      setEmailError("");
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Focus automático al email input cuando se muestra la vista de invitado
  useEffect(() => {
    if (view === "guest") {
      setTimeout(() => emailInputRef.current?.focus(), 50);
    }
  }, [view]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const validateAndContinue = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Ingresá tu email para continuar.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("El email no parece válido. Revisalo.");
      return;
    }
    setEmailError("");
    onContinueAsGuest(trimmed);
  };

  if (!open) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
      />

      {/* ── Panel modal ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        className="fixed inset-x-4 top-1/2 z-[70] -translate-y-1/2 rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="auth-gate-title" className="text-base font-bold text-slate-900">
              {view === "options" ? "¿Cómo querés continuar?" : "Completar como invitado"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Total a pagar:{" "}
              <span className="font-bold text-orange-600">
                Bs {totalPrice.toFixed(2)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <IconClose />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5">

          {/* ════ VISTA: Opciones ════ */}
          {view === "options" && (
            <div className="flex flex-col gap-3">

              {/* Opción 1: Iniciar sesión */}
              <Link
                href="/login?redirect=/checkout"
                onClick={onClose}
                className="group flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 transition-all duration-150 hover:border-orange-400 hover:bg-orange-50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                  <IconUser />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">Iniciar sesión</p>
                  <p className="text-xs text-slate-500">Accedé a tu cuenta y tus pedidos anteriores</p>
                </div>
                <svg className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </Link>

              {/* Opción 2: Registrarse */}
              <Link
                href="/registro?redirect=/checkout"
                onClick={onClose}
                className="group flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 transition-all duration-150 hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  <IconUserPlus />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">Crear cuenta</p>
                  <p className="text-xs text-slate-500">Rápido y gratis — guardá tus pedidos</p>
                </div>
                <svg className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </Link>

              {/* Divisor */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-xs font-medium text-slate-400">o</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Opción 3: Invitado */}
              <button
                onClick={() => setView("guest")}
                className="group flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-left transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-200">
                  <IconMail />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-700">Continuar como invitado</p>
                  <p className="text-xs text-slate-500">Solo necesitamos tu email para el pedido</p>
                </div>
                <svg className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Beneficios */}
              <div className="mt-2 rounded-xl bg-emerald-50 px-4 py-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                  Beneficios de tener cuenta
                </p>
                <ul className="flex flex-col gap-1.5">
                  {ACCOUNT_BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-emerald-800">
                      <IconCheck />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ════ VISTA: Formulario invitado ════ */}
          {view === "guest" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Te enviaremos la confirmación de tu pedido a este email.
              </p>

              <div>
                <label
                  htmlFor="guest-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Email
                </label>
                <input
                  ref={emailInputRef}
                  id="guest-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") validateAndContinue(); }}
                  placeholder="tucorreo@ejemplo.com"
                  className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                    emailError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-red-500">{emailError}</p>
                )}
              </div>

              <button
                onClick={validateAndContinue}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98]"
              >
                Continuar al pago →
              </button>

              <button
                onClick={() => setView("options")}
                className="text-center text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
              >
                ← Volver
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
