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

export default function FilterSideBar() {
  return (
    <aside className="SideBar">
      <div className="logo">
        <Image src={Logo} alt="Logo" />
      </div>

      <div className="column">
        <input type="text" placeholder="Wyszukaj zlecenie" className="searchBar" />
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
              <button className="tile marked">Nanjnowszych</button>
              <button className="tile">Najstarszych</button>
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
            <button className="tile all marked">Wszystkie</button>
            <button className="tile producer">Producent</button>
            <button className="tile warehouse">Magazyn</button>
            <button className="tile delivery">Dostawa</button>
            <button className="tile realized">Zrealizowane</button>
            <button className="tile paid">Opłacone</button>
            <button className="tile canceled">Anulowane</button>
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
            <p className="info">Szukaj zleceń od</p>
            <input type="date" className="tile" />
            <p className="info">Szukaj zleceń do</p>
            <input type="date" className="tile" />
          </div>
        </div>
        <div className="clearFilter">
          <Image src={redTrashIcon} alt="Ikona filtrowania" className="icon" />
          <p className="clearFilterText">Wyczyść Filtry</p>
        </div>
      </div>

      <div className="userSection">
        <div className="currentUser">
          <Image src={userIcon} alt="Ikona filtrowania" className="icon" />
          <p className="userName">Jan Kowalski</p>
        </div>
        <div className="options">
          <LogoutButton />
          <div className="settings">
            <Image src={settingsIcon} alt="Ikona filtrowania" className="icon" />
          </div>
        </div>
      </div>
    </aside>
  );
}
