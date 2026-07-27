"use client";
// ─── app/checkout/CheckoutClient.tsx ─────────────────────────────────────────
// Página de checkout completa — formulario de entrega + resumen de pedido.
// Conectado al carrito via useCart(), submits con Server Action (mock por ahora).
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { placeOrder } from "@/app/actions/order";
import type { CartItem } from "@/lib/cart-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckoutClientProps {
  /** Email del usuario autenticado, null si viene como invitado */
  userEmail: string | null;
  userFullName: string | null;
  userPhone: string | null;
  /** Email de invitado pasado por query param (?guest=...) */
  guestEmail: string | null;
}

// ─── Zonas de entrega de Cochabamba ───────────────────────────────────────────

const ZONAS_COCHABAMBA = [
  "Centro (Cercado)",
  "Quillacollo",
  "Sacaba",
  "Tiquipaya",
  "Colcapirhua",
  "Sipe Sipe",
  "Vinto",
  "Punata",
  "Otra zona",
];

const HORARIOS_ENTREGA = [
  { value: "asap", label: "Lo antes posible (2–4 horas)" },
  { value: "morning", label: "Mañana 9:00–13:00" },
  { value: "afternoon", label: "Tarde 14:00–18:00" },
  { value: "evening", label: "Noche 18:00–21:00" },
];

const METODOS_PAGO = [
  {
    id: "cash",
    label: "Efectivo al recibir",
    desc: "Pagás cuando llegue tu pedido",
    icon: "💵",
  },
  {
    id: "qr",
    label: "QR de pago",
    desc: "Tigo Money, Billetera o QR bancario",
    icon: "📱",
  },
  {
    id: "transfer",
    label: "Transferencia bancaria",
    desc: "Te enviamos los datos por WhatsApp",
    icon: "🏦",
  },
];

// ─── Íconos ───────────────────────────────────────────────────────────────────

