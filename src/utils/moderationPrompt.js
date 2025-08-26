import { z } from "zod";

// Environment validation
const envSchema = z.object({
  NEXT_PUBLIC_MODERATION_PROMPT: z.string().min(1, "Moderation prompt is required")
});

const PROMPT_INSTRUCTIONS = envSchema.parse({
  NEXT_PUBLIC_MODERATION_PROMPT: process.env.NEXT_PUBLIC_MODERATION_PROMPT
}).NEXT_PUBLIC_MODERATION_PROMPT;

// Input validation schema
const moderationInputSchema = z.string()
  .min(1, "Input cannot be empty")
  .max(5000, "Input too long")
  .transform(input => input.trim())
  .refine(input => input.length > 0, "Input cannot be only whitespace");

// Define the exact response structure we want from Gemini
const geminiModerationSchema = z.object({
  cocViolation: z.boolean(),
  nsfw: z.boolean(), 
  rubbish: z.boolean(),
  feedback: z.string().max(100, "Feedback too long")
});

// Generate JSON Schema for Gemini to follow
function getJsonSchemaForGemini() {
  return {
    type: "object",
    properties: {
      cocViolation: { 
        type: "boolean", 
        description: "True if violates GDG DevFest Code of Conduct" 
      },
      nsfw: { 
        type: "boolean", 
        description: "True if contains adult/inappropriate content" 
      },
      rubbish: { 
        type: "boolean", 
        description: "True if spammy, nonsensical, or controversial" 
      },
      feedback: { 
        type: "string", 
        maxLength: 100, 
        description: "Brief explanation (max 100 characters)" 
      }
    },
    required: ["cocViolation", "nsfw", "rubbish", "feedback"],
    additionalProperties: false
  };
}

export function buildModerationPrompt(userInput) {
  // Validate input with Zod
  const validatedInput = moderationInputSchema.parse(userInput);
  
  // Sanitize input
  const sanitizedInput = validatedInput
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');

  const responseSchema = getJsonSchemaForGemini();

  return `${PROMPT_INSTRUCTIONS}

Analyze the following user text:
"${sanitizedInput}"

CRITICAL INSTRUCTIONS:
1. You MUST respond with valid JSON only
2. No explanations, no code blocks, no markdown, no extra text
3. Use double quotes, not single quotes
4. Follow this exact schema structure:

${JSON.stringify(responseSchema, null, 2)}

VALID EXAMPLE:
{"cocViolation": false, "nsfw": false, "rubbish": false, "feedback": "Safe content"}

Your JSON response:`;
}

// Export schemas for use in API
export { moderationInputSchema, geminiModerationSchema };
