"use client";

import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-6 py-5">

          <div className="flex items-center justify-between">

            {/* Logo */}
            <div>
              <h1 className="text-2xl font-bold">
                Seva Sansaar
              </h1>

              <p className="text-sm text-blue-100">
                Citizen Services Portal
              </p>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden items-center gap-6 md:flex">

              <a
                href="/"
                className="hover:text-blue-200"
              >
                Home
              </a>

              <a
                href="#services"
                className="hover:text-blue-200"
              >
                Services
              </a>

              <a
                href="#about"
                className="hover:text-blue-200"
              >
                About
              </a>

              <a
                href="#contact"
                className="hover:text-blue-200"
              >
                Contact
              </a>

              <a
                href="/login"
                className="rounded-lg bg-white px-5 py-2 font-semibold text-blue-700 hover:bg-blue-50"
              >
                Login
              </a>

            </nav>

            {/* Mobile Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-2xl md:hidden"
            >
              {menuOpen ? "✕" : "☰"}
            </button>

          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <nav className="mt-5 flex flex-col gap-2 border-t border-blue-500 pt-5 md:hidden">

              <a
                href="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-blue-600"
              >
                Home
              </a>

              <a
                href="#services"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-blue-600"
              >
                Services
              </a>

              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-blue-600"
              >
                About
              </a>

              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-blue-600"
              >
                Contact
              </a>

              <a
                href="/login"
                className="mt-2 rounded-lg bg-white px-4 py-3 text-center font-semibold text-blue-700"
              >
                Login
              </a>

            </nav>
          )}

        </div>
      </header>

      {/* HERO */}
      <section className="bg-blue-700 px-6 pb-20 pt-16 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <p className="font-semibold text-blue-200">
              DIGITAL CITIZEN SERVICES
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
              Your Services,
              <br />
              Simplified.
            </h2>

            <p className="mt-6 text-lg text-blue-100">
              Check required documents, prepare applications,
              and access citizen services from one simple portal.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <a
                href="/login"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
              >
                Get Started →
              </a>

              <a
                href="#services"
                className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-blue-600"
              >
                Explore Services
              </a>

            </div>

          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="mx-auto max-w-7xl px-6 py-16"
      >

        <div className="text-center">

          <p className="font-semibold text-blue-700">
            OUR SERVICES
          </p>

          <h3 className="mt-2 text-3xl font-bold text-gray-900">
            Popular Citizen Services
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Select a service to check documents and prepare
            your application.
          </p>

        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* AADHAAR */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
              A
            </div>

            <h4 className="mt-5 text-xl font-bold text-gray-900">
              Aadhaar Update
            </h4>

            <p className="mt-3 text-gray-600">
              Check documents and prepare your Aadhaar application.
            </p>

            <a
              href="/services/aadhaar"
              className="mt-5 inline-block font-semibold text-blue-700"
            >
              Open Service →
            </a>

          </div>

          {/* RATION */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl font-bold text-green-700">
              R
            </div>

            <h4 className="mt-5 text-xl font-bold text-gray-900">
              Ration Card
            </h4>

            <p className="mt-3 text-gray-600">
              Prepare documents and information for ration card services.
            </p>

            <a
              href="/services/ration"
              className="mt-5 inline-block font-semibold text-blue-700"
            >
              Open Service →
            </a>

          </div>

          {/* FIR */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl font-bold text-red-700">
              F
            </div>

            <h4 className="mt-5 text-xl font-bold text-gray-900">
              FIR
            </h4>

            <p className="mt-3 text-gray-600">
              Prepare information for the demo FIR application.
            </p>

            <a
              href="/services/fir"
              className="mt-5 inline-block font-semibold text-blue-700"
            >
              Open Service →
            </a>

          </div>

          {/* INCOME */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl font-bold text-purple-700">
              I
            </div>

            <h4 className="mt-5 text-xl font-bold text-gray-900">
              Income Certificate
            </h4>

            <p className="mt-3 text-gray-600">
              Prepare information for an income certificate application.
            </p>

            <a
              href="/services/income"
              className="mt-5 inline-block font-semibold text-blue-700"
            >
              Open Service →
            </a>

          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="bg-white px-6 py-16"
      >

        <div className="mx-auto max-w-5xl text-center">

          <p className="font-semibold text-blue-700">
            ABOUT US
          </p>

          <h3 className="mt-2 text-3xl font-bold text-gray-900">
            Simple. Digital. Citizen Friendly.
          </h3>

          <p className="mt-5 text-gray-600">
            Seva Sansaar is a demo digital portal designed to
            make citizen-service preparation easier by bringing
            document checklists and application forms together
            in one place.
          </p>

        </div>

      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="px-6 py-16"
      >

        <div className="mx-auto max-w-4xl rounded-2xl bg-blue-50 p-8 text-center">

          <h3 className="text-2xl font-bold text-gray-900">
            Need Help?
          </h3>

          <p className="mt-3 text-gray-600">
            Explore the dashboard to access all available services.
          </p>

          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Go to Dashboard →
          </a>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 px-6 py-8 text-center text-white">

        <p className="font-semibold">
          Seva Sansaar
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Simple • Digital • Citizen Friendly
        </p>

        <p className="mt-4 text-xs text-gray-500">
          Demo project for citizen-service application preparation.
        </p>

      </footer>

    </main>
  );
}