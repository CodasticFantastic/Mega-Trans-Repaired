import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Get Order", accessToken, [
    Role.ADMIN,
    Role.USER,
  ]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  try {
    // Check if requested order exists
    const order = await prisma.order.findUnique({
      where: {
        orderId: id,
      },
      include: {
        packages: true,
        user: {
          select: {
            company: true,
            phone: true,
          },
        },
      },
    });
    if (!order) {
      throw new Error("Nie znaleziono zamówienia");
    }

    // Check if user is authorized to view this order
    if (
      (order && order.userId === authResult.userId) ||
      authResult.role === Role.ADMIN
    ) {
      return new Response(JSON.stringify({ order }), { status: 200 });
    } else {
      throw new Error(
        "Nie jestesteś upoważniony do wyświetlenia tego zamówienia"
      );
    }
  } catch (error) {
    // Send Error response
    console.error("Get Order Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
