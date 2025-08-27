"use client";

import { useEffect, useRef, useState, ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Parser } from "html-to-react";

import { Button } from "@/components/shadcn/ui/button";
import { DownloadIcon } from "lucide-react";
import Logo from "@/images/LogoBlack.png";
import { generateLabelsPdf } from "@/helpers/generatePdf";

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
  packageManualCount?: number | null;
  user: { company: string };
  packages: PackageItem[];
}

interface GetOrderApiResponse {
  error?: string;
  order?: OrderResponseOrder;
}

export default function BulkLabelsPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [labelElements, setLabelElements] = useState<ReactElement[] | null>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const idsParam = searchParams.get("ids") || "";
  const orderIds = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  useEffect(() => {
    if (!session) return;
    if (orderIds.length === 0) {
      setIsLoading(false);
      setLabelElements([]);
      return;
    }

    loadOrders();
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

      // Build labels for all orders
      const allLabels: ReactElement[] = [];
      let refIndex = 0;

      orders.forEach((order) => {
        let address = `${order.orderStreet} ${order.orderStreetNumber}`;
        if (order.orderFlatNumber) address += `/${order.orderFlatNumber}`;

        const totalLabels: number = (order.packageManualCount ?? undefined) || order.packages.length || 1;
        const baseItem: PackageItem | undefined = order.packages[0];

        const elements = Array.from({ length: totalLabels }).map((_, index) => {
          const itemForIndex: PackageItem = order.packages[index] ?? baseItem!;
          const key = order.packages[index]?.packageId || `${order.orderId}-${index}`;

          const currentRefIndex = refIndex + index;

          return (
            <div
              className="w-[10cm] h-[14cm] border border-black p-[0.3cm] text-black flex flex-col"
              key={key}
              ref={(ref) => {
                labelRefs.current[currentRefIndex] = ref;
              }}
            >
              <header>
                <Image src={Logo} alt="Logo" className="h-[80px] object-contain" />
              </header>
              <main className="mt-[0.5cm] min-h-0">
                <div className="flex justify-between">
                  <div className="flex flex-col justify-between">
                    <p className="text-[36px] font-medium">{order.orderType.toUpperCase()}</p>
                    <p className="flex flex-col items-start">
                      Paczki
                      <span className="text-[28px] font-medium">
                        {index + 1}/{totalLabels}
                      </span>
                    </p>
                  </div>
                  <QRCode value={order.orderId} size={120} />
                </div>

                <div className="mt-[0.6cm]">
                  <p className="text-xs font-normal flex justify-between items-center">
                    Nadawca: <span className="text-sm font-medium">{Parser().parse(order.user.company)}</span>
                  </p>
                  <p className="text-xs font-normal flex justify-between items-center">
                    Odbiorca: <span className="text-sm font-medium">{Parser().parse(order.recipientName)}</span>
                  </p>
                  <p className="text-xs font-normal flex justify-between items-center">
                    Adres: <span className="text-sm font-medium">{Parser().parse(address)}</span>
                  </p>
                  <p className="text-xs font-normal flex justify-between items-center">
                    Miejscowość:
                    <span className="text-sm font-medium">
                      {order.orderPostCode}, {order.orderCity}
                    </span>
                  </p>
                  <p className="text-xs font-normal flex justify-between items-center">
                    Telefon: <span className="text-sm font-medium">{order.recipientPhone}</span>
                  </p>
                </div>

                {!order.packageManualCount && (
                  <div className="mt-[0.6cm]">
                    <p className="text-xs font-normal flex flex-col items-start">
                      Towar <span className="text-sm font-medium">{Parser().parse(itemForIndex.commodityName)}</span>
                    </p>
                    <p className="text-xs font-normal flex flex-col items-start">
                      Uwagi {""}
                      <span className="text-sm font-medium">
                        {itemForIndex.commodityNote !== "" ? Parser().parse(itemForIndex.commodityNote) : "Brak"}
                      </span>
                    </p>
                  </div>
                )}
              </main>
              <footer className="mt-auto mb-0 flex justify-center">
                <p className="text-xs font-normal flex justify-between items-center">
                  <span className="text-sm font-medium">{order.orderId}</span>
                </p>
              </footer>
            </div>
          );
        });

        allLabels.push(
          <div key={`group-${order.orderId}`} className="bg-white p-[0.3cm] flex flex-col" id={`Labels-${order.orderId}`}>
            {elements}
          </div>
        );

        refIndex += totalLabels;
      });

      setLabelElements(allLabels);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    await generateLabelsPdf(labelRefs.current);
  }

  return (
    <>
      <div className="bg-white">
        <p className="text-sm text-black p-3 ">
          Po wciśnięciu przycisku pobierz etykiety odczekaj chwilę, generowanie PDF może zająć do 1 minuty.
        </p>
        <Button variant="default" className="m-4 mt-0" onClick={handleDownload} disabled={isLoading || (labelElements?.length ?? 0) === 0}>
          <DownloadIcon /> Pobierz Etykiety
        </Button>
      </div>
      {labelElements?.length === 0 && !isLoading && <div className="bg-white p-4">Brak zaznaczonych zamówień do wygenerowania etykiet.</div>}
      {labelElements && labelElements.length > 0 && <div className="bg-white flex flex-col gap-4">{labelElements}</div>}
    </>
  );
}
