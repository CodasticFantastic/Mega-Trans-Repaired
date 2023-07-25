"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchForPackage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  function trackOrder(e) {
    e.preventDefault();
    router.push(`/trackOrder/${orderId}`);
  }

  return (
    <form className="SearchForPackage" onSubmit={trackOrder}>
      <input type="text" placeholder="Wyszuk przesyłkę" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
      <button type="submit">Szukaj</button>
    </form>
  );
}
