import { getBaseLinkerApiKey } from "@/helpers/apiKey.handler";
import { determinePackagesQuantity } from "@/helpers/baselinker/determinePackagesQuantity";
import { decryptApiKey } from "@/helpers/encryption";
import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { createValidationErrorResponse } from "@/helpers/zod/validation";
import { CommodityPaymentType, CommodityType, OrderSource, OrderType, Prisma, Role, Status } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { BaselinkerGetOrderPostValidator } from "types/baselinker.types";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import { calcOrderTotalSafe } from "@/helpers/baselinker/calculateOrderTotal";
import { parseAddressPL } from "@/helpers/baselinker/address.parser.pl";

export async function POST(req: Request) {
  dayjs.extend(utc);

  // 1. Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");
  const authResult = authGuard("Import Orders", accessToken, [Role.USER]);

  if (!authResult.success || !authResult.userId) {
    return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
      status: 401,
    });
  }

  // 2. Get the BaseLinker API key for the user and decode BL-Token
  const baseLinkerApiKey = await getBaseLinkerApiKey(authResult.userId);

  if (!baseLinkerApiKey) {
    return new Response(JSON.stringify({ error: "BASE_LINKER_API_KEY_NOT_FOUND" }), {
      status: 400,
    });
  }

  const blToken = decryptApiKey(baseLinkerApiKey.apiKey);

  try {
    const orderErrors: Record<string, string>[] = [];
    const orderNew: Record<string, string>[] = [];
    const orderExists: Record<string, string>[] = [];

    // 3. Validate POST body
    const body = await req.json();
    const parsedBody = z.safeParse(BaselinkerGetOrderPostValidator, body);

    if (!parsedBody.success) {
      return createValidationErrorResponse(parsedBody.error);
    }

    const { searchFrom, statusId, newStatusId } = parsedBody.data;

    //  4. Create searchFromTimestamp in seconds
    const searchFromTimestamp = dayjs.utc(searchFrom).startOf("day").toDate().getTime() / 1000;

    // 5. Get orders from BaseLinker
    let dynamicSearchFromTimestamp = searchFromTimestamp;
    const allOrders: any[] = [];
    const seen = new Set<number>();

    // 6. Loop until all orders are fetched
    while (true) {
      const res = await fetch("https://api.baselinker.com/connector.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-BLToken": blToken,
        },
        body: new URLSearchParams({
          method: "getOrders",
          parameters: JSON.stringify({
            date_confirmed_from: dynamicSearchFromTimestamp,
            get_unconfirmed_orders: false,
            status_id: statusId,
          }),
        }),
      });

      const data = await res.json();

      if (data?.status === "ERROR" && data?.error_code === "ERROR_BAD_TOKEN") {
        return new Response(JSON.stringify({ error: "INVALID_BASELINKER_API_KEY" }), { status: 401 });
      }

      const batch = Array.isArray(data?.orders) ? data.orders : [];
      for (const o of batch) {
        const id = o?.order_id;
        if (id != null && !seen.has(id)) {
          seen.add(id);
          allOrders.push(o);
        }
      }

      if (batch.length < 100) break;
      dynamicSearchFromTimestamp = Number(batch[batch.length - 1]?.date_confirmed) + 1;
    }

    if (allOrders.length === 0) {
      return new Response(JSON.stringify({ error: "NO_ORDERS_FOUND" }), {
        status: 200,
      });
    }

    // 7. Save new orders to database
    // 7.1 Sort orders by order_id
    allOrders.sort((a, b) => a.order_id - b.order_id);

    // 7.2 Save orders to database
    await Promise.all(
      allOrders.map(async (order) => {
        // 7.2.1 Check if order already exists in database
        const existingOrder = await prisma.order.findFirst({
          where: {
            userId: authResult.userId,
            orderSupplierId: String(order.order_id),
            orderSource: OrderSource.BaseLinker,
          },
        });

        // 7.2.2 If order exists, add it to orderExists array and do no more processing
        if (existingOrder) {
          orderExists.push(existingOrder.orderId);

          return;
        }

        // 7.3 Get packages number from order
        const packagesQuantity = determinePackagesQuantity(order.extra_field_1);

        if (!packagesQuantity) {
          orderErrors.push({
            orderId: order.order_id,
            error: "INVALID_PACKAGES_QUANTITY",
          });
          return;
        }

        // 7.4 Create packages
        const packages: Omit<Prisma.PackageCreateInput, "belongsTo">[] = [];
        for (let i = 0; i < packagesQuantity; i++) {
          packages.push({
            packageId: uuidv4(),
            commodityType: "Paczka" as CommodityType,
            commodityName: `BL - ${order.order_id} - ${i + 1} / ${packagesQuantity}`,
            commodityNote: order.extra_field_1,
          });
        }

        // 7.5.1 Check if payment method is valid ( 1 - Pobranie, 0 - Przelew )
        if (!["0", "1"].includes(order.payment_method_cod)) {
          orderErrors.push({
            orderId: order.order_id,
            error: "UNKNOWN_PAYMENT_METHOD",
          });

          return;
        }

        // 7.5.2 If payment method is Pobranie, generate price
        let orderPrice = order.payment_method_cod === "1" ? calcOrderTotalSafe(order) : undefined;

        // 7.5.3 Check if address is provided
        if (!order.delivery_address) {
          orderErrors.push({
            orderId: order.order_id,
            error: "INVALID_ADDRESS",
          });
          return;
        }

        // 7.5.3 Parse address
        const parsedAddress = parseAddressPL(order.delivery_address);

        // 7.5.4 Prepare order notes
        const orderNotes: string[] = [];

        orderNotes.push(`Adres dostawy BL: ${order.delivery_address}`);

        if (order.user_comments && order.user_comments.trim()) {
          orderNotes.push(`Komentarz Klienta: ${validator.escape(order.user_comments.trim())}`);
        }

        if (order.admin_comments && order.admin_comments.trim()) {
          orderNotes.push(`Komentarz Admina BL: ${validator.escape(order.admin_comments.trim())}`);
        }

        const orderNotesString = orderNotes.length > 0 ? orderNotes.join("\n") : undefined;

        // If newStatusId is provided, change BaseLinker status to newStatusId
        if (newStatusId) {
          const res = await fetch("https://api.baselinker.com/connector.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-BLToken": blToken,
            },
            body: new URLSearchParams({
              method: "setOrderStatus",
              parameters: JSON.stringify({
                order_id: order.order_id,
                status_id: newStatusId,
              }),
            }),
          });

          const data = await res.json();

          if (data?.status === "ERROR" && data?.error_code === "ERROR_BAD_STATUS_ID") {
            throw new Error("INVALID_NEW_BL_STATUS_ID");
          }
        }

        // 7.6 Create new order
        // 7.6.1 Create order data
        const newOrderData: Prisma.OrderCreateInput = {
          orderId: uuidv4(),
          user: { connect: { id: authResult.userId } },
          status: "Producent" as Status,
          orderType: "Dostawa" as OrderType,
          orderCountry: validator.escape(order.delivery_country),
          orderStreet: validator.escape(parsedAddress.street ?? ""),
          orderStreetNumber: validator.escape(parsedAddress.number ?? ""),
          orderFlatNumber: parsedAddress.apartment ? validator.escape(parsedAddress.apartment) : undefined,
          orderCity: validator.escape(order.delivery_city),
          orderPostCode: validator.escape(order.delivery_postcode),
          orderState: validator.escape(order.delivery_state ?? ""),
          orderNote: orderNotesString,
          recipientName: validator.escape(
            order.delivery_company ? `${order.delivery_company} - ${order.delivery_fullname}` : order.delivery_fullname
          ),
          recipientPhone: validator.escape(order.phone),
          recipientEmail: order.email ? validator.escape(order.email) : undefined,
          currency: order.currency ? validator.escape(order.currency) : undefined,
          orderSupplierId: order.order_id ? String(order.order_id) : undefined,
          orderPaymentType: validator.escape(order.payment_method_cod === "1" ? "Pobranie" : "Przelew") as CommodityPaymentType,
          orderPrice: order.payment_method_cod === "1" ? orderPrice : undefined,
          orderAddressConfidence: parsedAddress.confidence,
          orderAddressRawData: order.delivery_address,
          packages: {
            create: packages,
          },
          orderSource: "BaseLinker",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const newOrder = await prisma.order.create({
          data: newOrderData,
          include: {
            packages: true,
          },
        });

        // Add orderId to track in BaseLinker in Extra Field 2
        await fetch("https://api.baselinker.com/connector.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-BLToken": blToken,
          },
          body: new URLSearchParams({
            method: "setOrderFields",
            parameters: JSON.stringify({
              order_id: order.order_id,
              extra_field_2: newOrder.orderId,
            }),
          }),
        });

        orderNew.push(newOrder.orderId);
      })
    );

    return new Response(JSON.stringify({ orderErrors, orderNew, orderExists }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_NEW_BL_STATUS_ID") {
        return new Response(JSON.stringify({ error: "INVALID_NEW_BL_STATUS_ID" }), {
          status: 400,
        });
      }
    }

    return new Response(JSON.stringify({ error: "INTERNAL_SERVER_ERROR" }), {
      status: 500,
    });
  }
}
