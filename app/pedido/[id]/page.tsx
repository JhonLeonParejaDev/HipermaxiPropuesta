// ─── app/pedido/[id]/page.tsx ─────────────────────────────────────────────────
// Página de confirmación de pedido — se muestra después de hacer checkout.
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "¡Pedido confirmado! | Hipermaxi",
};

interface OrderConfirmationProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ total?: string; items?: string; type?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderConfirmationProps) {
  const { id } = await params;
  const { total, items, type } = await searchParams;

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">

      {/* ── Animación de éxito ── */}
      <div className="mb-8 flex justify-center">
        <div className="relative flex size-24 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="size-12 text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {/* Anillo animado */}
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-30" />
        </div>
      </div>

      {/* ── Título ── */}
      <h1 className="text-3xl font-extrabold text-slate-900">¡Pedido recibido!</h1>
      <p className="mt-3 text-slate-500">
        Gracias por tu compra en Hipermaxi. Tu pedido está siendo procesado.
      </p>

      {/* ── Número de pedido y Resumen ── */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Número de pedido</p>
            <p className="mt-1 text-2xl font-extrabold tracking-wider text-orange-600">{id}</p>
          </div>
          {total && (
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total pagado</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">Bs {parseFloat(total).toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Detalles rápidos */}
        {(type || items) && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
            {type && (
              <div>
                <p className="font-medium text-slate-400">Tipo de entrega</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {type === "pickup" ? "🏪 Retiro en tienda" : "🛵 Delivery a domicilio"}
                </p>
              </div>
            )}
            {items && (
              <div>
                <p className="font-medium text-slate-400">Productos</p>
                <p className="font-bold text-slate-800 mt-0.5">{items} {items === "1" ? "artículo" : "artículos"}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-xl">📱</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Confirmación por WhatsApp</p>
              <p className="text-xs text-slate-500">Recibirás un mensaje de confirmación al número que ingresaste.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-xl">🛵</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Seguimiento del pedido</p>
              <p className="text-xs text-slate-500">Te avisaremos cuando el repartidor salga con tu pedido.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-xl">❓</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">¿Alguna consulta?</p>
              <p className="text-xs text-slate-500">
                Escribinos por{" "}
                <a
                  href="https://wa.me/59171234567?text=Hola%2C%20consulta%20sobre%20mi%20pedido%20${id}"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  WhatsApp
                </a>
                {" "}indicando tu número de pedido.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-95"
        >
          Seguir comprando
        </Link>
        <Link
          href="/mi-cuenta"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-8 text-sm font-semibold text-slate-700 transition-all hover:border-orange-400 hover:text-orange-600"
        >
          Ver mis pedidos
        </Link>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        🔒 Tu compra está protegida. Podés cancelar o modificar tu pedido contactándonos antes de que salga en camino.
      </p>
    </main>
  );
}
