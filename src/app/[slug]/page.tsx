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
    .select("first_name, last_name, sport, photo_path, onboarding_completed_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile?.onboarding_completed_at) {
    return { title: "Not found" };
  }

  const name = displayName(profile.first_name, profile.last_name);
  const description = `${name} on featz — upcoming races and past results${
    profile.sport ? ` in ${profile.sport}` : ""
  }.`;
  const image = photoUrl(profile.photo_path);

  return {
    title: name,
    description,
    openGraph: {
      title: `${name} · featz`,
      description,
      type: "profile",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${name} · featz`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
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
      <main className="flex-1 pb-[100px] sm:pb-[120px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 rounded-lg bg-[rgba(31,30,28,0.5)] p-2 backdrop-blur-[40px] sm:gap-4">
          <section className="relative h-[360px] overflow-hidden rounded-lg bg-surface sm:aspect-[1424/400] sm:h-auto sm:min-h-[320px]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={name}
                fetchPriority="high"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,#0000ff,transparent_45%),#1f1e1c]" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_60%,rgba(0,0,0,0.5)_100%)]" />
            <div className="absolute inset-0 flex flex-col justify-end gap-4 p-4 pb-7 sm:p-6">
              <div className="flex items-center gap-3">
                <h1 className="min-w-0 font-display text-[32px] font-bold uppercase leading-none tracking-[-0.0104em] sm:text-[clamp(32px,4vw,56px)]">
                  {name}
                </h1>
                <ShareButton slug={typed.slug} />
              </div>
              <p className="max-w-full self-start truncate rounded-md bg-[rgba(67,60,60,0.5)] px-2.5 py-1 font-mono text-[12px] uppercase leading-[18px] tracking-[0.0857em] backdrop-blur-[40px]">
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
            <Link href="/dashboard" className="btn btn-ghost h-12 w-full text-[12px]">
              Edit your page
            </Link>
          ) : null}
          <ProfileEvents events={raceEvents} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
