// api/diary/[profile].js
import { supabaseAdmin } from "../../src/lib/supabase.js";

/**
 * Routes:
 * GET    /api/diary/:profile?password=...                   -> { entries: [...] } or { error }
 * POST   /api/diary/:profile { password, title, date, body }-> { ok: true } or { error }
 * PUT    /api/diary/:profile { password, id, updates }      -> { ok: true } or { error }
 * DELETE /api/diary/:profile { password, id }               -> { ok: true } or { error }
 */
export default async function handler(req, res) {
  try {
    const { profile } = req.query;
    if (!profile) return res.status(400).json({ error: "Missing profile." });

    // Helper: verify profile + password
    async function verify(pass) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("name, password")
        .eq("name", profile)
        .single();

      if (error) return { ok: false, error: error.message };
      if (!data || data.password !== pass) return { ok: false, error: "Invalid password." };
      return { ok: true };
    }

    if (req.method === "GET") {
      const { password } = req.query;
      const v = await verify(password);
      if (!v.ok) return res.status(403).json({ error: v.error });

      const { data, error } = await supabaseAdmin
        .from("entries")
        .select("id, title, date, body, created_at")
        .eq("profile", profile)
        .order("created_at", { ascending: false });

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ entries: data || [] });
    }

    if (req.method === "POST") {
      const { password, title, date, body } = req.body || {};
      if (!title || !date || !body) {
        return res.status(400).json({ error: "Title, date and body are required." });
      }
      const v = await verify(password);
      if (!v.ok) return res.status(403).json({ error: v.error });

      const { error } = await supabaseAdmin
        .from("entries")
        .insert([{ profile, title, date, body }]);

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "PUT") {
      const { password, id, updates } = req.body || {};
      if (!id || !updates) return res.status(400).json({ error: "id and updates are required." });
      const v = await verify(password);
      if (!v.ok) return res.status(403).json({ error: v.error });

      const { error } = await supabaseAdmin
        .from("entries")
        .update(updates)
        .eq("id", id)
        .eq("profile", profile);

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const { password, id } = req.body || {};
      if (!id) return res.status(400).json({ error: "id is required." });
      const v = await verify(password);
      if (!v.ok) return res.status(403).json({ error: v.error });

      const { error } = await supabaseAdmin
        .from("entries")
        .delete()
        .eq("id", id)
        .eq("profile", profile);

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET,POST,PUT,DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
