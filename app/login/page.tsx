"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw loginError;
      }

      if (!data.session || !data.user) {
        throw new Error(
          "Login session could not be created."
        );
      }

      console.log(
        "LOGIN SUCCESS:",
        data.user.email
      );

      console.log(
        "SESSION CREATED:",
        !!data.session
      );

      // Make sure session is available
      const {
        data: sessionData,
      } = await supabase.auth.getSession();

      console.log(
        "CURRENT SESSION:",
        !!sessionData.session
      );

      if (!sessionData.session) {
        throw new Error(
          "Supabase session was not saved."
        );
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "30px",
          borderRadius: "16px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "8px",
          }}
        >
          Seva Sansaar
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "25px",
          }}
        >
          Login to your account
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border:
                "1px solid #fecaca",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
            autoComplete="email"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              borderRadius: "8px",
              border:
                "1px solid #d1d5db",
              marginBottom: "16px",
              fontSize: "15px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              borderRadius: "8px",
              border:
                "1px solid #d1d5db",
              marginBottom: "20px",
              fontSize: "15px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
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
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}