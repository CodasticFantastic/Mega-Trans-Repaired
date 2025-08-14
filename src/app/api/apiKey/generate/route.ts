import { generateApiKey } from "@/helpers/apiKey.handler";
import { encryptApiKey } from "@/helpers/encryption";
import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { createValidationErrorResponse } from "@/helpers/zod/validation";
import { ApiKeyType, Prisma, Role } from "@prisma/client";
import { CreateApiKeySchema } from "types/apiKey.types";
import z from "zod";

export async function POST(req: Request) {
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Generate Api Key", accessToken, [Role.USER]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ message: "UNAUTHORIZED" }), {
      status: 401,
    });
  }

  try {
    const body = await req.json();
    const parsedBody = z.safeParse(CreateApiKeySchema, body);

    if (!parsedBody.success) {
      return createValidationErrorResponse(parsedBody.error);
    }

    const existingApiKey = await prisma.apiKey.findFirst({
      where: {
        apiKeyName: parsedBody.data.apiKeyName,
        userId: authResult.userId,
      },
    });

    if (existingApiKey) {
      return new Response(JSON.stringify({ error: "API_KEY_ALREADY_EXISTS" }), {
        status: 400,
      });
    }

    const existingBaseLinkerApiKey = await prisma.apiKey.findFirst({
      where: {
        userId: authResult.userId,
        type: ApiKeyType.BaseLinker,
      },
    });

    if (
      parsedBody.data.apiKeyType === ApiKeyType.BaseLinker &&
      existingBaseLinkerApiKey
    ) {
      return new Response(
        JSON.stringify({ error: "BASE_LINKER_API_KEY_ALREADY_EXISTS" }),
        {
          status: 400,
        }
      );
    }

    const { apiKeyName, apiKeyType } = parsedBody.data;
    let apiKey: string;

    // Type guard dla BaseLinker
    if (
      parsedBody.data.apiKeyType === ApiKeyType.BaseLinker &&
      "apiKeyValue" in parsedBody.data
    ) {
      apiKey = parsedBody.data.apiKeyValue;
    } else {
      apiKey = generateApiKey();
    }

    const encryptedApiKey = encryptApiKey(apiKey);

    const apiKeyData: Prisma.ApiKeyCreateInput = {
      apiKeyName: apiKeyName,
      apiKey: encryptedApiKey,
      type: apiKeyType as ApiKeyType,
      user: {
        connect: {
          id: authResult.userId,
        },
      },
    };

    const newApiKey = await prisma.apiKey.create({
      data: apiKeyData,
    });

    return new Response(
      JSON.stringify({
        apiKeyName: newApiKey.apiKeyName,
        apiKey: newApiKey.apiKey,
        apiKeyType: newApiKey.type,
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
