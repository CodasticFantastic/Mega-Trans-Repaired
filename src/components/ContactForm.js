"use client";

import { useRef, useState } from "react";
// import emailjs from "@emailjs/browser";

export default function ContactForm() {
  const [isSend, setIsSend] = useState(false);
  const form = useRef();

//   function handleSubmit(e) {
//     e.preventDefault();

//     emailjs
//       .sendForm(
//         "service_ytydzne",
//         "template_j3xuk75",
//         form.current,
//         process.env.NEXT_PUBLIC_EMAIL_JS_PRIVATE_KEY
//       )
//       .then(
//         (result) => {
//           console.log(result);
//           setIsSend(true);
//         },
//         (error) => {
//           console.log(error);
//         }
//       );
//   }

  return (
    <form
      ref={form}
      className="contactForm"
    //   onSubmit={handleSubmit}
      autoComplete="on"
    >
      <input name="email" type="email" placeholder="Adres Email" required />
      <input name="name" type="text" placeholder="Imię i Nazwisko" required />
      <input name="phone" type="tel" placeholder="Numer Kontaktowy" required />
      <textarea
        name="subject"
        placeholder="Treść Wiadomości"
        required
      ></textarea>
      <label htmlFor="rodo">
        <input id="rodo" name="rodo" type="checkbox" required />
        Wyrażam zgodę na przetwarzanie powyższych danych przez firmę Czystka
        Kostka sp. z o.o. w celu przedstawienia mi oferty.
      </label>
      {isSend === false ? (
        <button type="submit" className="ripple">Proszę o kontakt</button>
      ) : (
        <button type="submit" disabled className="styles.send">
          Wiadomość wysłana
        </button>
      )}
    </form>
  );
}
