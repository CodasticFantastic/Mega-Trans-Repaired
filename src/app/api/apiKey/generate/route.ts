import { generateApiKey } from "@/helpers/apiKey.handler";
import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { createValidationErrorResponse } from "@/helpers/zod/validation";
import { Prisma, Role } from "@prisma/client";
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

    const { apiKeyName } = parsedBody.data;
    const apiKey = generateApiKey();

    const apiKeyData: Prisma.ApiKeyCreateInput = {
      apiKeyName: apiKeyName,
      apiKey: apiKey,
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
        apiKeyName: apiKeyData.apiKeyName,
        apiKey: apiKeyData.apiKey,
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
