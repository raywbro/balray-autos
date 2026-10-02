"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function TermsPage() {
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
              Terms &amp; Conditions
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
                Welcome to Balray Autos. By accessing or using our website and
                services, you agree to be bound by these Terms &amp; Conditions.
                If you do not agree with any part of these terms, please do not
                use our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">2. What Balray Autos Does</h2>
              <p className="mt-3">
                Balray Autos is an online marketplace that connects buyers and
                sellers of vehicles, machinery, parts, and automotive products
                in South Africa. We are not a party to any transaction between
                buyers and sellers, and we do not own the vehicles listed on
                our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">3. User Accounts</h2>
              <p className="mt-3">
                To post listings, you must create an account with a valid email
                address and phone number. You are responsible for keeping your
                login credentials safe. Any activity on your account is your
                responsibility.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">4. Listings &amp; Content</h2>
              <p className="mt-3">
                When you upload a listing, you confirm that:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>All information you provide is accurate and truthful.</li>
                <li>You have the legal right to sell or advertise the vehicle or item.</li>
                <li>Your photos do not infringe on anyone else&apos;s rights.</li>
                <li>Your listing does not contain illegal, misleading, or offensive content.</li>
              </ul>
              <p className="mt-3">
                Balray Autos reserves the right to remove any listing that
                violates these terms without notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">5. Transactions Between Users</h2>
              <p className="mt-3">
                All transactions occur directly between buyers and sellers.
                Balray Autos is not responsible for the quality, safety, or
                legality of items listed, nor for the accuracy of any listing.
                We strongly recommend meeting in a safe public place and
                verifying documents before any transaction.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">6. Prohibited Activities</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Posting stolen, illegal, or prohibited items.</li>
                <li>Using the platform for fraud or scams.</li>
                <li>Harassing other users or misusing contact information.</li>
                <li>Attempting to hack, scrape, or damage the platform.</li>
                <li>Creating multiple accounts with false information.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">7. Limitation of Liability</h2>
              <p className="mt-3">
                Balray Autos is provided &quot;as is.&quot; We do not guarantee
                that the platform will always be available, error-free, or that
                listings will be accurate. We are not liable for any losses
                arising from your use of the platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">8. Changes to These Terms</h2>
              <p className="mt-3">
                We may update these Terms from time to time. Continued use of
                the platform after changes means you accept the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#34414A]">9. Contact</h2>
              <p className="mt-3">
                For any questions about these Terms, contact us at{" "}
                <a href="mailto:balrayautos@gmail.com" className="font-bold text-[#9A7B37] hover:underline">
                  balrayautos@gmail.com
                </a>.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-[#D3B86A]/50 bg-[#FBF7EC] p-6 text-center">
            <p className="text-sm text-[#8F7130]">
              By using Balray Autos, you agree to these Terms &amp; Conditions.
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

      <Footer />
    </main>
  );
}