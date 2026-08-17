import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PhotoError } from "@/lib/image";
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

const preparePhotoMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/image")>();
  return { ...actual, preparePhoto: preparePhotoMock };
});

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

function photoInput() {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("ProfileEditor photo picker", () => {
  beforeEach(() => {
    preparePhotoMock.mockReset();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:preview-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("adds a processed photo with a preview and cover badge", async () => {
    preparePhotoMock.mockResolvedValue(
      new File(["jpeg"], "photo.jpg", { type: "image/jpeg" }),
    );
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    const picked = new File(["raw"], "IMG_1234.HEIC", { type: "image/jpeg" });
    fireEvent.change(photoInput(), { target: { files: [picked] } });

    const img = await screen.findByAltText("");
    expect(img).toHaveAttribute("src", "blob:preview-url");
    expect(screen.getByText("Cover")).toBeInTheDocument();
    expect(preparePhotoMock).toHaveBeenCalledWith(picked);
  });

  it("removes a photo", async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditor
        profile={makeProfile({ photo_paths: ["user-1/a.jpg"] })}
        mode="dashboard"
      />,
    );

    expect(screen.getByText("Cover")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /remove photo/i }));

    await waitFor(() => {
      expect(screen.queryByText("Cover")).not.toBeInTheDocument();
    });
  });

  it("shows photo errors inside the photo section", async () => {
    preparePhotoMock.mockRejectedValue(
      new PhotoError("Photo is too large — keep it under 25 MB."),
    );
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    fireEvent.change(photoInput(), {
      target: { files: [new File(["raw"], "huge.jpg", { type: "image/jpeg" })] },
    });

    expect(
      await screen.findByText("Photo is too large — keep it under 25 MB."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Cover")).not.toBeInTheDocument();
  });
});
