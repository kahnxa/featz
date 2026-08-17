export const SPORTS = ["running", "cycling", "triathlon"] as const;
export type Sport = (typeof SPORTS)[number];

export const RESERVED_SLUGS = [
  "login",
  "signup",
  "dashboard",
  "onboarding",
  "auth",
  "api",
  "logout",
  "featz",
  "admin",
  "forgot-password",
  "reset-password",
  "for-athletes",
  "terms-of-service",
  "privacy-policy",
] as const;

export type Profile = {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  sport: Sport | null;
  photo_path: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  strava_url: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RaceEvent = {
  id: string;
  athlete_id: string;
  title: string;
  event_date: string;
  position: string | null;
  result: string | null;
  created_at: string;
  updated_at: string;
};
