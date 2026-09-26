import { NextResponse } from "next/server";
import { razorpay } from "@/app/lib/razorpay";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = Number(body.amount);
    const bookingId = Number(body.bookingId);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!bookingId || Number.isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
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

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `booking_${bookingId}`,
    });

    await prisma.transaction.upsert({
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
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        error: "Unable to create payment order",
      },
      {
        status: 500,
      }
    );
  }
}