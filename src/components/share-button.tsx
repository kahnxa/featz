"use client";

import { useState } from "react";

export function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="grid h-10 w-10 place-items-center rounded-lg bg-black/55 text-white backdrop-blur-md"
      aria-label="Share profile"
    >
      {copied ? (
        <span className="text-[10px] font-bold">OK</span>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 12v8h16v-8" />
          <path d="M12 16V4" />
          <path d="m8 8 4-4 4 4" />
        </svg>
      )}
    </button>
  );
}
