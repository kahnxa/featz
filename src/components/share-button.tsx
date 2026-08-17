"use client";

import { useState } from "react";

export function ShareButton({
  slug,
  small = false,
}: {
  slug: string;
  small?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/${slug}`;

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
      onClick={copyLink}
      className={`grid shrink-0 place-items-center rounded bg-[rgba(70,68,68,0.5)] text-text transition-colors hover:bg-[rgba(70,68,68,0.75)] ${
        small ? "h-8 w-8" : "h-11 w-11"
      }`}
      aria-label="Copy profile link"
      title="Copy link"
    >
      {copied ? (
        <svg
          viewBox="0 0 24 24"
          className={small ? "h-4 w-4" : "h-5 w-5"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m4.5 12.5 5 5 10-11" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className={small ? "h-4 w-4" : "h-5 w-5"}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.5 13.5a4.4 4.4 0 0 0 6.36.3l3-3a4.4 4.4 0 0 0-6.22-6.22l-1.72 1.71" />
          <path d="M13.5 10.5a4.4 4.4 0 0 0-6.36-.3l-3 3a4.4 4.4 0 0 0 6.22 6.22l1.71-1.71" />
        </svg>
      )}
    </button>
  );
}
