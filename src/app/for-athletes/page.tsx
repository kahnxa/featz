import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "For athletes",
  description:
    "One public page for the races you're training for and the results you've earned.",
};

const STEPS = [
  {
    number: "01",
    title: "Create your page",
    body: "Sign up and add your name, sport, and photo.",
  },
  {
    number: "02",
    title: "Add your races",
    body: "Upcoming events, and past results with your position and time.",
  },
  {
    number: "03",
    title: "Share it everywhere",
    body: "One link for your bio, sponsors, teammates, and family.",
  },
];

const FAQS = [
  {
    q: "Is featz free?",
    a: "Yes. Creating your page is free.",
  },
  {
    q: "What sports are supported?",
    a: "Running, cycling, and triathlon today — more sports are on the way.",
  },
  {
    q: "Can I edit my results later?",
    a: "Yes. Add, edit, or remove races any time from your dashboard.",
  },
  {
    q: "Who can see my page?",
    a: "Anyone with your link. You control everything that appears on it.",
  },
];

export default async function ForAthletesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} />
      <main className="relative flex-1 pb-24 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(8rem+env(safe-area-inset-top))] sm:pl-[max(2rem,env(safe-area-inset-left))] sm:pr-[max(2rem,env(safe-area-inset-right))] sm:pt-44">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_80%_0%,rgba(0,0,255,0.25),transparent_55%)]" />
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="eyebrow">For athletes</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,12vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-[-0.0104em] sm:text-7xl">
            Own your record.
          </h1>
          <p className="mt-6 max-w-md text-[17px] uppercase leading-relaxed text-muted sm:text-lg">
            Every race you run tells your story. Put it on one page that&apos;s
            yours.
          </p>
          <Link
            href="/signup"
            className="btn btn-accent mt-10 h-14 w-full px-8 text-sm sm:w-auto sm:min-w-56"
          >
            Join featz
          </Link>

          <div className="mt-24 grid gap-4 sm:mt-32 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="rounded-lg bg-surface p-6">
                <p className="font-mono text-[12px] uppercase leading-[14px] tracking-[0.1em] text-muted">
                  {step.number}
                </p>
                <p className="mt-4 font-display text-2xl font-bold uppercase tracking-[-0.0104em]">
                  {step.title}
                </p>
                <p className="mt-3 uppercase leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 sm:mt-32">
            <p className="eyebrow mb-6">Questions</p>
            <div className="space-y-2">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-lg bg-surface px-6 py-1"
                >
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold uppercase tracking-[-0.0104em] [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span
                      aria-hidden
                      className="font-mono text-xl text-muted transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-5 uppercase leading-relaxed text-muted">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
