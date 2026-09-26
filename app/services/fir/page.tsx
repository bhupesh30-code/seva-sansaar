"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

const documents = [
  "Identity Proof",
  "Address Proof",
  "Incident Details",
  "Supporting Documents",
];

export default function FIRPage() {
  const [checked, setChecked] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentDetails, setIncidentDetails] = useState("");

  const toggleDocument = (document: string) => {
    setChecked((current) =>
      current.includes(document)
        ? current.filter((item) => item !== document)
        : [...current, document]
    );
  };

  const progress = (checked.length / documents.length) * 100;

  const handleSubmit = async () => {
    if (!name || !mobile || !incidentDate || !incidentDetails) {
      alert("Please fill all fields");
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
        service: "FIR",
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

      <section className="mx-auto max-w-3xl px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          FIR Service
        </h2>

        <p className="mt-2 text-gray-600">
          Prepare the required information and complete the
          demo application form.
        </p>

        {/* Checklist */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

          <h3 className="text-xl font-bold text-gray-900">
            Required Information
          </h3>

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

          <div className="mt-6 space-y-3">

            {documents.map((document) => (
              <label
                key={document}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-gray-50"
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

          {checked.length === documents.length && (
            <div className="mt-6 rounded-lg bg-green-100 p-4 text-green-800">
              ✅ All checklist items completed!
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            🖨️ Print Checklist
          </button>

        </div>

        {/* Form */}
        {!submitted && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

            <h3 className="text-2xl font-bold text-gray-900">
              FIR Application Form
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Demo form only. This does not submit an actual FIR.
            </p>

            <div className="mt-6">

              <label className="font-semibold">
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

            <div className="mt-5">

              <label className="font-semibold">
                Mobile Number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ""))
                }
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

            <div className="mt-5">

              <label className="font-semibold">
                Incident Date
              </label>

              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

            <div className="mt-5">

              <label className="font-semibold">
                Incident Details
              </label>

              <textarea
                placeholder="Describe the incident"
                value={incidentDetails}
                onChange={(e) => setIncidentDetails(e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />

            </div>

            <button
              onClick={handleSubmit}
              className="mt-6 w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Submit Application
            </button>

          </div>
        )}

        {/* Success */}
        {submitted && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

            <div className="text-4xl">
              ✅
            </div>

            <h4 className="mt-3 text-xl font-bold text-green-800">
              Application Submitted
            </h4>

            <p className="mt-2 text-green-700">
              Your demo FIR application has been saved successfully.
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
                className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
              >
                🖨️ Print Application
              </button>

              <a
                href="/dashboard"
                className="rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700"
              >
                Back to Dashboard
              </a>

            </div>

          </div>
        )}

      </section>

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