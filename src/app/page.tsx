import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} />
      <main className="relative flex flex-1 flex-col justify-end pb-12 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(8rem+env(safe-area-inset-top))] sm:pb-16 sm:pl-[max(2rem,env(safe-area-inset-left))] sm:pr-[max(2rem,env(safe-area-inset-right))] sm:pt-44">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(0,0,255,0.28),transparent_55%)]" />
        <p className="eyebrow relative">For runners, cyclists, and triathletes</p>
        <h1 className="relative mt-5 max-w-3xl font-display text-[clamp(2.6rem,12vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-[-0.0104em] sm:text-7xl">
          Your races.
          <br />
          Your record.
        </h1>
        <p className="relative mt-6 max-w-md text-[17px] uppercase leading-relaxed text-muted sm:text-lg">
          A public page for the events you have coming up and the results you
          want people to see.
        </p>
        <div className="relative mt-10 flex flex-col gap-3 sm:flex-row">
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
      </main>
      <SiteFooter />
    </div>
  );
}
