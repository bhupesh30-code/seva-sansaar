"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

const documents = [
  "Aadhaar Card",
  "Proof of Identity",
  "Proof of Address",
  "Mobile Number",
];

export default function AadhaarPage() {
  const [checked, setChecked] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

  const [applicationId, setApplicationId] = useState("");

  const toggleDocument = (document: string) => {
    setChecked((current) =>
      current.includes(document)
        ? current.filter((item) => item !== document)
        : [...current, document]
    );
  };

  const progress = (checked.length / documents.length) * 100;

  const handleSubmit = async () => {
    if (!name || !aadhaar || !mobile || !address) {
      alert("Please fill all fields");
      return;
    }

    if (aadhaar.length !== 12) {
      alert("Please enter a 12-digit demo Aadhaar number");
      return;
    }

    if (mobile.length !== 10) {
      alert("Please enter a 10-digit mobile number");
      return;
    }

    const newApplicationId = `SS-${Date.now()
      .toString()
      .slice(-6)}`;

    const { error } = await supabase
      .from("applications")
      .insert({
        application_id: newApplicationId,
        service: "Aadhaar Update",
        status: "Submitted",
      });

    if (error) {
      console.error(error);
      alert("Application save failed. Please try again.");
      return;
    }

    setApplicationId(newApplicationId);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-blue-700 px-6 py-5 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Seva Sansaar
            </h1>

            <p className="text-sm text-blue-100">
              Citizen Services Portal
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50"
          >
            Dashboard
          </a>

        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-3xl px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          Aadhaar Update Service
        </h2>

        <p className="mt-2 text-gray-600">
          Complete the checklist and fill the demo application form.
        </p>

        {/* Checklist */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

          <h3 className="text-xl font-bold text-gray-900">
            Required Documents
          </h3>

          {/* Progress */}
          <div className="mt-5 rounded-xl bg-blue-50 p-4">

            <div className="flex items-center justify-between">

              <p className="font-semibold text-blue-800">
                Progress
              </p>

              <p className="font-bold text-blue-800">
                {Math.round(progress)}%
              </p>

            </div>

            <p className="mt-1 text-sm text-blue-700">
              {checked.length} of {documents.length} completed
            </p>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />

            </div>

          </div>

          {/* Documents */}
          <div className="mt-6 space-y-3">

            {documents.map((document) => (
              <label
                key={document}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:bg-gray-50"
              >

                <input
                  type="checkbox"
                  checked={checked.includes(document)}
                  onChange={() => toggleDocument(document)}
                  className="h-5 w-5"
                />

                <span
                  className={
                    checked.includes(document)
                      ? "font-medium text-gray-400 line-through"
                      : "font-medium text-gray-800"
                  }
                >
                  {document}
                </span>

              </label>
            ))}

          </div>

          {/* Completed */}
          {checked.length === documents.length && (
            <div className="mt-6 rounded-lg bg-green-100 p-4 text-green-800">
              ✅ All checklist items completed!
            </div>
          )}

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            🖨️ Print Checklist
          </button>

        </div>

        {/* Application Form */}
        {!submitted && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

            <h3 className="text-2xl font-bold text-gray-900">
              Aadhaar Application Form
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Demo form for Seva Sansaar.
            </p>

            {/* Name */}
            <div className="mt-6">

              <label className="font-semibold text-gray-800">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

            {/* Aadhaar */}
            <div className="mt-5">

              <label className="font-semibold text-gray-800">
                Aadhaar Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="Enter 12-digit demo number"
                value={aadhaar}
                onChange={(e) =>
                  setAadhaar(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />

              <p className="mt-1 text-xs text-gray-500">
                Use only a dummy number while testing.
              </p>

            </div>

            {/* Mobile */}
            <div className="mt-5">

              <label className="font-semibold text-gray-800">
                Mobile Number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

            {/* Address */}
            <div className="mt-5">

              <label className="font-semibold text-gray-800">
                Address
              </label>

              <textarea
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="mt-6 w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Submit Application
            </button>

          </div>
        )}

        {/* Submitted */}
        {submitted && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

            <div className="text-4xl">
              ✅
            </div>

            <h4 className="mt-3 text-xl font-bold text-green-800">
              Application Submitted
            </h4>

            <p className="mt-2 text-green-700">
              Your demo application has been saved successfully.
            </p>

            <div className="mt-4 rounded-lg bg-white p-4">

              <p className="text-sm text-gray-500">
                Application ID
              </p>

              <p className="mt-1 text-xl font-bold text-blue-700">
                {applicationId}
              </p>

            </div>

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                onClick={() => window.print()}
                className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                🖨️ Print Application
              </button>

              <a
                href="/dashboard"
                className="rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
              >
                Back to Dashboard
              </a>

            </div>

          </div>
        )}

      </section>

      {/* Footer */}
      <footer className="mt-10 bg-gray-900 px-6 py-8 text-center text-white">

        <p className="font-semibold">
          Seva Sansaar
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Simple • Digital • Citizen Friendly
        </p>

      </footer>

    </main>
  );
}