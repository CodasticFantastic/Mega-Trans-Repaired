import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function GET(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if (!accessToken || !verifyJwt(accessToken) || verifyJwt(accessToken).id.role !== "ADMIN") {
    console.error("JwtError: Show All Orders Admin Error");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Pagination
  const { searchParams } = new URL(req.url);
  // const id = searchParams.get("id");
  const take = 20;
  const cursorQuery = searchParams.get("cursor") ?? undefined;
  const skip = cursorQuery ? 1 : 0;
  const cursor = cursorQuery ? { id: +cursorQuery } : undefined;

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
        status: status === "Wszystkie" ? undefined : status,
        createdAt: {
          gte: dateFrom ? new Date(dateFrom) : undefined,
          lte: dateTo ? new Date(dateTo) : undefined,
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

    const nextId = allUserOrder.length < take ? undefined : allUserOrder[take - 1].id;

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
