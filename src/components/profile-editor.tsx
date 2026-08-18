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
  socialUrl,
  socialUsername,
} from "@/lib/utils";

type PhotoEntry = { id: string; path?: string; file?: File; preview: string };

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

function SocialField({ name, ...inputProps }: React.ComponentProps<"input">) {
  const withAt = name !== "strava";
  return (
    <div className="relative min-w-0">
      {withAt ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[16px] text-muted"
        >
          @
        </span>
      ) : null}
      <input
        {...inputProps}
        name={name}
        className={withAt ? "field pl-9" : "field"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
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

  const initialPhotos = useMemo<PhotoEntry[]>(() => {
    const paths = profile.photo_paths?.length
      ? profile.photo_paths
      : profile.photo_path
        ? [profile.photo_path]
        : [];
    return paths.map((path) => ({
      id: path,
      path,
      preview: photoUrl(path) || "",
    }));
  }, [profile.photo_path, profile.photo_paths]);

  const [photos, setPhotos] = useState<PhotoEntry[]>(initialPhotos);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function onPhotosChange(files: FileList | null) {
    if (!files?.length) return;
    setPhotoError(null);
    for (const raw of Array.from(files)) {
      try {
        const file = await preparePhoto(raw);
        const preview = URL.createObjectURL(file);
        setPhotos((prev) => [...prev, { id: preview, file, preview }]);
      } catch (photoErr) {
        setPhotoError(
          photoErr instanceof PhotoError
            ? photoErr.message
            : "Couldn't read that photo. Try a different one.",
        );
      }
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((entry) => entry.id !== id));
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

    const photo_paths: string[] = [];
    for (const [index, entry] of photos.entries()) {
      if (entry.path) {
        photo_paths.push(entry.path);
        continue;
      }
      if (!entry.file) continue;
      const path = `${profile.id}/${Date.now()}-${index}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, entry.file, { upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        setPending(false);
        return;
      }
      photo_paths.push(path);
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
        photo_path: photo_paths[0] ?? null,
        photo_paths,
        about: emptyToNull(String(formData.get("about") || "")),
        instagram_url: socialUrl("instagram", String(formData.get("instagram") || "")),
        youtube_url: socialUrl("youtube", String(formData.get("youtube") || "")),
        tiktok_url: socialUrl("tiktok", String(formData.get("tiktok") || "")),
        strava_url: socialUrl("strava", String(formData.get("strava") || "")),
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
        <p className="eyebrow">Photos</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((entry, index) => (
            <div
              key={entry.id}
              className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.preview}
                alt=""
                className="h-full w-full object-cover object-center"
              />
              {index === 0 ? (
                <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-text">
                  Cover
                </span>
              ) : null}
              <button
                type="button"
                aria-label="Remove photo"
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded bg-black/60 font-mono text-[14px] text-text transition-opacity hover:opacity-70"
                onClick={() => removePhoto(entry.id)}
              >
                ×
              </button>
            </div>
          ))}
          <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-lg bg-surface text-center uppercase text-muted transition-colors hover:bg-surface-2">
            + Add photo
            <input
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                onPhotosChange(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {photoError ? (
          <p className="text-sm uppercase text-red-400">{photoError}</p>
        ) : null}
        <p className="eyebrow">The first photo is your cover.</p>
      </section>

      <section className="space-y-3">
        <p className="eyebrow">About</p>
        <textarea
          className="field min-h-32 resize-y"
          name="about"
          defaultValue={profile.about ?? ""}
          placeholder="What are you training for? Describe your goals."
          rows={4}
        />
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
        <p className="eyebrow">Socials — usernames only, we build the links</p>
        <SocialField
          name="instagram"
          defaultValue={socialUsername(profile.instagram_url)}
          placeholder="Instagram username"
        />
        <SocialField
          name="youtube"
          defaultValue={socialUsername(profile.youtube_url)}
          placeholder="YouTube handle"
        />
        <SocialField
          name="tiktok"
          defaultValue={socialUsername(profile.tiktok_url)}
          placeholder="TikTok username"
        />
        <SocialField
          name="strava"
          defaultValue={socialUsername(profile.strava_url)}
          placeholder="Strava athlete ID or profile link"
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
