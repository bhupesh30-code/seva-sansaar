"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Service = {
id: number;
name: string;
description: string;
price: number;
category?: string;
duration?: number;
surge_price?: number;
};

const DEFAULT_TIME_SLOTS = [
"09:00 AM",
"10:00 AM",
"11:00 AM",
"12:00 PM",
"02:00 PM",
"03:00 PM",
"04:00 PM",
"05:00 PM",
];

export default function DashboardPage() {
const router = useRouter();

const [user, setUser] = useState<any>(null);
const [services, setServices] = useState<Service[]>([]);

const [selectedService, setSelectedService] =
useState<Service | null>(null);

const [date, setDate] = useState("");
const [time, setTime] = useState("");

const [loading, setLoading] = useState(true);
const [bookingLoading, setBookingLoading] =
useState(false);

const [timeSlots, setTimeSlots] =
useState<string[]>(DEFAULT_TIME_SLOTS);

useEffect(() => {
loadDashboard();
}, []);

const loadDashboard = async () => {
try {
const {
data: { user },
} = await supabase.auth.getUser();

  if (!user) {
    router.push("/login");
    return;
  }

  setUser(user);

  const { data, error } = await supabase
    .from("services")
    .select(
      "id,name,description,price,category,duration,surge_price"
    )
    .order("id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Services error:",
      error
    );
    return;
  }

  setServices(
    (data || []) as Service[]
  );
} catch (error) {
  console.error(
    "Dashboard error:",
    error
  );
} finally {
  setLoading(false);
}

};

// =========================
// GENERATE DYNAMIC TIME SLOTS
// =========================

const generateTimeSlots = (
selectedDate: string
) => {
if (!selectedDate) {
setTimeSlots(DEFAULT_TIME_SLOTS);
return;
}

const today = new Date()
  .toISOString()
  .split("T")[0];

if (selectedDate === today) {
  const now = new Date();

  const slots = DEFAULT_TIME_SLOTS.filter(
    (slot) => {
      const [timePart, period] =
        slot.split(" ");

      let [hours, minutes] =
        timePart.split(":").map(Number);

      if (period === "PM" && hours !== 12) {
        hours += 12;
      }

      if (period === "AM" && hours === 12) {
        hours = 0;
      }

      const slotTime = new Date();
      slotTime.setHours(
        hours,
        minutes,
        0,
        0
      );

      return slotTime > now;
    }
  );

  setTimeSlots(
    slots.length > 0
      ? slots
      : []
  );
} else {
  setTimeSlots(DEFAULT_TIME_SLOTS);
}

setTime("");

};

// =========================
// ADD TO CART
// =========================

const addToCart = (service: Service) => {
try {
const savedCart =
localStorage.getItem(
"sevaSansaarCart"
);

  const existingCart = savedCart
    ? JSON.parse(savedCart)
    : [];

  const existingItem =
    existingCart.find(
      (item: any) =>
        item.id === service.id
    );

  let updatedCart;

  if (existingItem) {
    updatedCart =
      existingCart.map(
        (item: any) =>
          item.id === service.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
      );
  } else {
    updatedCart = [
      ...existingCart,
      {
        id: service.id,
        name: service.name,
        description:
          service.description,
        price: Number(service.price),
        quantity: 1,
      },
    ];
  }

  localStorage.setItem(
    "sevaSansaarCart",
    JSON.stringify(updatedCart)
  );

  alert(
    `${service.name} added to cart!`
  );
} catch (error) {
  console.error(
    "Cart error:",
    error
  );

  alert(
    "Unable to add service to cart."
  );
}

};

// =========================
// CONFIRM BOOKING
// =========================

