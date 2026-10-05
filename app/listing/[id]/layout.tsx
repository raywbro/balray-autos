import type { Metadata } from "next";

// Cache metadata for 5 minutes so it doesn't re-fetch on every visit
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const fallback: Metadata = {
    title: "Vehicle Listing | Balray Autos",
    description:
      "Browse vehicles for sale on Balray Autos — South Africa's trusted automotive marketplace.",
  };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) return fallback;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: listing } = await supabase
      .from("listings")
      .select("year, make, model, price, location, description, images")
      .eq("id", id)
      .maybeSingle();

    if (!listing) return fallback;

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
    return fallback;
  }
}

export default function ListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}