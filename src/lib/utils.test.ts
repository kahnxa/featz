import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cmToFeetInches,
  cn,
  displayName,
  emptyToNull,
  feetInchesToCm,
  formatEventDate,
  formatPosition,
  isReservedSlug,
  isUpcoming,
  kgToLbs,
  lbsToKg,
  photoUrl,
  slugifyName,
  todayISO,
} from "./utils";

describe("cn", () => {
  it("joins truthy parts and drops falsy ones", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("slugifyName", () => {
  it("lowercases and hyphenates first + last", () => {
    expect(slugifyName("Xavier", "Kahn")).toBe("xavier-kahn");
  });

  it("strips accents", () => {
    expect(slugifyName("Édouard", "Núñez")).toBe("edouard-nunez");
  });

  it("collapses punctuation and whitespace runs into single hyphens", () => {
    expect(slugifyName("Mary Jane", "O'Brien-Smith")).toBe(
      "mary-jane-o-brien-smith",
    );
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyName("  !!Ana  ", "  Lee!!")).toBe("ana-lee");
  });

  it("falls back to 'athlete' when nothing usable remains", () => {
    expect(slugifyName("!!!", "###")).toBe("athlete");
    expect(slugifyName("", "")).toBe("athlete");
  });

  it("caps length at 48 characters", () => {
    const slug = slugifyName("a".repeat(60), "b".repeat(60));
    expect(slug.length).toBeLessThanOrEqual(48);
  });
});

describe("isReservedSlug", () => {
  it("flags route names an athlete must not claim", () => {
    for (const slug of ["login", "signup", "dashboard", "onboarding", "auth", "api", "admin"]) {
      expect(isReservedSlug(slug)).toBe(true);
    }
  });

  it("allows normal names", () => {
    expect(isReservedSlug("xavier")).toBe(false);
    expect(isReservedSlug("login-athlete")).toBe(false);
  });
});

describe("date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-16T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("todayISO returns the UTC date", () => {
    expect(todayISO()).toBe("2026-08-16");
  });

  it("counts today's race as upcoming", () => {
    expect(isUpcoming("2026-08-16")).toBe(true);
  });

  it("counts tomorrow as upcoming and yesterday as past", () => {
    expect(isUpcoming("2026-08-17")).toBe(true);
    expect(isUpcoming("2026-08-15")).toBe(false);
  });

  it("formats ISO dates without timezone drift", () => {
    expect(formatEventDate("2025-02-16")).toBe("Feb 16, 2025");
    expect(formatEventDate("2026-12-31")).toBe("Dec 31, 2026");
    expect(formatEventDate("2026-01-01")).toBe("Jan 1, 2026");
  });
});

describe("displayName", () => {
  it("joins first and last", () => {
    expect(displayName("Xavier", "Kahn")).toBe("Xavier Kahn");
  });

  it("handles missing parts", () => {
    expect(displayName("Xavier", "")).toBe("Xavier");
    expect(displayName("", "")).toBe("Athlete");
  });
});

describe("photoUrl", () => {
  const url = "https://example.supabase.co";

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null for empty paths", () => {
    expect(photoUrl(null)).toBeNull();
    expect(photoUrl(undefined)).toBeNull();
    expect(photoUrl("")).toBeNull();
  });

  it("passes through absolute and root-relative URLs", () => {
    expect(photoUrl("https://cdn.example.com/me.jpg")).toBe(
      "https://cdn.example.com/me.jpg",
    );
    expect(photoUrl("/local.jpg")).toBe("/local.jpg");
  });

  it("builds a public storage URL for bucket paths", () => {
    expect(photoUrl("user-1/photo.jpg")).toBe(
      `${url}/storage/v1/object/public/avatars/user-1/photo.jpg`,
    );
  });
});

describe("formatPosition", () => {
  it("adds the right ordinal suffix to plain numbers", () => {
    expect(formatPosition("1")).toBe("1st");
    expect(formatPosition("2")).toBe("2nd");
    expect(formatPosition("3")).toBe("3rd");
    expect(formatPosition("4")).toBe("4th");
    expect(formatPosition("21")).toBe("21st");
    expect(formatPosition("42")).toBe("42nd");
    expect(formatPosition("103")).toBe("103rd");
    expect(formatPosition("3433")).toBe("3433rd");
  });

  it("uses 'th' for the 11-13 teens at any scale", () => {
    expect(formatPosition("11")).toBe("11th");
    expect(formatPosition("12")).toBe("12th");
    expect(formatPosition("13")).toBe("13th");
    expect(formatPosition("111")).toBe("111th");
    expect(formatPosition("1012")).toBe("1012th");
  });

  it("leaves non-numeric positions untouched", () => {
    expect(formatPosition("3rd AG")).toBe("3rd AG");
    expect(formatPosition("DNF")).toBe("DNF");
    expect(formatPosition(" 5 ")).toBe("5th");
  });

  it("passes through empty values", () => {
    expect(formatPosition(null)).toBeNull();
    expect(formatPosition("")).toBeNull();
  });
});

describe("emptyToNull", () => {
  it("nulls out blank strings", () => {
    expect(emptyToNull("")).toBeNull();
    expect(emptyToNull("   ")).toBeNull();
  });

  it("trims and keeps content", () => {
    expect(emptyToNull("  https://instagram.com/x  ")).toBe(
      "https://instagram.com/x",
    );
  });
});

describe("unit conversions", () => {
  it("converts feet/inches to cm", () => {
    expect(feetInchesToCm(5, 10)).toBe(177.8);
    expect(feetInchesToCm(6, 0)).toBe(182.9);
  });

  it("converts cm back to feet/inches", () => {
    expect(cmToFeetInches(177.8)).toEqual({ feet: 5, inches: 10 });
    expect(cmToFeetInches(182.9)).toEqual({ feet: 6, inches: 0 });
  });

  it("round-trips common heights", () => {
    for (let feet = 4; feet <= 7; feet += 1) {
      for (let inches = 0; inches < 12; inches += 1) {
        expect(cmToFeetInches(feetInchesToCm(feet, inches))).toEqual({
          feet,
          inches,
        });
      }
    }
  });

  it("converts lbs to kg and back", () => {
    expect(lbsToKg(154)).toBe(69.9);
    expect(kgToLbs(69.9)).toBe(154);
  });

  it("round-trips common race weights", () => {
    for (let lbs = 90; lbs <= 250; lbs += 1) {
      expect(kgToLbs(lbsToKg(lbs))).toBe(lbs);
    }
  });
});
