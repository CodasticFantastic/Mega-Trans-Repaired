import { getBaseLinkerApiKey } from "@/helpers/apiKey.handler";
import { determinePackagesQuantity } from "@/helpers/baselinker/determinePackagesQuantity";
import { decryptApiKey } from "@/helpers/encryption";
import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { createValidationErrorResponse } from "@/helpers/zod/validation";
import {
  CommodityPaymentType,
  CommodityType,
  OrderType,
  Prisma,
  Role,
  Status,
} from "@prisma/client";
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
    return new Response(
      JSON.stringify({ error: "BASE_LINKER_API_KEY_NOT_FOUND" }),
      {
        status: 400,
      }
    );
  }

  const blToken = decryptApiKey(baseLinkerApiKey.apiKey);

  try {
    const orderErrors: Record<string, string>[] = [];
    const orderNew: Record<string, string>[] = [];
    const orderUpdated: Record<string, string>[] = [];

    // 3. Validate POST body
    const body = await req.json();
    const parsedBody = z.safeParse(BaselinkerGetOrderPostValidator, body);

    if (!parsedBody.success) {
      return createValidationErrorResponse(parsedBody.error);
    }

    const { searchFrom, statusId } = parsedBody.data;

    //  4. Create searchFromTimestamp in seconds
    const searchFromTimestamp =
      dayjs.utc(searchFrom).startOf("day").toDate().getTime() / 1000;

    // 5. Get orders from BaseLinker
    let dynamicSearchFromTimestamp = searchFromTimestamp;
    const allOrders: any[] = [];
    const seen = new Set<number>();

    console.log("TEST: searchFromTimestamp", allOrders);

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
        return new Response(
          JSON.stringify({ error: "INVALID_BASELINKER_API_KEY" }),
          { status: 401 }
        );
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
      dynamicSearchFromTimestamp =
        Number(batch[batch.length - 1]?.date_confirmed) + 1;
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
    allOrders.forEach(async (order) => {
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
          commodityName: `BL - ${order.order_id} - ${
            i + 1
          } / ${packagesQuantity}`,
          commodityNote: order.extra_field_1,
        });
      }

      // 7.5 Check if order already exists in database
      const existingOrder = await prisma.order.findUnique({
        where: {
          orderSupplierId: String(order.order_id),
        },
      });

      if (existingOrder) {
        // Update order
        return;
      }

      // 7.6 Create order
      // 7.6.1 Check if payment method is valid

      //   if (order.payment_method_cod !== 1 || order.payment_method_cod !== 0) {
      //     orderErrors.push({
      //       orderId: order.order_id,
      //       error: "UNKNOWN_PAYMENT_METHOD",
      //     });
      //      console.log("TEST: order.payment_method_cod", order.payment_method_cod);
      //     return;
      //   }

      // 7.6.2 If payment method is Pobranie, generate price
      let orderPrice = calcOrderTotalSafe(order);

      console.log("TEST: address", order.delivery_address);
      // 7.6.3 Parse address
      const address = parseAddressPL(order.delivery_address);
      console.log("TEST: address", address);

      // 7.6.2 Create order data
      const newOrderData: Prisma.OrderCreateInput = {
        orderId: uuidv4(),
        user: { connect: { id: authResult.userId } },
        status: "Producent" as Status, //TODO: Przegadać z Megatrans jaki status tutaj dać?
        orderType: "Dostawa" as OrderType,
        orderCountry: validator.escape(order.delivery_country),
        orderStreet: validator.escape(address.street ?? ""),
        orderStreetNumber: validator.escape(address.number ?? ""),
        orderFlatNumber: address.apartment
          ? validator.escape(address.apartment)
          : undefined,
        orderCity: validator.escape(order.delivery_city),
        orderPostCode: validator.escape(order.delivery_postcode),
        orderState: validator.escape(order.delivery_state ?? ""),
        // TODO: Zły warunek logiczny
        orderNote:
          order.user_comments || order.admin_comments //
            ? validator.escape(order.user_comments || order.admin_comments) //
            : undefined, //
        recipientName: validator.escape(order.delivery_fullname),
        recipientPhone: validator.escape(order.phone),
        recipientEmail: order.email ? validator.escape(order.email) : undefined,
        currency: order.currency ? validator.escape(order.currency) : undefined,
        orderSupplierId: order.order_id ? String(order.order_id) : undefined,
        orderPaymentType: validator.escape(
          order.payment_method_cod === 1 ? "Pobranie" : "Przelew"
        ) as CommodityPaymentType,
        orderPrice: order.payment_method_cod === 1 ? orderPrice : undefined,
        packages: {
          create: packages,
        },
        orderSource: "BaseLinker",
      };

      const newOrder = await prisma.order.create({
        data: newOrderData,
        include: {
          packages: true,
        },
      });

      console.log("TEST: newOrder", newOrder);
    });

    return new Response(JSON.stringify({ orderErrors, data: allOrders }), {
      status: 200,
    });

    //
  } catch (error) {
    return new Response(JSON.stringify({ error: "INTERNAL_SERVER_ERROR" }), {
      status: 500,
    });
  }
}
