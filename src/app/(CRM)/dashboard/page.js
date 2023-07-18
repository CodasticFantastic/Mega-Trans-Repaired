"use client";

import { useEffect, useState } from "react";
import ControlHeader from "../components/ControlHeader";
import FilterSideBar from "../components/sidebars/FilterSideBar";

import { useSession } from "next-auth/react";
import Link from "next/link";
import EditIcon from "@/images/icons/editIcon.png";
import CircleArrowDownIcon from "@/images/icons/circleArrowDownIcon.png";
import PhoneIcon from "@/images/icons/phoneIcon.png";
import EmailIcon from "@/images/icons/emailIcon.png";
import CompanyIcon from "@/images/icons/companyIcon.png";

import Image from "next/image";

export default function Dashboard() {
  const { data: session } = useSession();
  const [userOrders, setUserOrders] = useState([]);
  // let date = new Date();

  useEffect(() => {
    if (session) {
      fetchUserOrders();
    }
  }, [session]);

  async function fetchUserOrders() {
    let request = await fetch(`http://localhost:3000/api/order/showAllOrders`, { headers: { Authorization: session?.accessToken } });

    let response = await request.json();

    setUserOrders(
      response.allUserOrder.map((order) => {
        return (
          <tr key={order.orderId}>
            <td className="col1">
              <input type="checkbox" value={order.orderId} />
            </td>
            <td className="col2">{order.orderId}</td>
            <td className="col3">{order.status}</td>
            <td className="col4">
              {order.updatedAt.replace("T", "").slice(0, 10)} <br />
              {order.updatedAt.replace("T", "").slice(10, 18)}
            </td>
            <td className="col5">{order.recipientName}</td>
            <td className="col6">
              {order.orderPostCode} {order.orderCity} <br /> {order.orderStreet} {order.orderStreetNumber}{" "}
              {order.orderFlatNumber && `/ ${order.orderFlatNumber}`}
            </td>
            <td className="col7">
              <Link href={`/updateOrder/${order.orderId}`}>
                <Image src={EditIcon} alt={`Edytuj zamwienie nr: ${order.orderId}`} />
              </Link>
            </td>
          </tr>
        );
      })
    );

    console.log(response);
  }

  return (
    <div className="CrmPage">
      <FilterSideBar />
      <div className="mainContent">
        <ControlHeader />
        <main>
          <div className="table">
            <div className="thead">
              <div className="tr">
                <div className="col1 th">Eksport</div>
                <div className="col2 th">Numer Paczki</div>
                <div className="col3 th">Status</div>
                <div className="col4 th">Aktualizacja</div>
                <div className="col5 th">Nazwa Klienta</div>
                <div className="col6 th">Adres</div>
                <div className="col7 th">Opcje</div>
              </div>
            </div>
            <div className="tbody">
              {/* {userOrders} */}
              <div className="tr">
                <div className="mainInfo">
                  <div className="col1 td">
                    <input type="checkbox" />
                  </div>
                  <div className="col2 td">0407bfbf-378d-4b6b-b1b0-2ec3ee7af76e</div>
                  <div className="col3 td">123456789</div>
                  <div className="col4 td">123456789</div>
                  <div className="col5 td">123456789</div>
                  <div className="col6 td">05-077 Warszawa, Graniczna 15A</div>
                  <div className="col7 td">
                    <Link href={`/updateOrder`}>
                      <Image src={EditIcon} alt={`Edytuj zamwienie nr: `} />
                    </Link>
                    <label htmlFor="showMore">
                      <input type="checkbox" id="showMore" />
                      <Image src={CircleArrowDownIcon} alt={`Rozwiń zamwienie nr: `} />
                    </label>
                  </div>
                </div>
                <div className="detailInfo">
                  <div className="tr">
                    <div className="addInfoHeader">
                      <p>Dodatkowe Informacje</p>
                    </div>
                    <div className="additionalInfo">
                      <Image src={PhoneIcon} alt={`Numer telefonu: `} />
                      <span>123456789</span>
                    </div>
                    <div className="additionalInfo">
                      <Image src={EmailIcon} alt={`Adres Email: `} />
                      <span>test@test.pl</span>
                    </div>
                    <div className="additionalInfo">
                      <Image src={CompanyIcon} alt={`Dostawa od firmy: `} />
                      <span>Agata Meble sp. z o.o.</span>
                    </div>
                  </div>
                  <div className="tr">
                    <div className="addInfoHeader">
                      <p>Wykaz Paczek</p>
                      <p>5</p>
                    </div>
                    <div className="packages">
                      
                    </div>
                  </div>
                  <div className="tr">
                    <div className="addInfoHeader">
                      <p>Notatka</p>
                    </div>
                    <div className="note">
                      <p>Bardzo długa notatka na temat szczegółow transpoirtu przesyłi napisana przez klienta</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
