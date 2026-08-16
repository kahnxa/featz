import type { Metadata, Viewport } from "next";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "featz",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ibm.variable} min-h-dvh antialiased`}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="flex min-h-dvh flex-col bg-bg text-text"
        style={{ fontFamily: "Satoshi, var(--font-satoshi), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
