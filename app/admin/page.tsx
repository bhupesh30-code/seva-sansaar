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

  useEffect(() => {
    checkSessionAndLoad();
  }, []);

  const checkSessionAndLoad = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("ADMIN SESSION:", session);

      if (!session) {
        alert("Admin session not found. Please login again.");
        setLoading(false);
        return;
      }

      console.log("LOGGED IN USER:", session.user);

      await Promise.all([
        loadServices(),
        loadPartners(),
        loadBookings(),
        loadTransactions(),
      ]);
    } catch (error) {
      console.error("Admin loading error:", error);
    } finally {
      setLoading(false);
    }
  };

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

    console.log("SESSION BEFORE INSERT:", session);

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
    } catch (error: any) {
      console.error("SERVICE ERROR:", error);

      alert(
        error?.message ||
          "Unable to save service."
      );
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
    setLoading(true);

    await Promise.all([
      loadServices(),
      loadPartners(),
      loadBookings(),
      loadTransactions(),
    ]);

    setLoading(false);
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
      <main style={pageStyle}>
        <div style={containerStyle}>
          <h2>Loading Admin Panel...</h2>
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
              Seva Sansaar Admin
            </h1>

            <p style={{ marginBottom: 0 }}>
              Control Panel
            </p>
          </div>

          <button
            onClick={refreshAll}
            style={refreshButton}
          >
            🔄 Refresh
          </button>
        </div>

        {/* METRICS */}

        <section style={metricsGrid}>
          <Metric
            title="Total Bookings"
            value={totalBookings}
          />

          <Metric
            title="Confirmed"
            value={confirmedBookings}
          />

          <Metric
            title="Completed"
            value={completedBookings}
          />

          <Metric
            title="Cancelled"
            value={cancelledBookings}
          />

          <Metric
            title="Revenue"
            value={`₹${estimatedRevenue}`}
          />

          <Metric
            title="Commission (10%)"
            value={`₹${commission}`}
          />

          <Metric
            title="Partner Payout"
            value={`₹${partnerPayout}`}
          />

          <Metric
            title="Paid Transactions"
            value={paidTransactions.length}
          />

          <Metric
            title="Paid Revenue"
            value={`₹${totalPaid}`}
          />

          <Metric
            title="Refunded"
            value={`₹${totalRefunded}`}
          />

          <Metric
            title="Failed Payments"
            value={failedTransactions.length}
          />
        </section>

        {/* SERVICE CATALOG */}

        <section style={sectionStyle}>
          <h2>🛠 Service Catalog</h2>

          <div style={formGrid}>
            <input
              placeholder="Service Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              style={inputStyle}
            />

            <input
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              style={inputStyle}
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              style={inputStyle}
            >
              <option>General</option>
              <option>Government ID</option>
              <option>Certificates</option>
              <option>Government Scheme</option>
              <option>Legal Assistance</option>
              <option>Other</option>
            </select>

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value)
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Surge Price"
              value={surgePrice}
              onChange={(e) =>
                setSurgePrice(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button
              onClick={saveService}
              style={primaryButton}
            >
              {editingId !== null
                ? "Update Service"
                : "Add Service"}
            </button>

            {editingId !== null && (
              <button
                onClick={resetForm}
                style={secondaryButton}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div style={tableWrapper}>
            {services.map((service) => (
              <div
                key={service.id}
                style={serviceRow}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: "0 0 5px",
                    }}
                  >
                    {service.name}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                    }}
                  >
                    {service.description}
                  </p>

                  <p style={{ marginBottom: 0 }}>
                    <strong>
                      ₹{service.price}
                    </strong>{" "}
                    • {service.category} •{" "}
                    {service.duration} min • Surge ₹
                    {service.surge_price || 0}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() =>
                      editService(service)
                    }
                    style={editButton}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteService(service.id)
                    }
                    style={deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PARTNERS */}

        <section style={sectionStyle}>
          <h2>👨‍🔧 Partner Approval Queue</h2>

          {partners.length === 0 ? (
            <p>No partners found.</p>
          ) : (
            partners.map((partner) => (
              <div
                key={partner.id}
                style={serviceRow}
              >
                <div>
                  <h3 style={{ margin: 0 }}>
                    {partner.name}
                  </h3>

                  <p>
                    {partner.email}
                    {partner.phone
                      ? ` • ${partner.phone}`
                      : ""}
                  </p>

                  <strong>
                    {partner.category ||
                      "General"}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <span style={statusBadge}>
                    {partner.status}
                  </span>

                  {partner.status !==
                    "APPROVED" && (
                    <button
                      onClick={() =>
                        updatePartnerStatus(
                          partner.id,
                          "APPROVED"
                        )
                      }
                      style={approveButton}
                    >
                      Approve
                    </button>
                  )}

                  {partner.status !==
                    "REJECTED" && (
                    <button
                      onClick={() =>
                        updatePartnerStatus(
                          partner.id,
                          "REJECTED"
                        )
                      }
                      style={deleteButton}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        {/* BOOKING MONITOR */}

        <section style={sectionStyle}>
          <h2>📋 Live Booking Monitor</h2>

          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                style={serviceRow}
              >
                <div>
                  <h3 style={{ margin: 0 }}>
                    {booking.service_name}
                  </h3>

                  <p style={{ marginBottom: 0 }}>
                    Booking #{booking.id}
                    <br />
                    Date: {booking.booking_date}
                    <br />
                    Time: {booking.booking_time}
                  </p>
                </div>

                <select
                  value={booking.status}
                  onChange={(e) =>
                    updateBookingStatus(
                      booking.id,
                      e.target.value
                    )
                  }
                  style={statusSelect}
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
        </section>

        {/* TRANSACTION MONITOR */}

        <section style={sectionStyle}>
          <h2>💳 Payment / Transaction Monitor</h2>

          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                style={serviceRow}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px" }}>
                    {transaction.transaction_reference ||
                      `Transaction #${transaction.id}`}
                  </h3>

                  <p
                    style={{
                      margin: "4px 0",
                      color: "#6b7280",
                    }}
                  >
                    Transaction #{transaction.id}
                    <br />
                    Booking ID:{" "}
                    {transaction.booking_id
                      ? `#${transaction.booking_id}`
                      : "N/A"}
                    <br />
                    Payment Method:{" "}
                    {transaction.payment_method}
                    <br />
                    User ID: {transaction.user_id}
                    <br />
                    Date:{" "}
                    {new Date(
                      transaction.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div
                  style={{
                    textAlign: "right" as const,
                  }}
                >
                  <h3 style={{ margin: "0 0 8px" }}>
                    ₹{Number(transaction.amount)}
                  </h3>

                  <span
                    style={{
                      ...statusBadge,
                      background:
                        transaction.status === "PAID"
                          ? "#dcfce7"
                          : transaction.status ===
                            "REFUNDED"
                          ? "#fef3c7"
                          : transaction.status ===
                            "FAILED"
                          ? "#fee2e2"
                          : "#e5e7eb",
                      color:
                        transaction.status === "PAID"
                          ? "#166534"
                          : transaction.status ===
                            "REFUNDED"
                          ? "#92400e"
                          : transaction.status ===
                            "FAILED"
                          ? "#991b1b"
                          : "#374151",
                    }}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div style={metricCard}>
      <p
        style={{
          margin: 0,
          color: "#6b7280",
        }}
      >
        {title}
      </p>

      <h2 style={{ marginBottom: 0 }}>
        {value}
      </h2>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f7fb",
  padding: "30px 20px",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerStyle = {
  background: "#111827",
  color: "white",
  padding: "25px",
  borderRadius: "14px",
  marginBottom: "20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap" as const,
};

const refreshButton = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const metricsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(150px,1fr))",
  gap: "12px",
  marginBottom: "20px",
};

const metricCard = {
  background: "white",
  padding: "18px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
};

const sectionStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  marginBottom: "20px",
  border: "1px solid #e5e7eb",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(200px,1fr))",
  gap: "10px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
};

const primaryButton = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#6b7280",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const tableWrapper = {
  marginTop: "20px",
};

const serviceRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  padding: "15px 0",
  borderBottom: "1px solid #e5e7eb",
  flexWrap: "wrap" as const,
};

const editButton = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "7px",
  background: "#f59e0b",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const deleteButton = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "7px",
  background: "#dc2626",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const approveButton = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "7px",
  background: "#16a34a",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const statusBadge = {
  display: "inline-block",
  padding: "7px 10px",
  borderRadius: "20px",
  background: "#f3f4f6",
  fontSize: "13px",
  fontWeight: "600",
};

const statusSelect = {
  padding: "9px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontWeight: "600",
};