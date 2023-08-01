import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";
import validator from "validator";

export async function POST(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if (!accessToken || !verifyJwt(accessToken)) {
    console.error("JwtError: New Order Error");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Add new order to database
  try {
    const request = await req.json();

    // Create packages array
    let packages = request.orderItems.map((item) => {
      return {
        packageId: validator.escape(item.orderCommodityId),
        commodityType: validator.escape(item.orderCommodityType),
        commodityName: validator.escape(item.orderCommodityName),
        commodityPaymentType: validator.escape(item.orderCommodityPayType),
        commodityPrice: parseFloat(validator.escape(item.orderCommodityPayAmount + "")),
        commodityNote: validator.escape(item.orderCommodityNote),
      };
    });

    // Create new order
    const newOrder = await prisma.order.create({
      data: {
        orderId: validator.escape(request.orderId),
        userId: verifyJwt(accessToken).id.id,
        status: validator.escape(request.status),
        orderType: validator.escape(request.orderType),
        orderCountry: validator.escape(request.orderCountry),
        orderStreet: validator.escape(request.orderStreet),
        orderStreetNumber: validator.escape(request.orderStreetNumber),
        orderFlatNumber: validator.escape(request.orderFlatNumber),
        orderCity: validator.escape(request.orderCity),
        orderPostCode: validator.escape(request.orderPostCode),
        orderState: validator.escape(request.orderState),
        orderNote: validator.escape(request.orderNote),
        recipientName: validator.escape(request.orderClientName),
        recipientPhone: validator.escape(request.orderClientPhone),
        recipientEmail: validator.escape(request.orderClientEmail),
        currency: validator.escape(request.currency),
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
    console.error("New Order Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
