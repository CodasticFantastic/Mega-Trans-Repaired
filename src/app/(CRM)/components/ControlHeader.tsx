"use client";

import Image from "next/image";
import GreenPlusIcon from "@/images/icons/greenPlusIcon.png";
import GreenExportIcon from "@/images/icons/greenExportIcon.png";
import DashboardIcon from "@/images/icons/dashboardIcon.png";
import DeliveryIcon from "@/images/icons/deliveryIcon.png";
import CourierIcon from "@/images/icons/courierIcon.png";
import UsersIcon from "@/images/icons/usersIcon.png";
import { BlocksIcon, TruckIcon, UserSearchIcon } from "lucide-react";

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
    <header className="py-3 shadow flex justify-end items-center gap-4 ">
      {session?.user.role === "ADMIN" && (
        <>
          <Link
            href="/dashboard/delivery"
            className="icon-text text-md text-foreground hover:text-primary"
          >
            <Button variant="link" size="sm" className="!p-0">
              <TruckIcon />
              <p>Dostawa</p>
            </Button>
          </Link>
          <Link
            href="/dashboard/drivers"
            className="icon-text text-md text-foreground"
          >
            <Button variant="link" size="sm" className="!p-0">
              <UserSearchIcon />
              <p>Kierowcy</p>
            </Button>
          </Link>
          <Link
            href="/dashboard/clients"
            className="icon-text text-md text-foreground"
          >
            <Button variant="link" size="sm" className="!p-0">
              <UserSearchIcon />
              <p>Klienci</p>
            </Button>
          </Link>
          <div className="navigation">
            <IntegrationsModal />
          </div>

          {/* <DialogTrigger className="icon-text cursor-pointer text-sm" asChild>
            <Button variant="link" size="sm" className="!p-0">
              <BlocksIcon />
              <p>Moje Integracje</p>
            </Button>
          </DialogTrigger> */}
        </>
      )}

      {session?.user.role === "USER" && (
        <div className="navigation">
          <IntegrationsModal />
        </div>
      )}

      <ToggleDarkMode />

      {/* 
      <h1 className={session && session.user.role === "ADMIN" ? "admin" : ""}>
        Zlecenia
      </h1>
      <div className="info">
        <div className="stats">
          <div className="statTile all">
            <p className="statName">
              <span>{orders}</span> Zleceń
            </p>
          </div>
          <div className="statTile new">
            <p className="statName">
              <span>{newOrders}</span> Nowych Zleceń
            </p>
          </div>
          <div className="statTile current">
            <p className="statName">
              <span>{currentOrders}</span> Bieżących Zleceń
            </p>
          </div>
          <div className="statTile warehouse">
            <p className="statName">
              <span>{inWarehouse}</span> Na Magazynie
            </p>
          </div>
          <div className="statTile realized">
            <p className="statName">
              <span>{completedOrders}</span> Zrealizowanych
            </p>
          </div>
        </div>
        <div className="actions">
          <div className="eksportOrders" onClick={exportOrdersData}>
            <Image src={GreenExportIcon} alt="Ikona eksportu zamwień" />
            <p>Eksportuj</p>
          </div>
          <Link href="/newOrder" className="newOrder">
            <Image src={GreenPlusIcon} alt="Ikona dodawania nowego zlecenia" />
            <p>Nowe Zlecenie</p>
          </Link>
        </div>
      </div> */}
    </header>
  );
}
