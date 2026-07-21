"use client";
// ─── components/CartDrawer.tsx ────────────────────────────────────────────────
// Drawer lateral del carrito — desliza desde la derecha.
// Se abre al pulsar el botón del carrito en el header.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import AuthGateModal from "@/components/AuthGateModal";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconClose() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" d="M5 12h14" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg className="size-12 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8l-1 5h11m-9-2a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, removeItem, incrementItem, decrementItem, clearCart } = useCart();
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const router = useRouter();

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Cuando el usuario resuelve la auth (o elige invitado), navegar al checkout
  const handleAuthResolved = (guestEmail?: string) => {
    setAuthGateOpen(false);
    onClose();
    const url = guestEmail
      ? `/checkout?guest=${encodeURIComponent(guestEmail)}`
      : "/checkout";
    router.push(url);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header del drawer ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Mi Carrito</h2>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-red-500"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
            >
              <IconClose />
            </button>
          </div>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Estado vacío */
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
              <IconCart />
              <div>
                <p className="text-base font-semibold text-slate-700">Tu carrito está vacío</p>
                <p className="mt-1 text-sm text-slate-400">Agregá productos para comenzar tu compra.</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
              >
                Ir a productos
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50 px-5 py-3">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-3 py-4">
                  {/* Imagen */}
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {product.brand}
                    </p>
                    <p className="line-clamp-2 text-xs font-semibold text-slate-800">
                      {product.name}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      {/* Precio */}
                      <span className="text-sm font-extrabold text-slate-900">
                        Bs {(product.price * quantity).toFixed(2)}
                      </span>

                      {/* Cantidad */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => decrementItem(product.id)}
                          aria-label="Reducir cantidad"
                          className="flex size-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:border-orange-300 hover:text-orange-600"
                        >
                          <IconMinus />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => incrementItem(product.id)}
                          aria-label="Aumentar cantidad"
                          className="flex size-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:border-orange-300 hover:text-orange-600"
                        >
                          <IconPlus />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeItem(product.id)}
                    aria-label={`Eliminar ${product.name}`}
                    className="self-start rounded-lg p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <IconTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer con totales y checkout ── */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 bg-white px-5 py-5">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>
              <span className="font-bold text-slate-900">Bs {totalPrice.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
              <span>Envío</span>
              <span className="font-medium text-emerald-600">Calculado al finalizar</span>
            </div>

            {/* CTA — abre el modal de auth en lugar de navegar directo */}
            <button
              onClick={() => setAuthGateOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-95"
            >
              Finalizar compra &middot; Bs {totalPrice.toFixed(2)}
            </button>

            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>

      {/* ── AuthGateModal — se abre al presionar "Finalizar compra" ── */}
      <AuthGateModal
        open={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        onContinueAsGuest={(email) => handleAuthResolved(email)}
        totalPrice={totalPrice}
      />
    </>
  );
}
