import z from "zod";

// Schemat dla CustomIntegration (tylko nazwa)
export const BaselinkerGetOrderPostValidator = z.object({
  searchFrom: z
    .string()
    .min(1, "Wymagana jest podanie daty")
    .refine((val) => !isNaN(Date.parse(val)), "Nieprawidłowa data"),
  statusId: z.number(),
});
