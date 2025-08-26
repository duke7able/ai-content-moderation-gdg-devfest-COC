import { NextResponse } from "next/server";
import { verifySessionToken } from "@/utils/jwt";

export async function GET(req) {
  const cookie = req.cookies.get("session");
  if (!cookie?.value) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const payload = verifySessionToken(cookie.value);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({
    user: {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isAuthorized: payload.isAuthorized,
    },
  });
}
