// Simple password hashing/verification (no external deps)
import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(salt + plain).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain, saltedHash) {
  const [salt, stored] = String(saltedHash).split(":");
  const test = createHash("sha256").update(salt + plain).digest("hex");
  // prevent timing attacks
  return timingSafeEqual(Buffer.from(stored), Buffer.from(test));
}
