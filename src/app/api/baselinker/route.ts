import { NextRequest, NextResponse } from "next/server";
import { apiKeyAuth } from "@/helpers/apiKey.handler";
import { ApiKeyType } from "@prisma/client";

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

// Error response helper
function sendErrorResponse(errorCode: string, errorText: string = "") {
  return NextResponse.json({
    error: true,
    error_code: errorCode,
    error_text: errorText,
  });
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

    // Authenticate API key
    const authResult = await apiKeyAuth(blPass);

    if (!authResult.success) {
      return sendErrorResponse(
        "incorrect_password",
        "Nieprawidłowe hasło do komunikacji."
      );
    }

    // Check if the API key is of BaseLinker type
    if (authResult.apiKeyType !== ApiKeyType.BaseLinker) {
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
