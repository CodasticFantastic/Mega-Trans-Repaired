import prisma from "@/helpers/prismaClient";
import Bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  // Get data from request
  const requestBody = await request.json();

  try {
    // Check if all required fields are filled
    if (!requestBody.email) throw new Error("Please enter an email");
    if (!requestBody.phone) throw new Error("Please enter a phone number");
    if (!requestBody.password) throw new Error("Please enter a password");
    if (!requestBody.passwordConfirmation)
      throw new Error("Please enter a password confirmation");
    if (!requestBody.companyName)
      throw new Error("Please enter a company name");
    if (!requestBody.nip) throw new Error("Please enter a nip");
    if (!requestBody.country) throw new Error("Please enter a country");
    if (!requestBody.city) throw new Error("Please enter a city");
    if (!requestBody.street) throw new Error("Please enter a street");

    // Check if passwords match
    if (requestBody.password !== requestBody.passwordConfirmation)
      throw new Error("Passwords do not match");

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: {
        email: requestBody.email,
      },
    });

    // If user does not exist, create new user
    if (!userExists) {
      // //If user does not exist, Hash Password
      const salt = await Bcrypt.genSalt(10);
      const hashedPassword = await Bcrypt.hash(requestBody.password, salt);

      let user = await prisma.user.create({
        data: {
          email: requestBody.email,
          phone: requestBody.phone,
          password: hashedPassword,
          company: requestBody.companyName,
          nip: requestBody.nip,
          country: requestBody.country,
          city: requestBody.city,
          address: requestBody.street,
        },
      });

      const { password, ...userWithoutPassword } = user;

      return NextResponse.json({ user: userWithoutPassword });
    } else {
      throw new Error("User already exists");
    }
  } catch (error) {
    // Disconect Prisma and send Error response
    console.error("Error Error Error Error Error: ", error);
    await prisma.$disconnect();
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
