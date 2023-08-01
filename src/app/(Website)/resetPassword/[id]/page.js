"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function ResetPasswordPageStep2() {
  const token = usePathname().split("/")[2];
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  async function resetPassword(e) {
    setError(false);
    setSuccess(false);
    e.preventDefault();

    const password = e.target[0].value;

    const req = await fetch("/api/resetPassword/newPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, token }),
    });

    const res = await req.json();

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success);
    }
  }

  return (
    <main className="ResetPassword">
      <form onSubmit={resetPassword}>
        <h1>Podaj Nowe Hasło</h1>
        <label htmlFor="password">Nowe Hasło</label>
        <input type="password" name="password" id="password" required />
        <button type="submit">Zmień hasło</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </main>
  );
}
