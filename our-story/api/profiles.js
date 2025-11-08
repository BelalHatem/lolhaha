// /api/profiles.js
import { getRedisClient } from "./_redis.js";

export default async function handler(req, res) {
  const client = await getRedisClient();
  const key = "profiles";

  if (req.method === "GET") {
    // list all profiles (names only)
    const data = (await client.get(key)) || "[]";
    const profiles = JSON.parse(data);
    return res.status(200).json({ profiles });
  }

  if (req.method === "POST") {
    // create new profile
    const { name, password } = req.body;
    if (!name || !password)
      return res.status(400).json({ error: "Missing name or password" });

    const data = (await client.get(key)) || "[]";
    const profiles = JSON.parse(data);

    if (profiles.find((p) => p.name === name))
      return res.status(400).json({ error: "Profile already exists" });

    profiles.push({ name, password });
    await client.set(key, JSON.stringify(profiles));
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    // delete existing profile
    const { name, password } = req.body;
    if (!name || !password)
      return res.status(400).json({ error: "Missing name or password" });

    const data = (await client.get(key)) || "[]";
    let profiles = JSON.parse(data);

    const match = profiles.find((p) => p.name === name);
    if (!match)
      return res.status(404).json({ error: "Profile not found" });
    if (match.password !== password)
      return res.status(403).json({ error: "Incorrect password" });

    // remove from list
    profiles = profiles.filter((p) => p.name !== name);
    await client.set(key, JSON.stringify(profiles));

    // also remove diary entries for that profile
    await client.del(`diary:${name}`);

    return res.status(200).json({ ok: true });
  }

  // fallback for unsupported methods
  return res.status(405).json({ error: "Method not allowed" });
}
