import Link from "next/link";
import { getSummary, getEventById } from "@/lib/queries";
import { SummaryCard } from "@/components/SummaryCard";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ event?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { event: eventParam } = await searchParams;
  const eventId = eventParam ? Number(eventParam) : null;

  if (!eventId || isNaN(eventId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <svg
          className="mx-auto h-16 w-16 text-nav-icon"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">
          Welcome to Festival Fund Manager
        </h1>
        <p className="mt-2 text-text-muted">
          Please select or create an event to get started.
        </p>
        <Link
          href="/events"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
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

  const summary = await getSummary(eventId);

  return (
    <div>
      {/* Banner Section */}
      <section className="relative overflow-hidden px-4 py-16 text-white md:py-24">
        <div className="absolute inset-0 bg-[url('/images/temple-banner.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-nav-text backdrop-blur-sm">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Festival Fund Manager
          </div>
          <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg md:text-5xl">
            {event.name}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90 drop-shadow-md">
            Track your temple festival income and expenditures with ease.
            Manage donations and expenses all in one place.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="mx-auto mt-8 max-w-6xl px-4">
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
        <h2 className="mb-6 text-xl font-semibold text-text-primary">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/entry?event=${eventId}`}
            className="group flex items-center justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-hover-border hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-accent-light-bg p-3 text-accent-light-text transition-colors group-hover:bg-accent-light-hover">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Add New Entry</p>
                <p className="text-sm text-text-muted">Record income or expenditure</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-text-faint transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href={`/reports?event=${eventId}`}
            className="group flex items-center justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-hover-border hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-accent-light-bg p-3 text-accent-light-text transition-colors group-hover:bg-accent-light-hover">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">View Reports</p>
                <p className="text-sm text-text-muted">Date-wise income & expenditure</p>
              </div>
            </div>
            <svg className="h-5 w-5 text-text-faint transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
