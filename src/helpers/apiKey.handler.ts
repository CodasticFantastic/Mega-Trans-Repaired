import prisma from "@/helpers/prismaClient";
import crypto from "crypto";
import { encryptApiKey } from "./encryption";
import { ApiKeyType } from "@prisma/client";

interface ApiKeyAuthResult {
  success: boolean;
  userId?: number;
  apiKeyType?: ApiKeyType;
  error?: string;
}

/**
 * Authenticates an external API key (For external API calls)
 * @param apiKey - The API key to authenticate
 * @returns An object containing the authentication result
 */
export async function apiKeyAuth(
  apiKey: string | null
): Promise<ApiKeyAuthResult> {
  if (!apiKey) {
    return {
      success: false,
      error: "API key required",
    };
  }

  try {
    const encryptedApiKey = encryptApiKey(apiKey);

    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        apiKey: encryptedApiKey,
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

    // Update lastUsed date
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    });

    return {
      success: true,
      userId: keyRecord.userId,
      apiKeyType: keyRecord.type,
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

/**
 * Get the BaseLinker API key for a user
 * @param userId - The ID of the user
 * @returns The BaseLinker API key
 */
export async function getBaseLinkerApiKey(userId: number) {
  const baseLinkerApiKey = await prisma.apiKey.findFirst({
    where: {
      userId,
      type: ApiKeyType.BaseLinker,
      isActive: true,
      deletedAt: null,
    },
  });

  return baseLinkerApiKey;
}
