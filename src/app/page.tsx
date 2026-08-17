import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

function SampleCard() {
  return (
    <div aria-hidden className="relative">
      <div className="relative overflow-hidden rounded-lg bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/xavier-kahn.jpg"
          alt=""
          className="aspect-[4/5] w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_55%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
          <p className="font-display text-[28px] font-bold uppercase leading-none tracking-[-0.0104em] text-text">
            Xavier Kahn
          </p>
          <p className="self-start rounded-md bg-[rgba(67,60,60,0.5)] px-2.5 py-1 font-mono text-[12px] uppercase leading-[18px] tracking-[0.0857em] text-text backdrop-blur-[40px]">
            Next · The Austin Marathon
          </p>
        </div>
      </div>
      <div className="absolute left-5 top-5 w-[240px] rounded-lg bg-white p-4 text-[#1f1e1c] shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        <p className="text-[15px] font-bold uppercase leading-5">
          Austin Marathon
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase leading-[14px] tracking-[0.1em] text-[#1f1e1c]/50">
          Feb 15, 2026
        </p>
        <p className="mt-2 font-mono text-[13px] uppercase leading-[18px] tracking-[0.0857em] text-accent">
          3433rd · 04:26:54
        </p>
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} />
      <main className="relative flex flex-1 flex-col justify-end pb-12 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(8rem+env(safe-area-inset-top))] sm:pb-16 sm:pl-[max(2rem,env(safe-area-inset-left))] sm:pr-[max(2rem,env(safe-area-inset-right))] sm:pt-44 lg:justify-center lg:pt-[calc(6rem+env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(0,0,255,0.28),transparent_55%)]" />
        <div className="relative grid w-full gap-12 lg:mx-auto lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow">For athletes</p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,12vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-[-0.0104em] sm:text-7xl">
              Your athletic
              <br />
              resume.
            </h1>
            <p className="mt-6 max-w-md text-[17px] uppercase leading-relaxed text-muted sm:text-lg">
              A public page for the events you have coming up and the results
              you want people to see.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="btn btn-accent h-14 w-full px-8 text-sm sm:min-w-56 sm:w-auto"
              >
                Create your page
              </Link>
              <Link
                href="/login"
                className="btn btn-ghost h-14 w-full px-8 text-sm sm:min-w-40 sm:w-auto"
              >
                Log in
              </Link>
            </div>
          </div>
          <div className="hidden lg:block lg:pb-6">
            <SampleCard />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
