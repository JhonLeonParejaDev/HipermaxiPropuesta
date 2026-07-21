// ─── app/login/page.tsx ───────────────────────────────────────────────────────
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Iniciar sesión | Hipermaxi",
  description: "Accedé a tu cuenta Hipermaxi para ver tus pedidos y disfrutar de ofertas exclusivas.",
};

export default function LoginPage() {
  // Suspense requerido porque LoginClient usa useSearchParams()
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
