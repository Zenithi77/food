import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as { supabase?: SupabaseClient };

export function getSupabase(): SupabaseClient {
  if (globalForSupabase.supabase) return globalForSupabase.supabase;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase тохиргоо дутуу байна. .env файлд SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY утгуудыг оруулна уу. Заавар: SUPABASE_SETUP.md"
    );
  }

  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForSupabase.supabase = client;
  }
  return client;
}
