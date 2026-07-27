"use server";
// ─── app/actions/order.ts ─────────────────────────────────────────────────────
// Server Action para crear pedidos — mock por ahora (sin BD).
// El pedido se valida, se genera un ID único y se simula el guardado.
// TODO: Conectar con supabaseAdmin.from('orders').insert() cuando se requiera.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { redirect } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderFormState {
  errors?: {
    fullName?: string[];
    phone?: string[];
    zona?: string[];
    address?: string[];
    email?: string[];
  };
  message?: string;
  orderId?: string;
  total?: string;
  itemsCount?: number;
  deliveryType?: string;
}

// ─── Schema de validación ─────────────────────────────────────────────────────

const OrderSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100),
  phone: z
    .string()
    .min(7, { message: "Ingresá un número de teléfono válido" })
    .regex(/^[\d\s\+\-\(\)]+$/, { message: "Solo números, +, - y espacios" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  deliveryType: z.enum(["delivery", "pickup"]),
  zona: z.string().optional(),
  address: z.string().optional(),
  reference: z.string().optional(),
  horario: z.string().optional(),
  paymentMethod: z.enum(["cash", "qr", "transfer"]),
  notes: z.string().max(500).optional(),
  subtotal: z.string(),
  shippingCost: z.string(),
  total: z.string(),
  items: z.string(), // JSON string de los items
}).superRefine((data, ctx) => {
  // Si es delivery, zona y address son requeridos
  if (data.deliveryType === "delivery") {
    if (!data.zona) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccioná tu zona",
        path: ["zona"],
      });
    }
    if (!data.address || data.address.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresá tu dirección completa",
        path: ["address"],
      });
    }
  }
});

// ─── Server Action ────────────────────────────────────────────────────────────

export async function placeOrder(
  _prevState: OrderFormState | undefined,
  formData: FormData
): Promise<OrderFormState> {
  // 1. Validar
  const validated = OrderSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    deliveryType: formData.get("deliveryType"),
    zona: formData.get("zona"),
    address: formData.get("address"),
    reference: formData.get("reference"),
    horario: formData.get("horario"),
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes"),
    subtotal: formData.get("subtotal"),
    shippingCost: formData.get("shippingCost"),
    total: formData.get("total"),
    items: formData.get("items"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  // 2. Generar ID de pedido único (mock — en producción viene de la BD)
  const orderId = `HM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // 3. Log del pedido (en producción: guardar en supabase)
  console.log(`[placeOrder] ✅ Pedido creado: ${orderId}`, {
    customer: data.fullName,
    phone: data.phone,
    deliveryType: data.deliveryType,
    zona: data.zona,
    address: data.address,
    payment: data.paymentMethod,
    total: data.total,
    horario: data.horario,
  });

  // 4. TODO: Guardar en BD cuando se conecte
  // const { error } = await supabaseAdmin.from('orders').insert({
  //   guest_email: data.email || null,
  //   status: 'pending',
  //   subtotal: parseFloat(data.subtotal),
  //   shipping_cost: parseFloat(data.shippingCost),
  //   total: parseFloat(data.total),
  //   delivery_address: data.address ? `${data.zona} — ${data.address}${data.reference ? `. Ref: ${data.reference}` : ''}` : null,
  //   notes: [data.notes, `Pago: ${data.paymentMethod}`, `Horario: ${data.horario}`].filter(Boolean).join(' | '),
  // });

  // 5. Redirigir a página de confirmación — devolvemos los datos del pedido para que
  //    el cliente haga la navegación (useEffect en CheckoutClient)
  let itemsCount = 0;
  try {
    itemsCount = JSON.parse(data.items || "[]").length;
  } catch {
    itemsCount = 0;
  }

  return {
    orderId,
    total: data.total,
    itemsCount,
    deliveryType: data.deliveryType,
  };
}
