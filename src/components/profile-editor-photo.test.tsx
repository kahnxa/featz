import { fireEvent, render, screen } from "@testing-library/react";
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

function makeProfile(): Profile {
  return {
    id: "user-1",
    slug: "user-abc123",
    first_name: "",
    last_name: "",
    age: null,
    weight_kg: null,
    height_cm: null,
    sport: null,
    photo_path: null,
    instagram_url: null,
    youtube_url: null,
    tiktok_url: null,
    strava_url: null,
    onboarding_completed_at: null,
    created_at: "",
    updated_at: "",
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

  it("shows a preview once the photo is processed", async () => {
    preparePhotoMock.mockResolvedValue(
      new File(["jpeg"], "photo.jpg", { type: "image/jpeg" }),
    );
    render(<ProfileEditor profile={makeProfile()} mode="onboarding" />);

    expect(screen.getByText("Tap to upload")).toBeInTheDocument();

    const picked = new File(["raw"], "IMG_1234.HEIC", { type: "image/jpeg" });
    fireEvent.change(photoInput(), { target: { files: [picked] } });

    const img = await screen.findByAltText("");
    expect(img).toHaveAttribute("src", "blob:preview-url");
    expect(screen.queryByText("Tap to upload")).not.toBeInTheDocument();
    expect(preparePhotoMock).toHaveBeenCalledWith(picked);
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
    expect(screen.getByText("Tap to upload")).toBeInTheDocument();
  });
});
