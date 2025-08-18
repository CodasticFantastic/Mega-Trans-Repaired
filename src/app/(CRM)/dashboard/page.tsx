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

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/shadcn/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { OrderWithUserAndPackages } from "types/order.types";
import {
  BanIcon,
  FileDownIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";
import { Role } from "@prisma/client";
import { CustomToast } from "@/components/shadcn/custom/toast";

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
  const queryClient = useQueryClient();
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

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

  ///////////////// Operations on selected orders

  function handleCancelOrdersClick() {
    if (exportOrders.length === 0) {
      CustomToast("error", "Nie zaznaczono żadnych zamówień", {
        duration: 3000,
      });
      return;
    }
    setShowCancelModal(true);
  }

  async function handleCancelOrdersConfirm() {
    setIsCanceling(true);
    try {
      // Pokaż toast o rozpoczęciu operacji
      CustomToast("info", `Anulowanie ${exportOrders.length} zamówień...`, {
        duration: 2000,
      });

      // Wykonaj wszystkie anulowania równolegle
      const cancelPromises = exportOrders.map(async (order) => {
        const request = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/cancelOrder?id=${order.orderId}`,
          {
            method: "GET",
            headers: {
              Authorization: session?.accessToken || "",
            },
          }
        );

        const response = await request.json();

        if (response.error) {
          throw new Error(
            `Błąd anulowania zamówienia ${order.orderId}: ${response.error}`
          );
        }

        return { orderId: order.orderId, success: true };
      });

      // Czekaj na zakończenie wszystkich operacji
      const results = await Promise.allSettled(cancelPromises);

      // Sprawdź wyniki
      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      // Wyczyść zaznaczone zamówienia
      setExportOrders([]);

      // Odśwież dane
      queryClient.invalidateQueries({ queryKey: ["allUserOrder"] });

      // Pokaż odpowiedni toast
      if (failed === 0) {
        CustomToast("success", `Pomyślnie anulowano ${successful} zamówień`, {
          duration: 4000,
        });
      } else if (successful === 0) {
        CustomToast("error", `Nie udało się anulować żadnego zamówienia`, {
          duration: 4000,
        });
      } else {
        CustomToast(
          "info",
          `Anulowano ${successful} zamówień, ${failed} nie udało się anulować`,
          {
            duration: 4000,
          }
        );
      }
    } catch (error) {
      console.error("Error canceling orders:", error);
      CustomToast("error", "Nie udało się anulować zamówień", {
        duration: 3000,
      });
    } finally {
      setIsCanceling(false);
      setShowCancelModal(false);
    }
  }

  async function handleDeleteOrders() {
    if (exportOrders.length === 0) {
      CustomToast("error", "Nie zaznaczono żadnych zamówień", {
        duration: 3000,
      });
      return;
    }

    // TODO: Zaimplementować endpoint do usuwania zamówień
    CustomToast("info", "Funkcja usuwania zamówień nie jest jeszcze dostępna", {
      duration: 3000,
    });
  }

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

        <div className="w-full px-2 md:px-4">
          <ControlHeader
            orders={stats.allOrders}
            currentOrders={stats.currentOrders}
            completedOrders={stats.realizedOrders}
            newOrders={stats.newOrders}
            inWarehouse={stats.warehouseOrders}
            exportOrdersData={exportOrdersData}
          />
          <main className="w-full">
            <ScrollArea
              className="h-[calc(100vh-80px)] rounded-md border"
              ref={scrollRef}
            >
              <Table className="table-auto">
                <TableHeader stickyHeader={true}>
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
                    <TableHead className="w-24 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <div className="px-2 py-2">
                            <p className="text-xs text-muted-foreground">
                              Zaznaczone zamówienia: {exportOrders.length}
                            </p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={exportOrdersData}
                            className="cursor-pointer"
                          >
                            <FileDownIcon /> Export CSV
                          </DropdownMenuItem>
                          {session?.user?.role === Role.ADMIN && (
                            <DropdownMenuItem
                              onClick={handleDeleteOrders}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2Icon className="text-destructive" /> Usuń
                              zaznaczone
                            </DropdownMenuItem>
                          )}
                          {session?.user?.role === Role.USER ||
                            (session?.user?.role === Role.ADMIN && (
                              <DropdownMenuItem
                                onClick={handleCancelOrdersClick}
                                className="text-destructive cursor-pointer"
                              >
                                <BanIcon className="text-destructive" /> Anuluj
                                zaznaczone
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableDataRow
                      key={order.orderId}
                      order={order}
                      setExportOrders={setExportOrders}
                      shouldAddBackground={index % 2 !== 0}
                    />
                  ))}
                </TableBody>
              </Table>
              {isFetchingNextPage && (
                <div className="sticky bottom-0 z-10 flex h-8 items-center justify-center bg-background/80 text-sm text-muted-foreground">
                  <>
                    <Loader2Icon className="mr-2 inline size-4 animate-spin" />
                    Ładowanie...
                  </>
                </div>
              )}
              <div ref={sentinelRef} className="h-6 w-full" />
            </ScrollArea>
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

      {/* Modal potwierdzenia anulowania zamówień */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź anulowanie zamówień</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz anulować {exportOrders.length} zaznaczonych
              zamówień? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={isCanceling}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrdersConfirm}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Anulowanie...
                </>
              ) : (
                "Tak, anuluj zamówienia"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardSidebarProvider>
  );
}