const confirmBooking = async () => {
if (!user) {
alert("Please login first.");
router.push("/login");
return;
}

if (!selectedService) {
  alert("Please select a service.");
  return;
}

if (!date) {
  alert("Please select a date.");
  return;
}

if (!time) {
  alert("Please select a time slot.");
  return;
}

try {
  setBookingLoading(true);

  const {
    data: existingBooking,
    error: existingError,
  } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", user.id)
    .eq(
      "service_id",
      selectedService.id
    )
    .eq("booking_date", date)
    .eq("booking_time", time)
    .neq("status", "CANCELLED")
    .limit(1);

  if (existingError) {
    console.error(
      "Existing booking check error:",
      existingError
    );
  }

  if (
    existingBooking &&
    existingBooking.length > 0
  ) {
    alert(
      "This service is already booked for the selected date and time."
    );
    return;
  }

  const { error } =
    await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        service_id:
          selectedService.id,
        service_name:
          selectedService.name,
        booking_date: date,
        booking_time: time,
        status: "CONFIRMED",
      });

  if (error) {
    console.error(
      "Booking error:",
      error
    );

    alert(
      "Booking failed: " +
        error.message
    );

    return;
  }

  alert(
    "Booking confirmed successfully!"
  );

  setSelectedService(null);
  setDate("");
  setTime("");
  setTimeSlots(
    DEFAULT_TIME_SLOTS
  );

  router.push("/my-bookings");
  router.refresh();
} catch (error: any) {
  console.error(
    "Booking error:",
    error
  );

  alert(
    error?.message ||
      "Something went wrong."
  );
} finally {
  setBookingLoading(false);
}

};

// =========================
// LOGOUT
// =========================

const logout = async () => {
await supabase.auth.signOut();

router.push("/login");
router.refresh();

};

// =========================
// LOADING
// =========================

if (loading) {
return (
<main style={pageStyle}>
<div style={containerStyle}>
<h2>
Loading Seva Sansaar...
</h2>
</div>
</main>
);
}

// =========================
// DASHBOARD
// =========================

