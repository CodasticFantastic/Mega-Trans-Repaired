"use client";

import { useEffect, useState } from "react";
import ControlHeader from "../components/ControlHeader";
import FilterSideBar from "../components/sidebars/FilterSideBar";

import { useSession } from "next-auth/react";
import Link from "next/link";

import Image from "next/image";
import TableDataRow from "@/app/(Website)/components/TableDataRow";

export default function Dashboard() {
  const { data: session } = useSession();
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    if (session) {
      fetchUserOrders();
    }
  }, [session]);

  async function fetchUserOrders() {
    let request = await fetch(`http://localhost:3000/api/order/showAllOrders`, { headers: { Authorization: session?.accessToken } });

    let response = await request.json();

    if(response.error){
      console.log(response.error)
    } else {
      setUserOrders(
        response.allUserOrder.map((order) => {
          return <TableDataRow key={order.orderId} order={order}/>;
        })
      );
    }
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
            <div className="tbody">{userOrders}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
