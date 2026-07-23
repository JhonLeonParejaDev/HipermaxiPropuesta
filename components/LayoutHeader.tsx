"use client";
// ─── LayoutHeader.tsx ──────────────────────────────────────────────────────────
// Header con:
//   1. Top bar  : Logo real · Buscador (live search) · Sucursal · Auth + Carrito
//   2. Sub-nav  : Barra NARANJA con categorías + iconos + ítem activo resaltado
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import CartDrawer from "@/components/CartDrawer";
import { PRODUCT_SECTIONS } from "@/lib/data";
import { logout } from "@/app/actions/auth";
import type { Product } from "@/components/types/product";

// ─── Todos los productos (para búsqueda) ─────────────────────────────────────

const ALL_PRODUCTS: Product[] = PRODUCT_SECTIONS.flatMap((s) => s.products);

// ─── Nav categories con icono ─────────────────────────────────────────────────

const NAV_CATEGORIES = [
  { id: "abarrotes",  label: "Abarrotes",        href: "/categoria/abarrotes",        icon: "🛒" },
  { id: "bebidas",    label: "Bebidas",           href: "/categoria/bebidas",          icon: "🥤" },
  { id: "carnes",     label: "Carnes y Aves",     href: "/categoria/carnes",           icon: "🥩" },
  { id: "lacteos",    label: "Lácteos",           href: "/categoria/lacteos",          icon: "🥛" },
  { id: "frutas",     label: "Frutas y Verduras", href: "/categoria/frutas-verduras",  icon: "🥦" },
  { id: "panaderia",  label: "Panadería",         href: "/categoria/panaderia",        icon: "🥐" },
  { id: "limpieza",   label: "Limpieza",          href: "/categoria/limpieza",         icon: "🧹" },
  { id: "mascotas",   label: "Mascotas",          href: "/categoria/mascotas",         icon: "🐾" },
  { id: "farmacia",   label: "Farmacia",          href: "/categoria/farmacia",         icon: "💊" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path strokeLinecap="round" d="M15.5 15.5L20 20" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  );
}

function IconCart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8l-1 5h11m-9-2a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  );
}

// ─── Live Search Dropdown ─────────────────────────────────────────────────────

function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    const filtered = ALL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 6);
    setResults(filtered);
    setOpen(filtered.length > 0);
  }, [query]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <label htmlFor="site-search" className="sr-only">Buscar productos</label>
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <IconSearch className="size-4 text-slate-400" />
      </div>
      <input
        id="site-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Buscar productos, marcas o categorías…"
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition-all duration-150 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
      />

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
          <ul role="listbox" aria-label="Resultados de búsqueda">
            {results.map((p) => (
              <li key={p.id} role="option" aria-selected="false">
                <Link
                  href={`/productos/${p.slug}`}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-orange-50"
                  onClick={() => { setQuery(p.name); setOpen(false); }}
                >
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                    <Image src={p.imageUrl} alt={p.imageAlt} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.brand}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-orange-600">
                    Bs {p.price.toFixed(2)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-4 py-2 text-center">
            <button
              className="text-xs font-medium text-orange-500 hover:text-orange-600"
              onClick={() => setOpen(false)}
            >
              Ver todos los resultados para &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main LayoutHeader ────────────────────────────────────────────────────────

export default function LayoutHeader({
  isAuthenticated = false,
  userFullName = null,
  userEmail = null,
}: {
  isAuthenticated?: boolean;
  userFullName?: string | null;
  userEmail?: string | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const pathname = usePathname();

  // Detecta qué categoría está activa para resaltar en el nav
  const activeCategory = NAV_CATEGORIES.find((c) => pathname.startsWith(c.href))?.id ?? null;

  return (
    <>
      <header className="sticky top-0 z-40 flex flex-col shadow-[0_2px_20px_rgba(0,0,0,0.10)]">

        {/* ══ FILA 1: Top bar blanca ════════════════════════════════════════════ */}
        <div className="bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">

            {/* ── Logo Hipermaxi ── */}
            <Link href="/" aria-label="Hipermaxi — Inicio" className="flex-shrink-0">
              <Image
                src="/logo-hiper.png"
                alt="Hipermaxi"
                width={110}
                height={48}
                className="h-11 w-auto object-contain"
                priority
              />
            </Link>

            {/* ── Buscador ── */}
            <SearchBox />

            {/* ── Sucursal ── */}
            <button
              type="button"
              aria-label="Seleccionar sucursal"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-all duration-150 hover:border-orange-400 hover:text-orange-600 sm:flex"
            >
              <IconMapPin className="size-3.5 text-orange-500" />
              <span className="max-w-[120px] truncate">Sucursal</span>
              <svg className="size-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* ── Auth + Carrito ── */}
            <div className="flex flex-shrink-0 items-center gap-2">

              {/* Autenticado → avatar/nombre + acceso directo a Mi cuenta */}
              {isAuthenticated ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    href="/mi-cuenta"
                    className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-semibold text-orange-700 transition-all duration-150 hover:bg-orange-100"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {(userFullName ?? userEmail ?? "U")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                    <span className="max-w-[100px] truncate">
                      {userFullName ?? userEmail?.split("@")[0] ?? "Mi cuenta"}
                    </span>
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-500 transition-all duration-150 hover:border-slate-300 hover:text-slate-700"
                      aria-label="Cerrar sesión"
                    >
                      Salir
                    </button>
                  </form>
                </div>
              ) : (
                /* No autenticado → link a login */
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all duration-150 hover:border-orange-400 hover:text-orange-600 sm:flex"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Botón carrito */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`Carrito — ${totalItems} artículos`}
                className="relative flex items-center gap-2 rounded-lg bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-orange-600 active:scale-95"
              >
                <IconCart className="size-4 text-white" />
                <span className="hidden sm:block">Carrito</span>
                {totalItems > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-orange-600" aria-live="polite">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              {/* Hamburger — solo móvil */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={mobileMenuOpen}
                className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:bg-slate-50 lg:hidden"
              >
                {mobileMenuOpen ? (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ══ FILA 2: Sub-nav NARANJA con iconos ═══════════════════════════════ */}
        <nav
          aria-label="Categorías principales"
          className={`bg-orange-500 shadow-sm ${mobileMenuOpen ? "block" : "hidden lg:block"}`}
        >
          <ul
            className="mx-auto flex max-w-7xl items-center overflow-x-auto px-4 sm:px-6 lg:px-8"
            style={{ scrollbarWidth: "none" }}
          >
            {NAV_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <li key={cat.id} className="flex-shrink-0">
                  <Link
                    href={cat.href}
                    className={`
                      relative flex items-center gap-1.5 px-3.5 py-3 text-sm font-semibold transition-all duration-150
                      ${isActive
                        ? "text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-t-full after:bg-white"
                        : "text-orange-100 hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-left after:scale-x-0 after:rounded-t-full after:bg-white/70 after:transition-transform after:duration-200 hover:after:scale-x-100"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="text-base leading-none" aria-hidden="true">{cat.icon}</span>
                    <span className="hidden sm:block">{cat.label}</span>
                    <span className="sm:hidden text-xs">{cat.label.split(" ")[0]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

      </header>

      {/* CartDrawer — fuera del header para evitar z-index issues */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} isAuthenticated={isAuthenticated} />
    </>
  );
}
