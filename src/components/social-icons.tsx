type Socials = {
  instagram_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  strava_url?: string | null;
};

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-11 w-11 place-items-center text-white transition-opacity hover:opacity-70"
    >
      {children}
    </a>
  );
}

export function SocialIcons({ profile }: { profile: Socials }) {
  const items = [
    profile.instagram_url && (
      <IconLink key="ig" href={profile.instagram_url} label="Instagram">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.4" cy="6.6" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      </IconLink>
    ),
    profile.youtube_url && (
      <IconLink key="yt" href={profile.youtube_url} label="YouTube">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M23 12.2s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C19.1 5.3 12 5.3 12 5.3s-7.1 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 1.7.4 8.8.4 8.8.4s7.1 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7ZM9.8 15.5V8.9l6.2 3.3-6.2 3.3Z" />
        </svg>
      </IconLink>
    ),
    profile.tiktok_url && (
      <IconLink key="tt" href={profile.tiktok_url} label="TikTok">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M14.2 3c.4 2.6 2.1 4.3 4.8 4.7v3.1c-1.6 0-3.1-.5-4.4-1.4v6.4c0 3.6-2.9 6.5-6.6 6.5S1.5 19.4 1.5 15.8c0-3.4 2.6-6.2 5.9-6.5v3.3c-.9.3-1.6 1.1-1.6 2.1 0 1.2 1 2.2 2.2 2.2s2.2-1 2.2-2.2V3h4Z" />
        </svg>
      </IconLink>
    ),
    profile.strava_url && (
      <IconLink key="st" href={profile.strava_url} label="Strava">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M15.4 14.3 12 8.2 8.6 14.3h2.2L12 12.1l1.2 2.2h2.2Zm-6.7 0L12 8.2 4.2 21h4.3l1.6-2.8H6.7l2-3.9Zm6.6 0 2 3.9h-3.4L12 21h4.3l3.5-6.7h-4.5Z" />
        </svg>
      </IconLink>
    ),
  ].filter(Boolean);

  if (!items.length) return null;

  return <div className="flex items-center justify-center gap-3 py-8">{items}</div>;
}
