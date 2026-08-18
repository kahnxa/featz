import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Profile } from "@/lib/types";
import { createSupabaseMock, routerMock } from "@/test/mocks";
import { ProfileEditor } from "./profile-editor";

const supabase = createSupabaseMock();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => supabase.client,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-1",
    slug: "user-abc123",
    first_name: "",
    last_name: "",
    age: null,
    weight_kg: null,
    height_cm: null,
    sport: null,
    about: null,
    photo_path: null,
    photo_paths: [],
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    strava_url: null,
    onboarding_completed_at: null,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("First name"), "Xavier");
  await user.type(screen.getByPlaceholderText("Last name"), "Kahn");
  await user.type(screen.getByPlaceholderText("Age"), "24");
}

describe("ProfileEditor onboarding submit", () => {
  beforeEach(() => {
    supabase.state.existingSlugs = new Set();
    supabase.state.profileUpdates = [];
    supabase.state.updateError = null;
    routerMock.push.mockClear();
    routerMock.refresh.mockClear();
  });

  it("publishes a complete profile from name to slug", async () => {
    const user = userEvent.setup();
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /publish page/i }));

    await waitFor(() => {
      expect(supabase.state.profileUpdates).toHaveLength(1);
    });

    const update = supabase.state.profileUpdates[0];
    expect(update.first_name).toBe("Xavier");
    expect(update.last_name).toBe("Kahn");
    expect(update.slug).toBe("xavier-kahn");
    expect(update.age).toBe(24);
    expect(update.sport).toBe("running");
    expect(update.onboarding_completed_at).toBeTruthy();
    expect(routerMock.push).toHaveBeenCalledWith("/dashboard");
  });

  it("converts imperial height and weight to metric", async () => {
    const user = userEvent.setup();
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    await fillRequiredFields(user);
    // defaults are 5 ft 10 in; add weight
    await user.type(screen.getByPlaceholderText("Lbs"), "154");
    await user.click(screen.getByRole("button", { name: /publish page/i }));

    await waitFor(() => {
      expect(supabase.state.profileUpdates).toHaveLength(1);
    });
    const update = supabase.state.profileUpdates[0];
    expect(update.height_cm).toBe(177.8);
    expect(update.weight_kg).toBe(69.9);
  });

  it("accepts metric entry after toggling units", async () => {
    const user = userEvent.setup();
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /use metric/i }));
    await user.type(screen.getByPlaceholderText("Height"), "180");
    await user.type(screen.getByPlaceholderText("Weight"), "70");
    await user.click(screen.getByRole("button", { name: /publish page/i }));

    await waitFor(() => {
      expect(supabase.state.profileUpdates).toHaveLength(1);
    });
    const update = supabase.state.profileUpdates[0];
    expect(update.height_cm).toBe(180);
    expect(update.weight_kg).toBe(70);
  });

  it("suffixes the slug when the natural one is taken", async () => {
    supabase.state.existingSlugs = new Set(["xavier-kahn"]);
    const user = userEvent.setup();
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /publish page/i }));

    await waitFor(() => {
      expect(supabase.state.profileUpdates).toHaveLength(1);
    });
    expect(supabase.state.profileUpdates[0].slug).toBe("xavier-kahn-2");
  });

  it("refuses to claim a reserved route name as slug", async () => {
    const user = userEvent.setup();
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    await fillRequiredFields(user);
    await user.type(screen.getByPlaceholderText("Page URL (optional)"), "dashboard");
    await user.click(screen.getByRole("button", { name: /publish page/i }));

    await waitFor(() => {
      expect(supabase.state.profileUpdates).toHaveLength(1);
    });
    expect(supabase.state.profileUpdates[0].slug).toBe("dashboard-athlete");
  });

  it("builds social links from usernames and nulls out blank fields", async () => {
    const user = userEvent.setup();
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    await fillRequiredFields(user);
    await user.type(screen.getByPlaceholderText("Instagram username"), "xavier");
    await user.type(
      screen.getByPlaceholderText("TikTok username"),
      "https://www.tiktok.com/@xavier.k",
    );
    await user.type(
      screen.getByPlaceholderText("Strava athlete ID or profile link"),
      "12345",
    );
    await user.click(screen.getByRole("button", { name: /publish page/i }));

    await waitFor(() => {
      expect(supabase.state.profileUpdates).toHaveLength(1);
    });
    const update = supabase.state.profileUpdates[0];
    expect(update.instagram_url).toBe("https://instagram.com/xavier");
    expect(update.youtube_url).toBeNull();
    expect(update.tiktok_url).toBe("https://tiktok.com/@xavier.k");
    expect(update.strava_url).toBe("https://www.strava.com/athletes/12345");
  });

  it("prefills social fields with the username from a stored link", () => {
    render(
      <ProfileEditor
        profile={makeProfile({
          instagram_url: "https://instagram.com/xavier",
          youtube_url: "https://youtube.com/@xavier",
        })}
        mode="dashboard"
      />,
    );

    expect(screen.getByPlaceholderText("Instagram username")).toHaveValue("xavier");
    expect(screen.getByPlaceholderText("YouTube handle")).toHaveValue("xavier");
    expect(screen.getByPlaceholderText("TikTok username")).toHaveValue("");
  });

  it("surfaces save errors instead of navigating", async () => {
    supabase.state.updateError = { message: "row-level security violation" };
    const user = userEvent.setup();
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /publish page/i }));

    expect(
      await screen.findByText("row-level security violation"),
    ).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("routes to the public page after a dashboard save", async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditor
        profile={makeProfile({ first_name: "Xavier", last_name: "Kahn", slug: "xavier", age: 24 })}
        mode="dashboard"
      />,
    );

    await user.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith("/xavier");
    });
  });
});
