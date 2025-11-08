// /api/diary/[profile].js
import { getRedis } from "../_redis.js";

export default async function handler(req, res) {
  const redis = await getRedis();
  const { profile } = req.query;
  const key = `diary:${profile}`;

  if (req.method === "GET") {
    const data = await redis.get(key);
    res.status(200).json(data ? JSON.parse(data) : []);
  }

  if (req.method === "POST") {
    const { password, entry } = JSON.parse(req.body || "{}");
    const profiles = JSON.parse((await redis.get("profiles")) || "[]");
    const prof = profiles.find((p) => p.name === profile);
    if (!prof || prof.password !== password)
      return res.status(403).json({ error: "Invalid password" });

    const entries = JSON.parse((await redis.get(key)) || "[]");
    entries.unshift({ id: Date.now(), ...entry });
    await redis.set(key, JSON.stringify(entries));
    res.status(200).json({ ok: true });
  }
}
