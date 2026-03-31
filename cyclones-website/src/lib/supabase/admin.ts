import { createClient } from "@supabase/supabase-js";

/**
 * Service role client — bypasses Row Level Security.
 * ONLY use this server-side inside API route handlers. Never expose to the client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
