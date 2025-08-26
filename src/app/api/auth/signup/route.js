import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/utils/hash";
import { signSession } from "@/utils/jwt";
import { cookieOptions } from "@/utils/cookies";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name: name || null, email, password: passwordHash },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    });

    // Optional: read role/isActive from AuthorizedUser for UI gating
    const au = await prisma.authorizedUser.findUnique({ where: { email }, select: { role: true, isActive: true } });

    const token = signSession({
      sub: user.id,
      email: user.email,
      role: au?.role || "user",
      isAuthorized: Boolean(au?.isActive),
    });

    const res = NextResponse.json({ user, ok: true });
    res.cookies.set("session", token, cookieOptions);
    return res;
  } catch (e) {
    console.error("[signup] error", e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
