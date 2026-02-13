"use client";

import { useState } from "react";
import { deleteEvent, type ActionState } from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";
import type { Event } from "@/db/schema";

type EventListProps = {
  events: Event[];
  isSuperadmin: boolean;
};

export function EventList({ events, isSuperadmin }: EventListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    const result: ActionState = await deleteEvent(id);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setConfirmDeleteId(null);
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-stone-500">
          No events yet. Create your first event above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-stone-800">All Events</h2>

      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-stone-800">{event.name}</h3>
            {event.description && (
              <p className="mt-1 text-sm text-stone-500">
                {event.description}
              </p>
            )}
          </div>

          <div className="ml-4 flex items-center gap-2">
            <Link
              href={`/?event=${event.id}`}
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800"
            >
              Select
            </Link>

            {isSuperadmin && (
              <>
                <Link
                  href={`/events?edit=${event.id}`}
                  className="rounded-lg bg-stone-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  onBlur={() => setConfirmDeleteId(null)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors ${
                    confirmDeleteId === event.id
                      ? "bg-red-700 hover:bg-red-800"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {confirmDeleteId === event.id ? "Confirm" : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
