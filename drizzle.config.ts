import type { Config } from "drizzle-kit";

// drizzle-kit no carga .env.local automáticamente — lo hacemos manualmente
import { config } from "dotenv";
config({ path: ".env.local" });

const connectionUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionUrl) {
  throw new Error(
    "DATABASE_URL no está definido. Verificá que .env.local existe y tiene DATABASE_URL."
  );
}

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
    ssl: true,
  },
  verbose: true,
  strict: false, // false en push para no pedir confirmación interactiva
} satisfies Config;
