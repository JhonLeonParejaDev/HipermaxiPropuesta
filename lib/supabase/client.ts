// ─── lib/supabase/client.ts ───────────────────────────────────────────────────
// Cliente Supabase del lado del navegador — usa la anon key pública.
// Para queries del cliente que respetan RLS (Row Level Security).
// ──────────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
