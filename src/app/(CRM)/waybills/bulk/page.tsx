"use client";

import { useEffect, useRef, useState, ReactElement, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Parser } from "html-to-react";

import { Button } from "@/components/shadcn/ui/button";
import { DownloadIcon } from "lucide-react";
import Logo from "@/images/LogoBlack.png";
import { generateWaybillsPdf } from "@/helpers/generatePdf";

interface PackageItem {
  packageId: string;
  commodityName: string;
  commodityNote: string;
}

interface OrderResponseOrder {
  orderId: string;
  orderType: string;
  orderStreet: string;
  orderStreetNumber: string;
  orderFlatNumber?: string;
  orderPostCode: string;
  orderCity: string;
  recipientName: string;
  recipientPhone: string;
  orderNote?: string;
  currency?: string;
  orderPaymentType?: string;
  orderPrice?: string;
  packageManualCount?: number | null;
  user: { company: string; phone: string };
  packages: PackageItem[];
}

interface GetOrderApiResponse {
  error?: string;
  order?: OrderResponseOrder;
}

function BulkWaybillsPageInner() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [waybillElements, setWaybillElements] = useState<ReactElement[] | null>(null);
  const waybillRefs = useRef<(HTMLDivElement | null)[]>([]);

  const idsParam = searchParams.get("ids") || "";
  const orderIds = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  useEffect(() => {
    if (!session) return;
    if (orderIds.length === 0) {
      setIsLoading(false);
      setWaybillElements([]);
      return;
    }
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, idsParam]);

  async function loadOrders() {
    try {
      setIsLoading(true);

      const requests = orderIds.map(async (id) => {
        const req = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/getOrder?id=${id}`, {
          method: "GET",
          headers: {
            Authorization: session?.accessToken || "",
          },
        });
        const data: GetOrderApiResponse = await req.json();
        if (data.error) throw new Error(data.error);
        if (!data.order) throw new Error("Brak danych zamówienia");
        return data.order;
      });

      const orders = await Promise.all(requests);

      const elements: ReactElement[] = [];
      orders.forEach((order, i) => {
        let address = `${order.orderStreet} ${order.orderStreetNumber}`;
        if (order.orderFlatNumber) address += `/${order.orderFlatNumber}`;

        const price = order.orderPaymentType === "Pobranie" ? `${order.orderPrice}${order.currency ?? ""}` : "Opłacone";

        elements.push(
          <div
            className="bg-white w-[21cm] h-[29.7cm] text-black p-[0.5cm] flex flex-col"
            key={order.orderId}
            ref={(ref) => {
              if (ref) {
                waybillRefs.current[i] = ref;
              }
            }}
          >
            <header>
              <Image src={Logo} alt="Logo" priority className="mx-auto w-[100px] h-[100px] object-contain" />
              <div className="border-t border-b border-black pb-[0.5cm] pt-[0.5cm] flex justify-between items-center">
                <div>
                  <h1 className="text-[1.9rem] font-semibold mb-[0.2cm]">Podstawowe Informacje</h1>
                  <p className="text-[1.2rem] font-medium m-0">
                    Nadawca: <span className="font-normal">{Parser().parse(order.user.company)}</span>
                  </p>
                  <p className="text-[1.2rem] font-medium m-0">
                    Telefon Nadawcy: <span className="font-normal">{order.user.phone.replace(/^(.{3})(.{3})(.*)$/, "$1 $2 $3")}</span>
                  </p>
                  <p className="text-[1.2rem] font-medium m-0">
                    Zlecenie: <span className="font-normal">{order.orderId}</span>
                  </p>
                  <p className="text-[1.2rem] font-medium m-0">
                    Ilość Paczek:{" "}
                    <span className="font-normal">
                      {order.packageManualCount || order.packages.length} {order.packageManualCount && "(Deklaracja manualna)"}
                    </span>
                  </p>
                </div>
                <div>
                  <QRCode value={order.orderId} size={140} />
                </div>
              </div>
            </header>

            <main className="mt-[0.2cm] min-h-0">
              <h2 className="mt-0 text-[1.8rem] font-semibold mb-0 text-left text-black">Informacje o Przesyłce</h2>
              <div className="flex mb-[0.3cm] justify-between">
                <p className="flex flex-col w-[25%] text-sm font-medium m-0">
                  Rodzaj transportu: <span className="text-[1.2rem] font-normal">{order.orderType}</span>
                </p>
                <p className="flex flex-col w-[45%] text-sm font-medium m-0">
                  Nazwa Odbiorcy: <span className="text-[1.2rem] font-normal">{Parser().parse(order.recipientName)}</span>
                </p>
                <p className="flex flex-col w-[30%] text-sm font-medium m-0">
                  Numer Telefonu:{" "}
                  <span className="text-[1.2rem] font-normal">{order.recipientPhone.replace(/^(.{3})(.{3})(.*)$/, "$1 $2 $3")}</span>
                </p>
              </div>
              <div className="flex mb-[0.3cm] justify-between">
                <p className="flex flex-col w-[25%] text-sm font-medium m-0">
                  Płatność: <span className="text-[1.2rem] font-normal">{price}</span>
                </p>
                <p className="flex flex-col w-[45%] text-sm font-medium m-0">
                  Adres: <span className="text-[1.2rem] font-normal">{Parser().parse(address)}</span>
                </p>
                <p className="flex flex-col w-[30%] text-sm font-medium m-0">
                  Miejscowość: <span className="text-[1.2rem] font-normal">{`${order.orderPostCode} ${order.orderCity}`}</span>
                </p>
              </div>
              {order.orderNote && (
                <div className="flex mb-[0.3cm] justify-between">
                  <p className="text-sm font-medium m-0">
                    Dodatkowe Informacje:{" "}
                    <span
                      className="text-[1.2rem] font-normal"
                      dangerouslySetInnerHTML={{ __html: Parser().parse(order.orderNote).replace(/\n/g, "<br/>") }}
                    />
                  </p>
                </div>
              )}

              <h2 className="border-t border-black pt-[0.2cm] mt-0 text-[1.8rem] font-semibold mb-0 text-left text-black">Wykaz Paczek</h2>

              <div className="mt-[0.2cm]">
                {order.packages.map((item: PackageItem, index: number) => (
                  <div className="mb-1" key={item.packageId}>
                    <div className="flex mb-1">
                      <p className="w-[3%] text-sm">{index + 1}.</p>
                      <p className="w-[15%] text-sm">{item.packageId.slice(0, 10)}...</p>
                      <p className="w-[35%] text-sm">{Parser().parse(item.commodityName)}</p>
                      <p className="w-[35%] text-sm">{Parser().parse(item.commodityNote)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </main>
            <footer className="mt-auto mb-0">
              <p className="text-sm">
                Ze względu na umówione godziny dostaw, a także wydajność kierowców, zakupiony przez Państwa towar należy wnieść we własnym
                zakresie. Kierowca nie ma obowiązku wnoszenia mebli do domu/mieszkania.
                <br />
                <br />
                Sprawdź towar w obecności kierowcy. <br />
                <br />
                Potwierdzam odbiór dostarczonego, nieuszkodzonego produktu. Towar jest kompletny, zgodny z zamówieniem, pozbawiony zniszczeń i
                wad.
              </p>
              <div className="flex justify-between mt-[1cm]">
                <p className="border-t border-black w-[30%]">Data odbioru</p>
                <p className="border-t border-black w-[20%]">Godzina odbioru</p>
                <p className="border-t border-black w-[30%]">Podpis odbiorcy</p>
              </div>
            </footer>
          </div>
        );
      });

      setWaybillElements(elements);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    await generateWaybillsPdf(waybillRefs.current);
  }

  return (
    <>
      <div className="bg-white">
        <p className="text-sm text-black p-3 ">
          Po wciśnięciu przycisku pobierz dokumenty odczekaj chwilę, generowanie PDF może zająć do 1 minuty.
        </p>
        <Button variant="default" className="m-4 mt-0" onClick={handleDownload} disabled={isLoading || (waybillElements?.length ?? 0) === 0}>
          <DownloadIcon /> Pobierz dokumenty
        </Button>
      </div>
      {waybillElements?.length === 0 && !isLoading && (
        <div className="bg-white p-4">Brak zaznaczonych zamówień do wygenerowania dokumentów.</div>
      )}
      {waybillElements && waybillElements.length > 0 && <div className="bg-white flex flex-col gap-4">{waybillElements}</div>}
    </>
  );
}

export default function BulkWaybillsPage() {
  return (
    <Suspense>
      <BulkWaybillsPageInner />
    </Suspense>
  );
}
