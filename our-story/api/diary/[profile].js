// /api/diary/[profile].js
import { getRedisClient } from "../_redis.js";

async function loadProfiles(client) {
  const raw = (await client.get("profiles")) || "[]";
  return JSON.parse(raw);
}

function checkPassword(profiles, name, password) {
  const p = profiles.find((x) => x.name === name);
  if (!p) return { ok: false, code: 404, error: "Profile not found" };
  if (p.password !== password)
    return { ok: false, code: 403, error: "Incorrect password" };
  return { ok: true };
}

export default async function handler(req, res) {
  const client = await getRedisClient();
  const { profile } = req.query; // dynamic segment [profile]
  const key = `diary:${profile}`;

  // Ensure we always have an array
  const getEntries = async () => JSON.parse((await client.get(key)) || "[]");
  const saveEntries = async (arr) => client.set(key, JSON.stringify(arr));

  if (req.method === "GET") {
    // List entries (no password required to list — your UI still gates read by unlock)
    const entries = await getEntries();
    return res.status(200).json({ entries });
  }

  if (req.method === "POST") {
    // Create entry
    const { password, title, date, body } = req.body || {};
    if (!title || !date || !body || !password)
      return res.status(400).json({ error: "Missing fields" });

    const profiles = await loadProfiles(client);
    const ok = checkPassword(profiles, profile, password);
    if (!ok.ok) return res.status(ok.code).json({ error: ok.error });

    const entries = await getEntries();
    const now = Date.now();
    const id = `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    entries.unshift({
      id,
      title,
      date,
      body,
      createdAt: now,
      updatedAt: now,
    });
    await saveEntries(entries);
    return res.status(200).json({ ok: true, id });
  }

  if (req.method === "PUT") {
    // Edit entry (title/date/body)
    const { password, id, updates = {} } = req.body || {};
    if (!password || !id) return res.status(400).json({ error: "Missing id or password" });

    const profiles = await loadProfiles(client);
    const ok = checkPassword(profiles, profile, password);
    if (!ok.ok) return res.status(ok.code).json({ error: ok.error });

    const entries = await getEntries();
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ error: "Entry not found" });

    entries[idx] = {
      ...entries[idx],
      ...["title", "date", "body"].reduce((o, k) => {
        if (updates[k] !== undefined) o[k] = updates[k];
        return o;
      }, {}),
      updatedAt: Date.now(),
    };
    await saveEntries(entries);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    // Delete entry
    const { password, id } = req.body || {};
    if (!password || !id) return res.status(400).json({ error: "Missing id or password" });

    const profiles = await loadProfiles(client);
    const ok = checkPassword(profiles, profile, password);
    if (!ok.ok) return res.status(ok.code).json({ error: ok.error });

    const entries = await getEntries();
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length)
      return res.status(404).json({ error: "Entry not found" });

    await saveEntries(next);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
