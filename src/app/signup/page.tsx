import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export default function SignupPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(7rem+env(safe-area-inset-top))]">
        <p className="eyebrow">Start your resume</p>
        <h1 className="mt-3 text-4xl font-medium uppercase tracking-tight">
          Create a page
        </h1>
        <div className="mt-8">
          <AuthForm mode="signup" nextPath="/onboarding" />
        </div>
      </main>
    </div>
  );
}
