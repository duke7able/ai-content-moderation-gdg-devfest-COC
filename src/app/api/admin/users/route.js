import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/utils/serverSession";

async function isAdmin(session) {
  if (!session?.user?.email) return false;
  const authorizedUser = await prisma.authorizedUser.findUnique({
    where: { email: session.user.email },
    select: { role: true, isActive: true },
  });
  return authorizedUser?.role === "admin" && Boolean(authorizedUser?.isActive);
}

// GET - List all authorized users
export async function GET(request) {
  try {
    const session = getSessionFromCookies(request);
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const users = await prisma.authorizedUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        addedBy: true,
        createdAt: true,
        user: {
          select: { name: true, image: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add new authorized user (single or bulk)
export async function POST(request) {
  try {
    const session = getSessionFromCookies(request);
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    let emails = [];
    if (Array.isArray(body.emails)) {
      emails = body.emails.map((e) => e.trim()).filter(Boolean);
    } else if (body.email) {
      emails = [String(body.email).trim()];
    }
    const name = body.name || "";
    const role = body.role || "moderator";

    if (emails.length === 0) {
      return NextResponse.json({ error: "No valid email(s) provided" }, { status: 400 });
    }

    const results = [];
    for (const userEmail of emails) {
      const existingUser = await prisma.authorizedUser.findUnique({ where: { email: userEmail } });
      if (existingUser) {
        results.push({ email: userEmail, status: "exists" });
        continue;
      }
      const newUser = await prisma.authorizedUser.create({
        data: {
          email: userEmail,
          name,
          role,
          addedBy: session.user.email,
          isActive: true,
        },
      });
      results.push({ email: userEmail, status: "created", user: newUser });
    }

    return NextResponse.json({ message: "User(s) processed successfully", results }, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update user (activate/deactivate, change role)
export async function PUT(request) {
  try {
    const session = getSessionFromCookies(request);
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id, isActive, role } = await request.json();
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const data = {};
    if (typeof isActive !== "undefined") data.isActive = isActive;
    if (role) data.role = role;

    const updatedUser = await prisma.authorizedUser.update({ where: { id }, data });
    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove authorized user
export async function DELETE(request) {
  try {
    const session = getSessionFromCookies(request);
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    // Fetch first to (a) detect not-found, (b) enforce self-delete rule
    const userToDelete = await prisma.authorizedUser.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!userToDelete) {
      // Safe no-op: nothing to delete
      return NextResponse.json({ message: "No-op: user not found" }, { status: 204 });
    }

    if (userToDelete.email === session.user.email) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // Perform the delete with race-safe handling
    try {
      await prisma.authorizedUser.delete({ where: { id: userToDelete.id } });
    } catch (err) {
      // Handle race where the record disappeared after findUnique
      if (err?.code === "P2025") {
        return NextResponse.json({ message: "No-op: user already deleted" }, { status: 204 });
      }
      throw err;
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

