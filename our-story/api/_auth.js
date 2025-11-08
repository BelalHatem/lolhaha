// /api/_auth.js
import crypto from "crypto";

const ALGO = "aes-256-gcm"; // for a small secret wrapper
const SALT = "diary_salt_v1"; // non-secret, constant salt for scrypt

export function hashPassword(password) {
  const salt = Buffer.from(SALT);
  const key = crypto.scryptSync(password, salt, 32);
  // store as hex
  return key.toString("hex");
}

export function verifyPassword(password, storedHex) {
  const salt = Buffer.from(SALT);
  const key = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(storedHex, "hex"));
}
