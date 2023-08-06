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

import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";

export default function Dashboard() {
  const { data: session } = useSession();
  const { inView, ref } = useInView();
  const [exportOrders, setExportOrders] = useState([]);

  const [filters, setFilters] = useState({
    searchId: "",
    orderBy: "desc",
    status: "Wszystkie",
    dateFrom: "",
    dateTo: "",
    postalCode: "all",
  });

  const [stats, setStats] = useState({
    allOrders: 0,
    newOrders: 0,
    currentOrders: 0,
    warehouseOrders: 0,
    realizedOrders: 0,
  });

  const { allUserOrder, fetchNextPage, hasNextPage, isFetchingNextPage } = getOrders();

  function getOrders() {
    const getOrders = async ({ pageParam = "", filters }) => {
      let request;

      if (session.user.role === "USER") {
        request = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/showAllOrders?cursor=${pageParam}&orderBy=${filters.orderBy}&status=${filters.status}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}&postalCode=${filters.postalCode}&searchId=${filters.searchId}`,
          {
            headers: { Authorization: session?.accessToken },
          }
        );
      } else if (session.user.role === "ADMIN") {
        request = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/showAllOrdersAdmin?cursor=${pageParam}&orderBy=${filters.orderBy}&status=${filters.status}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}&postalCode=${filters.postalCode}&searchId=${filters.searchId}`,
          {
            headers: { Authorization: session?.accessToken },
          }
        );
      }

      let data = await request.json();

      if (session && data.error) {
        signOut();
      } else {
        setStats({
          allOrders: data.allOrdersCounter,
          newOrders: data.newOrdersCounter,
          currentOrders: data.currentOrdersCounter,
          warehouseOrders: data.warehouseOrdersCounter,
          realizedOrders: data.realizedOrdersCounter,
        });
        console.log(data);
        return data;
      }
    };

    const {
      data: allUserOrder,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    } = useInfiniteQuery(["allUserOrder", session, filters], ({ pageParam = "" }) => getOrders({ pageParam, filters }), {
      getNextPageParam: (lastPage) => lastPage.nextId ?? false,
    });

    return { allUserOrder, fetchNextPage, hasNextPage, isFetchingNextPage };
  }

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  ///////////////// Filters Section
  // Search orders by id
  function searchOrdersById(id) {
    setExportOrders([]);
    setFilters((prev) => ({ ...prev, searchId: id }));
  }

  // Sort orders by date
  function sortOrdersByDate(order) {
    if (order === "ascending") {
      setFilters((prev) => ({ ...prev, orderBy: "asc" }));
    } else {
      setFilters((prev) => ({ ...prev, orderBy: "desc" }));
    }
  }

  // Filter orders by status
  function filterOrdersByStatus(status) {
    setExportOrders([]);
    switch (status) {
      case "Producent":
        setFilters((prev) => ({ ...prev, status: "Producent" }));
        break;
      case "Magazyn":
        setFilters((prev) => ({ ...prev, status: "Magazyn" }));
        break;
      case "Dostawa":
        setFilters((prev) => ({ ...prev, status: "Dostawa" }));
        break;
      case "Zrealizowane":
        setFilters((prev) => ({ ...prev, status: "Zrealizowane" }));
        break;
      case "Anulowane":
        setFilters((prev) => ({ ...prev, status: "Anulowane" }));
        break;
      default:
        setFilters((prev) => ({ ...prev, status: "Wszystkie" }));
        break;
    }
  }

  // Filter orders by date
  function filterOrdersByDate(from, to) {
    setExportOrders([]);
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  }

  // Filter orders by postal code
  function filterOrdersByPostalCode(code) {
    setExportOrders([]);
    setFilters((prev) => ({ ...prev, postalCode: code }));
  }

  // Clear filters
  function clearFilters() {
    setExportOrders([]);
    setFilters({
      orderBy: "desc",
      status: "Wszystkie",
      dateFrom: "",
      dateTo: "",
      postalCode: "all",
    });
  }

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
        filterByPostalCode={filterOrdersByPostalCode}
        clearFilters={clearFilters}
        session={session}
      />
      <div className="mainContent">
        <ControlHeader
          orders={stats.allOrders}
          currentOrders={stats.currentOrders}
          completedOrders={stats.realizedOrders}
          newOrders={stats.newOrders}
          inWarehouse={stats.warehouseOrders}
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
            <div className="tbody">
              {allUserOrder &&
                allUserOrder.pages?.flatMap((page, i) => {
                  return (
                    <div key={i}>
                      {page.allUserOrder.map((order) => {
                        return <TableDataRow key={order.orderId} order={order} session={session} setExportOrders={setExportOrders} />;
                      })}
                    </div>
                  );
                })}
              {isFetchingNextPage && <div>Loading...</div>}
              <div style={{ width: "100%", height: "40px", background: "red" }} ref={ref} />
            </div>
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
