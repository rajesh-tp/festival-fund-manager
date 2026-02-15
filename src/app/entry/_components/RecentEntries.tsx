"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type Transaction } from "@/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { DeleteButton } from "./DeleteButton";

type RecentEntriesProps = {
  entries: Transaction[];
  eventId: number;
};

export function RecentEntries({ entries, eventId }: RecentEntriesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(currentSearch);

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    router.push(`/entry?${params.toString()}`);
  }

  function handleClear() {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/entry?${params.toString()}`);
  }

  if (entries.length === 0 && !currentSearch) {
    return (
      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-stone-500">
          No entries yet. Add your first transaction above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-800">
          {currentSearch ? "Search Results" : "Recent Entries"}
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name..."
            className="w-48 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {currentSearch && (
            <button
              onClick={handleClear}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 && currentSearch && (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className="text-stone-500">
            No entries found matching &ldquo;{currentSearch}&rdquo;.
          </p>
        </div>
      )}

      {entries.length > 0 && <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-stone-500 uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-stone-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-stone-500 uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-stone-500 uppercase">
                Mode
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-stone-500 uppercase">
                Amount
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-stone-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-stone-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-600">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-stone-800">
                  {entry.name}
                </td>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3">
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
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ${
                    entry.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {entry.type === "income" ? "+" : "-"}
                  {formatCurrency(entry.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      href={`/entry?event=${eventId}&edit=${entry.id}`}
                      className="text-amber-700 transition-colors hover:text-amber-900"
                      title="Edit transaction"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                    <DeleteButton id={entry.id} name={entry.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-stone-800">{entry.name}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {formatDate(entry.date)}
                </p>
                {entry.description && (
                  <p className="mt-1 text-xs text-stone-400">
                    {entry.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    entry.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
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
            <div className="mt-3 flex items-center gap-4 border-t border-stone-100 pt-3">
              <Link
                href={`/entry?event=${eventId}&edit=${entry.id}`}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-700 transition-colors hover:text-amber-900"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Link>
              <DeleteButton id={entry.id} name={entry.name} />
            </div>
          </div>
        ))}
      </div>
      </>}
    </div>
  );
}
