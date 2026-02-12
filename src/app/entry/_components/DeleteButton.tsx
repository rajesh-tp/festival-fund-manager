"use client";

import { useTransition } from "react";
import { deleteTransaction } from "@/lib/actions";
import { toast } from "sonner";

type DeleteButtonProps = {
  id: number;
  name: string;
};

export function DeleteButton({ id, name }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = confirm(
      `Are you sure you want to delete the transaction for "${name}"?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 transition-colors hover:text-red-800 disabled:opacity-50"
      title="Delete transaction"
    >
      {isPending ? (
        <svg
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
    </button>
  );
}
