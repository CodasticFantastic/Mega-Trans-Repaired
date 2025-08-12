"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, ReactElement } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import Logo from "@/images/LogoBlack.png";

import { useSession } from "next-auth/react";

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

import { Parser } from "html-to-react";

interface Package {
  packageId: string;
  commodityName: string;
  commodityNote: string;
}

export default function Label() {
  const listRef = useRef<(HTMLDivElement | null)[]>([]);
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  const { data: session } = useSession();

  const [packages, setPackages] = useState<ReactElement | null>(null);

  useEffect(() => {
    if (session) {
      getOrder();
    }
  }, [session]);

  // Generate PDF with Labels
  async function generatePdf() {
    const doc = new jsPDF({ format: [100, 150] });

    for (let i = 0; i < listRef.current.length; i++) {
      const element = listRef.current[i];
      if (element) {
        const image = await toPng(element, { quality: 0.95 });
        doc.addImage(image, "JPGG", 0, 5, 100, 140);
        if (i !== listRef.current.length - 1) doc.addPage();
      }
    }

    doc.save("Etykiety.pdf");
  }

  // Get order from API
  async function getOrder() {
    const req = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/getOrder?id=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
        },
      }
    );
    const res = await req.json();

    if (res.error) {
      console.log(res.error);
    } else if (res.order) {
      let address = res.order.orderStreet + " " + res.order.orderStreetNumber;
      if (res.order.orderFlatNumber) address += "/" + res.order.orderFlatNumber;

      setPackages(
        res.order.packages.map((item: Package, index: number) => {
          return (
            <div
              className="w-[10cm] h-[14cm] border border-black p-[0.3cm] text-black flex flex-col"
              key={item.packageId}
              ref={(ref) => {
                listRef.current[index] = ref;
              }}
            >
              <header>
                <Image
                  src={Logo}
                  alt="Logo"
                  className="h-[80px] object-contain"
                />
              </header>
              <main className="mt-[0.5cm] min-h-0">
                <div className="flex justify-between">
                  <div className="flex flex-col justify-between">
                    <p className="text-[36px] font-medium">
                      {res.order.orderType.toUpperCase()}
                    </p>
                    <p className="flex flex-col items-start">
                      Paczki
                      <span className="text-[28px] font-medium">
                        {index + 1}/{res.order.packages.length}
                      </span>
                    </p>
                  </div>
                  <QRCode value={id} size={120} />
                </div>

                <div className="mt-[0.6cm]">
                  <p className="text-xs font-normal flex justify-between items-center">
                    Nadawca:{" "}
                    <span className="text-sm font-medium">
                      {Parser().parse(res.order.user.company)}
                    </span>
                  </p>
                  <p className="text-xs font-normal flex justify-between items-center">
                    Odbiorca:{" "}
                    <span className="text-sm font-medium">
                      {Parser().parse(res.order.recipientName)}
                    </span>
                  </p>
                  <p className="text-xs font-normal flex justify-between items-center">
                    Adres:{" "}
                    <span className="text-sm font-medium">
                      {Parser().parse(address)}
                    </span>
                  </p>
                  <p className="text-xs font-normal flex justify-between items-center">
                    Miejscowość:
                    <span className="text-sm font-medium">
                      {res.order.orderPostCode}, {res.order.orderCity}
                    </span>
                  </p>
                  <p className="text-xs font-normal flex justify-between items-center">
                    Telefon:{" "}
                    <span className="text-sm font-medium">
                      {res.order.recipientPhone}
                    </span>
                  </p>
                </div>

                <div className="mt-[0.6cm]">
                  <p className="text-xs font-normal flex flex-col items-start">
                    Towar{" "}
                    <span className="text-sm font-medium">
                      {Parser().parse(item.commodityName)}
                    </span>
                  </p>
                  <p className="text-xs font-normal flex flex-col items-start">
                    Uwagi{" "}
                    <span className="text-sm font-medium">
                      {item.commodityNote !== ""
                        ? Parser().parse(item.commodityNote)
                        : "Brak"}
                    </span>
                  </p>
                </div>
              </main>
              <footer className="mt-auto mb-0 flex justify-center">
                <p className="text-xs font-normal flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {res.order.orderId}
                  </span>
                </p>
              </footer>
            </div>
          );
        })
      );
    }
  }

  return (
    <div className="bg-white p-[0.3cm] flex flex-col" id="Labels">
      <button
        onClick={() => generatePdf()}
        className="w-[150px] h-[50px] mb-5 rounded outline-none cursor-pointer hover:bg-gray-600"
      >
        Pobierz Etykiety
      </button>
      {packages}
    </div>
  );
}
