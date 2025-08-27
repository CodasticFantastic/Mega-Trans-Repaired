"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, ReactElement } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import Logo from "@/images/LogoBlack.png";
import { useSession } from "next-auth/react";
import { generateLabelsPdf } from "@/helpers/generatePdf";
import { Parser } from "html-to-react";
import { Button } from "@/components/shadcn/ui/button";
import { DownloadIcon } from "lucide-react";

interface Package {
  packageId: string;
  commodityName: string;
  commodityNote: string;
}

export default function Label() {
  const listRef = useRef<(HTMLDivElement | null)[]>([]);
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const [packages, setPackages] = useState<ReactElement[] | null>(null);

  useEffect(() => {
    if (session) {
      getOrder();
    }
  }, [session]);

  // Generate PDF with Labels
  async function generatePdf() {
    await generateLabelsPdf(listRef.current);
  }

  // Get order from API
  async function getOrder() {
    setIsLoading(true);
    const req = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/getOrder?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: session?.accessToken || "",
      },
    });
    const res = await req.json();

    if (res.error) {
      console.log(res.error);
    } else if (res.order) {
      let address = res.order.orderStreet + " " + res.order.orderStreetNumber;
      if (res.order.orderFlatNumber) address += "/" + res.order.orderFlatNumber;

      const totalLabels: number = res.order.packageManualCount ?? res.order.packages.length;
      const baseItem: Package | undefined = res.order.packages[0];

      const elements = Array.from({ length: totalLabels }).map((_, index) => {
        const itemForIndex: Package = res.order.packages[index] ?? baseItem!;
        const key = res.order.packages[index]?.packageId || `${res.order.orderId}-${index}`;

        return (
          <div
            className="w-[10cm] h-[14cm] border border-black p-[0.3cm] text-black flex flex-col"
            key={key}
            ref={(ref) => {
              listRef.current[index] = ref;
            }}
          >
            <header>
              <Image src={Logo} alt="Logo" className="h-[80px] object-contain" />
            </header>
            <main className="mt-[0.5cm] min-h-0">
              <div className="flex justify-between">
                <div className="flex flex-col justify-between">
                  <p className="text-[36px] font-medium">{res.order.orderType.toUpperCase()}</p>
                  <p className="flex flex-col items-start">
                    Paczki
                    <span className="text-[28px] font-medium">
                      {index + 1}/{totalLabels}
                    </span>
                  </p>
                </div>
                <QRCode value={id} size={120} />
              </div>

              <div className="mt-[0.6cm]">
                <p className="text-xs font-normal flex justify-between items-center">
                  Nadawca: <span className="text-sm font-medium">{Parser().parse(res.order.user.company)}</span>
                </p>
                <p className="text-xs font-normal flex justify-between items-center">
                  Odbiorca: <span className="text-sm font-medium">{Parser().parse(res.order.recipientName)}</span>
                </p>
                <p className="text-xs font-normal flex justify-between items-center">
                  Adres: <span className="text-sm font-medium">{Parser().parse(address)}</span>
                </p>
                <p className="text-xs font-normal flex justify-between items-center">
                  Miejscowość:
                  <span className="text-sm font-medium">
                    {res.order.orderPostCode}, {res.order.orderCity}
                  </span>
                </p>
                <p className="text-xs font-normal flex justify-between items-center">
                  Telefon: <span className="text-sm font-medium">{res.order.recipientPhone}</span>
                </p>
              </div>

              {!res.order.packageManualCount && (
                <div className="mt-[0.6cm]">
                  <p className="text-xs font-normal flex flex-col items-start">
                    Towar <span className="text-sm font-medium">{Parser().parse(itemForIndex.commodityName)}</span>
                  </p>
                  <p className="text-xs font-normal flex flex-col items-start">
                    Uwagi{" "}
                    <span className="text-sm font-medium">
                      {itemForIndex.commodityNote !== "" ? Parser().parse(itemForIndex.commodityNote) : "Brak"}
                    </span>
                  </p>
                </div>
              )}
            </main>
            <footer className="mt-auto mb-0 flex justify-center">
              <p className="text-xs font-normal flex justify-between items-center">
                <span className="text-sm font-medium">{res.order.orderId}</span>
              </p>
            </footer>
          </div>
        );
      });

      setPackages(elements);
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="bg-white">
        <Button
          variant="secondary"
          className="m-4"
          onClick={() => {
            generatePdf();
          }}
          disabled={isLoading}
        >
          <DownloadIcon /> Pobierz Etykiety
        </Button>
      </div>
      <div className="bg-white p-[0.3cm] flex flex-col" id="Labels">
        {packages}
      </div>
    </>
  );
}
