import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@prisma/client";
import { prisma as db } from "@/lib/prisma";
import { getSessionFromCookies } from "@/utils/serverSession";
import { buildModerationPrompt } from "@/utils/moderationPrompt";

const prismaClient = db || new prisma.PrismaClient();

const requestSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt cannot be empty")
    .max(5000, "Prompt too long"),
});

// Gemini API response schema
const geminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({
          parts: z.array(
            z.object({
              text: z.string(),
            })
          ),
        }),
      })
    )
    .min(1, "No candidates in response"),
});

// Flexible moderation schema that handles various formats
const flexibleModerationSchema = z.object({
  cocViolation: z
    .union([
      z.boolean(),
      z.string().transform((val) => val.toLowerCase() === "true"),
      z.number().transform((val) => val === 1),
    ])
    .default(false),
  nsfw: z
    .union([
      z.boolean(),
      z.string().transform((val) => val.toLowerCase() === "true"),
      z.number().transform((val) => val === 1),
    ])
    .default(false),
  rubbish: z
    .union([
      z.boolean(),
      z.string().transform((val) => val.toLowerCase() === "true"),
      z.number().transform((val) => val === 1),
    ])
    .default(false),
  feedback: z.string().default("Analysis completed"),
});

async function isAuthorized(email) {
  try {
    const authorizedUser = await prismaClient.authorizedUser.findUnique({
      where: { email },
    });
    return Boolean(authorizedUser?.isActive);
  } catch (error) {
    console.error("Error checking authorization:", error);
    return false;
  }
}

function parseModerationResponse(text) {
  try {
    // Simple text cleanup
    let cleanText = text.trim();
    const parsed = JSON.parse(cleanText);
    return flexibleModerationSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text, error);

    // Return safe fallback using Zod
    return flexibleModerationSchema.parse({
      cocViolation: false,
      nsfw: false,
      rubbish: true,
      feedback: "Could not analyze - parsing error",
    });
  }
}

export async function POST(req) {
  try {
    // Session validation
    const session = getSessionFromCookies(req);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Authorization check
    const authorized = await isAuthorized(session.user.email);
    if (!authorized) {
      console.log(`Unauthorized API access attempt by: ${session.user.email}`);
      return NextResponse.json(
        { error: "Access denied. You are not authorized to use this service." },
        { status: 403 }
      );
    }

    // Parse and validate request body with Zod
    const rawBody = await req.json();
    const { prompt } = requestSchema.parse(rawBody);

    // Build moderation prompt
    const analysisPrompt = buildModerationPrompt(prompt);

    // Enhanced Gemini API call for better JSON responses
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }],
          generationConfig: {
            temperature: 0.0, // Deterministic responses
            maxOutputTokens: 150, // Shorter for JSON only
            topP: 0.1,
            topK: 1,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    // Parse Gemini response with Zod
    const data = await geminiRes.json();
    const validatedResponse = geminiResponseSchema.parse(data);

    const responseText = validatedResponse.candidates[0].content.parts[0].text;
    console.log("Raw Gemini response:", responseText);

    // Parse moderation result using single Zod method
    const moderationResult = parseModerationResponse(responseText);

    // Determine status
    let status = "approved";
    if (moderationResult.cocViolation || moderationResult.nsfw) {
      status = "blocked";
    } else if (moderationResult.rubbish) {
      status = "flagged";
    }

    // Database operations (no Zod validation as requested)
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const moderationRequest = await prismaClient.moderationRequest.create({
      data: {
        userId: user.id,
        content: prompt.substring(0, 1000),
        cocViolation: moderationResult.cocViolation,
        nsfw: moderationResult.nsfw,
        rubbish: moderationResult.rubbish,
        feedback: moderationResult.feedback,
        status,
      },
    });

    // Final response validation with Zod
    const responseSchema = z.object({
      cocViolation: z.boolean(),
      nsfw: z.boolean(),
      rubbish: z.boolean(),
      feedback: z.string(),
      id: z.string(),
      status: z.enum(["approved", "blocked", "flagged"]),
    });

    const response = responseSchema.parse({
      ...moderationResult,
      id: moderationRequest.id,
      status,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in moderation API:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received: err.received,
          })),
        },
        { status: 400 }
      );
    }

    // Default error response with Zod validation
    const errorResponseSchema = z.object({
      cocViolation: z.boolean(),
      nsfw: z.boolean(),
      rubbish: z.boolean(),
      feedback: z.string(),
      error: z.string(),
    });

    const errorResponse = errorResponseSchema.parse({
      cocViolation: false,
      nsfw: false,
      rubbish: true,
      feedback: "API error occurred",
      error: "Something went wrong",
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
