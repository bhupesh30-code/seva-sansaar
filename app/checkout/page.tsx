"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type CartItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("sevaSansaarCart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const serviceFee = subtotal > 0 ? 10 : 0;
  const total = subtotal + serviceFee;

  const handleDemoPayment = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!phone.trim() || phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      router.push("/cart");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first.");
        router.push("/login");
        return;
      }

      // DEMO PAYMENT
      // No real money is charged.
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const firstItem = cart[0];

      // STEP 1: Create booking
      const { data: booking, error: bookingError } =
        await supabase
          .from("bookings")
          .insert({
            user_id: user.id,
            service_id: firstItem.id,
            service_name:
              cart.length === 1
                ? firstItem.name
                : `${firstItem.name} + ${
                    cart.length - 1
                  } more service(s)`,
            booking_date: new Date()
              .toISOString()
              .split("T")[0],
            booking_time: "Demo Payment",
            status: "CONFIRMED",
          })
          .select()
          .single();

      if (bookingError) {
        console.error("BOOKING ERROR:", bookingError);

        alert(
          "Payment demo succeeded, but booking could not be created: " +
            bookingError.message
        );

        return;
      }

      // Unique demo transaction reference
      const transactionReference =
        "DEMO_TXN_" + Date.now();

      // STEP 2: Save transaction in Supabase
      const { error: transactionError } =
        await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            booking_id: booking.id,
            amount: total,
            payment_method: "DEMO",
            status: "PAID",
            transaction_reference:
              transactionReference,
          });

      // If transaction fails, cancel the booking
      if (transactionError) {
        console.error(
          "TRANSACTION ERROR:",
          transactionError
        );

        await supabase
          .from("bookings")
          .update({
            status: "CANCELLED",
          })
          .eq("id", booking.id);

        alert(
          "Transaction could not be saved. Booking has been cancelled.\n\n" +
            transactionError.message
        );

        return;
      }

      // STEP 3: Also save last transaction locally
      const demoTransaction = {
        transactionId: transactionReference,
        bookingId: booking.id,
        amount: total,
        status: "PAID",
        method: "DEMO",
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "sevaSansaarLastTransaction",
        JSON.stringify(demoTransaction)
      );

      // STEP 4: Clear cart
      localStorage.removeItem("sevaSansaarCart");

      // STEP 5: Success message
      alert(
        `Demo Payment Successful!\n\n` +
          `Amount Paid: ₹${total}\n` +
          `Booking ID: #${booking.id}\n` +
          `Transaction ID: ${transactionReference}`
      );

      // STEP 6: Go to bookings
      router.push("/my-bookings");
      router.refresh();
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert("Demo payment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={emptyStyle}>
            <h2>Your cart is empty</h2>

            <button
              onClick={() => router.push("/dashboard")}
              style={primaryButton}
            >
              Browse Services
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>
              Seva Sansaar
            </h1>

            <p style={{ marginBottom: 0 }}>
              Secure Checkout
            </p>
          </div>

          <button
            onClick={() => router.push("/cart")}
            style={backButton}
          >
            ← Back to Cart
          </button>
        </div>

        <div style={gridStyle}>
          {/* CUSTOMER DETAILS */}

          <section style={cardStyle}>
            <h2>Customer Details</h2>

            <label style={labelStyle}>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              style={inputStyle}
            />

            <label style={labelStyle}>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={inputStyle}
            />

            <label style={labelStyle}>
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value.replace(/\D/g, "")
                )
              }
              maxLength={10}
              style={inputStyle}
            />

            <div style={demoBox}>
              🧪 DEMO PAYMENT MODE
              <br />
              No real money will be charged.
            </div>
          </section>

          {/* ORDER SUMMARY */}

          <section style={cardStyle}>
            <h2>Order Summary</h2>

            {cart.map((item) => (
              <div
                key={item.id}
                style={itemStyle}
              >
                <div>
                  <h3 style={{ margin: "0 0 5px" }}>
                    {item.name}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                    }}
                  >
                    ₹{Number(item.price)} ×{" "}
                    {item.quantity}
                  </p>
                </div>

                <strong>
                  ₹
                  {Number(item.price) *
                    item.quantity}
                </strong>
              </div>
            ))}

            <hr
              style={{
                margin: "20px 0",
                border: "none",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            />

            <div style={summaryRow}>
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>

            <div style={summaryRow}>
              <span>Service Fee</span>
              <strong>₹{serviceFee}</strong>
            </div>

            <div
              style={{
                ...summaryRow,
                fontSize: "20px",
                marginTop: "15px",
              }}
            >
              <strong>Total</strong>
              <strong>₹{total}</strong>
            </div>

            <button
              onClick={handleDemoPayment}
              disabled={loading}
              style={{
                ...paymentButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? "Processing Demo Payment..."
                : `🧪 Pay ₹${total} (Demo)`}
            </button>

            <p style={paymentNote}>
              Test payment • No real money
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

/* STYLES */

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f7fb",
  padding: "30px 20px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const headerStyle = {
  background: "#111827",
  color: "white",
  padding: "25px",
  borderRadius: "14px",
  marginBottom: "25px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap" as const,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(320px,1fr))",
  gap: "20px",
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
};

const labelStyle = {
  display: "block",
  marginTop: "18px",
  marginBottom: "8px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
};

const itemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  padding: "12px 0",
  borderBottom:
    "1px solid #f0f0f0",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
};

const paymentButton = {
  width: "100%",
  marginTop: "25px",
  padding: "14px",
  border: "none",
  borderRadius: "9px",
  background: "#16a34a",
  color: "white",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
};

const backButton = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#374151",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const primaryButton = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const demoBox = {
  marginTop: "20px",
  padding: "14px",
  borderRadius: "8px",
  background: "#fef3c7",
  color: "#92400e",
  fontWeight: "600",
  fontSize: "14px",
};

const paymentNote = {
  textAlign: "center" as const,
  color: "#6b7280",
  fontSize: "13px",
};

const emptyStyle = {
  background: "white",
  padding: "50px",
  borderRadius: "14px",
  textAlign: "center" as const,
};