function IconCheck() {
  return (
    <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
        done ? "bg-emerald-500" : active ? "bg-orange-500 shadow-md shadow-orange-200" : "bg-slate-200 text-slate-500"
      } ${done || active ? "text-white" : ""}`}>
        {done ? <IconCheck /> : n}
      </span>
      <span className={`text-sm font-semibold ${active ? "text-slate-900" : done ? "text-emerald-700" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────

function OrderSummary({ items, totalPrice, deliveryType }: {
  items: CartItem[];
  totalPrice: number;
  deliveryType: "delivery" | "pickup";
}) {
  const shippingCost = deliveryType === "pickup" ? 0 : totalPrice >= 200 ? 0 : 20;
  const total = totalPrice + shippingCost;

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-100 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">Resumen del pedido</h2>
        <p className="mt-0.5 text-xs text-slate-500">{items.length} {items.length === 1 ? "producto" : "productos"}</p>
      </div>

      {/* Products */}
      <ul className="divide-y divide-slate-50 px-5 py-2 max-h-64 overflow-y-auto">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-3 py-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-50">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-1"
                sizes="48px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">{product.name}</p>
              <p className="text-xs text-slate-500">{product.brand} · x{quantity}</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-slate-900">
              Bs {(product.price * quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <div className="border-t border-slate-100 px-5 py-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold text-slate-900">Bs {totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Envío</span>
          <span className={`font-semibold ${shippingCost === 0 ? "text-emerald-600" : "text-slate-900"}`}>
            {shippingCost === 0
              ? deliveryType === "pickup" ? "Gratis (retiro)" : "¡Gratis!"
              : `Bs ${shippingCost.toFixed(2)}`}
          </span>
        </div>
        {deliveryType === "delivery" && totalPrice < 200 && (
          <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
            🎁 Agregá Bs {(200 - totalPrice).toFixed(2)} más y obtenés envío gratis
          </p>
        )}
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
          <span className="font-bold text-slate-900">Total</span>
          <span className="font-extrabold text-orange-600">Bs {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CheckoutClient({
  userEmail,
  userFullName,
  userPhone,
  guestEmail,
}: CheckoutClientProps) {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const router = useRouter();
  const [orderProcessed, setOrderProcessed] = useState(false);

  // ── Form state ──
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [horario, setHorario] = useState("asap");

  // ── Server Action state ──
  const [state, action, pending] = useActionState(placeOrder, undefined);

  // ── Si el carrito está vacío y no se está procesando un pedido, redirigir ──
  useEffect(() => {
    if (totalItems === 0 && !state?.orderId && !orderProcessed) {
      router.push("/");
    }
  }, [totalItems, state?.orderId, orderProcessed, router]);

  // ── Si el pedido fue exitoso, limpiar carrito y redirigir a confirmación ──
  useEffect(() => {
    if (state?.orderId && !orderProcessed) {
      setOrderProcessed(true);
      clearCart();
      const params = new URLSearchParams();
      if (state.total) params.set("total", state.total);
      if (state.itemsCount) params.set("items", state.itemsCount.toString());
      if (state.deliveryType) params.set("type", state.deliveryType);
      const query = params.toString() ? `?${params.toString()}` : "";
      router.push(`/pedido/${state.orderId}${query}`);
    }
  }, [state, orderProcessed, clearCart, router]);

  const email = userEmail ?? guestEmail ?? "";
  const shippingCost = deliveryType === "pickup" ? 0 : totalPrice >= 200 ? 0 : 20;
  const total = totalPrice + shippingCost;

  if (totalItems === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg font-semibold">Tu carrito está vacío</p>
          <Link href="/" className="mt-2 inline-block text-sm text-orange-500 hover:underline">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Breadcrumb ── */}
      <nav aria-label="Paso del proceso" className="mb-6 flex items-center gap-4">
        <Link href="/" className="text-sm text-slate-400 hover:text-orange-500 transition-colors">Inicio</Link>
        <span className="text-slate-300">›</span>
        <span className="text-sm font-semibold text-slate-700">Finalizar compra</span>
      </nav>

      {/* ── Steps ── */}
      <div className="mb-8 flex items-center gap-6 overflow-x-auto pb-2">
        <StepBadge n={1} label="Carrito" active={false} done={true} />
        <div className="h-px flex-1 bg-slate-200 min-w-[20px]" />
        <StepBadge n={2} label="Datos de entrega" active={true} done={false} />
        <div className="h-px flex-1 bg-slate-200 min-w-[20px]" />
        <StepBadge n={3} label="Confirmación" active={false} done={false} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

        {/* ═══════════════════════════════════ FORMULARIO ════════════════════════════ */}
        <form id="checkout-form" action={action} className="space-y-6">

          {/* Campos ocultos para el Server Action */}
          <input type="hidden" name="items" value={JSON.stringify(items.map(i => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.quantity,
            unitPrice: i.product.price,
          })))} />
          <input type="hidden" name="subtotal" value={totalPrice.toFixed(2)} />
          <input type="hidden" name="shippingCost" value={shippingCost.toFixed(2)} />
          <input type="hidden" name="total" value={total.toFixed(2)} />
          <input type="hidden" name="paymentMethod" value={paymentMethod} />
          <input type="hidden" name="deliveryType" value={deliveryType} />
          <input type="hidden" name="horario" value={horario} />

          {/* ── 1. Datos de contacto ── */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
              <span className="flex size-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">1</span>
              Datos de contacto
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Nombre completo *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  defaultValue={userFullName ?? ""}
                  placeholder="Juan Pérez"
                  className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-100 ${
                    state?.errors?.fullName ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {state?.errors?.fullName && (
                  <p className="mt-1 text-xs text-red-500">{state.errors.fullName[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Teléfono / WhatsApp *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  defaultValue={userPhone ?? ""}
                  placeholder="+591 7XXXXXXX"
                  className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-100 ${
                    state?.errors?.phone ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {state?.errors?.phone && (
                  <p className="mt-1 text-xs text-red-500">{state.errors.phone[0]}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email de confirmación
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={email}
                  placeholder="tucorreo@ejemplo.com"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 focus:outline-none"
                  readOnly={!!userEmail}
                />
              </div>
            </div>
          </section>

          {/* ── 2. Tipo de entrega ── */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
              <span className="flex size-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">2</span>
              Tipo de entrega
            </h2>

            {/* Toggle delivery/pickup */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { val: "delivery", icon: "🛵", label: "Delivery a domicilio" },
                { val: "pickup", icon: "🏪", label: "Retirar en tienda" },
              ].map(({ val, icon, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDeliveryType(val as "delivery" | "pickup")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    deliveryType === val
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className={`text-sm font-semibold ${deliveryType === val ? "text-orange-700" : "text-slate-700"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {deliveryType === "delivery" ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="zona" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Zona / Barrio *
                  </label>
                  <select
                    id="zona"
                    name="zona"
                    required
                    className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 transition-all focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-100 ${
                      state?.errors?.zona ? "border-red-300" : "border-slate-200"
                    }`}
                  >
                    <option value="">Seleccioná tu zona...</option>
                    {ZONAS_COCHABAMBA.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                  {state?.errors?.zona && (
                    <p className="mt-1 text-xs text-red-500">{state.errors.zona[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="address" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Dirección completa *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    placeholder="Av. Uyuni 1234, entre calles..."
                    className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-100 ${
                      state?.errors?.address ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                  {state?.errors?.address && (
                    <p className="mt-1 text-xs text-red-500">{state.errors.address[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="reference" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Referencia
                  </label>
                  <input
                    id="reference"
                    name="reference"
                    type="text"
                    placeholder="Cerca del mercado, frente al parque..."
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label htmlFor="horario" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Horario preferido de entrega
                  </label>
                  <select
                    id="horario"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 transition-all focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-100"
                  >
                    {HORARIOS_ENTREGA.map((h) => (
                      <option key={h.value} value={h.value}>{h.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">📍 Sucursal Juan de la Rosa</p>
                <p className="mt-1 text-xs text-slate-500">Av. Juan de la Rosa esquina Uyuni, Cochabamba</p>
                <p className="mt-2 text-xs text-slate-500">🕐 Horario: Lun–Sáb 8:00–21:00 · Dom 8:00–20:00</p>
                <p className="mt-1 text-xs text-emerald-600 font-semibold">✓ Tu pedido estará listo en ~1 hora</p>
              </div>
            )}
          </section>

          {/* ── 3. Método de pago ── */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
              <span className="flex size-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">3</span>
              Método de pago
            </h2>
            <div className="space-y-3">
              {METODOS_PAGO.map((m) => (
                <label
                  key={m.id}
                  htmlFor={`pay-${m.id}`}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === m.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    id={`pay-${m.id}`}
                    type="radio"
                    name="paymentMethodInput"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="sr-only"
                  />
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${paymentMethod === m.id ? "text-orange-700" : "text-slate-800"}`}>
                      {m.label}
                    </p>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </div>
                  {paymentMethod === m.id && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500">
                      <IconCheck />
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>

          {/* ── 4. Notas ── */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-4 text-base font-bold text-slate-900">Notas adicionales</h2>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              placeholder="Instrucciones especiales, alergias, solicitudes..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:border-orange-400 focus:ring-orange-100"
            />
          </section>

          {/* ── Error global ── */}
          {state?.message && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </div>
          )}

          {/* ── Submit (visible solo en mobile — en desktop el botón está en el resumen) ── */}
          <button
            type="submit"
            disabled={pending}
            className="lg:hidden mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? (
              <>
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M12 3v3m0 12v3M3 12h3m12 0h3" /></svg>
                Procesando…
              </>
            ) : (
              `Confirmar pedido · Bs ${total.toFixed(2)}`
            )}
          </button>
        </form>

        {/* ═══════════════════════════════════ RESUMEN ════════════════════════════════ */}
        <aside>
          <OrderSummary items={items} totalPrice={totalPrice} deliveryType={deliveryType} />

          {/* Submit button — desktop */}
          <button
            type="submit"
            form="checkout-form"
            disabled={pending}
            className="mt-4 hidden w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 lg:flex"
          >
            {pending ? (
              <>
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M12 3v3m0 12v3M3 12h3m12 0h3" /></svg>
                Procesando…
              </>
            ) : (
              `Confirmar pedido · Bs ${total.toFixed(2)}`
            )}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            🔒 Tu pedido está seguro y encriptado
          </p>
        </aside>
      </div>
    </main>
  );
}
