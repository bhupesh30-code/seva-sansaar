"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { ownerAuthHeader } from "@/lib/ownerClient";

type PartnerDocumentType =
  | "identity"
  | "certificate"
  | "police_verification";

type OnboardingDocument = {
  type: PartnerDocumentType;
  fileName: string;
  uploadedAt: string;
  verified: boolean;
  size?: number;
  contentType?: string;
};

type OnboardingData = {
  onboardingStatus:
    | "not_started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected";
  serviceRadiusKm: number;
  category: string;
  services: string[];
  address: string;
  locality: string;
  city: string;
  documents: OnboardingDocument[];
};
const CATEGORIES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "AC Repair",
  "Appliance Repair",
  "Cleaning",
  "Beauty & Salon",
  "Pest Control",
  "Other",
];

function calculateProgress(data: OnboardingData) {
  const checks = [
    Boolean(data.category.trim()),
    data.services.length > 0,
    data.serviceRadiusKm >= 1,
    Boolean(data.address.trim()),
    Boolean(data.locality.trim()),
    Boolean(data.city.trim()),
  ];

  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );
}

export default function PartnerOnboardingPage() {
  const router = useRouter();

const [form, setForm] = useState<OnboardingData>({
  onboardingStatus: "not_started",
  serviceRadiusKm: 10,
  category: "",
  services: [],
  address: "",
  locality: "",
  city: "",
  documents: [],
});

  const [serviceInput, setServiceInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingDocument, setUploadingDocument] =
  useState<PartnerDocumentType | null>(null);

  const progress = useMemo(
    () => calculateProgress(form),
    [form]
  );

  useEffect(() => {
    async function loadOnboarding() {
      try {
        const response = await fetch("/api/partner/onboarding", {
          headers: ownerAuthHeader(),
        });

        if (response.status === 401) {
          router.replace("/owner/login?redirect=/dashboard/onboarding");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load onboarding data.");
        }

      setForm({
        onboardingStatus: data.onboardingStatus ?? "not_started",
        serviceRadiusKm: data.serviceRadiusKm ?? 10,
        category: data.category ?? "",
        services: Array.isArray(data.services) ? data.services : [],
        address: data.address ?? "",
        locality: data.locality ?? "",
        city: data.city ?? "",
        documents: Array.isArray(data.documents) ? data.documents : [],
      });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load onboarding data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOnboarding();
  }, [router]);

  function addService() {
    const value = serviceInput.trim();

    if (!value) return;

    if (form.services.some(
      (service) => service.toLowerCase() === value.toLowerCase()
    )) {
      setServiceInput("");
      return;
    }

    if (form.services.length >= 10) {
      setError("You can add up to 10 services.");
      return;
    }

    setForm((current) => ({
      ...current,
      services: [...current.services, value],
    }));

    setServiceInput("");
    setError("");
  }

  function removeService(service: string) {
    setForm((current) => ({
      ...current,
      services: current.services.filter(
        (item) => item !== service
      ),
    }));
  }

  async function handleDocumentUpload(
  type: PartnerDocumentType,
  file: File | undefined
) {
  if (!file) return;

  setError("");
  setSuccess("");

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setError("Invalid file type. Use PDF, JPEG, PNG, or WebP.");
    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    setError("File exceeds the 5 MB limit.");
    return;
  }

  setUploadingDocument(type);

  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(
      "/api/partner/onboarding/documents",
      {
        method: "POST",
        headers: {
          ...ownerAuthHeader(),
        },
        body: formData,
      }
    );

    if (response.status === 401) {
      router.replace(
        "/owner/login?redirect=/dashboard/onboarding"
      );
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Document upload failed."
      );
    }

    setForm((current) => {
      const updatedDocuments = [
        ...current.documents.filter(
          (document) => document.type !== type
        ),
        data.document,
      ];

      return {
        ...current,
        documents: updatedDocuments,
        onboardingStatus: "in_progress",
      };
    });

    setSuccess("Document uploaded successfully.");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Document upload failed."
    );
  } finally {
    setUploadingDocument(null);
  }
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.category.trim()) {
      setError("Please select your service category.");
      return;
    }

    if (form.services.length === 0) {
      setError("Please add at least one service.");
      return;
    }

    if (
      !Number.isFinite(form.serviceRadiusKm) ||
      form.serviceRadiusKm < 1 ||
      form.serviceRadiusKm > 100
    ) {
      setError("Service radius must be between 1 and 100 km.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (!form.locality.trim()) {
      setError("Please enter your locality.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/partner/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...ownerAuthHeader(),
        },
        body: JSON.stringify({
          category: form.category,
          services: form.services,
          serviceRadiusKm: form.serviceRadiusKm,
          address: form.address,
          locality: form.locality,
          city: form.city,
        }),
      });

      if (response.status === 401) {
        router.replace("/owner/login?redirect=/dashboard/onboarding");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save onboarding.");
      }

      setForm((current) => ({
        ...current,
        onboardingStatus: data.onboardingStatus,
        serviceRadiusKm: data.serviceRadiusKm,
      }));

      setSuccess("Onboarding information saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save onboarding."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading onboarding...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
          <ShieldCheck className="h-4 w-4" />
          Partner onboarding
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Complete your professional profile
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Add your service information and operating area. You will
              complete document verification in the next onboarding step.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-8">
              <span className="text-sm font-medium text-slate-600">
                Profile progress
              </span>
              <span className="text-sm font-bold text-slate-900">
                {progress}%
              </span>
            </div>

            <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span>
          Status:{" "}
          <strong className="capitalize">
            {form.onboardingStatus.replace("_", " ")}
          </strong>
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Professional details */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Professional details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tell customers what service you provide.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Service category
              </span>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select category</option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Services
              </label>

              <div className="flex gap-2">
                <input
                  value={serviceInput}
                  onChange={(event) =>
                    setServiceInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addService();
                    }
                  }}
                  placeholder="e.g. Wiring repair"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={addService}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Add
                </button>
              </div>

              {form.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.services.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => removeService(service)}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      title="Remove service"
                    >
                      {service} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Service area */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Service area
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Define where you are available to serve customers.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Full address
              </span>

              <textarea
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                rows={3}
                placeholder="House / street / area"
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Locality
              </span>

              <input
                value={form.locality}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    locality: event.target.value,
                  }))
                }
                placeholder="e.g. Beltola"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                City
              </span>

              <input
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
                placeholder="e.g. Guwahati"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Service radius
                </span>

                <span className="text-sm font-bold text-blue-600">
                  {form.serviceRadiusKm} km
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="100"
                value={form.serviceRadiusKm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    serviceRadiusKm: Number(event.target.value),
                  }))
                }
                className="w-full accent-blue-600"
              />

              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>1 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </label>
          </div>
        </section>

               {/* Document verification */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Document verification
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload the documents required to complete partner verification.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                type: "identity" as PartnerDocumentType,
                title: "Identity document",
                description:
                  "Government ID or approved identity document.",
              },
              {
                type: "certificate" as PartnerDocumentType,
                title: "Certification",
                description:
                  "Trade, skill, or professional certification.",
              },
              {
                type: "police_verification" as PartnerDocumentType,
                title: "Police verification",
                description:
                  "Police verification or character certificate.",
              },
            ].map((document) => {
              const uploaded = form.documents.some(
                (item) => item.type === document.type
              );

              const uploading =
                uploadingDocument === document.type;

              return (
                <div
                  key={document.type}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {document.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {document.description}
                      </p>
                    </div>

                    {uploaded && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    )}
                  </div>

                  {uploaded ? (
                    <div className="rounded-xl bg-emerald-50 px-3 py-3">
                      <p className="truncate text-xs font-medium text-emerald-800">
                        {
                          form.documents.find(
                            (item) => item.type === document.type
                          )?.fileName
                        }
                      </p>

                      <p className="mt-1 text-xs text-emerald-600">
                        Uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50">
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload document
                        </>
                      )}

                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        disabled={uploadingDocument !== null}
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          void handleDocumentUpload(
                            document.type,
                            file
                          );

                          event.target.value = "";
                        }}
                      />
                    </label>
                  )}

                  <p className="mt-3 text-[11px] text-slate-400">
                    PDF, JPG, PNG, or WebP · Maximum 5 MB
                  </p>
                </div>
              );
            })}
          </div>
        </section>
        
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to dashboard
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save & Continue
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}