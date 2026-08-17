"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteMark } from "@/components/site-mark";

const navLink =
  "inline-flex h-12 items-center whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.0857em] text-text transition-opacity hover:opacity-70 sm:text-[14px]";

export function SiteHeader({
  user,
}: {
  user?: { email?: string | null } | null;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y > 96 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y <= 96) setHidden(false);
      lastY.current = y;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-2 pb-2 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.85)_0%,rgba(0,0,0,0)_100%)] transition-opacity duration-200 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="glass relative flex h-12 shrink-0 items-center rounded-lg px-4">
        <SiteMark size="sm" />
      </div>
      <nav className="glass relative flex h-12 items-center gap-6 rounded-lg px-4 sm:gap-10 sm:px-6">
        {user ? (
          <>
            {pathname !== "/dashboard" ? (
              <Link href="/dashboard" className={navLink}>
                Dashboard
              </Link>
            ) : null}
            <form action="/auth/signout" method="post" className="flex">
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
            <Link href="/signup" className={navLink}>
              Join
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
