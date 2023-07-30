"use client";

import Link from "next/link";
import Image from "next/image";
import redBackIcon from "@/images/icons/redBackIcon.png";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function ClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (session) {
      getClients();
    }
  }, [session]);

  // Get all clients from database
  async function getClients() {
    const request = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/user/getUsers`, {
      method: "GET",
      headers: {
        Authorization: session?.accessToken,
        "Content-Type": "application/json",
      },
    });

    const response = await request.json();

    if (response.error) {
      signOut();
    } else if (response.users) {
      setClients(
        response.users.map((user) => {
          return (
            <div className="user" key={user.id}>
              <div className="userId">
                <p>{user.id}</p>
              </div>
              <div className="companyName">
                <p>{user.company}</p>
              </div>
              <div className="companyNip">
                <p>{user.nip}</p>
              </div>
              <div className="companyEmail">
                <p>{user.email}</p>
              </div>
              <div className="companyPhone">
                <p>{user.phone}</p>
              </div>
              <div className="companyAddress">
                <p>
                  {user.address}, {user.city} - {user.country}
                </p>
              </div>
              <div className="userRole">
                <p>{user.role}</p>
              </div>
            </div>
          );
        })
      );
    }
  }

  return (
    <div className="ClientsPage">
      <header className="CRMHeader">
        <Link href="/dashboard" className="backToDashboard">
          <Image src={redBackIcon} alt="Powrót do ekranu głównego" />
          <p>Powrót do pulpitu</p>
        </Link>
        <h1>Klienci</h1>
      </header>
      <main>
        <div className="usersSection">
          <div className="stageName">
            <p>Zarejestrowani Klienci</p>
          </div>
          <div className="users">
            <div className="tableHeader">
              <div className="userId">
                <p>ID</p>
              </div>
              <div className="companyName">
                <p>Nazwa Firmy</p>
              </div>
              <div className="companyNip">
                <p>NIP</p>
              </div>
              <div className="companyEmail">
                <p>Email</p>
              </div>
              <div className="companyPhone">
                <p>Telefon</p>
              </div>
              <div className="companyAddress">
                <p>Adres</p>
              </div>
              <div className="userRole">
                <p>Rola</p>
              </div>
            </div>
            {clients}
          </div>
        </div>
      </main>
    </div>
  );
}
