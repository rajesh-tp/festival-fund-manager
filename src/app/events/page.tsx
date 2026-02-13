import { getAllEvents } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { EventForm } from "./_components/EventForm";
import { EventList } from "./_components/EventList";

export default async function EventsPage() {
  const events = await getAllEvents();
  const currentUser = await getSessionUser();
  const isSuperadmin = currentUser === "superadmin";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-stone-800">
        Temple Events
      </h1>

      <EventForm />

      <EventList events={events} isSuperadmin={isSuperadmin} />
    </div>
  );
}
