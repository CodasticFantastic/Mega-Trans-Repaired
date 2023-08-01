import prisma from "@/helpers/prismaClient";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  host: "smtp.forwardemail.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.FORWARD_EMAIL,
    pass: process.env.FORWARD_PASS,
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
    let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 600 });
    token = Buffer.from(token).toString("base64");

    const sendEmail = await transporter.sendMail({
      from: '"MegaTrans" <admin@megatrans.online>',
      to: email,
      subject: "Zmiana hasła w serwisie MegaTrans",
      html: `<p>Zrestartuj hasło klikając w poniższy link: <br/> <a href="${process.env.NEXT_PUBLIC_DOMAIN}/resetPassword/${token}">Zrestartuj hasło</a></p><p>Link wygaśnie za 10 minut</p><p>Jeśli nie chciałeś zmieniać hasła, zignoruj tą wiadomość i poinformuj administratora serwisu o danej sytuacji</p>`,
    });

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
