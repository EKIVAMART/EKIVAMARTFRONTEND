import { Metadata } from "next";

import CredentialsSignInForm from "./credentials-signin-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignIn() {
  return (
    <main className="min-h-screen bg-linear-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center py-16">
      <div className="relative mx-auto w-[92%] max-w-6xl">
        <div className="grid gap-8 rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-sm md:grid-cols-2 md:items-center">
          {/* Left - Brand / Illustration */}
          <section className="order-2 mt-4 md:order-1 md:mt-0">
            <div className="flex h-full flex-col items-start justify-center gap-6 px-4 py-8">
              <div className="rounded-lg bg-linear-to-r from-green-600 to-green-500 p-4 text-white shadow-md">
                <h1 className="text-4xl font-extrabold leading-tight">
                  Faflories
                </h1>
                <p className="mt-1 text-sm opacity-90">BIG MEGA SHOP</p>
              </div>

              <div className="mt-4 max-w-md text-stone-700">
                <h2 className="mb-3 text-3xl font-bold">Welcome back</h2>
                <p className="text-sm text-gray-600">
                  Sign in to continue shopping with exclusive deals and updates.
                  Enjoy a beautiful, fast and responsive frontend experience.
                </p>
              </div>

              <div className="mt-6 flex w-full gap-3">
                <div className="flex-1 rounded-lg bg-linear-to-br from-yellow-100 to-yellow-50 p-4 text-left shadow">
                  <p className="text-sm font-medium">Fast delivery</p>
                  <p className="text-xs text-gray-500">Nationwide</p>
                </div>
                <div className="flex-1 rounded-lg bg-linear-to-brrom-blue-100 to-blue-50 p-4 text-left shadow">
                  <p className="text-sm font-medium">24/7 Support</p>
                  <p className="text-xs text-gray-500">Always available</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right - Sign in card */}
          <aside className="order-1 md:order-2">
            <div className="mx-auto max-w-md">
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <CredentialsSignInForm />

                <div className="my-4">
                  <div className="relative text-center text-sm text-stone-500">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" />
                    </div>
                    <span className="relative px-2 bg-white">
                      Or continue with
                    </span>
                  </div>

                  <div className="mt-4">
                    <a
                      href="#"
                      role="button"
                      className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm hover:shadow-md hover:scale-[1.01] transition-transform"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 533.5 544.3"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M533.5 278.4c0-17.4-1.4-34.2-4.1-50.5H272v95.6h146.9c-6.3 34.2-25.3 63.1-54 82.4v68.5h87.1c50.9-46.9 80.5-116 80.5-195.9z"
                          fill="#4285F4"
                        />
                        <path
                          d="M272 544.3c73.5 0 135.2-24.5 180.3-66.7l-87.1-68.5c-24.2 16.2-55.2 25.7-93.2 25.7-71.6 0-132.3-48.3-154.1-113.1H26.9v70.9C72 484 165.6 544.3 272 544.3z"
                          fill="#34A853"
                        />
                        <path
                          d="M117.9 326.7c-10.8-32.1-10.8-66.9 0-99l-71.1-70.9C13 206.8 0 238.6 0 272c0 33.4 13 65.2 46.8 115.2l71.1-60.5z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M272 107.7c39.9 0 75.8 13.7 104.1 40.5l78.1-78.1C405.2 24.9 343.5 0 272 0 165.6 0 72 60.3 26.9 150.1l71.1 70.9C139.7 156 200.4 107.7 272 107.7z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="text-black">Continue with Google</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
