"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react";

export default function CredentialsSignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Sign-in failed");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      setSuccess(true);
      // redirect to home
      setTimeout(() => router.push("/"), 500);
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white via-green-50 to-green-100/60 p-1 shadow-xl">
        <div className="rounded-xl bg-white p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Mail className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Welcome back</h2>
              <p className="text-sm text-gray-500">
                Sign in to continue to Faflories
              </p>
            </div>
          </div>

          {success ? (
            <div className="mb-4 flex items-center gap-3 rounded-md bg-green-50 p-4 text-green-700">
              <CheckCircle />
              <div>
                <p className="font-medium">Signed in (demo)</p>
                <p className="text-sm">
                  This is a frontend-only demo success state.
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full rounded-lg border border-gray-200 bg-white px-10 py-3 text-sm shadow-sm focus:border-green-400 focus:outline-none"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-200 bg-white px-10 py-3 pr-12 text-sm shadow-sm focus:border-green-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Remember me</span>
              </label>
              <Link href="/" className="text-sm text-green-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-linear-to-r from-green-600 to-green-500 px-4 py-3 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
              disabled={submitting || success}
            >
              {submitting ? "Signing in..." : success ? "Signed in" : "Sign In"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-green-600 hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
