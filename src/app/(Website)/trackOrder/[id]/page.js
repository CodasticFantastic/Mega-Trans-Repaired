"use client";

import Image from "next/image";
import factoryIcon from "@/images/icons/factoryIcon.png";
import warehouseIcon from "@/images/icons/warehouseIcon.png";
import deliveryIconTwo from "@/images/icons/deliveryIconTwo.png";
import deliveredIcon from "@/images/icons/deliveredIcon.png";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrackOrder() {
  const path = usePathname();
  const id = path.split("/")[2];
  const [order, setOrder] = useState({
    orderId: "",
    sender: "",
    status: "",
    address: "",
    deliveryDate: "",
    payment: "",
    courier: "",
    courierNumber: "",
  });

  const [packages, setPackages] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOrder();
  }, []);

  async function getOrder() {
    const req = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/trackOrder?id=${id}`);
    const res = await req.json();

    if (res.error) {
      setError(res.error);
    } else {
      // Generate Address
      const address = `${res.order.orderStreet} ${res.order.orderStreetNumber} ${
        res.order.orderFlatNumber && "/" + res.order.orderFlatNumber
      }`;

      const orderAddress = `${address}, ${res.order.orderPostCode} ${res.order.orderCity}`;

      // Generate Delivery Date
      let deliveryDate;
      if (res.order.deliveryDate) {
        deliveryDate = res.order.deliveryDate;
      } else {
        deliveryDate = "Oczekuje na potwierdzenie";
      }

      // Generate Payment Ammount
      let price = 0;

      res.order.packages.forEach((item) => {
        price += item.commodityPrice;
      });

      price += " " + res.order.currency;

      // Generate Courier Data
      let courier;
      if (res.order.courier !== null) {
        courier = res.order.courier.name;
      } else {
        courier = "Oczekuje na potwierdzenie";
      }

      let courierNumber;
      if (res.order.courier !== null) {
        courierNumber = res.order.courier.phone;
      } else {
        courierNumber = "Oczekuje na potwierdzenie";
      }

      // Generate Packages
      const packages = res.order.packages.map((item, index) => {
        return (
          <p key={index}>
            <span>
              {index + 1}. {item.commodityName}
            </span>
          </p>
        );
      });

      setOrder({
        orderId: res.order.orderId,
        sender: res.order.user.company,
        status: res.order.status,
        address: orderAddress,
        deliveryDate: deliveryDate,
        payment: price === 0 ? "Opłacona" : price,
        courier: courier,
        courierNumber: courierNumber,
      });

      setPackages(packages);
    }
  }

  return (
    <main className="TrackingPage">
      <div className="left">
        {error && <p className="error">{error}</p>}
        <div className="orderInfo">
          <h2>Poznaj lokalizację swojej przesyłki</h2>
          <p>
            Nadawca: <span>{order.sender}</span>
          </p>
          <p>
            Numer Przesyłki: <span>{order.orderId}</span>
          </p>
          <p>
            Status: <span>{order.status}</span>
          </p>
          <p>
            Adres Dostawy: <span>{order.address}</span>
          </p>
          <p>
            Planowany Termin Dostawy: <span>{order.deliveryDate}</span>
          </p>
          <p>
            Płatność za pobraniem: <span>{order.payment}</span>
          </p>
        </div>
        <div className="courierInfo">
          <h2>Dane Kuriera</h2>
          <p>
            Kurier: <span>{order.courier}</span>
          </p>
          <p>
            Numer Do Kuriera: <span>{order.courierNumber}</span>
          </p>
        </div>
        <div className="packages">
          <h2>Transportowane Towary</h2>
          {packages}
        </div>
      </div>
      <div className="right">
        <div className={`tile ${order.status === "Producent" && "mark"}`}>
          <Image src={factoryIcon} alt="Ikona Fabryki" />
          <p className="title">1. Producent</p>
          <p className="description">Przesyłka znajduje się u producenta i oczekuje na transport do naszego centrum logistycznego</p>
        </div>
        <div className={`tile ${order.status === "Magazyn" && "mark"}`}>
          <Image src={warehouseIcon} alt="Ikona Fabryki" />
          <p className="title">2. Magazyn</p>
          <p className="description">Twoja przesyłka do nas dotarła. Niebawem otrzymasz informacje o terminie dostawy.</p>
        </div>
        <div className={`tile ${order.status === "Dostawa" && "mark"}`}>
          <Image src={deliveryIconTwo} alt="Ikona Fabryki" />
          <p className="title">3. Dostawa</p>
          <p className="description">
            Twoja przesyłka została załądowana na pojazd a kurier wyruszył. Oczekuj jego przybycia do lokalizacji docelowej
          </p>
        </div>
        <div className={`tile ${order.status === "Zrealizowane" && "mark"}`}>
          <Image src={deliveredIcon} alt="Ikona Fabryki" />
          <p className="title">4. Dostarczona</p>
          <p className="description">Twoja przesyłka została dostarczona. Dziękujemy za skorzystanie z usług naszej firmy</p>
        </div>
      </div>
    </main>
  );
}
