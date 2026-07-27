// ─── app/pedido/[id]/page.tsx ─────────────────────────────────────────────────
// Página de confirmación de pedido — se muestra después de hacer checkout.
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import OrderConfirmationClient from "@/components/OrderConfirmationClient";

export const metadata: Metadata = {
  title: "¡Pedido confirmado! | Hipermaxi",
  description: "Tu pedido en Hipermaxi ha sido recibido correctamente. Revisa tu recibo digital.",
};

interface OrderConfirmationProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    total?: string;
    items?: string;
    type?: string;
    itemsJson?: string;
  }>;
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationProps) {
  const { id } = await params;
  const { total, items, type, itemsJson } = await searchParams;

  return (
    <OrderConfirmationClient
      orderId={id}
      total={total}
      itemsCount={items}
      deliveryType={type}
      itemsJson={itemsJson}
    />
  );
}
