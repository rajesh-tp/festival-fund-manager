import { getRecentEntries, getTransactionById } from "@/lib/queries";
import { TransactionForm } from "./_components/TransactionForm";
import { RecentEntries } from "./_components/RecentEntries";
import { type Transaction } from "@/db/schema";

type EntryPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function EntryPage({ searchParams }: EntryPageProps) {
  const { edit } = await searchParams;
  const recentEntries = await getRecentEntries(10);

  let editData: Transaction | undefined;
  if (edit) {
    const id = Number(edit);
    if (!isNaN(id)) {
      editData = await getTransactionById(id);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-stone-800">
        {editData ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <TransactionForm editData={editData} />

      <RecentEntries entries={recentEntries} />
    </div>
  );
}
