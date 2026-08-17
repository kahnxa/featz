"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function friendlyAuthError(message: string) {
  if (/email not confirmed/i.test(message)) {
    return "Your email isn't confirmed yet. Check your inbox for the confirmation link.";
  }
  if (/invalid login credentials/i.test(message)) {
    return "Wrong email or password.";
  }
  return message;
}

export function AuthForm({
  mode,
  nextPath = "/dashboard",
}: {
  mode: "login" | "signup";
  nextPath?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (authError) {
        setError(friendlyAuthError(authError.message));
        setPending(false);
        return;
      }

      if (!data.session) {
        // Email confirmation is required. Supabase obfuscates duplicate
        // signups by returning a user with no identities.
        if (data.user && data.user.identities?.length === 0) {
          setError("An account with this email already exists. Log in instead.");
        } else {
          setConfirmEmail(email);
        }
        setPending(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(friendlyAuthError(authError.message));
      setPending(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  if (confirmEmail) {
    return (
      <div className="rounded-lg bg-surface p-6">
        <p className="eyebrow">Check your email</p>
        <p className="mt-4 uppercase leading-relaxed">
          We sent a confirmation link to{" "}
          <span className="font-bold">{confirmEmail}</span>. Open it to activate
          your account — it will take you straight to onboarding.
        </p>
        <p className="eyebrow mt-6">
          Nothing arriving? Check spam, or try signing up again.
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input
        className="field"
        name="email"
        type="email"
        required
        placeholder="Email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        inputMode="email"
      />
      <input
        className="field"
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      {error ? <p className="text-sm uppercase text-red-400">{error}</p> : null}
      <button
        className="btn btn-accent h-12 w-full text-sm disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Working..." : mode === "signup" ? "Create account" : "Log in"}
      </button>
      <p className="eyebrow pt-4 text-center">
        {mode === "signup" ? (
          <>
            Already have a page?{" "}
            <Link href="/login" className="text-text">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-text">
              Create a page
            </Link>
            {" · "}
            <Link href="/forgot-password" className="text-text">
              Forgot password
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
