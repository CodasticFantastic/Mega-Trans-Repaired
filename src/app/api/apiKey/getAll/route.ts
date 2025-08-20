import { generateApiKey } from "@/helpers/apiKey.handler";
import { decryptApiKey } from "@/helpers/encryption";
import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { createValidationErrorResponse } from "@/helpers/zod/validation";
import { ApiKey, ApiKeyType, Prisma, Role } from "@prisma/client";
import { CreateApiKeySchema } from "types/apiKey.types";
import z from "zod";

export async function GET(req: Request) {
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Generate Api Key", accessToken, [Role.USER]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ message: "UNAUTHORIZED" }), {
      status: 401,
    });
  }

  try {
    const userApiKeys = await prisma.apiKey.findMany({
      where: {
        userId: authResult.userId,
      },
    });

    if (userApiKeys.length === 0) {
      return new Response(JSON.stringify({ message: "NO_API_KEYS_FOUND" }), {
        status: 200,
      });
    }

    const apiKeyData = userApiKeys.map((apiKey: ApiKey) => ({
      apiKeyName: apiKey.apiKeyName,
      apiKey: apiKey.type === ApiKeyType.BaseLinker ? "***********" : decryptApiKey(apiKey.apiKey),
      type: apiKey.type,
      lastUsed: apiKey.lastUsed,
    }));

    return new Response(
      JSON.stringify({
        apiKeys: apiKeyData,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Generate API Key Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
