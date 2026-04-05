import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://www.flatscouts.com";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ScoutFlats — PGs, Flats & Rooms for Rent in Bangalore",
  description:
    "ScoutFlats lists verified PGs, rental flats, and rooms in shared apartments across Bangalore. Compare prices, amenities, and neighbourhoods—top PG chains and independent landlords, zero brokerage.",
  keywords: [
    "PG in Bangalore",
    "PG near me Bangalore",
    "flats for rent Bangalore",
    "paying guest Bangalore",
    "shared rooms Bangalore",
    "flatmate Bangalore",
    "rental apartment Bangalore",
    "no brokerage PG Bangalore",
    "PG chains Bangalore",
    "Koramangala PG",
    "HSR PG",
    "Whitefield flats rent",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ScoutFlats — PGs, Flats & Rooms for Rent in Bangalore",
    description:
      "Search rental homes in Bangalore: PGs, flats, and shared rooms across chains and independent landlords. Compare listings by area, price, and amenities.",
    url: siteUrl,
    siteName: "ScoutFlats",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScoutFlats — PGs, Flats & Rooms in Bangalore",
    description:
      "Compare PGs, flats, and shared rooms in Bangalore. Zero brokerage.",
    images: ["/twitter-card.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF6B2B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body className={`${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
