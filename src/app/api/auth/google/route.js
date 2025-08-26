// app/api/auth/google/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const state = "state-" + Math.random().toString(36).slice(2);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "select_account",
    state,
  });

  return NextResponse.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params.toString());
}
