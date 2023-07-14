import Image from "next/image";
import Link from "next/link";

import Logo from "@/images/LogoWhite.png";
import MenuIcon from "@/images/icons/menuIcon.png";

import SearchForPackage from "@/app/(Website)/components/SearchForPackage";
import SignInButton from "@/app/(Website)/components/SignInButton";

export default function Header() {
  return (
    <header className="Header">
      <div className="desktopMenu container">
        <div className="leftSide">
          <Link href="/">
            <Image
              className="logo"
              src={Logo}
              alt="Logo firmy Mega-Trans, Transport Gabarytów"
              priority
            />
          </Link>
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
          <SignInButton />
        </div>
      </div>
      <div className="mobileMenu container">
        <div className="logo">
          <Link href="/">
            <Image
              className="logo"
              src={Logo}
              alt="Logo firmy Mega-Trans, Transport Gabarytów"
              priority
            />
          </Link>
        </div>
        <div className="column">
          <div className="row">
            <div className="buttons">
              <div className="left">
                <SignInButton />
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
          <div className="row">
            <SearchForPackage />
          </div>
        </div>
      </div>
    </header>
  );
}
