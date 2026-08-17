"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PhotoError, preparePhoto } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { SPORTS, type Profile, type Sport } from "@/lib/types";
import {
  cmToFeetInches,
  emptyToNull,
  feetInchesToCm,
  isReservedSlug,
  kgToLbs,
  lbsToKg,
  photoUrl,
  slugifyName,
} from "@/lib/utils";

function UnitField({
  unit,
  ...inputProps
}: { unit: string } & React.ComponentProps<"input">) {
  return (
    <div className="relative min-w-0">
      <input {...inputProps} className="field pr-12" />
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[12px] uppercase tracking-[0.1em] text-muted"
      >
        {unit}
      </span>
    </div>
  );
}

export function ProfileEditor({
  profile,
  mode,
}: {
  profile: Profile;
  mode: "onboarding" | "dashboard";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [imperial, setImperial] = useState(true);
  const initialHeight = profile.height_cm
    ? cmToFeetInches(profile.height_cm)
    : { feet: 5, inches: 10 };

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const preview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );

  async function onPhotoChange(file: File | null) {
    if (!file) return;
    setPhotoError(null);
    try {
      setPhotoFile(await preparePhoto(file));
    } catch (photoErr) {
      setPhotoError(
        photoErr instanceof PhotoError
          ? photoErr.message
          : "Couldn't read that photo. Try a different one.",
      );
    }
  }

  async function uniqueSlug(supabase: ReturnType<typeof createClient>, base: string) {
    let candidate = isReservedSlug(base) ? `${base}-athlete` : base;
    for (let i = 0; i < 20; i += 1) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", candidate)
        .maybeSingle();
      if (!data || data.id === profile.id) return candidate;
      candidate = `${base}-${i + 2}`;
    }
    return `${base}-${profile.id.slice(0, 6)}`;
  }

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const first = String(formData.get("first_name") || "").trim();
    const last = String(formData.get("last_name") || "").trim();
    const age = Number(formData.get("age"));
    const sport = String(formData.get("sport") || "") as Sport;
    const slugInput = String(formData.get("slug") || "").trim();

    let height_cm: number | null = null;
    let weight_kg: number | null = null;
    if (imperial) {
      height_cm = feetInchesToCm(
        Number(formData.get("feet") || 0),
        Number(formData.get("inches") || 0),
      );
      weight_kg = lbsToKg(Number(formData.get("lbs") || 0));
    } else {
      height_cm = Number(formData.get("height_cm") || 0) || null;
      weight_kg = Number(formData.get("weight_kg") || 0) || null;
    }

    const slug = await uniqueSlug(
      supabase,
      slugifyName(slugInput || first, slugInput ? "" : last),
    );

    let photo_path = profile.photo_path;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop() || "jpg";
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, photoFile, { upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        setPending(false);
        return;
      }
      photo_path = path;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: first,
        last_name: last,
        slug,
        age: Number.isFinite(age) ? age : null,
        sport: SPORTS.includes(sport) ? sport : null,
        height_cm,
        weight_kg,
        photo_path,
        instagram_url: emptyToNull(String(formData.get("instagram_url") || "")),
        youtube_url: emptyToNull(String(formData.get("youtube_url") || "")),
        tiktok_url: emptyToNull(String(formData.get("tiktok_url") || "")),
        strava_url: emptyToNull(String(formData.get("strava_url") || "")),
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    router.push(mode === "onboarding" ? "/dashboard" : `/${slug}`);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-8">
      <section className="space-y-3">
        <p className="eyebrow">Photo</p>
        <label className="block w-full cursor-pointer overflow-hidden rounded-lg bg-surface">
          <div className="aspect-[4/5] w-full bg-surface-2">
            {preview || profile.photo_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview || photoUrl(profile.photo_path) || ""}
                alt=""
                className="h-full w-full object-cover object-[62%_center]"
              />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center uppercase text-muted">
                Tap to upload
              </div>
            )}
          </div>
          <input
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(event) => onPhotoChange(event.target.files?.[0] || null)}
          />
        </label>
        {photoError ? (
          <p className="text-sm uppercase text-red-400">{photoError}</p>
        ) : null}
        <p className="eyebrow">Tap photo to change</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <input
          className="field"
          name="first_name"
          required
          defaultValue={profile.first_name}
          placeholder="First name"
          autoComplete="given-name"
          autoCapitalize="words"
        />
        <input
          className="field"
          name="last_name"
          required
          defaultValue={profile.last_name}
          placeholder="Last name"
          autoComplete="family-name"
          autoCapitalize="words"
        />
        <input
          className="field"
          name="age"
          type="number"
          inputMode="numeric"
          min={8}
          max={100}
          required
          defaultValue={profile.age ?? ""}
          placeholder="Age"
        />
        <select
          className="field uppercase"
          name="sport"
          required
          defaultValue={profile.sport ?? "running"}
        >
          {SPORTS.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
        <input
          className="field sm:col-span-2"
          name="slug"
          defaultValue={profile.slug.startsWith("user-") ? "" : profile.slug}
          placeholder="Page URL (optional)"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="eyebrow">Body</p>
          <button
            className="inline-flex min-h-11 items-center font-mono text-[12px] uppercase tracking-[0.0857em] text-text transition-opacity hover:opacity-70"
            type="button"
            onClick={() => setImperial((value) => !value)}
          >
            {imperial ? "Use metric" : "Use imperial"}
          </button>
        </div>
        {imperial ? (
          <div key="imperial" className="grid grid-cols-3 gap-2 sm:gap-3">
            <UnitField
              unit="ft"
              name="feet"
              type="number"
              inputMode="numeric"
              min={3}
              max={8}
              defaultValue={initialHeight.feet}
              placeholder="Ft"
            />
            <UnitField
              unit="in"
              name="inches"
              type="number"
              inputMode="numeric"
              min={0}
              max={11}
              defaultValue={initialHeight.inches}
              placeholder="In"
            />
            <UnitField
              unit="lbs"
              name="lbs"
              type="number"
              inputMode="numeric"
              min={50}
              max={500}
              defaultValue={profile.weight_kg ? kgToLbs(profile.weight_kg) : ""}
              placeholder="Lbs"
            />
          </div>
        ) : (
          <div key="metric" className="grid grid-cols-2 gap-3">
            <UnitField
              unit="cm"
              name="height_cm"
              type="number"
              inputMode="decimal"
              defaultValue={profile.height_cm ?? ""}
              placeholder="Height"
            />
            <UnitField
              unit="kg"
              name="weight_kg"
              type="number"
              inputMode="decimal"
              defaultValue={profile.weight_kg ?? ""}
              placeholder="Weight"
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <p className="eyebrow">Socials — only filled links show</p>
        <input
          className="field"
          name="instagram_url"
          inputMode="url"
          defaultValue={profile.instagram_url ?? ""}
          placeholder="Instagram URL"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <input
          className="field"
          name="youtube_url"
          inputMode="url"
          defaultValue={profile.youtube_url ?? ""}
          placeholder="YouTube URL"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <input
          className="field"
          name="tiktok_url"
          inputMode="url"
          defaultValue={profile.tiktok_url ?? ""}
          placeholder="TikTok URL"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <input
          className="field"
          name="strava_url"
          inputMode="url"
          defaultValue={profile.strava_url ?? ""}
          placeholder="Strava URL"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </section>

      {error ? <p className="text-sm uppercase text-red-400">{error}</p> : null}
      <button
        className="btn btn-accent h-12 w-full text-sm"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Saving..."
          : mode === "onboarding"
            ? "Publish page"
            : "Save profile"}
      </button>
    </form>
  );
}
