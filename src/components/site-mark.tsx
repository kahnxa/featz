import Link from "next/link";

export function SiteMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text =
    size === "lg"
      ? "text-7xl sm:text-8xl tracking-tight"
      : size === "sm"
        ? "text-[17px] tracking-tight"
        : "text-[18px] tracking-tight";

  const icon = size === "lg" ? "h-10 w-10" : "h-4 w-4";

  return (
    <Link href="/" className="inline-flex items-center gap-2 text-white">
      <svg
        className={`${icon} shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 14c4-1 6-7 8-11 1.2 3.4 3.4 7.2 8 8-3.8 1.1-6.2 3.8-8 11-1.6-4.6-3.8-7.4-8-8Z"
          fill="#0000ff"
        />
        <path
          d="M12 3c.4 2.8 1.8 6 5.6 7.2C14.6 11.4 12.8 14 12 21c-.8-7-2.6-9.6-5.6-10.8C10.2 9 11.6 5.8 12 3Z"
          fill="white"
        />
      </svg>
      <span className={`${text} font-medium lowercase leading-none`}>featz</span>
    </Link>
  );
}
