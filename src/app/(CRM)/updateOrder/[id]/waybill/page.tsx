"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, ReactElement } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import Logo from "@/images/LogoBlack.png";

import { generateWaybillPdf } from "@/helpers/generatePdf";

import { useSession } from "next-auth/react";

import { Parser } from "html-to-react";
import { Button } from "@/components/shadcn/ui/button";
import { DownloadIcon } from "lucide-react";

interface Package {
  packageId: string;
  commodityName: string;
  commodityNote: string;
}

export default function Waybill() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();
  const [orderData, setOrderData] = useState({
    id: "",
    sender: "",
    packagesNumber: "",
    orderType: "",
    recipient: "",
    recipientPhone: "",
    price: "",
    address: "",
    city: "",
    orderNote: "",
    currency: "",
    senderPhone: "",
    packageManualCount: 0,
  });

  const [packages, setPackages] = useState<ReactElement[]>([]);

  useEffect(() => {
    if (session) {
      getOrder();
    }
  }, [session]);

  // Funkcja do generowania PDF
  const handleGeneratePdf = async () => {
    if (ref.current) {
      await generateWaybillPdf(ref);
    }
  };

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

      setOrderData({
        id: res.order.orderId,
        sender: Parser().parse(res.order.user.company),
        packagesNumber: res.order.packages.length,
        orderType: res.order.orderType,
        recipient: Parser().parse(res.order.recipientName),
        recipientPhone: res.order.recipientPhone.replace(/^(.{3})(.{3})(.*)$/, "$1 $2 $3"),
        price: res.order.orderPaymentType === "Pobranie" ? res.order.orderPrice + res.order.currency : "Opłacone",
        address: Parser().parse(address),
        city: res.order.orderPostCode + " " + res.order.orderCity,
        orderNote: Parser().parse(res.order.orderNote),
        currency: res.order.currency,
        senderPhone: res.order.user.phone,
        packageManualCount: res.order.packageManualCount,
      });
      setPackages(
        res.order.packages.map((item: Package, index: number) => {
          return (
            <div className="mb-1" key={item.packageId}>
              <div className="flex mb-1">
                <p className="w-[3%] text-sm">{index + 1}.</p>
                <p className="w-[15%] text-sm">{item.packageId.slice(0, 10)}...</p>
                <p className="w-[35%] text-sm">{Parser().parse(item.commodityName)}</p>
                <p className="w-[35%] text-sm">{Parser().parse(item.commodityNote)}</p>
              </div>
            </div>
          );
        })
      );
    }
    setIsLoading(false);
  }

  return (
    <>
      <Button variant="default" className="m-4" onClick={handleGeneratePdf} disabled={isLoading}>
        <DownloadIcon /> Pobierz dokument
      </Button>
      <div className="bg-white w-[21cm] h-[29.7cm] text-black p-[0.5cm] flex flex-col" ref={ref}>
        <header>
          <Image src={Logo} alt="Logo" priority className="mx-auto w-[100px] h-[100px] object-contain" />
          <div className="border-t border-b border-black pb-[0.5cm] pt-[0.5cm] flex justify-between items-center">
            <div>
              <h1 className="text-[1.9rem] font-semibold mb-[0.2cm]">Podstawowe Informacje</h1>
              <p className="text-[1.2rem] font-medium m-0">
                Nadawca: <span className="font-normal">{orderData.sender}</span>
              </p>
              <p className="text-[1.2rem] font-medium m-0">
                Telefon Nadawcy: <span className="font-normal">{orderData.senderPhone.replace(/^(.{3})(.{3})(.*)$/, "$1 $2 $3")}</span>
              </p>
              <p className="text-[1.2rem] font-medium m-0">
                Zlecenie: <span className="font-normal">{orderData.id}</span>
              </p>
              <p className="text-[1.2rem] font-medium m-0">
                Ilość Paczek:{" "}
                <span className="font-normal">
                  {orderData.packageManualCount || orderData.packagesNumber} {orderData.packageManualCount && "(Deklaracja manualna)"}
                </span>
              </p>
            </div>
            <div>
              <QRCode value={id} size={140} />
            </div>
          </div>
        </header>

        <main className="mt-[0.2cm] min-h-0">
          <h2 className="mt-0 text-[1.8rem] font-semibold mb-0 text-left text-black">Informacje o Przesyłce</h2>
          <div className="flex mb-[0.3cm] justify-between">
            <p className="flex flex-col w-[25%] text-sm font-medium m-0">
              Rodzaj transportu: <span className="text-[1.2rem] font-normal">{orderData.orderType}</span>
            </p>
            <p className="flex flex-col w-[45%] text-sm font-medium m-0">
              Nazwa Odbiorcy: <span className="text-[1.2rem] font-normal">{orderData.recipient}</span>
            </p>
            <p className="flex flex-col w-[30%] text-sm font-medium m-0">
              Numer Telefonu: <span className="text-[1.2rem] font-normal">{orderData.recipientPhone}</span>
            </p>
          </div>
          <div className="flex mb-[0.3cm] justify-between">
            <p className="flex flex-col w-[25%] text-sm font-medium m-0">
              Płatność: <span className="text-[1.2rem] font-normal">{orderData.price}</span>
            </p>
            <p className="flex flex-col w-[45%] text-sm font-medium m-0">
              Adres: <span className="text-[1.2rem] font-normal">{orderData.address}</span>
            </p>
            <p className="flex flex-col w-[30%] text-sm font-medium m-0">
              Miejscowość: <span className="text-[1.2rem] font-normal">{orderData.city}</span>
            </p>
          </div>
          {orderData.orderNote && (
            <div className="flex mb-[0.3cm] justify-between">
              <p className="text-sm font-medium m-0">
                Dodatkowe Informacje: <span className="text-[1.2rem] font-normal">{orderData.orderNote}</span>
              </p>
            </div>
          )}

          <h2 className="border-t border-black pt-[0.2cm] mt-0 text-[1.8rem] font-semibold mb-0 text-left text-black">Wykaz Paczek</h2>

          <div className="mt-[0.2cm]">{packages}</div>
        </main>
        <footer className="mt-auto mb-0">
          <p className="text-sm">
            Ze względu na umówione godziny dostaw, a także wydajność kierowców, zakupiony przez Państwa towar należy wnieść we własnym zakresie.
            Kierowca nie ma obowiązku wnoszenia mebli do domu/mieszkania.
            <br />
            <br />
            Sprawdź towar w obecności kierowcy. <br />
            <br />
            Potwierdzam odbiór dostarczonego, nieuszkodzonego produktu. Towar jest kompletny, zgodny z zamówieniem, pozbawiony zniszczeń i wad.
          </p>
          <div className="flex justify-between mt-[1cm]">
            <p className="border-t border-black w-[30%]">Data odbioru</p>
            <p className="border-t border-black w-[20%]">Godzina odbioru</p>
            <p className="border-t border-black w-[30%]">Podpis odbiorcy</p>
          </div>
        </footer>
      </div>
    </>
  );
}
