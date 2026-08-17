import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Terms of service" };

const SECTIONS = [
  {
    heading: "1. What featz is",
    body: [
      "featz lets athletes create a public page listing their upcoming races and past results. By creating an account or using featz.xyz, you agree to these terms.",
    ],
  },
  {
    heading: "2. Your account",
    body: [
      "You need an account to create a page. Keep your login credentials private — you are responsible for activity that happens under your account. You must provide accurate information and be at least 13 years old to use featz.",
    ],
  },
  {
    heading: "3. Your content",
    body: [
      "You own everything you post: your name, photo, race entries, results, and links. By publishing a page you give featz permission to host and display that content publicly so your page works.",
      "Don't post content that is unlawful, misleading, infringes someone else's rights, or impersonates another person. We may remove content or suspend accounts that break these rules.",
    ],
  },
  {
    heading: "4. Your page is public",
    body: [
      "Published athlete pages are visible to anyone with the link. Don't publish anything you want to keep private.",
    ],
  },
  {
    heading: "5. The service",
    body: [
      "featz is provided as-is, without warranties of any kind. We work to keep the service available and your data safe, but we can't guarantee uninterrupted service, and we may change or discontinue features at any time.",
      "To the fullest extent permitted by law, featz will not be liable for indirect, incidental, or consequential damages arising from your use of the service.",
    ],
  },
  {
    heading: "6. Ending your account",
    body: [
      "You can stop using featz at any time. To delete your account and page, contact us and we'll remove your data.",
    ],
  },
  {
    heading: "7. Changes to these terms",
    body: [
      "We may update these terms as featz evolves. If we make material changes we'll update the date at the top of this page. Continuing to use featz after changes means you accept the updated terms.",
    ],
  },
  {
    heading: "8. Contact",
    body: ["Questions about these terms? Email hello@featz.xyz."],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of service"
      updated="August 17, 2026"
      sections={SECTIONS}
    />
  );
}
