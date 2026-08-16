# featz

A public race resume for endurance athletes. Upcoming events and past results, one page.

- Domain: `featz.xyz`
- Stack: Next.js, Supabase, Vercel

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` with the Supabase project URL and publishable key.

## Product

Athletes sign up, complete onboarding (name, age, height, weight, sport, photo, socials), then publish a page at `/{slug}` with upcoming races and past results.
