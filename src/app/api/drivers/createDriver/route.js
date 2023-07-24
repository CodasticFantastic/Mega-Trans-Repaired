import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";
import Bcrypt from "bcryptjs";

export async function POST(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if ((!accessToken || !verifyJwt(accessToken)) || verifyJwt(accessToken).id.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Add new driver to database
  try {
    const request = await req.json();

    if (!request.driverName) throw new Error("Nie podano imienia kierowcy");
    if (!request.driverEmail) throw new Error("Nie podano adresu email kierowcy");
    if (!request.driverPhone) throw new Error("Nie podano numeru telefonu kierowcy");
    if (!request.driverPassword) throw new Error("Nie podano hasła kierowcy");
    if (!request.driverPasswordConfirm) throw new Error("Nie podano potwierdzenia hasła kierowcy");

    // Check if email is already in use
    const emailInUse = await prisma.driver.findUnique({
      where: {
        email: request.driverEmail,
      },
    });

    if (emailInUse) throw new Error("Podany adres email jest już w użyciu");

    // Check if password and passwordConfirm are the same
    if (request.driverPassword !== request.driverPasswordConfirm) throw new Error("Hasła nie są takie same");

    // Create new driver
    const salt = await Bcrypt.genSalt(10);
    const hashedPassword = await Bcrypt.hash(request.driverPassword, salt);

    const newDriver = await prisma.driver.create({
      data: {
        name: request.driverName,
        email: request.driverEmail,
        phone: request.driverPhone,
        password: hashedPassword,
      },
    });

    return new Response(JSON.stringify({ Success: "Success" }), {
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
