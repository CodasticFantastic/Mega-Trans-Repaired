import { CommodityPaymentType, CommodityType, OrderType, Prisma } from "@prisma/client";
import { z } from "zod";

export const SupportedCountry = {
  Polska: "Polska",
  Czechy: "Czechy",
} as const;

export const SupportedOrderType = {
  Zwrot: "Zwrot",
  Odbiór: "Odbiór",
  Dostawa: "Dostawa",
} as const;

export const SupportedPaymentType = {
  Pobranie: "Pobranie",
  Przelew: "Przelew",
} as const;

export const SupportedCommodityType = {
  Paczka: "Paczka",
  Gabaryt: "Gabaryt",
  Paleta: "Paleta",
} as const;

export type OrderWithUserAndPackages = Prisma.OrderGetPayload<{
  include: {
    user: true;
    packages: true;
  };
}>;

// Typy dla request body
export interface NewOrderRequest {
  orderId: string;
  status: string;
  orderType: OrderType;
  orderCountry: (typeof SupportedCountry)[keyof typeof SupportedCountry];
  orderStreet: string;
  orderStreetNumber: string;
  orderFlatNumber?: string | null;
  orderCity: string;
  orderPostCode: string;
  orderState: string;
  orderNote?: string;
  orderClientName: string;
  orderClientPhone: string;
  orderClientEmail?: string;
  orderSupplierId?: string;
  currency?: string;
  packageManualCount?: number;
  orderPaymentType: CommodityPaymentType;
  orderPaymentPrice: number | string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  orderCommodityId: string;
  orderCommodityType: CommodityType;
  orderCommodityName: string;
  orderCommodityNote?: string;
}

export const OrderItemSchema = z.object({
  orderCommodityId: z.string().min(1, "ID towaru jest wymagane"),
  orderCommodityType: z.enum(SupportedCommodityType, "Wymagana wartość: Paczka | Gabaryt | Paleta"),
  orderCommodityName: z.string().min(1, "Nazwa towaru jest wymagana"),
  orderCommodityNote: z.string().optional(),
});

export const NewOrderRequestSchema = z
  .object({
    orderId: z.string().min(1, "ID zamówienia jest wymagane"),
    status: z.literal("Producent", {
      error: "Pole wymaga wartości: Producent",
    }),
    orderType: z.enum(SupportedOrderType, "Wymagana wartość: Zwrot | Odbiór | Dostawa"),
    orderCountry: z.enum(SupportedCountry, "Wymagana wartość: Polska | Czechy"),
    orderStreet: z.string().min(1, "Ulica jest wymagana"),
    orderStreetNumber: z.string().min(1, "Numer ulicy jest wymagany"),
    orderFlatNumber: z.string().nullable().optional(),
    orderCity: z.string().min(1, "Miasto jest wymagane"),
    orderPostCode: z.string().min(1, "Kod pocztowy jest wymagany"),
    orderState: z.string().min(1, "Województwo jest wymagane"),
    orderNote: z.string().optional(),
    orderClientName: z.string().min(1, "Nazwa klienta jest wymagana"),
    orderClientPhone: z.string().min(1, "Telefon klienta jest wymagany"),
    orderClientEmail: z.string().email("Nieprawidłowy format email").optional().or(z.literal("")),
    orderSupplierId: z.string().optional(),
    currency: z.string().optional(),
    packageManualCount: z.number().int().positive("Liczba paczek musi być dodatnia").optional(),
    orderPaymentType: z.enum(SupportedPaymentType, "Wymagana wartość: Pobranie | Przelew"),
    orderPaymentPrice: z
      .union([
        z.number().positive("Cena musi być liczbą dodatnią"),
        z
          .string()
          .min(1, "Cena jest wymagana")
          .transform((val) => {
            const num = parseFloat(val);
            if (isNaN(num) || num <= 0) {
              throw new Error("Cena musi być liczbą dodatnią");
            }
            return num;
          }),
        z.null(),
        z.undefined(),
      ])
      .optional(),
    orderItems: z.array(OrderItemSchema).min(1, "Przynajmniej jeden towar jest wymagany"),
  })
  .superRefine((data, ctx) => {
    if (data.orderPaymentType === "Pobranie" && !data.orderPaymentPrice) {
      ctx.addIssue({
        path: ["orderPaymentPrice"],
        code: "custom",
        message: "Cena jest wymagana, gdy wybrano 'Pobranie'",
      });
    }
  });

// CUSTOM API REQUEST (FOR EXTERNAL AUTOMATED CLIENTS)
export interface ExternalApiOrderItem extends Omit<OrderItem, "orderCommodityId"> {}

export interface ExternalApiNewOrderRequest extends Omit<NewOrderRequest, "orderId" | "orderItems"> {
  status: "Producent";
  orderItems: ExternalApiOrderItem[];
}

export const ExternalApiOrderItemSchema = z.object({
  orderCommodityType: z.enum(SupportedCommodityType, "Wymagana wartość: Paczka | Gabaryt | Paleta"),
  orderCommodityName: z.string().min(1, "Nazwa towaru jest wymagana"),
  orderCommodityNote: z.string().optional(),
});

export const ExternalApiNewOrderRequestSchema = z
  .object({
    orderType: z.enum(SupportedOrderType, "Wymagana wartość: Zwrot | Odbiór | Dostawa"),
    orderCountry: z.enum(SupportedCountry, "Wymagana wartość: Polska | Czechy"),
    orderStreet: z.string().min(1, "Ulica jest wymagana"),
    orderStreetNumber: z.string().min(1, "Numer ulicy jest wymagany"),
    orderFlatNumber: z.string().nullable().optional(),
    orderCity: z.string().min(1, "Miasto jest wymagane"),
    orderPostCode: z.string().min(1, "Kod pocztowy jest wymagany"),
    orderState: z.string().nullable().optional(),
    orderNote: z.string().nullable().optional(),
    orderClientName: z.string().min(1, "Nazwa klienta jest wymagana"),
    orderClientPhone: z
      .string()
      .min(1, "Telefon klienta jest wymagany")
      .regex(/^\d+$/, "Numer telefonu może zawierać wyłącznie cyfry (bez spacji)"),
    orderClientEmail: z.string().email({ message: "Nieprawidłowy format email" }).nullable().optional().or(z.literal("")),
    orderSupplierId: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    orderPaymentType: z.enum(SupportedPaymentType, "Wymagana wartość: Pobranie | Przelew"),
    orderPaymentPrice: z
      .union([
        z.number().positive("Cena musi być liczbą dodatnią"),
        z
          .string()
          .min(1, "Cena jest wymagana")
          .transform((val) => {
            const num = parseFloat(val);
            if (isNaN(num) || num <= 0) {
              throw new Error("Cena musi być liczbą dodatnią");
            }
            return num;
          }),
        z.null(),
        z.undefined(),
      ])
      .nullable()
      .optional(),
    orderItems: z.array(ExternalApiOrderItemSchema).min(1, "Wymagany jest przynajmniej jeden element w tablicy orderItems"),
  })
  .superRefine((data, ctx) => {
    if (data.orderPaymentType === "Pobranie" && !data.orderPaymentPrice) {
      ctx.addIssue({
        path: ["orderPaymentPrice"],
        code: "custom",
        message: "Cena jest wymagana, gdy wybrano 'Pobranie'",
      });
    }
  });
