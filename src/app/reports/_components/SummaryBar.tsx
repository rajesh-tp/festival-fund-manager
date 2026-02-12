import { formatCurrency } from "@/lib/utils";

type SummaryBarProps = {
  totalIncome: number;
  totalExpenditure: number;
  netTotal: number;
};

export function SummaryBar({
  totalIncome,
  totalExpenditure,
  netTotal,
}: SummaryBarProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3">
        <div className="rounded-full bg-green-100 p-1.5">
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-green-600">Total Income</p>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(totalIncome)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3">
        <div className="rounded-full bg-red-100 p-1.5">
          <svg
            className="h-4 w-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 13l-5 5m0 0l-5-5m5 5V6"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-red-600">Total Expenditure</p>
          <p className="text-lg font-bold text-red-700">
            {formatCurrency(totalExpenditure)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3">
        <div className="rounded-full bg-blue-100 p-1.5">
          <svg
            className="h-4 w-4 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-blue-600">Net Total</p>
          <p
            className={`text-lg font-bold ${
              netTotal >= 0 ? "text-blue-700" : "text-red-700"
            }`}
          >
            {formatCurrency(netTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
