import Image from "next/image";

import Hero from "@/images/Hero.webp";
import FurnitureDelivery from "@/images/icons/furnitureDelivery.png";
import CarPartsDelivery from "@/images/icons/carPartsDelivery.png";
import PalletDelivery from "@/images/icons/palletDelivery.png";
import WavesAnimation from "@/app/(Website)/components/WavesAnimation";
import BringingIsometric from "@/images/bringingIsometric.webp";
import VanIsometric from "@/images/vanIsometric.webp";
import PalletsIsometric from "@/images/palletsIsometric.webp";
import InfoIconBlack from "@/images/icons/infoIconBlack.png";
import CheckIcon from "@/images/icons/checkIcon.png";
import BenefitsImg from "@/images/benefitsImage.webp";
import SizeIcon from "@/images/icons/sizeIcon.png";
import WeightIcon from "@/images/icons/weightIcon.png";
import DistanceIcon from "@/images/icons/distanceIcon.png";
import ServiceIcon from "@/images/icons/serviceIcon.png";
import PhoneIcon from "@/images/icons/phoneIcon.png";
import LocationIcon from "@/images/icons/locationIcon.png";
import EmailIcon from "@/images/icons/emailIcon.png";

import Link from "next/link";
import ContactForm from "@/app/(Website)/components/ContactForm";

