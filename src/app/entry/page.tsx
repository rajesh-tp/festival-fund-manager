import Link from "next/link";
import { getRecentEntries, getTransactionById } from "@/lib/queries";
import { getAllUsers } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { TransactionForm } from "./_components/TransactionForm";
import { RecentEntries } from "./_components/RecentEntries";
import { SuperadminPanel } from "./_components/SuperadminPanel";
import { type Transaction } from "@/db/schema";

export const dynamic = "force-dynamic";

type EntryPageProps = {
  searchParams: Promise<{ edit?: string; event?: string }>;
};

export default async function EntryPage({ searchParams }: EntryPageProps) {
  const { edit, event: eventParam } = await searchParams;
  const eventId = eventParam ? Number(eventParam) : null;

  if (!eventId || isNaN(eventId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-stone-500">
          Please select an event to add transactions.
        </p>
        <Link
          href="/events"
          className="mt-4 inline-block rounded-lg bg-amber-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
        >
          Go to Events
        </Link>
      </div>
    );
  }

  const recentEntries = await getRecentEntries(eventId, 10);
  const currentUser = await getSessionUser();
  const isSuperadmin = currentUser === "superadmin";

  let editData: Transaction | undefined;
  if (edit) {
    const id = Number(edit);
    if (!isNaN(id)) {
      editData = await getTransactionById(id);
    }
  }

  const otherUsers = isSuperadmin ? await getAllUsers() : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-stone-800">
        {editData ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <TransactionForm editData={editData} eventId={eventId} />

      <RecentEntries entries={recentEntries} eventId={eventId} />

      {isSuperadmin && <SuperadminPanel users={otherUsers} eventId={eventId} />}
    </div>
  );
}
