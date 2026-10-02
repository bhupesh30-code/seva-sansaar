export type BusinessStatus = "pending" | "approved" | "rejected";

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";

export type ServiceAreaPlace = {
  placeId: string;
  label: string;
  lat: number;
  lng: number;
};

export type PartnerDocumentType =
  | "identity"
  | "certificate"
  | "police_verification";

export type PartnerDocument = {
  type: PartnerDocumentType;
  fileName: string;
  storagePath: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  verified: boolean;
};

export type BusinessRecord = {
  id: string;
  ownerEmail: string;
  passwordHash: string;
  ownerSecret: string;
  estimatedAmount?: number;
  slug: string;
  name: string;
  category: string;
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
  // Partner onboarding / KYC
  onboardingStatus: OnboardingStatus;
  serviceRadiusKm: number;
  documents: PartnerDocument[];
  status: BusinessStatus;
  verified: boolean;
  rating?: number;
  reviews?: number;
  notificationEmail: boolean;
  notificationSms: boolean;
  notificationWhatsapp: boolean;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
};

export type BookingRecord = {
  id: string;
  businessId: string;
  customerName: string;
  estimatedAmount?: number;
  serviceLabel: string;
  scheduledAt: string;
  status: "pending" | "confirmed" | "in_progress" | "cancelled" | "completed";
  createdAt: string;
  customerPhone?: string;
  serviceAddress?: string;
  serviceOtp?: string;
  serviceOtpVerified?: boolean;
  beforePhotoUrls?: string[];
  afterPhotoUrls?: string[];
};

export type AnalyticsEventType = "view" | "whatsapp" | "call" | "inquiry";

export type AnalyticsEvent = {
  id: string;
  businessId: string;
  type: AnalyticsEventType;
  ts: string;
};