export default function Home() {
  return (
    <main>
      <section className="HeroSection">
        <Image className="heroImg" src={Hero} alt="Hero" />
        <div className="CTA">+48 661 356 818</div>
        <WavesAnimation title="Pozwól nam sobie pomóc i zrealizuj swój transport z nami" />
      </section>
      <section id="OfferSection" className="OfferSection container">
        <h2>Usługi</h2>
        <p className="underHeader">Szybko, Bezpiecznie i Profesjonalnie</p>
        <p className="centeredParagraph">
          Zapraszamy do skorzystania z naszych kompleksowych usług dostawy,
          które obejmują szeroki zakres produktów i przesyłek. Gwarantujemy
          Państwu najwyższą jakość obsługi, terminowość i bezpieczeństwo
          przewożonych towarów.
        </p>
        <div className="offerCards">
          <div className="card">
            <Image
              className="cardIcon"
              src={FurnitureDelivery}
              alt="Dostawa Mebli"
            />
            <p className="cardTitle">Dostawa Mebli</p>
            <p className="cardDescription">
              Bez względu na rozmiar czy ilość mebli, zapewniamy ich sprawną
              dostawę bez uszkodzeń. Nasze doświadczenie w transporcie mebli
              pozwala nam zabezpieczyć je przed wszelkimi czynnikami
              zewnętrznymi, aby dotarły do klienta w idealnym stanie.
            </p>
          </div>
          <div className="card">
            <Image
              className="cardIcon"
              src={CarPartsDelivery}
              alt="Dostawa Części Samochodowych"
            />
            <p className="cardTitle">Dostawa Części Samochodowych</p>
            <p className="cardDescription">
              Jeśli potrzebują Państwo szybkiej i niezawodnej dostawy części
              samochodowych, jesteśmy do Państwa dyspozycji. Dzięki naszej
              nowoczesnej flocie pojazdów i wykwalifikowanej załodze,
              gwarantujemy ekspresową dostawę części, które są kluczowe dla
              sprawności Państwa pojazdów.
            </p>
          </div>
          <div className="card">
            <Image
              className="cardIcon"
              src={PalletDelivery}
              alt="Przesyłki Gabarytowe"
            />
            <p className="cardTitle">Przesyłki Gabarytowe</p>
            <p className="cardDescription">
              Niezależnie od rozmiaru czy wagi, możemy dostarczyć Państwa
              przesyłki gabarytowe w wyznaczonym terminie. Nasze pojazdy są
              odpowiednio przystosowane do transportu dużych i ciężkich
              przedmiotów, zapewniając maksymalne bezpieczeństwo podczas
              przewozu.
            </p>
          </div>
        </div>
        <p className="underOffer">
          Odbieramy przesyłki z każdego miejsca w Polsce, jesteśmy do twojej
          dyspozycji!
        </p>
      </section>
      <section id="ServiceSection" className="ServiceSection container">
        <h2>Serwis</h2>
        <div className="service">
          <div className="imageSection">
            <Image
              src={BringingIsometric}
              alt="Możliwość wniesienia mebli i przesyłek na miejsce"
            />
          </div>
          <div className="hintSection">
            <p className="hintTitle">
              Możliwość wniesienia mebli i przesyłek na miejsce
            </p>
            <div className="hint">
              <Image src={InfoIconBlack} alt="Info Icon" />
              <p>
                Przed dostawą warto skontaktować się z nami telefonicznie, aby
                ustalić szczegóły.
              </p>
            </div>
          </div>
        </div>
        <div className="service">
          <div className="hintSection">
            <p className="hintTitle">Szybka Dostawa</p>
            <div className="hint">
              <Image src={InfoIconBlack} alt="Info Icon" />
              <p>
                Staramy się dostarczyć przesyłki między 2 a 5 dniami roboczymi
                od momentu nadania.
              </p>
            </div>
          </div>
          <div className="imageSection">
            <Image
              src={VanIsometric}
              alt="Możliwość wniesienia mebli i przesyłek na miejsce"
            />
          </div>
        </div>
        <div className="service">
          <div className="imageSection">
            <Image
              src={PalletsIsometric}
              alt="Możliwość wniesienia mebli i przesyłek na miejsce"
            />
          </div>
          <div className="hintSection">
            <p className="hintTitle">Bezpieczeńśtwo</p>
            <div className="hint">
              <Image src={InfoIconBlack} alt="Info Icon" />
              <p>
                Bezpieczeństwo przewożonych przesyłk to dla nas najwyższy
                priorytet. Starannie zabezpieczamy towary przed transportem, aby
                zapewnić ich nienaruszony stan podczas dostawy.
              </p>
            </div>
          </div>
        </div>
        <p className="benefitsTitle">Współpraca z nami to same korzyści</p>
        <div className="benefitsSection">
          <div className="benefits">
            <div className="benefit">
              <Image src={CheckIcon} alt="Check Icon" />
              <p>Bezpieczeństwo</p>
            </div>
            <div className="benefit">
              <Image src={CheckIcon} alt="Check Icon" />
              <p>Śledzenie Przesyłek</p>
            </div>
            <div className="benefit">
              <Image src={CheckIcon} alt="Check Icon" />
              <p>Nowoczesna flota logistyczna</p>
            </div>
            <div className="benefit">
              <Image src={CheckIcon} alt="Check Icon" />
              <p>Odbiór towarów od producenta</p>
            </div>
            <div className="benefit">
              <Image src={CheckIcon} alt="Check Icon" />
              <p>Dostawa na terenie całego kraju</p>
            </div>
            <div className="CTA">
              <Link href="#kontakt">Poproś o wycenę</Link>
            </div>
          </div>
          <div className="benefitsImg">
            <Image src={BenefitsImg} alt="Współpraca z nami to same korzyści" />
          </div>
        </div>
      </section>
      <section id="PriceSection" className="PriceSection container">
        <h2>Cennik</h2>
        <p className="underHeader">
          Dziękujemy za zainteresowanie naszymi usługami!
        </p>
        <p className="centeredParagraph">
          Nasz zespół jest gotowy odpowiedzieć na Państwa pytania i dostarczyć
          kompleksowych informacji na temat naszych usług.
        </p>
        <div className="priceDescription">
          <div className="left">
            <p className="priceInfo">
              Rozumiemy, że każde zlecenie i każda przesyłka są unikalne,
              dlatego preferujemy indywidualne podejście do ustalania cen.
              <br />
              <br />
              Oferujemy konkurencyjne i transparentne warunki cenowe,
              dostosowane do Państwa potrzeb i specyfikacji przesyłek.
              <br />
              <br />
              Chętnie pomożemy Państwu określić koszt dostawy, zachęcamy do
              kontaktu telefonicznego w celu uzyskania szczegółowych informacji
              na temat naszego cennika.
            </p>
          </div>
          <div className="right">
            <p className="title">Od czego zależy cena przesyłki?</p>
            <div className="tiles">
              <div className="tile">
                <Image src={SizeIcon} alt="Wymiary" />
                <p>Wymiary</p>
              </div>
              <div className="tile">
                <Image src={WeightIcon} alt="Waga" />
                <p>Waga</p>
              </div>
              <div className="tile">
                <Image src={DistanceIcon} alt="Dystans" />
                <p>Dystans</p>
              </div>
              <div className="tile">
                <Image src={ServiceIcon} alt="Serwis" />
                <p>Serwis</p>
              </div>
            </div>
          </div>
        </div>
        <div className="info">
          <Image src={InfoIconBlack} alt="Info Icon" />
          <p className="description">
            Nasi konsultanci są dostępni od poniedziałku do piątku w godzinach
            pracy. <br /> Zapewniamy Państwu szybką odpowiedź.
            <br /> Zapraszamy do kontaktu i czekamy na Państwa zapytania!
          </p>
        </div>
      </section>
      <section id="ContactSection" className="ContactSection container">
        <h2>Kontakt</h2>
        <p className="underHeader">Posiadasz do nas jakieś pytania?</p>
        <p className="centeredParagraph">
          A może chcesz zrealizować z nami swoją wysyłkę lub złożyć zapytanie
          ofertowe? <br /> Nie zwlekaj i skontaktuj się z nami już dziś!
        </p>
        <div className="contact">
          <div className="contactInfo">
            <Image src={PhoneIcon} alt="Ikona telefonu" />
            <a href="tel:+48691-021-824" className="info">
              691 021 824
            </a>
          </div>
          <div className="contactInfo">
            <Image src={PhoneIcon} alt="Ikona telefonu" />
            <a href="tel:+48661356818" className="info">
              661 356 818
            </a>
          </div>
          <div className="contactInfo">
            <Image src={PhoneIcon} alt="Ikona telefonu" />
            <a href="tel:+48571481596" className="info">
              571 481 596
            </a>
          </div>
        </div>
        <div className="contact">
          <div className="contactInfo">
            <Image src={EmailIcon} alt="Ikona telefonu" />
            <a href="mailto:mega.kraj@gmail.com" className="info">
              mega.kraj@gmail.com
            </a>
          </div>
          <div className="contactInfo">
            <Image src={LocationIcon} alt="Ikona telefonu" />
            <a
              href="http://maps.google.com/?q=5 Kościuszki, Kępno, 63600"
              className="info"
              target="_blank"
            >
              Kościuszki 5, 63-600 Kępno{" "}
            </a>
          </div>
        </div>
        <div className="contactDetails">
          <div className="contactForm">
            <ContactForm />
          </div>
          <div className="googleMap">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
