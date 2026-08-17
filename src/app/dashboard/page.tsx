import Link from "next/link";
import { redirect } from "next/navigation";
import { EventManager } from "@/components/event-manager";
import { ProfileEditor } from "@/components/profile-editor";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import type { Profile, RaceEvent } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("athlete_id", user.id)
    .order("event_date", { ascending: true });

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-16 px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(5rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(7rem+env(safe-area-inset-top))]">
        <section>
          <p className="eyebrow">Your page</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,9vw,2.5rem)] font-bold uppercase tracking-[-0.0104em]">
            Dashboard
          </h1>
          <Link
            href={`/${profile.slug}`}
            className="mt-4 inline-flex min-h-11 items-center font-mono text-[14px] uppercase tracking-[0.0857em] text-text transition-opacity hover:opacity-70"
          >
            View live page →
          </Link>
        </section>
        <EventManager
          athleteId={user.id}
          events={(events ?? []) as RaceEvent[]}
        />
        <ProfileEditor profile={profile as Profile} mode="dashboard" />
      </main>
    </div>
  );
}
