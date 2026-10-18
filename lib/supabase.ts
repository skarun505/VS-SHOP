import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mdattxewghzooverrrxe.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYXR0eGV3Z2h6b292ZXJycnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDY2NTEsImV4cCI6MjEwNzgyMjY1MX0.qN0aCh6Zf6AMRL0MW6x0DoionXvP8S7D0DK6xe_DM-M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
