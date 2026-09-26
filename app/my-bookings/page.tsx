"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Booking = {
  id: number;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at?: string;
};

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, service_name, booking_date, booking_time, status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Bookings error:", error);
        alert("Unable to load bookings.");
        return;
      }

      setBookings((data || []) as Booking[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <h2>Loading My Bookings...</h2>
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
              My Bookings
            </h1>

            <p style={{ marginBottom: 0 }}>
              View all your Seva Sansaar bookings
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            style={backButton}
          >
            ← Back to Dashboard
          </button>
        </div>

        {bookings.length === 0 ? (
          <div style={emptyStyle}>
            <h2>No Bookings Found</h2>

            <p>
              You have not made any bookings yet.
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              style={primaryButton}
            >
              Book a Service
            </button>
          </div>
        ) : (
          <div style={listStyle}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                style={bookingCard}
              >
                <div>
                  <h2 style={{ marginTop: 0 }}>
                    {booking.service_name}
                  </h2>

                  <p>
                    <strong>Booking ID:</strong>{" "}
                    #{booking.id}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {booking.booking_date}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {booking.booking_time}
                  </p>
                </div>

                <div>
                  <span
                    style={{
                      ...statusStyle,
                      background:
                        booking.status === "CONFIRMED"
                          ? "#dcfce7"
                          : "#fef3c7",
                      color:
                        booking.status === "CONFIRMED"
                          ? "#166534"
                          : "#92400e",
                    }}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f7fb",
  padding: "30px 20px",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const containerStyle = {
  maxWidth: "1000px",
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

const backButton = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const listStyle = {
  display: "grid",
  gap: "15px",
};

const bookingCard = {
  background: "white",
  padding: "22px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap" as const,
};

const statusStyle = {
  padding: "8px 14px",
  borderRadius: "20px",
  fontWeight: "700",
  fontSize: "14px",
};

const emptyStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "14px",
  textAlign: "center" as const,
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