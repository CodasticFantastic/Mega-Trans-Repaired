import { generateApiKey } from "@/helpers/apiKey.handler";
import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { createValidationErrorResponse } from "@/helpers/zod/validation";
import { Prisma, Role } from "@prisma/client";
import { DeleteApiKeySchema } from "types/apiKey.types";
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
    const parsedBody = z.safeParse(DeleteApiKeySchema, body);

    if (!parsedBody.success) {
      return createValidationErrorResponse(parsedBody.error);
    }

    const { apiKey } = parsedBody.data;

    const deletedApiKey = await prisma.apiKey.delete({
      where: {
        apiKey: apiKey,
        userId: authResult.userId,
      },
    });

    if (deletedApiKey.count === 0) {
      return new Response(
        JSON.stringify({ error: "Klucz API nie został znaleziony" }),
        {
          status: 404,
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Success",
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
