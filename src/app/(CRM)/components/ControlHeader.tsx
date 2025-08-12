"use client";

import Image from "next/image";
import GreenPlusIcon from "@/images/icons/greenPlusIcon.png";
import GreenExportIcon from "@/images/icons/greenExportIcon.png";
import DashboardIcon from "@/images/icons/dashboardIcon.png";
import DeliveryIcon from "@/images/icons/deliveryIcon.png";
import CourierIcon from "@/images/icons/courierIcon.png";
import UsersIcon from "@/images/icons/usersIcon.png";
import {
  BlocksIcon,
  PlusCircleIcon,
  TruckIcon,
  UserSearchIcon,
} from "lucide-react";

import Link from "next/link";

import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
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
  exportOrdersData,
}: ControlHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="py-3 flex justify-between items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1">
        <Badge variant="default" className="rounded-sm">
          {orders} Zleceń
        </Badge>
        <Badge className="rounded-sm bg-orange">
          {newOrders} Nowych Zleceń
        </Badge>
        <Badge className="rounded-sm bg-purple">
          {currentOrders} Bieżących Zleceń
        </Badge>
        <Badge className="rounded-sm bg-yellow">
          {inWarehouse} Na Magazynie
        </Badge>
        <Badge className="rounded-sm bg-green">
          {completedOrders} Zrealizowanych
        </Badge>
      </div>
      <div className="flex items-center gap-4">
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
          <Button variant="link" size="sm" className="!p-0">
            <PlusCircleIcon />
            <p>Nowe Zlecenie</p>
          </Button>
        </Link>

        <ToggleDarkMode />
      </div>
      {/* 
        <div className="actions">
          <div className="eksportOrders" onClick={exportOrdersData}>
            <Image src={GreenExportIcon} alt="Ikona eksportu zamwień" />
            <p>Eksportuj</p>
          </div>
        </div>
      </div> */}
    </header>
  );
}
