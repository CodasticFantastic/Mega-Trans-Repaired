import prisma from "@/helpers/prismaClient";
import Bcrypt from "bcryptjs";

import { verifyJwt } from "@/helpers/generateJwToken";

export async function POST(req) {
  const request = await req.json();
  const password = request.password;
  const token = Buffer.from(request.token, "base64").toString("ascii");

  // Verify JWT
  if (!token || !verifyJwt(token)) {
    console.error("JwtError: Reset Password Error");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    if (!password) throw new Error("Nie podano hasła");

    // Find user in DB
    const user = await prisma.user.findUnique({
      where: {
        id: verifyJwt(token).id,
      },
    });

    if (!user) throw new Error("Użytkownik nie istnieje");

    // Hash password
    const salt = await Bcrypt.genSalt(10);
    const hashedPassword = await Bcrypt.hash(password, salt);

    // Update user password
    await prisma.user.update({
      where: {
        id: verifyJwt(token).id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return new Response(JSON.stringify({ success: "Hasło zmienione, zaloguj się" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Restart Password Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
