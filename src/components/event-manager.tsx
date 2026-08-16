"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RaceEvent } from "@/lib/types";
import { formatEventDate, isUpcoming } from "@/lib/utils";

export function EventManager({
  athleteId,
  events,
}: {
  athleteId: string;
  events: RaceEvent[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const upcoming = events.filter((event) => isUpcoming(event.event_date));
  const past = events.filter((event) => !isUpcoming(event.event_date));

  async function addEvent(formData: FormData) {
    setError(null);
    const supabase = createClient();
    const title = String(formData.get("title") || "").trim();
    const event_date = String(formData.get("event_date") || "");
    const position = String(formData.get("position") || "").trim() || null;
    const result = String(formData.get("result") || "").trim() || null;

    const { error: insertError } = await supabase.from("events").insert({
      athlete_id: athleteId,
      title,
      event_date,
      position,
      result,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.refresh();
  }

  async function removeEvent(id: string) {
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form action={addEvent} className="space-y-3">
        <p className="eyebrow">Add a race</p>
        <input className="field" name="title" required placeholder="Event title" />
        <input className="field" name="event_date" required type="date" />
        <input className="field" name="position" placeholder="Position (past only)" />
        <input className="field" name="result" placeholder="Result / time (past only)" />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button className="btn btn-accent h-12 w-full text-sm" type="submit">
          Add event
        </button>
        <p className="eyebrow">
          Leave position and result empty for upcoming races.
        </p>
      </form>

      <EventList title="Upcoming" items={upcoming} onRemove={removeEvent} />
      <EventList title="Past results" items={past} onRemove={removeEvent} />
    </div>
  );
}

function EventList({
  title,
  items,
  onRemove,
}: {
  title: string;
  items: RaceEvent[];
  onRemove: (id: string) => void;
}) {
  return (
    <section>
      <p className="eyebrow mb-4">{title}</p>
      {items.length === 0 ? (
        <p className="text-muted">None yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((event) => (
            <li
              key={event.id}
              className="flex items-start justify-between gap-4 rounded-2xl bg-surface p-4"
            >
              <div>
                <p className="text-lg font-medium uppercase">{event.title}</p>
                <p className="eyebrow mt-1">{formatEventDate(event.event_date)}</p>
                {event.position || event.result ? (
                  <p className="mt-2 text-sm uppercase tracking-widest text-accent">
                    {[event.position, event.result].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
              <button
                className="eyebrow text-white"
                type="button"
                onClick={() => onRemove(event.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
