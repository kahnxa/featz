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
    <div className="flex min-h-full flex-col">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-16 px-5 pb-20 pt-28">
        <section>
          <p className="eyebrow">Your page</p>
          <h1 className="mt-3 text-4xl font-medium uppercase tracking-tight">
            Dashboard
          </h1>
          <Link
            href={`/${profile.slug}`}
            className="mt-4 inline-block text-sm uppercase tracking-widest text-accent"
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
