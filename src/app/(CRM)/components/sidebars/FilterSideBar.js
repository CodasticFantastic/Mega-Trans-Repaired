"use client";

import Image from "next/image";
import Logo from "@/images/LogoBlue.png";
import sortIcon from "@/images/icons/sortIcon.png";
import filterIcon from "@/images/icons/filterIcon.png";
import calendarIcon from "@/images/icons/calendarIcon.png";
import redTrashIcon from "@/images/icons/redTrashIcon.png";

import userIcon from "@/images/icons/userIcon.png";
import settingsIcon from "@/images/icons/settingsIcon.png";
import arrowDownIcon from "@/images/icons/arrowDown.png";
import LogoutButton from "../LogoutButton";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function FilterSideBar({ sortOrdersByDate, filterOrdersByStatus, searchOrdersById, filterOrdersByDate, clearFilters }) {
  const { data: session } = useSession();
  const [sortDate, setSortDate] = useState("descending");
  const [filterStaus, setFilterStatus] = useState("Wszystkie");
  const [filterDate, setFilterDate] = useState({ from: "", to: "" });

  return (
    <aside className="SideBar">
      <div className="logo">
        <Image src={Logo} alt="Logo" />
      </div>

      <div className="column">
        <input
          type="text"
          placeholder="Wyszukaj po ID"
          className="searchBar"
          onKeyUp={(e) => {
            searchOrdersById(e.target.value);
          }}
        />
        <div className="section sort">
          <div className="categoryHeader">
            <div className="left">
              <Image src={sortIcon} alt="Ikona sortowania" className="icon" />
              <p className="header">Sortuj Po Dacie</p>
            </div>
            <div className="right">
              <input className="showMoreInput" type="checkbox" id="showMore1" />
              <label className="showMoreLabel" htmlFor="showMore1">
                <Image src={arrowDownIcon} alt="Ikona sortowania" className="showMoreIcon" />
              </label>
            </div>
          </div>
          <div className="divWithText expand1">
            <p className="info">Sortuj od:</p>
            <div className="buttons">
              <button
                className={`tile ${sortDate === "descending" ? "marked" : ""}`}
                onClick={() => {
                  sortOrdersByDate("descending");
                  setSortDate("descending");
                }}
              >
                Nanjnowszych
              </button>
              <button
                className={`tile ${sortDate === "ascending" ? "marked" : ""}`}
                onClick={() => {
                  sortOrdersByDate("ascending");
                  setSortDate("ascending");
                }}
              >
                Najstarszych
              </button>
            </div>
          </div>
        </div>
        <div className="section filter">
          <div className="categoryHeader">
            <div className="left">
              <Image src={filterIcon} alt="Ikona filtrowania" className="icon" />
              <p className="header">Filtruj Po Statusie</p>
            </div>
            <div className="right">
              <input className="showMoreInput" type="checkbox" id="showMore2" />
              <label className="showMoreLabel" htmlFor="showMore2">
                <Image src={arrowDownIcon} alt="Ikona sortowania" className="showMoreIcon" />
              </label>
            </div>
          </div>
          <div className="status expand2">
            <button
              className={`tile all ${filterStaus === "Wszystkie" ? "marked" : ""}`}
              onClick={() => {
                filterOrdersByStatus("Wszystkie");
                setFilterStatus("Wszystkie");
                setSortDate("descending");
              }}
            >
              Wszystkie
            </button>
            <button
              className={`tile producer ${filterStaus === "Producent" ? "marked" : ""}`}
              // className={`tile ${filterStaus === "" ? "marked" : ""}`}
              onClick={() => {
                filterOrdersByStatus("Producent");
                setFilterStatus("Producent");
                setSortDate("descending");
              }}
            >
              Producent
            </button>
            <button
              className={`tile warehouse ${filterStaus === "Magazyn" ? "marked" : ""}`}
              onClick={() => {
                filterOrdersByStatus("Magazyn");
                setFilterStatus("Magazyn");
                setSortDate("descending");
              }}
            >
              Magazyn
            </button>
            <button
              className={`tile delivery ${filterStaus === "Dostawa" ? "marked" : ""}`}
              onClick={() => {
                filterOrdersByStatus("Dostawa");
                setFilterStatus("Dostawa");
                setSortDate("descending");
              }}
            >
              Dostawa
            </button>
            <button
              className={`tile realized ${filterStaus === "Zrealizowane" ? "marked" : ""}`}
              onClick={() => {
                filterOrdersByStatus("Zrealizowane");
                setFilterStatus("Zrealizowane");
                setSortDate("descending");
              }}
            >
              Zrealizowane
            </button>
            <button
              className={`tile paid ${filterStaus === "Pobranie" ? "marked" : ""}`}
              onClick={() => {
                filterOrdersByStatus("Pobranie");
                setFilterStatus("Pobranie");
                setSortDate("descending");
              }}
            >
              Pobranie
            </button>
            <button
              className={`tile canceled ${filterStaus === "Anulowane" ? "marked" : ""}`}
              onClick={() => {
                filterOrdersByStatus("Anulowane");
                setFilterStatus("Anulowane");
                setSortDate("descending");
              }}
            >
              Anulowane
            </button>
          </div>
        </div>
        <div className="section filter">
          <div className="categoryHeader">
            <div className="left">
              <Image src={calendarIcon} alt="Ikona filtrowania" className="icon" />
              <p className="header">Filtruj Po Dacie</p>
            </div>
            <div className="right">
              <input className="showMoreInput" type="checkbox" id="showMore3" />
              <label className="showMoreLabel" htmlFor="showMore3">
                <Image src={arrowDownIcon} alt="Ikona sortowania" className="showMoreIcon" />
              </label>
            </div>
          </div>
          <div className="divWithText expand3">
            <p className="info">Szukaj zleceń utworzonych od</p>
            <input
              type="date"
              className="tile"
              value={filterDate.from}
              onChange={(e) =>
                setFilterDate((prev) => {
                  return { ...prev, from: e.target.value };
                })
              }
            />
            <p className="info">Szukaj zleceń utworzonych do</p>
            <input
              type="date"
              className="tile"
              value={filterDate.to}
              onChange={(e) =>
                setFilterDate((prev) => {
                  return {
                    ...prev,
                    to: e.target.value,
                  };
                })
              }
            />
            <button className="tile search" onClick={() => filterOrdersByDate(filterDate.from, filterDate.to)}>
              Szukaj
            </button>
          </div>
        </div>
        <div
          className="clearFilter"
          onClick={() => {
            clearFilters();
            setSortDate("descending");
            setFilterStatus("Wszystkie");
            setFilterDate({ from: "", to: "" });
          }}
        >
          <Image src={redTrashIcon} alt="Ikona filtrowania" className="icon" />
          <p className="clearFilterText">Wyczyść Filtry</p>
        </div>
      </div>

      <div className="userSection">
        <div className="currentUser">
          <Image src={userIcon} alt="Ikona filtrowania" className="icon" />
          <p className="userName">{session?.user.company}</p>
        </div>
        <div className="options">
          <LogoutButton />
          <Link className="settings" href="/dashboard/settings">
            <Image src={settingsIcon} alt="Ikona filtrowania" className="icon" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
