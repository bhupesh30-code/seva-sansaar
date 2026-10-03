"use client";

import { useCallback, useEffect, useState } from "react";
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

  const loadBookings = useCallback(async () => {
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
          "id,service_name,booking_date,booking_time,status,created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Bookings error:", error);
        return;
      }

      setBookings((data || []) as Booking[]);
    } catch (error: unknown) {
      console.error("Load bookings error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "status confirmed";
      case "COMPLETED":
        return "status completed";
      case "CANCELLED":
        return "status cancelled";
      default:
        return "status pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "✓";
      case "COMPLETED":
        return "✓";
      case "CANCELLED":
        return "×";
      default:
        return "•";
    }
  };

  if (loading) {
    return (
      <main className="bookings-page">
        <div className="loading-wrapper">
          <div className="loading-card">
            <div className="loading-icon">S</div>
            <div className="loader"></div>
            <h2>Loading your bookings</h2>
            <p>Please wait while we fetch your latest services.</p>
          </div>
        </div>

        <style jsx>{`
          .bookings-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at top left,
                rgba(37, 99, 235, 0.12),
                transparent 35%
              ),
              #f6f8fc;
            padding: 40px 20px;
            font-family: Arial, Helvetica, sans-serif;
          }

          .loading-wrapper {
            min-height: calc(100vh - 80px);
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .loading-card {
            width: 100%;
            max-width: 430px;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            padding: 45px 30px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
          }

          .loading-icon {
            width: 58px;
            height: 58px;
            margin: 0 auto 20px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #2563eb;
            color: white;
            font-size: 24px;
            font-weight: 800;
          }

          .loader {
            width: 30px;
            height: 30px;
            border: 3px solid #dbeafe;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 20px;
          }

          .loading-card h2 {
            margin: 0 0 8px;
            color: #111827;
          }

          .loading-card p {
            margin: 0;
            color: #6b7280;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="bookings-page">
      <div className="page-container">
        {/* Top Navigation */}
        <nav className="top-nav">
          <button
            className="brand"
            onClick={() => router.push("/")}
            aria-label="Go to home"
          >
            <span className="brand-icon">S</span>
            <span>
              Seva <strong>Sansaar</strong>
            </span>
          </button>

          <button
            className="dashboard-btn"
            onClick={() => router.push("/dashboard")}
          >
            ← Dashboard
          </button>
        </nav>

        {/* Hero Header */}
        <section className="hero">
          <div>
            <div className="eyebrow">
              <span className="dot"></span>
              SERVICE HISTORY
            </div>

            <h1>My Bookings</h1>

            <p>
              Track and manage all your Seva Sansaar service bookings in one
              place.
            </p>
          </div>

          <div className="booking-count">
            <span>{bookings.length}</span>
            <small>
              {bookings.length === 1 ? "Booking" : "Bookings"}
            </small>
          </div>
        </section>

        {/* Stats */}
        {bookings.length > 0 && (
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">▣</div>
              <div>
                <span>Total</span>
                <strong>{bookings.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✓</div>
              <div>
                <span>Confirmed</span>
                <strong>
                  {
                    bookings.filter(
                      (booking) =>
                        booking.status.toUpperCase() === "CONFIRMED"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">★</div>
              <div>
                <span>Completed</span>
                <strong>
                  {
                    bookings.filter(
                      (booking) =>
                        booking.status.toUpperCase() === "COMPLETED"
                    ).length
                  }
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* Booking List */}
        {bookings.length === 0 ? (
          <section className="empty-card">
            <div className="empty-icon">📋</div>

            <h2>No bookings yet</h2>

            <p>
               You&apos;re
              schedule your first booking.
            </p>

            <button
              className="primary-btn"
              onClick={() => router.push("/dashboard")}
            >
              Explore Services
              <span>→</span>
            </button>
          </section>
        ) : (
          <section className="bookings-section">
            <div className="section-heading">
              <div>
                <h2>Recent bookings</h2>
                <p>Your latest service activity</p>
              </div>

              <button
                className="refresh-btn"
                onClick={() => {
                  setLoading(true);
                  void loadBookings();
                }}
              >
                ↻ Refresh
              </button>
            </div>

            <div className="booking-list">
              {bookings.map((booking) => (
                <article className="booking-card" key={booking.id}>
                  <div className="service-icon">
                    <span>⌂</span>
                  </div>

                  <div className="booking-main">
                    <div className="booking-title-row">
                      <div>
                        <h3>{booking.service_name}</h3>

                        <p className="booking-id">
                          Booking ID <strong>#{booking.id}</strong>
                        </p>
                      </div>

                      <span className={getStatusClass(booking.status)}>
                        <span className="status-icon">
                          {getStatusIcon(booking.status)}
                        </span>
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-details">
                      <div className="detail">
                        <span className="detail-icon">▣</span>
                        <div>
                          <small>Service Date</small>
                          <strong>{booking.booking_date}</strong>
                        </div>
                      </div>

                      <div className="detail">
                        <span className="detail-icon">◷</span>
                        <div>
                          <small>Time Slot</small>
                          <strong>{booking.booking_time}</strong>
                        </div>
                      </div>

                      <div className="detail">
                        <span className="detail-icon">✓</span>
                        <div>
                          <small>Status</small>
                          <strong>{booking.status}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="bottom-cta">
          <div>
            <span className="cta-icon">✦</span>
            <div>
              <h3>Need another service?</h3>
              <p>Book trusted services quickly with Seva Sansaar.</p>
            </div>
          </div>

          <button
            className="cta-btn"
            onClick={() => router.push("/dashboard")}
          >
            Book a Service →
          </button>
        </section>

        <footer>
          <span>© 2026 Seva Sansaar</span>
          <span>Trusted services. Simple bookings.</span>
        </footer>
      </div>

      <style jsx>{`
        .bookings-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 5% 0%,
              rgba(37, 99, 235, 0.1),
              transparent 30%
            ),
            radial-gradient(
              circle at 95% 15%,
              rgba(124, 58, 237, 0.08),
              transparent 28%
            ),
            #f6f8fc;
          padding: 24px 20px 50px;
          font-family:
            Arial, Helvetica, sans-serif;
          color: #111827;
        }

        .page-container {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .top-nav {
          min-height: 64px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 10px 14px 10px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
          backdrop-filter: blur(12px);
        }

        .brand {
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          cursor: pointer;
        }

        .brand strong {
          color: #2563eb;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: white;
          font-weight: 800;
          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.25);
        }

        .dashboard-btn {
          border: 1px solid #dbe2ea;
          background: white;
          color: #1f2937;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .dashboard-btn:hover {
          background: #f8fafc;
          transform: translateY(-1px);
        }

        .hero {
          margin-top: 28px;
          background: linear-gradient(135deg, #111827 0%, #1e3a8a 100%);
          color: white;
          border-radius: 24px;
          padding: 38px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
          overflow: hidden;
          position: relative;
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          border-radius: 50%;
          right: -80px;
          top: -110px;
          background: rgba(255, 255, 255, 0.07);
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 1.7px;
          font-weight: 800;
          color: #bfdbfe;
          margin-bottom: 12px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #60a5fa;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 44px);
          letter-spacing: -1.2px;
        }

        .hero p {
          margin: 10px 0 0;
          max-width: 650px;
          color: #dbeafe;
          line-height: 1.6;
          font-size: 15px;
        }

        .booking-count {
          min-width: 115px;
          height: 115px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.14);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .booking-count span {
          font-size: 36px;
          line-height: 1;
          font-weight: 800;
        }

        .booking-count small {
          margin-top: 8px;
          color: #bfdbfe;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 18px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.04);
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 800;
        }

        .stat-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .stat-icon.green {
          background: #ecfdf5;
          color: #059669;
        }

        .stat-icon.purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .stat-card span {
          display: block;
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 3px;
        }

        .stat-card strong {
          font-size: 21px;
        }

        .bookings-section {
          margin-top: 30px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 22px;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .refresh-btn {
          border: 1px solid #dbe2ea;
          background: white;
          color: #374151;
          padding: 9px 14px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .booking-list {
          display: grid;
          gap: 14px;
        }

        .booking-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 22px;
          display: flex;
          gap: 18px;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.045);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .booking-card:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
          box-shadow: 0 15px 35px rgba(37, 99, 235, 0.08);
        }

        .service-icon {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          border-radius: 16px;
          background: linear-gradient(135deg, #eff6ff, #eef2ff);
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          font-weight: 800;
        }

        .booking-main {
          flex: 1;
          min-width: 0;
        }

        .booking-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .booking-title-row h3 {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }

        .booking-id {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        .booking-id strong {
          color: #374151;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .status-icon {
          font-size: 13px;
        }

        .status.confirmed {
          background: #dcfce7;
          color: #166534;
        }

        .status.completed {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .status.cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .booking-details {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          margin-top: 19px;
          padding-top: 17px;
          border-top: 1px solid #f0f2f5;
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 130px;
        }

        .detail-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 13px;
        }

        .detail small {
          display: block;
          color: #94a3b8;
          font-size: 10px;
          margin-bottom: 3px;
        }

        .detail strong {
          display: block;
          color: #374151;
          font-size: 13px;
        }

        .empty-card {
          margin-top: 30px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 65px 25px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .empty-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 18px;
          border-radius: 20px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }

        .empty-card h2 {
          margin: 0;
          font-size: 25px;
        }

        .empty-card p {
          max-width: 500px;
          margin: 10px auto 22px;
          color: #6b7280;
          line-height: 1.6;
        }

        .primary-btn,
        .cta-btn {
          border: 0;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: white;
          padding: 13px 19px;
          border-radius: 11px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2);
          transition: 0.2s ease;
        }

        .primary-btn:hover,
        .cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
        }

        .primary-btn span {
          margin-left: 8px;
        }

        .bottom-cta {
          margin-top: 30px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 20px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
        }

        .bottom-cta > div {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .cta-icon {
          width: 43px;
          height: 43px;
          border-radius: 12px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .bottom-cta h3 {
          margin: 0;
          font-size: 15px;
        }

        .bottom-cta p {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #94a3b8;
          font-size: 12px;
          padding: 25px 4px 0;
        }

        @media (max-width: 760px) {
          .bookings-page {
            padding: 15px 12px 35px;
          }

          .top-nav {
            border-radius: 15px;
          }

          .brand {
            font-size: 17px;
          }

          .brand-icon {
            width: 34px;
            height: 34px;
          }

          .dashboard-btn {
            padding: 9px 12px;
            font-size: 12px;
          }

          .hero {
            margin-top: 16px;
            padding: 27px 22px;
            border-radius: 20px;
          }

          .hero h1 {
            font-size: 31px;
          }

          .booking-count {
            min-width: 82px;
            height: 82px;
            border-radius: 18px;
          }

          .booking-count span {
            font-size: 28px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .section-heading {
            align-items: flex-start;
          }

          .booking-card {
            padding: 17px;
            border-radius: 17px;
          }

          .booking-title-row {
            flex-direction: column;
          }

          .booking-details {
            gap: 14px;
          }

          .detail {
            min-width: calc(50% - 10px);
          }

          .bottom-cta {
            flex-direction: column;
            align-items: stretch;
          }

          .cta-btn {
            width: 100%;
          }

          footer {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 450px) {
          .hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .booking-count {
            width: 100%;
          }

          .detail {
            width: 100%;
          }

          .refresh-btn {
            padding: 8px 11px;
          }
        }
      `}</style>
    </main>
  );
}