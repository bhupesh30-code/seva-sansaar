"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { ownerAuthHeader, readOwnerSession } from "@/lib/ownerClient";
import type { BookingRecord } from "@/lib/types/owner";
import { useImageUpload } from "@/hooks/useImageUpload";

const REFRESH_INTERVAL = 15000;

export default function OwnerBookingsPage() {
  const [rows, setRows] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [checklist, setChecklist] = useState<Record<string, boolean[]>>({});
  const [otpBookingId, setOtpBookingId] = useState<string | null>(null);
  const [serviceOtp, setServiceOtp] = useState("");
  const { upload, uploading: photoUploading, error: photoUploadError } = useImageUpload();
  const [photoUploadingId, setPhotoUploadingId] = useState<string | null>(null);

  const CHECKLIST_ITEMS = [
    "Verify customer details",
    "Confirm service requirements",
    "Complete the requested service",
    "Check customer satisfaction",
  ];

  const toggleChecklistItem = (bookingId: string, index: number) => {
    setChecklist((current) => {
      const items = current[bookingId] ?? CHECKLIST_ITEMS.map(() => false);

      return {
        ...current,
        [bookingId]: items.map((checked, itemIndex) =>
          itemIndex === index ? !checked : checked
        ),
      };
    });
  };

  const load = useCallback(async (showRefresh = false) => {
    const session = readOwnerSession();

    if (!session) {
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    }

    try {
      const res = await fetch("/api/owner/bookings", {
        headers: {
          ...ownerAuthHeader(),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load jobs.");
      }

      const data = (await res.json()) as {
        bookings: BookingRecord[];
      };

      setRows(data.bookings);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load jobs. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const interval = window.setInterval(() => {
      void load();
    }, REFRESH_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const incomingJobs = useMemo(
    () => rows.filter((booking) => booking.status === "pending"),
    [rows]
  );

  // FIX: the original filter relied on JS operator precedence
  // ("confirmed" || "in_progress" && dateCheck) which parses as
  // ("confirmed" || ("in_progress" && dateCheck)), so confirmed jobs
  // ignored the date entirely and in_progress jobs (whose scheduledAt
  // is almost always already in the past) were filtered out and
  // silently disappeared from the Accepted Jobs list.
  const acceptedJobs = useMemo(
    () =>
      rows.filter(
        (booking) =>
          booking.status === "confirmed" || booking.status === "in_progress"
      ),
    [rows]
  );

  const completedJobs = useMemo(
    () => rows.filter((booking) => booking.status === "completed"),
    [rows]
  );

  const getCountdown = (scheduledAt: string) => {
    const remainingMs = new Date(scheduledAt).getTime() - now;

    if (remainingMs <= 0) {
      return "Starting now";
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const updateStatus = async (
    id: string,
    status: BookingRecord["status"],
    serviceOtp?: string
  ) => {
    setUpdatingId(id);
    setError("");

    try {
      const res = await fetch(`/api/owner/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...ownerAuthHeader(),
        },
        body: JSON.stringify({
          status,
          ...(serviceOtp ? { serviceOtp } : {}),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error === "invalid_otp"
            ? "Invalid customer OTP."
            : data?.error || "Unable to update the booking."
        );
      }

      setOtpBookingId(null);
      setServiceOtp("");

      await load(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the booking."
      );
    } finally {
      setUpdatingId(null);
    }
  };

const uploadBookingPhoto = async (
  bookingId: string,
  type: "before" | "after",
  file: File
) => {
  setPhotoUploadingId(bookingId);
  setError("");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload-image", {
      method: "POST",
      headers: {
        ...ownerAuthHeader(),
      },
      body: formData,
    });

    const uploadData = await uploadRes.json().catch(() => null);

    if (!uploadRes.ok) {
      throw new Error(uploadData?.error || "Photo upload failed.");
    }

    const res = await fetch(`/api/owner/bookings/${bookingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...ownerAuthHeader(),
      },
      body: JSON.stringify({
        type,
        url: uploadData.url,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Unable to save photo.");
    }

    await load(true);
  } catch (err) {
    console.error(err);
    setError(
      err instanceof Error ? err.message : "Unable to upload photo."
    );
  } finally {
    setPhotoUploadingId(null);
  }
};

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading jobs...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Job Dispatch
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage incoming customer service requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-orange-700">
              Incoming
            </p>
            <Clock3 className="h-5 w-5 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">
            {incomingJobs.length}
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-blue-700">
              Accepted
            </p>
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">
            {acceptedJobs.length}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Completed
            </p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">
            {completedJobs.length}
          </p>
        </div>
      </div>

      {/* Incoming jobs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">
              Incoming Jobs
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              New requests are checked automatically every 15 seconds.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {incomingJobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <Clock3 className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-3 font-bold text-gray-700">
                No incoming jobs
              </p>
              <p className="mt-1 text-sm text-gray-500">
                New customer requests will appear here automatically.
              </p>
            </div>
          )}

          {incomingJobs.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-orange-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-black text-orange-700">
                      NEW REQUEST
                    </span>

                    <span className="text-xs font-semibold text-gray-500">
                      #{booking.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-black text-gray-900">
                    {booking.customerName}
                  </h3>

                  <p className="mt-1 font-semibold text-[#1a2d5c]">
                    {booking.serviceLabel}
                  </p>

                  <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(
                        booking.scheduledAt
                      ).toLocaleDateString("en-IN")}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" />
                      {new Date(
                        booking.scheduledAt
                      ).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-black text-orange-700">
                  <Clock3 className="h-4 w-4" />
                  Response countdown: {getCountdown(booking.scheduledAt)}
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    disabled={updatingId === booking.id}
                    onClick={() =>
                      void updateStatus(booking.id, "confirmed")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {updatingId === booking.id
                      ? "Updating..."
                      : "Accept Job"}
                  </button>

                  <button
                    type="button"
                    disabled={updatingId === booking.id}
                    onClick={() =>
                      void updateStatus(booking.id, "cancelled")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Accepted jobs */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">
          Accepted Jobs
        </h2>

        <div className="mt-3 space-y-3">
          {acceptedJobs.length === 0 && (
            <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
              No accepted upcoming jobs.
            </p>
          )}

          {acceptedJobs.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-gray-900">
                    {booking.customerName}
                  </p>

                  <p className="text-sm text-gray-600">
                    {booking.serviceLabel}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(
                      booking.scheduledAt
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-black capitalize text-blue-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {booking.status === "in_progress" && (
                  <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-3 text-sm font-black text-gray-900">
                      Service Checklist
                    </p>

                    <div className="space-y-2">
                      {CHECKLIST_ITEMS.map((item, index) => {
                        const checked =
                          checklist[booking.id]?.[index] ?? false;

                        return (
                          <label
                            key={item}
                            className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleChecklistItem(booking.id, index)
                              }
                              className="h-4 w-4 rounded"
                            />

                            <span
                              className={
                                checked
                                  ? "line-through text-gray-400"
                                  : ""
                              }
                            >
                              {item}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-5 border-t border-gray-200 pt-4">
                      <p className="mb-3 text-sm font-black text-gray-900">
                        Service Photo Proof
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 text-center transition hover:border-blue-400 hover:bg-blue-50">
                          <span className="text-sm font-bold text-gray-700">
                            Before Service Photo
                          </span>

                          <span className="mt-1 text-xs text-gray-500">
                            Upload a photo before starting the service
                          </span>

                          <input
                            type="file"
                            accept="image/*"
                            className="mt-3 block w-full text-xs"
                            disabled={photoUploadingId === booking.id}
                            onChange={(event) => {
                              const file = event.target.files?.[0];

                              if (file) {
                                void uploadBookingPhoto(
                                  booking.id,
                                  "before",
                                  file
                                );
                              }

                              event.currentTarget.value = "";
                            }}
                          />
                        </label>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 text-center transition hover:border-green-400 hover:bg-green-50">
                          <span className="text-sm font-bold text-gray-700">
                            After Service Photo
                          </span>

                          <span className="mt-1 text-xs text-gray-500">
                            Upload a photo after completing the service
                          </span>

                          <input
                            type="file"
                            accept="image/*"
                            className="mt-3 block w-full text-xs"
                            disabled={photoUploadingId === booking.id}
                            onChange={(event) => {
                              const file = event.target.files?.[0];

                              if (file) {
                                void uploadBookingPhoto(
                                  booking.id,
                                  "after",
                                  file
                                );
                              }

                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                      </div>

                      {photoUploadingId === booking.id && (
                        <p className="mt-3 text-xs font-bold text-blue-600">
                          Uploading photo...
                        </p>
                      )}

                      {(booking.beforePhotoUrls?.length ||
                        booking.afterPhotoUrls?.length) ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {booking.beforePhotoUrls?.map((url) => (
                            <img
                              key={url}
                              src={url}
                              alt="Before service"
                              className="h-32 w-full rounded-lg object-cover"
                            />
                          ))}

                          {booking.afterPhotoUrls?.map((url) => (
                            <img
                              key={url}
                              src={url}
                              alt="After service"
                              className="h-32 w-full rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                )}

                {booking.status === "confirmed" && (
                  <button
                    type="button"
                    disabled={updatingId === booking.id}
                    onClick={() =>
                      void updateStatus(booking.id, "in_progress")
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1a2d5c] px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {updatingId === booking.id ? "Starting..." : "Start Service"}
                  </button>
                )}

                {booking.status === "in_progress" && (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => {
                        setOtpBookingId(booking.id);
                        setServiceOtp("");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Service
                    </button>

                    {otpBookingId === booking.id && (
                      <div className="flex w-full items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={serviceOtp}
                          onChange={(e) =>
                            setServiceOtp(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Customer OTP"
                          className="w-36 rounded-lg border px-3 py-2 text-xs font-bold"
                        />

                        <button
                          type="button"
                          disabled={
                            serviceOtp.length !== 6 ||
                            updatingId === booking.id
                          }
                          onClick={() =>
                            void updateStatus(
                              booking.id,
                              "completed",
                              serviceOtp
                            )
                          }
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-black text-white disabled:opacity-50"
                        >
                          {updatingId === booking.id ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {booking.customerPhone ? (
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
                  >
                    <Phone className="h-4 w-4" />
                    Contact
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-400"
                  >
                    <Phone className="h-4 w-4" />
                    No Phone
                  </button>
                )}
            {booking.serviceAddress ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  booking.serviceAddress
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4" />
                Navigate
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-black text-gray-400"
              >
                <MapPin className="h-4 w-4" />
                No Address
              </button>
            )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Completed jobs ledger */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">
              Completed Jobs Ledger
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Completed services and recorded earnings.
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            {completedJobs.length} completed
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {completedJobs.length === 0 && (
            <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
              No completed jobs yet.
            </p>
          )}

          {completedJobs.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-gray-900">
                    {booking.customerName}
                  </p>

                  <p className="text-sm text-gray-600">
                    {booking.serviceLabel}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(booking.scheduledAt).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-navy">
                    ₹{(booking.estimatedAmount ?? 0).toFixed(2)}
                  </span>

                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black capitalize text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {booking.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}