import { NextResponse } from "next/server";
import crypto from "crypto";
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

const razorpayOrderId = String(
  body.razorpay_order_id ?? ""
).trim();

const razorpayPaymentId = String(
  body.razorpay_payment_id ?? ""
).trim();

const razorpaySignature = String(
  body.razorpay_signature ?? ""
).trim();

const bookingId = String(
  body.bookingId ?? ""
).trim();

if (
  !razorpayOrderId ||
  !razorpayPaymentId ||
  !razorpaySignature ||
  !bookingId
) {
  return NextResponse.json(
    {
      success: false,
      error: "Payment details are missing",
    },
    { status: 400 }
  );
}

const secret = process.env.RAZORPAY_KEY_SECRET;

if (!secret) {
  console.error(
    "RAZORPAY_KEY_SECRET is not configured."
  );

  return NextResponse.json(
    {
      success: false,
      error: "Razorpay secret is not configured",
    },
    { status: 500 }
  );
}

const generatedSignature = crypto
  .createHmac("sha256", secret)
  .update(
    `${razorpayOrderId}|${razorpayPaymentId}`
  )
  .digest("hex");

if (generatedSignature !== razorpaySignature) {
  return NextResponse.json(
    {
      success: false,
      error: "Invalid payment signature",
    },
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
    {
      success: false,
      error: "Booking not found",
    },
    { status: 404 }
  );
}

const transaction =
  await db.transaction.update({
    where: {
      bookingId: bookingId,
    },
    data: {
      razorpayPaymentId: razorpayPaymentId,
      status: "PAID",
    },
  });

await db.booking.update({
  where: {
    id: bookingId,
  },
  data: {
    paymentStatus: "PAID",
    status: "CONFIRMED",
  },
});

return NextResponse.json({
  success: true,
  transaction,
  message: "Payment verified successfully",
});

} catch (error: unknown) {
console.error(
"Payment verification error:",
error
);

const message =
  error instanceof Error
    ? error.message
    : "Payment verification failed";

return NextResponse.json(
  {
    success: false,
    error: message,
  },
  { status: 500 }
);

}
}