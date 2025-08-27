import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";
import validator from "validator";

export async function POST(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Update Order", accessToken, [Role.USER, Role.ADMIN]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  // Update order in database
  try {
    const request = await req.json();

    // Check if requested order exists
    const order = await prisma.order.findUnique({
      where: {
        orderId: request.orderId,
      },
      include: {
        packages: true,
      },
    });

    if (!order) throw new Error("Nie ma takiego zamówienia");

    // Check if user is authorized to view this order
    if ((order && order.userId === authResult.userId) || authResult.role === Role.ADMIN) {
      // Update order
      const updatedOrder = await prisma.order.update({
        where: {
          orderId: request.orderId,
        },
        data: {
          orderType: validator.escape(request.orderType),
          orderStreet: validator.escape(request.orderStreet),
          orderStreetNumber: validator.escape(request.orderStreetNumber),
          orderFlatNumber: request.orderFlatNumber ? validator.escape(request.orderFlatNumber) : "",
          orderCity: validator.escape(request.orderCity),
          orderPostCode: validator.escape(request.orderPostCode),
          orderState: request.orderState ? validator.escape(request.orderState) : "",
          orderNote: request.orderNote ? validator.escape(request.orderNote) : "",
          recipientName: validator.escape(request.orderClientName),
          recipientPhone: validator.escape(request.orderClientPhone),
          recipientEmail: request.orderClientEmail ? validator.escape(request.orderClientEmail) : "",
          orderSupplierId: request.orderSupplierId ? validator.escape(request.orderSupplierId) : "",
        },
      });

      // Update Order
      if (updatedOrder) {
        return new Response(JSON.stringify({ Success: "Success" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      throw new Error("Nie jestesteś upoważniony do edycji tego zamówienia");
    }
  } catch (error) {
    // Send Error response
    console.error("Update Order Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
