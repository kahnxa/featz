"use client";

import { useState } from "react";
import type { RaceEvent } from "@/lib/types";
import { formatEventDate, formatPosition, isUpcoming } from "@/lib/utils";

const toggleBtn =
  "flex-1 whitespace-nowrap rounded-md px-2 py-2 text-center font-mono text-[12px] uppercase leading-4 tracking-[0.06em] transition-colors sm:min-w-[100px] sm:px-4 sm:text-[14px] sm:leading-[18px]";

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
    <section className="flex flex-col gap-3">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pr-2">
        <div
          className="glass flex w-full gap-2 rounded-lg p-1 sm:inline-flex sm:w-auto"
          role="tablist"
          aria-label="View selector"
        >
          <button
            className={`${toggleBtn} ${
              tab === "upcoming"
                ? "bg-accent text-text"
                : "bg-transparent text-text hover:bg-white/10"
            }`}
            type="button"
            role="tab"
            aria-selected={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`${toggleBtn} ${
              tab === "past"
                ? "bg-accent text-text"
                : "bg-transparent text-text hover:bg-white/10"
            }`}
            type="button"
            role="tab"
            aria-selected={tab === "past"}
            onClick={() => setTab("past")}
          >
            Past results
          </button>
        </div>
        <span className="eyebrow">
          {visible.length} {tab === "upcoming" ? "events upcoming" : "results total"}
        </span>
      </div>
      {visible.length === 0 ? (
        <p className="py-16 text-center font-mono text-[14px] text-text/60">
          NOTHING HERE YET.
        </p>
      ) : (
        <ul className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((event) => (
            <li
              key={event.id}
              className="w-[260px] flex-none snap-start rounded-lg bg-white p-4 text-[#1f1e1c] sm:w-[280px]"
            >
              <p className="text-[16px] font-bold uppercase leading-5 break-words">
                {event.title}
              </p>
              <p className="mt-2 font-mono text-[12px] uppercase leading-[14px] tracking-[0.1em] text-[#1f1e1c]/50">
                {formatEventDate(event.event_date)}
              </p>
              {tab === "past" ? (
                <p className="mt-3 font-mono text-[14px] uppercase leading-[18px] tracking-[0.0857em] text-accent">
                  {[formatPosition(event.position), event.result].filter(Boolean).join(" · ") ||
                    "Result pending"}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
