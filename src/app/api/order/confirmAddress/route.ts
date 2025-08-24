import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Confirm Address", accessToken, Role.ADMIN);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  // Validate orderId parameter
  if (!orderId) {
    return new Response(JSON.stringify({ error: "Order ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Check if requested order exists
    const order = await prisma.order.findUnique({
      where: {
        orderId: orderId,
      },
    });

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update order address confidence to 1
    const updatedOrder = await prisma.order.update({
      where: {
        orderId: orderId,
      },
      data: {
        orderAddressConfidence: 1,
      },
    });

    return new Response(
      JSON.stringify({
        success: "Address confirmed successfully",
        orderId: updatedOrder.orderId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Send Error response
    console.error("Confirm Address Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
