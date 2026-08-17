import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/password-reset";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(7rem+env(safe-area-inset-top))]">
        <p className="eyebrow">Athlete access</p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-[-0.0104em]">
          New password
        </h1>
        <div className="mt-8">
          <ResetPasswordForm />
        </div>
      </main>
    </div>
  );
}
