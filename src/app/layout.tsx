import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Condensed, Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-roboto-condensed",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
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
  themeColor: "#1f1e1c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoCondensed.variable} ${robotoMono.variable} min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-bg font-sans text-text">
        {children}
      </body>
    </html>
  );
}
