"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RaceEvent } from "@/lib/types";
import {
  formatEventDate,
  formatPosition,
  isUpcoming,
  todayISO,
} from "@/lib/utils";

const DATE_MIN = "1950-01-01";
const DATE_MAX = "2100-12-31";

function isFutureDate(date: string) {
  return Boolean(date) && date > todayISO();
}

export function EventManager({
  athleteId,
  events,
}: {
  athleteId: string;
  events: RaceEvent[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [addDate, setAddDate] = useState("");
  const upcoming = events.filter((event) => isUpcoming(event.event_date));
  const past = events.filter((event) => !isUpcoming(event.event_date));
  const addIsFuture = isFutureDate(addDate);

  async function addEvent(formData: FormData) {
    setError(null);
    const supabase = createClient();
    const title = String(formData.get("title") || "").trim();
    const event_date = String(formData.get("event_date") || "");
    const future = isFutureDate(event_date);
    const position = future
      ? null
      : String(formData.get("position") || "").trim() || null;
    const result = future
      ? null
      : String(formData.get("result") || "").trim() || null;

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
    setAddDate("");
    router.refresh();
  }

  async function saveEvent(id: string, formData: FormData) {
    setError(null);
    const supabase = createClient();
    const title = String(formData.get("title") || "").trim();
    const event_date = String(formData.get("event_date") || "");
    const future = isFutureDate(event_date);
    const position = future
      ? null
      : String(formData.get("position") || "").trim() || null;
    const result = future
      ? null
      : String(formData.get("result") || "").trim() || null;

    const { error: updateError } = await supabase
      .from("events")
      .update({ title, event_date, position, result })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return false;
    }
    router.refresh();
    return true;
  }

  async function removeEvent(id: string) {
    if (!window.confirm("Delete this race?")) return;
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form action={addEvent} className="space-y-3">
        <p className="eyebrow">Add a race</p>
        <input
          className="field"
          name="title"
          required
          placeholder="Event title"
          autoCapitalize="words"
        />
        <input
          className="field"
          name="event_date"
          required
          type="date"
          min={DATE_MIN}
          max={DATE_MAX}
          value={addDate}
          onChange={(event) => setAddDate(event.target.value)}
        />
        <input
          className="field disabled:opacity-40"
          name="position"
          placeholder={addIsFuture ? "Position — after the race" : "Position (past only)"}
          autoCapitalize="none"
          disabled={addIsFuture}
        />
        <input
          className="field disabled:opacity-40"
          name="result"
          placeholder={addIsFuture ? "Result — after the race" : "Result / time (past only)"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="decimal"
          disabled={addIsFuture}
        />
        {error ? <p className="text-sm uppercase text-red-400">{error}</p> : null}
        <button className="btn btn-accent h-12 w-full text-sm" type="submit">
          Add event
        </button>
        <p className="eyebrow">
          {addIsFuture
            ? "Upcoming race — add your position and result after race day."
            : "Leave position and result empty for upcoming races."}
        </p>
      </form>

      <EventList
        title="Upcoming"
        items={upcoming}
        onRemove={removeEvent}
        onSave={saveEvent}
      />
      <EventList
        title="Past"
        items={past}
        onRemove={removeEvent}
        onSave={saveEvent}
      />
    </div>
  );
}

const rowAction =
  "grid h-11 w-11 shrink-0 place-items-center text-text transition-opacity hover:opacity-70";

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3.5 20.5 7 8.5 19l-4.5 1 1-4.5L17 3.5Z" />
      <path d="m14.5 6 3.5 3.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6.5 7 7.5 20h9L17.5 7" />
      <path d="M10 11v5.5M14 11v5.5" />
    </svg>
  );
}

function EventEditForm({
  event,
  onSave,
  onCancel,
}: {
  event: RaceEvent;
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(event.event_date);
  const future = isFutureDate(date);

  return (
    <form action={onSave} className="space-y-2">
      <input
        className="field"
        name="title"
        required
        defaultValue={event.title}
        placeholder="Event title"
        autoCapitalize="words"
      />
      <input
        className="field"
        name="event_date"
        required
        type="date"
        min={DATE_MIN}
        max={DATE_MAX}
        value={date}
        onChange={(changeEvent) => setDate(changeEvent.target.value)}
      />
      <input
        className="field disabled:opacity-40"
        name="position"
        defaultValue={event.position ?? ""}
        placeholder={future ? "Position — after the race" : "Position"}
        autoCapitalize="none"
        disabled={future}
      />
      <input
        className="field disabled:opacity-40"
        name="result"
        defaultValue={event.result ?? ""}
        placeholder={future ? "Result — after the race" : "Result / time"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        inputMode="decimal"
        disabled={future}
      />
      <div className="flex gap-2">
        <button className="btn btn-accent h-11 flex-1 text-[12px]" type="submit">
          Save
        </button>
        <button
          className="btn btn-ghost h-11 flex-1 text-[12px]"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EventList({
  title,
  items,
  onRemove,
  onSave,
}: {
  title: string;
  items: RaceEvent[];
  onRemove: (id: string) => void;
  onSave: (id: string, formData: FormData) => Promise<boolean>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section>
      <p className="eyebrow mb-4">{title}</p>
      {items.length === 0 ? (
        <p className="uppercase text-muted">None yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((event) =>
            editingId === event.id ? (
              <li key={event.id} className="rounded-lg bg-surface p-4 sm:col-span-2">
                <EventEditForm
                  event={event}
                  onCancel={() => setEditingId(null)}
                  onSave={async (formData) => {
                    const saved = await onSave(event.id, formData);
                    if (saved) setEditingId(null);
                  }}
                />
              </li>
            ) : (
              <li
                key={event.id}
                className="relative rounded-lg bg-accent p-4 text-text"
              >
                <div className="min-w-0">
                  <p className="pr-20 text-[16px] font-bold uppercase leading-5 break-words">
                    {event.title}
                  </p>
                  <p className="mt-1 font-mono text-[12px] uppercase leading-[14px] tracking-[0.1em] text-text/60">
                    {formatEventDate(event.event_date)}
                  </p>
                  {event.position || event.result ? (
                    <p className="mt-2 font-mono text-[14px] uppercase leading-[18px] tracking-[0.0857em] text-text">
                      {[formatPosition(event.position), event.result]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
                <div className="absolute right-2 top-2 flex">
                  <button
                    className={rowAction}
                    type="button"
                    aria-label={`Edit ${event.title}`}
                    title="Edit"
                    onClick={() => setEditingId(event.id)}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    className={rowAction}
                    type="button"
                    aria-label={`Delete ${event.title}`}
                    title="Delete"
                    onClick={() => onRemove(event.id)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
