// api/profiles.js
import { getRedisClient } from "./_redis.js";

export default async function handler(req, res) {
  const redis = await getRedisClient();

  if (req.method === "GET") {
    try {
      const keys = await redis.keys("profile:*");
      const profiles = [];
      for (const k of keys) {
        const data = await redis.hGetAll(k);
        profiles.push({ name: data.name });
      }
      res.status(200).json({ profiles });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else if (req.method === "POST") {
    try {
      const { name, password } = req.body;
      if (!name || !password)
        return res.status(400).json({ error: "Missing fields" });

      const key = `profile:${name}`;
      const exists = await redis.exists(key);
      if (exists)
        return res.status(400).json({ error: "Profile already exists" });

      await redis.hSet(key, { name, password });
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
