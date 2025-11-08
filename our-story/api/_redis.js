// ESM, Vercel Node.js Function
import { createClient } from "redis";

let client;

/**
 * Reuse a single Redis client across invocations
 * so we don't open a new TCP connection every time.
 */
export async function getRedis() {
  if (client && client.isOpen) return client;

  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");

  // Redis Cloud typically requires TLS even if URL starts with redis://
  const needsTLS = /redns\.redis-cloud\.com/.test(url) || url.startsWith("rediss://");

  client = createClient({
    url,
    socket: needsTLS ? { tls: true, rejectUnauthorized: false } : undefined,
  });

  client.on("error", (err) => console.error("Redis error:", err));

  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}
