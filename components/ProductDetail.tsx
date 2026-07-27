"use client";
// ─── components/ProductDetail.tsx ─────────────────────────────────────────────
// UI rica de la página de detalle de producto:
//   · Imagen con zoom suave al hover
//   · Selector de cantidad + botón "Agregar al carrito"
//   · Breadcrumb, badges, precio con descuento
//   · Productos relacionados
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/components/types/product";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ToastProvider";

// ─── Utilidades ───────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return `Bs ${n.toFixed(2)}`;
}

const BADGE_STYLES: Record<string, string> = {
  "Nuevo":       "bg-emerald-500 text-white",
  "Oferta":      "bg-red-500 text-white",
  "Fit & Light": "bg-sky-500 text-white",
  "Fresco":      "bg-lime-500 text-white",
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconMinus() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" d="M5 12h14" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconCart() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8l-1 5h11m-9-2a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg className="size-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ product }: { product: Product }) {
  const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);
  return (
    <nav aria-label="Miga de pan" className="mb-6 flex items-center gap-1.5 text-xs text-slate-500">
      <Link href="/" className="transition-colors hover:text-orange-500">Inicio</Link>
      <IconChevronRight />
      <Link href={`/categoria/${product.category}`} className="transition-colors hover:text-orange-500">
        {categoryLabel}
      </Link>
      <IconChevronRight />
      <span className="text-slate-800 font-medium" aria-current="page">{product.name}</span>
    </nav>
  );
}

// ─── Quantity Selector ────────────────────────────────────────────────────────

function QuantitySelector({
  value,
  onChange,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Reducir cantidad"
        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconMinus />
      </button>
      <span
        aria-label={`Cantidad: ${value}`}
        className="w-10 text-center text-lg font-bold tabular-nums text-slate-800"
      >
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconPlus />
      </button>
    </div>
  );
}

// ─── Related Product Card ─────────────────────────────────────────────────────

function RelatedCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-100 transition-all duration-200 hover:shadow-md hover:ring-slate-200"
      aria-label={product.name}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {product.discountPercent && (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{product.discountPercent}%
          </span>
        )}
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{product.brand}</p>
        <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-slate-800">{product.name}</p>
        <p className="mt-1.5 text-sm font-extrabold text-slate-900">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

// ─── Main ProductDetail ────────────────────────────────────────────────────────

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const badgeText = product.isNew ? "Nuevo" : product.badge ?? null;
  const badgeStyle = badgeText ? (BADGE_STYLES[badgeText] ?? "bg-slate-700 text-white") : null;

  const handleAddToCart = async () => {
    if (adding || !product.inStock) return;
    setAdding(true);
    // Agrega qty unidades al carrito
    for (let i = 0; i < qty; i++) {
      addItem(product);
    }
    await new Promise((r) => setTimeout(r, 300));
    showToast(
      `${qty > 1 ? `${qty}x ` : ""}${product.name} agregado${qty > 1 ? "s" : ""} al carrito`,
      "success"
    );
    setAdding(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const productUrl = `${window.location.origin}/productos/${product.slug}`;
    const shareData = {
      title: `Hipermaxi - ${product.name}`,
      text: `¡Mira este producto que encontré en Hipermaxi: ${product.name}!`,
      url: productUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Interacción cancelada o error al compartir:", err);
      }
    } else {
      await navigator.clipboard.writeText(productUrl);
      showToast("Enlace copiado al portapapeles", "info");
    }
  };

  const savings = product.originalPrice
    ? product.originalPrice * qty - product.price * qty
    : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Breadcrumb ── */}
      <Breadcrumb product={product} />

      {/* ── Layout principal: Imagen | Info ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

        {/* ── Columna izquierda: Imagen ── */}
        <div className="relative">
          <div className="sticky top-24">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
              {/* Skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-slate-200" />
              )}
              {/* Badge sobre imagen */}
              {badgeText && (
                <div
                  className={`absolute left-4 top-4 z-10 rounded-lg px-2.5 py-1 text-xs font-bold ${badgeStyle}`}
                >
                  {badgeText}
                </div>
              )}
              {/* Badge descuento */}
              {product.discountPercent && (
                <div className="absolute right-4 top-4 z-10 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                  -{product.discountPercent}% OFF
                </div>
              )}
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-cover transition-all duration-700 hover:scale-[1.03] ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                priority
                quality={90}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>
        </div>

        {/* ── Columna derecha: Info ── */}
        <div className="flex flex-col">
          {/* Marca */}
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            {product.brand}
          </p>

          {/* Nombre & Botón Compartir */}
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
              {product.name}
            </h1>
            <button
              onClick={handleShare}
              aria-label="Compartir producto"
              className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-slate-100 p-2.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-blue-600"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>

          {/* Precio */}
          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="mb-0.5 text-lg text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.discountPercent && (
              <span className="mb-0.5 rounded-lg bg-red-50 px-2 py-0.5 text-sm font-bold text-red-600">
                -{product.discountPercent}%
              </span>
            )}
          </div>

          {/* Ahorro */}
          {savings > 0 && (
            <p className="mt-1 text-sm font-medium text-emerald-600">
              Ahorrás {formatPrice(savings)} en esta compra
            </p>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-slate-100" />

          {/* Descripción */}
          {product.description && (
            <p className="text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          )}

          {/* Stock status */}
          <div className="mt-4 flex items-center gap-2">
            <div
              className={`size-2.5 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-400"}`}
              aria-hidden="true"
            />
            <span className={`text-sm font-medium ${product.inStock ? "text-emerald-700" : "text-red-600"}`}>
              {product.inStock ? "En stock · Disponible hoy" : "Sin stock"}
            </span>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-100" />

          {/* Selector de cantidad */}
          {product.inStock && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cantidad
                </label>
                <QuantitySelector value={qty} onChange={setQty} />
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Subtotal ({qty} {qty === 1 ? "unidad" : "unidades"})</span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatPrice(product.price * qty)}
                </span>
              </div>

              {/* Botón principal */}
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-orange-500 px-6 py-4 text-base font-bold text-white shadow-md shadow-orange-200 transition-all duration-200 hover:bg-orange-600 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
              >
                <IconCart />
                {adding ? "Agregando…" : "Agregar al carrito"}
              </button>

              {/* Nota de envío */}
              <p className="text-center text-xs text-slate-400">
                🚚 Envío disponible · Calculado al finalizar la compra
              </p>
            </div>
          )}

          {/* Sin stock */}
          {!product.inStock && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-sm font-semibold text-red-700">Producto temporalmente sin stock</p>
              <p className="mt-1 text-xs text-red-500">Podés contactarnos por WhatsApp para consultar disponibilidad.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Productos relacionados ── */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="related-heading" className="text-lg font-bold text-slate-800">
              También te puede gustar
            </h2>
            <Link
              href={`/categoria/${product.category}`}
              className="text-sm font-medium text-orange-500 transition-colors hover:text-orange-600"
            >
              Ver categoría →
            </Link>
          </div>
          <ul
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5"
            role="list"
          >
            {related.map((p) => (
              <li key={p.id} role="listitem">
                <RelatedCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
