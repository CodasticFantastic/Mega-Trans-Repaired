import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { CommodityPaymentType, CommodityType, OrderSource, OrderType, Role, Status } from "@prisma/client";
import { NewOrderRequest, NewOrderRequestSchema } from "types/order.types";
import validator from "validator";
import { Prisma } from "@prisma/client";
import { createValidationErrorResponse } from "@/helpers/zod/validation";

export async function POST(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("New Order", accessToken, [Role.ADMIN, Role.USER]);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  // Add new order to database
  try {
    const request: NewOrderRequest = await req.json();

    const validatedRequest = NewOrderRequestSchema.safeParse(request);

    if (!validatedRequest.success) {
      return createValidationErrorResponse(validatedRequest.error);
    }

    // Create packages array
    let packages = request.orderItems.map((item) => {
      return {
        packageId: validator.escape(item.orderCommodityId),
        commodityType: validator.escape(item.orderCommodityType) as CommodityType,
        commodityName: validator.escape(item.orderCommodityName),
        commodityNote: item.orderCommodityNote ? validator.escape(item.orderCommodityNote) : undefined,
      };
    });

    const newOrderData: Prisma.OrderCreateInput = {
      orderId: validator.escape(request.orderId),
      user: { connect: { id: authResult.userId } },
      status: validator.escape(request.status) as Status,
      orderType: validator.escape(request.orderType) as OrderType,
      orderCountry: validator.escape(request.orderCountry),
      orderStreet: validator.escape(request.orderStreet),
      orderStreetNumber: validator.escape(request.orderStreetNumber),
      orderFlatNumber: request.orderFlatNumber ? validator.escape(request.orderFlatNumber) : undefined,
      orderCity: validator.escape(request.orderCity),
      orderPostCode: validator.escape(request.orderPostCode),
      orderState: validator.escape(request.orderState),
      orderNote: request.orderNote ? validator.escape(request.orderNote) : undefined,
      recipientName: validator.escape(request.orderClientName),
      recipientPhone: validator.escape(request.orderClientPhone),
      recipientEmail: request.orderClientEmail ? validator.escape(request.orderClientEmail) : undefined,
      currency: request.currency ? validator.escape(request.currency) : undefined,
      orderSupplierId: request.orderSupplierId ? validator.escape(request.orderSupplierId) : undefined,
      packageManualCount: request.packageManualCount ? parseInt(validator.escape(request.packageManualCount + "")) : undefined,
      orderPaymentType: validator.escape(request.orderPaymentType) as CommodityPaymentType,
      orderPrice: parseFloat(validator.escape(request.orderPaymentPrice + "")),
      orderSource: OrderSource.Manual,
      packages: {
        create: packages,
      },
    };

    // Create new order
    await prisma.order.create({ data: newOrderData });

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
