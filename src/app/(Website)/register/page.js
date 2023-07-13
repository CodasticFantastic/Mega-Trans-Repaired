"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleRegister(event) {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const userData = {
      email: data.get("email"),
      phone: data.get("phone"),
      password: data.get("password"),
      passwordConfirmation: data.get("passwordConfirmation"),
      companyName: data.get("companyName"),
      nip: data.get("nip"),
      country: data.get("country"),
      city: data.get("city"),
      street: data.get("street"),
    };

    const response = await fetch("/api/registration", {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const User = await response.json();

    if (User.error) {
      setError(User.error);
      return;
    } else {
      console.log(User);
      // router.push("/");
    }
  }

  return (
    <main className="LoginRegisterPage">
      <form method="POST" onSubmit={handleRegister} className="form">
        <h2>Rejestracja</h2>
        <p className="dimInfo">Posiadasz już konto?</p>
        <Link href="/login" className="link">
          Zaloguj się!
        </Link>

        <input
          type="email"
          id="email"
          name="email"
          placeholder="Twój adres email"
          required
        />
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Twój numer telefonu"
          required
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Twoje hasło"
          required
        />
        <input
          type="password"
          id="passwordConfiramtion"
          name="passwordConfirmation"
          placeholder="Potwierdź hasło"
          required
        />
        <p className="companyData">Dane Do Faktury</p>
        <input
          type="text"
          id="companyName"
          name="companyName"
          placeholder="Nazwa Firmy"
          required
        />
        <input type="number" id="nip" name="nip" placeholder="NIP" required />
        <input
          type="text"
          id="country"
          name="country"
          placeholder="Kraj"
          required
        />
        <input
          type="text"
          id="city"
          name="city"
          placeholder="Miejscowość"
          required
        />
        <input
          type="text"
          id="street"
          name="street"
          placeholder="Ulica i Numer"
          required
        />
        <label htmlFor="regulations">
          <input id="regulations" name="regulations" type="checkbox" required />
          <p>
            Akceptuję <Link href="/regulamin">regulamin</Link> usługi.
          </p>
        </label>
        <label htmlFor="rodo">
          <input id="rodo" name="rodo" type="checkbox" required />
          <p>
            Wyrażam zgodę na przetwarzanie moich danych osobowych przez firmę
            MEGA-TRANS Dawid Możdżanowski, w tym na kontakt telefoniczny oraz
            mailowy, w celu realizacji powierzonych zleceń.
          </p>
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="ripple">
          Zarejestruj
        </button>
      </form>
    </main>
  );
}
