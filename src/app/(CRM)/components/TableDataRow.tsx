import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  AtSignIcon,
  Building2Icon,
  CalendarPlusIcon,
  CircleChevronDownIcon,
  EditIcon,
  PhoneIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { TableRow, TableCell } from "@/components/shadcn/ui/table";
import { Status } from "@prisma/client";
import { OrderWithUserAndPackages } from "types/order.types";
import { Parser } from "html-to-react";
import dayjs from "dayjs";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/shadcn/ui/tooltip";

interface TableDataRowProps {
  order: OrderWithUserAndPackages;
  shouldAddBackground: boolean;
  setExportOrders: React.Dispatch<
    React.SetStateAction<OrderWithUserAndPackages[]>
  >;
}

export default function TableDataRow({
  order,
  setExportOrders,
  shouldAddBackground,
}: TableDataRowProps) {
  const [status, setStatus] = useState<Status>(order.status);
  const [ifExported, setIfExported] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { data: session } = useSession();

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
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/order/updateOrderStatus`,
      {
        method: "POST",
        headers: {
          Authorization: session?.accessToken || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: id,
          status: e,
        }),
      }
    );

    const response = await request.json();

    if (response.error) {
      signOut();
    } else if (response.success) {
      setStatus(e as Status);
    }
  }

  function exportOrder(e: React.ChangeEvent<HTMLInputElement>) {
    setIfExported(e.target.checked);

    if (e.target.checked) {
      setExportOrders((prev) => [...prev, order]);
    } else {
      setExportOrders((prev) =>
        prev.filter((item) => item.orderId !== order.orderId)
      );
    }
  }

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
        className={`!hover:bg-transparent [&_td]:!py-3 ${
          shouldAddBackground ? "bg-muted" : ""
        }`}
      >
        <TableCell className="text-center">
          <input type="checkbox" checked={ifExported} onChange={exportOrder} />
        </TableCell>
        <TableCell className="font-medium text-center">
          {order.orderType}
        </TableCell>
        <TableCell className="font-mono text-center px-2">
          {order.orderId}
        </TableCell>
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
            <span className={`rounded border px-1 py-0 ${statusColor}`}>
              {status}
            </span>
          )}
        </TableCell>
        <TableCell className="hidden lg:table-cell text-center">
          {formattedDate}
        </TableCell>
        <TableCell className="hidden md:table-cell text-center max-w-64 whitespace-normal break-words">
          {Parser().parse(order.recipientName)}
        </TableCell>
        <TableCell className="hidden md:table-cell text-center">
          {order.orderPostCode} {order.orderCity}
          <br />
          {order.orderStreet} {order.orderStreetNumber}{" "}
          {order.orderFlatNumber && `/ ${order.orderFlatNumber}`}
        </TableCell>
        <TableCell className="text-right">
          <div className="inline-flex items-center gap-1">
            <Link href={`/updateOrder/${order.orderId}`}>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <EditIcon className="text-foreground" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => setExpanded((v) => !v)}
            >
              <CircleChevronDownIcon
                className={`text-foreground transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
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
                            <p className="text-sm">
                              {dayjs(order.createdAt).format(
                                "DD.MM.YYYY HH:mm"
                              )}
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Data utworzenia zamówienia</p>
                        </TooltipContent>
                      </Tooltip>
                      {order.orderSupplierId && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="icon-text">
                              <ShoppingBagIcon size={16} />
                              <p className="text-sm">
                                {Parser().parse(order.orderSupplierId)}
                              </p>
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="icon-text">
                            <Building2Icon size={16} />
                            <p className="text-sm">
                              {Parser().parse(order.user.company || "")}
                            </p>
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
                    {order.orderPaymentType === "Pobranie" && (
                      <div>
                        <p className="text-xs">Kwota Pobrania</p>
                        <p className="text-base text-blue-400">
                          {`${order.orderPrice} ${order.currency}`}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs">Ilość Paczek</p>
                      <p className="text-base text-blue-400">
                        {order.packages.length}
                      </p>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="divide-y">
                      {order.packages.map((packageItem) => (
                        <div
                          key={packageItem.packageId}
                          className="flex flex-col gap-1 py-2 md:flex-row md:items-center md:gap-4"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="min-w-64 font-mono text-sm">
                                  {packageItem.packageId}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>ID paczki</p>
                              </TooltipContent>
                            </Tooltip>
                            <div className="flex-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm text-wrap">
                                    {Parser().parse(packageItem.commodityName)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Nazwa towaru</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex-1 text-sm text-wrap">
                                    {Parser().parse(
                                      packageItem.commodityNote || ""
                                    )}
                                  </span>
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
                    <p className="text-sm whitespace-normal break-words">
                      {Parser().parse(order.orderNote)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
