import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";
import validator from "validator";

export async function POST(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Update User", accessToken, [
    Role.USER,
    Role.ADMIN,
  ]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  try {
    // Update user from db
    let body = await req.json();

    const user = await prisma.user.update({
      where: {
        id: authResult.userId,
      },
      data: {
        company: validator.escape(body.companyName),
        email: validator.escape(body.email),
        phone: validator.escape(body.phone),
        nip: validator.escape(body.nip),
        address: validator.escape(body.address),
        country: validator.escape(body.country),
        city: validator.escape(body.city),
      },
    });

    return new Response(JSON.stringify({ success: user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Update User Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
