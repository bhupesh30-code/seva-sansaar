"use client";

import { useState } from "react";

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayErrorResponse = {
  error?: {
    description?: string;
    code?: string;
    reason?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (response: RazorpayErrorResponse) => void
  ) => void;
};

type RazorpayConstructor = new (
  options: RazorpayOptions
) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
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

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () =>
          resolve(false)
        );
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const loaded = await loadRazorpay();

      if (!loaded || !window.Razorpay) {
        alert("Razorpay could not be loaded.");
        return;
      }

      const orderResponse = await fetch(
        "/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            amount,
          }),
        }
      );

      const orderData: {
        key?: string;
        amount?: number;
        currency?: string;
        orderId?: string;
        error?: string;
      } = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error ||
            "Failed to create payment order"
        );
      }

      if (
        !orderData.key ||
        !orderData.amount ||
        !orderData.orderId
      ) {
        throw new Error(
          "Invalid payment order received from server"
        );
      }

      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Seva Sansaar",
        description: "Service Booking Payment",
        order_id: orderData.orderId,

        handler: async (
          paymentResponse: RazorpayPaymentResponse
        ) => {
          try {
            const response = await fetch(
              "/api/payment/verify",
              {
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
              }
            );

            const data: {
              error?: string;
              success?: boolean;
            } = await response.json();

            if (!response.ok) {
              throw new Error(
                data.error ||
                  "Payment verification failed"
              );
            }

            alert(
              "Payment successful and verified!"
            );

            window.location.reload();
          } catch (error: unknown) {
            console.error(
              "Payment verification error:",
              error
            );

            const message =
              error instanceof Error
                ? error.message
                : "Payment verification failed";

            alert(message);
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

      const razorpay = new window.Razorpay(
        options
      );

      razorpay.on(
        "payment.failed",
        (
          response: RazorpayErrorResponse
        ) => {
          console.error(
            "Payment failed:",
            response
          );

          alert(
            response.error?.description ||
              "Payment failed"
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error: unknown) {
      console.error(
        "Payment start error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Payment could not be started";

      alert(message);
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
        background: loading
          ? "#9ca3af"
          : "#2563eb",
        color: "white",
        fontSize: "16px",
        fontWeight: "600",
        cursor: loading
          ? "not-allowed"
          : "pointer",
      }}
    >
      {loading
        ? "Processing..."
        : `Pay ₹${amount}`}
    </button>
  );
}