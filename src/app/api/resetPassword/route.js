import prisma from "@/helpers/prismaClient";

export async function POST(req) {
  const request = await req.json();
  const email = request.email;

  try {
    // Find user in DB
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) throw new Error("Użytkownik nie istnieje");
  } catch (error) {
    // Send Error response
    console.error("Add Order Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
