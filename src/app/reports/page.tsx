import { getTransactionsGroupedByDate, getSummary } from "@/lib/queries";
import { SummaryBar } from "./_components/SummaryBar";
import { ReportFilters } from "./_components/ReportFilters";
import { DateGroup } from "./_components/DateGroup";

type ReportsPageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { type } = await searchParams;
  const typeFilter =
    type === "income" || type === "expenditure" ? type : undefined;
  const grouped = await getTransactionsGroupedByDate(typeFilter);
  const summary = await getSummary();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-stone-800">
        Transaction Reports
      </h1>

      <SummaryBar
        totalIncome={summary.totalIncome}
        totalExpenditure={summary.totalExpenditure}
        netTotal={summary.netTotal}
      />

      <ReportFilters />

      {grouped.size === 0 ? (
        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-stone-300"
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
          <p className="mt-4 text-stone-500">
            No transactions found.{" "}
            {typeFilter
              ? `No ${typeFilter} entries recorded yet.`
              : "Start by adding your first entry."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Array.from(grouped.entries()).map(([date, data]) => (
            <DateGroup key={date} date={date} data={data} />
          ))}
        </div>
      )}
    </div>
  );
}
