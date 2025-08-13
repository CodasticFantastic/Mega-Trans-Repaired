import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export async function GET(req: Request) {
  dayjs.extend(utc);
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Show All Orders", accessToken, Role.USER);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  // Pagination
  const { searchParams } = new URL(req.url);
  const take = 20;
  const cursorQuery = searchParams.get("cursor");

  // Naprawiona logika cursor
  let cursor = undefined;
  let skip = 0;

  if (cursorQuery && cursorQuery !== "" && cursorQuery !== "false") {
    const cursorId = parseInt(cursorQuery);
    if (!isNaN(cursorId) && cursorId > 0) {
      cursor = { id: cursorId };
      skip = 1;
    }
  }

  const searchId = searchParams.get("searchId");
  const orderBy = searchParams.get("orderBy");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const postalCode = searchParams.get("postalCode");

  try {
    // Show all orders for this user
    const allUserOrder = await prisma.order.findMany({
      include: {
        user: {
          select: {
            company: true,
          },
        },
        packages: true,
      },
      orderBy: {
        updatedAt: orderBy === "asc" ? "asc" : "desc",
      },
      where: {
        userId: authResult.userId,
        OR: [
          { orderId: { contains: searchId ? searchId : "" } },
          { recipientPhone: { contains: searchId ? searchId : "" } },
          { orderCity: { contains: searchId ? searchId : "" } },
          { recipientName: { contains: searchId ? searchId : "" } },
          { orderSupplierId: { contains: searchId ? searchId : "" } },
        ],
        status: status === "Wszystkie" ? undefined : status,
        createdAt: {
          gte: dateFrom
            ? dayjs.utc(dateFrom).startOf("day").toDate()
            : undefined,
          lte: dateTo ? dayjs.utc(dateTo).endOf("day").toDate() : undefined,
        },
        orderPostCode: {
          startsWith: postalCode === "all" ? undefined : postalCode,
        },
      },
      skip,
      take,
      cursor,
    });

    // Return Data Counters
    const allOrdersCounter = await prisma.order.count({
      where: {
        userId: authResult.userId,
      },
    });
    const newOrdersCounter = await prisma.order.count({
      where: {
        userId: authResult.userId,
        status: "Producent",
      },
    });
    const currentOrdersCounter = await prisma.order.count({
      where: {
        userId: authResult.userId,
        status: { in: ["Producent", "Magazyn", "Dostawa"] },
      },
    });
    const warehouseOrdersCounter = await prisma.order.count({
      where: {
        userId: authResult.userId,
        status: "Magazyn",
      },
    });
    const realizedOrdersCounter = await prisma.order.count({
      where: {
        userId: authResult.userId,
        status: "Zrealizowane",
      },
    });

    const nextId =
      allUserOrder.length < take ? undefined : allUserOrder[take - 1].id;

    return new Response(
      JSON.stringify({
        allUserOrder,
        nextId,
        allOrdersCounter,
        newOrdersCounter,
        currentOrdersCounter,
        warehouseOrdersCounter,
        realizedOrdersCounter,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Show All Orders Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
