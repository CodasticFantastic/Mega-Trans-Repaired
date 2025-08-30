import { OpenAPIV3 } from "openapi-types";

export async function GET() {
  // const spec: OpenAPIV3.Document & Record<string, any> = {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "MegaTrans API Dokumentacja",
      version: "1.0.0",
      description: `
Witaj w dokumentacji API MegaTrans!

W naszym systemie obsługujemy aktualnie dwa typy automatyzacji generowania zleceń:
- Integracja z BaseLinker
- Integracja z własnym API

W zależności od wybranego typu automatyzacji zastosuj odpowiednią sekcję dokumentacji.

Pamiętaj, że odpowiadasz za poprawność wprowadzanych danych i ich zgodność z formatami.

Przed podpięciem API do systemu produkcyjnego zalecamy dokonanie testów na koncie sandbox.
Skontaktuj się z nami w celu uzyskania dostępu do konta sandbox.
`,
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
    // Grupowanie sekcji w nawigacji Scalar
    "x-tagGroups": [
      { name: "Integracja z własnym API", tags: ["Integracja z własnym API"] },
      { name: "Integracja z BaseLinker", tags: ["Integracja z BaseLinker"] },
    ],

    // Opisy sekcji (widoczne w Scalar, jeśli tag jest użyty przez operację)
    tags: [
      {
        name: "Integracja z własnym API",
        description: `
Posiadasz swój własny system e-commerce?

Dowiedz się, jak zintegrować nasz system z Twoim e-commerce i rozpocznij automatyzację procesów zamówień.

Aktualnie obsługujemy tylko możliwość tworzenia zamówień.
Jeżeli brakuje Ci jakiejś funkcjonalności, skontaktuj się z nami abyśmy mogli ją dla Ciebie dodać.
        `,
      },
      {
        name: "Integracja z BaseLinker",
        description: `
Prowadzisz e-commerce w systemie BaseLinker?

Dowiedz się, jak zintegrować nasz system z BaseLinker i rozpocznij automatyzację procesów zamówień.

Aktualnie obsługujemy tylko możliwość tworzenia zamówień BaseLinker -> MegaTrans.
Jeżeli brakuje Ci jakiejś funkcjonalności, skontaktuj się z nami abyśmy mogli ją dla Ciebie dodać.
`,
      },
    ],

    paths: {
      // --- Sekcja 1: Własne API
      "Wprowadzenie - Integracja z własnym API": {
        connect: {
          tags: ["Integracja z własnym API"],
          description: `
API wymaga przesyłania danych w standardzie **JSON**.

W celu komunikacji z API wymagane jest wygenerowanie klucza API w panelu klienta MegaTrans w zakładce **Moje Integracje**.
Wygenerowany klucz API należy przekazać w nagłówku żądania jako **X-API-Key**.

Pamiętaj, że odpowiadasz za poprawność wprowadzanych danych i ich zgodność z formatami.
`,
        },
      },
      "/order/newOrder/custom": {
        post: {
          tags: ["Integracja z własnym API"],
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
                      description: "Kod pocztowy w formacie 00-001 (Polska) lub 000 00 (Czechy)",
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
                      description: "Numer telefonu może zawierać wyłącznie cyfry (bez spacji)",
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
                      description: 'W przypadku "Pobranie" wymagane uzupełnienie pola "orderPaymentPrice"',
                    },
                    orderPaymentPrice: {
                      title: "Wartość pobrania",
                      type: "number",
                      example: 199.99,
                      description: "Wartość pobrania w formacie liczbowym (np. 199.99)",
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
              description: "Brak autoryzacji (nieprawidłowy lub brak X-API-Key)",
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

      // --- Sekcja 2: BaseLinker
      "Jak zintegrować BaseLinker?": {
        connect: {
          tags: ["Integracja z BaseLinker"],
          summary: "Tutorial BaseLinker",
          description: `
##### 1. Wygeneruj API Token w BaseLinker

W tym celu w panelu BaseLinker przejdź do zakładki **Moje konto** → **API**.

**Uwaga!**<br/>Pamiętaj, że wygenerowany token będzie posiadał uprawnienia konta użytkownika który go tworzy.
Jeżeli nie chcesz dawać zbyt rozległych i niepotrzebnych dostępów do swojego konta, zalecamy stworzenie nowego konta w BaseLinker z **minimalnymi uprawnieniami** i wygenerowanie dla niego tokenu.

Aktualnie minimalne uprawnienia do wygenerowania tokenu to:
 - Odczyt zamówień
 - Odczyt produktów

 **Porada**<br/>
 Jeżeli nie chcesz aby klucz API miał dostęp do wszystkich zamówień, możesz np. utworzyć konto pracownicze z dostępem tylko do statusu **Dostawa (Megatrans)**. W takim wypadku, dany klucz API będzie miał dostęp tylko do zamówień przypisanych do statusu **Dostawa (Megatrans)**.

##### 2. Zapisz token BaseLinker API w panelu MegaTrans

W tym celu przejdź do zakładki **Moje Integracje** →  **Utwórz klucz** → **Type klucza: Baselinker** <br/>
Po poprawnym dodaniu klucza, powinien pojawić się on w Twojej liście kluczy.

##### 3. Konfiguracja BaseLinker przed pierwszym importem zamówień
Zanim rozpoczniesz pierwszy import zamówień, upewnij się, że Twój BaseLinker jest odpowiednio skonfigurowany, w innym przypadku importowanie zamówień z BaseLinker do MegaTrans nie zadziała poprawnie.

**3.1. Przygotuj statusy**
1. Utwórz nowy **status** dla zamówień, np. Dostawa (Megatrans)
2. Po utworzeniu, w formularzu edycji statusu pojawi się w dolnym lewym rogu ID
3. Zapisz **ID** danego statusu, bedzie Ci potrzebne przy importowaniu.

**Dlaczego potrzebuję ID statusu?** <br/>
W trakcie dokonywania importu zamówień, pobieramy tylko te zamówienia z Twojego BaseLinker, które są przypisane do danego statusu.

Możesz posiadać wiele statusów, w zależności od tego, jakiego rodzaju zamówienia chcesz importować wystarczy że w naszym systemie podasz odpowiednie ID statusu.

Z reguły jednak sugerujemy stworzenie tylko jednego statusu, który będzie domyślnym statusem dla zamówień realizowanych przez MegaTrans.

**3.2. Poinformuj nas o ilości paczek w zamówieniu** <br/>
W panelu **BaseLinker** w **formularzu edycji zamówienia** w polu **Pole dodatkowe 1** musi znaleźć się informacja o ilości paczek. Jeżeli ta informacja się tam, nie znajdzie to integracja się nie powiedzie. 

Informacja ta powinna znajdować się w nawiasach, np.  (1 paczka). Jeżeli w polu znajduje się jakiś inny tekst poza nawiasami np. "Komoda (3 paczki)" to pole zostanie również poprawne zaczytane. 

Przykładowe dozwolone wartości dla pola **Pole dodatkowe 1**:
- (1 paczka) lub (1paczka)
- (2 paczki) lub (2paczki)
- (10 paczek) lub (10paczek)
- 2 Fotele (2 paczki)
- 1 Sofa Narożna (3 paczki)
- (8 paczek) 1 sofa + 4 fotele

##### 4. Import Zamówień
Kiedy wszystko jest gotowe możesz rozpocząć import zamówień z BaseLinker do MegaTrans.

W przypadku poprawnego importu w twoim systemie BaseLinker pole "**Pole dodatkowe 2**" zostanie nadpisane numerem zamówienia z MegaTrans.
`,
        },
      },
    },
  };

  return Response.json(spec, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
