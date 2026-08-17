"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const email = String(formData.get("email") || "");
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    );

    if (resetError) {
      setError(resetError.message);
      setPending(false);
      return;
    }

    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="rounded-lg bg-surface p-6">
        <p className="eyebrow">Check your email</p>
        <p className="mt-4 uppercase leading-relaxed">
          If an account exists for <span className="font-bold">{sentTo}</span>,
          we sent a link to reset your password.
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
      {error ? <p className="text-sm uppercase text-red-400">{error}</p> : null}
      <button
        className="btn btn-accent h-12 w-full text-sm disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Working..." : "Send reset link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input
        className="field"
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="New password"
        autoComplete="new-password"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <input
        className="field"
        name="confirm"
        type="password"
        required
        minLength={6}
        placeholder="Repeat new password"
        autoComplete="new-password"
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
        {pending ? "Working..." : "Set new password"}
      </button>
    </form>
  );
}
