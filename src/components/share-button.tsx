"use client";

import { useState } from "react";

export function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/${slug}`;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ url, title: "featz" });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="grid h-11 w-11 shrink-0 place-items-center rounded bg-[rgba(70,68,68,0.5)] text-text transition-colors hover:bg-[rgba(70,68,68,0.75)]"
      aria-label="Share profile"
    >
      {copied ? (
        <span className="text-[10px] font-bold">OK</span>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 12v8h16v-8" />
          <path d="M12 16V4" />
          <path d="m8 8 4-4 4 4" />
        </svg>
      )}
    </button>
  );
}
