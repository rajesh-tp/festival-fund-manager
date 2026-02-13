"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PdfEntry = {
  date: string;
  name: string;
  type: "income" | "expenditure";
  amount: number;
  description: string;
};

type DownloadPdfButtonProps = {
  entries: PdfEntry[];
  summary: {
    totalIncome: number;
    totalExpenditure: number;
    netTotal: number;
  };
  eventName: string;
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString + "T00:00:00"));
}

function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rs. ${formatted}`;
}

function buildPdf(entries: PdfEntry[], summary: DownloadPdfButtonProps["summary"], eventName: string) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(`${eventName} - Transaction Report`, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 28);

  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  const summaryY = 38;
  doc.text(`Total Income: ${formatCurrency(summary.totalIncome)}`, 14, summaryY);
  doc.text(`Total Expenditure: ${formatCurrency(summary.totalExpenditure)}`, 90, summaryY);
  doc.text(`Net Total: ${formatCurrency(summary.netTotal)}`, 170, summaryY);

  const tableData = entries.map((e) => [
    formatDate(e.date),
    e.name,
    e.type === "income" ? "Income" : "Expenditure",
    e.description || "-",
    `${e.type === "income" ? "+" : "-"}${formatCurrency(e.amount)}`,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Date", "Name", "Type", "Description", "Amount"]],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [146, 64, 14],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      4: { halign: "right" },
    },
    alternateRowStyles: { fillColor: [250, 250, 248] },
  });

  return doc;
}

export function DownloadPdfButton({ entries, summary, eventName }: DownloadPdfButtonProps) {
  function handlePreview() {
    const doc = buildPdf(entries, summary, eventName);
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  }

  function handleDownload() {
    const doc = buildPdf(entries, summary, eventName);
    doc.save(`${eventName.toLowerCase().replace(/\s+/g, "-")}-report.pdf`);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePreview}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-700 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Preview
      </button>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download
      </button>
    </div>
  );
}
