import { randomBytes } from "crypto";
import type { Query } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { localDb } from "@/lib/server/localDb";
import type {
  AnalyticsEvent,
  AnalyticsEventType,
  BookingRecord,
  BusinessRecord,
  BusinessStatus,
  ServiceAreaPlace,
} from "@/lib/types/owner";

const COL_BUSINESSES = "businesses";
const COL_BOOKINGS = "bookings";
const COL_ANALYTICS = "analyticsEvents";

function generateServiceOtp() {
  return String(randomBytes(3).readUIntBE(0, 3) % 1000000).padStart(6, "0");
}

function slugify(name: string, id: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return `${base || "business"}-${id.slice(0, 6)}`;
}

function getFirestore() {
  return getAdminDb();
}

export async function createBusiness(input: {
  ownerEmail: string;
  passwordHash: string;
  category: string;
  name: string;
  services: string[];
  phone: string;
  whatsapp: string;
  address: string;
  locality: string;
  city: string;
  hours: string;
  pricing: string;
  description: string;
  photoUrls: string[];
  serviceAreas: ServiceAreaPlace[];
}): Promise<BusinessRecord> {
  const ownerSecret = randomBytes(24).toString("hex");
  const id = randomBytes(12).toString("hex");
  const slug = slugify(input.name, id);
  const now = new Date().toISOString();
  const record: BusinessRecord = {
    id,
    ownerEmail: input.ownerEmail.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    ownerSecret,
    slug,
    name: input.name.trim(),
    category: input.category.trim(),
    services: input.services,
    phone: input.phone.trim(),
    whatsapp: input.whatsapp.replace(/\D/g, ""),
    address: input.address.trim(),
    locality: input.locality.trim(),
    city: input.city.trim(),
    hours: input.hours.trim(),
    pricing: input.pricing.trim(),
    description: input.description.trim(),
    photoUrls: input.photoUrls,
    serviceAreas: input.serviceAreas,
    status: "pending",
    verified: false,
    // Partner onboarding / KYC
    onboardingStatus: "not_started",
    serviceRadiusKm: 10,
    documents: [],
    notificationEmail: true,
    notificationSms: false,
    notificationWhatsapp: true,
    contactEmail: input.ownerEmail.trim().toLowerCase(),
    createdAt: now,
    updatedAt: now,
  };

  const db = getFirestore();
  if (db) {
    await db.collection(COL_BUSINESSES).doc(id).set(record);
    return record;
  }

  const data = localDb.read();
  data.businesses[id] = record;
  localDb.write(data);
  return record;
}

export async function findOwnerByEmail(email: string): Promise<BusinessRecord | null> {
  const e = email.trim().toLowerCase();
  const db = getFirestore();
  if (db) {
    const snap = await db.collection(COL_BUSINESSES).where("ownerEmail", "==", e).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0]!.data() as BusinessRecord;
  }
  const data = localDb.read();
  return Object.values(data.businesses).find((b) => b.ownerEmail === e) ?? null;
}

export async function getBusinessById(id: string): Promise<BusinessRecord | null> {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection(COL_BUSINESSES).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as BusinessRecord;
  }
  return localDb.read().businesses[id] ?? null;
}

export async function getBusinessBySlug(slug: string): Promise<BusinessRecord | null> {
  const db = getFirestore();
  if (db) {
    const snap = await db.collection(COL_BUSINESSES).where("slug", "==", slug).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0]!.data() as BusinessRecord;
  }
  return Object.values(localDb.read().businesses).find((b) => b.slug === slug) ?? null;
}

export async function getBusinessBySecret(
  businessId: string,
  ownerSecret: string
): Promise<BusinessRecord | null> {
  const b = await getBusinessById(businessId);
  if (!b || b.ownerSecret !== ownerSecret) return null;
  return b;
}

export async function updateBusiness(
  businessId: string,
  ownerSecret: string,
  patch: Partial<
    Pick<
      BusinessRecord,
      | "name"
      | "category"
      | "services"
      | "phone"
      | "whatsapp"
      | "address"
      | "locality"
      | "city"
      | "hours"
      | "pricing"
      | "description"
      | "photoUrls"
      | "serviceAreas"
      | "onboardingStatus"
      | "serviceRadiusKm"
      | "documents"
      | "notificationEmail"
      | "notificationSms"
      | "notificationWhatsapp"
      | "contactEmail"
    >
  > & { passwordHash?: string }
): Promise<BusinessRecord | null> {
  const current = await getBusinessBySecret(businessId, ownerSecret);
  if (!current) return null;
  const next: BusinessRecord = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (patch.passwordHash) {
    next.passwordHash = patch.passwordHash;
  }

  const db = getFirestore();
  if (db) {
    await db.collection(COL_BUSINESSES).doc(businessId).set(next, { merge: true });
    return next;
  }
  const data = localDb.read();
  data.businesses[businessId] = next;
  localDb.write(data);
  return next;
}

