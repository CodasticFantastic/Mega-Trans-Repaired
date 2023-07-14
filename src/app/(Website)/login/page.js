"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();
  const [error, setError] = useState(null);
  const router = useRouter();

  //If there is a logged User, redirect to dashboard
  if (session && session.user) {
    router.push("/dashboard");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const userData = {
      email: data.get("email"),
      password: data.get("password"),
    };

    const response = await signIn("credentials", {
      email: userData.email,
      password: userData.password,
      redirect: false,
    });

    if (response.error) {
      setError(response.error);
      return;
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="LoginRegisterPage">
      <form method="POST" onSubmit={handleLogin} className="form">
        <h2>Logowanie</h2>
        <p className="dimInfo">Nie masz jeszcze konta?</p>
        <Link href="/register" className="link">
          Zarejestruj się tutaj!
        </Link>

        <input
          type="email"
          id="email"
          name="email"
          placeholder="Twój adres email"
          required
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Twoje hasło"
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="ripple">
          Zaloguj
        </button>

        <p className="dimInfo">Zapomniałeś hasła?</p>
        <Link href="/reset-password" className="link">
          Zresetuj hasło
        </Link>
      </form>
    </main>
  );
}
