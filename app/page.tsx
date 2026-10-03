"use client";

import { useMemo, useState } from "react";

const services = [
  {
    title: "Aadhaar Services",
    shortTitle: "Aadhaar",
    description: "Update details, documents and application guidance.",
    icon: "🪪",
    href: "/services/aadhaar",
    color: "bg-blue-50 text-blue-700",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    title: "Ration Card",
    shortTitle: "Ration Card",
    description: "Get document information and application guidance.",
    icon: "🍚",
    href: "/services/ration",
    color: "bg-emerald-50 text-emerald-700",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "FIR Services",
    shortTitle: "FIR Assistance",
    description: "Prepare information required for FIR-related services.",
    icon: "📄",
    href: "/services/fir",
    color: "bg-red-50 text-red-700",
    accent: "from-red-500 to-orange-500",
  },
  {
    title: "Income Certificate",
    shortTitle: "Income Certificate",
    description: "Check requirements and prepare your application.",
    icon: "💼",
    href: "/services/income",
    color: "bg-purple-50 text-purple-700",
    accent: "from-purple-500 to-indigo-500",
  },
];

const popularServices = [
  "Aadhaar Update",
  "Ration Card",
  "Income Certificate",
  "FIR Assistance",
];

const stats = [
  { value: "4+", label: "Digital Services", icon: "✦" },
  { value: "24/7", label: "Access", icon: "◷" },
  { value: "100%", label: "Digital Guidance", icon: "✓" },
];

