"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  duration: number;
  surge_price: number;
};

type Partner = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  category: string | null;
  status: string;
};

type Booking = {
  id: number;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
};

type Transaction = {
  id: number;
  user_id: string;
  booking_id: number | null;
  amount: number;
  payment_method: string;
  status: string;
  transaction_reference: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("General");
  const [duration, setDuration] = useState("30");
  const [surgePrice, setSurgePrice] = useState("0");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select(
        "id,name,description,price,category,duration,surge_price"
      )
      .order("id", { ascending: true });

    if (error) {
      console.error("Services error:", error);
      return;
    }

    setServices((data || []) as Service[]);
  };

  const loadPartners = async () => {
    const { data, error } = await supabase
      .from("partners")
      .select("id,name,email,phone,category,status")
      .order("id", { ascending: false });

    if (error) {
      console.error("Partners error:", error);
      return;
    }

    setPartners((data || []) as Partner[]);
  };

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id,service_name,booking_date,booking_time,status"
      )
      .order("id", { ascending: false });

    if (error) {
      console.error("Bookings error:", error);
      return;
    }

    setBookings((data || []) as Booking[]);
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id,user_id,booking_id,amount,payment_method,status,transaction_reference,created_at"
      )
      .order("id", { ascending: false });

    if (error) {
      console.error("Transactions error:", error);
      return;
    }

    setTransactions((data || []) as Transaction[]);
  };

  const checkSessionAndLoad = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Admin session not found. Please login again.");
        setLoading(false);
        return;
      }

      await Promise.all([
        loadServices(),
        loadPartners(),
        loadBookings(),
        loadTransactions(),
      ]);
    } catch (error: unknown) {
      console.error("Admin loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkSessionAndLoad();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("General");
    setDuration("30");
    setSurgePrice("0");
    setEditingId(null);
  };

  const saveService = async () => {
    if (!name.trim()) {
      alert("Enter service name.");
      return;
    }

    if (!description.trim()) {
      alert("Enter service description.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Enter a valid price.");
      return;
    }

    if (!duration || Number(duration) <= 0) {
      alert("Enter a valid duration.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Your login session has expired. Please login again.");
      return;
    }

    try {
      if (editingId !== null) {
        const { error } = await supabase
          .from("services")
          .update({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category,
            duration: Number(duration),
            surge_price: Number(surgePrice) || 0,
          })
          .eq("id", editingId);

        if (error) {
          console.error("UPDATE ERROR:", error);
          alert(error.message);
          return;
        }

        alert("Service updated successfully.");
      } else {
        const { data, error } = await supabase
          .from("services")
          .insert({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category,
            duration: Number(duration),
            surge_price: Number(surgePrice) || 0,
          })
          .select()
          .single();

        if (error) {
          console.error("INSERT ERROR:", error);

          alert(
            "Service add failed:\n\n" +
              error.message +
              "\n\nCode: " +
              error.code
          );

          return;
        }

        console.log("SERVICE CREATED:", data);
        alert("Service added successfully.");
      }

      resetForm();
      await loadServices();
    } catch (error: unknown) {
      console.error("SERVICE ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to save service.";

      alert(message);
    }
  };

  const editService = (service: Service) => {
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description);
    setPrice(String(service.price));
    setCategory(service.category || "General");
    setDuration(String(service.duration || 30));
    setSurgePrice(String(service.surge_price || 0));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteService = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
      alert(error.message);
      return;
    }

    alert("Service deleted.");
    await loadServices();
  };

  const updatePartnerStatus = async (
    id: number,
    status: string
  ) => {
    const { error } = await supabase
      .from("partners")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("PARTNER ERROR:", error);
      alert(error.message);
      return;
    }

    await loadPartners();
  };

  const updateBookingStatus = async (
    id: number,
    status: string
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("BOOKING ERROR:", error);
      alert(error.message);
      return;
    }

    await loadBookings();
  };

  const refreshAll = async () => {
    setRefreshing(true);

    await Promise.all([
      loadServices(),
      loadPartners(),
      loadBookings(),
      loadTransactions(),
    ]);

    setRefreshing(false);
  };

  const totalBookings = bookings.length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  ).length;

  const pendingPartners = partners.filter(
    (partner) =>
      partner.status !== "APPROVED" &&
      partner.status !== "REJECTED"
  ).length;

  const estimatedRevenue = bookings.reduce(
    (total, booking) => {
      if (booking.status === "CANCELLED") {
        return total;
      }

      const service = services.find(
        (item) => item.name === booking.service_name
      );

      return total + Number(service?.price || 0);
    },
    0
  );

  const commission = Math.round(
    estimatedRevenue * 0.1
  );

  const partnerPayout = Math.max(
    0,
    estimatedRevenue - commission
  );

  const paidTransactions = transactions.filter(
    (transaction) => transaction.status === "PAID"
  );

  const refundedTransactions = transactions.filter(
    (transaction) => transaction.status === "REFUNDED"
  );

  const failedTransactions = transactions.filter(
    (transaction) => transaction.status === "FAILED"
  );

  const totalPaid = paidTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  );

  const totalRefunded = refundedTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  );

  if (loading) {
    return (
      <main className="admin-page">
        <div className="loading-screen">
          <div className="loading-logo">S</div>
          <div className="loader"></div>
          <h2>Loading Admin Panel</h2>
          <p>Preparing your Seva Sansaar control center...</p>
        </div>

        <style jsx>{`
          .admin-page {
            min-height: 100vh;
            background: #f6f8fc;
            font-family: Arial, Helvetica, sans-serif;
          }

          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: #111827;
          }

          .loading-logo {
            width: 64px;
            height: 64px;
            border-radius: 18px;
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 18px;
          }

          .loader {
            width: 30px;
            height: 30px;
            border: 3px solid #dbeafe;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 18px;
          }

          .loading-screen h2 {
            margin: 0 0 6px;
          }

          .loading-screen p {
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
    <main className="admin-page">
      <div className="admin-container">

        {/* TOP BAR */}
        <header className="topbar">
          <div className="brand-area">
            <div className="brand-icon">S</div>

            <div>
              <div className="brand-name">
                Seva <strong>Sansaar</strong>
              </div>

              <div className="brand-subtitle">
                Administration Control Center
              </div>
            </div>
          </div>

          <div className="top-actions">
            <span className="admin-badge">
              <span className="online-dot"></span>
              ADMIN ONLINE
            </span>

            <button
              className="refresh-btn"
              onClick={refreshAll}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="admin-hero">
          <div>
            <span className="hero-label">
              MANAGEMENT DASHBOARD
            </span>

            <h1>Good day, Admin 👋</h1>

            <p>
              Manage services, partners, bookings and payments
              from one centralized dashboard.
            </p>
          </div>

          <div className="hero-summary">
            <span>Active Services</span>
            <strong>{services.length}</strong>
            <small>Across all categories</small>
          </div>
        </section>

        {/* METRICS */}
        <section className="metrics-grid">
          <Metric
            icon="▣"
            title="Total Bookings"
            value={totalBookings}
            tone="blue"
          />

          <Metric
            icon="✓"
            title="Confirmed"
            value={confirmedBookings}
            tone="green"
          />

          <Metric
            icon="★"
            title="Completed"
            value={completedBookings}
            tone="purple"
          />

          <Metric
            icon="×"
            title="Cancelled"
            value={cancelledBookings}
            tone="red"
          />

          <Metric
            icon="₹"
            title="Estimated Revenue"
            value={`₹${estimatedRevenue}`}
            tone="amber"
          />

          <Metric
            icon="%"
            title="Commission"
            value={`₹${commission}`}
            tone="indigo"
          />

          <Metric
            icon="◈"
            title="Partner Payout"
            value={`₹${partnerPayout}`}
            tone="cyan"
          />

          <Metric
            icon="!"
            title="Pending Partners"
            value={pendingPartners}
            tone="orange"
          />
        </section>

        {/* SERVICE MANAGEMENT */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                CATALOG MANAGEMENT
              </span>
              <h2>Service Catalog</h2>
              <p>
                Create, update and manage your available services.
              </p>
            </div>

            <div className="catalog-count">
              {services.length} Services
            </div>
          </div>

          <div className="form-card">
            <div className="form-title">
              <div className="form-icon">
                {editingId !== null ? "✎" : "+"}
              </div>

              <div>
                <h3>
                  {editingId !== null
                    ? "Edit Service"
                    : "Add New Service"}
                </h3>

                <p>
                  {editingId !== null
                    ? "Update the selected service details."
                    : "Add a new service to your catalog."}
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Service Name</label>
                <input
                  placeholder="e.g. AC Repair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Price</label>
                <input
                  type="number"
                  placeholder="₹ Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="field field-wide">
                <label>Description</label>
                <input
                  placeholder="Describe this service"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                >
                  <option>General</option>
                  <option>Government ID</option>
                  <option>Certificates</option>
                  <option>Government Scheme</option>
                  <option>Legal Assistance</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="field">
                <label>Duration</label>
                <input
                  type="number"
                  placeholder="Minutes"
                  value={duration}
                  onChange={(e) =>
                    setDuration(e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Surge Price</label>
                <input
                  type="number"
                  placeholder="₹ Surge"
                  value={surgePrice}
                  onChange={(e) =>
                    setSurgePrice(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                className="primary-btn"
                onClick={saveService}
              >
                {editingId !== null
                  ? "Update Service"
                  : "Add Service"}
              </button>

              {editingId !== null && (
                <button
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div className="service-list">
            {services.length === 0 ? (
              <div className="empty-small">
                No services available.
              </div>
            ) : (
              services.map((service) => (
                <div
                  className="service-card"
                  key={service.id}
                >
                  <div className="service-symbol">
                    {service.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="service-info">
                    <div className="service-title-row">
                      <h3>{service.name}</h3>
                      <span className="category-badge">
                        {service.category}
                      </span>
                    </div>

                    <p>{service.description}</p>

                    <div className="service-meta">
                      <span>
                        <strong>
                          ₹{service.price}
                        </strong>
                      </span>

                      <span>
                        {service.duration} min
                      </span>

                      <span>
                        Surge ₹
                        {service.surge_price || 0}
                      </span>
                    </div>
                  </div>

                  <div className="service-actions">
                    <button
                      className="edit-btn"
                      onClick={() =>
                        editService(service)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteService(service.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PARTNERS */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                PARTNER MANAGEMENT
              </span>
              <h2>Partner Approval Queue</h2>
              <p>
                Review and manage your service partners.
              </p>
            </div>

            <div className="catalog-count">
              {partners.length} Partners
            </div>
          </div>

          <div className="partner-list">
            {partners.length === 0 ? (
              <div className="empty-small">
                No partners found.
              </div>
            ) : (
              partners.map((partner) => (
                <div
                  className="partner-card"
                  key={partner.id}
                >
                  <div className="partner-avatar">
                    {partner.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="partner-info">
                    <h3>{partner.name}</h3>

                    <p>
                      {partner.email}
                      {partner.phone
                        ? ` • ${partner.phone}`
                        : ""}
                    </p>

                    <span>
                      {partner.category ||
                        "General"}
                    </span>
                  </div>

                  <div className="partner-actions">
                    <span
                      className={`status-pill ${partner.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {partner.status}
                    </span>

                    {partner.status !== "APPROVED" && (
                      <button
                        className="approve-btn"
                        onClick={() =>
                          updatePartnerStatus(
                            partner.id,
                            "APPROVED"
                          )
                        }
                      >
                        Approve
                      </button>
                    )}

                    {partner.status !== "REJECTED" && (
                      <button
                        className="reject-btn"
                        onClick={() =>
                          updatePartnerStatus(
                            partner.id,
                            "REJECTED"
                          )
                        }
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* BOOKINGS */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                OPERATIONS
              </span>
              <h2>Live Booking Monitor</h2>
              <p>
                Track and update current customer bookings.
              </p>
            </div>

            <div className="catalog-count">
              {bookings.length} Bookings
            </div>
          </div>

          <div className="booking-list">
            {bookings.length === 0 ? (
              <div className="empty-small">
                No bookings found.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  className="booking-card"
                  key={booking.id}
                >
                  <div className="booking-number">
                    #{booking.id}
                  </div>

                  <div className="booking-info">
                    <h3>{booking.service_name}</h3>

                    <p>
                      {booking.booking_date}{" "}
                      <span>•</span>{" "}
                      {booking.booking_time}
                    </p>
                  </div>

                  <select
                    className="status-select"
                    value={booking.status}
                    onChange={(e) =>
                      updateBookingStatus(
                        booking.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="CONFIRMED">
                      CONFIRMED
                    </option>

                    <option value="IN_PROGRESS">
                      IN_PROGRESS
                    </option>

                    <option value="COMPLETED">
                      COMPLETED
                    </option>

                    <option value="CANCELLED">
                      CANCELLED
                    </option>
                  </select>
                </div>
              ))
            )}
          </div>
        </section>

        {/* TRANSACTIONS */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                FINANCE
              </span>
              <h2>Payment Monitor</h2>
              <p>
                Monitor payments and transaction activity.
              </p>
            </div>

            <div className="payment-summary">
              <div>
                <span>Paid</span>
                <strong>₹{totalPaid}</strong>
              </div>

              <div>
                <span>Refunded</span>
                <strong>₹{totalRefunded}</strong>
              </div>
            </div>
          </div>

          <div className="transaction-list">
            {transactions.length === 0 ? (
              <div className="empty-small">
                No transactions found.
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  className="transaction-card"
                  key={transaction.id}
                >
                  <div className="transaction-icon">
                    ₹
                  </div>

                  <div className="transaction-info">
                    <h3>
                      {transaction.transaction_reference ||
                        `Transaction #${transaction.id}`}
                    </h3>

                    <p>
                      Transaction #{transaction.id}
                      {" • "}
                      Booking{" "}
                      {transaction.booking_id
                        ? `#${transaction.booking_id}`
                        : "N/A"}
                    </p>

                    <small>
                      {transaction.payment_method}
                      {" • "}
                      {new Date(
                        transaction.created_at
                      ).toLocaleString()}
                    </small>
                  </div>

                  <div className="transaction-right">
                    <strong>
                      ₹{Number(transaction.amount)}
                    </strong>

                    <span
                      className={`transaction-status ${transaction.status.toLowerCase()}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="admin-footer">
          <span>Seva Sansaar Admin Panel</span>
          <span>Management • Operations • Finance</span>
        </footer>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 5% 0%,
              rgba(37, 99, 235, 0.08),
              transparent 30%
            ),
            #f5f7fb;
          padding: 22px 18px 50px;
          color: #111827;
          font-family:
            Arial, Helvetica, sans-serif;
        }

        .admin-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .topbar {
          min-height: 68px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 10px 14px 10px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
          backdrop-filter: blur(12px);
        }

        .brand-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          box-shadow: 0 8px 20px
            rgba(37, 99, 235, 0.22);
        }

        .brand-name {
          font-size: 19px;
          font-weight: 700;
        }

        .brand-name strong {
          color: #2563eb;
        }

        .brand-subtitle {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 3px;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-badge {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #bbf7d0;
          padding: 8px 11px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .online-dot {
          width: 7px;
          height: 7px;
          display: inline-block;
          background: #22c55e;
          border-radius: 50%;
          margin-right: 6px;
        }

        .refresh-btn {
          border: 1px solid #dbe2ea;
          background: white;
          color: #374151;
          padding: 9px 13px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-hero {
          margin-top: 20px;
          padding: 34px;
          min-height: 150px;
          border-radius: 24px;
          background: linear-gradient(
            135deg,
            #111827,
            #1e3a8a
          );
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 45px
            rgba(15, 23, 42, 0.14);
        }

        .admin-hero::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          right: -100px;
          top: -170px;
          background: rgba(255, 255, 255, 0.06);
        }

        .hero-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #93c5fd;
        }

        .admin-hero h1 {
          margin: 9px 0 7px;
          font-size: clamp(28px, 4vw, 40px);
          letter-spacing: -1px;
        }

        .admin-hero p {
          margin: 0;
          color: #dbeafe;
          line-height: 1.6;
          max-width: 650px;
        }

        .hero-summary {
          min-width: 165px;
          padding: 20px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.12);
          position: relative;
          z-index: 1;
        }

        .hero-summary span,
        .hero-summary small {
          display: block;
          color: #bfdbfe;
          font-size: 11px;
        }

        .hero-summary strong {
          display: block;
          font-size: 35px;
          margin: 4px 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 13px;
          margin-top: 18px;
        }

        .metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 17px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          box-shadow: 0 7px 24px
            rgba(15, 23, 42, 0.035);
        }

        .metric-icon {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
        }

        .metric-blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .metric-green {
          background: #ecfdf5;
          color: #059669;
        }

        .metric-purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .metric-red {
          background: #fef2f2;
          color: #dc2626;
        }

        .metric-amber {
          background: #fffbeb;
          color: #d97706;
        }

        .metric-indigo {
          background: #eef2ff;
          color: #4f46e5;
        }

        .metric-cyan {
          background: #ecfeff;
          color: #0891b2;
        }

        .metric-orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .metric-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .metric-card strong {
          display: block;
          font-size: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .panel {
          margin-top: 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 21px;
          padding: 25px;
          box-shadow: 0 8px 28px
            rgba(15, 23, 42, 0.035);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .section-kicker {
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .panel-header h2 {
          margin: 5px 0 4px;
          font-size: 23px;
        }

        .panel-header p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .catalog-count {
          background: #f1f5f9;
          color: #475569;
          padding: 8px 11px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .form-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 17px;
          padding: 19px;
        }

        .form-title {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 17px;
        }

        .form-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: #dbeafe;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .form-title h3 {
          margin: 0 0 3px;
          font-size: 15px;
        }

        .form-title p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 13px;
        }

        .field-wide {
          grid-column: span 2;
        }

        .field label {
          display: block;
          margin-bottom: 6px;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
        }

        .field input,
        .field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dbe2ea;
          background: white;
          border-radius: 10px;
          padding: 11px 12px;
          outline: none;
          font-size: 13px;
          color: #111827;
          transition: 0.2s;
        }

        .field input:focus,
        .field select:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px
            rgba(37, 99, 235, 0.08);
        }

        .form-actions {
          display: flex;
          gap: 9px;
          margin-top: 15px;
        }

        .primary-btn,
        .secondary-btn {
          border: 0;
          border-radius: 10px;
          padding: 11px 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .primary-btn {
          color: white;
          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );
          box-shadow: 0 7px 16px
            rgba(37, 99, 235, 0.18);
        }

        .secondary-btn {
          background: #64748b;
          color: white;
        }

        .service-list,
        .partner-list,
        .booking-list,
        .transaction-list {
          margin-top: 18px;
          display: grid;
          gap: 10px;
        }

        .service-card,
        .partner-card,
        .booking-card,
        .transaction-card {
          border: 1px solid #e8edf3;
          border-radius: 15px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 13px;
          transition: 0.2s ease;
        }

        .service-card:hover,
        .partner-card:hover,
        .booking-card:hover,
        .transaction-card:hover {
          border-color: #bfdbfe;
          box-shadow: 0 8px 22px
            rgba(37, 99, 235, 0.06);
        }

        .service-symbol,
        .partner-avatar {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563eb;
          font-weight: 800;
        }

        .service-info,
        .partner-info,
        .booking-info,
        .transaction-info {
          flex: 1;
          min-width: 0;
        }

        .service-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .service-info h3,
        .partner-info h3,
        .booking-info h3,
        .transaction-info h3 {
          margin: 0;
          font-size: 15px;
        }

        .service-info p {
          margin: 5px 0;
          color: #64748b;
          font-size: 12px;
        }

        .category-badge {
          padding: 4px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;
          font-size: 9px;
          font-weight: 800;
        }

        .service-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 13px;
          color: #64748b;
          font-size: 11px;
        }

        .service-meta strong {
          color: #111827;
        }

        .service-actions,
        .partner-actions {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .edit-btn,
        .delete-btn,
        .approve-btn,
        .reject-btn {
          border: 0;
          border-radius: 8px;
          padding: 8px 11px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .edit-btn {
          background: #fef3c7;
          color: #92400e;
        }

        .delete-btn,
        .reject-btn {
          background: #fee2e2;
          color: #991b1b;
        }

        .approve-btn {
          background: #dcfce7;
          color: #166534;
        }

        .partner-info p {
          margin: 4px 0;
          color: #64748b;
          font-size: 11px;
        }

        .partner-info span {
          color: #2563eb;
          font-size: 10px;
          font-weight: 700;
        }

        .status-pill {
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
        }

        .status-pill.approved {
          background: #dcfce7;
          color: #166534;
        }

        .status-pill.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-pill.pending,
        .status-pill.pending-approval {
          background: #fef3c7;
          color: #92400e;
        }

        .booking-number {
          width: 46px;
          height: 40px;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        .booking-info p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .booking-info p span {
          margin: 0 5px;
        }

        .status-select {
          border: 1px solid #dbe2ea;
          border-radius: 9px;
          padding: 9px 10px;
          background: white;
          color: #374151;
          font-size: 11px;
          font-weight: 800;
          outline: none;
        }

        .payment-summary {
          display: flex;
          gap: 9px;
        }

        .payment-summary div {
          padding: 8px 11px;
          border-radius: 10px;
          background: #f8fafc;
          text-align: right;
        }

        .payment-summary span {
          display: block;
          color: #94a3b8;
          font-size: 9px;
        }

        .payment-summary strong {
          font-size: 13px;
        }

        .transaction-icon {
          width: 43px;
          height: 43px;
          border-radius: 12px;
          background: #ecfdf5;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .transaction-info p {
          margin: 4px 0;
          color: #64748b;
          font-size: 10px;
        }

        .transaction-info small {
          color: #94a3b8;
          font-size: 9px;
        }

        .transaction-right {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 7px;
        }

        .transaction-right strong {
          font-size: 16px;
        }

        .transaction-status {
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
        }

        .transaction-status.paid {
          background: #dcfce7;
          color: #166534;
        }

        .transaction-status.refunded {
          background: #fef3c7;
          color: #92400e;
        }

        .transaction-status.failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .transaction-status.pending {
          background: #e5e7eb;
          color: #374151;
        }

        .empty-small {
          padding: 30px;
          border: 1px dashed #cbd5e1;
          border-radius: 14px;
          text-align: center;
          color: #64748b;
          background: #f8fafc;
          font-size: 13px;
        }

        .admin-footer {
          padding: 25px 5px 0;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #94a3b8;
          font-size: 11px;
        }

        @media (max-width: 1000px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .field-wide {
            grid-column: span 2;
          }
        }

        @media (max-width: 700px) {
          .admin-page {
            padding: 12px 10px 35px;
          }

          .topbar,
          .admin-hero {
            border-radius: 17px;
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .top-actions {
            width: 100%;
            justify-content: space-between;
          }

          .admin-hero {
            padding: 25px 20px;
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-summary {
            width: 100%;
            box-sizing: border-box;
          }

          .metrics-grid {
            grid-template-columns: 1fr 1fr;
          }

          .panel {
            padding: 18px;
            border-radius: 17px;
          }

          .panel-header {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field-wide {
            grid-column: span 1;
          }

          .service-card,
          .partner-card,
          .booking-card,
          .transaction-card {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .service-actions,
          .partner-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .transaction-right {
            margin-left: 56px;
            align-items: flex-start;
            text-align: left;
          }

          .admin-footer {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 430px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .brand-subtitle {
            display: none;
          }

          .admin-hero h1 {
            font-size: 28px;
          }

          .form-actions {
            flex-direction: column;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
          }

          .payment-summary {
            width: 100%;
          }

          .payment-summary div {
            flex: 1;
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}

function Metric({
  icon,
  title,
  value,
  tone,
}: {
  icon: string;
  title: string;
  value: string | number;
  tone:
    | "blue"
    | "green"
    | "purple"
    | "red"
    | "amber"
    | "indigo"
    | "cyan"
    | "orange";
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon metric-${tone}`}>
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <style jsx>{`
        .metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 17px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          box-shadow: 0 7px 24px
            rgba(15, 23, 42, 0.035);
        }

        .metric-icon {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
        }

        .metric-blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .metric-green {
          background: #ecfdf5;
          color: #059669;
        }

        .metric-purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .metric-red {
          background: #fef2f2;
          color: #dc2626;
        }

        .metric-amber {
          background: #fffbeb;
          color: #d97706;
        }

        .metric-indigo {
          background: #eef2ff;
          color: #4f46e5;
        }

        .metric-cyan {
          background: #ecfeff;
          color: #0891b2;
        }

        .metric-orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .metric-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .metric-card strong {
          display: block;
          font-size: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}