// ─── app/page.tsx ─────────────────────────────────────────────────────────────
// Home page — estructura fiel al wireframe:
//   1. HeroBanner  : Carrusel dentro del contenedor central
//   2. CatalogLayout : Sidebar (Filtro) + Banner multimedia + Grid de productos
// ──────────────────────────────────────────────────────────────────────────────

import HeroBanner from "@/components/HeroBanner";
import CatalogLayout from "@/components/CatalogLayout";
import VirtualTour from "@/components/VirtualTour";

export default function HomePage() {
  return (
    <main id="main-content" className="flex-1 bg-zinc-100">
      {/* Carrusel — dentro del contenedor max-w-7xl, NO full-width */}
      <HeroBanner />

      {/* Catálogo: sidebar de filtros + banner multimedia + grid de productos */}
      <CatalogLayout />

      {/* Tour Virtual 3D — se muestra justo antes del Footer */}
      <VirtualTour />
    </main>
  );
}
