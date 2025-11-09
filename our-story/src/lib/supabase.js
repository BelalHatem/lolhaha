// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

// Use the Service Role for serverless API routes (do NOT expose in client)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);
