import { ZodError } from "zod";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResponse {
  error: string;
  details: ValidationError[];
}

// Konwertuje błędy walidacji Zod na ustandaryzowany format odpowiedzi
function formatZodValidationErrors(zodError: ZodError): ValidationResponse {
  const errors = zodError.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return {
    error: "Validation failed",
    details: errors,
  };
}

// Tworzy Response z błędami walidacji
export function createValidationErrorResponse(
  zodError: ZodError,
  statusCode: number = 400
): Response {
  const validationResponse = formatZodValidationErrors(zodError);

  return new Response(JSON.stringify(validationResponse), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
