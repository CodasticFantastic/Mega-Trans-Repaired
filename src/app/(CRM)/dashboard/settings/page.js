"use client";

import Image from "next/image";
import redBackIcon from "@/images/icons/redBackIcon.png";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [formError, setFormError] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    nip: "",
    country: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    if (session) {
      getUserData();
    }
  }, [session]);

  // Get user data from database
  async function getUserData() {
    let request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/user/getUser`, {
      method: "GET",
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.success) {
      setSettingsForm({
        companyName: response.success.company,
        email: response.success.email,
        phone: response.success.phone,
        nip: response.success.nip,
        country: response.success.country,
        city: response.success.city,
        address: response.success.address,
      });
    }
  }

  // Update user data request
  async function updateUser(event) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    const data = new FormData(event.currentTarget);
    const userData = {
      companyName: data.get("companyName"),
      email: data.get("email"),
      phone: data.get("phone"),
      nip: data.get("nip"),
      country: data.get("country"),
      city: data.get("city"),
      address: data.get("address"),
    };

    const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/user/updateUser`, {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();

    if (response.error) {
      setFormError(response.error);
    } else if (response.success) {
      setFormSuccess("Dane zaktualizowane pomyślnie");
    }
  }

  return (
    <div className="SettingsPage">
      <header className="CRMHeader">
        <Link href="/dashboard" className="backToDashboard">
          <Image src={redBackIcon} alt="Powrót do ekranu głównego" />
          <p>Powrót do pulpitu</p>
        </Link>
        <h1>Ustawienia</h1>
      </header>
      <main>
        <form onSubmit={updateUser}>
          <label htmlFor="companyName">
            Nazwa Firmy
            <input
              type="text"
              name="companyName"
              id="companyName"
              value={settingsForm.companyName}
              onChange={(e) =>
                setSettingsForm((prev) => {
                  return { ...prev, companyName: e.target.value };
                })
              }
            />
          </label>
          <label htmlFor="email">
            Email Firmowy
            <input
              type="email"
              name="email"
              id="email"
              value={settingsForm.email}
              onChange={(e) =>
                setSettingsForm((prev) => {
                  return { ...prev, email: e.target.value };
                })
              }
            />
          </label>
          <label htmlFor="phone">
            Telefon Kontaktowy
            <input
              type="tel"
              name="phone"
              id="phone"
              value={settingsForm.phone}
              onChange={(e) =>
                setSettingsForm((prev) => {
                  return { ...prev, phone: e.target.value };
                })
              }
            />
          </label>

          <label htmlFor="nip">
            NIP
            <input
              type="text"
              name="nip"
              id="nip"
              value={settingsForm.nip}
              onChange={(e) =>
                setSettingsForm((prev) => {
                  return { ...prev, nip: e.target.value };
                })
              }
            />
          </label>
          <label htmlFor="country">
            Kraj
            <input
              type="text"
              name="country"
              id="country"
              value={settingsForm.country}
              onChange={(e) =>
                setSettingsForm((prev) => {
                  return { ...prev, country: e.target.value };
                })
              }
            />
          </label>
          <label htmlFor="city">
            Miasto
            <input
              type="text"
              name="city"
              id="city"
              value={settingsForm.city}
              onChange={(e) =>
                setSettingsForm((prev) => {
                  return { ...prev, city: e.target.value };
                })
              }
            />
          </label>
          <label htmlFor="address">
            Adres
            <input
              type="text"
              name="address"
              id="address"
              value={settingsForm.address}
              onChange={(e) =>
                setSettingsForm((prev) => {
                  return { ...prev, address: e.target.value };
                })
              }
            />
          </label>
          <Link href="/resetPassword" className="passRestart">
            Zrestartuj hasło
          </Link>
          <button type="submit">Aktualizuj Dane Firmy</button>

          <div className="row">{formError && <p className="error">{formError}</p>}</div>
          <div className="row">{formSuccess && <p className="success">{formSuccess}</p>}</div>
        </form>
      </main>
    </div>
  );
}
