"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";

export default function ApiDocsPage() {
  return (
    <ApiReferenceReact
      configuration={{
        url: "/apiDocs/openapi",
        theme: "default",
        layout: "modern",
        hideDownloadButton: true,
        metaData: { title: "MegaTrans API Dokumentacja" },
        hiddenClients: true,
        hideClientButton: true,
        hideTestRequestButton: true,
        servers: [
          {
            url: "https://megatrans.online/api",
          },
        ],
      }}
    />
  );
}
