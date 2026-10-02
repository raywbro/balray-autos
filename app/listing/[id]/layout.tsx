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
    .select("make, model, year, price, location, description, images, mileage, transmission, fuel, condition, category")
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
  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : `${SITE_URL}/balray-autos-logo.png`;

  const description = `${title} for sale at ${priceFormatted} in ${listing.location}. ${
    listing.mileage ? `Mileage: ${listing.mileage}. ` : ""
  }${listing.description?.substring(0, 120)}...`;

  // ------------------------------
  // JSON-LD STRUCTURED DATA
  // This tells Google exactly what this page is about
  // ------------------------------
  const vehicleSchema = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: title,
    description: listing.description?.substring(0, 200),
    image: imageUrl,
    url: `${SITE_URL}/listing/${id}`,
    brand: {
      "@type": "Brand",
      name: listing.make,
    },
    model: listing.model,
    vehicleModelDate: listing.year?.toString(),
    mileageFromOdometer: listing.mileage
      ? {
          "@type": "QuantitativeValue",
          value: listing.mileage.replace(/[^0-9]/g, "") || undefined,
          unitCode: "KMT",
        }
      : undefined,
    vehicleTransmission: listing.transmission
      ? listing.transmission.charAt(0).toUpperCase() + listing.transmission.slice(1)
      : undefined,
    fuelType: listing.fuel
      ? listing.fuel.charAt(0).toUpperCase() + listing.fuel.slice(1)
      : undefined,
    itemCondition:
      listing.condition === "new"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: Number(listing.price),
      priceCurrency: "ZAR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/listing/${id}`,
      seller: {
        "@type": "Organization",
        name: "Balray Autos",
        url: SITE_URL,
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Marketplace",
        item: `${SITE_URL}/marketplace`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_URL}/listing/${id}`,
      },
    ],
  };

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
    other: {
      // Inject both schemas as JSON-LD script tags
      "script:ld+json": JSON.stringify(vehicleSchema),
      "script:ld+json:breadcrumb": JSON.stringify(breadcrumbSchema),
    },
  };
}

export default function ListingLayout({ children }: Props) {
  return <>{children}</>;
}