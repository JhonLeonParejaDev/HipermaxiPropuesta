// ─── app/mi-cuenta/page.tsx ───────────────────────────────────────────────────
// Dashboard del usuario autenticado.
// Server Component — accede directamente a la BD via DAL.
// El middleware ya garantiza que solo usuarios autenticados llegan aquí.
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Mi cuenta | Hipermaxi",
  description: "Gestioná tus datos, pedidos y preferencias en Hipermaxi.",
};

export default async function MiCuentaPage() {
  // getUser() usa React.cache() — no hace múltiples queries si se llama en
  // varios Server Components del mismo render tree.
  const user = await getUser();

  // Double-check en caso de que el middleware no haya redirigido
  // (por ejemplo si las variables de entorno no están configuradas)
  if (!user) {
    redirect("/login?redirect=/mi-cuenta");
  }

  const initials = user.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  const memberSince = new Intl.DateTimeFormat("es-BO", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">

      {/* ── Header ── */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-bold text-white shadow-md shadow-orange-200">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {user.fullName ?? "Mi cuenta"}
          </h1>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="text-xs text-slate-400">Miembro desde {memberSince}</p>
        </div>
      </div>

      {/* ── Tarjetas de sección ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <SectionCard
          href="/mi-cuenta/pedidos"
          icon="📦"
          title="Mis pedidos"
          description="Seguí el estado de tus compras y revisá el historial"
        />
        <SectionCard
          href="/mi-cuenta/datos"
          icon="👤"
          title="Mis datos"
          description="Actualizá tu nombre, teléfono y dirección de entrega"
        />
        <SectionCard
          href="/mi-cuenta/favoritos"
          icon="❤️"
          title="Favoritos"
          description="Los productos que guardaste para comprar después"
        />
        <SectionCard
          href="/mi-cuenta/seguridad"
          icon="🔒"
          title="Seguridad"
          description="Cambiá tu contraseña y configurá opciones de acceso"
        />
      </div>

      {/* ── Logout ── */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-red-600"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
    >
      <span className="mt-0.5 text-2xl" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-orange-600">
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-slate-500">{description}</p>
      </div>
      <svg className="ml-auto mt-1 size-4 shrink-0 text-slate-300 transition-colors group-hover:text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
