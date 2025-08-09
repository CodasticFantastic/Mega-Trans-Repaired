import { OpenAPIV3 } from "openapi-types";

export async function GET() {
  // const spec: OpenAPIV3.Document = {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "MegaTrans API Dokumentacja",
      version: "1.0.0",
      description:
        "API wymaga przesyłania danych w standardzie JSON.\n\n W celu komunikacji z API wymagane jest wygenerowanie klucza API w panelu klienta. \n\n Pamiętaj, że odpowiadasz za poprawność wprowadzanych danych i ich zgodność z formatami.",
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Klucz API do autoryzacji (Request Header)",
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
      "/order/newOrder/custom": {
        post: {
          summary: "Utwórz nowe zamówienie",
          description: "Endpoint do tworzenia nowych zamówień.",
          security: [{ ApiKeyAuth: [] }],
          "x-codeSamples": [
            {
              lang: "JSON",
              label: "JSON Example",
              source: `{
  "orderType": "Dostawa",
  "orderCountry": "Polska",
  "orderStreet": "Kwiatowa",
  "orderStreetNumber": "12",
  "orderFlatNumber": "5",
  "orderCity": "Warszawa",
  "orderPostCode": "00-001",
  "orderState": "Mazowieckie",
  "orderNote": "Proszę dzwonić przed dostawą",
  "orderClientName": "Jan Kowalski",
  "orderClientPhone": "500600700",
  "orderClientEmail": "jan.kowalski@example.com",
  "orderSupplierId": "#123456789",
  "currency": "PLN",
  "orderPaymentType": "Pobranie",
  "orderPaymentPrice": 199.99,
  "orderItems": [
    {
      "orderCommodityType": "Paczka",
      "orderCommodityName": "Części samochodowe",
      "orderCommodityNote": "Traktować delikatnie"
    },
    {
      "orderCommodityType": "Gabaryt",
      "orderCommodityName": "Sofa Składana",
      "orderCommodityNote": "Nr magazynowy: 1234567890"
    },
    {
      "orderCommodityType": "Paleta",
      "orderCommodityName": "Zwroty od producenta"
    }
  ]
}`,
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "orderType",
                    "orderCountry",
                    "orderStreet",
                    "orderStreetNumber",
                    "orderCity",
                    "orderPostCode",
                    "orderState",
                    "orderClientName",
                    "orderClientPhone",
                    "orderPaymentType",
                    "orderItems",
                  ],
                  properties: {
                    orderType: {
                      title: "Typ zamówienia",
                      type: "string",
                      enum: ["Dostawa", "Odbiór", "Zwrot"],
                    },
                    orderCountry: {
                      title: "Kraj",
                      type: "string",
                      enum: ["Polska", "Czechy"],
                    },
                    orderStreet: {
                      title: "Ulica",
                      type: "string",
                    },
                    orderStreetNumber: {
                      title: "Numer ulicy",
                      type: "string",
                    },
                    orderFlatNumber: {
                      title: "Numer mieszkania",
                      type: "string",
                    },
                    orderCity: {
                      title: "Miasto",
                      type: "string",
                    },
                    orderPostCode: {
                      title: "Kod pocztowy",
                      type: "string",
                      example: ["00-001", "000 00"],
                      description:
                        "Kod pocztowy w formacie 00-001 (Polska) lub 000 00 (Czechy)",
                    },
                    orderState: {
                      title: "Województwo",
                      type: "string",
                    },
                    orderNote: {
                      title: "Notatka do zamówienia",
                      type: "string",
                    },
                    orderClientName: {
                      title: "Imie i nazwisko odbiorcy lub nazwa firmy",
                      type: "string",
                      example: "Jan Kowalski",
                    },
                    orderClientPhone: {
                      title: "Telefon klienta",
                      type: "string",
                      format: "tel",
                      example: "500600700",
                      description:
                        "Numer telefonu może zawierać wyłącznie cyfry (bez spacji)",
                    },
                    orderClientEmail: {
                      title: "Email klienta",
                      type: "string",
                      format: "email",
                      example: "jan.kowalski@example.com",
                    },
                    orderSupplierId: {
                      title: "Wewnętrzne ID zamówienia z systemu dostawcy",
                      type: "string",
                      example: "#123456789",
                    },
                    currency: {
                      title: "Waluta",
                      type: "string",
                      enum: ["PLN", "CZK", "EUR"],
                    },
                    orderPaymentType: {
                      title: "Typ płatności",
                      type: "string",
                      enum: ["Pobranie", "Przelew"],
                      description:
                        'W przypadku "Pobranie" wymagane uzupełnienie pola "orderPaymentPrice"',
                    },
                    orderPaymentPrice: {
                      title: "Wartość pobrania",
                      type: "number",
                      example: 199.99,
                      description:
                        "Wartość pobrania w formacie liczbowym (np. 199.99)",
                    },
                    orderItems: {
                      title: "Elementy zamówienia",
                      type: "array",
                      items: {
                        type: "object",
                        required: ["orderCommodityType", "orderCommodityName"],
                        properties: {
                          orderCommodityType: {
                            title: "Typ towaru",
                            type: "string",
                            enum: ["Paczka", "Paleta", "Gabaryt"],
                          },
                          orderCommodityName: {
                            title: "Nazwa towaru",
                            type: "string",
                          },
                          orderCommodityNote: {
                            title: "Notatka do towaru",
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
                example: {
                  orderType: "Dostawa",
                  orderCountry: "Polska",
                  orderStreet: "Kwiatowa",
                  orderStreetNumber: "12",
                  orderFlatNumber: "5",
                  orderCity: "Warszawa",
                  orderPostCode: "00-001",
                  orderState: "Mazowieckie",
                  orderNote: "Proszę dzwonić przed dostawą",
                  orderClientName: "Jan Kowalski",
                  orderClientPhone: "+48 123 456 789",
                  orderClientEmail: "jan.kowalski@example.com",
                  orderSupplierId: "#123456789",
                  currency: "PLN",
                  orderPaymentType: "Pobranie",
                  orderPaymentPrice: 199.99,
                  orderItems: [
                    {
                      orderCommodityType: "Paczka",
                      orderCommodityName: "Części samochodowe",
                      orderCommodityNote: "Traktować delikatnie",
                    },
                    {
                      orderCommodityType: "Gabaryt",
                      orderCommodityName: "Sofa Składana",
                      orderCommodityNote: "Nr magazynowy: 1234567890",
                    },
                    {
                      orderCommodityType: "Paleta",
                      orderCommodityName: "Zwroty od producenta",
                    },
                  ],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Sukces",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Success" },
                    },
                  },
                },
              },
            },
            "401": {
              description:
                "Brak autoryzacji (nieprawidłowy lub brak X-API-Key)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string", example: "Unauthorized" },
                    },
                  },
                },
              },
            },
            "422": {
              description: "Błąd walidacji danych wejściowych",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string", example: "Validation failed" },
                      details: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string" },
                            message: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Wszystkie pozostałe błędy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        example: "Internal Server Error",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: { "Content-Type": "application/json" },
  });
}
