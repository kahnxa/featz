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
    <div className="flex min-h-full flex-col">
      <SiteHeader user={user} />
      <main className="relative flex flex-1 flex-col justify-end px-5 pb-16 pt-36 sm:px-8 sm:pt-44">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(0,0,255,0.28),transparent_55%)]" />
        <p className="eyebrow relative">For runners, cyclists, and triathletes</p>
        <h1 className="relative mt-5 max-w-3xl text-5xl font-medium uppercase leading-[0.92] tracking-tight sm:text-7xl">
          Your races.
          <br />
          Your record.
        </h1>
        <p className="relative mt-6 max-w-md text-lg text-muted">
          A public page for the events you have coming up and the results you
          want people to see.
        </p>
        <div className="relative mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="btn btn-accent h-14 px-8 text-sm sm:min-w-56"
          >
            Create your page
          </Link>
          <Link
            href="/login"
            className="btn btn-ghost h-14 px-8 text-sm sm:min-w-40"
          >
            Log in
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
