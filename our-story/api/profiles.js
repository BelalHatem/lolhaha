// api/profiles.js
import { supabaseAdmin } from "../src/lib/supabase.js";

/**
 * Routes:
 * GET    /api/profiles                     -> { profiles: [{ name }] }
 * POST   /api/profiles { name, password }  -> { ok: true } or { error }
 * DELETE /api/profiles { name, password }  -> { ok: true } or { error }
 */
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("name")
        .order("name", { ascending: true });

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ profiles: data || [] });
    }

    if (req.method === "POST") {
      const { name, password } = req.body || {};
      if (!name || !password) {
        return res.status(400).json({ error: "Name and password are required." });
      }

      // Ensure unique name
      const { data: exists, error: checkErr } = await supabaseAdmin
        .from("profiles")
        .select("name")
        .eq("name", name)
        .maybeSingle();

      if (checkErr) return res.status(400).json({ error: checkErr.message });
      if (exists) return res.status(400).json({ error: "Profile name already exists." });

      const { error: insErr } = await supabaseAdmin
        .from("profiles")
        .insert([{ name, password }]); // (Optional) hash password later

      if (insErr) return res.status(400).json({ error: insErr.message });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const { name, password } = req.body || {};
      if (!name || !password) {
        return res.status(400).json({ error: "Name and password are required." });
        }

      // Verify password
      const { data: prof, error: profErr } = await supabaseAdmin
        .from("profiles")
        .select("name, password")
        .eq("name", name)
        .single();

      if (profErr) return res.status(400).json({ error: profErr.message });
      if (!prof || prof.password !== password) {
        return res.status(403).json({ error: "Invalid password." });
      }

      // Delete entries for this profile first (then the profile)
      const { error: delEntriesErr } = await supabaseAdmin
        .from("entries")
        .delete()
        .eq("profile", name);

      if (delEntriesErr) return res.status(400).json({ error: delEntriesErr.message });

      const { error: delProfErr } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("name", name);

      if (delProfErr) return res.status(400).json({ error: delProfErr.message });

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET,POST,DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
