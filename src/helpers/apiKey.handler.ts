import prisma from "@/helpers/prismaClient";
import crypto from "crypto";

interface ApiKeyAuthResult {
  success: boolean;
  userId?: number;
  error?: string;
}

export async function apiKeyAuth(
  apiKey: string | null,
  userId: string | null
): Promise<ApiKeyAuthResult> {
  if (!apiKey) {
    return {
      success: false,
      error: "API key required",
    };
  }

  if (!userId) {
    return {
      success: false,
      error: "User ID required",
    };
  }

  try {
    // Znajdź aktywny klucz API
    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        key: apiKey,
        userId: userId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!keyRecord) {
      return {
        success: false,
        error: "Invalid API key",
      };
    }

    // Aktualizuj lastUsed
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    });

    return {
      success: true,
      userId: keyRecord.userId,
    };
  } catch (error) {
    return {
      success: false,
      error: "Authentication failed",
    };
  }
}

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
