"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEvent, type ActionState } from "@/lib/actions";
import { toast } from "sonner";

const initialState: ActionState = { status: "idle", message: "" };

export function EventForm() {
  const [state, formAction, isPending] = useActionState(
    createEvent,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.timestamp, state.status, state.message]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-stone-800">
        Create New Event
      </h2>

      <div className="space-y-4">
        {/* Event Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="e.g., Ayyappa Festival 2026"
            className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Description <span className="text-stone-400">(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            placeholder="e.g., Annual festival fund collection and expenses"
            className="w-full resize-none rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          />
          {state.errors?.description && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.description[0]}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-amber-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-800 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
              Creating...
            </span>
          ) : (
            "Create Event"
          )}
        </button>
      </div>
    </form>
  );
}
