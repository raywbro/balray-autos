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
  const supabase = createClient();
  const [checked, setChecked] = useState(false);

  const hide = HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  // Check if user is banned and kick them out
  useEffect(() => {
    if (hide) {
      setChecked(true);
      return;
    }

    const checkBan = async () => {
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
        // Sign out and kick to login with ban message
        await supabase.auth.signOut();
        router.push("/login?banned=1");
        return;
      }

      setChecked(true);
    };

    checkBan();
  }, [hide, pathname, router, supabase]);

  if (hide) {
    return <>{children}</>;
  }

  if (!checked) {
    return (
      <div className="min-h-screen w-full bg-[#F7F8F9]" />
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}