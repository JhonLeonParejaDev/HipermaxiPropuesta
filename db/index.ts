// ─── db/index.ts ──────────────────────────────────────────────────────────────
// Conexión a PostgreSQL (Supabase) via Drizzle ORM.
// Se usa "server-only" para garantizar que este módulo nunca llegue al cliente.
//
// NOTA: Si DATABASE_URL no está configurado (antes de tener Supabase),
// las Server Actions que importen db simplemente fallarán en runtime —
// no hay error en build time.
// ──────────────────────────────────────────────────────────────────────────────

import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Validar que la variable de entorno esté definida
if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL no está configurado. " +
    "Copia .env.local.example a .env.local y completa las credenciales de Supabase."
  );
}

// En Next.js (especialmente en desarrollo con HMR), el módulo se recarga
// frecuentemente. Usamos una variable global para reutilizar la conexión
// y evitar crear demasiadas conexiones al pool de PostgreSQL.
const globalForDb = globalThis as unknown as {
  _postgresClient: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb._postgresClient ??
  postgres(process.env.DATABASE_URL!, {
    // SSL requerido por Supabase para conexiones remotas
    ssl: "require",
    // pgbouncer en modo transacción: prepare=false es obligatorio
    prepare: false,
    max: 10,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._postgresClient = client;
}

export const db = drizzle(client, { schema });

// Re-exportar el schema para conveniencia
export * from "./schema";
