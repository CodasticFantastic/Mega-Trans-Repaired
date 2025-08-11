"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ControlHeader from "../components/ControlHeader";
import DashboardSidebar from "../components/sidebars/DashboardSidebar/DashboardSidebar";
import {
  DashboardSidebarFilters,
  DashboardSidebarProvider,
} from "../components/sidebars/DashboardSidebar/DashboardSidebar.context";
import TableDataRow from "../components/TableDataRow";

import { useSession } from "next-auth/react";
import Link from "next/link";

import { signOut } from "next-auth/react";

import FileSaver from "file-saver";
import XLSX from "sheetjs-style";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { OrderWithUserAndPackages } from "types/order.types";
import { Loader2Icon } from "lucide-react";

// Typy dla statystyk
interface Stats {
  allOrders: number;
  newOrders: number;
  currentOrders: number;
  warehouseOrders: number;
  realizedOrders: number;
}

// Typy dla odpowiedzi API
interface ApiResponse {
  allUserOrder: OrderWithUserAndPackages[];
  nextId?: string;
  allOrdersCounter: number;
  newOrdersCounter: number;
  currentOrdersCounter: number;
  warehouseOrdersCounter: number;
  realizedOrdersCounter: number;
  error?: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [observerRoot, setObserverRoot] = useState<Element | null>(null);

  const { inView, ref: sentinelRef } = useInView({
    root: observerRoot,
    rootMargin: "300px 0px 300px 0px",
    threshold: 0,
  });
  const [exportOrders, setExportOrders] = useState<OrderWithUserAndPackages[]>(
    []
  );

  const [stats, setStats] = useState<Stats>({
    allOrders: 0,
    newOrders: 0,
    currentOrders: 0,
    warehouseOrders: 0,
    realizedOrders: 0,
  });

  // [DashboardSidebarProvider] Filters
  const [filters, setFilters] = useState<DashboardSidebarFilters>({
    searchId: "",
    orderBy: "desc",
    status: "Wszystkie",
    dateFrom: "",
    dateTo: "",
    postalCode: "all",
  });

  // Przeniesienie logiki zapytania poza funkcję getOrders
  const getOrders = async ({
    pageParam = "",
    filters,
  }: {
    pageParam?: string;
    filters: DashboardSidebarFilters;
  }): Promise<ApiResponse> => {
    let request: Response;

    if (session?.user?.role === "USER") {
      request = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/showAllOrders?cursor=${pageParam}&orderBy=${filters.orderBy}&status=${filters.status}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}&postalCode=${filters.postalCode}&searchId=${filters.searchId}`,
        {
          headers: { Authorization: session?.accessToken ?? "" },
        }
      );
    } else if (session?.user?.role === "ADMIN") {
      request = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/showAllOrdersAdmin?cursor=${pageParam}&orderBy=${filters.orderBy}&status=${filters.status}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}&postalCode=${filters.postalCode}&searchId=${filters.searchId}`,
        {
          headers: { Authorization: session?.accessToken ?? "" },
        }
      );
    } else {
      throw new Error("Nieprawidłowa rola użytkownika");
    }

    const data: ApiResponse = await request.json();

    if (session && data.error) {
      signOut();
      throw new Error(data.error);
    } else {
      setStats({
        allOrders: data.allOrdersCounter,
        newOrders: data.newOrdersCounter,
        currentOrders: data.currentOrdersCounter,
        warehouseOrders: data.warehouseOrdersCounter,
        realizedOrders: data.realizedOrdersCounter,
      });
      return data;
    }
  };

  const {
    data: allUserOrder,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<ApiResponse>({
    initialPageParam: "",
    queryKey: ["allUserOrder", session, filters],
    queryFn: ({ pageParam = "" }) =>
      getOrders({ pageParam: pageParam as string, filters }),
    getNextPageParam: (lastPage) => {
      return lastPage.nextId || undefined;
    },
  });

  useEffect(() => {
    if (
      inView &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetching &&
      allUserOrder?.pages.length &&
      allUserOrder?.pages.length > 0
    ) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  ///////////////// Export Data To Excel
  async function exportOrdersData() {
    const ordersToExport = exportOrders.map((order) => {
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

    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(ordersToExport);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "Zamówienia" + fileExtension);
  }

  const orders = useMemo(
    () => allUserOrder?.pages?.flatMap((p) => p.allUserOrder) ?? [],
    [allUserOrder]
  );

  useEffect(() => {
    // Set the root once the element is mounted so the observer uses the correct scroll container
    setObserverRoot(scrollRef.current);
  }, []);

  // [DashboardSidebarProvider] Handle Filters Change
  const handleFiltersChange = (newFilters: DashboardSidebarFilters) => {
    setExportOrders([]);
    setFilters(newFilters);
  };

  // [DashboardSidebarProvider] Handle Clear Filters
  const handleClearFilters = () => {
    setExportOrders([]);
    setFilters({
      searchId: "",
      orderBy: "desc",
      status: "Wszystkie",
      dateFrom: "",
      dateTo: "",
      postalCode: "all",
    });
  };

  return (
    <DashboardSidebarProvider
      onFiltersChange={handleFiltersChange}
      onClearFilters={handleClearFilters}
    >
      <div className="flex w-full flex-col md:flex-row">
        <DashboardSidebar />

        <div className="w-full pr-2">
          <ControlHeader
            orders={stats.allOrders}
            currentOrders={stats.currentOrders}
            completedOrders={stats.realizedOrders}
            newOrders={stats.newOrders}
            inWarehouse={stats.warehouseOrders}
            exportOrdersData={exportOrdersData}
          />
          <main className="mt-5 w-full pl-8">
            <div
              className="relative w-full rounded-md border h-[calc(100vh-100px)] overflow-y-auto"
              ref={scrollRef}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="min-w-10 text-center"></TableHead>
                    <TableHead className="min-w-22 text-center">
                      Rodzaj
                    </TableHead>
                    <TableHead className="min-w-64 text-center">
                      ID Paczki
                    </TableHead>
                    <TableHead className="min-w-36 text-center">
                      Status
                    </TableHead>
                    <TableHead className="min-w-38 hidden lg:table-cell text-center">
                      Aktualizacja
                    </TableHead>
                    <TableHead className="min-w-48 hidden md:table-cell text-center">
                      Nazwa Klienta
                    </TableHead>
                    <TableHead className="min-w-48 hidden md:table-cell text-center">
                      Adres
                    </TableHead>
                    <TableHead className="w-24 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableDataRow
                      key={order.orderId}
                      order={order}
                      setExportOrders={setExportOrders}
                    />
                  ))}
                </TableBody>
              </Table>
              <div className="sticky bottom-0 z-10 flex h-8 items-center justify-center bg-background/80 text-sm text-muted-foreground">
                {isFetchingNextPage && (
                  <>
                    <Loader2Icon className="mr-2 inline size-4 animate-spin" />
                    Ładowanie...
                  </>
                )}
              </div>
              <div ref={sentinelRef} className="h-6 w-full" />
            </div>
          </main>
          {session && session.user.role === "USER" && (
            <footer className="mt-0 flex flex-col items-end justify-center">
              <p className="text-sm text-foreground">
                Developed by:{" "}
                <Link
                  href="https://jakubwojtysiak.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  JW.online
                </Link>
              </p>
            </footer>
          )}
        </div>
      </div>
    </DashboardSidebarProvider>
  );
}
