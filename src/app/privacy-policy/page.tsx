import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Privacy policy" };

const SECTIONS = [
  {
    heading: "1. What we collect",
    body: [
      "Account data: your email address and password (stored securely by our authentication provider — we never see your password).",
      "Profile data you choose to add: your name, age, sport, height, weight, photo, social links, and your races and results.",
    ],
  },
  {
    heading: "2. How we use it",
    body: [
      "We use your data for one thing: running featz. Your profile data is displayed on your public page exactly as you entered it. Your email is used to sign you in, confirm your account, and reset your password.",
      "We don't sell your data, and we don't use it for advertising.",
    ],
  },
  {
    heading: "3. What's public",
    body: [
      "Your published athlete page — name, photo, sport, races, results, and any social links you add — is visible to anyone with the link. Your email, password, and account details are never shown publicly.",
    ],
  },
  {
    heading: "4. Where it lives",
    body: [
      "Your data is stored with Supabase, our database and authentication provider, on servers in the United States. Photos you upload are stored in the same infrastructure.",
    ],
  },
  {
    heading: "5. Cookies",
    body: [
      "featz uses cookies only to keep you signed in. No tracking or advertising cookies.",
    ],
  },
  {
    heading: "6. Your choices",
    body: [
      "You can edit or remove anything on your page at any time from your dashboard. To delete your account and all associated data, contact us and we'll take care of it.",
    ],
  },
  {
    heading: "7. Changes",
    body: [
      "If we change this policy we'll update the date at the top of this page.",
    ],
  },
  {
    heading: "8. Contact",
    body: ["Questions about your data? Email hello@featz.xyz."],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      updated="August 17, 2026"
      sections={SECTIONS}
    />
  );
}
