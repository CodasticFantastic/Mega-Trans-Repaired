import WavesAnimation from "@/app/(Website)/components/WavesAnimation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/images/LogoWhite.png";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="up">
          <div className="logo">
            <Image src={Logo} alt="Logo firmy Mega-Trans" />
          </div>
          <div className="row">
            <p className="bold">Dla Klientów</p>
            <Link href="/rodo">Rodo</Link>
            <Link href="/regulamin">Regulamin</Link>
            <Link href="/polityka-prywatnosci">Polityka Prywatności</Link>
          </div>
          <div className="row">
            <p className="bold">Kontakt</p>
            <a href="mailto:mega.kraj@gmail.com">mega.kraj@gmail.com</a>
            <a href="tel:+48691021824">691 021 824</a>
            <a href="tel:+48661356818">661 356 818</a>
            <a href="tel:+48571481596">571 481 596</a>
          </div>
          <div className="row">
            <p className="bold">Usługi</p>
            <p>
              Transport Części <br />
              Samochodowych
            </p>
            <p>Transport Gabarytów</p>
            <p>Transport Paczek</p>
            <p>Transport Palet</p>
          </div>
          <div className="row">
            <p className="bold">Adres</p>
            <p>
              Grębanin-Kolonia
              <br /> Pierwsza 6<br />
              <br />
              63-604 Baranów
            </p>
          </div>
        </div>
        <div className="down">
          <p>&copy; 2023 Mega-Trans</p>
          <p>
            Icons by: <Link href="https://icons8.com/">Icons8</Link>
            <br />
            Created by: <Link href="/">Space Agency Marketing</Link>
          </p>
        </div>
      </div>
      <WavesAnimation />
    </footer>
  );
}
