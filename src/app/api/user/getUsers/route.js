import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function GET(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if ((!accessToken || !verifyJwt(accessToken)) || verifyJwt(accessToken).id.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Get users data from request
  try {
    // Get all users from db
    const users = await prisma.user.findMany();

    const userNoPassword = users.map((user) => {
      return {
        id: user.id,
        company: user.company,
        name: user.name,
        nip: user.nip,
        email: user.email,
        phone: user.phone,
        address: user.address,
        country: user.country,
        city: user.city,
        role: user.role,
      };
    });

    return new Response(JSON.stringify({ users: userNoPassword }), {
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
