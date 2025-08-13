import { NextRequest, NextResponse } from "next/server";

// BaseLinker integration configuration
const BASELINKER_PASS =
  process.env.BASELINKER_PASS || "l2il7serw6q4iksgamo4fwzvylsma6sp";

// Database configuration - you'll need to set these environment variables
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "",
  pass: process.env.DB_PASS || "",
  name: process.env.DB_NAME || "",
  prefix: process.env.DB_PREFIX || "",
  charset: "UTF-8",
};

// Error response helper
function sendErrorResponse(errorCode: string, errorText: string = "") {
  return NextResponse.json({
    error: true,
    error_code: errorCode,
    error_text: errorText,
  });
}

// FileVersion method - required for BaseLinker integration
function handleFileVersion() {
  return {
    platform: "Megatrans.online",
    version: "1.0.0",
    standard: 4,
  };
}

// SupportedMethods method - returns list of implemented methods
function handleSupportedMethods() {
  return [
    "FileVersion",
    "SupportedMethods",
    // Add more methods here as you implement them
  ];
}

// Main handler function
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const blPass = formData.get("bl_pass") as string;
    const action = formData.get("action") as string;

    // Check if password is provided
    if (!blPass) {
      return sendErrorResponse(
        "no_password",
        "Odwołanie do pliku bez podania hasła. Jest to poprawny komunikat jeśli plik integracyjny został otworzony w przeglądarce internetowej."
      );
    }

    // Check if password is correct
    if (!BASELINKER_PASS || BASELINKER_PASS !== blPass) {
      return sendErrorResponse(
        "incorrect_password",
        "Nieprawidłowe hasło do komunikacji."
      );
    }

    // Handle different actions
    let response: any;

    switch (action) {
      case "FileVersion":
        response = handleFileVersion();
        break;

      case "SupportedMethods":
        response = handleSupportedMethods();
        break;

      default:
        return sendErrorResponse(
          "unsupported_action",
          `Nieobsługiwana akcja: ${action}`
        );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("BaseLinker integration error:", error);
    return sendErrorResponse("internal_error", "Wystąpił błąd wewnętrzny.");
  }
}

// Handle GET requests (for testing in browser)
export async function GET() {
  return sendErrorResponse(
    "no_password",
    "Odwołanie do pliku bez podania hasła. Jest to poprawny komunikat jeśli plik integracyjny został otworzony w przeglądarce internetowej."
  );
}
