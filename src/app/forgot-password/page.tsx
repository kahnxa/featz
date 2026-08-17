import { ForgotPasswordForm } from "@/components/password-reset";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(7rem+env(safe-area-inset-top))]">
        <p className="eyebrow">Athlete access</p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-[-0.0104em]">
          Forgot password
        </h1>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