return (
<main style={pageStyle}>
<div style={containerStyle}>
<div style={headerStyle}>
<div>
<h1
style={{
margin: 0,
}}
>
Seva Sansaar
</h1>

        <p
          style={{
            marginBottom: 0,
          }}
        >
          Government & Local
          Services
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() =>
            router.push("/cart")
          }
          style={cartButton}
        >
          🛒 Cart
        </button>

        <button
          onClick={() =>
            router.push(
              "/my-bookings"
            )
          }
          style={secondaryButton}
        >
          My Bookings
        </button>

        <button
          onClick={logout}
          style={logoutButton}
        >
          Logout
        </button>
      </div>
    </div>

    <section style={sectionStyle}>
      <h2>
        Available Services
      </h2>

      {services.length === 0 ? (
        <p>
          No services available.
        </p>
      ) : (
        <div style={servicesGrid}>
          {services.map(
            (service) => (
              <div
                key={service.id}
                style={serviceCard}
              >
                <h3
                  style={{
                    marginTop: 0,
                  }}
                >
                  {service.name}
                </h3>

                <p
                  style={{
                    color: "#6b7280",
                    minHeight:
                      "45px",
                  }}
                >
                  {
                    service.description
                  }
                </p>

                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  {service.category ||
                    "General"}{" "}
                  •{" "}
                  {service.duration ||
                    30}{" "}
                  minutes
                </p>

                <h3>
                  ₹
                  {Number(
                    service.price
                  )}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedService(
                        service
                      );
                      setDate("");
                      setTime("");
                      setTimeSlots(
                        DEFAULT_TIME_SLOTS
                      );
                    }}
                    style={
                      primaryButton
                    }
                  >
                    Book Service
                  </button>

                  <button
                    onClick={() =>
                      addToCart(
                        service
                      )
                    }
                    style={
                      cartAddButton
                    }
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>

    {selectedService && (
      <section
        style={bookingSection}
      >
        <h2>
          Book:{" "}
          {selectedService.name}
        </h2>

        <p>
          Price: ₹
          {Number(
            selectedService.price
          )}
        </p>

        <label
          style={labelStyle}
        >
          Select Date
        </label>

        <input
          type="date"
          value={date}
          min={
            new Date()
              .toISOString()
              .split("T")[0]
          }
          onChange={(e) => {
            const selectedDate =
              e.target.value;

            setDate(
              selectedDate
            );

            generateTimeSlots(
              selectedDate
            );
          }}
          style={inputStyle}
        />

        <label
          style={labelStyle}
        >
          Select Time Slot
        </label>

        {timeSlots.length === 0 ? (
          <p
            style={{
              color: "#dc2626",
              fontWeight: "600",
            }}
          >
            No time slots are
            available for today.
            Please select another
            date.
          </p>
        ) : (
          <div style={timeGrid}>
            {timeSlots.map(
              (slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() =>
                    setTime(slot)
                  }
                  style={{
                    ...timeButton,
                    ...(time === slot
                      ? selectedTimeButton
                      : {}),
                  }}
                >
                  {slot}
                </button>
              )
            )}
          </div>
        )}

        {date && time && (
          <div
            style={
              bookingSummary
            }
          >
            <strong>
              Booking Summary
            </strong>

            <p>
              Service:{" "}
              {selectedService.name}
            </p>

            <p>
              Date: {date}
            </p>

            <p>
              Time: {time}
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={
              confirmBooking
            }
            disabled={
              bookingLoading ||
              timeSlots.length === 0
            }
            style={{
              ...confirmButton,
              opacity:
                bookingLoading ||
                timeSlots.length === 0
                  ? 0.6
                  : 1,
            }}
          >
            {bookingLoading
              ? "Confirming..."
              : "Confirm Booking"}
          </button>

          <button
            onClick={() => {
              setSelectedService(
                null
              );
              setDate("");
              setTime("");
              setTimeSlots(
                DEFAULT_TIME_SLOTS
              );
            }}
            style={
              cancelButton
            }
          >
            Cancel
          </button>
        </div>
      </section>
    )}
  </div>
</main>

);
}

// =========================
// STYLES
// =========================

const pageStyle = {
minHeight: "100vh",
background: "#f5f7fb",
padding: "30px 20px",
fontFamily:
"Arial, Helvetica, sans-serif",
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
marginBottom: "25px",
display: "flex",
justifyContent:
"space-between",
alignItems: "center",
gap: "15px",
flexWrap: "wrap" as const,
};

const sectionStyle = {
background: "white",
padding: "25px",
borderRadius: "14px",
marginBottom: "25px",
};

const servicesGrid = {
display: "grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(230px,1fr))",
gap: "15px",
};

const serviceCard = {
border:
"1px solid #e5e7eb",
padding: "20px",
borderRadius: "12px",
};

const bookingSection = {
background: "white",
padding: "25px",
borderRadius: "14px",
marginBottom: "25px",
border:
"2px solid #2563eb",
};

const primaryButton = {
width: "100%",
padding: "12px",
border: "none",
borderRadius: "8px",
background: "#2563eb",
color: "white",
fontWeight: "600",
cursor: "pointer",
};

const cartAddButton = {
width: "100%",
padding: "12px",
border: "none",
borderRadius: "8px",
background: "#16a34a",
color: "white",
fontWeight: "600",
cursor: "pointer",
};

const cartButton = {
padding: "10px 15px",
border: "none",
borderRadius: "8px",
background: "#16a34a",
color: "white",
fontWeight: "600",
cursor: "pointer",
};

const secondaryButton = {
padding: "10px 15px",
border: "none",
borderRadius: "8px",
background: "#6b7280",
color: "white",
fontWeight: "600",
cursor: "pointer",
};

const logoutButton = {
padding: "10px 15px",
border: "none",
borderRadius: "8px",
background: "#dc2626",
color: "white",
fontWeight: "600",
cursor: "pointer",
};

const confirmButton = {
padding: "12px 20px",
border: "none",
borderRadius: "8px",
background: "#16a34a",
color: "white",
fontWeight: "600",
cursor: "pointer",
};

const cancelButton = {
padding: "12px 20px",
border: "none",
borderRadius: "8px",
background: "#6b7280",
color: "white",
fontWeight: "600",
cursor: "pointer",
};

const labelStyle = {
display: "block",
marginTop: "20px",
marginBottom: "8px",
fontWeight: "600",
};

const inputStyle = {
width: "100%",
boxSizing: "border-box" as const,
padding: "12px",
border:
"1px solid #d1d5db",
borderRadius: "8px",
fontSize: "15px",
};

const timeGrid = {
display: "grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(120px,1fr))",
gap: "10px",
};

const timeButton = {
padding: "12px",
border:
"1px solid #d1d5db",
borderRadius: "8px",
background: "white",
cursor: "pointer",
fontWeight: "600",
};

const selectedTimeButton = {
background: "#2563eb",
color: "white",
border:
"1px solid #2563eb",
};

const bookingSummary = {
marginTop: "20px",
padding: "15px",
borderRadius: "10px",
background: "#eff6ff",
border:
"1px solid #2563eb",
};