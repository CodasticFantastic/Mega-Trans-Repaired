"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button className="placeOrder" onClick={() => signIn()}>
      Nadaj Przesyłkę
    </button>
  );
}
