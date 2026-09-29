"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8F9] text-[#34414A]">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F4F6F7] to-[#E4E9EC]">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#D3B86A]/50 bg-[#FBF7EC] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8F7130]">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#8F7130] to-[#D2B66A]" />
              Legal
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#34414A] sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-base text-[#66737C]">
              Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long" })}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-white py-16">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-sm leading-7 text-[#4A5962]">

            <div>
              <h2 className="text-xl font-black text-[#34414A]">1. Introduction</h2>
              <p className="mt-3">
                Balray Autos respects your privacy. This Privacy Policy
                explains what information we collect, how we use it, and your
                rights regarding your personal data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">2. Information We Collect</h2>
              <p className="mt-3">When you use Balray Autos, we collect:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Account information:</strong> Your email address and password (securely encrypted).</li>
                <li><strong>Listing information:</strong> Name, phone number, email, vehicle details, photos, and location you provide when listing.</li>
                <li><strong>Usage data:</strong> General information about how you use our platform.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">3. How We Use Your Information</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>To create and manage your account.</li>
                <li>To display your listings to potential buyers.</li>
                <li>To allow buyers to contact you about your listing.</li>
                <li>To improve and secure our platform.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">4. What We Share</h2>
              <p className="mt-3">
                When you post a listing, certain information becomes publicly
                visible, including your name, phone number, email address,
                vehicle details, and photos. This is so buyers can contact you.
              </p>
              <p className="mt-3">
                We do <strong>not</strong> sell your personal information to
                third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">5. Data Security</h2>
              <p className="mt-3">
                We use industry-standard security measures, including encrypted
                authentication (powered by Supabase) and secure cloud storage
                for images. However, no online service can be 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">6. Your Rights</h2>
              <p className="mt-3">You have the right to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Access the personal information we hold about you.</li>
                <li>Delete your account and any listings at any time.</li>
                <li>Update your information whenever you want.</li>
                <li>Contact us if you have any privacy concerns.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">7. Cookies &amp; Sessions</h2>
              <p className="mt-3">
                We use cookies to keep you logged in and to remember your
                session. You can clear cookies at any time through your browser
                settings.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">8. Children&apos;s Privacy</h2>
              <p className="mt-3">
                Balray Autos is not intended for users under the age of 18. We
                do not knowingly collect information from children.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">9. Changes to This Policy</h2>
              <p className="mt-3">
                We may update this Privacy Policy from time to time. Continued
                use of the platform means you accept any updates.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">10. Contact</h2>
              <p className="mt-3">
                For any privacy questions, contact us at{" "}
                <a href="mailto:balrayautos@gmail.com" className="font-bold text-[#9A7B37] hover:underline">
                  balrayautos@gmail.com
                </a>{" "}
                or call{" "}
                <a href="tel:+27815973009" className="font-bold text-[#9A7B37] hover:underline">
                  +27 81 597 3009
                </a>.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6 text-center">
            <p className="text-sm text-[#8F7130]">
              Your trust matters to us. We take your privacy seriously.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block rounded-xl bg-[#34414A] px-6 py-3 text-sm font-bold text-white hover:bg-[#4A5962]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-[#D4DADF] bg-[#EEF1F3]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <img src="/balray-autos-logo.png" alt="Balray Autos" className="h-11 w-auto max-w-[180px] object-contain" />
              <p className="mt-3 text-sm text-[#68757D]">South African automotive marketplace.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm font-semibold">
              <Link href="/" className="text-[#68757D] hover:text-[#9A7B37]">Home</Link>
              <Link href="/marketplace" className="text-[#68757D] hover:text-[#9A7B37]">Marketplace</Link>
              <Link href="/terms" className="text-[#68757D] hover:text-[#9A7B37]">Terms</Link>
              <Link href="/privacy" className="text-[#68757D] hover:text-[#9A7B37]">Privacy</Link>
              <Link href="/contact" className="text-[#68757D] hover:text-[#9A7B37]">Contact</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-[#D3D9DD] pt-5 text-center text-sm text-[#7A858C]">
            © {new Date().getFullYear()} Balray Autos (Pty) Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}