import { type Transaction } from "@/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

type AmountSortedListProps = {
  entries: Transaction[];
};

export function AmountSortedList({ entries }: AmountSortedListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-text-faint uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-surface-alt">
                <td className="whitespace-nowrap px-6 py-3 text-sm text-text-secondary">
                  {formatDate(entry.date)}
                </td>
                <td className="px-6 py-3 text-sm font-medium text-text-primary">
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
                <td className="px-6 py-3 text-sm text-text-muted">
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
      <div className="divide-y divide-border-light md:hidden">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{entry.name}</p>
              <p className="mt-0.5 text-xs text-text-faint">{formatDate(entry.date)}</p>
              {entry.description && (
                <p className="mt-0.5 text-xs text-text-faint">{entry.description}</p>
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
