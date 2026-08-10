import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key: bypasses Row Level
// Security, so it can see every user's cards and look up their emails.
// Never import this from a client component or expose the key to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
