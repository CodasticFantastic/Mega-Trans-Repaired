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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const searchId = searchParams.get("searchId");
  const orderBy = searchParams.get("orderBy");
  const sortBy = searchParams.get("sortByDate") || "updatedAt";
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const postalCode = searchParams.get("postalCode");

  try {
    // Build where clause for filtering
    const whereClause = {
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
        gte: dateFrom ? dayjs.utc(dateFrom).startOf("day").toDate() : undefined,
        lte: dateTo ? dayjs.utc(dateTo).endOf("day").toDate() : undefined,
      },
      orderPostCode: {
        startsWith: postalCode === "all" ? undefined : postalCode,
      },
    };

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
        [sortBy]: orderBy === "asc" ? "asc" : "desc",
      },
      where: whereClause,
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.order.count({
      where: whereClause,
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

    return new Response(
      JSON.stringify({
        allUserOrder,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1,
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
