import { getRedis } from "../_redis.js";
import { verifyPassword } from "../_auth.js";

export default async function handler(req, res) {
  try {
    const redis = await getRedis();
    const { profile } = req.query || {};
    if (!profile) return res.status(400).json({ ok: false, error: "profile required" });

    const pKey = `profile:${encodeURIComponent(profile)}`;
    const pdata = await redis.hGetAll(pKey);
    if (!pdata?.phash) return res.status(404).json({ ok: false, error: "profile not found" });

    // password is required for any action
    const password = (req.method === "GET") ? (req.query?.password || req.headers["x-password"]) : (req.body?.password);
    if (!password) return res.status(401).json({ ok: false, error: "password required" });
    if (!verifyPassword(password, pdata.phash)) return res.status(401).json({ ok: false, error: "bad password" });

    const idsKey = `diary:${encodeURIComponent(profile)}:ids`;

    if (req.method === "GET") {
      // list entries, newest first
      const ids = await redis.sMembers(idsKey);
      if (!ids?.length) return res.status(200).json({ ok: true, entries: [] });

      const pipeline = redis.multi();
      ids.forEach((id) => pipeline.hGetAll(`diary:${encodeURIComponent(profile)}:${id}`));
      const all = await pipeline.exec();
      // sort by createdAt desc
      const entries = all
        .map(([_, obj]) => obj)
        .filter(Boolean)
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

      res.status(200).json({ ok: true, entries });
      return;
    }

    if (req.method === "POST") {
      // add entry: { title, date, body }
      const { title, date, body } = req.body || {};
      if (!title || !date || !body) return res.status(400).json({ ok: false, error: "title, date, body required" });

      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const eKey = `diary:${encodeURIComponent(profile)}:${id}`;

      await redis.hSet(eKey, {
        id,
        profile,
        title,
        date,
        body,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
      });
      await redis.sAdd(idsKey, id);

      res.status(201).json({ ok: true, id });
      return;
    }

    if (req.method === "PUT") {
      // edit entry: { id, updates: {title?, date?, body?} }
      const { id, updates } = req.body || {};
      if (!id || !updates) return res.status(400).json({ ok: false, error: "id and updates required" });

      const eKey = `diary:${encodeURIComponent(profile)}:${id}`;
      const exists = await redis.exists(eKey);
      if (!exists) return res.status(404).json({ ok: false, error: "entry not found" });

      const patch = {
        ...(updates.title ? { title: updates.title } : {}),
        ...(updates.date ? { date: updates.date } : {}),
        ...(updates.body ? { body: updates.body } : {}),
        updatedAt: Date.now().toString(),
      };
      await redis.hSet(eKey, patch);

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, error: "method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "server error" });
  }
}
