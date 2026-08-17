import Link from "next/link";
import { SiteMark } from "@/components/site-mark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 sm:pl-8 sm:pr-8 sm:pt-16">
      <p className="eyebrow mb-4 sm:mb-6">Subscribe for the latest updates.</p>
      <form className="mb-10 max-w-xl space-y-3 sm:mb-16" action="/signup">
        <input
          className="field"
          name="email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="email"
        />
        <button className="btn btn-accent h-12 w-full text-sm" type="submit">
          Submit
        </button>
      </form>
      <div>
        <p className="eyebrow mb-4">Explore</p>
        <ul className="space-y-3 font-display text-lg font-bold uppercase tracking-wide sm:space-y-2 sm:text-xl">
          <li>
            <Link href="/signup" className="inline-flex min-h-11 items-center">
              Create a page
            </Link>
          </li>
          <li>
            <Link href="/login" className="inline-flex min-h-11 items-center">
              Athlete login
            </Link>
          </li>
        </ul>
      </div>
      <div className="mt-12 overflow-hidden sm:mt-20">
        <SiteMark size="lg" />
      </div>
    </footer>
  );
}
