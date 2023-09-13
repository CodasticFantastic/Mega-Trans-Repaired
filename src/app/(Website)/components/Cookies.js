"use client";

import { useState } from "react";

export default function Cookies() {
  const [show, setShow] = useState(true);

  function hide() {
    setShow(false);
  }

  return (
    show && (
      <div className="cookies">
        <div className="container">
          <p>
            Nieniejsza strona wykorzystuje pliki Cookies w celach zagwarantowania najwyższego stopnia bezpieczeństwa.
            <br />
            Jeśli nie wyrażasz zgody na ich wykrozystanie, opuść stronę.{" "}
          </p>
          <button onClick={hide}>Rozumiem</button>
        </div>
      </div>
    )
  );
}
