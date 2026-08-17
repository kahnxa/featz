import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhotoCarousel } from "./photo-carousel";

const PHOTOS = ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"];

describe("PhotoCarousel", () => {
  it("renders all photos with the first prioritized and named", () => {
    render(<PhotoCarousel photos={PHOTOS} name="Xavier Kahn" />);
    const first = screen.getByAltText("Xavier Kahn");
    expect(first).toHaveAttribute("src", PHOTOS[0]);
    expect(document.querySelectorAll("img")).toHaveLength(2);
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

  it("hides dots for a single photo", () => {
    render(<PhotoCarousel photos={[PHOTOS[0]]} name="Xavier Kahn" />);
    expect(
      screen.queryByRole("button", { name: /go to photo/i }),
    ).not.toBeInTheDocument();
  });
});
