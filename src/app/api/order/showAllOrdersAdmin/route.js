import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function GET(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if ((!accessToken || !verifyJwt(accessToken)) || verifyJwt(accessToken).id.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Show all orders for this user
    const allUserOrder = await prisma.order.findMany({
      include: {
        user: {
          select: {
            company: true,
          },
        },
        packages: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return new Response(JSON.stringify({ allUserOrder }), { status: 200 });
  } catch (error) {
    // Send Error response
    console.error("Get Order Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
