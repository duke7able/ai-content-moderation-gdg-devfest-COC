import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/utils/hash";
import { signSession } from "@/utils/jwt";
import { cookieOptions } from "@/utils/cookies";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true, password: true },
    });
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const au = await prisma.authorizedUser.findUnique({ where: { email }, select: { role: true, isActive: true } });

    const token = signSession({
      sub: user.id,
      email: user.email,
      role: au?.role || "user",
      isAuthorized: Boolean(au?.isActive),
    });

    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set("session", token, cookieOptions);
    return res;
  } catch (e) {
    console.error("[login] error", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
