"use client";
// ─── components/OrderConfirmationClient.tsx ────────────────────────────────────
// Vista interactiva y multimedia de confirmación de pedido.
// Incluye: Lluvia de confeti, QR dinámico, ticket de compra con imágenes,
// barra de progreso de estado e imprimir/descargar comprobante.
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";

export interface PurchasedItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  brand?: string;
}

interface OrderConfirmationClientProps {
  orderId: string;
  total?: string;
  itemsCount?: string;
  deliveryType?: string;
  itemsJson?: string;
}

export default function OrderConfirmationClient({
  orderId,
  total,
  itemsCount,
  deliveryType,
  itemsJson,
}: OrderConfirmationClientProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Parsear items desde JSON
  let items: PurchasedItem[] = [];
  if (itemsJson) {
    try {
      items = JSON.parse(itemsJson);
    } catch {
      items = [];
    }
  }

  const parsedTotal = total ? parseFloat(total) : 0;
  const isPickup = deliveryType === "pickup";

  // Disparar confeti al montar el componente + obtener URL actual
  useEffect(() => {
    setCurrentUrl(window.location.href);

    // Confetti de celebración
    const count = 200;
    const defaults = {
      origin: { y: 0.6 },
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola Hipermaxi! Hice el pedido ${orderId} por un total de Bs ${parsedTotal.toFixed(2)}. Quisiera consultar el estado.`
  );

  return (
    <>
      {/* Estilos para impresión limpia de comprobante */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        
        {/* ── Animación visual de éxito ── */}
        <div className="no-print mb-8 flex justify-center">
          <div className="relative flex size-24 items-center justify-center rounded-full bg-emerald-100 shadow-xl shadow-emerald-100/50">
            <svg
              className="size-12 text-emerald-600 animate-in zoom-in-50 duration-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-40 duration-1000" />
          </div>
        </div>

        {/* ── Encabezado ── */}
        <div className="text-center no-print">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            ✨ Compra completada con éxito
          </span>
          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            ¡Gracias por tu pedido!
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Tu solicitud fue recibida y ya está en proceso de preparación.
          </p>
        </div>

        {/* ── Barra de estado del pedido ── */}
        <div className="no-print mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Estado de tu compra
          </h2>
          <div className="mt-4 flex items-center justify-between gap-2">
            {[
              { step: 1, label: "Recibido", done: true, current: true },
              { step: 2, label: "En preparación", done: false, current: false },
              { step: 3, label: "En camino", done: false, current: false },
              { step: 4, label: "Entregado", done: false, current: false },
            ].map((s, idx) => (
              <div key={s.step} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div className={`h-1 flex-1 ${s.done ? "bg-emerald-500" : "bg-slate-100"}`} />
                  )}
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      s.done
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-50 shadow-md shadow-emerald-200"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {s.done ? "✓" : s.step}
                  </div>
                  {idx < 3 && (
                    <div className={`h-1 flex-1 ${s.done ? "bg-emerald-500" : "bg-slate-100"}`} />
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    s.current ? "text-emerald-700 font-bold" : "text-slate-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════ TICKET DE COMPRA ════════════════════════════ */}
        <div
          id="printable-receipt"
          className="relative mt-8 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200/80"
        >
          {/* Banda superior del ticket */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛒</span>
                <span className="font-extrabold tracking-wide text-lg">Hipermaxi</span>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-sm">
                Recibo Digital
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header del Ticket */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  N° de Pedido
                </p>
                <p className="mt-1 text-2xl font-black tracking-wider text-orange-600 font-mono">
                  {orderId}
                </p>
              </div>

              {/* Código QR Dinámico */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <div className="bg-white p-1 rounded-xl shadow-sm">
                  <QRCodeSVG
                    value={currentUrl || `https://hipermaxi.com/pedido/${orderId}`}
                    size={70}
                    level="M"
                  />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-800">QR de Verificación</p>
                  <p className="text-[10px] text-slate-400 max-w-[100px] leading-tight mt-0.5">
                    Escaneá para ver tu comprobante digital
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles de entrega */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Método de entrega:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {isPickup ? "🏪 Retiro en sucursal" : "🛵 Delivery a domicilio"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Sucursal asignada:</span>
                <p className="font-bold text-slate-800 mt-0.5">Juan de la Rosa (CBB)</p>
              </div>
            </div>

            {/* Lista de Productos Multimedia */}
            {items.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detalle del pedido ({items.length} {items.length === 1 ? "producto" : "productos"})
                </h3>
                <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
                  {items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3.5 p-3.5">
                      {item.imageUrl && (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {item.brand && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            {item.brand}
                          </span>
                        )}
                        <p className="truncate text-xs font-bold text-slate-800">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-400">
                          Cantidad: <span className="font-semibold text-slate-700">{item.quantity}</span> &middot; Bs {item.unitPrice.toFixed(2)} c/u
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-extrabold text-slate-900">
                        Bs {(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resumen de Pago */}
            <div className="border-t border-dashed border-slate-200 pt-4 space-y-2 text-xs">
              {parsedTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Monto Total</span>
                  <span className="font-bold text-slate-900 text-sm">Bs {parsedTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Estado del pago</span>
                <span className="font-semibold text-emerald-600">Pendiente al recibir</span>
              </div>
            </div>

            {/* Código de barras decorativo tipo ticket */}
            <div className="border-t border-slate-100 pt-6 text-center">
              <div className="mx-auto flex h-10 w-48 justify-between opacity-40">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-900"
                    style={{ width: `${(i % 3) + 1}px` }}
                  />
                ))}
              </div>
              <p className="mt-1 font-mono text-[10px] tracking-widest text-slate-400 uppercase">
                {orderId}
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════ ACCIONES E INTERACTIVIDAD ════════════════════════════ */}
        <div className="no-print mt-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Botón WhatsApp */}
            <a
              href={`https://wa.me/59171234567?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001l-1.416 5.17 5.293-1.388a9.945 9.945 0 0 0 4.777 1.222h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.668-1.037-5.176-2.924-7.062a9.92 9.92 0 0 0-7.058-2.945zm5.727 14.195c-.244.688-1.42 1.314-1.966 1.396-.516.078-1.186.111-3.415-.812-2.853-1.181-4.689-4.084-4.832-4.275-.142-.191-1.161-1.545-1.161-2.947 0-1.402.735-2.093.996-2.361.261-.268.569-.335.759-.335.19 0 .379.002.545.01.176.008.414-.067.647.493.244.587.831 2.03.903 2.176.072.146.12.316.024.507-.096.191-.144.311-.286.48-.142.169-.299.378-.427.507-.142.144-.291.3-.125.586.166.286.737 1.216 1.583 1.97 1.088.97 2.006 1.272 2.291 1.415.286.144.452.12.619-.072.166-.192.712-.83.902-1.115.19-.286.379-.239.641-.144.261.095 1.662.784 1.947.927.285.144.475.215.546.335.071.12.071.698-.173 1.386z"/>
              </svg>
              Compartir por WhatsApp
            </a>

            {/* Botón Imprimir / PDF */}
            <button
              onClick={handlePrint}
              type="button"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 transition-all hover:border-orange-400 hover:text-orange-600 active:scale-95"
            >
              <svg className="size-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0h-4v4h8v-4z" />
              </svg>
              Descargar / Imprimir Comprobante
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopyLink}
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
            >
              {copied ? "✓ URL copiada al portapapeles" : "🔗 Copiar enlace directo a este recibo"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              Volver a la tienda para seguir comprando →
            </Link>
          </div>
        </div>

      </main>
    </>
  );
}
