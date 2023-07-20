import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function GET(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");
  const { searchParams } = new URL(req.url);
  const id = +searchParams.get("id");

  if (!accessToken || verifyJwt(accessToken).id.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
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
    console.error("Add Order Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
