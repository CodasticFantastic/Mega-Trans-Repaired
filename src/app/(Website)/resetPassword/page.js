"use client";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  async function resetPassword(e) {
    setError(false);
    setSuccess(false);
    e.preventDefault();

    const email = e.target[0].value;

    const req = await fetch("/api/resetPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const res = await req.json();

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Wysłano link do zmiany hasła na podany adres email");
    }
  }

  return (
    <main className="ResetPassword">
      <form onSubmit={resetPassword}>
        <h1>Zmień hasło</h1>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" required />
        <button type="submit">Wyślij</button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
