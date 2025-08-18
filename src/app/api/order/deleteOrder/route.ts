import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Delete Order", accessToken, [Role.ADMIN]);

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

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Zamówienie nie zostało znalezione" }),
        {
          status: 404,
        }
      );
    }

    // Check if user is authorized to delete this order
    if (order.userId === authResult.userId || authResult.role === Role.ADMIN) {
      // Delete all packages first, then delete the order
      await prisma.$transaction(async (tx: any) => {
        // Delete all packages associated with this order
        await tx.package.deleteMany({
          where: {
            orderId: id,
          },
        });

        // Delete the order
        await tx.order.delete({
          where: {
            orderId: id,
          },
        });
      });

      return new Response(
        JSON.stringify({ Success: "Zamówienie zostało usunięte" }),
        {
          status: 200,
        }
      );
    } else {
      throw new Error("Nie jesteś upoważniony do usunięcia tego zamówienia");
    }
  } catch (error) {
    console.error("Delete Order Error: ", error);
    // Send Error response
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
