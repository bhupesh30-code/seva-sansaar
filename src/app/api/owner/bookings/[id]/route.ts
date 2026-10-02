import { NextRequest, NextResponse } from "next/server";
import {setBookingStatus,updateBookingPhotoProof,} from "@/lib/server/businessStore";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const auth = parseOwnerAuth(req);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    status?:
      | "pending"
      | "confirmed"
      | "in_progress"
      | "cancelled"
      | "completed";
    serviceOtp?: string;
  };

  if (!body.status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const row = await setBookingStatus(
    auth.businessId,
    auth.ownerSecret,
    id,
    body.status,
    body.serviceOtp
  );

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const auth = parseOwnerAuth(req);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    type?: "before" | "after";
    url?: string;
  };

  if (!body.type || !body.url) {
    return NextResponse.json(
      { error: "type and url are required" },
      { status: 400 }
    );
  }

  if (body.type !== "before" && body.type !== "after") {
    return NextResponse.json(
      { error: "Invalid photo type" },
      { status: 400 }
    );
  }

  const booking = await updateBookingPhotoProof(
    auth.businessId,
    auth.ownerSecret,
    id,
    body.type,
    body.url
  );

  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ booking });
}