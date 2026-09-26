import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const bookingId = Number(body.bookingId);

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId ||
      Number.isNaN(bookingId)
    ) {
      return NextResponse.json(
        { error: "Payment details are missing" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured" },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
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

    const transaction = await prisma.transaction.update({
      where: {
        bookingId: bookingId,
      },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: "PAID",
      },
    });

    await prisma.booking.update({
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
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        error: "Payment verification failed",
      },
      {
        status: 500,
      }
    );
  }
}