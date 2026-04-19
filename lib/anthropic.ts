import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import crypto from "crypto";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "dummy_key_for_build_environment_only" });

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;
const RATE_LIMIT_PER_HOUR = 10;

async function checkRateLimit(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600000);
  const count = await prisma.activityLog.count({
    where: {
      userId,
      action: { startsWith: "AI_" },
      createdAt: { gte: oneHourAgo },
    },
  });
  return count < RATE_LIMIT_PER_HOUR;
}

async function getCached(featureType: string, inputHash: string) {
  return prisma.aICache.findUnique({
    where: { featureType_inputHash: { featureType, inputHash } },
  });
}

async function setCache(
  featureType: string,
  inputHash: string,
  outputJson: import("@prisma/client").Prisma.InputJsonValue
) {
  return prisma.aICache.upsert({
    where: { featureType_inputHash: { featureType, inputHash } },
    update: { outputJson },
    create: { featureType, inputHash, outputJson },
  });
}

export async function callAI(
  userId: string,
  featureType: string,
  prompt: string,
  systemPrompt?: string
): Promise<{
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  const inputHash = crypto.createHash("md5").update(prompt).digest("hex");

  const cached = await getCached(featureType, inputHash);
  if (cached)
    return { ok: true, data: cached.outputJson as Record<string, unknown> };

  const allowed = await checkRateLimit(userId);
  if (!allowed)
    return { ok: false, error: "AI rate limit reached. Try again in an hour." };

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system:
        systemPrompt ||
        "You are a helpful assistant. Always respond with valid JSON only. No markdown, no preamble.",
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    await setCache(featureType, inputHash, parsed as import("@prisma/client").Prisma.InputJsonValue);
    await prisma.activityLog.create({
      data: { userId, action: `AI_${featureType}`, xpAwarded: 0 },
    });

    return { ok: true, data: parsed as Record<string, unknown> };
  } catch (err) {
    console.error("AI error:", err);
    return { ok: false, error: "AI request failed. Please try again." };
  }
}
