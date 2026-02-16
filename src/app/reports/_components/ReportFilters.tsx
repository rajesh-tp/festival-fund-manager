"use client";

import { useRouter, useSearchParams } from "next/navigation";

const typeFilters = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expenditure", label: "Expenditure" },
];

const paymentModeOptions = [
  { value: "all", label: "All Modes" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
];

const sortOptions = [
  { value: "date-desc", label: "Date \u2193" },
  { value: "date-asc", label: "Date \u2191" },
  { value: "amount-desc", label: "Amount \u2193" },
  { value: "amount-asc", label: "Amount \u2191" },
];

export function ReportFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("type") ?? "all";
  const currentPaymentMode = searchParams.get("paymentMode") ?? "all";
  const currentSortBy = searchParams.get("sortBy") ?? "date";
  const currentSortOrder = searchParams.get("sortOrder") ?? "desc";
  const currentSort = `${currentSortBy}-${currentSortOrder}`;

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    router.push(`/reports${query ? `?${query}` : ""}`);
  }

  function handleFilterChange(value: string) {
    updateParams({ type: value === "all" ? null : value });
  }

  function handlePaymentModeChange(value: string) {
    updateParams({ paymentMode: value === "all" ? null : value });
  }

  function handleSortChange(value: string) {
    const [sortBy, sortOrder] = value.split("-");
    if (sortBy === "date" && sortOrder === "desc") {
      updateParams({ sortBy: null, sortOrder: null });
    } else {
      updateParams({ sortBy, sortOrder });
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentFilter === filter.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-text-secondary border border-border hover:bg-surface-alt"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <select
          value={currentPaymentMode}
          onChange={(e) => handlePaymentModeChange(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary shadow-sm focus:border-focus-border focus:ring-2 focus:ring-focus-ring focus:outline-none"
        >
          {paymentModeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary shadow-sm focus:border-focus-border focus:ring-2 focus:ring-focus-ring focus:outline-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