export async function updatePassword(
  businessId: string,
  ownerSecret: string,
  newPasswordHash: string
): Promise<boolean> {
  const u = await updateBusiness(businessId, ownerSecret, { passwordHash: newPasswordHash });
  return u !== null;
}

export async function listBookingsForBusiness(businessId: string): Promise<BookingRecord[]> {
  const db = getFirestore();
  if (db) {
    const snap = await db.collection(COL_BOOKINGS).where("businessId", "==", businessId).get();
    return snap.docs
      .map((d) => d.data() as BookingRecord)
      .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
  }
  return Object.values(localDb.read().bookings)
    .filter((b) => b.businessId === businessId)
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
}

export async function seedBookingsIfEmpty(businessId: string) {
  const existing = await listBookingsForBusiness(businessId);
  if (existing.length > 0) return;

  const samples: Omit<BookingRecord, "id">[] = [
    {
      businessId,
      customerName: "Sample Customer",
      customerPhone: "9876543210",
      serviceAddress: "Lonavala, Maharashtra, India",
      serviceLabel: "Home visit",
      scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      businessId,
      customerName: "Priya S.",
      customerPhone: "9876543210",
      serviceAddress: "Lonavala, Maharashtra, India",
      serviceLabel: "Consultation",
      scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: "completed",
      createdAt: new Date().toISOString(),
    },
  ];

  const db = getFirestore();
  if (db) {
    const batch = db.batch();
    for (const s of samples) {
      const id = randomBytes(8).toString("hex");
      const row: BookingRecord = { ...s, id };
      batch.set(db.collection(COL_BOOKINGS).doc(id), row);
    }
    await batch.commit();
    return;
  }
  const data = localDb.read();
  for (const s of samples) {
    const id = randomBytes(8).toString("hex");
    data.bookings[id] = { ...s, id };
  }
  localDb.write(data);
}

export type BookingStatusUpdateResult =
  | { ok: true; booking: BookingRecord }
  | {
      ok: false;
      reason: "not_found" | "invalid_transition" | "invalid_otp";
    };

export async function setBookingStatus(
  businessId: string,
  ownerSecret: string,
  bookingId: string,
  status: BookingRecord["status"],
  serviceOtp?: string
): Promise<BookingStatusUpdateResult> {
  const b = await getBusinessBySecret(businessId, ownerSecret);

  if (!b) {
    return { ok: false, reason: "not_found" };
  }

  const allowedTransitions: Record<
    BookingRecord["status"],
    BookingRecord["status"][]
  > = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    cancelled: [],
    completed: [],
  };

  const db = getFirestore();
  if (db) {
    const ref = db.collection(COL_BOOKINGS).doc(bookingId);
    const doc = await ref.get();
    if (!doc.exists) {
      return { ok: false, reason: "not_found" };
    }
    const row = doc.data() as BookingRecord;
    if (row.businessId !== businessId) {
      return { ok: false, reason: "not_found" };
    }
    if (!allowedTransitions[row.status].includes(status)) {
      return { ok: false, reason: "invalid_transition" };
    }
    if (status === "completed") {
      if (!serviceOtp || serviceOtp !== row.serviceOtp) {
        return { ok: false, reason: "invalid_otp" };
      }
    }
    const next: BookingRecord = {
      ...row,
      status,
      ...(status === "in_progress"
        ? {
            serviceOtp: generateServiceOtp(),
            serviceOtpVerified: false,
          }
        : {}),
    };
    await ref.set(next);
    return { ok: true, booking: next };
  }
  const data = localDb.read();
  const row = data.bookings[bookingId];
  if (!row || row.businessId !== businessId) {
    return { ok: false, reason: "not_found" };
  }
  if (!allowedTransitions[row.status].includes(status)) {
    return { ok: false, reason: "invalid_transition" };
  }
  if (status === "completed") {
    if (!serviceOtp || serviceOtp !== row.serviceOtp) {
      return { ok: false, reason: "invalid_otp" };
    }
  }
  row.status = status;
  if (status === "in_progress") {
    row.serviceOtp = generateServiceOtp();
    row.serviceOtpVerified = false;
  }
  localDb.write(data);
  return { ok: true, booking: row };
}

