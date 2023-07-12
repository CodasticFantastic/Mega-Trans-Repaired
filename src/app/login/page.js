"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// import { AppDispatch } from "@/redux/store";
// import { useDispatch } from "react-redux";
// import { login } from "@/redux/actions/userStateSlice";

export default function LoginPage() {
  const [error, setError] = useState(null);
  const router = useRouter();
  //   const dispatch: AppDispatch = useDispatch();

  async function handleLogin(event) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const userData = {
      email: data.get("email"),
      password: data.get("password"),
    };
    const response = await fetch("/api/authentication/login", {
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
      dispatch(login(User));
      router.push("/");
    }
  }

  return (
    <main className="LoginRegisterPage">
      <form method="POST" onSubmit={handleLogin} className="form">
        <h2>Logowanie</h2>
        <p className="dimInfo">Nie masz jeszcze konta?</p>
        <Link href="/register" className="link">Zarejestruj się tutaj!</Link>

        {error && <p className={styles.error}>{error}</p>}

        <input type="email" id="email" name="email" placeholder="Twój adres email" />
        <input type="password" id="password" name="password" placeholder="Twoje hasło"/>
        <button type="submit" className="ripple">Zaloguj</button>

        <p className="dimInfo">Zapomniałeś hasła?</p>
        <Link href="/reset-password" className="link">Zresetuj hasło</Link>
      </form>
    </main>
  );
}
