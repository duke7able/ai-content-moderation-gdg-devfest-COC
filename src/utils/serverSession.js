import { verifySessionToken } from "@/utils/jwt";

// Reads the "session" HttpOnly cookie and returns a normalized session-like object or null
export function getSessionFromCookies(req) {
  // App Router Request has cookies on req.cookies
  // In edge/middleware you might use cookies() helper, but here read from req.cookies
  const cookie = req.cookies?.get?.("session") || req.cookies?.get?.("session");
  const token = cookie?.value || cookie; // depending on shape
  const payload = token ? verifySessionToken(token) : null;
  if (!payload) return null;

  // Normalize to the shape used in your frontend: session.user.{email,role,isAuthorized}
  return {
    user: {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isAuthorized: Boolean(payload.isAuthorized),
    },
  };
}
