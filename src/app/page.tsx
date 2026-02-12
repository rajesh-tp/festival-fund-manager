import Link from "next/link";
import { getSummary } from "@/lib/queries";
import { SummaryCard } from "@/components/SummaryCard";

export default async function HomePage() {
  const summary = await getSummary();

  return (
    <div>
      {/* Banner Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 px-4 py-16 text-white md:py-24">
        <div className="absolute inset-0 bg-[url('/images/temple-banner.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-700/50 px-4 py-1.5 text-sm text-amber-200">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Temple Festival Fund
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Festival Fund Manager
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-amber-100">
            Track your temple festival income and expenditures with ease.
            Manage donations and expenses all in one place.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Total Income"
            amount={summary.totalIncome}
            variant="income"
          />
          <SummaryCard
            title="Total Expenditure"
            amount={summary.totalExpenditure}
            variant="expenditure"
          />
          <SummaryCard
            title="Net Total"
            amount={summary.netTotal}
            variant="net"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold text-stone-800">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/entry"
            className="group flex items-center justify-between rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-100 p-3 text-amber-700 transition-colors group-hover:bg-amber-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-stone-800">Add New Entry</p>
                <p className="text-sm text-stone-500">Record income or expenditure</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-stone-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/reports"
            className="group flex items-center justify-between rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-100 p-3 text-amber-700 transition-colors group-hover:bg-amber-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-stone-800">View Reports</p>
                <p className="text-sm text-stone-500">Date-wise income & expenditure</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-stone-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
