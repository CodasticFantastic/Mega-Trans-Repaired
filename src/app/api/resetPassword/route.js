import prisma from "@/helpers/prismaClient";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

import { verifyJwt } from "@/helpers/generateJwToken";

const transporter = nodemailer.createTransport({
  host: "smtp.forwardemail.net",
  port: 465,
  secure: true,
  auth: {
    user: "admin@megatrans.online",
    pass: "70805bfed7ee6db34433d04e",
  },
});

export async function POST(req) {
  const request = await req.json();
  const email = request.email;

  try {
    // Find user in DB
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) throw new Error("Użytkownik nie istnieje");

    // Create JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 600 });

    console.log(Buffer.from(token).toString("base64"))

    const sendEmail = await transporter.sendMail({
      from: '"MegaTrans" <admin@megatrans.online>',
      to: email,
      subject: "Zmiana hasła w serwisie MegaTrans",
      text: "Zmiana hasła w serwisie MegaTrans",
    })

 

    return new Response(JSON.stringify({ success: "Wysłano link do zmiany hasła" }), {
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
