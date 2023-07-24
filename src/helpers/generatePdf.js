import { jsPDF } from "jspdf";
import { toPng, toCanvas } from "html-to-image";

export async function generateWaybill(html) {
  console.log("Generateing Waybill");

  const image = await toPng(html.current, { quality: 0.95 });
  const doc = new jsPDF();

  doc.addImage(image, "JPGG", 0, 0, 210, 297);
  doc.save("ListPrzewozowy.pdf");
}
