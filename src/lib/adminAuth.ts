import crypto from "crypto";

export const SESSION_COOKIE = "admin_session";

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it to .env.local (see .env.example)."
    );
  }
  return secret;
}

/**
 * There's a single shared admin password (no per-user accounts yet —
 * that's the "Manage users" stub in the panel), so the session token
 * doesn't need a server-side store: it's just an HMAC tag proving the
 * browser once supplied the correct password, checked with a
 * timing-safe comparison.
 */
export function createSessionToken(): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update("admin-authenticated")
    .digest("hex");
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add it to .env.local (see .env.example)."
    );
  }
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
