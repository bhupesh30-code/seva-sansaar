"use client";

import { useState } from "react";

const documents = [
  "Aadhaar Card",
  "Address Proof",
  "Family Details",
  "Registered Mobile Number",
];

const steps = [
  {
    number: "01",
    title: "Choose your service",
    text: "Select the ration card service you need and review the guidance.",
  },
  {
    number: "02",
    title: "Prepare documents",
    text: "Keep your family, identity and address documents ready.",
  },
  {
    number: "03",
    title: "Submit your request",
    text: "Complete the required details and submit your application.",
  },
  {
    number: "04",
    title: "Track your application",
    text: "Use your application reference to check your request status.",
  },
];

const faqs = [
  {
    q: "What ration card services are available?",
    a: "Seva Sansaar provides guidance for common ration-card related application and documentation needs.",
  },
  {
    q: "Which documents should I keep ready?",
    a: "Keep identity, address and family-related documents available. Exact requirements can vary depending on the service and authority.",
  },
  {
    q: "Can I track my application?",
    a: "Yes. After submitting a request through Seva Sansaar, you can use your application reference to check its status.",
  },
];

export default function RationPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="text-2xl font-black tracking-tight">
            Seva<span className="text-blue-600">Sansaar</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="/" className="text-slate-600 hover:text-blue-600">
              Home
            </a>

            <a href="/services/ration" className="text-blue-600">
              Services
            </a>

            <a
              href="/dashboard"
              className="text-slate-600 hover:text-blue-600"
            >
              My Applications
            </a>
          </nav>

          <a
            href="/dashboard"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Dashboard
          </a>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="mx-auto max-w-7xl px-5 pt-7 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <a href="/" className="hover:text-blue-600">
            Home
          </a>
          <span>/</span>
          <span>Services</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">
            Ration Card
          </span>
        </div>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-7 text-white shadow-xl sm:p-10">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-4xl backdrop-blur">
              🍚
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Government Service Assistance
            </p>

            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Ration Card
              <br />
              services made simple.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Get clear document guidance, application assistance and a
              simple process for your ration-card related service needs.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#apply"
                className="rounded-xl bg-white px-6 py-3.5 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5"
              >
                Start Application →
              </a>

              <a
                href="#documents"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                View Documents
              </a>
            </div>
          </div>

          {/* SERVICE OVERVIEW */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-sm font-bold text-blue-600">
              SERVICE OVERVIEW
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Everything in one place
            </h2>

            <div className="mt-7 space-y-4">
              {[
                [
                  "✓",
                  "Document checklist",
                  "Know what to keep ready.",
                ],
                [
                  "✓",
                  "Application guidance",
                  "Follow a simple step-by-step process.",
                ],
                [
                  "✓",
                  "Status tracking",
                  "Keep track of your request.",
                ],
              ].map(([icon, title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <div className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-black text-blue-600">
                      {icon}
                    </span>

                    <div>
                      <h3 className="font-bold">{title}</h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTS */}
      <section
        id="documents"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Documents
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Keep these documents ready
            </h2>

            <p className="mt-3 leading-7 text-slate-500">
              Typical documents to keep available before starting your
              request. Exact requirements may vary by service.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {documents.map((document, index) => (
              <div
                key={document}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-600">
                  {index + 1}
                </div>

                <h3 className="mt-5 font-bold">{document}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep a valid copy available when required.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Simple Process
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            How it works
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-500">
            Complete your service request through a simple and transparent
            journey.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="text-4xl font-black text-blue-100">
                {step.number}
              </span>

              <h3 className="mt-5 text-lg font-black">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="apply"
        className="mx-auto max-w-7xl px-5 pb-14 lg:px-8"
      >
        <div className="rounded-[2rem] bg-slate-900 p-8 text-white sm:p-10">
          <div className="flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-300">
                Ready to continue?
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Start your ration card application
              </h2>

              <p className="mt-2 max-w-xl text-slate-400">
                Begin your request and follow the guided application
                process.
              </p>
            </div>

            <a
              href="/dashboard"
              className="whitespace-nowrap rounded-xl bg-blue-600 px-7 py-4 font-bold text-white transition hover:bg-blue-500"
            >
              Start Application →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              FAQ
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold"
                  >
                    <span>{faq.q}</span>

                    <span className="text-xl text-blue-600">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-7 text-slate-500">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 px-5 py-8 text-center text-sm text-slate-400">
        <p>
          © {new Date().getFullYear()} Seva Sansaar. Simplifying everyday
          services.
        </p>
      </footer>
    </main>
  );
}