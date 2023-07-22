import { jsPDF } from "jspdf";
import { toPng, toCanvas } from "html-to-image";

export default async function generatePdf(html) {
  console.log("Generateing PDF");

  const image = await toPng(html.current, { quality: 0.95 });
  const doc = new jsPDF();

//   doc.addImage(image, "JPEG", 5, 22, 200, 160);
  doc.addImage(image, "JPGG", 0, 0, 0, 297)
  doc.save();
}
