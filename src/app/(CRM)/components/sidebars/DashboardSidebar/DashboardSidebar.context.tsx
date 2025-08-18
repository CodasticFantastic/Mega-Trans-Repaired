"use client";
import { createContext, useContext, useState, ReactNode } from "react";

// Typy dla filtrów
export interface DashboardSidebarFilters {
  searchId: string;
  orderBy: "asc" | "desc";
  sortByDate: "updatedAt" | "createdAt";
  status: string;
  dateFrom: string;
  dateTo: string;
  postalCode: string;
}

// Typy dla funkcji filtrów
interface FilterFunctions {
  sortOrdersByDate: (sort: "ascending" | "descending") => void;
  sortOrdersByDateField: (field: "updatedAt" | "createdAt") => void;
  filterOrdersByStatus: (status: string) => void;
  searchOrdersById: (id: string) => void;
  filterOrdersByDate: (from: string, to: string) => void;
  filterByPostalCode: (postalCode: string) => void;
  clearFilters: () => void;
}

// Typy dla stanu lokalnego sidebara
interface SidebarState {
  sortDate: "ascending" | "descending";
  sortDateField: "updatedAt" | "createdAt";
  filterStatus: string;
  filterDate: { from: string; to: string };
  filterPostalCode: string;
}

// Typy dla kontekstu
interface DashboardSidebarContextType {
  filters: DashboardSidebarFilters;
  sidebarState: SidebarState;
  filterFunctions: FilterFunctions;
  updateSidebarState: (updates: Partial<SidebarState>) => void;
}

// Domyślne wartości
const defaultFilters: DashboardSidebarFilters = {
  searchId: "",
  orderBy: "desc",
  sortByDate: "updatedAt",
  status: "Wszystkie",
  dateFrom: "",
  dateTo: "",
  postalCode: "all",
};

const defaultSidebarState: SidebarState = {
  sortDate: "descending",
  sortDateField: "updatedAt",
  filterStatus: "Wszystkie",
  filterDate: { from: "", to: "" },
  filterPostalCode: "all",
};

// Tworzenie kontekstu
const DashboardSidebarContext = createContext<
  DashboardSidebarContextType | undefined
>(undefined);

// Provider props
interface DashboardSidebarProviderProps {
  children: ReactNode;
  onFiltersChange: (filters: DashboardSidebarFilters) => void;
  onClearFilters: () => void;
}

// Provider komponent
export function DashboardSidebarProvider({
  children,
  onFiltersChange,
  onClearFilters,
}: DashboardSidebarProviderProps) {
  const [filters, setFilters] =
    useState<DashboardSidebarFilters>(defaultFilters);
  const [sidebarState, setSidebarState] =
    useState<SidebarState>(defaultSidebarState);

  // Funkcje filtrów
  const filterFunctions: FilterFunctions = {
    sortOrdersByDate: (sort: "ascending" | "descending") => {
      const orderBy: "asc" | "desc" = sort === "ascending" ? "asc" : "desc";
      const newFilters: DashboardSidebarFilters = { ...filters, orderBy };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },

    sortOrdersByDateField: (field: "updatedAt" | "createdAt") => {
      const newFilters: DashboardSidebarFilters = { ...filters, sortByDate: field };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },

    filterOrdersByStatus: (status: string) => {
      const newFilters: DashboardSidebarFilters = { ...filters, status };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },

    searchOrdersById: (id: string) => {
      const newFilters: DashboardSidebarFilters = { ...filters, searchId: id };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },

    filterOrdersByDate: (from: string, to: string) => {
      const newFilters: DashboardSidebarFilters = {
        ...filters,
        dateFrom: from,
        dateTo: to,
      };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },

    filterByPostalCode: (postalCode: string) => {
      const newFilters: DashboardSidebarFilters = { ...filters, postalCode };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },

    clearFilters: () => {
      setFilters(defaultFilters);
      setSidebarState(defaultSidebarState);
      onClearFilters();
    },
  };

  // Funkcja do aktualizacji stanu sidebara
  const updateSidebarState = (updates: Partial<SidebarState>) => {
    setSidebarState((prev) => ({ ...prev, ...updates }));
  };

  const value: DashboardSidebarContextType = {
    filters,
    sidebarState,
    filterFunctions,
    updateSidebarState,
  };

  return (
    <DashboardSidebarContext.Provider value={value}>
      {children}
    </DashboardSidebarContext.Provider>
  );
}

// Hook do używania kontekstu
export function useDashboardSidebar() {
  const context = useContext(DashboardSidebarContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardSidebar must be used within a DashboardSidebarProvider"
    );
  }
  return context;
}
