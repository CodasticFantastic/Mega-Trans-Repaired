import { Prisma } from "@prisma/client";

// Typy dla request body
export interface NewOrderRequest {
  orderId: string;
  status: string;
  orderType: string;
  orderCountry: string;
  orderStreet: string;
  orderStreetNumber: string;
  orderFlatNumber?: string;
  orderCity: string;
  orderPostCode: string;
  orderState: string;
  orderNote?: string;
  orderClientName: string;
  orderClientPhone: string;
  orderClientEmail?: string;
  currency?: string;
  orderPaymentType: string;
  orderPaymentPrice: number | string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  orderCommodityId: string;
  orderCommodityType: string;
  orderCommodityName: string;
  orderCommodityNote?: string;
}

// Typy dla package creation
export interface PackageCreateInput {
  packageId: string;
  commodityType: string;
  commodityName: string;
  commodityNote?: string;
}

// Typy dla order creation
export interface OrderCreateInput {
  orderId: string;
  userId: number;
  status: string;
  orderType: string;
  orderCountry: string;
  orderStreet: string;
  orderStreetNumber: string;
  orderFlatNumber?: string;
  orderCity: string;
  orderPostCode: string;
  orderState: string;
  orderNote?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  currency?: string;
  orderPaymentType: string;
  orderPrice: number;
  packages: {
    create: PackageCreateInput[];
  };
}
