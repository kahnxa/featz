"use client";

import { useState } from "react";
import type { RaceEvent } from "@/lib/types";
import { formatEventDate, isUpcoming } from "@/lib/utils";

export function ProfileEvents({ events }: { events: RaceEvent[] }) {
  const upcoming = events.filter((event) => isUpcoming(event.event_date));
  const past = events
    .filter((event) => !isUpcoming(event.event_date))
    .slice()
    .reverse();
  const [tab, setTab] = useState<"upcoming" | "past">(
    upcoming.length ? "upcoming" : "past",
  );
  const visible = tab === "upcoming" ? upcoming : past;

  return (
    <section className="pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-16">
      <div className="grid grid-cols-2 gap-2">
        <button
          className={`flex min-h-12 items-center justify-center rounded-xl px-2 text-center text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] sm:text-[13px] sm:tracking-widest ${
            tab === "upcoming" ? "bg-accent text-white" : "bg-surface-2 text-white"
          }`}
          type="button"
          onClick={() => setTab("upcoming")}
        >
          <span className="sm:hidden">Upcoming</span>
          <span className="hidden sm:inline">Upcoming events</span>
        </button>
        <button
          className={`flex min-h-12 items-center justify-center rounded-xl px-2 text-center text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] sm:text-[13px] sm:tracking-widest ${
            tab === "past" ? "bg-accent text-white" : "bg-surface-2 text-white"
          }`}
          type="button"
          onClick={() => setTab("past")}
        >
          <span className="sm:hidden">Past</span>
          <span className="hidden sm:inline">Past results</span>
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
            <li key={event.id} className="rounded-2xl bg-white p-4 text-black sm:p-5">
              <p className="text-lg font-semibold uppercase leading-tight break-words sm:text-xl">
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
