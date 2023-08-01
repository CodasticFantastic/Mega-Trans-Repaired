import prisma from "@/helpers/prismaClient";
import Bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import validator from "validator";

export async function POST(request) {
  // Get data from request
  const requestBody = await request.json();

  try {
    // Check if all required fields are filled
    if (!requestBody.email) throw new Error("Wprowadź adres email");
    if (!requestBody.phone) throw new Error("Wprowadź numer telefonu");
    if (!requestBody.password) throw new Error("Wprowadź hasło");
    if (!requestBody.passwordConfirmation) throw new Error("Wprowadź potwierdzenie hasła");
    if (!requestBody.companyName) throw new Error("Wprowadź nazwę firmy");
    if (!requestBody.nip) throw new Error("Wprowadź NIP");
    if (!requestBody.country) throw new Error("Wprowadź kraj");
    if (!requestBody.city) throw new Error("Wprowadź miasto");
    if (!requestBody.street) throw new Error("Wpropwadź ulicę i numer");

    // Check if passwords match
    if (requestBody.password !== requestBody.passwordConfirmation) throw new Error("Hasła nie są takie same");

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
          email: validator.escape(requestBody.email),
          phone: validator.escape(requestBody.phone),
          password: hashedPassword,
          company: validator.escape(requestBody.companyName),
          nip: validator.escape(requestBody.nip),
          country: validator.escape(requestBody.country),
          city: validator.escape(requestBody.city),
          address: validator.escape(requestBody.street),
        },
      });

      const { password, ...userWithoutPassword } = user;

      return NextResponse.json({ user: userWithoutPassword });
    } else {
      throw new Error("Użytkownik o takim mailu już istnieje");
    }
  } catch (error) {
    // Disconect Prisma and send Error response
    console.error("Registration Page Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
