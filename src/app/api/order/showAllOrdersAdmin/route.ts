import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export async function GET(req: Request) {
  dayjs.extend(utc);
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard(
    "Show All Orders Admin",
    accessToken,
    Role.ADMIN
  );

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  // Pagination
  const { searchParams } = new URL(req.url);
  // const id = searchParams.get("id");
  const take = 20;
  const cursorQuery = searchParams.get("cursor") ?? undefined;
  const skip = cursorQuery ? 1 : 0;
  const cursor = cursorQuery ? { id: +cursorQuery } : undefined;

  const searchId = searchParams.get("searchId");
  const orderBy = searchParams.get("orderBy");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const postalCode = searchParams.get("postalCode");

  console.log("TEST:", dateFrom);
  console.log("TEST:", new Date(dateFrom!));
  console.log("TEST:", dayjs.utc(dateFrom).toDate());

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
        OR: [
          { orderId: { contains: searchId ? searchId : "" } },
          { recipientPhone: { contains: searchId ? searchId : "" } },
          { orderCity: { contains: searchId ? searchId : "" } },
          { recipientName: { contains: searchId ? searchId : "" } },
          { user: { company: { contains: searchId ? searchId : "" } } },
        ],
        status: status === "Wszystkie" ? undefined : status,
        createdAt: {
          gte: dateFrom ? dayjs.utc(dateFrom).toDate() : undefined,
          lte: dateTo ? dayjs.utc(dateTo).toDate() : undefined,
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
    const allOrdersCounter = await prisma.order.count({});
    const newOrdersCounter = await prisma.order.count({
      where: {
        status: "Producent",
      },
    });
    const currentOrdersCounter = await prisma.order.count({
      where: {
        status: { in: ["Producent", "Magazyn", "Dostawa"] },
      },
    });
    const warehouseOrdersCounter = await prisma.order.count({
      where: {
        status: "Magazyn",
      },
    });
    const realizedOrdersCounter = await prisma.order.count({
      where: {
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
    // Send Error response
    console.error("Show All Orders Admin Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
