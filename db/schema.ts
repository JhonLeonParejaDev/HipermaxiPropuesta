// ─── db/schema.ts ─────────────────────────────────────────────────────────────
// Schema completo de Hipermaxi — definido con Drizzle ORM.
// Tablas: users, profiles, categories, products, orders, order_items
//
// Para aplicar al proyecto Supabase:
//   npx drizzle-kit push
//
// Para generar archivos de migración:
//   npx drizzle-kit generate
// ──────────────────────────────────────────────────────────────────────────────

import {
  pgTable,
  text,
  uuid,
  numeric,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["customer", "admin", "staff"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const unitEnum = pgEnum("unit_type", ["kg", "l", "g", "u", "pack"]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  hashedPassword: text("hashed_password").notNull(),
  role: userRoleEnum("role").default("customer").notNull(),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),
  fullName: text("full_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: text("id").primaryKey(), // ej: "supermercado", "farmacia"
  label: text("label").notNull(),
  href: text("href").notNull(),
  icon: text("icon").notNull(),          // emoji
  color: text("color").notNull(),        // Tailwind bg token
  accentColor: text("accent_color").notNull(), // Tailwind text token
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description"),

  // Precios en bolivianos (2 decimales)
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  discountPercent: integer("discount_percent"),

  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),

  categoryId: text("category_id")
    .references(() => categories.id)
    .notNull(),

  unit: unitEnum("unit").default("u"),

  // Stock — entero (para productos pesados: en gramos o ml)
  stock: integer("stock").default(0).notNull(),

  isActive: boolean("is_active").default(true).notNull(),
  isNew: boolean("is_new").default(false),
  badge: text("badge"), // "Nuevo", "Fit & Light", "Fresco", etc.

  // Full-text search vector (actualizado por trigger en Supabase)
  // searchVector: sql<string>`tsvector`, -- se agrega via migration raw SQL

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  // null si es invitado
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

  // Para compras de invitado (del AuthGateModal)
  guestEmail: text("guest_email"),

  status: orderStatusEnum("status").default("pending").notNull(),

  // Total calculado y CONGELADO al momento de crear la orden
  // (no se recalcula si los precios cambian después)
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),

  // Notas y dirección de entrega
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Order Items ──────────────────────────────────────────────────────────────

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "restrict" })
    .notNull(),
  quantity: integer("quantity").notNull(),

  // CRÍTICO: precio congelado al momento de la compra.
  // Aunque el precio del producto cambie, el historial queda intacto.
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),

  // Snapshot del nombre por si el producto se elimina
  productNameSnapshot: text("product_name_snapshot").notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.id] }),
  orders: many(orders),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ─── Inferred Types ───────────────────────────────────────────────────────────
// Útiles para pasar a componentes sin importar el schema completo

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
