import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SocialIcons } from "./social-icons";

describe("SocialIcons", () => {
  it("renders nothing when no links are set", () => {
    const { container } = render(
      <SocialIcons profile={{ instagram_url: null, youtube_url: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders only the filled links", () => {
    render(
      <SocialIcons
        profile={{
          instagram_url: "https://instagram.com/x",
          strava_url: "https://strava.com/athletes/1",
        }}
      />,
    );

    expect(screen.getByLabelText("Instagram")).toHaveAttribute(
      "href",
      "https://instagram.com/x",
    );
    expect(screen.getByLabelText("Strava")).toBeInTheDocument();
    expect(screen.queryByLabelText("YouTube")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("TikTok")).not.toBeInTheDocument();
  });

  it("opens links in a new tab safely", () => {
    render(<SocialIcons profile={{ youtube_url: "https://youtube.com/@x" }} />);
    const link = screen.getByLabelText("YouTube");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});
