import { getAllEvents, getEventById } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { EventForm } from "./_components/EventForm";
import { EventList } from "./_components/EventList";
import type { Event } from "@/db/schema";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { edit } = await searchParams;
  const events = await getAllEvents();
  const currentUser = await getSessionUser();
  const isSuperadmin = currentUser === "superadmin";

  let editData: Event | undefined;
  if (edit && isSuperadmin) {
    const id = Number(edit);
    if (!isNaN(id)) {
      editData = await getEventById(id);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-stone-800">
        Temple Events
      </h1>

      <EventForm editData={editData} />

      <EventList events={events} isSuperadmin={isSuperadmin} />
    </div>
  );
}
