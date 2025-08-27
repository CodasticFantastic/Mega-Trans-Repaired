import { jsPDF } from "jspdf";
import { toPng, toCanvas } from "html-to-image";

// Generowanie Listu Przewozowego
export async function generateWaybillPdf(html: React.RefObject<HTMLDivElement | null>) {
  if (!html.current) {
    console.error("HTML element is null");
    return;
  }

  const image = await toPng(html.current, {
    quality: 0.7,
  });

  const doc = new jsPDF({
    compress: true,
    unit: "mm",
  });

  doc.addImage(image, "PNG", 0, 0, 210, 297);
  doc.save("ListPrzewozowy.pdf");
}

// Generowanie wielu Listów Przewozowych
export async function generateWaybillsPdf(htmlElements: (HTMLDivElement | null)[]) {
  const doc = new jsPDF({
    format: [210, 297],
    compress: true,
    unit: "mm",
  });

  for (let i = 0; i < htmlElements.length; i++) {
    const element = htmlElements[i];
    if (element) {
      const image = await toPng(element, {
        quality: 0.75,
      });
      doc.addImage(image, "PNG", 0, 0, 210, 297);
      if (i !== htmlElements.length - 1) doc.addPage();
    }
  }

  doc.save("ListyPrzewozowe.pdf");
}

// Generowanie Etykiet na paczki
export async function generateLabelsPdf(htmlElements: (HTMLDivElement | null)[]) {
  const doc = new jsPDF({
    format: [100, 150],
    compress: true,
    unit: "mm",
  });

  for (let i = 0; i < htmlElements.length; i++) {
    const element = htmlElements[i];
    if (element) {
      const image = await toPng(element, {
        quality: 0.7,
      });
      doc.addImage(image, "PNG", 0, 5, 100, 140);
      if (i !== htmlElements.length - 1) doc.addPage();
    }
  }

  doc.save("Etykiety.pdf");
}

// Generowanie Pełnej Dokumentacji Transportowej
export async function generateDocumentationPdf(waybillRef: React.RefObject<HTMLDivElement | null>, labelRefs: (HTMLDivElement | null)[]) {
  const doc = new jsPDF({
    format: [210, 297],
    compress: true,
    unit: "mm",
  });

  let labelsCounter = 0;

  // Generowanie Listu Przewozowego
  if (waybillRef.current) {
    const waybill = await toPng(waybillRef.current, {
      quality: 0.75,
    });
    doc.addImage(waybill, "PNG", 0, 0, 210, 297);
    doc.addPage();
  }

  // Generowanie Etykiet na paczki
  for (let i = 0; i < labelRefs.length; i++) {
    const element = labelRefs[i];
    if (element) {
      const image = await toPng(element, {
        quality: 0.75,
      });

      switch (labelsCounter) {
        case 0:
          doc.addImage(image, "PNG", 5, 10, 100, 140);
          labelsCounter++;
          break;
        case 1:
          doc.addImage(image, "PNG", 105, 10, 100, 140);
          labelsCounter++;
          break;
        case 2:
          doc.addImage(image, "PNG", 5, 150, 100, 140);
          labelsCounter++;
          break;
        case 3:
          doc.addImage(image, "PNG", 105, 150, 100, 140);
          labelsCounter = 0;
          doc.addPage();
          break;
      }
    }
  }

  doc.save("Dokumentacja Transportowa.pdf");
}
