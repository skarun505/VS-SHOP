import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://mdattxewghzooverrrxe.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYXR0eGV3Z2h6b292ZXJycnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDY2NTEsImV4cCI6MjEwNzgyMjY1MX0.qN0aCh6Zf6AMRL0MW6x0DoionXvP8S7D0DK6xe_DM-M";

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const url = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : DEFAULT_URL;

  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim() || DEFAULT_ANON_KEY;

  cachedClient = createClient(url, key);
  return cachedClient;
}

// Proxy wrapper for backwards-compatibility with direct `supabase.` calls
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
