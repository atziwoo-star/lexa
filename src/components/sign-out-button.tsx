"use client";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  return (
    <button
      className="text-sm text-neutral-600 underline transition-colors hover:text-foreground"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
    >
      Sign out
    </button>
  );
}
