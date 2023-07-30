"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import Logo from "@/images/LogoBlack.png";

import { useSession } from "next-auth/react";

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

export default function Waybill() {
  const listRef = useRef([]);
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  const { data: session } = useSession();

  const [packages, setPackages] = useState(null);

  useEffect(() => {
    if (session) {
      getOrder();
    }
  }, [session]);


  // Generate PDF with Labels
  async function generatePdf() {
    const doc = new jsPDF({ format: [100, 150] });

    for (let i = 0; i < listRef.current.length; i++) {
      const image = await toPng(listRef.current[i], { quality: 0.95 });
      doc.addImage(image, "JPGG", 0, 0, 100, 150);
      if (i !== listRef.current.length - 1) doc.addPage();
    }

    doc.save("Etykiety.pdf");
  }

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
                    Nadawca: <span>{res.order.user.company}</span>
                  </p>
                  <p>
                    Odbiorca: <span>{res.order.recipientName}</span>
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
                    Towar <span>{item.commodityName}</span>
                  </p>
                  <p>
                    Uwagi <span>{item.commodityNote !== "" ? item.commodityNote : "Brak"}</span>
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

  return (
    <div className="Labels" id="Labels">
      <button onClick={() => generatePdf()} className="generatePdf">
        Pobierz Etykiety
      </button>
      {packages}
    </div>
  );
}
