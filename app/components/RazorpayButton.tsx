"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type RazorpayButtonProps = {
  bookingId: number | string;
  amount: number;
};

export default function RazorpayButton({
  bookingId,
  amount,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Razorpay could not be loaded.");
        return;
      }

      // Create Razorpay order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          amount,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error || "Failed to create payment order"
        );
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Seva Sansaar",
        description: "Service Booking Payment",
        order_id: orderData.orderId,

        handler: async (paymentResponse: any) => {
          try {
            const response = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
                bookingId,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.error || "Payment verification failed"
              );
            }

            alert("Payment successful and verified!");

            window.location.reload();
          } catch (error) {
            console.error(error);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response);
        alert(
          response?.error?.description || "Payment failed"
        );
      });

      razorpay.open();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Payment could not be started");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px 20px",
        borderRadius: "8px",
        border: "none",
        background: loading ? "#9ca3af" : "#2563eb",
        color: "white",
        fontSize: "16px",
        fontWeight: "600",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </button>
  );
}