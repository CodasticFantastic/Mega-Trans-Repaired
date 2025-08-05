import { generateToken } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import Bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  const requestBody = await request.json();

  try {
    // Check if all required fields are filled
    if (!requestBody.email) throw new Error("Wprowadź adres email");
    if (!requestBody.password) throw new Error("Wprowadź hasło");

    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: {
        email: requestBody.email,
      },
    });
    if (!user) throw new Error("Nie ma użytkownika o takim mailu");

    // Check if passwords match
    if (user && (await Bcrypt.compare(requestBody.password, user.password))) {
      // Remove password from user object
      const { password, createdAt, deletedAt, updatedAt, ...userWithoutPassword } = user;

      // Generate JWT token
      const accessToken = generateToken(userWithoutPassword);

      // Create result object
      const result = {
        ...userWithoutPassword,
        accessToken,
      };

      // Send Success response
      return NextResponse.json({ user: result });
    } else {
      throw new Error("Niepoprawne dane logowania");
    }
  } catch (error) {
    // Send Error response
    console.error("Login Page Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
