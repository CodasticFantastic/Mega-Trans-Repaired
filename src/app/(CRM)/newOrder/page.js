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

  // Actions - Process Order to Backend
  async function processOrder(event) {
    event.preventDefault();
    setFormError(null);

    if (commodityList.length < 1) {
      setFormError("Brak Towarów w Zleceniu");
      return;
    }

    const data = new FormData(event.currentTarget);
    const orderData = {
      orderId: uuid4(),
      userId: session?.user.id,
      status: "Producer",
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
      orderItems: commodityList,
    };

    const request = await fetch("http://localhost:3000/api/order/newOrder", {
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
    } else if (
      commodityItem.orderCommodityPayType === "Pobranie" &&
      (!commodityItem.orderCommodityPayAmount || commodityItem.orderCommodityPayAmount === "")
    ) {
      setCommodityError("Kwota Płatności jest wymagana");
    } else {
      setcommodityItem((prevState) => {
        return { ...prevState, orderCommodityId: uuid4() };
      });
      setcommodityList((prevState) => {
        return [...prevState, commodityItem];
      });
      setcommodityItem({
        orderCommodityType: "Paczka",
        orderCommodityPayType: "Pobranie",
        orderCommodityId: uuid4(),
        orderCommodityName: "",
        orderCommodityPayAmount: 0,
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
        <td>{commodity.orderCommodityPayType == "Pobranie" ? commodity.orderCommodityPayAmount : "Opłacona"}</td>
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
                      <option value="Delivery">Dostawa</option>
                      <option value="Collect">Odbór</option>
                      <option value="Producer">Zwrot</option>
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
                    Odbiorca *
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
                  <label htmlFor="orderCommodityPayType">
                    Rodzaj Płatności
                    <select
                      name="orderCommodityPayType"
                      id="orderCommodityPayType"
                      value={commodityItem.orderCommodityPayType}
                      onChange={(e) => {
                        setcommodityItem((prevState) => {
                          return { ...prevState, orderCommodityPayType: e.target.value };
                        });
                      }}
                    >
                      <option value="Pobranie">Pobranie</option>
                      <option value="Przelew">Opłacone z Góry</option>
                    </select>
                  </label>
                  <label htmlFor="orderCommodityPayAmount">
                    Kwota Pobrania
                    <input
                      type="text"
                      name="orderCommodityPayAmount"
                      id="orderCommodityPayAmount"
                      value={commodityItem.orderCommodityPayAmount}
                      onChange={(e) => {
                        setcommodityItem((prevState) => {
                          return { ...prevState, orderCommodityPayAmount: e.target.value };
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
                    <p>Zliczone Paczki</p>
                  </div>
                  <p>{showcommodityItem.length}</p>
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
