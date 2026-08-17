import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RaceEvent } from "@/lib/types";
import { createSupabaseMock, routerMock } from "@/test/mocks";
import { EventManager } from "./event-manager";

const supabase = createSupabaseMock();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => supabase.client,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

function makeEvent(overrides: Partial<RaceEvent>): RaceEvent {
  return {
    id: "evt-1",
    athlete_id: "user-1",
    title: "Austin Marathon",
    event_date: "2025-02-16",
    position: null,
    event_url: null,
    link_clicks: 0,
    result: "04:26:54",
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("EventManager", () => {
  beforeEach(() => {
    supabase.state.eventInserts = [];
    supabase.state.eventUpdates = [];
    supabase.state.deletedEventIds = [];
    supabase.state.insertError = null;
    supabase.state.updateError = null;
    routerMock.refresh.mockClear();
    vi.unstubAllGlobals();
  });

  it("adds a race with trimmed fields and refreshes", async () => {
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[]} />);

    await user.type(screen.getByPlaceholderText("Event title"), "  Boston Marathon  ");
    const dateInput = document.querySelector('input[name="event_date"]') as HTMLInputElement;
    await user.type(dateInput, "2026-10-01");
    await user.click(screen.getByRole("button", { name: /add event/i }));

    await waitFor(() => {
      expect(supabase.state.eventInserts).toHaveLength(1);
    });
    const insert = supabase.state.eventInserts[0];
    expect(insert).toMatchObject({
      athlete_id: "user-1",
      title: "Boston Marathon",
      event_date: "2026-10-01",
      position: null,
      result: null,
    });
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("shows insert errors", async () => {
    supabase.state.insertError = { message: "date out of range" };
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[]} />);

    await user.type(screen.getByPlaceholderText("Event title"), "Bad Race");
    const dateInput = document.querySelector('input[name="event_date"]') as HTMLInputElement;
    await user.type(dateInput, "2026-10-01");
    await user.click(screen.getByRole("button", { name: /add event/i }));

    expect(await screen.findByText("date out of range")).toBeInTheDocument();
  });

  it("deletes a race after confirmation", async () => {
    vi.stubGlobal("confirm", vi.fn(() => true));
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[makeEvent({})]} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(supabase.state.deletedEventIds).toEqual(["evt-1"]);
    });
  });

  it("disables position and result for future race dates", async () => {
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[]} />);

    const dateInput = document.querySelector('input[name="event_date"]') as HTMLInputElement;
    await user.type(dateInput, "2030-01-01");

    expect(document.querySelector('input[name="position"]')).toBeDisabled();
    expect(document.querySelector('input[name="result"]')).toBeDisabled();

    await user.clear(dateInput);
    await user.type(dateInput, "2020-01-01");

    expect(document.querySelector('input[name="position"]')).toBeEnabled();
    expect(document.querySelector('input[name="result"]')).toBeEnabled();
  });

  it("never saves a position or result for a future race", async () => {
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[]} />);

    const dateInput = document.querySelector('input[name="event_date"]') as HTMLInputElement;
    await user.type(screen.getByPlaceholderText("Event title"), "Future Race");
    await user.type(dateInput, "2020-01-01");
    await user.type(
      document.querySelector('input[name="position"]') as HTMLInputElement,
      "3",
    );
    await user.clear(dateInput);
    await user.type(dateInput, "2030-01-01");
    await user.click(screen.getByRole("button", { name: /add event/i }));

    await waitFor(() => {
      expect(supabase.state.eventInserts).toHaveLength(1);
    });
    expect(supabase.state.eventInserts[0]).toMatchObject({
      title: "Future Race",
      event_date: "2030-01-01",
      position: null,
      result: null,
    });
  });

  it("disables position and result when editing a race to a future date", async () => {
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[makeEvent({})]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByPlaceholderText("Position")).toBeEnabled();

    const editDate = document.querySelectorAll('input[name="event_date"]')[1] as HTMLInputElement;
    await user.clear(editDate);
    await user.type(editDate, "2030-01-01");

    expect(document.querySelectorAll('input[name="position"]')[1]).toBeDisabled();
  });

  it("edits a race and saves updated fields", async () => {
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[makeEvent({})]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const resultInput = screen.getByPlaceholderText("Result / time");
    expect(resultInput).toHaveValue("04:26:54");
    await user.clear(resultInput);
    await user.type(resultInput, "04:20:00");
    await user.type(screen.getByPlaceholderText("Position"), "12th OA");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(supabase.state.eventUpdates).toHaveLength(1);
    });
    expect(supabase.state.eventUpdates[0]).toEqual({
      id: "evt-1",
      payload: {
        title: "Austin Marathon",
        event_date: "2025-02-16",
        position: "12th OA",
        result: "04:20:00",
        event_url: null,
      },
    });
    // edit form closes after save
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /^save$/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("normalizes and saves the event link", async () => {
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[]} />);

    await user.type(screen.getByPlaceholderText("Event title"), "Boston");
    const dateInput = document.querySelector('input[name="event_date"]') as HTMLInputElement;
    await user.type(dateInput, "2026-10-01");
    await user.type(
      screen.getByPlaceholderText("Event link (optional)"),
      "baa.org/boston",
    );
    await user.click(screen.getByRole("button", { name: /add event/i }));

    await waitFor(() => {
      expect(supabase.state.eventInserts).toHaveLength(1);
    });
    expect(supabase.state.eventInserts[0].event_url).toBe(
      "https://baa.org/boston",
    );
  });

  it("shows the link tap count when a link is set", () => {
    render(
      <EventManager
        athleteId="user-1"
        events={[
          makeEvent({ event_url: "https://baa.org/boston", link_clicks: 12 }),
        ]}
      />,
    );
    expect(screen.getByText(/12 link taps/i)).toBeInTheDocument();
  });

  it("cancels an edit without saving", async () => {
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[makeEvent({})]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(supabase.state.eventUpdates).toHaveLength(0);
    expect(screen.getByText("Austin Marathon")).toBeInTheDocument();
  });

  it("keeps the race when confirmation is declined", async () => {
    vi.stubGlobal("confirm", vi.fn(() => false));
    const user = userEvent.setup();
    render(<EventManager athleteId="user-1" events={[makeEvent({})]} />);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(supabase.state.deletedEventIds).toEqual([]);
  });
});
