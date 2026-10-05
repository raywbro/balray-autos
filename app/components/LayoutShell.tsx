"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "./Navbar";
import Footer from "./Footer";

const HIDDEN_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const hide = HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (hide) {
      setChecked(true);
      return;
    }

    const checkBan = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setChecked(true);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("banned")
          .eq("id", user.id)
          .single();

        if (profile?.banned) {
          await supabase.auth.signOut();
          router.push("/login?banned=1");
          return;
        }
      } catch (err) {
        console.error("Ban check failed:", err);
      } finally {
        setChecked(true);
      }
    };

    checkBan();
  }, [hide, router]);

  if (hide) {
    return <>{children}</>;
  }

  if (!checked) {
    return <div className="min-h-screen w-full bg-[#F7F8F9]" />;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}