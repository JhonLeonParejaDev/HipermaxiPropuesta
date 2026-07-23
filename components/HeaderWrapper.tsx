// ─── components/HeaderWrapper.tsx ────────────────────────────────────────────
// Server Component que lee la sesión y pasa el estado de auth al LayoutHeader.
// Permite mostrar "Mi cuenta" o "Iniciar sesión" según el usuario autenticado.
// ──────────────────────────────────────────────────────────────────────────────

import { getUser } from "@/lib/dal";
import LayoutHeader from "./LayoutHeader";

export default async function HeaderWrapper() {
  // getUser() es cacheado con React.cache() — cero queries extras
  const user = await getUser();

  return (
    <LayoutHeader
      isAuthenticated={!!user}
      userFullName={user?.fullName ?? null}
      userEmail={user?.email ?? null}
    />
  );
}
