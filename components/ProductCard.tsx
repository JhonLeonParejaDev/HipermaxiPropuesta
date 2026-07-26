"use client";
// ─── ProductCard.tsx ──────────────────────────────────────────────────────────
// Individual product card. "use client" because of the interactive
// "Agregar al carrito" button state.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/components/types/product";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ToastProvider";

// ──── Utility: format Bolivian price ──────────────────────────────────────────
function formatPrice(price: number): string {
  return `Bs ${price.toFixed(2)}`;
}

// ──── Badge colours map ────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, string> = {
  "Fit & Light": "bg-emerald-500 text-white",
  Nuevo: "bg-blue-500 text-white",
  Fresco: "bg-amber-500 text-white",
  Oferta: "bg-red-500 text-white",
};

function getBadgeStyle(badge: string): string {
  return BADGE_STYLES[badge] ?? "bg-zinc-700 text-white";
}

// ──── Add-to-cart button ───────────────────────────────────────────────────────
// Receives the full product so it can dispatch to CartContext and show a toast.
function AddToCartButton({
  product,
}: {
  product: Product;
}) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleClick = () => {
    if (!product.inStock || added) return;
    addItem(product);
    showToast(`${product.name} agregado al carrito`, "success");
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (!product.inStock) {
    return (
      <div className="flex h-9 items-center justify-center rounded-xl border border-zinc-200 text-xs font-medium text-zinc-400">
        Sin stock
      </div>
    );
  }

  return (
    <button
      id={`add-to-cart-${product.id}`}
      onClick={handleClick}
      aria-label={added ? "Producto agregado" : "Agregar al carrito"}
      className={`
        relative flex h-9 w-full items-center justify-center gap-1.5 overflow-hidden
        rounded-xl text-xs font-semibold transition-all duration-200
        active:scale-95
        ${
          added
            ? "bg-emerald-500 text-white shadow-emerald-200 shadow-sm"
            : "bg-red-600 text-white shadow-red-100 shadow-sm hover:bg-red-700 hover:shadow-md hover:shadow-red-200"
        }
      `}
    >
      {added ? (
        <>
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          ¡Agregado!
        </>
      ) : (
        <>
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Agregar
        </>
      )}
    </button>
  );
}

// ──── Main ProductCard component ───────────────────────────────────────────────
interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasBadge = Boolean(product.badge || product.isNew);
  const badgeLabel = product.badge ?? (product.isNew ? "Nuevo" : null);

  return (
    <article
      aria-label={product.name}
      className="
        group relative flex flex-col overflow-hidden rounded-2xl
        bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]
        ring-1 ring-zinc-100
        transition-all duration-300
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-0.5
      "
    >
      {/* ── Discount badge ── */}
      {product.discountPercent && product.discountPercent > 0 ? (
        <div
          className="absolute right-3 top-3 z-10 flex items-center justify-center rounded-lg bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow"
          aria-label={`${product.discountPercent}% de descuento`}
        >
          -{product.discountPercent}%
        </div>
      ) : null}

      {/* ── Category badge (Nuevo / Fit & Light / etc.) ── */}
      {hasBadge && badgeLabel ? (
        <div
          className={`absolute left-3 top-3 z-10 rounded-lg px-2 py-0.5 text-[10px] font-bold shadow ${getBadgeStyle(badgeLabel)}`}
        >
          {badgeLabel}
        </div>
      ) : null}

      {/* ── Product image — fixed 1:1 square ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          quality={75}
        />
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Brand */}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          {product.brand}
        </span>

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-800">
          {product.name}
        </h3>

        {/* Unit tag */}
        {product.unit ? (
          <span className="text-[10px] text-zinc-400">
            por {product.unit}
          </span>
        ) : null}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className="flex items-end gap-2">
          <span className="text-base font-extrabold leading-none text-zinc-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice ? (
            <span className="text-xs font-medium leading-none text-zinc-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
        </div>

        {/* CTA */}
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}

// ──── Skeleton variant (Suspense / lazy-load placeholder) ──────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">
      <div className="aspect-square w-full animate-pulse bg-zinc-100" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-2.5 w-16 animate-pulse rounded-full bg-zinc-100" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-zinc-100" />
        <div className="mt-1 h-5 w-20 animate-pulse rounded-lg bg-zinc-100" />
        <div className="mt-1 h-9 w-full animate-pulse rounded-xl bg-zinc-100" />
      </div>
    </div>
  );
}
