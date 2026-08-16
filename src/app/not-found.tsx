import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
      <div className="text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-4xl font-medium uppercase">Page not found</h1>
        <Link href="/" className="btn btn-accent mt-8 inline-flex h-12 px-6 text-sm">
          Back to featz
        </Link>
      </div>
    </main>
  );
}
