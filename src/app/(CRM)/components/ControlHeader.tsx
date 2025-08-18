"use client";
import { PlusCircleIcon, TruckIcon, UserSearchIcon } from "lucide-react";

import Link from "next/link";

import { useSession } from "next-auth/react";
import { IntegrationsModal } from "./IntegrationsModal/IntegrationsModal";
import { ToggleDarkMode } from "./toggleDarkMode";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";

interface ControlHeaderProps {
  orders: number;
  currentOrders: number;
  completedOrders: number;
  newOrders: number;
  inWarehouse: number;
  exportOrdersData: () => void;
}

export default function ControlHeader({
  orders,
  currentOrders,
  completedOrders,
  newOrders,
  inWarehouse,
}: ControlHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="py-3 flex justify-between items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1 flex-wrap">
        <Badge
          variant="outline"
          className="rounded-sm border-primary text-primary"
        >
          {orders} Zleceń
        </Badge>
        <Badge
          variant="outline"
          className="rounded-sm border-orange text-orange"
        >
          {newOrders} Nowych Zleceń
        </Badge>
        <Badge
          variant="outline"
          className="rounded-sm border-purple text-purple"
        >
          {currentOrders} Bieżących Zleceń
        </Badge>
        <Badge
          variant="outline"
          className="rounded-sm border-yellow text-yellow"
        >
          {inWarehouse} Na Magazynie
        </Badge>
        <Badge variant="outline" className="rounded-sm border-green text-green">
          {completedOrders} Zrealizowanych
        </Badge>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {session?.user.role === "ADMIN" && (
          <>
            <Link
              href="/dashboard/delivery"
              className="icon-text text-foreground hover:text-primary"
            >
              <Button variant="link" size="sm" className="!p-0">
                <TruckIcon />
                <p>Dostawa</p>
              </Button>
            </Link>
            <Link
              href="/dashboard/drivers"
              className="icon-text text-foreground"
            >
              <Button variant="link" size="sm" className="!p-0">
                <UserSearchIcon />
                <p>Kierowcy</p>
              </Button>
            </Link>
            <Link
              href="/dashboard/clients"
              className="icon-text text-foreground"
            >
              <Button variant="link" size="sm" className="!p-0">
                <UserSearchIcon />
                <p>Klienci</p>
              </Button>
            </Link>
          </>
        )}

        {session?.user.role === "USER" && (
          <>
            <IntegrationsModal />
          </>
        )}

        <Link
          href="/newOrder"
          className="icon-text text-foreground hover:text-primary"
        >
          <Button variant="outline" size="sm">
            <PlusCircleIcon />
            <p>Nowe Zlecenie</p>
          </Button>
        </Link>

        <ToggleDarkMode />
      </div>
    </header>
  );
}
