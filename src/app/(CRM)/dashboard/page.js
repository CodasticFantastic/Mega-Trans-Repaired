"use client";

import { useEffect, useState } from "react";
import ControlHeader from "../components/ControlHeader";
import FilterSideBar from "../components/sidebars/FilterSideBar";
import TableDataRow from "../components/TableDataRow";

import { useSession } from "next-auth/react";
import Link from "next/link";

import { signOut } from "next-auth/react";

import FileSaver from "file-saver";
import XLSX from "sheetjs-style";

export default function Dashboard() {
  const { data: session } = useSession();
  const [userOrders, setUserOrders] = useState([]);
  const [initialUserOrders, setInitialUserOrders] = useState([]);
  const [exportOrders, setExportOrders] = useState([]);

  useEffect(() => {
    if (session) {
      fetchUserOrders();
    }
  }, [session]);

  // Fetch all orders for this user
  async function fetchUserOrders() {
    let request;
    if (session.user.role === "USER") {
      request = await fetch(`http://localhost:3000/api/order/showAllOrders`, { headers: { Authorization: session?.accessToken } });
    } else if (session.user.role === "ADMIN") {
      request = await fetch(`http://localhost:3000/api/order/showAllOrdersAdmin`, { headers: { Authorization: session?.accessToken } });
    }

    let response = await request.json();

    if (response.error) {
      signOut();
    } else {
      setUserOrders(
        response.allUserOrder.map((order) => {
          return <TableDataRow key={order.orderId} order={order} session={session} setExportOrders={setExportOrders} />;
        })
      );
      setInitialUserOrders(
        response.allUserOrder.map((order) => {
          return <TableDataRow key={order.orderId} order={order} session={session} setExportOrders={setExportOrders} />;
        })
      );
    }
  }

  ///////////////// Filters Section
  // Search orders by id
  function searchOrdersById(id) {
    let filtered = [...initialUserOrders].filter((order) => order.props.order.orderId.indexOf(id) !== -1);
    setUserOrders(filtered);
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

  // Filter orders by date
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

  ///////////////// Info Data Section
  // Count all orders
  let allOrders = initialUserOrders.length;

  // Current orders
  let currentOrders = initialUserOrders.filter(
    (order) => order.props.order.status !== "Zrealizowane" && order.props.order.status !== "Anulowane"
  ).length;

  // Completed orders
  let completedOrders = initialUserOrders.filter((order) => order.props.order.status === "Zrealizowane").length;

  // New Orders
  let newOrders = initialUserOrders.filter((order) => order.props.order.status === "Producent").length;

  // In Warehouse
  let inWarehouse = initialUserOrders.filter((order) => order.props.order.status === "Magazyn").length;

  ///////////////// Export Data To Excel
  async function exportOrdersData() {
    let ordersToExport = exportOrders.map((order) => {
      let number = order.orderStreetNumber;
      if (order.orderFlatNumber) {
        number += "/" + order.orderFlatNumber;
      }

      return {
        Nazwa: order.orderId,
        Kategoria: order.orderType,
        Opis: order.recipientName,
        "Kod pocztwoy": order.orderPostCode,
        Miasto: order.orderCity,
        Ulica: order.orderStreet,
        Numer: number,
        Państwo: order.orderCountry,
        "Czas postoju": "00:15:00",
      };
    });

    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(ordersToExport);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "Zamówienia" + fileExtension);
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
        <ControlHeader
          orders={allOrders}
          currentOrders={currentOrders}
          completedOrders={completedOrders}
          newOrders={newOrders}
          inWarehouse={inWarehouse}
          exportOrdersData={exportOrdersData}
        />
        <main>
          <div className="table">
            <div className="thead">
              <div className="tr">
                <div className="col1 th">Eksport</div>
                <div className="col2 th">ID Paczki</div>
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
        {session && session.user.role === "USER" && (
          <footer>
            <p>
              Create by: <Link href="/">Space Agency Marketing</Link>
            </p>
            <p>
              Icons by: <Link href="https://icons8.com/">Icons8</Link>
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
