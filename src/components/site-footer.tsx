import Link from "next/link";
import { SiteMark } from "@/components/site-mark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 px-5 pb-10 pt-16 sm:px-8">
      <p className="eyebrow mb-6">Subscribe for the latest updates.</p>
      <form className="mb-16 max-w-xl space-y-3" action="/signup">
        <input className="field" name="email" placeholder="Email" type="email" />
        <button className="btn btn-accent h-12 w-full text-sm" type="submit">
          Submit
        </button>
      </form>
      <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-xl font-semibold uppercase tracking-wide">
            <li>
              <Link href="/signup">Create a page</Link>
            </li>
            <li>
              <Link href="/login">Athlete login</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Company</p>
          <ul className="space-y-2 text-xl font-semibold uppercase tracking-wide">
            <li>
              <span className="text-white/40">Careers</span>
            </li>
          </ul>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="eyebrow mb-4">Social</p>
          <ul className="space-y-2 text-xl font-semibold uppercase tracking-wide">
            <li>
              <span className="text-white/40">Instagram ↗</span>
            </li>
            <li>
              <span className="text-white/40">X ↗</span>
            </li>
            <li>
              <span className="text-white/40">TikTok ↗</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-20">
        <SiteMark size="lg" />
      </div>
    </footer>
  );
}
