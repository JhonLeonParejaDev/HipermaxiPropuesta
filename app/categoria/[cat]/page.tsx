// ─── app/categoria/[cat]/page.tsx ────────────────────────────────────────────
// Página de categoría — filtra el catálogo completo por category ID.
// En Next.js 16, params es una Promise → debe ser awaited.
// ──────────────────────────────────────────────────────────────────────────────

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, ALL_PRODUCTS } from "@/lib/data";
import CategoryPageClient from "@/components/CategoryPageClient";

// ─── generateStaticParams ─────────────────────────────────────────────────────

export function generateStaticParams() {
  // Los slugs de URL usados en el nav deben coincidir con CATEGORIES[].id
  // También soportamos los alias de URL (frutas-verduras → frutas, abarrotes → supermercado, etc.)
  const directIds = CATEGORIES.map((c) => ({ cat: c.id }));
  // Alias para los slugs que el nav usa con guión o sinónimos
  const aliases = [
    { cat: "frutas-verduras" },
    { cat: "abarrotes" },
    { cat: "supermercado" },
  ];
  return [...directIds, ...aliases];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normaliza el slug de URL al category id interno */
function resolveCategory(cat: string) {
  const normalized = cat.toLowerCase();
  if (normalized === "frutas-verduras") return "frutas";
  if (normalized === "abarrotes" || normalized === "supermercado") return "supermercado";
  return normalized;
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cat: string }>;
}): Promise<Metadata> {
  const { cat } = await params;
  const categoryId = resolveCategory(cat);
  const category = CATEGORIES.find((c) => c.id === categoryId);

  if (!category) return { title: "Categoría | Hipermaxi" };

  return {
    title: `${category.label} | Hipermaxi Juan de la Rosa`,
    description: `Comprá ${category.label} en Hipermaxi Juan de la Rosa, Cochabamba. Los mejores precios del mercado.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;
  const categoryId = resolveCategory(cat);
  const category = CATEGORIES.find((c) => c.id === categoryId);

  // Si no existe la categoría → 404
  if (!category) notFound();

  const products = ALL_PRODUCTS.filter((p) => p.category === categoryId);

  return (
    <main
      id="main-content"
      className="flex-1 bg-zinc-100"
      aria-label={`Categoría: ${category.label}`}
    >
      <CategoryPageClient category={category} products={products} />
    </main>
  );
}
