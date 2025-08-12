import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Get User", accessToken, [
    Role.USER,
    Role.ADMIN,
  ]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }
  // Get users data from request
  try {
    // Get user from db
    const user = await prisma.user.findUnique({
      where: {
        id: authResult.userId,
      },
    });

    const { password, ...userNoPass } = user;

    return new Response(JSON.stringify({ success: userNoPass }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Get User Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
