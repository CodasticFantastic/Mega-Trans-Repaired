"use client";

import { useEffect, useMemo, useState } from "react";
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

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

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
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
  const [selectedOrders, setSelectedOrders] = useState<
    OrderWithUserAndPackages[]
  >([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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
    sortByDate: "updatedAt",
    status: "Wszystkie",
    dateFrom: "",
    dateTo: "",
    postalCode: "all",
  });

  // Przeniesienie logiki zapytania poza funkcję getOrders
  const getOrders = async ({
    page,
    filters,
  }: {
    page: number;
    filters: DashboardSidebarFilters;
  }): Promise<ApiResponse> => {
    let request: Response;

    if (session?.user?.role === "USER") {
      request = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/showAllOrders?page=${page}&limit=${pageSize}&orderBy=${filters.orderBy}&sortByDate=${filters.sortByDate}&status=${filters.status}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}&postalCode=${filters.postalCode}&searchId=${filters.searchId}`,
        {
          headers: { Authorization: session?.accessToken ?? "" },
        }
      );
    } else if (session?.user?.role === "ADMIN") {
      request = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/showAllOrdersAdmin?page=${page}&limit=${pageSize}&orderBy=${filters.orderBy}&sortByDate=${filters.sortByDate}&status=${filters.status}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}&postalCode=${filters.postalCode}&searchId=${filters.searchId}`,
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
    data: ordersData,
    isLoading,
    isFetching,
  } = useQuery<ApiResponse>({
    queryKey: ["allUserOrder", session, filters, currentPage, pageSize],
    queryFn: () => getOrders({ page: currentPage, filters }),
    enabled: !!session,
  });

  // Reset page when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  ///////////////// Operations on selected orders
  function handleCancelOrdersClick() {
    if (selectedOrders.length === 0) {
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
      CustomToast("info", `Anulowanie ${selectedOrders.length} zamówień...`, {
        duration: 2000,
      });

      // Wykonaj wszystkie anulowania równolegle
      const cancelPromises = selectedOrders.map(async (order) => {
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
      setSelectedOrders([]);

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
    if (selectedOrders.length === 0) {
      CustomToast("error", "Nie zaznaczono żadnych zamówień", {
        duration: 3000,
      });
      return;
    }

    console.log(selectedOrders);

    // TODO: Zaimplementować endpoint do usuwania zamówień
    CustomToast("info", "Funkcja usuwania zamówień nie jest jeszcze dostępna", {
      duration: 3000,
    });
  }

  ///////////////// Export Data To Excel
  async function exportOrdersData() {
    const ordersToExport = selectedOrders.map((order) => {
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

  const orders = useMemo(() => ordersData?.allUserOrder ?? [], [ordersData]);

  // [DashboardSidebarProvider] Handle Filters Change
  const handleFiltersChange = (newFilters: DashboardSidebarFilters) => {
    setSelectedOrders([]);
    setFilters(newFilters);
  };

  // [DashboardSidebarProvider] Handle Clear Filters
  const handleClearFilters = () => {
    setSelectedOrders([]);
    setFilters({
      searchId: "",
      orderBy: "desc",
      sortByDate: "updatedAt",
      status: "Wszystkie",
      dateFrom: "",
      dateTo: "",
      postalCode: "all",
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedOrders([]);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setSelectedOrders([]);
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!ordersData) return [];

    const items = [];
    const totalPages = ordersData.totalPages;
    const currentPage = ordersData.currentPage;

    // Always show first page
    items.push(1);

    // Show ellipsis if there's a gap
    if (currentPage > 4) {
      items.push("ellipsis-start");
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        items.push(i);
      }
    }

    // Show ellipsis if there's a gap
    if (currentPage < totalPages - 3) {
      items.push("ellipsis-end");
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
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
            <ScrollArea className="h-[calc(100vh-134px)] rounded-md border">
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
                              Zaznaczone zamówienia: {selectedOrders.length}
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
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Ładowanie...
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading && orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Brak zamówień do wyświetlenia
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading &&
                    orders.length > 0 &&
                    orders.map((order, index) => (
                      <TableDataRow
                        key={order.orderId}
                        order={order}
                        setExportOrders={setSelectedOrders}
                        shouldAddBackground={index % 2 !== 0}
                      />
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Zamówienia na stronę:
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="150">150</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pagination */}
              {ordersData && ordersData.totalPages > 1 && (
                <div className="flex justify-center sm:justify-end">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (ordersData.hasPreviousPage) {
                              handlePageChange(ordersData.currentPage - 1);
                            }
                          }}
                          className={
                            !ordersData.hasPreviousPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {generatePaginationItems().map((item, index) => (
                        <PaginationItem key={index}>
                          {item === "ellipsis-start" ||
                          item === "ellipsis-end" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(item as number);
                              }}
                              isActive={item === ordersData.currentPage}
                              className="cursor-pointer"
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (ordersData.hasNextPage) {
                              handlePageChange(ordersData.currentPage + 1);
                            }
                          }}
                          className={
                            !ordersData.hasNextPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </main>
          {session && session.user.role === "USER" && (
            <footer className="mt-0 flex flex-col items-end justify-center">
              <p className="text-xs text-muted-foreground">
                Developed by:{" "}
                <Link
                  href="https://jakubwojtysiak.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
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
              Czy na pewno chcesz anulować {selectedOrders.length} zaznaczonych
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
