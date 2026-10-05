import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        title: "Vehicle Listing | Balray Autos",
        description:
          "Browse vehicles for sale on Balray Autos — South Africa's trusted automotive marketplace.",
      };
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: listing } = await supabase
      .from("listings")
      .select("year, make, model, price, location, description, images")
      .eq("id", id)
      .maybeSingle();

    if (!listing) {
      return {
        title: "Vehicle Listing | Balray Autos",
        description:
          "Browse vehicles for sale on Balray Autos — South Africa's trusted automotive marketplace.",
      };
    }

    const title = `${listing.year ? listing.year + " " : ""}${listing.make} ${listing.model} | Balray Autos`;
    const description = listing.description
      ? listing.description.slice(0, 160)
      : `${listing.year || ""} ${listing.make} ${listing.model} for sale in ${listing.location} for R${Number(listing.price).toLocaleString()}.`;
    const imageUrl = listing.images?.[0] || "/balray-autos-logo.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [imageUrl],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    console.error("Listing metadata error:", err);
    return {
      title: "Vehicle Listing | Balray Autos",
      description:
        "Browse vehicles for sale on Balray Autos — South Africa's trusted automotive marketplace.",
    };
  }
}

export default function ListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}