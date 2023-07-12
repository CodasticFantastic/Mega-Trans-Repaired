import Image from "next/image";
import Link from "next/link";

import Logo from "@/images/LogoWhite.png";
import MenuIcon from "@/images/icons/MenuIcon.png";

import SearchForPackage from "@/components/SearchForPackage";

export default function Header() {
  return (
    <header className="Header">
      <div className="desktopMenu container">
        <div className="leftSide">
          <Image
            className="logo"
            src={Logo}
            alt="Logo firmy Mega-Trans, Transport Gabarytów"
            priority
          />
          <nav className="navigation">
            <ul>
              <li>
                <a href="#OfferSection">Usługi</a>
              </li>
              <li>
                <a href="#ServiceSection">Serwis</a>
              </li>
              <li>
                <a href="#PriceSection">Cennik</a>
              </li>
              <li>
                <a href="#ContactSection">Kontakt</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="rightSide">
          <SearchForPackage />
          <button className="placeOrder">
            <Link href="/login"> Nadaj Przesyłkę</Link>
          </button>
        </div>
      </div>
      <div className="mobileMenu container">
        <div className="logo">
          <Image
            className="logo"
            src={Logo}
            alt="Logo firmy Mega-Trans, Transport Gabarytów"
            priority
          />
        </div>
        <div className="row">
          <SearchForPackage />
        </div>
        <div className="row">
          <div className="buttons">
            <div className="left">
              <button className="placeOrder">
                <Link href="/login"> Nadaj Przesyłkę</Link>
              </button>
            </div>
            <div className="right">
              <input className="hamburger" type="checkbox" id="burger" />
              <label className="burger" htmlFor="burger">
                <Image src={MenuIcon} alt="Ikona menu nawigacji" />
              </label>
            </div>
          </div>
          <nav className="navigation">
            <ul>
              <li>
                <a href="#OfferSection">Usługi</a>
              </li>
              <li>
                <a href="#ServiceSection">Serwis</a>
              </li>
              <li>
                <a href="#PriceSection">Cennik</a>
              </li>
              <li>
                <a href="#ContactSection">Kontakt</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
