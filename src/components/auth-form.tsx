"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({
  mode,
  nextPath = "/dashboard",
}: {
  mode: "login" | "signup";
  nextPath?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const supabase = createClient();

    const { error: authError } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }

    if (mode === "signup") {
      window.location.href = "/onboarding";
      return;
    }

    window.location.href = nextPath;
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
      />
      <input
        className="field"
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
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
            <Link href="/login" className="text-white">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-white">
              Create a page
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
