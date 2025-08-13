import { ApiKeyType } from "@prisma/client";
import z from "zod";

export const SupportedApiKeyType: Record<string, ApiKeyType> = {
  BaseLinker: "BaseLinker",
  CustomIntegration: "CustomIntegration",
} as const;

// Schemat dla CustomIntegration (tylko nazwa)
const CustomIntegrationSchema = z.object({
  apiKeyName: z.string().min(1, "Nazwa klucza API jest wymagana"),
  apiKeyType: z.literal(SupportedApiKeyType.CustomIntegration),
});

// Schemat dla BaseLinker (nazwa + wartość klucza)
const BaseLinkerSchema = z.object({
  apiKeyName: z.string().min(1, "Nazwa klucza API jest wymagana"),
  apiKeyType: z.literal(SupportedApiKeyType.BaseLinker),
  apiKeyValue: z.string().min(1, "Wartość klucza API jest wymagana"),
});

// Union schema - wybiera odpowiedni schemat na podstawie apiKeyType
export const CreateApiKeySchema = z.discriminatedUnion("apiKeyType", [
  CustomIntegrationSchema,
  BaseLinkerSchema,
]);

export const DeleteApiKeySchema = z.object({
  apiKey: z.string().min(1, "Klucz API jest wymagany"),
});
