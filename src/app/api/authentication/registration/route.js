import generateToken from "@/helpers/generateJwToken";
import Bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

import { NextResponse } from "next/server";

// @desc    Register a new user
// @route   POST /api/authentication/register
// @access  Public
// @return  { id, name, email, TokenJWT }
export async function POST(req) {
  // Get data from request
  const {
    email,
    phone,
    password,
    passwordConfirmation,
    companyName,
    nip,
    country,
    city,
    street,
  } = await req.json();

  const prisma = new PrismaClient();

  try {
    // Check if all required fields are filled
    if (!email) throw new Error("Please enter an email");
    if (!phone) throw new Error("Please enter a phone number");
    if (!password) throw new Error("Please enter a password");
    if (!passwordConfirmation)
      throw new Error("Please enter a password confirmation");
    if (!companyName) throw new Error("Please enter a company name");
    if (!nip) throw new Error("Please enter a nip");
    if (!country) throw new Error("Please enter a country");
    if (!city) throw new Error("Please enter a city");
    if (!street) throw new Error("Please enter a street");

    // Check if passwords match
    if (password !== passwordConfirmation)
      throw new Error("Passwords do not match");

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (userExists) throw new Error("User already exists");

    // //Hash Password
    const salt = await Bcrypt.genSalt(10);
    const hashedPassword = await Bcrypt.hash(password, salt);

    // If user does not exist, create new user
    let user = await prisma.user.create({
      data: {
        email: email,
        phone: phone,
        password: hashedPassword,
        company: companyName,
        nip: nip,
        country: country,
        city: city,
        address: street,
      },
    });

    // Disconect Prisma and send Success response
    await prisma.$disconnect();
    return NextResponse.json({
      email: user.email,
      companyName: user.company,
      id: user.id,
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

// return NextResponse.json({
//   id: User._id,
//   name: User.name,
//   email: User.email,
//   token: generateToken(User._id),
// });

//     return new Response(
//       JSON.stringify({
//         email,
//       }),
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     console.log(error);
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
