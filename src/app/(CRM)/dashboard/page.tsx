"use client";

import { useEffect, useMemo, useState } from "react";
import ControlHeader from "../components/ControlHeader";
import DashboardSidebar from "../components/sidebars/DashboardSidebar/DashboardSidebar";
import { DashboardSidebarFilters, DashboardSidebarProvider } from "../components/sidebars/DashboardSidebar/DashboardSidebar.context";
import TableDataRow from "../components/TableDataRow";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signOut } from "next-auth/react";

import FileSaver from "file-saver";
import XLSX from "sheetjs-style";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/shadcn/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { OrderWithUserAndPackages } from "types/order.types";
import { BanIcon, FileDownIcon, Loader2Icon, MoreHorizontalIcon, Trash2Icon, RefreshCcwIcon } from "lucide-react";
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

// Typy dla zapisanych ustawień
interface SavedSettings {
  filters: DashboardSidebarFilters;
  currentPage: number;
  pageSize: number;
  timestamp: number;
}

// Klucze dla localStorage
const STORAGE_KEYS = {
  DASHBOARD_SETTINGS: "dashboard_settings",
} as const;

export default function Dashboard() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedOrders, setSelectedOrders] = useState<OrderWithUserAndPackages[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [stats, setStats] = useState<Stats>({
    allOrders: 0,
    newOrders: 0,
    currentOrders: 0,
    warehouseOrders: 0,
    realizedOrders: 0,
  });

  // Domyślne filtry
  const defaultFilters: DashboardSidebarFilters = {
    searchId: "",
    orderBy: "desc",
    sortByDate: "updatedAt",
    status: "Wszystkie",
    dateFrom: "",
    dateTo: "",
    postalCode: "all",
  };

  // [DashboardSidebarProvider] Filters
  const [filters, setFilters] = useState<DashboardSidebarFilters>(defaultFilters);

  // Funkcje do obsługi URL
  const updateURL = (newFilters: DashboardSidebarFilters, newPage: number, newPageSize: number) => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();

    // Dodaj tylko niepuste wartości do URL
    if (newFilters.searchId) params.set("searchId", newFilters.searchId);
    if (newFilters.orderBy !== "desc") params.set("orderBy", newFilters.orderBy);
    if (newFilters.sortByDate !== "updatedAt") params.set("sortByDate", newFilters.sortByDate);
    if (newFilters.status !== "Wszystkie") params.set("status", newFilters.status);
    if (newFilters.dateFrom) params.set("dateFrom", newFilters.dateFrom);
    if (newFilters.dateTo) params.set("dateTo", newFilters.dateTo);
    if (newFilters.postalCode !== "all") params.set("postalCode", newFilters.postalCode);
    if (newPage > 1) params.set("page", newPage.toString());
    if (newPageSize !== 25) params.set("pageSize", newPageSize.toString());

    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newURL, { scroll: false });
  };

  const loadFromURL = () => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const newFilters = { ...defaultFilters };
    let newPage = 1;
    let newPageSize = 25;

    // Wczytaj filtry z URL
    if (urlParams.has("searchId")) newFilters.searchId = urlParams.get("searchId")!;
    if (urlParams.has("orderBy")) newFilters.orderBy = urlParams.get("orderBy") as "asc" | "desc";
    if (urlParams.has("sortByDate")) newFilters.sortByDate = urlParams.get("sortByDate") as "updatedAt" | "createdAt";
    if (urlParams.has("status")) newFilters.status = urlParams.get("status")!;
    if (urlParams.has("dateFrom")) newFilters.dateFrom = urlParams.get("dateFrom")!;
    if (urlParams.has("dateTo")) newFilters.dateTo = urlParams.get("dateTo")!;
    if (urlParams.has("postalCode")) newFilters.postalCode = urlParams.get("postalCode")!;
    if (urlParams.has("page")) newPage = parseInt(urlParams.get("page")!);
    if (urlParams.has("pageSize")) newPageSize = parseInt(urlParams.get("pageSize")!);

    updateFiltersFromStorage(newFilters);
    setCurrentPage(newPage);
    setPageSize(newPageSize);
  };

  // Funkcje do obsługi localStorage
  const saveSettings = () => {
    if (typeof window === "undefined") return;

    const settings: SavedSettings = {
      filters,
      currentPage,
      pageSize,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, JSON.stringify(settings));
  };

  const loadSettings = () => {
    if (typeof window === "undefined") return;

    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);

      if (savedSettings) {
        const settings: SavedSettings = JSON.parse(savedSettings);

        // Sprawdź czy ustawienia nie są starsze niż 24 godziny
        const isExpired = Date.now() - settings.timestamp > 24 * 60 * 60 * 1000;

        if (!isExpired) {
          updateFiltersFromStorage(settings.filters);
          setCurrentPage(settings.currentPage);
          setPageSize(settings.pageSize);

          // Zaktualizuj URL na podstawie zapisanych ustawień
          updateURL(settings.filters, settings.currentPage, settings.pageSize);
          return;
        }
      }
    } catch (error) {
      console.error("Błąd podczas ładowania ustawień:", error);
    }

    // Jeśli nie ma zapisanych ustawień lub są przestarzałe, sprawdź URL
    loadFromURL();
  };

  // Załaduj ustawienia przy pierwszym renderowaniu
  useEffect(() => {
    loadSettings();
  }, []);

  // Zapisz ustawienia automatycznie przy każdej zmianie
  useEffect(() => {
    if (typeof window !== "undefined") {
      saveSettings();
      updateURL(filters, currentPage, pageSize);
    }
  }, [filters, currentPage, pageSize]);

  // Przeniesienie logiki zapytania poza funkcję getOrders
  const getOrders = async ({ page, filters }: { page: number; filters: DashboardSidebarFilters }): Promise<ApiResponse> => {
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
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["allUserOrder", session, filters, currentPage, pageSize],
    queryFn: () => getOrders({ page: currentPage, filters }),
    enabled: !!session,
  });

  ///////////////// Operations on selected orders
  function handleOrderCheck(order: OrderWithUserAndPackages, checked: boolean) {
    if (checked) {
      setSelectedOrders((prev) => [...prev, order]);
    } else {
      setSelectedOrders((prev) => prev.filter((item) => item.orderId !== order.orderId));
    }
  }

  function handleOrderDeleted(orderId: string) {
    // Usuń zamówienie z listy zaznaczonych jeśli było zaznaczone
    setSelectedOrders((prev) => prev.filter((order) => order.orderId !== orderId));
  }

  function handleSelectAllOnPage(checked: boolean) {
    if (checked) {
      // Dodaj wszystkie zamówienia z aktualnej strony, które nie są jeszcze zaznaczone
      const currentPageOrders = ordersData?.allUserOrder || [];
      const newOrders = currentPageOrders.filter((order) => !selectedOrders.some((selectedOrder) => selectedOrder.orderId === order.orderId));
      setSelectedOrders((prev) => [...prev, ...newOrders]);
    } else {
      // Usuń wszystkie zamówienia z aktualnej strony
      const currentPageOrderIds = (ordersData?.allUserOrder || []).map((order) => order.orderId);
      setSelectedOrders((prev) => prev.filter((order) => !currentPageOrderIds.includes(order.orderId)));
    }
  }

  // Sprawdź czy wszystkie zamówienia na aktualnej stronie są zaznaczone
  const areAllOrdersOnPageSelected = useMemo(() => {
    const currentPageOrders = ordersData?.allUserOrder || [];
    return (
      currentPageOrders.length > 0 &&
      currentPageOrders.every((order) => selectedOrders.some((selectedOrder) => selectedOrder.orderId === order.orderId))
    );
  }, [ordersData?.allUserOrder, selectedOrders]);

  // Sprawdź czy część zamówień na aktualnej stronie jest zaznaczona
  const areSomeOrdersOnPageSelected = useMemo(() => {
    const currentPageOrders = ordersData?.allUserOrder || [];
    return currentPageOrders.some((order) => selectedOrders.some((selectedOrder) => selectedOrder.orderId === order.orderId));
  }, [ordersData?.allUserOrder, selectedOrders]);

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
      CustomToast("info", `Anulowanie ${selectedOrders.length} zamówień...`, {
        duration: 2000,
      });

      const cancelPromises = selectedOrders.map(async (order) => {
        const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/cancelOrder?id=${order.orderId}`, {
          method: "GET",
          headers: {
            Authorization: session?.accessToken || "",
          },
        });

        const response = await request.json();

        if (response.error) {
          throw new Error(`Błąd anulowania zamówienia ${order.orderId}: ${response.error}`);
        }

        // Optymistyczna aktualizacja dla konkretnego zamówienia po udanym zapytaniu
        queryClient.setQueryData(["allUserOrder", session, filters, currentPage, pageSize], (oldData: ApiResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            allUserOrder: oldData.allUserOrder.map((o) => (o.orderId === order.orderId ? { ...o, status: "Anulowane" as const } : o)),
          };
        });

        return { orderId: order.orderId, success: true };
      });

      await Promise.all(cancelPromises);

      CustomToast("success", `Pomyślnie anulowano ${selectedOrders.length} zamówień`, {
        duration: 4000,
      });

      setSelectedOrders([]);
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

    setShowDeleteModal(true);
  }

  async function handleDeleteOrdersConfirm() {
    setIsDeleting(true);

    try {
      const deletePromises = selectedOrders.map(async (order) => {
        const response = await fetch(`/api/order/deleteOrder?id=${order.orderId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: session?.accessToken || "",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Błąd podczas usuwania zamówienia");
        }

        // Optymistyczna aktualizacja dla konkretnego zamówienia po udanym zapytaniu
        queryClient.setQueryData(["allUserOrder", session, filters, currentPage, pageSize], (oldData: ApiResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            allUserOrder: oldData.allUserOrder.filter((o) => o.orderId !== order.orderId),
          };
        });

        return response.json();
      });

      await Promise.all(deletePromises);

      CustomToast("success", `Pomyślnie usunięto ${selectedOrders.length} zamówień`, {
        duration: 3000,
      });

      setSelectedOrders([]);
    } catch (error) {
      console.error("Error deleting orders:", error);
      CustomToast("error", "Wystąpił błąd podczas usuwania zamówień", {
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
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

    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(ordersToExport);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "Zamówienia" + fileExtension);
  }

  const orders = useMemo(() => ordersData?.allUserOrder ?? [], [ordersData]);

  // Odświeżenie listy zamówień
  const handleRefresh = () => {
    refetch();
  };

  // [DashboardSidebarProvider] Handle Filters Change
  const handleFiltersChange = (newFilters: DashboardSidebarFilters) => {
    setSelectedOrders([]);
    setFilters(newFilters);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // [DashboardSidebarProvider] Handle Clear Filters
  const handleClearFilters = () => {
    setSelectedOrders([]);
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  // Funkcja do aktualizacji filtrów z zewnątrz (np. z localStorage)
  const updateFiltersFromStorage = (newFilters: DashboardSidebarFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedOrders([]);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setSelectedOrders([]);
    // Reset to first page when page size changes
    setCurrentPage(1);
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
    <DashboardSidebarProvider onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} initialFilters={filters}>
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
                    <TableHead className="min-w-10 text-center">
                      <Checkbox
                        checked={areAllOrdersOnPageSelected}
                        onCheckedChange={handleSelectAllOnPage}
                        aria-label="Zaznacz wszystkie zamówienia na stronie"
                        data-state={
                          areSomeOrdersOnPageSelected && !areAllOrdersOnPageSelected
                            ? "indeterminate"
                            : areAllOrdersOnPageSelected
                            ? "checked"
                            : "unchecked"
                        }
                      />
                    </TableHead>
                    <TableHead className="min-w-22 text-center">Rodzaj</TableHead>
                    <TableHead className="min-w-64 text-center">ID Paczki</TableHead>
                    <TableHead className="min-w-36 text-center">Status</TableHead>
                    <TableHead className="min-w-38 hidden lg:table-cell text-center">Aktualizacja</TableHead>
                    <TableHead className="min-w-48 hidden md:table-cell text-center">Nazwa Klienta</TableHead>
                    <TableHead className="min-w-48 hidden md:table-cell text-center">Adres</TableHead>
                    <TableHead className="w-24 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <div className="px-2 py-2">
                            <p className="text-xs text-muted-foreground">Zaznaczone zamówienia: {selectedOrders.length}</p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleRefresh} disabled={isFetching} className="cursor-pointer">
                            {isFetching ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcwIcon />} Odśwież listę
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportOrdersData} className="cursor-pointer">
                            <FileDownIcon /> Export CSV
                          </DropdownMenuItem>
                          {(session?.user?.role === Role.USER || session?.user?.role === Role.ADMIN) && (
                            <DropdownMenuItem onClick={handleCancelOrdersClick} className="text-destructive cursor-pointer">
                              <BanIcon className="text-destructive" /> Anuluj zaznaczone
                            </DropdownMenuItem>
                          )}
                          {session?.user?.role === Role.ADMIN && (
                            <DropdownMenuItem onClick={handleDeleteOrders} className="text-destructive cursor-pointer">
                              <Trash2Icon className="text-destructive" /> Usuń zaznaczone
                            </DropdownMenuItem>
                          )}
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
                        shouldAddBackground={index % 2 !== 0}
                        isDataCellChecked={selectedOrders.some((selectedOrder) => selectedOrder.orderId === order.orderId)}
                        onDataCellCheck={(checked) => handleOrderCheck(order, checked)}
                        queryKey={["allUserOrder", session, filters, currentPage, pageSize]}
                        onOrderDeleted={handleOrderDeleted}
                      />
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Zamówienia na stronę:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="150">150</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="300">300</SelectItem>
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
                          className={!ordersData.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {generatePaginationItems().map((item, index) => (
                        <PaginationItem key={index}>
                          {item === "ellipsis-start" || item === "ellipsis-end" ? (
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
                          className={!ordersData.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                <Link href="https://jakubwojtysiak.online" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
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
              Czy na pewno chcesz anulować {selectedOrders.length} zaznaczonych zamówień? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)} disabled={isCanceling}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleCancelOrdersConfirm} disabled={isCanceling}>
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

      {/* Modal potwierdzenia usuwania zamówień */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie zamówień</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć {selectedOrders.length} zaznaczonych zamówień? Tej operacji nie można cofnąć - zamówienia zostaną
              usunięte na zawsze.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrdersConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Usuwanie...
                </>
              ) : (
                "Tak, usuń zamówienia"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardSidebarProvider>
  );
}
