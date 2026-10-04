import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/app/components/LayoutShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Balray Autos | Buy & Sell Cars in South Africa",
  description:
    "Buy and sell cars, bakkies, motorcycles, trucks, machinery and parts across South Africa. Trusted sellers. Real vehicles. Instant contact.",
  metadataBase: new URL("https://balrayautos.co.za"),
  openGraph: {
    title: "Balray Autos | Buy & Sell Cars in South Africa",
    description:
      "Buy and sell cars, bakkies, motorcycles, trucks, machinery and parts across South Africa.",
    url: "https://balrayautos.co.za",
    siteName: "Balray Autos",
    locale: "en_ZA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#F7F8F9] text-[#34414A]">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}