// ─── app/checkout/page.tsx ────────────────────────────────────────────────────
// Página de checkout — Server Component.
// Lee la sesión del servidor y pasa datos del usuario al CheckoutClient.
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { Suspense } from "react";
import { getUser } from "@/lib/dal";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Finalizar compra | Hipermaxi",
  description: "Completá tu pedido en Hipermaxi — ingresá tus datos de entrega y método de pago.",
};

interface CheckoutPageProps {
  searchParams: Promise<{ guest?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { guest } = await searchParams;
  const user = await getUser();

  return (
    <Suspense>
      <CheckoutClient
        userEmail={user?.email ?? null}
        userFullName={user?.fullName ?? null}
        userPhone={user?.phone ?? null}
        guestEmail={guest ?? null}
      />
    </Suspense>
  );
}
