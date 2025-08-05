import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";
import { UserWithoutPassword } from "types/user.types";

export async function GET(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Get Users", accessToken, Role.ADMIN);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  // Get users data from request
  try {
    // Get all users from db
    const users: UserWithoutPassword[] = await prisma.user.findMany();

    const userNoPassword = users.map((user) => {
      return {
        id: user.id,
        company: user.company,
        name: user.name,
        nip: user.nip,
        email: user.email,
        phone: user.phone,
        address: user.address,
        country: user.country,
        city: user.city,
        role: user.role,
      };
    });

    return new Response(JSON.stringify({ users: userNoPassword }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Get Users - Admin - Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
