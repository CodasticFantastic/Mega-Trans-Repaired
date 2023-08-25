"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import Logo from "@/images/LogoBlack.png";

import { useSession } from "next-auth/react";

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

import { Parser } from "html-to-react";

export default function ShortDocumentation() {
  const listRef = useRef([]);
  const waybilRef = useRef();
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  const { data: session } = useSession();
  const [packages, setPackages] = useState(null);
  const [waybillData, setWaybillData] = useState({
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
  });
  const [packagesWaybill, setPackagesWaybill] = useState([]);

  useEffect(() => {
    if (session) {
      getOrder();
    }
  }, [session]);

  // Get order from API
  async function getOrder() {
    const req = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/getOrder?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: session?.accessToken,
      },
    });
    const res = await req.json();

    if (res.error) {
      console.log(res.error);
    } else if (res.order) {
      let address = res.order.orderStreet + " " + res.order.orderStreetNumber;
      if (res.order.orderFlatNumber) address += "/" + res.order.orderFlatNumber;

      setWaybillData({
        id: res.order.orderId,
        sender: Parser().parse(res.order.user.company),
        packagesNumber: res.order.packages.length,
        orderType: res.order.orderType,
        recipient: Parser().parse(res.order.recipientName),
        recipientPhone: res.order.recipientPhone,
        price: res.order.orderPaymentType === "Pobranie" ? res.order.orderPrice + res.order.currency : "Opłacone",
        address: Parser().parse(address),
        city: res.order.orderPostCode + " " + res.order.orderCity,
        orderNote: Parser().parse(res.order.orderNote),
        currency: res.order.currency,
        senderPhone: res.order.user.phone,
      });

      setPackagesWaybill(
        res.order.packages.map((item, index) => {
          return (
            <div className="package" key={item.packageId}>
              <div className="row">
                <p className="number">{index + 1}</p>
                <p className="id">{item.packageId}</p>
                <p className="name">{Parser().parse(item.commodityName)}</p>
              </div>
            </div>
          );
        })
      );

      setPackages(
        res.order.packages.map((item, index) => {
          return (
            <div className="label" key={item.packageId} ref={(ref) => (listRef.current[index] = ref)}>
              <header>
                <Image src={Logo} alt="Logo" />
              </header>
              <main>
                <div className="mainInfo">
                  <div className="col">
                    <p className="type">{res.order.orderType.toUpperCase()}</p>
                    <p className="packagesNo">
                      Paczki
                      <span>
                        {index + 1}/{res.order.packages.length}
                      </span>
                    </p>
                  </div>
                  <QRCode value={id} size={120} />
                </div>

                <div className="reciepientInfo">
                  <p>
                    Nadawca: <span>{Parser().parse(res.order.user.company)}</span>
                  </p>
                  <p>
                    Odbiorca: <span>{Parser().parse(res.order.recipientName)}</span>
                  </p>
                  <p>
                    Adres: <span>{address}</span>
                  </p>
                  <p>
                    Miejscowość:
                    <span>
                      {res.order.orderPostCode}, {res.order.orderCity}
                    </span>
                  </p>
                  <p>
                    Telefon: <span>{res.order.recipientPhone}</span>
                  </p>
                </div>

                <div className="packageInfo">
                  <p>
                    Towar <span>{Parser().parse(item.commodityName)}</span>
                  </p>
                  <p>
                    Uwagi <span>{item.commodityNote !== "" ? Parser().parse(item.commodityNote) : "Brak"}</span>
                  </p>
                </div>
              </main>
              <footer>
                <p>
                  <span>{res.order.orderId}</span>
                </p>
              </footer>
            </div>
          );
        })
      );
    }
  }

  // Generate PDF with Labels
  async function generatePdf() {
    const doc = new jsPDF({ format: [210, 297] });
    let labelsCounter = 0;

    const waybill = await toPng(waybilRef.current, { quality: 0.95 });
    doc.addImage(waybill, "JPGG", 0, 0, 210, 297);
    doc.addPage();

    for (let i = 0; i < listRef.current.length; i++) {
      const image = await toPng(listRef.current[i], { quality: 0.95 });
      switch (labelsCounter) {
        case 0:
          doc.addImage(image, "JPGG", 5, 10, 100, 140);
          labelsCounter++;
          break;
        case 1:
          doc.addImage(image, "JPGG", 105, 10, 100, 140);
          labelsCounter++;
          break;
        case 2:
          doc.addImage(image, "JPGG", 5, 150, 100, 140);
          labelsCounter++;
          break;
        case 3:
          doc.addImage(image, "JPGG", 105, 150, 100, 140);
          labelsCounter = 0;
          doc.addPage();
          break;
      }
    }

    doc.save("Dokumentacja Transportowa.pdf");
  }

  return (
    <>
      <button onClick={() => generatePdf()} className="generatePdf">
        Pobierz Etykiety
      </button>
      <div className="Waybill" ref={waybilRef}>
        <header>
          <Image src={Logo} alt="Logo" priority />
          <div className="row">
            <div className="left">
              <h1>Podstawowe Informacje</h1>
              <p>
                Nadawca: <span>{waybillData.sender}</span>
              </p>
              <p>
                Telefon Nadawcy: <span>{waybillData.senderPhone}</span>
              </p>
              <p>
                Zlecenie: <span>{waybillData.id}</span>
              </p>
              <p>
                Ilość Paczek: <span>{waybillData.packagesNumber}</span>
              </p>
            </div>
            <div className="right">
              <QRCode value={id} size={140} />
            </div>
          </div>
        </header>

        <main>
          <h2>Informacje o Przesyłce</h2>
          <div className="row">
            <p className="type">
              Rodzaj transportu: <span>{waybillData.orderType}</span>
            </p>
            <p className="name">
              Nazwa Odbiorcy: <span>{waybillData.recipient}</span>
            </p>
            <p className="phone">
              Numer Telefonu: <span>{waybillData.recipientPhone}</span>
            </p>
          </div>
          <div className="row">
            <p className="price">
              Płatność: <span>{waybillData.price}</span>
            </p>
            <p className="address">
              Adres: <span>{waybillData.address}</span>
            </p>
            <p className="city">
              Miejscowość: <span>{waybillData.city}</span>
            </p>
          </div>
          {waybillData.orderNote && (
            <div className="row">
              <p>
                Dodatkowe Informacje: <span>{waybillData.orderNote}</span>
              </p>
            </div>
          )}

          <h2 className="packagesDivider">Wykaz Paczek</h2>

          <div className="packages">{packagesWaybill}</div>
        </main>
        <footer>
          <p className="info">
            Ze względu na umówione godziny dostaw, a także wydajność kierowców, zakupiony przez Państwa towar należy wnieść we własnym
            zakresie. Kierwoca nie ma obowiązku wnoszenia mebli do domu/mieszkania.
            <br />
            <br />
            Sprawdź towar w obecności kierowcy. <br />
            <br />
            Potwierdzam odbiór dostarczonego, nieuszkodzonego produktu. Towar jest kompletny, zgodny z zamówieniem, pozbawiony zniszczeń i
            wad.
          </p>
          <div className="confirmation">
            <p className="date">Data odbioru</p>
            <p className="time">Godzina odbioru</p>
            <p className="signature">Podpis odbiorcy</p>
          </div>
        </footer>
      </div>
      <div className="Labels" id="Labels">
        {packages}
      </div>
    </>
  );
}
