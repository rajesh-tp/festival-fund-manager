import { type DateGroupData } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

type DateGroupProps = {
  date: string;
  data: DateGroupData;
};

export function DateGroup({ date, data }: DateGroupProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* Date Header */}
      <div className="border-b border-border-light bg-surface-alt px-4 py-3 sm:px-6">
        <h3 className="text-sm font-semibold text-text-secondary">
          {formatDate(date)}
        </h3>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light">
              <th className="px-6 py-2.5 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Name
              </th>
              <th className="px-6 py-2.5 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Type
              </th>
              <th className="px-6 py-2.5 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Mode
              </th>
              <th className="px-6 py-2.5 text-left text-xs font-medium tracking-wider text-text-faint uppercase">
                Description
              </th>
              <th className="px-6 py-2.5 text-right text-xs font-medium tracking-wider text-text-faint uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {data.entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-surface-alt">
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
        {data.entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{entry.name}</p>
              {entry.description && (
                <p className="mt-0.5 text-xs text-text-faint">
                  {entry.description}
                </p>
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

      {/* Date Subtotals */}
      <div className="flex flex-wrap gap-4 border-t border-border bg-surface-alt px-4 py-3 sm:px-6">
        {data.incomeTotal > 0 && (
          <p className="text-sm">
            <span className="text-text-muted">Income: </span>
            <span className="font-semibold text-green-600">
              +{formatCurrency(data.incomeTotal)}
            </span>
          </p>
        )}
        {data.expenditureTotal > 0 && (
          <p className="text-sm">
            <span className="text-text-muted">Expenditure: </span>
            <span className="font-semibold text-red-600">
              -{formatCurrency(data.expenditureTotal)}
            </span>
          </p>
        )}
        <p className="text-sm">
          <span className="text-text-muted">Net: </span>
          <span
            className={`font-semibold ${
              data.incomeTotal - data.expenditureTotal >= 0
                ? "text-blue-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(data.incomeTotal - data.expenditureTotal)}
          </span>
        </p>
      </div>
    </div>
  );
}
