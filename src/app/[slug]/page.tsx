import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileEvents } from "@/components/profile-events";
import { ShareButton } from "@/components/share-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SocialIcons } from "@/components/social-icons";
import { createClient } from "@/lib/supabase/server";
import type { Profile, RaceEvent } from "@/lib/types";
import { displayName, formatEventDate, isUpcoming, photoUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, onboarding_completed_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile?.onboarding_completed_at) {
    return { title: "Not found" };
  }

  return { title: displayName(profile.first_name, profile.last_name) };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed_at) notFound();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("athlete_id", profile.id)
    .order("event_date", { ascending: true });

  const typed = profile as Profile;
  const raceEvents = (events ?? []) as RaceEvent[];
  const nextRace = raceEvents.find((event) => isUpcoming(event.event_date));
  const image = photoUrl(typed.photo_path);
  const name = displayName(typed.first_name, typed.last_name);
  const isOwner = user?.id === typed.id;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} />
      <section className="relative h-[70dvh] min-h-[360px] overflow-hidden bg-surface sm:h-[78dvh] sm:min-h-[420px]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            fetchPriority="high"
            className="h-full w-full object-cover object-[62%_center]"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,#0000ff,transparent_45%),#111]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />
        <div className="absolute inset-x-0 bottom-14 flex items-end justify-between gap-3 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
          <h1 className="min-w-0 flex-1 text-[clamp(2rem,9vw,3.75rem)] font-medium uppercase leading-[0.9] tracking-tight">
            {name}
          </h1>
          <ShareButton slug={typed.slug} />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex min-h-10 items-center justify-center bg-black/70 px-3 py-2">
          <p className="eyebrow max-w-full truncate text-center text-white">
            {nextRace
              ? `Next · ${nextRace.title} · ${formatEventDate(nextRace.event_date)}`
              : typed.sport
                ? typed.sport
                : "Endurance"}
          </p>
        </div>
      </section>
      <SocialIcons profile={typed} />
      {isOwner ? (
        <div className="px-[max(1rem,env(safe-area-inset-left))] pb-4 pr-[max(1rem,env(safe-area-inset-right))]">
          <Link
            href="/dashboard"
            className="btn btn-ghost flex h-12 w-full text-[12px]"
          >
            Edit your page
          </Link>
        </div>
      ) : null}
      <ProfileEvents events={raceEvents} />
      <SiteFooter />
    </div>
  );
}
