import { NextRequest, NextResponse } from "next/server";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";
import {
  getBusinessBySecret,
  updateBusiness,
} from "@/lib/server/businessStore";
import { sanitizeText } from "@/lib/validation";

export async function PATCH(req: NextRequest) {
  try {
    const auth = parseOwnerAuth(req);

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const business = await getBusinessBySecret(
      auth.businessId,
      auth.ownerSecret
    );

    if (!business) {
      return NextResponse.json(
        { error: "Invalid business credentials." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      category?: string;
      services?: string[];
      serviceRadiusKm?: number;
      address?: string;
      locality?: string;
      city?: string;
    };

    const category = sanitizeText(
      body.category?.trim() ?? "",
      100
    );

    const services = Array.isArray(body.services)
      ? body.services
          .map((service) =>
            sanitizeText(String(service).trim(), 200)
          )
          .filter(Boolean)
      : [];

    const address = sanitizeText(
      body.address?.trim() ?? "",
      500
    );

    const locality = sanitizeText(
      body.locality?.trim() ?? "",
      200
    );

    const city = sanitizeText(
      body.city?.trim() ?? "",
      100
    );

    const radius = Number(body.serviceRadiusKm);

    if (!category) {
      return NextResponse.json(
        { error: "Service category is required." },
        { status: 400 }
      );
    }

    if (services.length === 0) {
      return NextResponse.json(
        { error: "At least one service is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(radius) ||
      radius < 1 ||
      radius > 100
    ) {
      return NextResponse.json(
        { error: "Service radius must be between 1 and 100 km." },
        { status: 400 }
      );
    }

    if (!address || !locality || !city) {
      return NextResponse.json(
        { error: "Complete address information is required." },
        { status: 400 }
      );
    }

    const updated = await updateBusiness(
      auth.businessId,
      auth.ownerSecret,
      {
        category,
        services,
        serviceRadiusKm: radius,
        address,
        locality,
        city,
        onboardingStatus: "in_progress",
      }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Unable to update onboarding information." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      onboardingStatus: updated.onboardingStatus,
      serviceRadiusKm: updated.serviceRadiusKm,
    });
  } catch (error) {
    console.error("[partner/onboarding]", error);

    return NextResponse.json(
      { error: "Failed to update onboarding information." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = parseOwnerAuth(req);

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const business = await getBusinessBySecret(
      auth.businessId,
      auth.ownerSecret
    );

    if (!business) {
      return NextResponse.json(
        { error: "Invalid business credentials." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      onboardingStatus: business.onboardingStatus,
      serviceRadiusKm: business.serviceRadiusKm ?? 10,
      category: business.category,
      services: business.services,
      address: business.address,
      locality: business.locality,
      city: business.city,
      documents: (business.documents ?? []).map((document) => ({
        type: document.type,
        fileName: document.fileName,
        uploadedAt: document.uploadedAt,
        verified: document.verified,
      })),
    });
  } catch (error) {
    console.error("[partner/onboarding]", error);

    return NextResponse.json(
      { error: "Failed to load onboarding information." },
      { status: 500 }
    );
  }
}