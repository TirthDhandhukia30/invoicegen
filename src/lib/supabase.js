import { createClient } from "@supabase/supabase-js";

// Using hardcoded Supabase credentials as per requirement
export const supabase = createClient(
  "https://trkkqexrwbcelpkiweco.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya2txZXhyd2JjZWxwa2l3ZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjIwNzcsImV4cCI6MjA3NjEzODA3N30.g2HTuFRkhNnxjRI8uu3c_eL2SCEFnvNX-WmPrLx5MgE",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
