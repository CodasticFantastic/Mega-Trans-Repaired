import z from "zod";

export const CreateApiKeySchema = z.object({
  apiKeyName: z.string().min(1, "Nazwa klucza API jest wymagana"),
});

export const DeleteApiKeySchema = z.object({
  apiKey: z.string().min(1, "Klucz API jest wymagany"),
});
