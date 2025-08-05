import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";
import { NewOrderRequest, OrderCreateInput } from "types/oreder.types";
import validator from "validator";

export async function POST(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("New Order", accessToken, [
    Role.ADMIN,
    Role.USER,
  ]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  // Add new order to database
  try {
    const request: NewOrderRequest = await req.json();

    // Create packages array
    let packages = request.orderItems.map((item) => {
      return {
        packageId: validator.escape(item.orderCommodityId),
        commodityType: validator.escape(item.orderCommodityType),
        commodityName: validator.escape(item.orderCommodityName),
        commodityNote: item.orderCommodityNote
          ? validator.escape(item.orderCommodityNote)
          : undefined,
      };
    });

    // Create new order
    const newOrder: OrderCreateInput = await prisma.order.create({
      data: {
        orderId: validator.escape(request.orderId),
        userId: authResult.userId,
        status: validator.escape(request.status),
        orderType: validator.escape(request.orderType),
        orderCountry: validator.escape(request.orderCountry),
        orderStreet: validator.escape(request.orderStreet),
        orderStreetNumber: validator.escape(request.orderStreetNumber),
        orderFlatNumber: request.orderFlatNumber
          ? validator.escape(request.orderFlatNumber)
          : undefined,
        orderCity: validator.escape(request.orderCity),
        orderPostCode: validator.escape(request.orderPostCode),
        orderState: validator.escape(request.orderState),
        orderNote: request.orderNote
          ? validator.escape(request.orderNote)
          : undefined,
        recipientName: validator.escape(request.orderClientName),
        recipientPhone: validator.escape(request.orderClientPhone),
        recipientEmail: request.orderClientEmail
          ? validator.escape(request.orderClientEmail)
          : undefined,
        currency: request.currency
          ? validator.escape(request.currency)
          : undefined,
        orderPaymentType: validator.escape(request.orderPaymentType),
        orderPrice: parseFloat(
          validator.escape(request.orderPaymentPrice + "")
        ),
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
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
