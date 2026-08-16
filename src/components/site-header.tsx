import Link from "next/link";
import { SiteMark } from "@/components/site-mark";

const navLink =
  "inline-flex min-h-11 items-center whitespace-nowrap px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white sm:px-3";

export function SiteHeader({
  user,
}: {
  user?: { email?: string | null } | null;
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-2 pb-2 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(1rem,env(safe-area-inset-right))] sm:pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto glass shrink-0 rounded-2xl px-3 py-2">
        <SiteMark size="sm" />
      </div>
      <nav className="pointer-events-auto glass flex shrink items-center rounded-2xl px-1 py-1 sm:px-1.5">
        {user ? (
          <>
            <Link href="/dashboard" className={navLink}>
              Dashboard
            </Link>
            <form action="/auth/signout" method="post">
              <button className={navLink} type="submit">
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className={navLink}>
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-xl bg-accent px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white"
            >
              Join
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
