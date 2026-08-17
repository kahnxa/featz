import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhotoCarousel } from "./photo-carousel";

const PHOTOS = ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"];

describe("PhotoCarousel", () => {
  it("renders every photo in both mobile and desktop variants", () => {
    render(<PhotoCarousel photos={PHOTOS} name="Xavier Kahn" />);
    expect(screen.getAllByAltText("Xavier Kahn")).toHaveLength(2);
    expect(document.querySelectorAll("img")).toHaveLength(4);
  });

  it("shows a dot per photo and scrolls on tap", async () => {
    const user = userEvent.setup();
    render(<PhotoCarousel photos={PHOTOS} name="Xavier Kahn" />);

    const dots = screen.getAllByRole("button", { name: /go to photo/i });
    expect(dots).toHaveLength(2);

    const track = document.querySelector("div.snap-x") as HTMLDivElement;
    track.scrollTo = vi.fn();
    await user.click(dots[1]);
    expect(track.scrollTo).toHaveBeenCalledWith({
      left: expect.any(Number),
      behavior: "smooth",
    });
  });

  it("shows arrows with the start arrow disabled", () => {
    render(<PhotoCarousel photos={PHOTOS} name="Xavier Kahn" />);
    expect(
      screen.getByRole("button", { name: /previous photo/i }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /^next$/i })).toBeEnabled();
  });

  it("expands a collapsed card into the primary slot on click", async () => {
    const user = userEvent.setup();
    render(
      <PhotoCarousel photos={[...PHOTOS, "https://cdn.example.com/c.jpg"]} name="Xavier Kahn" />,
    );

    const third = screen.getByRole("button", { name: /show photo 3/i });
    expect(third).toHaveStyle({ flexGrow: "0" });
    await user.click(third);
    expect(third).toHaveStyle({ flexGrow: "2" });
    expect(third).toHaveAccessibleName(/next photo/i);
  });

  it("hides dots and arrows for a single photo", () => {
    render(<PhotoCarousel photos={[PHOTOS[0]]} name="Xavier Kahn" />);
    expect(
      screen.queryByRole("button", { name: /go to photo/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /previous photo/i }),
    ).not.toBeInTheDocument();
  });
});
