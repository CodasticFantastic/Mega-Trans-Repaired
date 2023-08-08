import Image from "next/image";
import Link from "next/link";
import EditIcon from "@/images/icons/editIcon.png";
import CircleArrowDownIcon from "@/images/icons/circleArrowDownIcon.png";
import PhoneIcon from "@/images/icons/phoneIcon.png";
import EmailIcon from "@/images/icons/emailIcon.png";
import CompanyIcon from "@/images/icons/companyIcon.png";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function TableDataRow({ order, session, setExportOrders }) {
  const [status, setStatus] = useState(order.status);
  const [ifExported, setIfExported] = useState(false);
  let day;
  let month;
  let year;
  let hour;
  let minutes;

  function formatDate(input) {
    const date = new Date(input);
    day = date.getDate();
    month = date.toLocaleDateString("pl-PL", { month: "long" });
    year = date.getFullYear();
    hour = date.getHours();
    minutes = date.getMinutes();
  }

  async function chnageStatus(e, id) {
    const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/updateOrderStatus`, {
      method: "POST",
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: id,
        status: e,
      }),
    });

    const response = await request.json();

    if (response.error) {
      signOut();
    } else if (response.success) {
      setStatus(e);
    }
  }

  function exportOrder(e) {
    setIfExported(e.target.checked);

    if (e.target.checked) {
      setExportOrders((prev) => [...prev, order]);
    } else {
      setExportOrders((prev) => prev.filter((item) => item.orderId !== order.orderId));
    }
  }

  return (
    <div className="tr">
      <div className="mainInfo">
        <div className="col1 td">
          <input type="checkbox" checked={ifExported} onChange={() => exportOrder(event)} />
        </div>
        <div className="col8 td">{order.orderType}</div>
        <div className="col2 td">{order.orderId}</div>
        <div className={`col3 td ${status}`}>
          {session.user.role === "ADMIN" && (
            <select className="status select" value={status} onChange={(e) => chnageStatus(e.target.value, order.orderId)}>
              <option value="Producent">Producent</option>
              <option value="Magazyn">Magazyn</option>
              <option value="Dostawa">Dostawa</option>
              <option value="Zrealizowane">Zrealizowane</option>
              <option value="Anulowane">Anulowane</option>
            </select>
          )}
          {session.user.role === "USER" && <p className="status">{order.status}</p>}
        </div>
        <div className="col4 td">
          {formatDate(order.updatedAt)}
          {` ${day} ${month} ${year} o ${hour}:${minutes}`}
        </div>
        <div className="col5 td">{order.recipientName}</div>
        <div className="col6 td">
          {order.orderPostCode} {order.orderCity} <br /> {order.orderStreet} {order.orderStreetNumber}{" "}
          {order.orderFlatNumber && `/ ${order.orderFlatNumber}`}
        </div>
        <div className="col7 td">
          <Link href={`/updateOrder/${order.orderId}`}>
            <Image src={EditIcon} alt={`Edytuj zamwienie nr: ${order.orderId}`} />
          </Link>
          <label className="showMoreLabel">
            <input type="checkbox" className="showMoreInput" />
            <Image src={CircleArrowDownIcon} alt={`Rozwiń zamwienie nr: ${order.orderId}`} />
          </label>
        </div>
      </div>
      <div className="detailInfo">
        <div className="tr">
          <div className="addInfoHeader">
            <p>Dodatkowe Informacje</p>
          </div>
          <div className="addInfoContent">
            <div className="additionalInfo">
              <Image src={PhoneIcon} alt={`Numer telefonu`} />
              <p>{order.recipientPhone}</p>
            </div>
            <div className="additionalInfo">
              <Image src={EmailIcon} alt={`Adres Email: `} />
              <p>{order.recipientEmail}</p>
            </div>
            <div className="additionalInfo">
              <Image src={CompanyIcon} alt={`Dostawa od firmy: `} />
              <p>{order.user.company}</p>
            </div>
          </div>
        </div>
        <div className="tr">
          <div className="addInfoHeader">
            {order.orderPaymentType === "Pobranie" && (
              <>
                <div>
                  <p className="title">Kwota Pobrania</p>
                  <p className="counter">{`${order.orderPrice} ${order.currency}`}</p>
                </div>
              </>
            )}
            <div>
              <p className="title">Ilość Paczek</p>
              <p className="counter">{order.packages.length}</p>
            </div>
          </div>
          <div className="addInfoContent col">
            {order.packages.map((packageItem) => {
              return (
                <div className="row" key={packageItem.packageId}>
                  <p className="rowData1 rowData">{packageItem.packageId}</p>
                  <p className="rowData2 rowData">{packageItem.commodityName}</p>
                  <p className="rowData4 rowData">{packageItem.commodityNote}</p>
                </div>
              );
            })}
          </div>
        </div>
        {order.orderNote && (
          <>
            <div className="tr">
              <div className="addInfoHeader">
                <p>Notatka</p>
              </div>
              <div className="addInfoContent note">
                <p>{order.orderNote}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
