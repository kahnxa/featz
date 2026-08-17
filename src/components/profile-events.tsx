"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RaceEvent } from "@/lib/types";
import { formatEventDate, formatPosition, isUpcoming } from "@/lib/utils";

const toggleBtn =
  "flex-1 whitespace-nowrap rounded-md px-2 py-2 text-center font-mono text-[12px] uppercase leading-4 tracking-[0.06em] transition-colors sm:min-w-[100px] sm:flex-none sm:px-4 sm:text-[14px] sm:leading-[18px]";

type Tab = "upcoming" | "past" | "about";

export function ProfileEvents({
  events,
  about,
}: {
  events: RaceEvent[];
  about?: string | null;
}) {
  const upcoming = events.filter((event) => isUpcoming(event.event_date));
  const past = events
    .filter((event) => !isUpcoming(event.event_date))
    .slice()
    .reverse();
  const [tab, setTab] = useState<Tab>(upcoming.length ? "upcoming" : "past");
  const visible = tab === "upcoming" ? upcoming : past;

  function trackLinkClick(eventId: string) {
    // fire-and-forget; never block the navigation
    createClient()
      .rpc("track_link_click", { event_id: eventId })
      .then(undefined, () => {});
  }

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    ...(about ? [{ key: "about" as Tab, label: "About" }] : []),
  ];

  const count =
    tab === "about"
      ? null
      : tab === "upcoming"
        ? `${upcoming.length} ${upcoming.length === 1 ? "upcoming event" : "upcoming events"}`
        : `${past.length} ${past.length === 1 ? "past event" : "past events"}`;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div
          className="glass flex w-full gap-2 rounded-lg p-1 sm:inline-flex sm:w-auto sm:self-start"
          role="tablist"
          aria-label="View selector"
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={`${toggleBtn} ${
                tab === key
                  ? "bg-accent text-text"
                  : "bg-transparent text-text hover:bg-white/10"
              }`}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {count ? <span className="eyebrow sm:pb-1">{count}</span> : null}
      </div>
      {tab === "about" ? (
        <div className="max-w-2xl rounded-lg bg-accent p-5 text-text">
          <p className="uppercase leading-relaxed whitespace-pre-line">{about}</p>
        </div>
      ) : visible.length === 0 ? (
        <p className="py-16 text-center font-mono text-[14px] text-text/60">
          NOTHING HERE YET.
        </p>
      ) : (
        <ul className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((event) => (
            <li
              key={event.id}
              className="w-[calc(50%-4px)] flex-none snap-start rounded-lg bg-accent p-4 text-text sm:w-[280px]"
            >
              <p className="text-[16px] font-bold uppercase leading-5 break-words">
                {event.title}
              </p>
              <p className="mt-2 font-mono text-[12px] uppercase leading-[14px] tracking-[0.1em] text-text/60">
                {formatEventDate(event.event_date)}
              </p>
              {tab === "past" ? (
                <p className="mt-3 font-mono text-[14px] uppercase leading-[18px] tracking-[0.0857em] text-text">
                  {[formatPosition(event.position), event.result]
                    .filter(Boolean)
                    .join(" · ") || "Result pending"}
                </p>
              ) : null}
              {event.event_url ? (
                <a
                  href={event.event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackLinkClick(event.id)}
                  className="mt-3 inline-flex min-h-8 items-center font-mono text-[12px] uppercase tracking-[0.1em] text-text underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  Event site ↗
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
