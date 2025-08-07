"use client";

import Image from "next/image";
import GreenPlusIcon from "@/images/icons/greenPlusIcon.png";
import GreenExportIcon from "@/images/icons/greenExportIcon.png";
import DashboardIcon from "@/images/icons/dashboardIcon.png";
import DeliveryIcon from "@/images/icons/deliveryIcon.png";
import CourierIcon from "@/images/icons/courierIcon.png";
import UsersIcon from "@/images/icons/usersIcon.png";
import { BlocksIcon } from "lucide-react";

import Link from "next/link";

import { useSession } from "next-auth/react";

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
    <header className="CRMHeader">
      {session?.user.role === "ADMIN" && (
        <div className="navigation">
          <Link href="/dashboard/delivery">
            <Image src={DeliveryIcon} alt="Menu - Dostawa" />
            Dostawa
          </Link>
          <Link href="/dashboard/drivers">
            <Image src={CourierIcon} alt="Menu - Kierwocy" />
            Kierowcy
          </Link>
          <Link href="/dashboard/clients">
            <Image src={UsersIcon} alt="Menu - Klieci" />
            Klienci
          </Link>
        </div>
      )}

      {session?.user.role === "USER" && (
        <div className="navigation">
          <Link href="/dashboard/delivery" className="icon-text">
            <BlocksIcon size={20} />
            Moje Integracje
          </Link>
        </div>
      )}

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
      </div>
    </header>
  );
}
