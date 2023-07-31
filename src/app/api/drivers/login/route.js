import { generateToken } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";
import Bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  const requestBody = await request.json();

  const { email, password } = requestBody.body;

  try {
    // Check if all required fields are filled
    if (!email) throw new Error("Wprowadź email");
    if (!password) throw new Error("Wprowadź hasło");

    // Check if driver already exists
    const driver = await prisma.driver.findUnique({
      where: {
        email: email,
      },
    });
    if (!driver) throw new Error("Nie ma użytkownika o podanym adresie email");

    // Check if passwords match
    if (driver && (await Bcrypt.compare(password, driver.password))) {
      // Remove password from driver object
      const { password, createdAt, deletedAt, updatedAt, ...driverWithoutPassword } = driver;

      // Generate JWT token
      const accessToken = generateToken(driverWithoutPassword);

      // Create result object
      const result = {
        ...driverWithoutPassword,
        accessToken,
      };

      // Send Success response
      return NextResponse.json({ driver: result });
    } else {
      throw new Error("Niepoprawne dane logowania");
    }
  } catch (error) {
    // Send Error response
    console.error("Driver Login Page Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
