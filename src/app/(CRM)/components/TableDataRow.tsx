import Image from "next/image";
import Link from "next/link";
import PhoneIcon from "@/images/icons/phoneIcon.png";
import EmailIcon from "@/images/icons/emailIcon.png";
import CompanyIcon from "@/images/icons/companyIcon.png";

import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { CircleChevronDownIcon, EditIcon } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { TableRow, TableCell } from "@/components/shadcn/ui/table";
import { Prisma, Status } from "@prisma/client";
import { OrderWithUserAndPackages } from "types/order.types";

interface StatusColor {
  [key: string]: string;
}

interface TableDataRowProps {
  order: OrderWithUserAndPackages;
  setExportOrders: React.Dispatch<
    React.SetStateAction<OrderWithUserAndPackages[]>
  >;
}

export default function TableDataRow({
  order,
  setExportOrders,
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
      Producent: "text-orange-400 border-orange-400",
      Magazyn: "text-yellow-400 border-yellow-400",
      Dostawa: "text-violet-400 border-violet-400",
      Zrealizowane: "text-green-500 border-green-500",
      Anulowane: "text-red-500 border-red-500",
      Pobranie: "text-teal-400 border-teal-400",
    }[status] || "";

  return (
    <>
      <TableRow className="!hover:bg-transparent [&_td]:!py-3">
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
            <span className={`rounded border px-2 py-2 ${statusColor}`}>
              {status}
            </span>
          )}
        </TableCell>
        <TableCell className="hidden lg:table-cell text-center">
          {formattedDate}
        </TableCell>
        <TableCell className="hidden md:table-cell text-center">
          {order.recipientName}
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
        <TableRow className="bg-muted/30">
          <TableCell colSpan={8} className="p-0">
            <div className="border-t">
              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-medium">Dodatkowe Informacje</p>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Image
                        src={PhoneIcon}
                        alt={`Numer telefonu`}
                        className="size-5"
                      />
                      <p className="text-sm">{order.recipientPhone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image
                        src={EmailIcon}
                        alt={`Adres Email: `}
                        className="size-5"
                      />
                      <p className="text-sm">{order.recipientEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image
                        src={CompanyIcon}
                        alt={`Dostawa od firmy: `}
                        className="size-5"
                      />
                      <p className="text-sm">{order.user.company}</p>
                    </div>
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
                          <p className="min-w-64 font-mono text-sm">
                            {packageItem.packageId}
                          </p>
                          <p className="w-52 text-sm">
                            {packageItem.commodityName}
                          </p>
                          <p className="flex-1 text-sm">
                            {packageItem.commodityNote}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {order.orderNote && (
                  <div className="border-t pt-4">
                    <p className="mb-2 text-sm font-medium">Notatka</p>
                    <p className="text-sm">{order.orderNote}</p>
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
