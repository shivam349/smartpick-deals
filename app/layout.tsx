import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DisclosureBar } from "@/components/disclosure-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JsonLd, generateWebsiteSchema, generateOrganizationSchema } from "@/components/json-ld";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://smartpick-dealss.vercel.app";

export const metadata: Metadata = {
  title: "SmartPick — Best Deals, Reviews & Comparisons",
  description: "Compare products, discover genuine deals, and find the best tech products with independent research.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    title: "SmartPick — Best Deals & Reviews",
    description: "Independent product comparisons, buying guides and live deals.",
    url: siteUrl,
    siteName: "SmartPick",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartPick — Best Deals & Reviews",
    description: "Independent product comparisons, buying guides and live deals.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#fafafa] text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900`}>
        <DisclosureBar />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <JsonLd data={generateWebsiteSchema()} />
        <JsonLd data={generateOrganizationSchema()} />
      </body>
    </html>
  );
}
