import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function POST(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if (!accessToken || !verifyJwt(accessToken)) {
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
        company: body.companyName,
        email: body.email,
        phone: body.phone,
        nip: body.nip,
        address: body.address,
        country: body.country,
        city: body.city,
      },
    });

    return new Response(JSON.stringify({ success: user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Add Order Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
