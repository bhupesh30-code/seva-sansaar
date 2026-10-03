import { NextResponse } from "next/server";
import { razorpay } from "../../../lib/razorpay";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

let prisma: PrismaClient | undefined;

function getPrisma() {
if (!prisma) {
prisma = new PrismaClient();
}

return prisma;
}

export async function POST(req: Request) {
try {
const body = await req.json();

const amount = Number(body.amount);
const bookingId = String(body.bookingId ?? "").trim();

if (!Number.isFinite(amount) || amount <= 0) {
  return NextResponse.json(
    { error: "Invalid amount" },
    { status: 400 }
  );
}

if (!bookingId) {
  return NextResponse.json(
    { error: "Invalid booking ID" },
    { status: 400 }
  );
}

const db = getPrisma();

const booking = await db.booking.findUnique({
  where: {
    id: bookingId,
  },
});

if (!booking) {
  return NextResponse.json(
    { error: "Booking not found" },
    { status: 404 }
  );
}

const order = await razorpay.orders.create({
  amount: Math.round(amount * 100),
  currency: "INR",
  receipt: `booking_${bookingId}`,
});

await db.transaction.upsert({
  where: {
    bookingId: bookingId,
  },
  update: {
    razorpayOrderId: order.id,
    amount: amount,
    status: "PENDING",
  },
  create: {
    bookingId: bookingId,
    razorpayOrderId: order.id,
    amount: amount,
    method: "UPI",
    status: "PENDING",
  },
});

return NextResponse.json({
  success: true,
  orderId: order.id,
  amount: order.amount,
  currency: order.currency,
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
});

} catch (error: unknown) {
console.error("Create order error:", error);

const message =
  error instanceof Error
    ? error.message
    : "Unable to create payment order";

return NextResponse.json(
  {
    error: message,
  },
  { status: 500 }
);

}
}