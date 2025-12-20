"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User } from "lucide-react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to create account");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setSubmitting(false);
      // navigate to sign-in after short delay
      setTimeout(() => router.push("/sign-in"), 800);
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center py-16">
      <div className="mx-auto w-[92%] max-w-4xl">
        <div className="grid gap-8 rounded-2xl bg-white/90 p-6 shadow-xl md:grid-cols-2 md:items-center">
          <section className="px-6 py-8">
            <div className="rounded-lg bg-linear-to-r from-green-600 to-green-500 p-4 text-white shadow-md inline-block">
              <h1 className="text-3xl font-extrabold">Faflories</h1>
              <p className="text-xs opacity-90">BIG MEGA SHOP</p>
            </div>

            <div className="mt-6 max-w-md text-stone-700">
              <h2 className="mb-3 text-2xl font-bold">Create your account</h2>
              <p className="text-sm text-gray-600">
                Join Faflories for exclusive deals and fast delivery.
              </p>
            </div>

            <div className="mt-6 hidden md:block">
              <svg
                width="280"
                height="150"
                viewBox="0 0 280 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="280" height="150" rx="12" fill="url(#g)" />
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0" stopColor="#D1FAE5" />
                    <stop offset="1" stopColor="#DBEAFE" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </section>

          <aside className="px-6 py-8">
            <div className="mx-auto max-w-md">
              {error ? (
                <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                  {String(error)}
                </div>
              ) : null}
              {success ? (
                <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
                  Account created — redirecting to sign in...
                </div>
              ) : null}
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Full name
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User size={18} />
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-lg border border-gray-200 px-10 py-3 text-sm focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-gray-200 px-10 py-3 text-sm focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a strong password"
                      className="w-full rounded-lg border border-gray-200 px-10 py-3 text-sm focus:border-green-400 focus:outline-none"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-linear-to-r from-green-600 to-green-500 px-4 py-3 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? "Creating account..." : "Create account"}
                </button>
              </form>

              <div className="mt-5 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-green-600 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