const steps = [
  {
    number: "01",
    icon: "⌕",
    title: "Choose a service",
    text: "Find the citizen service you need from our service collection.",
  },
  {
    number: "02",
    icon: "✓",
    title: "Check requirements",
    text: "Review documents and information required for your application.",
  },
  {
    number: "03",
    icon: "→",
    title: "Continue digitally",
    text: "Use your dashboard and available tools to continue the process.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Haryana");

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return services;

    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.shortTitle.toLowerCase().includes(query)
    );
  }, [search]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-[72px] items-center justify-between">

            {/* LOGO */}
            <a href="/" className="group flex items-center gap-3">

              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-lg font-black text-white shadow-lg shadow-blue-200 transition duration-300 group-hover:scale-105">
                <span className="relative z-10">S</span>
                <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/20" />
              </div>

              <div>
                <div className="text-lg font-black tracking-tight text-slate-950">
                  Seva<span className="text-blue-600">Sansaar</span>
                </div>

                <div className="text-[8px] font-black tracking-[0.2em] text-slate-400">
                  SERVICES MADE SIMPLE
                </div>
              </div>

            </a>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-8 lg:flex">

              <a
                href="/"
                className="relative text-sm font-extrabold text-blue-600"
              >
                Home
                <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-blue-600" />
              </a>

              <a
                href="#services"
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
              >
                Services
              </a>

              <a
                href="#how-it-works"
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
              >
                How It Works
              </a>

              <a
                href="#about"
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
              >
                About
              </a>

            </nav>

            {/* ACTIONS */}
            <div className="hidden items-center gap-3 md:flex">

              <a
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                Login
              </a>

              <a
                href="/dashboard"
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-blue-600"
              >
                Dashboard
              </a>

            </div>

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xl shadow-sm transition hover:border-blue-300 md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>

          </div>

          {/* MOBILE NAV */}
          {menuOpen && (
            <div className="border-t border-slate-100 py-4 md:hidden">

              <nav className="flex flex-col gap-1">

                <a
                  href="/"
                  onClick={closeMenu}
                  className="rounded-xl bg-blue-50 px-4 py-3 font-bold text-blue-600"
                >
                  Home
                </a>

                <a
                  href="#services"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
                >
                  Services
                </a>

                <a
                  href="#how-it-works"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
                >
                  How It Works
                </a>

                <a
                  href="#about"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold hover:bg-slate-50"
                >
                  About
                </a>

                <div className="mt-2 grid grid-cols-2 gap-2">

                  <a
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center font-bold"
                  >
                    Login
                  </a>

                  <a
                    href="/dashboard"
                    onClick={closeMenu}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-center font-bold text-white"
                  >
                    Dashboard
                  </a>

                </div>

              </nav>

            </div>
          )}

        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-white">

        {/* Background */}
        <div className="pointer-events-none absolute left-[-180px] top-[-100px] h-[420px] w-[420px] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute right-[-180px] top-[80px] h-[480px] w-[480px] rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">

          <div className="grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr]">

            {/* LEFT */}
            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 shadow-sm">

                <span className="flex h-2 w-2">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-blue-500 opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-blue-600" />
                </span>

                Simple • Digital • Convenient

              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.06] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[4.2rem]">

                Everyday services.

                <span className="mt-2 block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Made simple.
                </span>

              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Discover citizen services, understand document requirements
                and manage your applications from one convenient digital
                platform.
              </p>

              {/* SEARCH */}
              <div className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/70">

                <div className="flex flex-col gap-2 sm:flex-row">

                  {/* LOCATION */}
                  <div className="flex items-center rounded-xl bg-slate-50 px-4 py-3 sm:min-w-[175px]">

                    <span className="mr-2 text-lg">📍</span>

                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full cursor-pointer bg-transparent text-sm font-bold text-slate-700 outline-none"
                    >
                      <option>Haryana</option>
                      <option>Delhi</option>
                      <option>Punjab</option>
                      <option>Rajasthan</option>
                      <option>Uttar Pradesh</option>
                    </select>

                  </div>

                  {/* SEARCH */}
                  <div className="flex flex-1 items-center rounded-xl border border-slate-100 px-4 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">

                    <span className="mr-3 text-xl text-slate-400">
                      ⌕
                    </span>

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search for a service..."
                      className="w-full bg-transparent py-3 text-sm font-medium outline-none placeholder:text-slate-400"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="rounded-lg px-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    )}

                  </div>

                </div>

              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-3">

                <a
                  href="#services"
                  className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700"
                >
                  Explore Services →
                </a>

                <a
                  href="/dashboard"
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:text-blue-600"
                >
                  Open Dashboard
                </a>

              </div>

              {/* TRUST */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-500">

                <span className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Easy to use
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Digital process
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  Clear guidance
                </span>

              </div>

            </div>

            {/* RIGHT HERO CARD */}
            <div className="relative">

              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-300/40 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-indigo-300/40 blur-3xl" />

              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/50 sm:p-7">

                {/* TOP */}
                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                      Service marketplace
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                      What do you need today?
                    </h2>

                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-xl shadow-inner">
                    ✨
                  </div>

                </div>

                {/* SERVICE CARDS */}
                <div className="mt-6 grid grid-cols-2 gap-3">

                  {services.map((service) => (
                    <a
                      key={service.title}
                      href={service.href}
                      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl"
                    >

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl shadow-sm ${service.color}`}
                      >
                        {service.icon}
                      </div>

                      <p className="mt-3 text-sm font-black text-slate-800">
                        {service.shortTitle}
                      </p>

                      <p className="mt-1 text-xs font-bold text-blue-600 opacity-80 transition group-hover:opacity-100">
                        Explore →
                      </p>

                      <div
                        className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${service.accent} opacity-0 transition group-hover:opacity-100`}
                      />

                    </a>
                  ))}

                </div>

                {/* LOCATION CARD */}
                <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 p-4 text-white shadow-lg">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                        YOUR LOCATION
                      </p>

                      <p className="mt-1 font-black">
                        📍 {location}
                      </p>

                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Available
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ================= POPULAR ================= */}
      <section className="border-y border-slate-100 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex flex-wrap items-center gap-2.5">

            <span className="mr-1 text-sm font-black text-slate-800">
              Popular:
            </span>

            {popularServices.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSearch(item)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                {item}
              </button>
            ))}

          </div>

        </div>

      </section>

      {/* ================= STATS ================= */}
      <section className="bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">

        <div className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:grid-cols-3">

          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group p-7 text-center transition hover:bg-slate-50 ${
                index !== 0
                  ? "border-t border-slate-100 sm:border-l sm:border-t-0"
                  : ""
              }`}
            >

              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600 transition group-hover:scale-110">
                {stat.icon}
              </div>

              <div className="mt-3 text-2xl font-black text-slate-950">
                {stat.value}
              </div>

              <div className="mt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                {stat.label}
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* ================= SERVICES ================= */}
      <section
        id="services"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Explore services
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Services for everyday needs
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Choose a service, review the requirements and continue
              with your application.
            </p>

          </div>

          <a
            href="/dashboard"
            className="text-sm font-black text-blue-600 transition hover:translate-x-1 hover:text-blue-700"
          >
            View dashboard →
          </a>

        </div>

        {filteredServices.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {filteredServices.map((service) => (
              <a
                key={service.title}
                href={service.href}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/70"
              >

                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm ${service.color}`}
                  >
                    {service.icon}
                  </div>

                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black tracking-wider text-slate-400">
                    DIGITAL
                  </span>

                </div>

                <h3 className="mt-6 text-lg font-black text-slate-900">
                  {service.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                  {service.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

                  <span className="text-sm font-black text-blue-600">
                    Explore
                  </span>

                  <span className="transition duration-300 group-hover:translate-x-1">
                    →
                  </span>

                </div>

                <div
                  className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${service.accent} opacity-0 transition duration-300 group-hover:opacity-100`}
                />

              </a>
            ))}

          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              🔎
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              No service found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try searching for Aadhaar, Ration Card, FIR or Income Certificate.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Clear Search
            </button>

          </div>
        )}

      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="border-y border-slate-100 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >

        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Simple process
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Get things done in three steps
            </h2>

            <p className="mt-3 text-slate-500">
              A simple flow designed to make service discovery and
              application preparation easier.
            </p>

          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-200">
                    {step.number}
                  </div>

                  <span className="text-2xl font-black text-slate-200 transition group-hover:text-blue-100">
                    {step.icon}
                  </span>

                </div>

                <h3 className="mt-6 text-lg font-black text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.text}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-6 py-14 text-center text-white shadow-2xl shadow-blue-200 sm:px-12">

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl backdrop-blur">
              ✦
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
              Seva Sansaar
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Ready to get started?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Access your dashboard and explore available services
              from one convenient place.
            </p>

            <a
              href="/dashboard"
              className="mt-7 inline-flex rounded-xl bg-white px-7 py-3.5 text-sm font-black text-blue-700 shadow-lg transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Open Dashboard →
            </a>

          </div>

        </div>

      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="border-t border-slate-100 bg-white px-4 py-16 sm:px-6 lg:px-8"
      >

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            About Seva Sansaar
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Digital services, without the confusion.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Seva Sansaar brings useful service information,
            document guidance and digital tools together in one
            simple platform.
          </p>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">

          <div>

            <div className="text-xl font-black">
              Seva<span className="text-blue-500">Sansaar</span>
            </div>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Simple digital access to everyday citizen services.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Digital platform
            </div>

          </div>

          <div>

            <h3 className="font-black">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">

              <a
                href="/"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Home
              </a>

              <a
                href="#services"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Services
              </a>

              <a
                href="/dashboard"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Dashboard
              </a>

              <a
                href="/login"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Login
              </a>

            </div>

          </div>

          <div>

            <h3 className="font-black">
              Platform
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <span>Digital Service Discovery</span>
              <span>Document Guidance</span>
              <span>Application Support</span>
            </div>

          </div>

        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-500">
          © 2026 Seva Sansaar. Demo project.
        </div>

      </footer>

    </main>
  );
}