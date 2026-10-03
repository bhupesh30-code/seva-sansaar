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

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const firstItem = cart[0];

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

      const transactionReference =
        "DEMO_TXN_" + Date.now();

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

      localStorage.removeItem("sevaSansaarCart");

      alert(
        `Demo Payment Successful!\n\n` +
          `Amount Paid: ₹${total}\n` +
          `Booking ID: #${booking.id}\n` +
          `Transaction ID: ${transactionReference}`
      );

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
      <main style={styles.page}>
        <div style={styles.emptyWrapper}>
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🛒</div>

            <div style={styles.badge}>
              CHECKOUT
            </div>

            <h1 style={styles.emptyTitle}>
              Your cart is empty
            </h1>

            <p style={styles.emptyText}>
              Add a service to your cart before
              continuing to checkout.
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              style={styles.primaryButton}
            >
              Browse Services →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          onClick={() => router.push("/")}
          style={styles.logo}
        >
          Seva<span>Sansaar</span>
        </button>

        <button
          onClick={() => router.push("/cart")}
          style={styles.backButton}
        >
          ← Back to Cart
        </button>
      </header>

      <div style={styles.container}>
        <div style={styles.heading}>
          <div style={styles.badge}>
            SECURE CHECKOUT
          </div>

          <h1 style={styles.headingTitle}>
            Complete your booking
          </h1>

          <p style={styles.headingText}>
            Enter your details and review your services
            before confirming your booking.
          </p>
        </div>

        <div style={styles.securityBar}>
          <span>🔒 Secure</span>
          <span>•</span>
          <span>✓ Verified booking</span>
          <span>•</span>
          <span>🏛️ Seva Sansaar</span>
        </div>

        <div style={styles.grid}>
          {/* CUSTOMER DETAILS */}

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardNumber}>
                01
              </div>

              <div>
                <h2 style={styles.cardTitle}>
                  Customer details
                </h2>

                <p style={styles.cardSubtitle}>
                  Where should we send your booking
                  information?
                </p>
              </div>
            </div>

            <label
              htmlFor="checkout-name"
              style={styles.label}
            >
              Full Name
            </label>

            <input
              id="checkout-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              autoComplete="name"
              style={styles.input}
            />

            <label
              htmlFor="checkout-email"
              style={styles.label}
            >
              Email Address
            </label>

            <input
              id="checkout-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              style={styles.input}
            />

            <label
              htmlFor="checkout-phone"
              style={styles.label}
            >
              Phone Number
            </label>

            <input
              id="checkout-phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
              style={styles.input}
            />

            <div style={styles.demoBox}>
              <div style={styles.demoIcon}>
                🧪
              </div>

              <div>
                <strong>Demo Payment Mode</strong>

                <p>
                  No real money will be charged.
                  This is a test checkout.
                </p>
              </div>
            </div>
          </section>

          {/* ORDER SUMMARY */}

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardNumber}>
                02
              </div>

              <div>
                <h2 style={styles.cardTitle}>
                  Order summary
                </h2>

                <p style={styles.cardSubtitle}>
                  Review your selected services.
                </p>
              </div>
            </div>

            <div style={styles.items}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={styles.item}
                >
                  <div style={styles.itemIcon}>
                    🏠
                  </div>

                  <div style={styles.itemContent}>
                    <h3 style={styles.itemName}>
                      {item.name}
                    </h3>

                    <p style={styles.itemDescription}>
                      {item.description ||
                        "Professional home service"}
                    </p>

                    <span style={styles.quantity}>
                      Qty: {item.quantity}
                    </span>
                  </div>

                  <strong style={styles.itemPrice}>
                    ₹
                    {Number(item.price) *
                      item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div style={styles.divider} />

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>

            <div style={styles.summaryRow}>
              <span>Service Fee</span>
              <strong>₹{serviceFee}</strong>
            </div>

            <div style={styles.totalRow}>
              <div>
                <span>Total amount</span>
                <small>Including service fee</small>
              </div>

              <strong>₹{total}</strong>
            </div>

            <button
              onClick={handleDemoPayment}
              disabled={loading}
              style={{
                ...styles.paymentButton,
                ...(loading
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {loading
                ? "Processing payment..."
                : `🧪 Pay ₹${total} (Demo)`}
            </button>

            <p style={styles.paymentNote}>
              Demo transaction • No real money
            </p>
          </section>
        </div>

        <div style={styles.bottomNote}>
          <span>🔐 Your information is handled securely.</span>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%)",
    color: "#172033",
    fontFamily: "Arial, Helvetica, sans-serif",
    paddingBottom: "50px",
  },

  header: {
    minHeight: "72px",
    padding: "12px 6%",
    background: "rgba(255,255,255,0.96)",
    borderBottom: "1px solid #e5eaf1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(12px)",
  },

  logo: {
    border: "none",
    background: "transparent",
    color: "#123b78",
    fontSize: "25px",
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: "-0.5px",
  },

  logoSpan: {
    color: "#1769e0",
  },

  backButton: {
    padding: "10px 16px",
    border: "1px solid #d7dee8",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
  },

  container: {
    maxWidth: "1120px",
    margin: "45px auto",
    padding: "0 20px",
  },

  heading: {
    marginBottom: "20px",
  },

  badge: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "20px",
    background: "#eaf2ff",
    color: "#1769e0",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "1px",
  },

  headingTitle: {
    fontSize: "40px",
    lineHeight: 1.15,
    margin: "14px 0 8px",
    letterSpacing: "-1px",
  },

  headingText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
    fontSize: "15px",
  },

  securityBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    marginBottom: "28px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.1fr) minmax(340px, 0.9fr)",
    gap: "22px",
    alignItems: "start",
  },

  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "22px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "25px",
  },

  cardNumber: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "13px",
    background: "#eaf2ff",
    color: "#1769e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 900,
  },

  cardTitle: {
    margin: 0,
    fontSize: "22px",
    letterSpacing: "-0.3px",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  label: {
    display: "block",
    marginTop: "18px",
    marginBottom: "8px",
    fontWeight: 800,
    fontSize: "14px",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d5dde8",
    borderRadius: "11px",
    fontSize: "15px",
    outline: "none",
    background: "#fbfdff",
  },

  demoBox: {
    marginTop: "22px",
    padding: "15px",
    borderRadius: "13px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  demoIcon: {
    fontSize: "22px",
  },

  items: {
    display: "grid",
    gap: "5px",
  },

  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  itemIcon: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "11px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  itemContent: {
    flex: 1,
    minWidth: 0,
  },

  itemName: {
    margin: 0,
    fontSize: "15px",
  },

  itemDescription: {
    margin: "4px 0",
    color: "#64748b",
    fontSize: "12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  quantity: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
  },

  itemPrice: {
    whiteSpace: "nowrap",
    fontSize: "15px",
  },

  divider: {
    height: "1px",
    background: "#e5eaf1",
    margin: "20px 0",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "11px",
    color: "#64748b",
    fontSize: "14px",
  },

  totalRow: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #e5eaf1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  paymentButton: {
    width: "100%",
    marginTop: "25px",
    padding: "15px",
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(22,163,74,0.2)",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  paymentNote: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
    margin: "10px 0 0",
  },

  bottomNote: {
    textAlign: "center",
    marginTop: "25px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
  },

  primaryButton: {
    marginTop: "18px",
    padding: "13px 20px",
    border: "none",
    borderRadius: "11px",
    background: "#1769e0",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },

  emptyWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
  },

  emptyCard: {
    width: "100%",
    maxWidth: "500px",
    padding: "45px 30px",
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(15,23,42,0.07)",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "15px",
  },

  emptyTitle: {
    margin: "15px 0 8px",
    fontSize: "28px",
  },

  emptyText: {
    color: "#64748b",
    lineHeight: 1.6,
  },
};