// ─── app/registro/page.tsx ────────────────────────────────────────────────────
import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Crear cuenta | Hipermaxi",
  description: "Registrate en Hipermaxi para guardar tus pedidos y recibir ofertas exclusivas.",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterClient />
    </Suspense>
  );
}
