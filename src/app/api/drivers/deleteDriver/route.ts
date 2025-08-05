import { authGuard } from "@/helpers/jwt.handler";
import prisma from "@/helpers/prismaClient";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");
  const { searchParams } = new URL(req.url);
  const id = +searchParams.get("id")!;

  if (!id) {
    return new Response(JSON.stringify({ error: "Nie podano id kierowcy" }), {
      status: 400,
    });
  }

  const authResult = authGuard("Delete Driver", accessToken, Role.ADMIN);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  try {
    //Delete driver from db
    const deletedDriver = await prisma.driver.delete({
      where: {
        id: id,
      },
    });

    return new Response(JSON.stringify({ Succes: "Kierowca usunięty" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Delete Driver Page Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
