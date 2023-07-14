"use client";

import Image from "next/image";
import redLogoutIcon from "@/images/icons/redLogoutIcon.png";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <div className="logout" onClick={() => signOut()}>
      <Image src={redLogoutIcon} alt="Ikona filtrowania" className="icon" />
      <p className="logoutText">Wyloguj</p>
    </div>
  );
}
