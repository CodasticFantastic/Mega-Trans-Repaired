import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AtSignIcon,
  BanknoteIcon,
  Building2Icon,
  CalendarPlusIcon,
  CircleChevronDownIcon,
  EditIcon,
  MoreHorizontalIcon,
  PhoneIcon,
  ShoppingBagIcon,
  Trash2Icon,
  BanIcon,
  TriangleAlertIcon,
  NewspaperIcon,
  TagsIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { TableRow, TableCell } from "@/components/shadcn/ui/table";
import { Role, Status } from "@prisma/client";
import { OrderWithUserAndPackages } from "types/order.types";
import { Parser } from "html-to-react";
import dayjs from "dayjs";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/shadcn/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import UpdateOrderModal from "./UpdateOrder.modal";
import { Separator } from "@/components/shadcn/ui/separator";

interface TableDataRowProps {
  order: OrderWithUserAndPackages;
  shouldAddBackground: boolean;
  isDataCellChecked: boolean;
  onDataCellCheck: (checked: boolean) => void;
  onOrderDeleted?: (orderId: string) => void;
  queryKey?: any[];
}

export default function TableDataRow({
  order,
  shouldAddBackground,
  isDataCellChecked,
  onDataCellCheck,
  onOrderDeleted,
  queryKey,
}: TableDataRowProps) {
  const [status, setStatus] = useState<Status>(order.status);
  const [expanded, setExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmAddressDialog, setShowConfirmAddressDialog] = useState(false);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const formattedDate = useMemo(() => {
    const d = new Date(order.updatedAt);
    const day = d.getDate();
    const month = d.toLocaleDateString("pl-PL", { month: "long" });
    const year = d.getFullYear();
    const hour = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return (
      <span className="text-sm">
        {day} {month} {year} <br /> {hour}:{minutes}
      </span>
    );
  }, [order.updatedAt]);

  async function changeStatus(e: string, id: string) {
    const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/updateOrderStatus`, {
      method: "POST",
      headers: {
        Authorization: session?.accessToken || "",
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
      setStatus(e as Status);
    }
  }

  function handleDataCellCheck(checked: boolean) {
    onDataCellCheck(checked);
  }

  const deleteOrderMutation = useMutation({
    mutationFn: async () => {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/deleteOrder?id=${order.orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: session?.accessToken || "",
          "Content-Type": "application/json",
        },
      });

      const response = await request.json();

      if (response.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: () => {
      // Optymistyczna aktualizacja - usuń zamówienie z cache
      if (queryKey) {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            allUserOrder: oldData.allUserOrder.filter((o: OrderWithUserAndPackages) => o.orderId !== order.orderId),
          };
        });
      }

      // Wywołaj callback jeśli jest przekazany
      if (onOrderDeleted) {
        onOrderDeleted(order.orderId);
      }

      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error("Delete order error:", error);
      if (error.message === "Unauthorized") {
        signOut();
      }
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/cancelOrder?id=${order.orderId}`, {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
        },
      });

      const response = await request.json();

      if (response.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: () => {
      // Optymistyczna aktualizacja - zmień status na "Anulowane"
      if (queryKey) {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            allUserOrder: oldData.allUserOrder.map((o: OrderWithUserAndPackages) =>
              o.orderId === order.orderId ? { ...o, status: "Anulowane" as Status } : o
            ),
          };
        });
      }

      // Aktualizuj lokalny stan
      setStatus("Anulowane");
      setShowCancelDialog(false);
    },
    onError: (error) => {
      console.error("Cancel order error:", error);
      if (error.message === "Unauthorized") {
        signOut();
      }
    },
  });

  const confirmAddressMutation = useMutation({
    mutationFn: async () => {
      const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/confirmAddress?orderId=${order.orderId}`, {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
        },
      });

      const response = await request.json();

      if (response.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: () => {
      // Optymistyczna aktualizacja - ustaw orderAddressConfidence na 1
      if (queryKey) {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            allUserOrder: oldData.allUserOrder.map((o: OrderWithUserAndPackages) =>
              o.orderId === order.orderId ? { ...o, orderAddressConfidence: 1 } : o
            ),
          };
        });
      }

      setShowConfirmAddressDialog(false);
    },
    onError: (error) => {
      console.error("Confirm address error:", error);
      if (error.message === "Unauthorized") {
        signOut();
      }
    },
  });

  useEffect(() => {
    setStatus(order.status);
  }, [order.status]);

  const statusColor =
    {
      Producent: "text-orange border-orange",
      Magazyn: "text-yellow border-yellow",
      Dostawa: "text-purple border-purple",
      Zrealizowane: "text-green border-green",
      Anulowane: "text-destructive border-destructive",
      Pobranie: "text-primary border-primary",
    }[status] || "";

  return (
    <>
      <TableRow
        className={`hover:bg-transparent [&_td]:py-3 ${shouldAddBackground ? "bg-muted" : ""} ${
          order.orderAddressConfidence !== null && order.orderAddressConfidence <= 0.9 ? "bg-destructive/10 hover:bg-destructive/20" : ""
        }`}
      >
        <TableCell className="text-center">
          <Checkbox checked={isDataCellChecked} onCheckedChange={handleDataCellCheck} className="mx-auto cursor-pointer" />
        </TableCell>
        <TableCell className="font-medium text-center">{order.orderType}</TableCell>
        <TableCell className="font-mono text-center px-2">{order.orderId}</TableCell>
        <TableCell className="text-center">
          {session?.user.role === "ADMIN" ? (
            <select
              className={`bg-background ${statusColor} rounded border !px-1 !py-0 outline-none text-sm`}
              value={status}
              onChange={(e) => changeStatus(e.target.value, order.orderId)}
            >
              <option value="Producent">Producent</option>
              <option value="Magazyn">Magazyn</option>
              <option value="Dostawa">Dostawa</option>
              <option value="Zrealizowane">Zrealizowane</option>
              <option value="Anulowane">Anulowane</option>
            </select>
          ) : (
            <span className={`rounded border px-1 py-0 ${statusColor}`}>{status}</span>
          )}
        </TableCell>
        <TableCell className="hidden lg:table-cell text-center">{formattedDate}</TableCell>
        <TableCell className="hidden md:table-cell text-center max-w-64 whitespace-normal break-words">
          {Parser().parse(order.recipientName)}
        </TableCell>
        <TableCell className="hidden md:table-cell text-center">
          {order.orderPostCode} {order.orderCity}
          <br />
          {Parser().parse(order.orderStreet)} {Parser().parse(order.orderStreetNumber)}{" "}
          {order.orderFlatNumber && `/ ${Parser().parse(order.orderFlatNumber)}`}
        </TableCell>
        <TableCell className="text-right">
          {order.orderAddressConfidence !== null && order.orderAddressConfidence <= 0.9 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => session?.user.role === Role.ADMIN && setShowConfirmAddressDialog(true)}
                  >
                    <TriangleAlertIcon className="text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Niskie prawdopodobieństwo poprawności adresu {session?.user.role === Role.ADMIN && "- kliknij aby potwierdzić"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="inline-flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <MoreHorizontalIcon className="text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/updateOrder/${order.orderId}`} className="flex items-center gap-2 cursor-pointer">
                    <EditIcon className="h-4 w-4" />
                    Pokaż stronę edycji
                  </Link>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem asChild>
                  <Link href={`/updateOrder/${order.orderId}/waybill`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                    <NewspaperIcon className="h-4 w-4" />
                    List przewozowy
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/updateOrder/${order.orderId}/label`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                    <TagsIcon className="h-4 w-4" />
                    Etykiety 10x15
                  </Link>
                </DropdownMenuItem>
                <Separator />
                {status !== "Anulowane" && status !== "Zrealizowane" && (
                  <DropdownMenuItem
                    onClick={() => setShowCancelDialog(true)}
                    className="flex items-center gap-2 cursor-pointer"
                    variant="destructive"
                  >
                    <BanIcon className="h-4 w-4" />
                    Anuluj zamówienie
                  </DropdownMenuItem>
                )}
                {session?.user.role === "ADMIN" && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2Icon className="h-4 w-4" />
                    Usuń zamówienie
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <UpdateOrderModal
              order={order}
              trigger={
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <EditIcon className="text-foreground" />
                </Button>
              }
            />
            <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => setExpanded((v) => !v)}>
              <CircleChevronDownIcon className={`text-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className={`${shouldAddBackground ? "bg-muted" : ""}`}>
          <TableCell colSpan={8} className="p-0">
            <div className="border-t">
              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-medium">Dodatkowe Informacje</p>
                  <div className="flex flex-wrap items-center gap-6">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="icon-text">
                            <CalendarPlusIcon size={16} />
                            <p className="text-sm">{dayjs(order.createdAt).format("DD.MM.YYYY HH:mm")}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Data utworzenia zamówienia</p>
                        </TooltipContent>
                      </Tooltip>
                      {order.orderPaymentType === "Pobranie" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="icon-text">
                              <BanknoteIcon size={16} />
                              <p className="text-sm">
                                {order.orderPrice} {order.currency}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Kwota pobrania</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {order.orderSupplierId && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="icon-text">
                              <ShoppingBagIcon size={16} />
                              <p className="text-sm">{Parser().parse(order.orderSupplierId)}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Identyfikator Zlecenia Dostawcy</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="icon-text">
                            <PhoneIcon size={16} />
                            <p className="text-sm">{order.recipientPhone}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Telefon do odbiorcy</p>
                        </TooltipContent>
                      </Tooltip>
                      {order.recipientEmail && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="icon-text">
                              <AtSignIcon size={16} />
                              <p className="text-sm">{order.recipientEmail}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Email do odbiorcy</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="icon-text">
                            <Building2Icon size={16} />
                            <p className="text-sm">{Parser().parse(order.user.company || "")}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Zleceniodawca</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t pt-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col gap-1 items-center">
                      <p className="text-xs">Ilość Paczek</p>
                      <p className="text-base text-blue-400">{order.packageManualCount || order.packages.length}</p>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="divide-y">
                      {order.packages.map((packageItem) => (
                        <div key={packageItem.packageId} className="flex flex-col gap-1 py-2 md:flex-row md:items-center md:gap-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="min-w-64 font-mono text-sm">{packageItem.packageId}</p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>ID paczki</p>
                              </TooltipContent>
                            </Tooltip>
                            <div className="flex-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm text-wrap">{Parser().parse(packageItem.commodityName)}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Nazwa towaru</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex-1 text-sm text-wrap">{Parser().parse(packageItem.commodityNote || "")}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Notatka</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {order.orderNote && (
                  <div className="border-t pt-4">
                    <p className="mb-2 text-sm font-medium">Notatka</p>
                    <p className="text-sm whitespace-normal break-words">{Parser().parse(order.orderNote)}</p>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć zamówienie ? <br /> Ta operacja jest nieodwracalna i usunie również wszystkie powiązane paczki.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={() => deleteOrderMutation.mutate()} disabled={deleteOrderMutation.isPending}>
              {deleteOrderMutation.isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź anulowanie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz anulować zamówienie <strong>{order.orderId}</strong>? <br />
              Po anulowaniu zamówienie nie będzie mogło być dalej przetwarzane.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={() => cancelOrderMutation.mutate()} disabled={cancelOrderMutation.isPending}>
              {cancelOrderMutation.isPending ? "Anulowanie..." : "Anuluj zamówienie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Address Dialog */}
      <Dialog open={showConfirmAddressDialog} onOpenChange={setShowConfirmAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź adres wysyłki</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz potwierdzić, że adres wysyłki dla zamówienia <strong>{order.recipientName}</strong> jest poprawny? <br />
              <br />
              <strong>Surowe dane z API:</strong> {order.orderAddressRawData}
            </DialogDescription>
            <Separator className="my-2" />
            <DialogDescription>
              <strong>Adres docelowy:</strong> {Parser().parse(order.orderStreet)} {Parser().parse(order.orderStreetNumber)}
              {order.orderFlatNumber && ` / ${Parser().parse(order.orderFlatNumber)}`}
              <br />
              <strong>Docelowe Miasto:</strong> {Parser().parse(order.orderCity)}
              <br />
              <strong>Docelowy Kod Pocztowy :</strong> {order.orderPostCode}
              <br />
              <strong>Docelowe Województwo:</strong> {order.orderState}
              <br />
              <strong>Odbiorca:</strong> {order.recipientName}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmAddressDialog(false)}>
              Anuluj
            </Button>
            <Button
              onClick={() => confirmAddressMutation.mutate()}
              disabled={confirmAddressMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {confirmAddressMutation.isPending ? "Potwierdzanie..." : "Potwierdź adres"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
