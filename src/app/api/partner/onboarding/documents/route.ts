import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { adminStorage } from "@/lib/firebase/admin";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";
import {
  getBusinessBySecret,
  updateBusiness,
} from "@/lib/server/businessStore";
import type {
  PartnerDocument,
  PartnerDocumentType,
} from "@/lib/types/owner";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const MAX_SIZE = 5 * 1024 * 1024;
const DOCUMENT_TYPES: PartnerDocumentType[] = [
  "identity",
  "certificate",
  "police_verification",
];

function isDocumentType(value: string): value is PartnerDocumentType {
  return DOCUMENT_TYPES.includes(value as PartnerDocumentType);
}

export async function POST(req: NextRequest) {
  try {
    const auth = parseOwnerAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const business = await getBusinessBySecret(
      auth.businessId,
      auth.ownerSecret
    );

    if (!business) {
      return NextResponse.json(
        { error: "Invalid business credentials" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const type = String(formData.get("type") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!isDocumentType(type)) {
      return NextResponse.json(
        {
          error:
            "Invalid document type. Use identity, certificate, or police_verification.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Use PDF, JPEG, PNG, or WebP.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "File is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 5 MB limit." },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];

    const storagePath =
      `businesses/${business.id}/onboarding/${type}/${uuidv4()}.${extension}`;

    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(storagePath);

    const buffer = Buffer.from(await file.arrayBuffer());

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const document: PartnerDocument = {
      type,
      fileName: file.name.slice(0, 200),
      storagePath,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      verified: false,
    };

    const existingDocuments = business.documents ?? [];

    const documents = [
      ...existingDocuments.filter((item) => item.type !== type),
      document,
    ];

    const updated = await updateBusiness(
      business.id,
      auth.ownerSecret,
      {
        documents,
        onboardingStatus: "in_progress",
      }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Could not save document information." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        document: {
          type: document.type,
          fileName: document.fileName,
          size: document.size,
          contentType: document.contentType,
          uploadedAt: document.uploadedAt,
          verified: document.verified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/partner/onboarding/documents]", error);

    return NextResponse.json(
      { error: "Document upload failed." },
      { status: 500 }
    );
  }
}