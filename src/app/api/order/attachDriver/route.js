import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function PATCH(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if (!accessToken || !verifyJwt(accessToken) || verifyJwt(accessToken).id.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    let body = await req.json();
    let driver = "";
    let driverObject;

    for (let order of body) {
      if (order.driver !== driver) {
        const driverExists = await prisma.driver.findUnique({
          where: {
            name: order.driver,
          },
        });

        if (!driverExists) throw new Error("Kierowca nie istnieje");

        driver = order.driver;
        driverObject = driverExists;

        // Update order status
        const updatedOrder = await prisma.order.update({
          where: {
            orderId: order.id,
          },
          data: {
            status: "Dostawa",
            deliveryDate: order.deliveryDate,
            courier: {
              connect: {
                id: driverObject.id,
              },
            },
          },
        });
      } else if (order.driver === driver) {
        // Update order status
        const updatedOrder = await prisma.order.update({
          where: {
            orderId: order.id,
          },
          data: {
            status: "Dostawa",
            deliveryDate: order.deliveryDate,
            courier: {
              connect: {
                id: driverObject.id,
              },
            },
          },
        });
      }
    }

    return new Response(JSON.stringify({ success: "Rekordy zaktualizowano pomyślnie" }), { status: 200 });
  } catch (error) {
    // Send Error response
    console.error("Get Order Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
