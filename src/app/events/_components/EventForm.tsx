"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEvent, updateEvent, type ActionState } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Event } from "@/db/schema";

type EventFormProps = {
  editData?: Event;
};

const initialState: ActionState = { status: "idle", message: "" };

export function EventForm({ editData }: EventFormProps) {
  const isEditing = !!editData;
  const action = isEditing ? updateEvent : createEvent;

  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      if (isEditing) {
        router.push("/events");
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
      className="mb-8 rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        {isEditing ? "Edit Event" : "Create New Event"}
      </h2>

      {isEditing && <input type="hidden" name="id" value={editData.id} />}

      <div className="space-y-4">
        {/* Event Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={editData?.name ?? ""}
            placeholder="e.g., Ayyappa Festival 2026"
            className="w-full rounded-lg border border-border-strong px-4 py-2.5 text-text-heading placeholder:text-text-faint transition-colors focus:border-focus-border focus:ring-2 focus:ring-focus-ring focus:outline-none"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Description <span className="text-text-faint">(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={editData?.description ?? ""}
            placeholder="e.g., Annual festival fund collection and expenses"
            className="w-full resize-none rounded-lg border border-border-strong px-4 py-2.5 text-text-heading placeholder:text-text-faint transition-colors focus:border-focus-border focus:ring-2 focus:ring-focus-ring focus:outline-none"
          />
          {state.errors?.description && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.description[0]}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus:ring-2 focus:ring-focus-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
                {isEditing ? "Updating..." : "Creating..."}
              </span>
            ) : isEditing ? (
              "Update Event"
            ) : (
              "Create Event"
            )}
          </button>

          {isEditing && (
            <a
              href="/events"
              className="rounded-lg border border-border-strong px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
            >
              Cancel
            </a>
          )}
        </div>
      </div>
    </form>
  );
}
