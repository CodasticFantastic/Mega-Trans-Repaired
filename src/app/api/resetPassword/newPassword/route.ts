import prisma from "@/helpers/prismaClient";
import Bcrypt from "bcryptjs";

import { authGuard } from "@/helpers/jwt.handler";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const request = await req.json();
  const password = request.password;
  const token = Buffer.from(request.token, "base64").toString("ascii");

  // Verify JWT
  const authResult = authGuard("Get Users", token, [
    Role.ADMIN,
    Role.USER,
    Role.DRIVER,
  ]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  try {
    if (!password) throw new Error("Nie podano hasła");

    // Find user in DB
    const user = await prisma.user.findUnique({
      where: {
        id: authResult.userId,
      },
    });

    if (!user) throw new Error("Użytkownik nie istnieje");

    // Hash password
    const salt = await Bcrypt.genSalt(10);
    const hashedPassword = await Bcrypt.hash(password, salt);

    // Update user password
    await prisma.user.update({
      where: {
        id: authResult.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return new Response(
      JSON.stringify({ success: "Hasło zmienione, zaloguj się" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Send Error response
    console.error("Restart Password Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
