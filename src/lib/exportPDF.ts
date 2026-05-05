import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportReportToPDF(
  container: HTMLElement,
  options: {
    title?: string;
    period?: string;
    filename?: string;
  } = {}
) {
  const { title = "Relatório de Gestão Política", period = "", filename = "relatorio" } = options;

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("l", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  // Header
  pdf.setFillColor(30, 58, 95);
  pdf.rect(0, 0, pageWidth, 18, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("MANDATO DIGITAL", margin, 12);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(title, pageWidth - margin, 8, { align: "right" });
  if (period) {
    pdf.text(`Período: ${period}`, pageWidth - margin, 13, { align: "right" });
  }

  // Content image
  const contentY = 22;
  const contentHeight = pageHeight - contentY - margin - 8;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const scale = Math.min(1, contentHeight / imgHeight);
  const finalWidth = imgWidth * scale;
  const finalHeight = imgHeight * scale;
  const x = (pageWidth - finalWidth) / 2;

  pdf.addImage(imgData, "PNG", x, contentY, finalWidth, finalHeight);

  // Footer
  const now = new Date().toLocaleString("pt-BR");
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text(`Gerado em ${now} | mandatodigital.com.br`, margin, pageHeight - 5);

  pdf.save(`${filename}.pdf`);
}
