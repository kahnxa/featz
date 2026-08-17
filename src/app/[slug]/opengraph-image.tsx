import { ImageResponse } from "next/og";
import { photoUrl } from "@/lib/utils";

export const alt = "featz athlete page";
export const size = { width: 1200, height: 1000 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let photo: string | null = null;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?slug=eq.${encodeURIComponent(slug)}&select=photo_path,photo_paths,onboarding_completed_at`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      },
    );
    const rows: Array<{
      photo_path: string | null;
      photo_paths: string[] | null;
      onboarding_completed_at: string | null;
    }> = await response.json();
    const row = rows?.[0];
    if (row?.onboarding_completed_at) {
      const path = row.photo_paths?.[0] ?? row.photo_path ?? null;
      photo = path ? photoUrl(path) : null;
    }
  } catch {
    // fall through to the plain background
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#1f1e1c",
        }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={1200}
            height={1000}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 48,
            bottom: 44,
            display: "flex",
            alignItems: "center",
            background: "rgba(31,30,28,0.82)",
            borderRadius: 18,
            padding: "10px 32px 18px",
          }}
        >
          <div
            style={{
              color: "#faf8f5",
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            featz
          </div>
        </div>
      </div>
    ),
    size,
  );
}
