"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RationCard() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [familyMembers, setFamilyMembers] = useState("");
  const [address, setAddress] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [loading, setLoading] = useState(false);

  const [checked, setChecked] = useState([
    false,
    false,
    false,
    false,
  ]);

  const documents = [
    "Aadhaar Card",
    "Address Proof",
    "Family ID / Parivar Pehchan Patra",
    "Passport Size Photo",
  ];

  const completed = checked.filter(Boolean).length;
  const progress = (completed / documents.length) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !mobile || !familyMembers || !address) {
      alert("Please fill all fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    const newApplicationId = `SS-${Date.now()
      .toString()
      .slice(-6)}`;

    const { error } = await supabase
      .from("applications")
      .insert({
        application_id: newApplicationId,
        service: "Ration Card",
        status: "Submitted",
      });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Application save failed. Please try again.");
      return;
    }

    setApplicationId(newApplicationId);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="text-5xl">✅</div>

          <h1 className="mt-4 text-3xl font-bold text-green-700">
            Application Submitted
          </h1>

          <p className="mt-3 text-gray-600">
            Your Ration Card application has been saved.
          </p>

          <div className="mt-6 rounded-xl bg-blue-50 p-5">
            <p className="text-sm text-gray-600">
              Application ID
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-700">
              {applicationId}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Print Application
            </button>

            <a
              href="/dashboard"
              className="rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <div className="rounded-2xl bg-blue-700 p-8 text-white shadow-lg">
          <p className="text-sm font-semibold text-blue-100">
            SEVA SANSAAR • SERVICE 02
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Ration Card
          </h1>

          <p className="mt-3 text-blue-100">
            Check your documents and prepare your application.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Document Checklist
          </h2>

          <p className="mt-2 text-gray-600">
            Check each document you have.
          </p>

          <div className="mt-6 space-y-4">
            {documents.map((document, index) => (
              <label
                key={document}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={checked[index]}
                  onChange={() => {
                    const updated = [...checked];
                    updated[index] = !updated[index];
                    setChecked(updated);
                  }}
                  className="h-5 w-5"
                />

                <span className="font-medium text-gray-800">
                  {document}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-gray-700">
                Checklist Progress
              </span>

              <span className="text-blue-700">
                {completed}/{documents.length}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl bg-white p-7 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Application Details
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Mobile Number
              </label>

              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Family Members
              </label>

              <input
                type="number"
                min="1"
                value={familyMembers}
                onChange={(e) =>
                  setFamilyMembers(e.target.value)
                }
                placeholder="Number of family members"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
              />
            </div>

          </div>

          <div className="mt-5">
            <label className="mb-2 block font-semibold text-gray-700">
              Address
            </label>

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </form>

        <div className="mt-6">
          <a
            href="/dashboard"
            className="font-semibold text-blue-700 hover:underline"
          >
            ← Back to Dashboard
          </a>
        </div>

      </div>
    </main>
  );
}