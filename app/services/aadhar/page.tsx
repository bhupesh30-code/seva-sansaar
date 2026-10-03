"use client";

import { useState } from "react";
import Link from "next/link";

export default function AadharPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const documents = [
    "Aadhaar Card",
    "Proof of Identity",
    "Proof of Address",
    "Registered Mobile Number",
  ];

  const steps = [
    {
      number: "01",
      title: "Choose Service",
      description: "Select the Aadhaar service you need.",
    },
    {
      number: "02",
      title: "Keep Documents Ready",
      description: "Keep the required documents and details ready.",
    },
    {
      number: "03",
      title: "Submit Application",
      description: "Complete the application and submit your request.",
    },
    {
      number: "04",
      title: "Track Application",
      description: "Track your application status from your dashboard.",
    },
  ];

  const faqs = [
    {
      question: "What Aadhaar services can I apply for?",
      answer:
        "You can use Seva Sansaar to get guidance for Aadhaar-related services such as updating personal details and other application requirements.",
    },
    {
      question: "Which documents are required?",
      answer:
        "Typical documents include Aadhaar Card, identity proof, address proof and a registered mobile number. Exact requirements may vary depending on the service.",
    },
    {
      question: "Can I track my application?",
      answer:
        "Yes. After submitting an application, you can use your Seva Sansaar dashboard to check its status.",
    },
    {
      question: "How long does the process take?",
      answer:
        "Processing time depends on the service and the concerned authority. Seva Sansaar provides application guidance and status information.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Seva<span className="text-blue-600">Sansaar</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/services/aadhar"
              className="text-sm font-semibold text-blue-600"
            >
              Services
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Dashboard
            </Link>
          </nav>

          <Link
            href="/dashboard"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* BREADCRUMB */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-4 text-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-slate-500">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>

            <span>/</span>

            <span className="text-slate-900">Aadhaar Services</span>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              🪪 Aadhaar Services
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Aadhaar Services
              <span className="block text-blue-100">
                Made Simple & Accessible
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">
              Get clear information, document guidance and application support
              for Aadhaar-related services through Seva Sansaar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apply?service=Aadhaar%20Services"
                className="rounded-xl bg-white px-6 py-3.5 text-center font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
              >
                Start Application →
              </Link>

              <Link
                href="#documents"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-center font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                View Documents
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Service Overview
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need in one place
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Seva Sansaar helps citizens understand the application process,
                prepare required information and submit service requests in a
                simple and organized way.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-2xl">📋</div>
                  <h3 className="mt-3 font-bold text-slate-900">
                    Clear Guidance
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Understand what information and documents you may need.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-2xl">📊</div>
                  <h3 className="mt-3 font-bold text-slate-900">
                    Track Status
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Check your submitted application from your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
              <div className="text-4xl">🪪</div>

              <h3 className="mt-5 text-2xl font-bold">
                Aadhaar Assistance
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Start your application journey with a simple step-by-step
                process.
              </p>

              <Link
                href="/apply?service=Aadhaar%20Services"
                className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white transition hover:bg-blue-500"
              >
                Apply Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTS */}
      <section id="documents" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Documents
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Keep these documents ready
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Typical documents may include the following. Exact requirements
              can vary depending on the service.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {documents.map((document, index) => (
              <div
                key={document}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  {document}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep a valid and updated copy available.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Simple Process
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Apply in four simple steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div
                key={item.number}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <span className="text-sm font-extrabold text-blue-600">
                  {item.number}
                </span>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to start your Aadhaar application?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            Start your application and follow the simple step-by-step process.
          </p>

          <Link
            href="/apply?service=Aadhaar%20Services"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white transition hover:bg-blue-500"
          >
            Start Application →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-slate-900"
                >
                  <span>{faq.question}</span>

                  <span className="text-xl text-blue-600">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>

                {openFaq === index && (
                  <div className="border-t border-slate-200 px-5 py-5 text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            © {new Date().getFullYear()} Seva Sansaar. All rights reserved.
          </div>

          <div className="flex gap-5">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>

            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}