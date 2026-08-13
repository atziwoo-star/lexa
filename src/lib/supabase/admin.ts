import { createClient } from "@supabase/supabase-js";

// Service-role client — server-only, never import this from client components.
// Used for admin actions Supabase's normal (RLS-scoped) client can't do, like
// inviteUserByEmail.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
