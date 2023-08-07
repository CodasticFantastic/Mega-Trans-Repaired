import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function POST(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if (!accessToken || !verifyJwt(accessToken)) {
    console.error("JwtError: Update Status - Driver - Finish Page Error");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
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
    if (verifyJwt(accessToken).id.role === "DRIVER") {
      // Update order
      const updatedOrder = await prisma.order.update({
        where: {
          orderId: request.orderId,
        },
        data: {
          status: "Zrealizowane",
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
    console.error("Update Status - Driver - Finish Page Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
