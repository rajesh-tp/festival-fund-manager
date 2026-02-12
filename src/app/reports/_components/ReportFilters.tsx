"use client";

import { useRouter, useSearchParams } from "next/navigation";

const filters = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expenditure", label: "Expenditure" },
];

export function ReportFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("type") ?? "all";

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    const query = params.toString();
    router.push(`/reports${query ? `?${query}` : ""}`);
  }

  return (
    <div className="mt-4 flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilterChange(filter.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            currentFilter === filter.value
              ? "bg-amber-700 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
