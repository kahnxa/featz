import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibm = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ibm",
});

export const metadata: Metadata = {
  title: {
    default: "featz",
    template: "%s · featz",
  },
  description:
    "A race resume for endurance athletes. Upcoming events and past results, in one page.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ibm.variable} h-full antialiased`}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="flex min-h-full flex-col bg-bg text-text"
        style={{ fontFamily: "Satoshi, var(--font-satoshi), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
