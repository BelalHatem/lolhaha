import { getRedis } from "./_redis.js";
import { hashPassword, verifyPassword } from "./_auth.js";

export default async function handler(req, res) {
  try {
    const redis = await getRedis();

    if (req.method === "GET") {
      // List profiles (names only)
      const names = await redis.sMembers("profiles:names");
      res.status(200).json({ ok: true, profiles: names });
      return;
    }

    if (req.method === "POST") {
      // Create profile: { name, password }
      const { name, password } = req.body || {};
      if (!name || !password) return res.status(400).json({ ok: false, error: "name and password required" });

      const key = `profile:${encodeURIComponent(name)}`;
      const exists = await redis.exists(key);
      if (exists) return res.status(409).json({ ok: false, error: "profile exists" });

      const phash = hashPassword(password);
      await redis.hSet(key, { name, phash, createdAt: Date.now().toString() });
      await redis.sAdd("profiles:names", name);

      res.status(201).json({ ok: true, name });
      return;
    }

    if (req.method === "DELETE") {
      // Optional: delete profile (requires password)
      const { name, password } = req.body || {};
      if (!name || !password) return res.status(400).json({ ok: false, error: "name and password required" });

      const key = `profile:${encodeURIComponent(name)}`;
      const data = await redis.hGetAll(key);
      if (!data?.phash) return res.status(404).json({ ok: false, error: "not found" });
      if (!verifyPassword(password, data.phash)) return res.status(401).json({ ok: false, error: "bad password" });

      // remove entries set & the profile
      const entriesKey = `diary:${encodeURIComponent(name)}:ids`;
      const ids = await redis.sMembers(entriesKey);
      if (ids?.length) {
        const pipeline = redis.multi();
        ids.forEach((id) => pipeline.del(`diary:${encodeURIComponent(name)}:${id}`));
        pipeline.del(entriesKey);
        await pipeline.exec();
      }
      await redis.del(key);
      await redis.sRem("profiles:names", name);

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, error: "method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "server error" });
  }
}
