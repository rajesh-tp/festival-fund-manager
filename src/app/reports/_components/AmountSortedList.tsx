import { type Transaction } from "@/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

type AmountSortedListProps = {
  entries: Transaction[];
};

export function AmountSortedList({ entries }: AmountSortedListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-400 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-400 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-400 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-400 uppercase">
                Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-stone-400 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-stone-400 uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-stone-50/50">
                <td className="whitespace-nowrap px-6 py-3 text-sm text-stone-600">
                  {formatDate(entry.date)}
                </td>
                <td className="px-6 py-3 text-sm font-medium text-stone-800">
                  {entry.name}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.type === "income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {entry.type === "income" ? "Income" : "Expenditure"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.paymentMode === "bank"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {entry.paymentMode === "bank" ? "by bank" : "by cash"}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-stone-500">
                  {entry.description || "-"}
                </td>
                <td
                  className={`whitespace-nowrap px-6 py-3 text-right text-sm font-semibold ${
                    entry.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {entry.type === "income" ? "+" : "-"}
                  {formatCurrency(entry.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-stone-100 md:hidden">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-stone-800">{entry.name}</p>
              <p className="mt-0.5 text-xs text-stone-400">{formatDate(entry.date)}</p>
              {entry.description && (
                <p className="mt-0.5 text-xs text-stone-400">{entry.description}</p>
              )}
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  entry.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {entry.type === "income" ? "+" : "-"}
                {formatCurrency(entry.amount)}
              </p>
              <div className="mt-1 flex gap-1.5">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    entry.type === "income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {entry.type === "income" ? "Income" : "Expenditure"}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    entry.paymentMode === "bank"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {entry.paymentMode === "bank" ? "bank" : "cash"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
