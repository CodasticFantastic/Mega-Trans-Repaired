"use client";

import { useEffect, useState } from "react";
import ControlHeader from "../components/ControlHeader";
import FilterSideBar from "../components/sidebars/FilterSideBar";

import { useSession } from "next-auth/react";
import Link from "next/link";

import Image from "next/image";
import TableDataRow from "../components/TableDataRow";

export default function Dashboard() {
  const { data: session } = useSession();
  const [userOrders, setUserOrders] = useState([]);
  const [initialUserOrders, setInitialUserOrders] = useState([]);

  useEffect(() => {
    if (session) {
      fetchUserOrders();
    }
  }, [session]);

  // Fetch all orders for this user
  async function fetchUserOrders() {
    let request = await fetch(`http://localhost:3000/api/order/showAllOrders`, { headers: { Authorization: session?.accessToken } });

    let response = await request.json();

    if (response.error) {
      console.log(response.error);
    } else {
      setUserOrders(
        response.allUserOrder.map((order) => {
          return <TableDataRow key={order.orderId} order={order} />;
        })
      );
      setInitialUserOrders(
        response.allUserOrder.map((order) => {
          return <TableDataRow key={order.orderId} order={order} />;
        })
      );
    }
  }

  // Sort orders by date
  function sortOrdersByDate(order) {
    if (order === "ascending") {
      const sorted = [...userOrders].sort((a, b) =>
        new Date(a.props.order.updatedAt) > new Date(b.props.order.updatedAt)
          ? 1
          : new Date(b.props.order.updatedAt) > new Date(a.props.order.updatedAt)
          ? -1
          : 0
      );

      setUserOrders(sorted);
    } else {
      const sorted = [...userOrders].sort((a, b) =>
        new Date(a.props.order.updatedAt) < new Date(b.props.order.updatedAt)
          ? 1
          : new Date(b.props.order.updatedAt) < new Date(a.props.order.updatedAt)
          ? -1
          : 0
      );

      setUserOrders(sorted);
    }
  }

  // Filter orders by status
  function filterOrdersByStatus(status) {
    let filtered;
    switch (status) {
      case "Wszystkie":
        fetchUserOrders();
        break;
      case "Producent":
        filtered = [...initialUserOrders].filter((order) => order.props.order.status === "Producent");
        setUserOrders(filtered);
        break;
      case "Magazyn":
        filtered = [...initialUserOrders].filter((order) => order.props.order.status === "Magazyn");
        setUserOrders(filtered);
        break;
      case "Dostawa":
        filtered = [...initialUserOrders].filter((order) => order.props.order.status === "Dostawa");
        setUserOrders(filtered);
        break;
      case "Pobranie":
        filtered = [...initialUserOrders].filter((order) => order.props.order.status === "Pobranie");
        setUserOrders(filtered);
        break;
      case "Zrealizowane":
        filtered = [...initialUserOrders].filter((order) => order.props.order.status === "Zrealizowane");
        setUserOrders(filtered);
        break;
      case "Anulowane":
        filtered = [...initialUserOrders].filter((order) => order.props.order.status === "Anulowane");
        setUserOrders(filtered);
        break;
    }
  }

  // Search orders by id
  function searchOrdersById(id) {
    let filtered = [...initialUserOrders].filter((order) => order.props.order.orderId.indexOf(id) !== -1);
    setUserOrders(filtered);
  }

  function filterOrdersByDate(from, to) {
    let filtered = [...initialUserOrders].filter((order) => {
      return new Date(order.props.order.createdAt) >= new Date(from) && new Date(order.props.order.createdAt) <= new Date(to);
    });

    setUserOrders(filtered);
  }

  // Clear filters
  function clearFilters() {
    setUserOrders(initialUserOrders);
  }

  return (
    <div className="CrmPage">
      <FilterSideBar
        sortOrdersByDate={sortOrdersByDate}
        filterOrdersByStatus={filterOrdersByStatus}
        searchOrdersById={searchOrdersById}
        filterOrdersByDate={filterOrdersByDate}
        clearFilters={clearFilters}
      />
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
