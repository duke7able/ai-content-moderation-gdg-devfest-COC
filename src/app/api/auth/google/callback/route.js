// app/api/auth/google/callback/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSession } from "@/utils/jwt";
import { cookieOptions } from "@/utils/cookies";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    if (error) return NextResponse.redirect(new URL("/auth/login?error=" + encodeURIComponent(error), req.url));
    if (!code) return NextResponse.redirect(new URL("/auth/login?error=missing_code", req.url));

    // Exchange code for tokens; redirect_uri must exactly match env + Google Console
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      return NextResponse.redirect(new URL("/auth/login?error=token_exchange_failed", req.url));
    }

    // Get userinfo
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userInfoRes.json();
    if (!userInfoRes.ok || !profile?.email) {
      return NextResponse.redirect(new URL("/auth/login?error=userinfo_failed", req.url));
    }

    // Upsert user by email
    const existing = await prisma.user.findUnique({ where: { email: profile.email } });
    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { email: profile.email },
        data: {
          name: existing.name || profile.name || null,
          image: existing.image || profile.picture || null,
        },
        select: { id: true, email: true, name: true, image: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || null,
          image: profile.picture || null,
        },
        select: { id: true, email: true, name: true, image: true },
      });
    }

    // Optional role flags
    const au = await prisma.authorizedUser.findUnique({
      where: { email: user.email },
      select: { role: true, isActive: true },
    });

    const jwt = signSession({
      sub: user.id,
      email: user.email,
      role: au?.role || "user",
      isAuthorized: Boolean(au?.isActive),
    });

    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("session", jwt, cookieOptions);
    return res;
  } catch (e) {
    console.error("[google callback] error", e);
    return NextResponse.redirect(new URL("/auth/login?error=unknown", req.url));
  }
}