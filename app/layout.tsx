import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.balrayautos.co.za"),
  title: {
    default: "Balray Autos | Buy & Sell Vehicles in South Africa",
    template: "%s | Balray Autos",
  },
  description:
    "South Africa's trusted marketplace for buying and selling cars, bakkies, motorcycles, trucks, machinery, and automotive parts. Find your next vehicle on Balray Autos.",
  keywords: [
    "cars for sale South Africa",
    "bakkies for sale",
    "buy used cars SA",
    "sell my car South Africa",
    "Toyota Hilux for sale",
    "Ford Ranger for sale",
    "BMW for sale South Africa",
    "motorcycles for sale",
    "trucks for sale SA",
    "car marketplace South Africa",
    "Balray Autos",
  ],
  authors: [{ name: "Balray Autos" }],
  creator: "Balray Autos",
  publisher: "Balray Autos",
  applicationName: "Balray Autos",
  category: "automotive",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://www.balrayautos.co.za",
    siteName: "Balray Autos",
    title: "Balray Autos | Buy & Sell Vehicles in South Africa",
    description:
      "South Africa's trusted marketplace for buying and selling cars, bakkies, motorcycles, trucks, machinery, and automotive parts.",
    images: [
      {
        url: "/balray-autos-logo.png",
        width: 1200,
        height: 630,
        alt: "Balray Autos - South African Automotive Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Balray Autos | Buy & Sell Vehicles in South Africa",
    description:
      "South Africa's trusted marketplace for buying and selling vehicles and automotive products.",
    images: ["/balray-autos-logo.png"],
  },
  icons: {
    icon: "/balray-autos-logo.png",
    apple: "/balray-autos-logo.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}