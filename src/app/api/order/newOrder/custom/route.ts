import { apiKeyAuth } from "@/helpers/apiKey.handler";
import { createValidationErrorResponse } from "@/helpers/zod/validation";
import { ExternalApiNewOrderRequestSchema } from "types/order.types";
import z from "zod";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";
import { ApiKeyType, CommodityPaymentType, CommodityType, OrderSource, OrderType, Prisma, Status } from "@prisma/client";
import prisma from "@/helpers/prismaClient";

export async function POST(request: Request) {
  const xApiKey = request.headers.get("X-API-Key");

  const externalAuthResult = await apiKeyAuth(xApiKey);

  if (!externalAuthResult.success) {
    console.warn("[CUSTOM API] NEW ORDER - UNAUTHORIZED REQUEST");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (externalAuthResult.apiKeyType !== ApiKeyType.CustomIntegration) {
    console.warn("[CUSTOM API] NEW ORDER - UNAUTHORIZED REQUEST");
    return new Response(JSON.stringify({ error: "Invalid API Key Type" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const body = await request.json();

    const validatedRequest = z.safeParse(ExternalApiNewOrderRequestSchema, body);

    if (!validatedRequest.success) {
      return createValidationErrorResponse(validatedRequest.error);
    }

    const validatedData = validatedRequest.data;

    // Create packages array
    const packages: Omit<Prisma.PackageCreateInput, "belongsTo">[] = validatedData.orderItems.map((item) => {
      return {
        packageId: uuidv4(),
        commodityType: validator.escape(item.orderCommodityType) as CommodityType,
        commodityName: validator.escape(item.orderCommodityName),
        commodityNote: item.orderCommodityNote ? validator.escape(item.orderCommodityNote) : undefined,
      };
    });

    const newOrderData: Prisma.OrderCreateInput = {
      orderId: uuidv4(),
      user: { connect: { id: externalAuthResult.userId } },
      status: "Producent" as Status,
      orderType: validator.escape(validatedData.orderType) as OrderType,
      orderCountry: validator.escape(validatedData.orderCountry),
      orderStreet: validator.escape(validatedData.orderStreet),
      orderStreetNumber: validator.escape(validatedData.orderStreetNumber),
      orderFlatNumber: validatedData.orderFlatNumber ? validator.escape(validatedData.orderFlatNumber) : undefined,
      orderCity: validator.escape(validatedData.orderCity),
      orderPostCode: validator.escape(validatedData.orderPostCode),
      orderState: validatedData.orderState ? validator.escape(validatedData.orderState) : "",
      orderNote: validatedData.orderNote ? validator.escape(validatedData.orderNote) : undefined,
      recipientName: validator.escape(validatedData.orderClientName),
      recipientPhone: validator.escape(validatedData.orderClientPhone),
      recipientEmail: validatedData.orderClientEmail ? validator.escape(validatedData.orderClientEmail) : undefined,
      currency: validatedData.currency ? validator.escape(validatedData.currency) : undefined,
      orderSupplierId: validatedData.orderSupplierId ? validator.escape(validatedData.orderSupplierId) : undefined,
      orderPaymentType: validator.escape(validatedData.orderPaymentType) as CommodityPaymentType,
      orderPrice: parseFloat(validator.escape(validatedData.orderPaymentPrice + "")),
      orderSource: OrderSource.CustomIntegration,
      packages: {
        create: packages,
      },
    };

    // Create new order
    await prisma.order.create({ data: newOrderData });

    return new Response(JSON.stringify({ message: "Success" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
