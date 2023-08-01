import Image from "next/image";
import Logo from "@/images/LogoBlue.png";
import invoiceIcon from "@/images/icons/invoiceIcon.png";
import qrIcon from "@/images/icons/qrIcon.png";
import userIcon from "@/images/icons/userIcon.png";
import settingsIcon from "@/images/icons/settingsIcon.png";
import arrowDownIcon from "@/images/icons/arrowDown.png";

import InfoIcon from "@/images/icons/infoIcon.png";

import LogoutButton from "../LogoutButton";
import Link from "next/link";

import { usePathname } from "next/navigation";

export default function InstructionsSideBar({ orderId }) {
  let pathname = usePathname();
  pathname = pathname.split("/")[1];

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
        {pathname === "updateOrder" && (
          <>
            <Link className="print" href={`/updateOrder/${orderId}/waybill`} target="_blank">
              <Image src={invoiceIcon} alt="Ikona sortowania" className="icon" />
              List Przewozowy
            </Link>
            <Link className="print" href={`/updateOrder/${orderId}/label`} target="_blank">
              <Image src={qrIcon} alt="Ikona sortowania" className="icon" />
              Etykiety
            </Link>
          </>
        )}
      </div>

      <div className="userSection">
        <div className="currentUser">
          <Image src={userIcon} alt="Ikona filtrowania" className="icon" />
          <p className="userName">Jan Kowalski</p>
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
