import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RaceEvent } from "@/lib/types";
import { ProfileEvents } from "./profile-events";

const rpcMock = vi.hoisted(() => vi.fn(() => Promise.resolve({ error: null })));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ rpc: rpcMock }),
}));

function makeEvent(overrides: Partial<RaceEvent>): RaceEvent {
  return {
    id: Math.random().toString(36).slice(2),
    athlete_id: "athlete-1",
    title: "Some Race",
    event_date: "2026-01-01",
    position: null,
    event_url: null,
    link_clicks: 0,
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

    expect(screen.getByRole("tab", { name: /^past$/i })).toHaveAttribute(
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

    await user.click(screen.getByRole("tab", { name: /^past$/i }));

    expect(screen.getByText("Past Marathon")).toBeInTheDocument();
    expect(screen.getByText("3rd AG · 04:26:54")).toBeInTheDocument();
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

    await user.click(screen.getByRole("tab", { name: /^past$/i }));
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

    await user.click(screen.getByRole("tab", { name: /^past$/i }));
    expect(screen.getByText("Result pending")).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<ProfileEvents events={[]} />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it("shows an event-site link that records the tap", async () => {
    const user = userEvent.setup();
    render(
      <ProfileEvents
        events={[
          makeEvent({
            id: "evt-9",
            title: "Future 10k",
            event_date: "2026-09-01",
            event_url: "https://races.example.com/10k",
          }),
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: /event site/i });
    expect(link).toHaveAttribute("href", "https://races.example.com/10k");
    await user.click(link);
    expect(rpcMock).toHaveBeenCalledWith("track_link_click", {
      event_id: "evt-9",
    });
  });

  it("shows an About tab only when about text exists", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ProfileEvents events={[]} about={null} />);
    expect(screen.queryByRole("tab", { name: /about/i })).not.toBeInTheDocument();

    rerender(
      <ProfileEvents events={[]} about={"Training for a sub-3 marathon."} />,
    );
    await user.click(screen.getByRole("tab", { name: /about/i }));
    expect(
      screen.getByText("Training for a sub-3 marathon."),
    ).toBeInTheDocument();
  });
});
