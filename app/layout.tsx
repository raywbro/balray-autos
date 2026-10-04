import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutShell from "./components/LayoutShell";

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
    "South Africa's trusted marketplace for buying and selling cars, bakkies, motorcycles, trucks, machinery, and automotive parts.",
  keywords: [
    "cars for sale South Africa",
    "bakkies for sale",
    "buy used cars SA",
    "sell my car South Africa",
    "Toyota Hilux for sale",
    "Ford Ranger for sale",
    "BMW for sale South Africa",
    "car marketplace South Africa",
    "Balray Autos",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://www.balrayautos.co.za",
    siteName: "Balray Autos",
    title: "Balray Autos | Buy & Sell Vehicles in South Africa",
    description:
      "South Africa's trusted marketplace for buying and selling vehicles.",
    images: ["/balray-autos-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Balray Autos",
    images: ["/balray-autos-logo.png"],
  },
  icons: {
    icon: "/balray-autos-logo.png",
    apple: "/balray-autos-logo.png",
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
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}