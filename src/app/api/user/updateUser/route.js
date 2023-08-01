import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";
import validator from "validator";

export async function POST(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if (!accessToken || !verifyJwt(accessToken)) {
    console.error("JwtError: Update User Error");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Update user from db
    let body = await req.json();

    const user = await prisma.user.update({
      where: {
        id: verifyJwt(accessToken).id.id,
      },
      data: {
        company: validator.escape(body.companyName),
        email: validator.escape(body.email),
        phone: validator.escape(body.phone),
        nip: validator.escape(body.nip),
        address: validator.escape(body.address),
        country: validator.escape(body.country),
        city: validator.escape(body.city),
      },
    });

    return new Response(JSON.stringify({ success: user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Update User Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
