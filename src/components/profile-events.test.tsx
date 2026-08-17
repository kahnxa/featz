import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RaceEvent } from "@/lib/types";
import { ProfileEvents } from "./profile-events";

function makeEvent(overrides: Partial<RaceEvent>): RaceEvent {
  return {
    id: Math.random().toString(36).slice(2),
    athlete_id: "athlete-1",
    title: "Some Race",
    event_date: "2026-01-01",
    position: null,
    result: null,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("ProfileEvents", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-08-16T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to the upcoming tab when upcoming events exist", () => {
    render(
      <ProfileEvents
        events={[
          makeEvent({ title: "Future 10k", event_date: "2026-09-01" }),
          makeEvent({ title: "Past Marathon", event_date: "2025-02-16" }),
        ]}
      />,
    );

    expect(screen.getByRole("tab", { name: /upcoming/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Future 10k")).toBeInTheDocument();
    expect(screen.queryByText("Past Marathon")).not.toBeInTheDocument();
  });

  it("defaults to past results when nothing is upcoming", () => {
    render(
      <ProfileEvents
        events={[makeEvent({ title: "Past Marathon", event_date: "2025-02-16" })]}
      />,
    );

    expect(screen.getByRole("tab", { name: /past results/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Past Marathon")).toBeInTheDocument();
  });

  it("switches tabs and shows results only on past", async () => {
    const user = userEvent.setup();
    render(
      <ProfileEvents
        events={[
          makeEvent({ title: "Future 10k", event_date: "2026-09-01" }),
          makeEvent({
            title: "Past Marathon",
            event_date: "2025-02-16",
            position: "3rd AG",
            result: "04:26:54",
          }),
        ]}
      />,
    );

    expect(screen.queryByText(/04:26:54/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /past results/i }));

    expect(screen.getByText("Past Marathon")).toBeInTheDocument();
    expect(screen.getByText("3rd AG · 04:26:54")).toBeInTheDocument();
    expect(screen.getByText(/1 results total/i)).toBeInTheDocument();
  });

  it("shows newest past events first", async () => {
    const user = userEvent.setup();
    render(
      <ProfileEvents
        events={[
          makeEvent({ title: "Older Race", event_date: "2024-01-01" }),
          makeEvent({ title: "Newer Race", event_date: "2025-06-01" }),
        ]}
      />,
    );

    await user.click(screen.getByRole("tab", { name: /past results/i }));
    const titles = screen
      .getAllByRole("listitem")
      .map((li) => li.textContent ?? "");
    expect(titles[0]).toContain("Newer Race");
    expect(titles[1]).toContain("Older Race");
  });

  it("shows 'Result pending' when a past race has no result yet", async () => {
    const user = userEvent.setup();
    render(
      <ProfileEvents
        events={[makeEvent({ title: "Past Marathon", event_date: "2025-02-16" })]}
      />,
    );

    await user.click(screen.getByRole("tab", { name: /past results/i }));
    expect(screen.getByText("Result pending")).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<ProfileEvents events={[]} />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });
});
