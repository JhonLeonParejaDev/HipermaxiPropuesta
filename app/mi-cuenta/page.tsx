// ─── app/mi-cuenta/page.tsx ───────────────────────────────────────────────────
// Dashboard del usuario autenticado — Versión modernizada con componente cliente.
// Server Component — accede directamente a la BD via DAL.
// El middleware ya garantiza que solo usuarios autenticados llegan aquí.
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import ProfilePageClient from "@/components/ProfilePageClient";

export const metadata: Metadata = {
  title: "Mi cuenta | Hipermaxi",
  description: "Gestioná tus datos, pedidos, favoritos y logros en Hipermaxi.",
};

export default async function MiCuentaPage() {
  // getUser() usa React.cache() — no hace múltiples queries si se llama en
  // varios Server Components del mismo render tree.
  const user = await getUser();

  // Double-check en caso de que el middleware no haya redirigido
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
    <ProfilePageClient
      initials={initials}
      fullName={user.fullName ?? null}
      email={user.email}
      memberSince={memberSince}
    />
  );
}
