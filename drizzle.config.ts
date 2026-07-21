import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// Cargar .env.local explícitamente para que drizzle-kit lo encuentre
config({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurado en .env.local");
}

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: false,
} satisfies Config;
