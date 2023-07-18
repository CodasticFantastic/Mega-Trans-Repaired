import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function POST(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if (!accessToken || !verifyJwt(accessToken)) {
    console.error(verifyJwt(accessToken));
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Add new order to database
  try {
    const request = await req.json();

    // Create packages array
    let packages = request.orderItems.map((item) => {
      return {
        packageId: item.orderCommodityId,
        commodityType: item.orderCommodityType,
        commodityName: item.orderCommodityName,
        commodityPaymentType: item.orderCommodityPayType,
        commodityPrice: item.orderCommodityPayAmount,
        commodityNote: item.orderCommodityNote,
      };
    });

    // Create new order 
    const newOrder = await prisma.order.create({
      data: {
        orderId: request.orderId,
        userId: verifyJwt(accessToken).id.id,
        status: request.status,
        orderType: request.orderType,
        orderCountry: request.orderCountry,
        orderStreet: request.orderStreet,
        orderStreetNumber: request.orderStreetNumber,
        orderFlatNumber: request.orderFlatNumber,
        orderCity: request.orderCity,
        orderPostCode: request.orderPostCode,
        orderState: request.orderState,
        orderNote: request.orderNote,
        recipientName: request.orderClientName,
        recipientPhone: request.orderClientPhone,
        recipientEmail: request.orderClientEmail,
        packages: {
          create: packages,
        },
      },
    });

    return new Response(JSON.stringify({ Success: "Success" }), {
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
