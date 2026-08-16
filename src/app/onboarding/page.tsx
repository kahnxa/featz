import { redirect } from "next/navigation";
import { ProfileEditor } from "@/components/profile-editor";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const stubSlug = `user-${user.id.replaceAll("-", "").slice(0, 12)}`;
    await supabase.from("profiles").insert({
      id: user.id,
      slug: stubSlug,
      first_name: "",
      last_name: "",
    });
    const created = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = created.data;
  }

  if (!profile) {
    throw new Error("Could not create athlete profile.");
  }

  if (profile.onboarding_completed_at) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-20 pt-28">
        <p className="eyebrow">Onboarding</p>
        <h1 className="mt-3 text-4xl font-medium uppercase tracking-tight">
          Build your resume
        </h1>
        <p className="mt-3 text-muted">
          Email, name, age, size, sport, photo, and the links you want shown.
        </p>
        <div className="mt-10">
          <ProfileEditor profile={profile as Profile} mode="onboarding" />
        </div>
      </main>
    </div>
  );
}
