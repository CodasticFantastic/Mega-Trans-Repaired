import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Cancel Order", accessToken, [
    Role.USER,
    Role.ADMIN,
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
      },
    });

    // Check if user is authorized to view this order
    if (
      (order && order.userId === authResult.userId) ||
      authResult.role === Role.ADMIN
    ) {
      await prisma.order.update({
        where: {
          orderId: id,
        },
        data: {
          status: "Anulowane",
        },
      });

      return new Response(JSON.stringify({ Success: "Anulowano zamwienie" }), {
        status: 200,
      });
    } else {
      throw new Error("Nie jestesteś upoważniony do anulacji tego zamówienia");
    }
  } catch (error) {
    console.error("Cancel Order Error: ", error);
    // Send Error response
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
