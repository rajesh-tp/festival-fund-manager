"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addTransaction,
  updateTransaction,
  type ActionState,
} from "@/lib/actions";
import { getTodayISO } from "@/lib/utils";
import { toast } from "sonner";
import { type Transaction } from "@/db/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialState: ActionState = { status: "idle", message: "" };

type TransactionFormProps = {
  editData?: Transaction;
  eventId: number;
};

export function TransactionForm({ editData, eventId }: TransactionFormProps) {
  const isEditing = !!editData;
  const action = isEditing ? updateTransaction : addTransaction;

  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      if (isEditing) {
        router.push(`/entry?event=${eventId}`);
      } else {
        formRef.current?.reset();
      }
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.timestamp, state.status, state.message, isEditing, router]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      {editData && <input type="hidden" name="id" value={editData.id} />}
      <input type="hidden" name="eventId" value={eventId} />

      <div className="space-y-5">
        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            key={`date-${editData?.id ?? "new"}`}
            defaultValue={editData?.date ?? getTodayISO()}
            className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
          {state.errors?.date && (
            <p className="mt-1 text-sm text-red-600">{state.errors.date[0]}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Name of Person / Shop <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            key={`name-${editData?.id ?? "new"}`}
            defaultValue={editData?.name ?? ""}
            placeholder="e.g., Rajesh Kumar"
            className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Amount (Rs.) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="1"
            step="any"
            key={`amount-${editData?.id ?? "new"}`}
            defaultValue={editData?.amount ?? ""}
            placeholder="e.g., 5000"
            className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
          {state.errors?.amount && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.amount[0]}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <label className="flex-1">
              <input
                type="radio"
                name="type"
                value="income"
                key={`type-income-${editData?.id ?? "new"}`}
                defaultChecked={editData?.type === "income"}
                className="peer hidden"
              />
              <div className="cursor-pointer rounded-lg border-2 border-stone-200 px-4 py-2.5 text-center text-sm font-medium text-stone-600 transition-all peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700">
                Income
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="type"
                value="expenditure"
                key={`type-exp-${editData?.id ?? "new"}`}
                defaultChecked={editData?.type === "expenditure"}
                className="peer hidden"
              />
              <div className="cursor-pointer rounded-lg border-2 border-stone-200 px-4 py-2.5 text-center text-sm font-medium text-stone-600 transition-all peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700">
                Expenditure
              </div>
            </label>
          </div>
          {state.errors?.type && (
            <p className="mt-1 text-sm text-red-600">{state.errors.type[0]}</p>
          )}
        </div>

        {/* Payment Mode */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Payment Mode <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <label className="flex-1">
              <input
                type="radio"
                name="paymentMode"
                value="cash"
                key={`mode-cash-${editData?.id ?? "new"}`}
                defaultChecked={editData?.paymentMode !== "bank"}
                className="peer hidden"
              />
              <div className="cursor-pointer rounded-lg border-2 border-stone-200 px-4 py-2.5 text-center text-sm font-medium text-stone-600 transition-all peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-700">
                Cash
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="paymentMode"
                value="bank"
                key={`mode-bank-${editData?.id ?? "new"}`}
                defaultChecked={editData?.paymentMode === "bank"}
                className="peer hidden"
              />
              <div className="cursor-pointer rounded-lg border-2 border-stone-200 px-4 py-2.5 text-center text-sm font-medium text-stone-600 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700">
                Bank (GPay, etc.)
              </div>
            </label>
          </div>
          {state.errors?.paymentMode && (
            <p className="mt-1 text-sm text-red-600">{state.errors.paymentMode[0]}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Description / Remarks{" "}
            <span className="text-stone-400">(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            key={`desc-${editData?.id ?? "new"}`}
            defaultValue={editData?.description ?? ""}
            placeholder="e.g., Donation for pooja arrangements"
            className="w-full resize-none rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
          {state.errors?.description && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.description[0]}
            </p>
          )}
        </div>

        {/* Submit + Cancel */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-amber-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-800 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <span className="inline-flex items-center justify-center gap-2">
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
                {isEditing ? "Updating..." : "Adding..."}
              </span>
            ) : isEditing ? (
              "Update Transaction"
            ) : (
              "Add Transaction"
            )}
          </button>
          {isEditing && (
            <Link
              href={`/entry?event=${eventId}`}
              className="flex items-center rounded-lg border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50"
            >
              Cancel
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
