import { authGuard } from "@/helpers/jwt.handler";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  const authResult = authGuard("Get Users", accessToken, Role.DRIVER);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
    });
  }

  try {
    return new Response(JSON.stringify({ success: "Success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Driver Login Page Error: ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
