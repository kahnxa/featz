import Link from "next/link";
import { SiteMark } from "@/components/site-mark";

const footerLink =
  "inline-flex min-h-11 items-center font-mono text-[14px] uppercase tracking-[0.0857em] text-text transition-opacity hover:opacity-70";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 sm:pl-8 sm:pr-8 sm:pt-16">
      <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-16">
        <div className="max-w-md">
          <p className="eyebrow mb-4 sm:mb-6">Subscribe for the latest updates.</p>
          <form className="relative" action="/signup">
            <input
              className="field pr-28"
              name="email"
              placeholder="Email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
            />
            <button
              className="absolute right-1.5 top-1/2 inline-flex h-9 -translate-y-1/2 items-center justify-center rounded-md bg-accent px-4 font-mono text-[12px] uppercase tracking-[0.0857em] text-text transition-opacity hover:opacity-90"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
        <div className="sm:pr-8">
          <p className="eyebrow mb-2">Explore</p>
          <ul className="flex flex-col">
            <li>
              <Link href="/for-athletes" className={footerLink}>
                For athletes
              </Link>
            </li>
            <li>
              <Link href="/signup" className={footerLink}>
                Create a page
              </Link>
            </li>
            <li>
              <Link href="/login" className={footerLink}>
                Athlete login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-14 flex flex-col gap-8 overflow-hidden sm:mt-20 sm:flex-row sm:items-end sm:justify-between">
        <SiteMark size="lg" />
        <div className="flex flex-wrap gap-x-8 gap-y-2 pb-1">
          <Link
            href="/terms-of-service"
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-opacity hover:opacity-70"
          >
            Terms of service
          </Link>
          <Link
            href="/privacy-policy"
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition-opacity hover:opacity-70"
          >
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
