"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
};

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem(
      "sevaSansaarCart"
    );

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  const updateCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem(
      "sevaSansaarCart",
      JSON.stringify(items)
    );
  };

  const increaseQuantity = (id: number) => {
    const updated = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    updateCart(updated);
  };

  const decreaseQuantity = (id: number) => {
    const updated = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updated);
  };

  const removeItem = (id: number) => {
    const updated = cart.filter(
      (item) => item.id !== id
    );

    updateCart(updated);
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const serviceFee = subtotal > 0 ? 10 : 0;

  const total = subtotal + serviceFee;

  const checkout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    router.push("/checkout");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px 20px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h1>Seva Sansaar Cart</h1>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            Back to Services
          </button>
        </div>

        {cart.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "14px",
              textAlign: "center",
            }}
          >
            <h2>Your cart is empty</h2>

            <p style={{ color: "#6b7280" }}>
              Add a service to continue.
            </p>

            <button
              onClick={() =>
                router.push("/dashboard")
              }
              style={{
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Browse Services
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    border:
                      "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        marginTop: 0,
                      }}
                    >
                      {item.name}
                    </h2>

                    <p
                      style={{
                        color: "#6b7280",
                      }}
                    >
                      {item.description}
                    </p>

                    <strong>
                      ₹{item.price}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() =>
                        decreaseQuantity(
                          item.id
                        )
                      }
                      style={quantityButton}
                    >
                      −
                    </button>

                    <strong>
                      {item.quantity}
                    </strong>

                    <button
                      onClick={() =>
                        increaseQuantity(
                          item.id
                        )
                      }
                      style={quantityButton}
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeItem(item.id)
                      }
                      style={{
                        ...quantityButton,
                        background:
                          "#dc2626",
                        color: "white",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "14px",
                marginTop: "20px",
              }}
            >
              <h2>Order Summary</h2>

              <div style={summaryRow}>
                <span>Subtotal</span>
                <strong>
                  ₹{subtotal}
                </strong>
              </div>

              <div style={summaryRow}>
                <span>Service Fee</span>
                <strong>
                  ₹{serviceFee}
                </strong>
              </div>

              <hr />

              <div style={summaryRow}>
                <strong>Total</strong>
                <strong>
                  ₹{total}
                </strong>
              </div>

              <button
                onClick={checkout}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#16a34a",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const quantityButton = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  background: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "12px",
};