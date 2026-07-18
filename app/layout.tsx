import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: "lowkey.exe — personal field notes",
    description: "Notes on money, projects, travel, and becoming—inside a tiny retro desktop.",
    icons: { icon: "/og.png" },
    openGraph: {
      title: "lowkey.exe",
      description: "notes on money, projects, travel, and becoming.",
      type: "website",
      images: [{ url: "/og.png", width: 1734, height: 907, alt: "lowkey.exe retro desktop" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "lowkey.exe",
      description: "notes on money, projects, travel, and becoming.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geistMono.variable}>{children}</body></html>;
}
