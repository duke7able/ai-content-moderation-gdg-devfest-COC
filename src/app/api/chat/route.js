import { NextResponse } from "next/server";
import { prisma } from "@prisma/client"; // if you have lib/prisma, import from there
// If you have lib/prisma:
import { prisma as db } from "@/lib/prisma";
import { getSessionFromCookies } from "@/utils/serverSession";
import { buildModerationPrompt } from "@/utils/moderationPrompt";

const prismaClient = db || new prisma.PrismaClient();

async function isAuthorized(email) {
  try {
    const authorizedUser = await prismaClient.authorizedUser.findUnique({ where: { email } });
    return Boolean(authorizedUser?.isActive);
  } catch (error) {
    console.error("Error checking authorization:", error);
    return false;
  }
}

export async function POST(req) {
  try {
    const session = getSessionFromCookies(req);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const authorized = await isAuthorized(session.user.email);
    if (!authorized) {
      console.log(`Unauthorized API access attempt by: ${session.user.email}`);
      return NextResponse.json({ error: "Access denied. You are not authorized to use this service." }, { status: 403 });
    }

    const { prompt } = await req.json();
    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({
        cocViolation: false,
        nsfw: false,
        rubbish: true,
        feedback: "Empty input provided",
      });
    }

    const analysisPrompt = buildModerationPrompt(prompt);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
        }),
      }
    );

    const data = await geminiRes.json();
    const text = data?.candidates[0].content.parts[0].text || "";
    let jsonResult = {};
    try {
      jsonResult = JSON.parse(text.trim());
    }
    catch {
      try {
        const jsonMatch = text.match(/``````/i);
        if (jsonMatch) {
          jsonResult = JSON.parse(jsonMatch[11].trim());
        }
        else {
          const objectMatch = text.match(/\{[\s\S]*\}/);
          if (objectMatch) jsonResult = JSON.parse(objectMatch);
          else throw new Error("No JSON found");
        }
      } catch {
        console.error("All parsing methods failed:", text);
        jsonResult = { cocViolation: false, nsfw: false, rubbish: true, feedback: "Could not analyze - parsing error" };
      }
    }

    const validResult = {
      cocViolation: Boolean(jsonResult.cocViolation || false),
      nsfw: Boolean(jsonResult.nsfw || false),
      rubbish: Boolean(jsonResult.rubbish || false),
      feedback: String(jsonResult.feedback || "Analysis completed"),
    };

    let status = "approved";
    if (validResult.cocViolation || validResult.nsfw) status = "blocked";
    else if (validResult.rubbish) status = "flagged";

    const user = await prismaClient.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const moderationRequest = await prismaClient.moderationRequest.create({
      data: {
        userId: user.id,
        content: prompt.substring(0, 1000),
        cocViolation: validResult.cocViolation,
        nsfw: validResult.nsfw,
        rubbish: validResult.rubbish,
        feedback: validResult.feedback,
        status,
      },
    });

    return NextResponse.json({ ...validResult, id: moderationRequest.id, status });
  } catch (err) {
    console.error("Error in moderation API:", err);
    return NextResponse.json(
      {
        cocViolation: false,
        nsfw: false,
        rubbish: true,
        feedback: "API error occurred",
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
