import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_JWT_SECRET || "dev-secret-change-me";
const EXPIRES_IN = "7d";

export function signSession(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifySessionToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
