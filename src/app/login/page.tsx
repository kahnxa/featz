import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(7rem+env(safe-area-inset-top))]">
        <p className="eyebrow">Athlete access</p>
        <h1 className="mt-3 text-4xl font-medium uppercase tracking-tight">
          Log in
        </h1>
        <div className="mt-8">
          <AuthForm mode="login" nextPath={next || "/dashboard"} />
        </div>
      </main>
    </div>
  );
}
