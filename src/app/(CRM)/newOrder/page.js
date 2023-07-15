"use client";
import Link from "next/link";
import InstructionsSideBar from "../components/sidebars/InstructionsSideBar";
import Image from "next/image";
import redBackIcon from "@/images/icons/redBackIcon.png";
import greenPlusIcon from "@/images/icons/greenPlusIcon.png";
import redTrashIcon from "@/images/icons/redTrashIcon.png";

import { useRef, useState } from "react";
import { v4 as uuid4 } from "uuid";

export default function NewOrder() {
  const commodityList = useRef({ orderCommodityType: "Paczka", orderCommodityPayType: "Pobranie" });
  const [commodityListState, setCommodityListState] = useState([]);

  async function processOrder() {
    event.preventDefault();

    console.log(commodityList);
  }

  function addCommodity() {
    commodityList.current = { ...commodityList.current, orderCommodityId: uuid4() };

    console.log(commodityListState);

    setCommodityListState((prevState) => {
      return [...prevState, commodityList.current];
    });

    console.log(showCommodityList);
  }

  function deleteComoditiFromList(id) {
    setCommodityListState((prevState) => {
      return prevState.filter((commodity) => commodity.orderCommodityId !== id);
    });
  }

  let showCommodityList = commodityListState.map((commodity, index) => {
    return (
      <tr key={commodity.orderCommodityId}>
        <td>{commodity.orderCommodityType}</td>
        <td>{commodity.orderCommodityName}</td>
        <td>{orderCommodityPayType === "Pobranie" ? "Opłacona" : commodity.orderCommodityPayAmount}</td>
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
          <form className="NewOrderForm">
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
                      <option value="Odbiór">Odbór</option>
                      <option value="Zwrot">Zwrot</option>
                    </select>
                  </label>
                  <label htmlFor="orderCountry">
                    Rodzaj Zlecenia
                    <select name="orderCountry" id="orderCountry">
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
                    Numer Ulicy *
                    <input type="text" name="orderStreetNumber" id="orderStreetNumber" required />
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
                    Kod Pocztowy *
                    <input type="text" name="orderPostCode" id="orderPostCode" required />
                  </label>
                  <label htmlFor="orderState">
                    Województwo *
                    <input type="text" name="orderState" id="orderState" required />
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
                  <p>Adres Realizacji Zlecenia</p>
                </div>
                <div className="row">
                  <label htmlFor="orderClientName">
                    Firma/Osoba Odbierająca *
                    <input type="text" name="orderClientName" id="orderClientName" required />
                  </label>
                  <label htmlFor="orderClientPhone">
                    Numer Telefonu Klienta *
                    <input type="text" name="orderClientPhone" id="orderClientPhone" required />
                  </label>
                  <label htmlFor="orderClientEmail">
                    Email Klienta *
                    <input type="text" name="orderClientEmail" id="orderClientEmail" required />
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
                      onChange={(e) => {
                        commodityList.current = { ...commodityList.current, orderCommodityType: e.target.value };
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
                      required
                      onChange={(e) => {
                        commodityList.current = { ...commodityList.current, orderCommodityName: e.target.value };
                      }}
                    />
                  </label>
                  <label htmlFor="orderCommodityPayType">
                    Rodzaj Płatności
                    <select
                      name="orderCommodityPayType"
                      id="orderCommodityPayType"
                      onChange={(e) => {
                        commodityList.current = { ...commodityList.current, orderCommodityPayType: e.target.value };
                      }}
                    >
                      <option value="Pobranie">Pobranie</option>
                      <option value="Opłacone">Opłacone z Góry</option>
                    </select>
                  </label>
                  <label htmlFor="orderCommodityPayAmount">
                    Kwota Pobrania
                    <input
                      type="text"
                      name="orderCommodityPayAmount"
                      id="orderCommodityPayAmount"
                      onChange={(e) => {
                        commodityList.current = { ...commodityList.current, orderCommodityPayAmount: e.target.value };
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
                      onChange={(e) => {
                        commodityList.current = { ...commodityList.current, orderCommodityNote: e.target.value };
                      }}
                    />
                  </label>
                  <button type="button" className="addCommodity">
                    <Image src={greenPlusIcon} alt="Dodaj Towar" onClick={addCommodity} />
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="formStage stage4">
                  <div className="formStageName">
                    <p>Zliczone Paczki</p>
                  </div>
                  <p>{showCommodityList.length}</p>
                </div>
                <div className="formStage stage5">
                  <div className="formStageName">
                    <p>Wykaz Paczek</p>
                  </div>

                  {showCommodityList.length > 0 ? (
                    <div className="tableOverflow">
                      <table>
                        <tbody>{showCommodityList}</tbody>
                      </table>
                    </div>
                  ) : (
                    <p>Brak Towarów</p>
                  )}
                </div>
              </div>
            </section>
            <input type="submit" onSubmit={processOrder} value="Zamawiam Zlecenie" className="confirmOrder" />
          </form>
        </main>
      </div>
    </div>
  );
}
