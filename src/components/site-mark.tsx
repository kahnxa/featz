import Link from "next/link";

export function SiteMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text =
    size === "lg"
      ? "text-6xl sm:text-8xl"
      : size === "sm"
        ? "text-[22px]"
        : "text-[24px]";

  return (
    <Link href="/" className="inline-flex items-center text-white">
      <span
        className={`${text} font-display font-bold lowercase leading-none tracking-tight`}
      >
        featz
      </span>
    </Link>
  );
}
