"use client";

import Image from "next/image";
import Logo from "@/images/LogoBlue.png";
import LogoutButton from "../../LogoutButton";
import Link from "next/link";
import { Parser } from "html-to-react";
import { Input } from "@/components/shadcn/ui/input";
import dayjs from "dayjs";
import {
  Calendar1Icon,
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarClockIcon,
  FunnelIcon,
  MailsIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/ui/accordion";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import DatePicker from "@/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useDashboardSidebar } from "./DashboardSidebar.context";
import { useSession } from "next-auth/react";

export default function DashboardSidebar() {
  const { data: session } = useSession();
  const { sidebarState, filterFunctions, updateSidebarState } =
    useDashboardSidebar();

  const handleDateChange = (field: "from" | "to", value: Date | undefined) => {
    let dateString = "";

    if (value instanceof Date) {
      if (field === "from") {
        // Dla daty "od" ustaw początek dnia (00:00:00)
        dateString = dayjs(value).startOf("day").format("YYYY-MM-DD HH:mm:ss");
      } else {
        // Dla daty "do" ustaw koniec dnia (23:59:59)
        dateString = dayjs(value).endOf("day").format("YYYY-MM-DD HH:mm:ss");
      }
    }

    const newFilterDate = { ...sidebarState.filterDate, [field]: dateString };
    updateSidebarState({ filterDate: newFilterDate });

    // Przekaż obie daty do funkcji filtrowania
    const fromDate =
      field === "from" ? dateString : sidebarState.filterDate.from;
    const toDate = field === "to" ? dateString : sidebarState.filterDate.to;

    filterFunctions.filterOrdersByDate(fromDate, toDate);
  };

  return (
    <aside className="sm:max-h-screen sm:h-screen w-full sm:w-64 sm:min-w-64 overflow-hidden p-4 bg-background shadow-lg flex flex-col">
      {/* Logo */}
      <div className="max-w-32 mx-auto mb-8">
        <Image src={Logo} alt="Megatrans Logo" />
      </div>

      {/* Search and Filters */}
      <div className="order-2 sm:order-1">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Znajdź przesyłkę"
            className="pl-8"
            onKeyUp={(e) => {
              filterFunctions.searchOrdersById(
                (e.target as HTMLInputElement).value
              );
            }}
          />
        </div>
        {/* Filters and Sorting */}
        <Accordion type="multiple" className="pl-2">
          <AccordionItem value="sort-by-date">
            <AccordionTrigger>
              <span className="icon-text">
                {sidebarState.sortDate === "descending" ? (
                  <CalendarArrowDown size={18} />
                ) : (
                  <CalendarArrowUp size={18} />
                )}
                <p className="font-normal text-foreground">Sortuj po dacie</p>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-xs font-normal mb-2">Sortuj od:</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="xs"
                  variant={
                    sidebarState.sortDate === "descending"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    filterFunctions.sortOrdersByDate("descending");
                    updateSidebarState({ sortDate: "descending" });
                  }}
                >
                  Najnowszych
                </Button>
                <Button
                  size="xs"
                  variant={
                    sidebarState.sortDate === "ascending"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    filterFunctions.sortOrdersByDate("ascending");
                    updateSidebarState({ sortDate: "ascending" });
                  }}
                >
                  Najstarszych
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sort-by-status">
            <AccordionTrigger>
              <span className="icon-text">
                <FunnelIcon
                  size={18}
                  className={
                    sidebarState.filterStatus &&
                    sidebarState.filterStatus !== "Wszystkie"
                      ? "text-primary"
                      : "text-foreground"
                  }
                />
                <p className="font-normal text-foreground">
                  Sortuj po statusie
                </p>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="xs"
                    variant={
                      sidebarState.filterStatus === "Wszystkie"
                        ? "default"
                        : "outline"
                    }
                    className="w-full"
                    onClick={() => {
                      filterFunctions.filterOrdersByStatus("Wszystkie");
                      updateSidebarState({
                        filterStatus: "Wszystkie",
                        sortDate: "descending",
                      });
                    }}
                  >
                    Wszystkie
                  </Button>

                  <Button
                    size="xs"
                    variant={
                      sidebarState.filterStatus === "Producent"
                        ? "orange"
                        : "orange-outline"
                    }
                    onClick={() => {
                      filterFunctions.filterOrdersByStatus("Producent");
                      updateSidebarState({
                        filterStatus: "Producent",
                        sortDate: "descending",
                      });
                    }}
                  >
                    Producent
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="xs"
                    variant={
                      sidebarState.filterStatus === "Magazyn"
                        ? "yellow"
                        : "yellow-outline"
                    }
                    onClick={() => {
                      filterFunctions.filterOrdersByStatus("Magazyn");
                      updateSidebarState({
                        filterStatus: "Magazyn",
                        sortDate: "descending",
                      });
                    }}
                  >
                    Magazyn
                  </Button>

                  <Button
                    size="xs"
                    variant={
                      sidebarState.filterStatus === "Dostawa"
                        ? "purple"
                        : "purple-outline"
                    }
                    onClick={() => {
                      filterFunctions.filterOrdersByStatus("Dostawa");
                      updateSidebarState({
                        filterStatus: "Dostawa",
                        sortDate: "descending",
                      });
                    }}
                  >
                    Dostawa
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="xs"
                    variant={
                      sidebarState.filterStatus === "Anulowane"
                        ? "destructive"
                        : "destructive-outline"
                    }
                    onClick={() => {
                      filterFunctions.filterOrdersByStatus("Anulowane");
                      updateSidebarState({
                        filterStatus: "Anulowane",
                        sortDate: "descending",
                      });
                    }}
                  >
                    Anulowane
                  </Button>
                  <Button
                    size="xs"
                    variant={
                      sidebarState.filterStatus === "Zrealizowane"
                        ? "green"
                        : "green-outline"
                    }
                    onClick={() => {
                      filterFunctions.filterOrdersByStatus("Zrealizowane");
                      updateSidebarState({
                        filterStatus: "Zrealizowane",
                        sortDate: "descending",
                      });
                    }}
                  >
                    Zrealizowane
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="filter-by-date">
            <AccordionTrigger>
              <span className="icon-text">
                <Calendar1Icon
                  size={18}
                  className={
                    sidebarState.filterDate.from || sidebarState.filterDate.to
                      ? "text-primary"
                      : "text-foreground"
                  }
                />{" "}
                <p className="font-normal text-foreground">Filtruj po dacie</p>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <DatePicker
                  placeholder="Wybierz datę"
                  date={
                    sidebarState.filterDate.from &&
                    sidebarState.filterDate.from !== ""
                      ? dayjs(sidebarState.filterDate.from).toDate()
                      : undefined
                  }
                  onDateChange={(date) => handleDateChange("from", date)}
                  label={
                    <p className="text-xs font-normal">Data utworzenia od:</p>
                  }
                />
                <DatePicker
                  placeholder="Wybierz datę"
                  date={
                    sidebarState.filterDate.to &&
                    sidebarState.filterDate.to !== ""
                      ? dayjs(sidebarState.filterDate.to).toDate()
                      : undefined
                  }
                  onDateChange={(date) => handleDateChange("to", date)}
                  label={
                    <p className="text-xs font-normal">Data utworzenia do:</p>
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="filter-by-postal-code">
            <AccordionTrigger>
              <span className="icon-text">
                <MailsIcon
                  size={18}
                  className={
                    sidebarState.filterPostalCode &&
                    sidebarState.filterPostalCode !== "all"
                      ? "text-primary"
                      : "text-foreground"
                  }
                />
                <p className="font-normal text-foreground">
                  Filtruj kody pocztowe
                </p>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <Label className="flex flex-col gap-1 items-start w-full">
                <p className="text-xs font-normal">Zaczynające się od:</p>
                <Select
                  value={sidebarState.filterPostalCode}
                  onValueChange={(value) => {
                    filterFunctions.filterByPostalCode(value);
                    updateSidebarState({ filterPostalCode: value });
                  }}
                  defaultValue="all"
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Wybierz kod pocztowy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="0">0#-###</SelectItem>
                    <SelectItem value="1">1#-###</SelectItem>
                    <SelectItem value="2">2#-###</SelectItem>
                    <SelectItem value="3">3#-###</SelectItem>
                    <SelectItem value="4">4#-###</SelectItem>
                    <SelectItem value="5">5#-###</SelectItem>
                    <SelectItem value="6">6#-###</SelectItem>
                    <SelectItem value="7">7#-###</SelectItem>
                    <SelectItem value="8">8#-###</SelectItem>
                    <SelectItem value="9">9#-###</SelectItem>
                  </SelectContent>
                </Select>
              </Label>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Clear Filters Button */}
        <Button
          variant="destructive-outline"
          className="w-full"
          size="sm"
          onClick={() => {
            filterFunctions.clearFilters();
          }}
        >
          <TrashIcon size={18} /> Wyczyść filtry
        </Button>
      </div>

      {/* NA MOBILE PIERWSZE, NA PC DRUGIE */}
      <div className="mt-auto mb-8 sm:mb-0 sm:px-4 flex flex-col gap-2 order-1 sm:order-2">
        <span className="icon-text bg-secondary p-1 rounded-md text-sm justify-center font-normal">
          <UserIcon size={20} />
          <p>{Parser().parse(session?.user.company)}</p>
        </span>
        <div className="flex gap-2">
          <div className="flex-1">
            <LogoutButton />
          </div>
          <div className="flex items-center justify-center">
            <Link className="hover:animate-spin" href="/dashboard/settings">
              <SettingsIcon size={28} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
