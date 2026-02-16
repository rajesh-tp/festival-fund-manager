"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Event } from "@/db/schema";

type EventSelectorProps = {
  events: Event[];
};

export function EventSelector({ events }: EventSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentEventId = searchParams.get("event") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const eventId = e.target.value;
    if (!eventId) {
      router.push(pathname);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("event", eventId);
    router.push(`${pathname}?${params.toString()}`);
  }

  if (events.length === 0) return null;

  return (
    <select
      value={currentEventId}
      onChange={handleChange}
      className="rounded-lg border-0 bg-nav-active px-3 py-1.5 text-sm font-medium text-nav-text outline-none transition-colors hover:bg-nav-hover focus:ring-2 focus:ring-nav-ring"
    >
      <option value="">Select Event</option>
      {events.map((event) => (
        <option key={event.id} value={event.id}>
          {event.name}
        </option>
      ))}
    </select>
  );
}
