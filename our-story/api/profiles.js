// /api/profiles.js
import { getRedis } from "./_redis.js";

export default async function handler(req, res) {
  const redis = await getRedis();

  if (req.method === "GET") {
    const data = await redis.get("profiles");
    res.status(200).json(data ? JSON.parse(data) : []);
  }

  if (req.method === "POST") {
    const { name, password } = JSON.parse(req.body || "{}");
    if (!name || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = JSON.parse((await redis.get("profiles")) || "[]");
    if (existing.find((p) => p.name === name))
      return res.status(400).json({ error: "Profile already exists" });

    existing.push({ name, password });
    await redis.set("profiles", JSON.stringify(existing));
    res.status(200).json({ ok: true });
  }
}
