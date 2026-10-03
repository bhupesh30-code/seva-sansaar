"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const SERVICES = [
  "Aadhaar Services",
  "Ration Card",
  "FIR Services",
  "Income Certificate",
];

const SERVICE_ICONS: Record<string, string> = {
  "Aadhaar Services": "🪪",
  "Ration Card": "📋",
  "FIR Services": "🛡️",
  "Income Certificate": "📄",
};

export default function ApplyPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [service, setService] = useState("Aadhaar Services");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [notes, setNotes] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedService = params.get("service");

    if (selectedService && SERVICES.includes(selectedService)) {
      setService(selectedService);
    }
  }, []);

  function nextStep() {
    setError("");

    if (step === 1 && !SERVICES.includes(service)) {
      setError("Please select a valid service.");
      return;
    }

    if (step === 2) {
      if (name.trim().length < 2) {
        setError("Please enter your full name.");
        return;
      }

      if (!/^[0-9]{10}$/.test(mobile)) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    setStep((current) => Math.min(current + 1, 4));
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function submitApplication() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        router.push("/login");
        return;
      }

      const newApplicationId =
        "SS" + Date.now().toString().slice(-8);

      const { data, error: insertError } = await supabase
        .from("applications")
        .insert({
          application_id: newApplicationId,
          service,
          status: "Submitted",
        })
        .select("application_id, service, status, created_at")
        .single();

      if (insertError) {
        console.error("Supabase application error:", insertError);

        setError(
          `Application save failed: ${insertError.message} (Code: ${
            insertError.code || "Unknown"
          })`
        );

        return;
      }

      if (!data) {
        setError(
          "Application was not returned by the database. Please try again."
        );
        return;
      }

      setApplicationId(data.application_id);
      setStep(5);
    } catch (err) {
      console.error("Application submission error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === 5) {
    return (
      <main style={styles.page}>
        <div style={styles.successWrapper}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>

            <div style={styles.successBadge}>
              APPLICATION SUBMITTED
            </div>

            <h1 style={styles.successTitle}>
              Application submitted!
            </h1>

            <p style={styles.successText}>
              Your application has been successfully saved.
              Keep your application ID for future reference.
            </p>

            <div style={styles.applicationIdBox}>
              <span style={styles.applicationIdLabel}>
                APPLICATION ID
              </span>

              <strong style={styles.applicationId}>
                {applicationId}
              </strong>
            </div>

            <div style={styles.successDetails}>
              <div style={styles.infoRow}>
                <span>Service</span>
                <strong>{service}</strong>
              </div>

              <div style={styles.infoRow}>
                <span>Status</span>

                <strong style={styles.successStatus}>
                  ● Submitted
                </strong>
              </div>
            </div>

            <div style={styles.successActions}>
              <button
                style={styles.primaryButton}
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard →
              </button>

              <button
                style={styles.secondaryButton}
                onClick={() => router.push("/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          style={styles.logoButton}
          onClick={() => router.push("/")}
        >
          Seva<span>Sansaar</span>
        </button>

        <button
          style={styles.dashboardButton}
          onClick={() => router.push("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <div style={styles.container}>
        <div style={styles.heading}>
          <div style={styles.headingBadge}>
            NEW APPLICATION
          </div>

          <h1 style={styles.headingTitle}>
            Start your application
          </h1>

          <p style={styles.headingText}>
            Complete a few simple steps to submit your
            government service application.
          </p>
        </div>

        <div style={styles.stepper}>
          {[1, 2, 3, 4].map((number) => (
            <div key={number} style={styles.stepItem}>
              <div
                style={{
                  ...styles.stepCircle,
                  ...(step >= number
                    ? styles.stepCircleActive
                    : {}),
                }}
              >
                {step > number ? "✓" : number}
              </div>

              <span
                style={{
                  ...styles.stepText,
                  color:
                    step >= number
                      ? "#1769e0"
                      : "#94a3b8",
                }}
              >
                {number === 1 && "Service"}
                {number === 2 && "Details"}
                {number === 3 && "Documents"}
                {number === 4 && "Review"}
              </span>

              {number < 4 && (
                <div
                  style={{
                    ...styles.stepLine,
                    background:
                      step > number
                        ? "#1769e0"
                        : "#e2e8f0",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={styles.card}>
          {step === 1 && (
            <>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>01</div>

                <div>
                  <h2 style={styles.cardTitle}>
                    Select a service
                  </h2>

                  <p style={styles.cardSubtitle}>
                    What service do you need help with?
                  </p>
                </div>
              </div>

              <div style={styles.options}>
                {SERVICES.map((item) => {
                  const selected = service === item;

                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setService(item)}
                      style={{
                        ...styles.option,
                        ...(selected
                          ? styles.optionSelected
                          : {}),
                      }}
                    >
                      <div style={styles.optionIcon}>
                        {SERVICE_ICONS[item]}
                      </div>

                      <div style={styles.optionContent}>
                        <strong style={styles.optionTitle}>
                          {item}
                        </strong>

                        <span style={styles.optionText}>
                          Application and document guidance
                        </span>
                      </div>

                      <div
                        style={{
                          ...styles.radio,
                          ...(selected
                            ? styles.radioSelected
                            : {}),
                        }}
                      >
                        {selected && <span />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>02</div>

                <div>
                  <h2 style={styles.cardTitle}>
                    Your details
                  </h2>

                  <p style={styles.cardSubtitle}>
                    Tell us a little about yourself.
                  </p>
                </div>
              </div>

              <label
                htmlFor="app-name"
                style={styles.fieldLabel}
              >
                Full Name
              </label>

              <input
                id="app-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                style={styles.input}
              />

              <label
                htmlFor="app-mobile"
                style={styles.fieldLabel}
              >
                Mobile Number
              </label>

              <input
                id="app-mobile"
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="Enter 10-digit mobile number"
                inputMode="numeric"
                autoComplete="tel"
                style={styles.input}
              />

              <label
                htmlFor="app-notes"
                style={styles.fieldLabel}
              >
                Additional Notes
                <span style={styles.optional}>
                  Optional
                </span>
              </label>

              <textarea
                id="app-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us anything important about your application..."
                rows={5}
                style={styles.textarea}
              />

              <div style={styles.securityNote}>
                🔒 Your information is handled securely.
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>03</div>

                <div>
                  <h2 style={styles.cardTitle}>
                    Required documents
                  </h2>

                  <p style={styles.cardSubtitle}>
                    Keep these documents ready before submitting.
                  </p>
                </div>
              </div>

              <div style={styles.documentList}>
                <div style={styles.documentItem}>
                  <div style={styles.documentIcon}>✓</div>
                  <div>
                    <strong>Aadhaar Card</strong>
                    <p>If applicable for your service</p>
                  </div>
                </div>

                <div style={styles.documentItem}>
                  <div style={styles.documentIcon}>✓</div>
                  <div>
                    <strong>Proof of Identity</strong>
                    <p>Valid government-issued ID</p>
                  </div>
                </div>

                <div style={styles.documentItem}>
                  <div style={styles.documentIcon}>✓</div>
                  <div>
                    <strong>Proof of Address</strong>
                    <p>Recent valid address proof</p>
                  </div>
                </div>

                <div style={styles.documentItem}>
                  <div style={styles.documentIcon}>✓</div>
                  <div>
                    <strong>Supporting Documents</strong>
                    <p>Documents required for your service</p>
                  </div>
                </div>
              </div>

              <div style={styles.infoBox}>
                <strong>Important:</strong>{" "}
                Document requirements can vary depending on
                the service and issuing authority.
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>04</div>

                <div>
                  <h2 style={styles.cardTitle}>
                    Review application
                  </h2>

                  <p style={styles.cardSubtitle}>
                    Check your details before submitting.
                  </p>
                </div>
              </div>

              <div style={styles.reviewBox}>
                <div style={styles.reviewRow}>
                  <span>Service</span>
                  <strong>{service}</strong>
                </div>

                <div style={styles.reviewRow}>
                  <span>Full Name</span>
                  <strong>{name}</strong>
                </div>

                <div style={styles.reviewRow}>
                  <span>Mobile</span>
                  <strong>{mobile}</strong>
                </div>

                <div style={styles.reviewRow}>
                  <span>Notes</span>
                  <strong>{notes || "No additional notes"}</strong>
                </div>
              </div>

              <div style={styles.confirmBox}>
                <span style={styles.confirmCheck}>✓</span>

                <div>
                  <strong>Ready to submit?</strong>
                  <p>
                    Your application will be saved to your
                    Seva Sansaar account.
                  </p>
                </div>
              </div>
            </>
          )}

          {error && (
            <div role="alert" style={styles.error}>
              <span>⚠</span>
              <div>{error}</div>
            </div>
          )}

          <div style={styles.navigation}>
            {step > 1 ? (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={previousStep}
                disabled={loading}
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                style={styles.primaryButton}
                onClick={nextStep}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(loading
                    ? styles.disabledButton
                    : {}),
                }}
                onClick={submitApplication}
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : "Submit Application ✓"}
              </button>
            )}
          </div>
        </div>

        <div style={styles.bottomTrust}>
          <span>🔒 Secure</span>
          <span>•</span>
          <span>✓ Simple process</span>
          <span>•</span>
          <span>🏛️ Digital service</span>
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
    fontFamily: "Arial, sans-serif",
    paddingBottom: "50px",
  },

  header: {
    minHeight: "72px",
    padding: "12px 6%",
    background: "rgba(255,255,255,0.95)",
    borderBottom: "1px solid #e5eaf1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(12px)",
  },

  logoButton: {
    border: "none",
    background: "transparent",
    color: "#123b78",
    fontSize: "25px",
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: "-0.5px",
  },

  dashboardButton: {
    border: "1px solid #d9e1ec",
    background: "#ffffff",
    borderRadius: "10px",
    padding: "10px 15px",
    cursor: "pointer",
    color: "#334155",
    fontWeight: 700,
  },

  container: {
    maxWidth: "880px",
    margin: "50px auto",
    padding: "0 20px",
  },

  heading: {
    marginBottom: "35px",
  },

  headingBadge: {
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
    fontSize: "42px",
    lineHeight: 1.12,
    margin: "15px 0 10px",
    letterSpacing: "-1px",
  },

  headingText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "16px",
    maxWidth: "650px",
  },

  stepper: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: "30px",
  },

  stepItem: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },

  stepCircle: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "14px",
    background: "#e2e8f0",
    color: "#64748b",
    border: "4px solid #f4f7fb",
    zIndex: 2,
  },

  stepCircleActive: {
    background: "#1769e0",
    color: "#ffffff",
    boxShadow: "0 5px 15px rgba(23,105,224,0.25)",
  },

  stepText: {
    position: "absolute",
    top: "45px",
    left: 0,
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  stepLine: {
    height: "3px",
    flex: 1,
    margin: "0 5px",
    borderRadius: "10px",
  },

  card: {
    marginTop: "55px",
    background: "#ffffff",
    border: "1px solid #e3e9f2",
    borderRadius: "24px",
    padding: "34px",
    boxShadow: "0 20px 50px rgba(15,23,42,0.07)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "28px",
  },

  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#eaf2ff",
    color: "#1769e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "14px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "24px",
    letterSpacing: "-0.3px",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  options: {
    display: "grid",
    gap: "14px",
  },

  option: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    textAlign: "left",
    padding: "18px",
    borderRadius: "16px",
    cursor: "pointer",
    color: "#172033",
    background: "#ffffff",
    border: "1px solid #e3e8ef",
    transition: "all 0.2s ease",
  },

  optionSelected: {
    border: "2px solid #1769e0",
    background: "#f5f9ff",
    boxShadow: "0 8px 25px rgba(23,105,224,0.08)",
  },

  optionIcon: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "13px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    display: "block",
    fontSize: "16px",
    marginBottom: "5px",
  },

  optionText: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
  },

  radio: {
    width: "21px",
    height: "21px",
    minWidth: "21px",
    borderRadius: "50%",
    border: "2px solid #cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    border: "6px solid #1769e0",
  },

  fieldLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "20px",
    marginBottom: "8px",
    fontWeight: 800,
    fontSize: "14px",
  },

  optional: {
    color: "#94a3b8",
    fontWeight: 500,
    fontSize: "12px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d5dde8",
    borderRadius: "12px",
    fontSize: "15px",
    outline: "none",
    background: "#fbfdff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d5dde8",
    borderRadius: "12px",
    fontSize: "15px",
    resize: "vertical",
    outline: "none",
    background: "#fbfdff",
    lineHeight: 1.5,
  },

  securityNote: {
    marginTop: "16px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "13px",
  },

  documentList: {
    display: "grid",
    gap: "12px",
  },

  documentItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    border: "1px solid #e5eaf1",
    borderRadius: "14px",
    background: "#fbfdff",
  },

  documentIcon: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  infoBox: {
    marginTop: "18px",
    padding: "15px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#1e40af",
    lineHeight: 1.6,
    fontSize: "13px",
  },

  reviewBox: {
    border: "1px solid #e5eaf1",
    borderRadius: "15px",
    overflow: "hidden",
  },

  reviewRow: {
    padding: "16px 18px",
    borderBottom: "1px solid #e5eaf1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    overflowWrap: "anywhere",
  },

  confirmBox: {
    marginTop: "18px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "15px",
    borderRadius: "13px",
    background: "#f0fdf4",
    color: "#166534",
  },

  confirmCheck: {
    width: "25px",
    height: "25px",
    minWidth: "25px",
    borderRadius: "50%",
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  error: {
    marginTop: "20px",
    padding: "13px 15px",
    borderRadius: "11px",
    background: "#fef2f2",
    color: "#991b1b",
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    fontSize: "14px",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  navigation: {
    marginTop: "30px",
    paddingTop: "24px",
    borderTop: "1px solid #edf0f5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "12px",
    padding: "13px 20px",
    background: "#1769e0",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(23,105,224,0.2)",
  },

  secondaryButton: {
    border: "1px solid #d7dee8",
    borderRadius: "12px",
    padding: "13px 20px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  bottomTrust: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
  },

  successWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
  },

  successCard: {
    width: "100%",
    maxWidth: "600px",
    padding: "42px",
    background: "#ffffff",
    borderRadius: "26px",
    textAlign: "center",
    border: "1px solid #e3e9f2",
    boxShadow: "0 25px 70px rgba(15,23,42,0.09)",
  },

  successIcon: {
    margin: "0 auto 20px",
    width: "74px",
    height: "74px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "40px",
    fontWeight: 900,
  },

  successBadge: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "20px",
    background: "#ecfdf5",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "1px",
  },

  successTitle: {
    fontSize: "32px",
    margin: "15px 0 8px",
  },

  successText: {
    color: "#64748b",
    lineHeight: 1.6,
    margin: "0 auto 25px",
    maxWidth: "450px",
  },

  applicationIdBox: {
    padding: "20px",
    borderRadius: "15px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    marginBottom: "15px",
  },

  applicationIdLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "1px",
    marginBottom: "8px",
  },

  applicationId: {
    color: "#1769e0",
    fontSize: "25px",
    letterSpacing: "1px",
  },

  successDetails: {
    display: "grid",
    gap: "10px",
  },

  infoRow: {
    padding: "14px 16px",
    background: "#f8fafc",
    borderRadius: "11px",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    overflowWrap: "anywhere",
    textAlign: "left",
  },

  successStatus: {
    color: "#15803d",
  },

  successActions: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
};