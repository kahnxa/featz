"use client";

import { useState } from "react";
import type { RaceEvent } from "@/lib/types";
import { formatEventDate, isUpcoming } from "@/lib/utils";

export function ProfileEvents({ events }: { events: RaceEvent[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const upcoming = events.filter((event) => isUpcoming(event.event_date));
  const past = events
    .filter((event) => !isUpcoming(event.event_date))
    .slice()
    .reverse();
  const visible = tab === "upcoming" ? upcoming : past;

  return (
    <section className="px-4 pb-16">
      <div className="grid grid-cols-2 gap-2">
        <button
          className={`h-12 rounded-xl text-[13px] font-semibold uppercase tracking-widest ${
            tab === "upcoming" ? "bg-accent text-white" : "bg-surface-2 text-white"
          }`}
          type="button"
          onClick={() => setTab("upcoming")}
        >
          Upcoming events
        </button>
        <button
          className={`h-12 rounded-xl text-[13px] font-semibold uppercase tracking-widest ${
            tab === "past" ? "bg-accent text-white" : "bg-surface-2 text-white"
          }`}
          type="button"
          onClick={() => setTab("past")}
        >
          Past results
        </button>
      </div>
      <p className="eyebrow mt-6">
        {visible.length} {tab === "upcoming" ? "events upcoming" : "results total"}
      </p>
      <ul className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <li className="rounded-2xl bg-surface p-5 text-muted">Nothing here yet.</li>
        ) : (
          visible.map((event) => (
            <li key={event.id} className="rounded-2xl bg-white p-5 text-black">
              <p className="text-xl font-semibold uppercase leading-tight">
                {event.title}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-black/50">
                {formatEventDate(event.event_date)}
              </p>
              {tab === "past" ? (
                <p className="mt-3 text-sm font-medium uppercase tracking-widest text-accent">
                  {[event.position, event.result].filter(Boolean).join(" · ") ||
                    "Result pending"}
                </p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
