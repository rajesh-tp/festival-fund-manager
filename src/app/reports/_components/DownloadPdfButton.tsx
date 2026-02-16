"use client";

type PdfEntry = {
  date: string;
  name: string;
  type: "income" | "expenditure";
  paymentMode: "cash" | "bank";
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getThemeHeaderColor(): string {
  if (typeof document === "undefined") return "#92400e";
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--theme-pdf-header")
    .trim() || "#92400e";
}

function buildReportHtml(
  entries: PdfEntry[],
  summary: DownloadPdfButtonProps["summary"],
  eventName: string,
  autoPrint: boolean,
): string {
  const headerColor = getThemeHeaderColor();
  const rows = entries
    .map((e, i) => {
      const bg = i % 2 === 1 ? "background-color:#fafaf8;" : "";
      const sign = e.type === "income" ? "+" : "-";
      return `<tr style="${bg}">
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;">${formatDate(e.date)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;">${escapeHtml(e.name)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;">${e.type === "income" ? "Income" : "Expenditure"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;">${e.paymentMode === "bank" ? "by bank" : "by cash"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;">${escapeHtml(e.description || "-")}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;text-align:right;">${sign}${formatCurrency(e.amount)}</td>
    </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ml">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(eventName)} - Transaction Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans Malayalam','Malayalam Sangam MN',system-ui,sans-serif; color:#282828; padding:40px; font-size:14px; }
  @media print { body { padding:20px; } .no-print { display:none !important; } }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { background:${headerColor}; color:#fff; padding:10px 12px; text-align:left; font-weight:600; }
  th:last-child { text-align:right; }
</style>
</head>
<body>
<h1 style="font-size:22px;margin-bottom:6px;">${escapeHtml(eventName)} - Transaction Report</h1>
<p style="color:#787878;font-size:12px;margin-bottom:20px;">Generated: ${new Date().toLocaleDateString("en-IN")}</p>
<div style="margin-bottom:24px;display:flex;gap:32px;font-size:14px;">
  <div>Total Income: <strong>${formatCurrency(summary.totalIncome)}</strong></div>
  <div>Total Expenditure: <strong>${formatCurrency(summary.totalExpenditure)}</strong></div>
  <div>Net Total: <strong>${formatCurrency(summary.netTotal)}</strong></div>
</div>
<table>
  <thead><tr><th>Date</th><th>Name</th><th>Type</th><th>Mode</th><th>Description</th><th>Amount</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
${autoPrint ? "<script>window.onload=function(){window.print();}</script>" : ""}
</body>
</html>`;
}

export function DownloadPdfButton({ entries, summary, eventName }: DownloadPdfButtonProps) {
  function handlePreview() {
    const html = buildReportHtml(entries, summary, eventName, false);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  function handleDownload() {
    const html = buildReportHtml(entries, summary, eventName, true);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePreview}
        className="inline-flex items-center gap-2 rounded-lg border border-outline-border px-4 py-2 text-sm font-medium text-accent-text transition-colors hover:bg-outline-hover-bg"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Preview
      </button>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download
      </button>
    </div>
  );
}
