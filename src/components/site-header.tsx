import Link from "next/link";
import { SiteMark } from "@/components/site-mark";

export function SiteHeader({
  user,
}: {
  user?: { email?: string | null } | null;
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between p-3 sm:p-4">
      <div className="pointer-events-auto glass rounded-2xl px-3 py-2">
        <SiteMark size="sm" />
      </div>
      <div className="pointer-events-auto glass flex items-center gap-1 rounded-2xl px-2 py-1.5">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="eyebrow px-3 py-2 text-white hover:text-white"
            >
              Dashboard
            </Link>
            <form action="/auth/signout" method="post">
              <button className="eyebrow px-3 py-2 text-white" type="submit">
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="eyebrow px-3 py-2 text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn btn-accent rounded-xl px-3 py-2 text-[11px]"
            >
              Join
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
