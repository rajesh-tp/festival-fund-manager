import Link from "next/link";
import { getTransactionsGroupedByDate, getSummary, getEventById, type SortField, type SortOrder, type PaymentModeFilter } from "@/lib/queries";
import { SummaryBar } from "./_components/SummaryBar";
import { ReportFilters } from "./_components/ReportFilters";
import { DateGroup } from "./_components/DateGroup";
import { AmountSortedList } from "./_components/AmountSortedList";
import { DownloadPdfButton } from "./_components/DownloadPdfButton";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams: Promise<{ type?: string; sortBy?: string; sortOrder?: string; event?: string; paymentMode?: string }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const eventId = params.event ? Number(params.event) : null;

  if (!eventId || isNaN(eventId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-text-muted">
          Please select an event to view reports.
        </p>
        <Link
          href="/events"
          className="mt-4 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Go to Events
        </Link>
      </div>
    );
  }

  const event = await getEventById(eventId);

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-text-muted">Event not found.</p>
        <Link
          href="/events"
          className="mt-4 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Go to Events
        </Link>
      </div>
    );
  }

  const typeFilter =
    params.type === "income" || params.type === "expenditure" ? params.type : undefined;
  const sortBy: SortField = params.sortBy === "amount" ? "amount" : "date";
  const sortOrder: SortOrder = params.sortOrder === "asc" ? "asc" : "desc";
  const paymentModeFilter: PaymentModeFilter | undefined =
    params.paymentMode === "cash" || params.paymentMode === "bank" ? params.paymentMode : undefined;

  const result = await getTransactionsGroupedByDate(eventId, typeFilter, sortBy, sortOrder, paymentModeFilter);
  const summary = await getSummary(eventId, paymentModeFilter);

  const isEmpty = sortBy === "amount"
    ? !result.sorted || result.sorted.length === 0
    : !result.grouped || result.grouped.size === 0;

  // Collect all entries for PDF export
  const allEntries = sortBy === "amount" && result.sorted
    ? result.sorted
    : result.grouped
      ? Array.from(result.grouped.values()).flatMap((g) => g.entries)
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Transaction Reports
          </h1>
          <p className="mt-1 text-sm text-text-muted">{event.name}</p>
        </div>
        {!isEmpty && (
          <DownloadPdfButton
            entries={allEntries.map((e) => ({
              date: e.date,
              name: e.name,
              type: e.type,
              paymentMode: e.paymentMode,
              amount: e.amount,
              description: e.description ?? "",
            }))}
            summary={summary}
            eventName={event.name}
          />
        )}
      </div>

      <SummaryBar
        totalIncome={summary.totalIncome}
        totalExpenditure={summary.totalExpenditure}
        netTotal={summary.netTotal}
      />

      <ReportFilters />

      {isEmpty ? (
        <div className="mt-8 rounded-xl border border-border bg-surface p-12 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-text-faint"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-text-muted">
            No transactions found.{" "}
            {typeFilter
              ? `No ${typeFilter} entries recorded yet.`
              : "Start by adding your first entry."}
          </p>
        </div>
      ) : (
        <div id="report-content" className="mt-6 space-y-6">
          {sortBy === "amount" && result.sorted ? (
            <AmountSortedList entries={result.sorted} />
          ) : (
            result.grouped && Array.from(result.grouped.entries()).map(([date, data]) => (
              <DateGroup key={date} date={date} data={data} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
