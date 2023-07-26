"use client";

import Link from "next/link";
import Image from "next/image";
import redBackIcon from "@/images/icons/redBackIcon.png";

import xlsx from "xlsx";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DeliveryPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  async function uploadFile(e) {
    e.preventDefault();

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = xlsx.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[2];
      const worksheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(worksheet);

      json.shift();
      json.pop();
      json.pop();

      setDisplayData(
        json.map((order, index) => {
          return (
            <div className="order" key={index}>
              <div className="orderNo">
                <p>{index + 1}</p>
              </div>
              <div className="orderId">
                <p>{order["Nazwa obiektu"]}</p>
              </div>
              <div className="address">
                <p>{order.Adres}</p>
              </div>
              <div className="courier">
                <p>{order.Kierowca}</p>
              </div>
              <div className="date">
                <p>{order["Data dojazdu z godziną"]}</p>
              </div>
            </div>
          );
        })
      );

      setData(
        json.map((order) => {
          return {
            id: order["Nazwa obiektu"],
            driver: order.Kierowca,
            deliveryDate: order["Data dojazdu z godziną"],
          };
        })
      );
    };

    reader.readAsArrayBuffer(e.target[0].files[0]);
  }

  async function updateStatus(e) {
    setError(false);
    setSuccess(false);
    e.preventDefault();

    const response = await fetch("http://localhost:3000/api/order/attachDriver", {
      method: "PATCH",
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (json.error) {
      console.log(json.error);
      setError(json.error);
    } else if (json.success) {
      console.log(json.success);
      setSuccess(json.success);
    }
  }

  return (
    <div className="DeliveryPage">
      <header className="CRMHeader">
        <Link href="/dashboard" className="backToDashboard">
          <Image src={redBackIcon} alt="Powrót do ekranu głównego" />
          <p>Powrót do pulpitu</p>
        </Link>
        <h1>Poinformuj Klientów o Dostawie</h1>
      </header>
      <main>
        <div className="instructions">
          <form onSubmit={uploadFile}>
            <div className="stageName">
              <p>1. Wgraj Zlecenia</p>
            </div>
            <input type="file" name="file" id="file" placeholder="Wybierz plik" />
            <button type="submit">Wgraj Plik</button>
          </form>
          <form className="updateData" onSubmit={updateStatus}>
            <div className="stageName2">
              <p>2. Aktualizuj Statusy</p>
            </div>
            <label htmlFor="update">
              <input type="checkbox" name="update" id="update" required />
              Chcę zakutalizować statusy
            </label>
            <button type="submit">Wgraj Plik</button>
            {success && <p className="success">{success}</p>}
            {error && <p className="error">{error}</p>}
          </form>
        </div>

        <div className="confirmOrders">
          <div className="stageName">
            <p>Zaczytane Zlecenia</p>
          </div>
          <div className="orders">
            <div className="tableHeader">
              <div className="orderNo">
                <p>No.</p>
              </div>
              <div className="orderId">
                <p>ID Paczki</p>
              </div>

              <div className="address">
                <p>Adres</p>
              </div>
              <div className="courier">
                <p>Kurier</p>
              </div>
              <div className="date">
                <p>Data Dostawy</p>
              </div>
            </div>
            {displayData}
          </div>
        </div>
      </main>
    </div>
  );
}
