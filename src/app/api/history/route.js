import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/utils/serverSession";

export async function GET(req) {
  try {
    const session = getSessionFromCookies(req);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [requests, total] = await Promise.all([
      prisma.moderationRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
          cocViolation: true,
          nsfw: true,
          rubbish: true,
          feedback: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.moderationRequest.count({ where: { userId: user.id } }),
    ]);

    const stats = await prisma.moderationRequest.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { status: true },
    });

    const statsFormatted = {
      total,
      approved: stats.find((s) => s.status === "approved")?._count?.status || 0,
      flagged: stats.find((s) => s.status === "flagged")?._count?.status || 0,
      blocked: stats.find((s) => s.status === "blocked")?._count?.status || 0,
    };

    return NextResponse.json({
      requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: statsFormatted,
    });
  } catch (err) {
    console.error("Error fetching history:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
