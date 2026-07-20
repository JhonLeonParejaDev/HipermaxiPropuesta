// ─── components/VirtualTour.tsx ────────────────────────────────────────────────
// Sección "Visita Hipermaxi virtualmente" con visor 3D embebido.
// ──────────────────────────────────────────────────────────────────────────────
//
// ► PARA CAMBIAR EL TOUR: Reemplaza la src del <iframe> en el bloque "Visor 3D".
//   Sketchfab  : "https://sketchfab.com/models/TU_MODELO_ID/embed?autostart=1&navigation=fps&ui_theme=dark"
//   Matterport : "https://my.matterport.com/show/?m=TU_MODELO_ID"
//
// ──────────────────────────────────────────────────────────────────────────────

// ─── Iconos inline ─────────────────────────────────────────────────────────────

function IconPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function Icon360({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.5 12c0 5.247-4.253 9.5-9.5 9.5S2.5 17.247 2.5 12 6.753 2.5 12 2.5 21.5 6.753 21.5 12z" />
      <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" />
      <path d="M2.5 12H5M19 12h2.5" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// ─── Chips de características ─────────────────────────────────────────────────

const FEATURES = [
  { Icon: Icon360, label: "Vista 360°" },
  { Icon: IconPin, label: "Navegación libre" },
  { Icon: IconSearch, label: "Explora pasillos" },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function VirtualTour() {
  return (
    <section
      id="tour-virtual"
      aria-labelledby="virtual-tour-heading"
      className="bg-gradient-to-b from-zinc-100 to-orange-50 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Encabezado ── */}
        <div className="mb-10 text-center">

          {/* Eyebrow badge */}
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
            <IconPin className="size-3.5" />
            Tour Interactivo
          </span>

          {/* Título H2 */}
          <h2
            id="virtual-tour-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-800 sm:text-4xl lg:text-5xl"
          >
            Visita{" "}
            <span className="text-orange-500">Hipermaxi</span>{" "}
            virtualmente
          </h2>

          {/* Subtítulo */}
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-500 sm:text-lg">
            Recorre nuestros pasillos, conoce la distribución de secciones y
            descubre todo lo que tenemos para vos — sin salir de casa.
          </p>

          {/* Feature chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {FEATURES.map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1 text-sm font-medium text-zinc-600 shadow-sm"
              >
                <Icon className="size-4 text-orange-400" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Visor 3D ── */}
        <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-zinc-200">

          {/* Barra decorativa estilo navegador */}
          <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2.5">
            <span className="size-3 rounded-full bg-red-400" aria-hidden="true" />
            <span className="size-3 rounded-full bg-yellow-400" aria-hidden="true" />
            <span className="size-3 rounded-full bg-green-400" aria-hidden="true" />
            <span className="ml-4 flex-1 truncate rounded-md bg-zinc-700 px-3 py-1 text-xs text-zinc-400">
              🔒 hipermaxi.com — Tour Virtual 3D
            </span>
          </div>

          {/* Iframe 16:9 — Sketchfab modelo 3D con navegación FPS (WASD) */}
          <div className="relative w-full aspect-video bg-zinc-900">
            <iframe
              title="Chicken Gun Supermarket"
              className="absolute top-0 left-0 w-full h-full border-0 shadow-inner rounded-xl"
              src="https://sketchfab.com/models/be27616f58024926b1b3f55dc00afd43/embed?autostart=1&navigation=fps&ui_theme=dark"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
            />
          </div>
        </div>

        {/* ── CTA Google Maps ── */}
        <p className="mt-6 text-center text-sm text-zinc-400">
          ¿Preferís venir en persona?{" "}
          <a
            href="https://maps.google.com/?q=Hipermaxi+Juan+de+la+Rosa+Cochabamba"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-orange-500 underline underline-offset-4 hover:text-orange-600"
          >
            Ver en Google Maps →
          </a>
        </p>

      </div>
    </section>
  );
}
