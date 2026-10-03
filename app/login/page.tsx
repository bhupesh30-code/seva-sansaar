"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      if (!data.user || !data.session) {
        setError("Login session could not be created.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRANDING */}
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-extrabold"
            >
              Seva <span className="text-blue-400">Sansaar</span>
            </button>

            <div className="mt-24 max-w-lg">
              <div className="mb-5 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
                Welcome Back
              </div>

              <h1 className="text-5xl font-extrabold leading-tight">
                Your services.
                <br />
                <span className="text-blue-400">
                  One simple dashboard.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Login to Seva Sansaar and manage your services,
                bookings and applications from one secure place.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl">🔐</div>
              <div className="mt-2 text-sm text-slate-300">
                Secure Login
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl">📋</div>
              <div className="mt-2 text-sm text-slate-300">
                Easy Tracking
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl">⚡</div>
              <div className="mt-2 text-sm text-slate-300">
                Fast Services
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT LOGIN */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <div className="mb-8 text-center lg:hidden">
              <button
                onClick={() => router.push("/")}
                className="text-2xl font-extrabold text-slate-900"
              >
                Seva <span className="text-blue-600">Sansaar</span>
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">

              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-blue-600">
                  WELCOME BACK
                </p>

                <h2 className="text-3xl font-extrabold text-slate-900">
                  Login to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access your Seva Sansaar dashboard and manage
                  your services.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Login"}
                </button>
              </form>

              {/* SIGNUP */}
              <div className="mt-7 text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Create Account
                </button>
              </div>

              {/* HOME */}
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-4 w-full text-center text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                ← Back to Home
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure authentication powered by Seva Sansaar
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}