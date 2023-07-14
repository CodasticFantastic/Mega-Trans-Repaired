"use client";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

export default function SignInButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <button className="placeOrder">
        <Link href="/dashboard">Nadaj Przesyłkę</Link>
      </button>
    );
  }

  return (
    <button className="placeOrder" onClick={() => signIn()}>
      Nadaj Przesyłkę
    </button>
  );
}