export async function updateBookingPhotoProof(
  businessId: string,
  ownerSecret: string,
  bookingId: string,
  type: "before" | "after",
  url: string
): Promise<BookingRecord | null> {
  const b = await getBusinessBySecret(businessId, ownerSecret);
  if (!b) {
    return null;
  }
  const db = getFirestore();
  if (db) {
    const ref = db.collection(COL_BOOKINGS).doc(bookingId);
    const doc = await ref.get();
    if (!doc.exists) {
      return null;
    }
    const row = doc.data() as BookingRecord;

    if (row.businessId !== businessId) {
      return null;
    }
    const field = type === "before" ? "beforePhotoUrls" : "afterPhotoUrls";
    const currentUrls = row[field] ?? [];
    const next: BookingRecord = {
      ...row,
      [field]: [...currentUrls, url],
    };
    await ref.set(next);
    return next;
  }
  const data = localDb.read();
  const row = data.bookings[bookingId];
  if (!row || row.businessId !== businessId) {
    return null;
  }

  const field = type === "before" ? "beforePhotoUrls" : "afterPhotoUrls";
  const currentUrls = row[field] ?? [];
  row[field] = [...currentUrls, url];
  localDb.write(data);
  return row;
}

export async function logAnalyticsEvent(
  businessId: string,
  type: AnalyticsEventType
): Promise<void> {
  const id = randomBytes(10).toString("hex");
  const ev: AnalyticsEvent = {
    id,
    businessId,
    type,
    ts: new Date().toISOString(),
  };
  const db = getFirestore();
  if (db) {
    await db.collection(COL_ANALYTICS).doc(id).set(ev);
    return;
  }
  const data = localDb.read();
  data.analytics.push(ev);
  localDb.write(data);
}

export async function getAnalyticsSeries(
  businessId: string,
  weeks = 8
): Promise<{ week: string; views: number; inquiries: number; bookings: number }[]> {
  const db = getFirestore();
  let events: AnalyticsEvent[] = [];
  if (db) {
    const snap = await db.collection(COL_ANALYTICS).where("businessId", "==", businessId).get();
    events = snap.docs.map((d) => d.data() as AnalyticsEvent);
  } else {
    events = localDb.read().analytics.filter((e) => e.businessId === businessId);
  }

  const bookingRows = await listBookingsForBusiness(businessId);
  const now = new Date();

  type Bucket = { label: string; start: number; end: number; views: number; inquiries: number; bookings: number };
  const buckets: Bucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    buckets.push({
      label: formatWeekLabel(end),
      start: start.getTime(),
      end: end.getTime(),
      views: 0,
      inquiries: 0,
      bookings: 0,
    });
  }

  for (const e of events) {
    const t = new Date(e.ts).getTime();
    const b = buckets.find((x) => t >= x.start && t <= x.end);
    if (!b) continue;
    if (e.type === "view") b.views += 1;
    if (e.type === "whatsapp" || e.type === "call" || e.type === "inquiry") b.inquiries += 1;
  }

  for (const bk of bookingRows) {
    const t = new Date(bk.createdAt).getTime();
    const b = buckets.find((x) => t >= x.start && t <= x.end);
    if (!b) continue;
    b.bookings += 1;
  }

  return buckets.map(({ label, views, inquiries, bookings }) => ({
    week: label,
    views,
    inquiries,
    bookings,
  }));
}

function formatWeekLabel(d: Date) {
  const m = d.toLocaleString("en-IN", { month: "short" });
  const day = d.getDate();
  return `${m} ${day}`;
}

/** All business records (Firestore or local fallback); ids always set. */
export async function listAllBusinessRecords(): Promise<BusinessRecord[]> {
  const db = getFirestore();
  if (db) {
    const snap = await db.collection(COL_BUSINESSES).get();
    return snap.docs.map((d) => {
      const row = d.data() as BusinessRecord;
      return { ...row, id: d.id };
    });
  }
  return Object.values(localDb.read().businesses);
}

/**
 * Retrieves a list of registered businesses, optionally filtered by city.
 * Used for geo-local searches and admin dashboard lists.
 *
 * @param city - Optional city name to filter (e.g., 'Jamshedpur')
 * @returns A promise that resolves to an array of BusinessRecord objects.
 */
export async function listBusinessesInCity(city?: string): Promise<BusinessRecord[]> {
  try {
    const db = getFirestore();
    if (db) {
      let q: Query = db.collection(COL_BUSINESSES);
      if (city) q = q.where("city", "==", city);
      const snap = await q.get();
      return snap.docs.map((d) => d.data() as BusinessRecord);
    }
  } catch (err) {
    console.error("[listBusinessesInCity] Firestore error:", err);
  }
  const data = localDb.read();
  let list = Object.values(data.businesses);
  if (city) list = list.filter((b) => b.city === city);
  return list;
}

/** Admin tool: set approval (used by admin UI later) */
export async function setBusinessApproval(
  businessId: string,
  status: BusinessStatus,
  verified: boolean
): Promise<void> {
  const db = getFirestore();
  if (db) {
    await db.collection(COL_BUSINESSES).doc(businessId).set({ status, verified, updatedAt: new Date().toISOString() }, { merge: true });
    return;
  }
  const data = localDb.read();
  const b = data.businesses[businessId];
  if (!b) return;
  b.status = status;
  b.verified = verified;
  b.updatedAt = new Date().toISOString();
  localDb.write(data);
}
