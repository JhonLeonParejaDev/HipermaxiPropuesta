// ─── lib/supabase/admin.ts ────────────────────────────────────────────────────
// Cliente Supabase con service role key — bypasea RLS, solo para el servidor.
// Usar para operaciones que requieren acceso total: insertar usuarios, queries admin.
// ──────────────────────────────────────────────────────────────────────────────

import "server-only";
import { createClient } from "@supabase/supabase-js";

function validateEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configurados en .env.local"
    );
  }
  return { url, key };
}

/**
 * Crea un cliente admin de Supabase con la service role key.
 * Se crea en cada llamada (los clientes son stateless y livianos).
 */
export function createAdminClient() {
  const { url, key } = validateEnv();
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Alias conveniente para uso directo
export const supabaseAdmin = createAdminClient();
