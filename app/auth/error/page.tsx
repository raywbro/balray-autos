import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F7F8F9] text-[#34414A] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D9DEE2] bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
          ⚠️
        </div>
        <h1 className="mt-6 text-2xl font-black text-[#34414A]">
          Link Expired or Invalid
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#66737C]">
          This reset link has already been used or has expired. Please request a
          new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 block w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-5 py-4 text-center text-sm font-bold text-white shadow-md hover:opacity-95"
        >
          Request a New Reset Link
        </Link>
        <Link
          href="/login"
          className="mt-3 block w-full rounded-xl border border-[#B08D3C] bg-white px-5 py-3.5 text-center text-sm font-bold text-[#8F7130] hover:bg-[#FBF7EC]"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}