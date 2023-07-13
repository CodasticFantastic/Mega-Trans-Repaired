import generateToken from "@/helpers/generateJwToken";
import Bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

import { NextResponse } from "next/server";

// @desc    Login User
// @route   POST /api/authentication/register
// @access  Public
// @return  { id, name, email, TokenJWT }
export async function POST(req) {
  // Get data from request
  const { email, password } = await req.json();

  // Connect to Prisma
  const prisma = new PrismaClient();

  try {
    // Check if all required fields are filled
    if (!email) throw new Error("Please enter an email");
    if (!password) throw new Error("Please enter a password");

    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) throw new Error("There is no user with this email");

    // Check if passwords match
    const isMatch = await Bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    // If User exists, generate JWT Token
    const token = generateToken(user.id);

    // TODO TODO TODO TODO TODO
    // TODO TODO TODO TODO TODO
    // TODO TODO TODO TODO TODO
    // TODO TODO TODO TODO TODO
    // TODO TODO TODO TODO TODO
    // TODO TODO TODO TODO TODO
    // TODO TODO TODO TODO TODO
    // TODO TODO TODO TODO TODO

    // Disconect Prisma and send Success response
    await prisma.$disconnect();
    return NextResponse.json({
      email: user.email,
      phone: user.phone,
      nip: user.nip,
      city: user.city,
      street: user.address,
      companyName: user.company,
      token: generateToken(user.id),
    });
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
