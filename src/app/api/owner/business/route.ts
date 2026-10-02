import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/server/password";
import { getBusinessBySecret, updateBusiness } from "@/lib/server/businessStore";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from "@/lib/constants";
import type { ServiceAreaPlace } from "@/lib/types/owner";
import { listBookingsForBusiness } from "@/lib/server/businessStore";

// Allowlist of updatable fields — prevents mass assignment attacks
const ALLOWED_PATCH_FIELDS = new Set([
  "name",
  "category",
  "services",
  "phone",
  "whatsapp",
  "address",
  "locality",
  "city",
  "hours",
  "pricing",
  "description",
  "photoUrls",
  "serviceAreas",
  "notificationEmail",
  "notificationSms",
  "notificationWhatsapp",
  "contactEmail",
  "newPassword",
]);

// HH:MM time format validator
const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidTimeFormat(time: string): boolean {
  return TIME_FORMAT_REGEX.test(time);
}

function validateWeeklyHours(weekly: unknown): boolean {
  if (typeof weekly !== "object" || weekly === null) return false;
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  for (const day of days) {
    const entry = (weekly as Record<string, unknown>)[day];
    if (entry === null || entry === undefined) continue;
    if (typeof entry !== "object" || entry === null) return false;
    const { open, close } = entry as { open?: unknown; close?: unknown };
    if (typeof open !== "string" || typeof close !== "string") return false;
    if (!isValidTimeFormat(open) || !isValidTimeFormat(close)) return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  const auth = parseOwnerAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const b = await getBusinessBySecret(auth.businessId, auth.ownerSecret);
  if (!b) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bookings = await listBookingsForBusiness(auth.businessId);
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const totalEarnings = bookings
  .filter((booking) => booking.status === "completed")
  .reduce((total, booking) => total + (booking.estimatedAmount ?? 0), 0);

    const completedForEarnings = bookings.filter(
    (booking) => booking.status === "completed");

      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const dailyEarnings = completedForEarnings
        .filter(
          (booking) => new Date(booking.scheduledAt).getTime() >= startOfToday.getTime())
        .reduce((total, booking) => total + (booking.estimatedAmount ?? 0),0 );
      const weeklyEarnings = completedForEarnings
        .filter(
          (booking) => new Date(booking.scheduledAt).getTime() >= startOfWeek.getTime())
        .reduce((total, booking) => total + (booking.estimatedAmount ?? 0),0);
          
  const activeRequests = bookings.filter(
    (booking) =>
      booking.status === "pending" ||
      booking.status === "confirmed" ||
      booking.status === "in_progress"
  ).length;

  const completionRate =
  totalBookings > 0
    ? Math.round((completedBookings / totalBookings) * 100)
    : 0;

  const { passwordHash: _ignored1, ownerSecret: _ignored2, ...safe } = b;

  return NextResponse.json({
    ...safe,
    totalEarnings,
    dailyEarnings,
    weeklyEarnings,
    completionRate,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = parseOwnerAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Record<string, unknown>;

    // Filter to only allowed fields — prevents mass assignment
    const filteredBody: Record<string, unknown> = {};
    for (const key of Object.keys(body)) {
      if (ALLOWED_PATCH_FIELDS.has(key)) {
        filteredBody[key] = body[key];
      }
    }

    // Validate newPassword with password policy consistency
    if (filteredBody.newPassword !== undefined) {
      const newPassword = filteredBody.newPassword;
      if (typeof newPassword !== "string") {
        return NextResponse.json({ error: "newPassword must be a string." }, { status: 400 });
      }
      if (newPassword.length < PASSWORD_MIN_LENGTH) {
        return NextResponse.json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` }, { status: 400 });
      }
      if (!PASSWORD_REGEX.test(newPassword)) {
        return NextResponse.json({ error: "Password must contain at least 1 letter, 1 number, and 1 special character." }, { status: 400 });
      }
    }

    // Validate hours (weekly) time format if provided
    if (filteredBody.hours !== undefined) {
      if (!validateWeeklyHours(filteredBody.hours)) {
        return NextResponse.json({ error: "Invalid hours format. Each day must have open/close in HH:MM format or be null." }, { status: 400 });
      }
    }

    // Sanitize string fields — trim whitespace
    const stringFields = ["name", "category", "phone", "whatsapp", "address", "locality", "city", "description", "contactEmail"] as const;
    for (const field of stringFields) {
      if (typeof filteredBody[field] === "string") {
        filteredBody[field] = (filteredBody[field] as string).trim();
      }
    }

    const patch: Parameters<typeof updateBusiness>[2] = {};
    if (filteredBody.name !== undefined) patch.name = filteredBody.name as string;
    if (filteredBody.category !== undefined) patch.category = filteredBody.category as string;
    if (filteredBody.services !== undefined) patch.services = filteredBody.services as string[];
    if (filteredBody.phone !== undefined) patch.phone = filteredBody.phone as string;
    if (filteredBody.whatsapp !== undefined) patch.whatsapp = filteredBody.whatsapp as string;
    if (filteredBody.address !== undefined) patch.address = filteredBody.address as string;
    if (filteredBody.locality !== undefined) patch.locality = filteredBody.locality as string;
    if (filteredBody.city !== undefined) patch.city = filteredBody.city as string;
    if (filteredBody.hours !== undefined) patch.hours = filteredBody.hours as string;
    if (filteredBody.pricing !== undefined) patch.pricing = filteredBody.pricing as string;
    if (filteredBody.description !== undefined) patch.description = filteredBody.description as string;
    if (filteredBody.photoUrls !== undefined) patch.photoUrls = filteredBody.photoUrls as string[];
    if (filteredBody.serviceAreas !== undefined) patch.serviceAreas = filteredBody.serviceAreas as ServiceAreaPlace[];
    if (filteredBody.notificationEmail !== undefined) patch.notificationEmail = filteredBody.notificationEmail as boolean;
    if (filteredBody.notificationSms !== undefined) patch.notificationSms = filteredBody.notificationSms as boolean;
    if (filteredBody.notificationWhatsapp !== undefined) patch.notificationWhatsapp = filteredBody.notificationWhatsapp as boolean;
    if (filteredBody.contactEmail !== undefined) patch.contactEmail = filteredBody.contactEmail as string;
    if (filteredBody.newPassword !== undefined && typeof filteredBody.newPassword === "string") {
      patch.passwordHash = hashPassword(filteredBody.newPassword);
    }

    const next = await updateBusiness(auth.businessId, auth.ownerSecret, patch);
    if (!next) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ignored1, ownerSecret: _ignored2, ...safe } = next;
    return NextResponse.json(safe);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
