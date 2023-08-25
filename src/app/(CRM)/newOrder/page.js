"use client";
import Link from "next/link";
import InstructionsSideBar from "../components/sidebars/InstructionsSideBar";
import Image from "next/image";
import redBackIcon from "@/images/icons/redBackIcon.png";
import greenPlusIcon from "@/images/icons/greenPlusIcon.png";
import redTrashIcon from "@/images/icons/redTrashIcon.png";

import { useState } from "react";
import { v4 as uuid4 } from "uuid";
import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

export default function NewOrder() {
  const router = useRouter();
  const { data: session } = useSession();
  const [commodityItem, setcommodityItem] = useState({
    orderCommodityType: "Paczka",
    orderCommodityPayType: "Pobranie",
    orderCommodityId: uuid4(),
    orderCommodityName: "",
    orderCommodityPayAmount: 0,
    orderCommodityNote: "",
  });
  const [commodityList, setcommodityList] = useState([]);
  const [commodityError, setCommodityError] = useState(false);
  const [formError, setFormError] = useState(null);
  const [countryState, setCountryState] = useState("Polska");
  const [paymentType, setPaymentType] = useState("Przelew");

  // Actions - Process Order to Backend
  async function processOrder(event) {
    event.preventDefault();
    setFormError(null);
    let currency;

    if (commodityList.length < 1) {
      setFormError("Brak Towarów w Zleceniu");
      return;
    }

    if (countryState === "Polska") {
      currency = "PLN";
    } else {
      currency = "EUR";
    }

    const data = new FormData(event.currentTarget);
    const orderData = {
      orderId: uuid4(),
      userId: session?.user.id,
      status: "Producent",
      orderType: data.get("orderType"),
      orderCountry: data.get("orderCountry"),
      orderStreet: data.get("orderStreet"),
      orderStreetNumber: data.get("orderStreetNumber"),
      orderFlatNumber: data.get("orderFlatNumber"),
      orderCity: data.get("orderCity"),
      orderPostCode: data.get("orderPostCode"),
      orderState: data.get("orderState"),
      orderNote: data.get("orderNote"),
      orderClientName: data.get("orderClientName"),
      orderClientPhone: data.get("orderClientPhone"),
      orderClientEmail: data.get("orderClientEmail"),
      currency: currency,
      orderPaymentType: data.get("orderPaymentType"),
      orderPaymentPrice: data.get("orderPaymentAmount"),
      orderItems: commodityList,
    };

    const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/newOrder`, {
      method: "POST",
      body: JSON.stringify(orderData),
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.Success) {
      router.push("/updateOrder/" + orderData.orderId);
    }
  }

  // Actions - Add Comodity Item
  function addCommodity() {
    setCommodityError(false);
    if (!commodityItem.orderCommodityName) {
      setCommodityError("Nazwa Towaru jest wymagana");
    } else {
      setcommodityItem((prevState) => {
        return { ...prevState, orderCommodityId: uuid4() };
      });
      setcommodityList((prevState) => {
        return [...prevState, commodityItem];
      });
      setcommodityItem({
        orderCommodityType: "Paczka",
        orderCommodityId: uuid4(),
        orderCommodityName: "",
        orderCommodityNote: "",
      });
    }
  }

  // Actions - Delete Comodity Item
  function deleteComoditiFromList(id) {
    setcommodityList((prevState) => {
      return prevState.filter((commodity) => commodity.orderCommodityId !== id);
    });
  }

  // Actions - Show Comodity List
  let showcommodityItem = commodityList.map((commodity, index) => {
    return (
      <tr key={commodity.orderCommodityId}>
        <td>{commodity.orderCommodityType}</td>
        <td>{commodity.orderCommodityName}</td>
        <td>
          <Image src={redTrashIcon} alt="Usuń dany towar z listy" onClick={() => deleteComoditiFromList(commodity.orderCommodityId)} />
        </td>
      </tr>
    );
  });

  return (
    <div className="CrmPage">
      <InstructionsSideBar />
      <div className="mainContent NewOrderPage">
        <header className="CRMHeader">
          <Link href="/dashboard" className="backToDashboard">
            <Image src={redBackIcon} alt="Powrót do ekranu głównego" />
            <p>Powrót do pulpitu</p>
          </Link>
          <h1>Nowe Zlecenie</h1>
        </header>
        <main className="NewOrder">
          <form className="NewOrderForm" onSubmit={processOrder}>
            <section className="leftCol">
              <div className="formStage stage1">
                <div className="formStageName">
                  <p>Adres Realizacji Zlecenia</p>
                </div>
                <div className="row">
                  <label htmlFor="orderType">
                    Rodzaj Zlecenia
                    <select name="orderType" id="orderType">
                      <option value="Dostawa">Dostawa</option>
                      <option value="Odbior">Odbór</option>
                      <option value="Zwrot">Zwrot</option>
                    </select>
                  </label>
                  <label htmlFor="orderCountry">
                    Kraj
                    <select name="orderCountry" id="orderCountry" value={countryState} onChange={(e) => setCountryState(e.target.value)}>
                      <option value="Polska">Polska</option>
                      <option value="Czechy">Czechy</option>
                    </select>
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderStreet">
                    Ulica *
                    <input type="text" name="orderStreet" id="orderStreet" required />
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderStreetNumber">
                    Numer Budynku *
                    <input type="text" name="orderStreetNumber" id="orderStreetNumber" pattern="[A-Za-z0-9]{1,}" required />
                  </label>
                  <label htmlFor="orderFlatNumber">
                    Numer Lokalu
                    <input type="text" name="orderFlatNumber" id="orderFlatNumber" />
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderCity">
                    Miejscowość *
                    <input type="text" name="orderCity" id="orderCity" required />
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderPostCode">
                    {countryState === "Polska" ? "Kod Pocztowy (##-###) *" : "Kod Pocztowy (### ##) *"}
                    <input
                      type="text"
                      name="orderPostCode"
                      id="orderPostCode"
                      pattern={countryState === "Polska" ? "[0-9]{2}-[0-9]{3}" : "[0-9]{3} [0-9]{2}"}
                      required
                    />
                  </label>
                  <label htmlFor="orderState">
                    Województwo *
                    <select name="orderState" id="orderState" required>
                      <option value="Dolnośląskie">Dolnośląskie</option>
                      <option value="Kujawsko-Pomorskie">Kujawsko-Pomorskie</option>
                      <option value="Lubelskie">Lubelskie</option>
                      <option value="Lubuskie">Lubuskie</option>
                      <option value="Łódzkie">Łódzkie</option>
                      <option value="Małopolskie">Małopolskie</option>
                      <option value="Mazowieckie">Mazowieckie</option>
                      <option value="Opolskie">Opolskie</option>
                      <option value="Podkarpackie">Podkarpackie</option>
                      <option value="Podlaskie">Podlaskie</option>
                      <option value="Pomorskie">Pomorskie</option>
                      <option value="Śląskie">Śląskie</option>
                      <option value="Świętokrzyskie">Świętokrzyskie</option>
                      <option value="Warmińsko-Mazurskie">Warmińsko-Mazurskie</option>
                      <option value="Wielkopolskie">Wielkopolskie</option>
                      <option value="Zachodniopomorskie">Zachodniopomorskie</option>
                    </select>
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderNote">
                    Notatka do zamówienia
                    <textarea name="orderNote" id="orderNote" cols="30" rows="10"></textarea>
                  </label>
                </div>
              </div>
            </section>
            <section className="rightCol">
              <div className="formStage stage2">
                <div className="formStageName">
                  <p>Adresat Zlecenia</p>
                </div>
                <div className="row">
                  <label htmlFor="orderClientName">
                    Odbiorca *
                    <input type="text" name="orderClientName" id="orderClientName" required />
                  </label>
                  <label htmlFor="orderClientPhone">
                    {countryState === "Polska" ? "Telefon (Bez spacji) *" : "Telefo (Bez spacji) *"}
                    <input
                      type="text"
                      name="orderClientPhone"
                      id="orderClientPhone"
                      required
                      pattern={countryState === "Polska" ? "[0-9]{9}" : "[0-9]{9}"}
                    />
                  </label>
                  <label htmlFor="orderClientEmail">
                    Email Klienta
                    <input type="text" name="orderClientEmail" id="orderClientEmail" />
                  </label>
                </div>
              </div>
              <div className="formStage stage3">
                <div className="formStageName">
                  <p>Informacje o Przesyłce</p>
                </div>
                <div className="row">
                  <label htmlFor="orderCommodityType">
                    Rodzaj Towaru *
                    <select
                      name="orderCommodityType"
                      id="orderCommodityType"
                      value={commodityItem.orderCommodityType}
                      onChange={(e) => {
                        setcommodityItem((prevState) => {
                          return { ...prevState, orderCommodityType: e.target.value };
                        });
                      }}
                    >
                      <option value="Paczka">Paczka/Karton</option>
                      <option value="Gabaryt">Gabaryt</option>
                      <option value="Paleta">Paleta</option>
                    </select>
                  </label>
                  <label htmlFor="orderCommodityName">
                    Nazwa Towaru *
                    <input
                      type="text"
                      name="orderCommodityName"
                      id="orderCommodityName"
                      value={commodityItem.orderCommodityName}
                      onChange={(e) => {
                        setcommodityItem((prevState) => {
                          return { ...prevState, orderCommodityName: e.target.value };
                        });
                      }}
                    />
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderCommodityNote">
                    Notatka do przesyłki
                    <textarea
                      name="orderCommodityNote"
                      id="orderCommodityNote"
                      cols="30"
                      rows="10"
                      value={commodityItem.orderCommodityNote}
                      onChange={(e) => {
                        setcommodityItem((prevState) => {
                          return { ...prevState, orderCommodityNote: e.target.value };
                        });
                      }}
                    />
                  </label>
                  <button type="button" className="addCommodity">
                    <Image src={greenPlusIcon} alt="Dodaj Towar" onClick={addCommodity} />
                  </button>
                </div>
                {commodityError ? <p className="error">{commodityError}</p> : ""}
              </div>
              <div className="row">
                <div className="formStage stage4">
                  <div className="formStageName">
                    <p>Sposób Płatności</p>
                  </div>
                  <label htmlFor="orderPaymentType">
                    Sposób Płatności
                    <select
                      name="orderPaymentType"
                      id="orderPaymentType"
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                    >
                      <option value="Przelew">Przelew</option>
                      <option value="Pobranie">Pobranie</option>
                    </select>
                  </label>
                  {paymentType === "Pobranie" && (
                    <>
                      <label htmlFor="orderPaymentAmount">
                        Kwota Płatności {countryState === "Polska" ? "(PLN)" : "(EUR)"}
                        <input type="number" name="orderPaymentAmount" id="orderPaymentAmount" step="0.01" required />
                      </label>
                    </>
                  )}
                </div>
                <div className="formStage stage5">
                  <div className="formStageName">
                    <p>Wykaz Paczek</p>
                  </div>

                  {showcommodityItem.length > 0 ? (
                    <div className="tableOverflow">
                      <table>
                        <tbody>{showcommodityItem}</tbody>
                      </table>
                    </div>
                  ) : (
                    <p>Brak Towarów</p>
                  )}
                </div>
              </div>
            </section>
            <div>
              {formError ? <p className="formError">Uwaga: {formError}</p> : ""}
              <input type="submit" value="Zamawiam Zlecenie" className="confirmOrder" />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
