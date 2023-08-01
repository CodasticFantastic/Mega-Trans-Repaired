import { verifyJwt } from "@/helpers/generateJwToken";

export async function GET(req) {
  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  try {
    if (!accessToken || !verifyJwt(accessToken)) {
      console.error("JwtError: Driver Login Page Error");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    return new Response(JSON.stringify({ success: "Success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Send Error response
    console.error("Driver Login Page Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
