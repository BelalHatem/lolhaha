// api/diary/[profile].js
import { getRedisClient } from "../_redis.js";

export default async function handler(req, res) {
  const redis = await getRedisClient();
  const { profile } = req.query;

  // helpers
  async function checkPassword(pw) {
    const key = `profile:${profile}`;
    const exists = await redis.exists(key);
    if (!exists) return { ok: false, status: 404, msg: "Profile not found" };
    const stored = await redis.hGet(key, "password");
    if (stored !== pw) return { ok: false, status: 401, msg: "Invalid password" };
    return { ok: true };
  }

  // GET /api/diary/[profile]?password=...
  if (req.method === "GET") {
    try {
      const { password } = req.query;
      const ok = await checkPassword(password);
      if (!ok.ok) return res.status(ok.status).json({ error: ok.msg });

      const listKey = `entries:${profile}`;
      // latest first
      const ids = await redis.zRange(listKey, -1000, -1, { REV: true });

      const entries = [];
      for (const id of ids) {
        const e = await redis.hGetAll(`entry:${profile}:${id}`);
        if (e && e.id) entries.push(e);
      }
      return res.status(200).json({ entries });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/diary/[profile]
  // body: { password, title, date, body }
  if (req.method === "POST") {
    try {
      const { password, title, date, body } = req.body || {};
      if (!password || !title || !date || !body) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const ok = await checkPassword(password);
      if (!ok.ok) return res.status(ok.status).json({ error: ok.msg });

      const id = String(await redis.incr(`counter:${profile}`));
      const entryKey = `entry:${profile}:${id}`;
      const listKey = `entries:${profile}`;

      const entry = {
        id,
        title,
        date,
        body,
        createdAt: String(Date.now()),
      };

      await redis.hSet(entryKey, entry);
      await redis.zAdd(listKey, [{ score: Date.now(), value: id }]);

      return res.status(200).json({ ok: true, entry });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT /api/diary/[profile]
  // body: { password, id, updates: { title?, date?, body? } }
  if (req.method === "PUT") {
    try {
      const { password, id, updates } = req.body || {};
      if (!password || !id || !updates) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const ok = await checkPassword(password);
      if (!ok.ok) return res.status(ok.status).json({ error: ok.msg });

      const entryKey = `entry:${profile}:${id}`;
      const exists = await redis.exists(entryKey);
      if (!exists) return res.status(404).json({ error: "Entry not found" });

      // Only update allowed fields
      const patch = {};
      ["title", "date", "body"].forEach((k) => {
        if (updates[k] != null) patch[k] = updates[k];
      });
      if (Object.keys(patch).length) await redis.hSet(entryKey, patch);

      const updated = await redis.hGetAll(entryKey);
      return res.status(200).json({ ok: true, entry: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
