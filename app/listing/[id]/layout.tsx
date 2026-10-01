import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const SITE_URL = "https://www.balrayautos.co.za";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data: listing } = await supabase
    .from("listings")
    .select("make, model, year, price, location, description, images, category, mileage")
    .eq("id", id)
    .single();

  if (!listing) {
    return {
      title: "Listing Not Found",
      description: "This listing may have been removed or sold.",
    };
  }

  const title = `${listing.year ? listing.year + " " : ""}${listing.make} ${listing.model}`;
  const priceFormatted = `R${Number(listing.price).toLocaleString()}`;
  const description = `${title} for sale at ${priceFormatted} in ${listing.location}. ${
    listing.mileage ? `Mileage: ${listing.mileage}. ` : ""
  }${listing.description?.substring(0, 120)}...`;

  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : `${SITE_URL}/balray-autos-logo.png`;

  return {
    title: `${title} for Sale in ${listing.location}`,
    description: description,
    keywords: [
      title,
      `${listing.make} for sale`,
      `${listing.model} for sale South Africa`,
      `${listing.year} ${listing.make}`,
      `used ${listing.make} ${listing.model}`,
      "cars for sale South Africa",
      "Balray Autos",
    ],
    openGraph: {
      type: "website",
      locale: "en_ZA",
      url: `${SITE_URL}/listing/${id}`,
      siteName: "Balray Autos",
      title: `${title} for Sale - ${priceFormatted}`,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} for Sale - ${priceFormatted}`,
      description: description,
      images: [imageUrl],
    },
  };
}

export default function ListingLayout({ children }: Props) {
  return <>{children}</>;
}