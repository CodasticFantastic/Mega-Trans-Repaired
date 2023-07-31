"use client";
import Link from "next/link";
import InstructionsSideBar from "../../components/sidebars/InstructionsSideBar";
import Image from "next/image";
import redBackIcon from "@/images/icons/redBackIcon.png";

import { useEffect, useState } from "react";
import { v4 as uuid4 } from "uuid";
import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

export default function UpdateOrder({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [commodityItem, setCommodityItem] = useState({
    orderCommodityType: "Paczka",
    orderCommodityPayType: "Pobranie",
    orderCommodityId: uuid4(),
    orderCommodityName: "",
    orderCommodityPayAmount: 0,
    orderCommodityNote: "",
  });

  const [orderForm, setOrderForm] = useState({
    orderId: "",
    orderStatus: "",
    orderType: "",
    orderCountry: "",
    orderStreet: "",
    orderStreetNumber: "",
    orderFlatNumber: "",
    orderCity: "",
    orderPostCode: "",
    orderState: "",
    orderNote: "",
    orderClientName: "",
    orderClientPhone: "",
    orderClientEmail: "",
  });
  const [countryState, setCountryState] = useState("Polska");

  const [commodityList, setcommodityList] = useState([]);
  const [commodityError, setCommodityError] = useState(false);
  const [formError, setFormError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (session) getOrderData();
  }, [session]);

  // Actions - Get Order Data from Backend
  async function getOrderData() {
    const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/order/getOrder?id=${params.id}`, {
      method: "GET",
      headers: {
        Authorization: session?.accessToken,
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.order) {
      setcommodityList(
        response.order.packages.map((item) => {
          return {
            orderCommodityType: item.commodityType,
            orderCommodityPayType: item.commodityPaymentType,
            orderCommodityId: item.packageId,
            orderCommodityName: item.commodityName,
            orderCommodityPayAmount: item.commodityPrice + response.order.currency,
            orderCommodityNote: item.commodityNote,
          };
        })
      );

      setOrderForm({
        orderStatus: response.order.status,
        orderId: response.order.orderId,
        orderType: response.order.orderType,
        orderCountry: response.order.orderCountry,
        orderStreet: response.order.orderStreet,
        orderStreetNumber: response.order.orderStreetNumber,
        orderFlatNumber: response.order.orderFlatNumber,
        orderCity: response.order.orderCity,
        orderPostCode: response.order.orderPostCode,
        orderState: response.order.orderState,
        orderNote: response.order.orderNote,
        orderClientName: response.order.recipientName,
        orderClientPhone: response.order.recipientPhone,
        orderClientEmail: response.order.recipientEmail,
      });

      setCountryState(response.order.orderCountry);
    }
  }

  // Actions - Update Order
  async function updateOrder(event) {
    event.preventDefault();
    setFormError(null);

    if (commodityList.length < 1) {
      setFormError("Brak Towarów w Zleceniu");
      return;
    }

    const data = new FormData(event.currentTarget);
    const orderDataUpdate = {
      orderId: orderForm.orderId,
      userId: session?.user.id,
      orderType: data.get("orderType"),
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

    const request = await fetch("http://localhost:3000/api/order/updateOrder", {
      method: "POST",
      body: JSON.stringify(orderDataUpdate),
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.Success) {
      setUpdateSuccess(true);
    }
  }

  // Actions - Show Comodity List
  let showcommodityItem = commodityList.map((commodity, index) => {
    return (
      <tr key={commodity.orderCommodityId}>
        <td>{commodity.orderCommodityType}</td>
        <td>{commodity.orderCommodityName}</td>
        <td>{commodity.orderCommodityPayType == "Pobranie" ? commodity.orderCommodityPayAmount : "Opłacona"}</td>
      </tr>
    );
  });

  // Actions - Cancel Order
  async function cancelOrder() {
    const request = await fetch("http://localhost:3000/api/order/cancelOrder?id=" + params.id, {
      method: "GET",
      headers: {
        Authorization: session?.accessToken,
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.Success) {
      router.push("/dashboard");
    }
  }

  return (
    <div id="test" className="CrmPage">
      <InstructionsSideBar orderId={orderForm.orderId} />
      <div className="mainContent NewOrderPage">
        <header className="CRMHeader">
          <Link href="/dashboard" className="backToDashboard">
            <Image src={redBackIcon} alt="Powrót do ekranu głównego" />
            <p>Powrót do pulpitu</p>
          </Link>
          <h1>Aktualizuj Zlecenie</h1>
        </header>
        <main className="NewOrder">
          <form className="NewOrderForm" onSubmit={updateOrder}>
            <section className="leftCol">
              <div className="formStage stage1">
                <div className="formStageName">
                  <p>Adres Realizacji Zlecenia</p>
                </div>
                <div className="row">
                  <label htmlFor="orderType">
                    Rodzaj Zlecenia
                    <select
                      name="orderType"
                      id="orderType"
                      value={orderForm.orderType}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderType: e.target.value };
                        });
                      }}
                    >
                      <option value="Dostawa">Dostawa</option>
                      <option value="Odbior">Odbór</option>
                      <option value="Zwrot">Zwrot</option>
                    </select>
                  </label>
                  <label htmlFor="orderCountry">
                    Kraj Zlecenia
                    <select
                      name="orderCountry"
                      id="orderCountry"
                      value={orderForm.orderCountry}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderCountry: e.target.value };
                        });
                      }}
                      disabled
                    >
                      <option value="Polska">Polska</option>
                      <option value="Czechy">Czechy</option>
                    </select>
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderStreet">
                    Ulica *
                    <input
                      type="text"
                      name="orderStreet"
                      id="orderStreet"
                      value={orderForm.orderStreet}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderStreet: e.target.value };
                        });
                      }}
                      required
                    />
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderStreetNumber">
                    Numer Ulicy *
                    <input
                      type="text"
                      name="orderStreetNumber"
                      id="orderStreetNumber"
                      value={orderForm.orderStreetNumber}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderStreetNumber: e.target.value };
                        });
                      }}
                      required
                    />
                  </label>
                  <label htmlFor="orderFlatNumber">
                    Numer Lokalu
                    <input
                      type="text"
                      name="orderFlatNumber"
                      id="orderFlatNumber"
                      value={orderForm.orderFlatNumber}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderFlatNumber: e.target.value };
                        });
                      }}
                    />
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderCity">
                    Miejscowość *
                    <input
                      type="text"
                      name="orderCity"
                      id="orderCity"
                      value={orderForm.orderCity}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderCity: e.target.value };
                        });
                      }}
                      required
                    />
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderPostCode">
                    Kod Pocztowy *
                    <input
                      type="text"
                      name="orderPostCode"
                      id="orderPostCode"
                      value={orderForm.orderPostCode}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderPostCode: e.target.value };
                        });
                      }}
                      required
                    />
                  </label>
                  <label htmlFor="orderState">
                    Województwo *
                    <input
                      type="text"
                      name="orderState"
                      id="orderState"
                      value={orderForm.orderState}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderState: e.target.value };
                        });
                      }}
                      required
                    />
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="orderNote">
                    Notatka do zamówienia
                    <textarea
                      name="orderNote"
                      id="orderNote"
                      cols="30"
                      rows="10"
                      value={orderForm.orderNote}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderNote: e.target.value };
                        });
                      }}
                    ></textarea>
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
                    <input
                      type="text"
                      name="orderClientName"
                      id="orderClientName"
                      value={orderForm.orderClientName}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderClientName: e.target.value };
                        });
                      }}
                      required
                    />
                  </label>
                  <label htmlFor="orderClientPhone">
                    {orderForm.orderCountry === "Polska" ? "Telefonu (48#########) *" : "Telefon (420#########) *"}
                    <input
                      type="text"
                      name="orderClientPhone"
                      id="orderClientPhone"
                      required
                      value={orderForm.orderClientPhone}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderClientPhone: e.target.value };
                        });
                      }}
                      pattern={orderForm.orderCountry === "Polska" ? "48[0-9]{9}" : "420[0-9]{9}"}
                    />
                  </label>
                  <label htmlFor="orderClientEmail">
                    Email Klienta *
                    <input
                      type="text"
                      name="orderClientEmail"
                      id="orderClientEmail"
                      value={orderForm.orderClientEmail}
                      onChange={(e) => {
                        setOrderForm((prevState) => {
                          return { ...prevState, orderClientEmail: e.target.value };
                        });
                      }}
                      required
                    />
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
                        setCommodityItem((prevState) => {
                          return { ...prevState, orderCommodityType: e.target.value };
                        });
                      }}
                      disabled
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
                        setCommodityItem((prevState) => {
                          return { ...prevState, orderCommodityName: e.target.value };
                        });
                      }}
                      disabled
                    />
                  </label>
                  <label htmlFor="orderCommodityPayType">
                    Rodzaj Płatności
                    <select
                      name="orderCommodityPayType"
                      id="orderCommodityPayType"
                      value={commodityItem.orderCommodityPayType}
                      onChange={(e) => {
                        setCommodityItem((prevState) => {
                          return { ...prevState, orderCommodityPayType: e.target.value };
                        });
                      }}
                      disabled
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
                        setCommodityItem((prevState) => {
                          return { ...prevState, orderCommodityPayAmount: e.target.value };
                        });
                      }}
                      disabled
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
                        setCommodityItem((prevState) => {
                          return { ...prevState, orderCommodityNote: e.target.value };
                        });
                      }}
                      disabled
                    />
                  </label>
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
              {updateSuccess ? <p className="formSuccess">Aktualizacja danych przesyłki przebiegła prawidłowo</p> : ""}
              <input
                type="submit"
                value={orderForm.orderStatus === "Anulowane" ? "Zlecenie zostało anulowane" : "Aktualizuj Zlecenie"}
                className={`confirmOrder ${orderForm.orderStatus === "Anulowane" ? "orderCanceled" : ""}`}
                disabled={orderForm.orderStatus === "Anulowane" ? true : false}
              />
              {orderForm.orderStatus !== "Anulowane" && (
                <button className="cancelOrder" onClick={cancelOrder}>
                  Anuluj Zlecenie
                </button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
