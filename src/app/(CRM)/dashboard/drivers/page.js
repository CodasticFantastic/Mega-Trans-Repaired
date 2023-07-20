"use client";

import Image from "next/image";
import redBackIcon from "@/images/icons/redBackIcon.png";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function DriversPage() {
  const { data: session } = useSession();
  const [formError, setFormError] = useState(false);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    if (session) {
      getDrivers();
    }
  }, [session]);

  // Get all drivers from database
  async function getDrivers() {
    const request = await fetch("http://localhost:3000/api/drivers/getDrivers", {
      method: "GET",
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.drivers) {
      setDrivers(
        response.drivers.map((driver) => {
          return (
            <div className="driver" key={driver.id}>
              <div className="driverName">
                <p>{driver.name}</p>
              </div>
              <div className="driverEmail">
                <p>{driver.email}</p>
              </div>
              <div className="driverPhone">
                <p>{driver.name}</p>
              </div>
              <button onClick={() => deleteDriver(driver.id)}>
                <p>Usuń Kierowcę</p>
              </button>
            </div>
          );
        })
      );
    }
  }

  // Add new driver request
  async function addDriver(event) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const driverData = {
      driverName: data.get("name"),
      driverEmail: data.get("email"),
      driverPhone: data.get("phone"),
      driverPassword: data.get("password"),
      driverPasswordConfirm: data.get("passwordConfirm"),
    };

    const request = await fetch("http://localhost:3000/api/drivers/createDriver", {
      method: "POST",
      body: JSON.stringify(driverData),
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.Success) {
      getDrivers();
    }
  }

  // Action - Delete driver

  async function deleteDriver(driverId) {
    const request = await fetch(`http://localhost:3000/api/drivers/deleteDriver?id=${driverId}`, {
      method: "GET",
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.Succes) {
      getDrivers();
    }
  }

  return (
    <div className="DriversPage">
      <header className="CRMHeader">
        <Link href="/dashboard" className="backToDashboard">
          <Image src={redBackIcon} alt="Powrót do ekranu głównego" />
          <p>Powrót do pulpitu</p>
        </Link>
        <h1>Kierowcy</h1>
      </header>
      <main>
        <form onSubmit={addDriver}>
          <div className="formStageName">
            <p>Dane Kierowcy</p>
          </div>
          <div className="row first">
            <label htmlFor="name">
              Imię Kierowcy
              <input type="text" name="name" id="name" required />
            </label>
            <label htmlFor="email">
              Email Kierowcy
              <input type="email" name="email" id="email" required />
            </label>
            <label htmlFor="phone">
              Telefon Kierowcy
              <input type="tel" name="phone" id="phone" required />
            </label>
          </div>
          <div className="row">
            <label htmlFor="password">
              Hasło
              <input type="password" name="password" id="password" required />
            </label>
            <label htmlFor="passwordConfirm">
              Potwierdź Hasło
              <input type="password" name="passwordConfirm" id="passwordConfirm" required />
            </label>
            <button type="submit">Dodaj Kierowcę</button>
          </div>
          <div className="row">{formError && <p className="error">{formError}</p>}</div>
        </form>
        <div className="driversSection">
          <div className="formStageName">
            <p>Zarejestrowani Kierowcy</p>
          </div>
          <div className="drivers">
            {drivers.length > 0 ? (
              drivers
            ) : (
              <div className="noDrivers">
                <p>Brak zarejestrowanych kierowców</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
