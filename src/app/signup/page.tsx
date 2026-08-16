import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export default function SignupPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pt-28">
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
