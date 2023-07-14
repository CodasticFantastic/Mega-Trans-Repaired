import Image from "next/image";
import Logo from "@/images/LogoBlue.png";
import sortIcon from "@/images/icons/sortIcon.png";
import filterIcon from "@/images/icons/filterIcon.png";
import calendarIcon from "@/images/icons/calendarIcon.png";
import redTrashIcon from "@/images/icons/redTrashIcon.png";

import userIcon from "@/images/icons/userIcon.png";
import settingsIcon from "@/images/icons/settingsIcon.png";
import arrowDownIcon from "@/images/icons/arrowDown.png";

import InfoIcon from "@/images/icons/infoIcon.png";

import LogoutButton from "../LogoutButton";

export default function InstructionsSideBar() {
  return (
    <aside className="SideBar">
      <div className="logo">
        <Image src={Logo} alt="Logo" />
      </div>

      <div className="column">
        <div className="section">
          <div className="categoryHeader">
            <div className="left">
              <Image src={InfoIcon} alt="Ikona sortowania" className="icon" />
              <p className="header">Zasady wypełniania pól</p>
            </div>
            <div className="right">
              <input className="showMoreInput" type="checkbox" id="showMore4" />
              <label className="showMoreLabel" htmlFor="showMore4">
                <Image src={arrowDownIcon} alt="Ikona sortowania" className="showMoreIcon" />
              </label>
            </div>
          </div>
          <div className="divWithText expand4">
            <p className="instruction">
              W celu utworzenia lub aktualizacji zlecenia, wypełnij wszystkie obowiązkowe pola oznaczone gwiazdką (*).
            </p>
          </div>
        </div>
        <div className="section">
          <div className="categoryHeader">
            <div className="left">
              <Image src={InfoIcon} alt="Ikona sortowania" className="icon" />
              <p className="header">Oznaczanie Paczek</p>
            </div>
            <div className="right">
              <input className="showMoreInput" type="checkbox" id="showMore5" />
              <label className="showMoreLabel" htmlFor="showMore5">
                <Image src={arrowDownIcon} alt="Ikona sortowania" className="showMoreIcon" />
              </label>
            </div>
          </div>
          <div className="divWithText expand5">
            <p className="instruction">
              Jeśli dany towar składa się z więcej niż 1 elementu a “Rodzaj płatności” to pobranie wpisz kwotę pobrania tylko do pierwszego
              elementu.
            </p>
            <p className="instructionBold">Elementy oznacz np:</p>
            <ul className="instructionList">
              <li>Sofa Część 1</li>
              <li>Sofa Część 2</li>
              <li>Fotel Biurowy</li>
              <li>Stół Duży</li>
            </ul>
          </div>
        </div>
        <div className="section">
          <div className="categoryHeader">
            <div className="left">
              <Image src={InfoIcon} alt="Ikona sortowania" className="icon" />
              <p className="header">Informacja SMS</p>
            </div>
            <div className="right">
              <input className="showMoreInput" type="checkbox" id="showMore6" />
              <label className="showMoreLabel" htmlFor="showMore6">
                <Image src={arrowDownIcon} alt="Ikona sortowania" className="showMoreIcon" />
              </label>
            </div>
          </div>
          <div className="divWithText expand6">
            <p className="instruction">
              Pamiętaj aby podać prawidłowy numer telefonu. Na dany telefon będą wysyłane informacje z aktualizacją statusu przesyłki.
            </p>
          </div>
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
