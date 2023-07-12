"use client";

export default function SearchForPackage() {
  return (
    <form className="SearchForPackage">
      <input type="text" placeholder="Wyszuk przesyłkę" />
      <button type="submit">Szukaj</button>
    </form>
  );
}
