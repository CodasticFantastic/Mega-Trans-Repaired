"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function RegisterPage() {
  const { data: session } = useSession();
  const [error, setError] = useState(null);
  const router = useRouter();

  //If there is a logged User, redirect to dashboard
  if (session && session.user) {
    router.push("/dashboard");
  }

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

    if (!User.error) {
      await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } else {
      setError(User.error);
      return;
    }
  }

  return (
    <main className="LoginRegisterPage">
      <form method="POST" onSubmit={handleRegister} className="form">
        <h2>Rejestracja</h2>
        <p className="dimInfo">Posiadasz już konto?</p>
        <a href="/login" className="link" onClick={() => signIn()}>
          Zaloguj się!
        </a>

        <input type="email" id="email" name="email" placeholder="Twój adres email" required />
        <input type="tel" id="phone" name="phone" maxLength={11} minLength={9} placeholder="Telefon (Bez spacji i myślników)" required />
        <input type="password" id="password" name="password" placeholder="Hasło (Minimum 6 znaków)" minLength={6} required />
        <input type="password" id="passwordConfiramtion" name="passwordConfirmation" placeholder="Potwierdź hasło" required />
        <p className="companyData">Dane Do Faktury</p>
        <input type="text" id="companyName" name="companyName" placeholder="Nazwa Firmy" required />
        <input type="text" id="nip" name="nip" placeholder="NIP (Bez spacji i myślników)" required minLength={10} maxLength={10} />
        <input type="text" id="country" name="country" placeholder="Kraj" required />
        <input type="text" id="city" name="city" placeholder="Miejscowość" required />
        <input type="text" id="street" name="street" placeholder="Ulica i Numer" required />
        <label htmlFor="regulations">
          <input id="regulations" name="regulations" type="checkbox" required />
          <p>
            Akceptuję <Link href="/regulamin">regulamin</Link> oraz <Link href="/polityka-prywatnosci">politykę prywatności</Link> serwisu.
          </p>
        </label>
        <label htmlFor="rodo">
          <input id="rodo" name="rodo" type="checkbox" required />
          <p>
            Wyrażam zgodę na przetwarzanie moich danych osobowych przez firmę MEGA-TRANS Dawid Możdżanowski, w tym na kontakt telefoniczny
            oraz mailowy, w celu realizacji powierzonych zleceń (<Link href="/rodo">RODO</Link>).
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
