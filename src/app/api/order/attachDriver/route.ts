import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";

export async function PATCH(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Get Users", accessToken, Role.ADMIN);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
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

        // Send SMS to client
        let number;

        if (updatedOrder.orderCountry === "Polska") {
          number = "48" + updatedOrder.recipientPhone;
        } else if (updatedOrder.orderCountry === "Czechy") {
          number = "420" + updatedOrder.recipientPhone;
        }

        await fetch("https://api.smsapi.pl/sms.do", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SMS_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: number,
            from: "2way",
            message: `Dostawa Mebli: ${
              updatedOrder.deliveryDate.split(" ")[0]
            } \nGodzina: ${
              updatedOrder.deliveryDate.split(" ")[1]
            } \n\nKierowca nie wnosi mebli. \n\nW celu potwierdzenia dostawy odpisz POTWIERDZAM \n\nPozdrawiamy \nFirma MegaTrans`,
            format: "json",
            // test: 1,
            details: 1,
          }),
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

        // Send SMS to client
        let number;

        if (updatedOrder.orderCountry === "Polska") {
          number = "48" + updatedOrder.recipientPhone;
        } else if (updatedOrder.orderCountry === "Czechy") {
          number = "420" + updatedOrder.recipientPhone;
        }

        await fetch("https://api.smsapi.pl/sms.do", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SMS_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: number,
            from: "2way",
            message: `Dostawa Mebli: ${
              updatedOrder.deliveryDate.split(" ")[0]
            } \nGodzina: ${
              updatedOrder.deliveryDate.split(" ")[1]
            } \n\nKierowca nie wnosi mebli. \n\nW celu potwierdzenia dostawy odpisz POTWIERDZAM \n\nPozdrawiamy \nFirma MegaTrans`,
            format: "json",
            // test: 1,
            details: 1,
          }),
        });
      }
    }

    return new Response(
      JSON.stringify({ success: "Rekordy zaktualizowano pomyślnie" }),
      { status: 200 }
    );
  } catch (error) {
    // Send Error response
    console.error("Attach Driver Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
