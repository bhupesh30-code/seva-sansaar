"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Application = {
  id?: string;
  application_id: string;
  service: string;
  status: string;
  created_at: string;
};

type Service = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function loadDashboard() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from("applications")
        .select(
          "id, application_id, service, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (applicationError) {
        console.error("Applications error:", applicationError);
      } else {
        setApplications(
          (applicationData || []) as Application[]
        );
      }

      const {
        data: serviceData,
        error: serviceError,
      } = await supabase
        .from("services")
        .select("*");

      if (serviceError) {
        console.error("Services error:", serviceError);
      } else {
        setServices(
          (serviceData || []) as Service[]
        );
      }
    } catch (error: unknown) {
      console.error("Dashboard error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function logout() {
    try {
      setLoggingOut(true);

      await supabase.auth.signOut();

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  function getServiceName(service: Service) {
    return service.name || service.title || "Service";
  }

  function getStatusClass(status: string) {
    const normalized = status.toLowerCase();

    if (
      normalized.includes("submit") ||
      normalized.includes("complete") ||
      normalized.includes("approved")
    ) {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (
      normalized.includes("reject") ||
      normalized.includes("cancel")
    ) {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  return (
    <main style={styles.page}>

      {/* ================= HEADER ================= */}

      <header style={styles.header}>
        <div style={styles.headerInner}>

          <button
            style={styles.logoButton}
            onClick={() => router.push("/")}
          >
            <div style={styles.logoMark}>S</div>

            <div>
              <h1 style={styles.logo}>
                Seva<span>Sansaar</span>
              </h1>

              <p style={styles.tagline}>
                Government services made simple
              </p>
            </div>
          </button>

          <nav style={styles.desktopNav}>
            <button
              style={styles.navButton}
              onClick={() => router.push("/")}
            >
              Home
            </button>

            <button
              style={styles.navButton}
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </button>

            <button
              style={styles.navButton}
              onClick={() => router.push("/my-bookings")}
            >
              My Bookings
            </button>
          </nav>

          <div style={styles.headerButtons}>
            <button
              style={styles.primaryButton}
              onClick={() => router.push("/apply")}
            >
              + New Application
            </button>

            <button
              style={styles.logoutButton}
              onClick={logout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

        </div>
      </header>

      {/* ================= ERROR MESSAGE ================= */}

      {message && (
        <div style={styles.message}>
          <strong>Notice:</strong> {message}
        </div>
      )}

      {/* ================= HERO ================= */}

      <section style={styles.hero}>
        <div style={styles.heroContent}>

          <div style={styles.heroBadge}>
            <span style={styles.badgeDot}></span>
            DIGITAL GOVERNMENT SERVICES
          </div>

          <h2 style={styles.heroTitle}>
            Government services,
            <br />
            <span>made simple.</span>
          </h2>

          <p style={styles.heroText}>
            Apply for important government services, manage
            your applications and get clear guidance from
            one simple platform.
          </p>

          <div style={styles.heroActions}>
            <button
              style={styles.heroButton}
              onClick={() => router.push("/apply")}
            >
              Start New Application
              <span>→</span>
            </button>

            <button
              style={styles.heroSecondaryButton}
              onClick={() => {
                document
                  .getElementById("applications")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              View Applications
            </button>
          </div>

        </div>

        <div style={styles.heroVisual}>
          <div style={styles.heroCircle}></div>

          <div style={styles.heroCard}>
            <div style={styles.heroCardIcon}>
              🏛️
            </div>

            <h3 style={styles.heroCardTitle}>
              Digital Seva
            </h3>

            <p style={styles.heroCardText}>
              Simple applications.
              <br />
              Clear guidance.
            </p>

            <div style={styles.heroCardStatus}>
              <span>✓</span>
              Easy & Accessible
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <section style={styles.statsSection}>

        <div style={styles.statCard}>
          <div style={styles.statIconBlue}>📄</div>

          <div>
            <p style={styles.statNumber}>
              {applications.length}
            </p>

            <p style={styles.statLabel}>
              My Applications
            </p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconGreen}>✓</div>

          <div>
            <p style={styles.statNumber}>
              {
                applications.filter((item) =>
                  item.status
                    .toLowerCase()
                    .includes("submit")
                ).length
              }
            </p>

            <p style={styles.statLabel}>
              Submitted
            </p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconPurple}>🏛️</div>

          <div>
            <p style={styles.statNumber}>
              {services.length}
            </p>

            <p style={styles.statLabel}>
              Available Services
            </p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconOrange}>⚡</div>

          <div>
            <p style={styles.statNumber}>
              24/7
            </p>

            <p style={styles.statLabel}>
              Digital Access
            </p>
          </div>
        </div>

      </section>

      {/* ================= APPLICATIONS ================= */}

      <section
        id="applications"
        style={styles.section}
      >
        <div style={styles.sectionHeader}>

          <div>
            <p style={styles.sectionLabel}>
              YOUR ACTIVITY
            </p>

            <h2 style={styles.sectionTitle}>
              My Applications
            </h2>

            <p style={styles.sectionDescription}>
              Track your government service applications
              from one place.
            </p>
          </div>

          <button
            style={styles.outlineButton}
            onClick={() => router.push("/apply")}
          >
            + New Application
          </button>

        </div>

        {loading ? (
          <div style={styles.loadingCard}>
            <div style={styles.spinner}></div>

            <p>
              Loading your applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div style={styles.emptyCard}>

            <div style={styles.emptyIcon}>
              📄
            </div>

            <h3 style={styles.emptyTitle}>
              No applications yet
            </h3>

            <p style={styles.emptyText}>
              You have not submitted any application.
              Start your first service request today.
            </p>

            <button
              style={styles.primaryButton}
              onClick={() => router.push("/apply")}
            >
              Start Application →
            </button>

          </div>
        ) : (
          <div style={styles.applicationGrid}>

            {applications.map((application) => {
              const statusStyle =
                getStatusClass(application.status);

              return (
                <div
                  key={
                    application.id ||
                    application.application_id
                  }
                  style={styles.applicationCard}
                >

                  <div style={styles.applicationTop}>

                    <div>
                      <p style={styles.applicationSmallLabel}>
                        APPLICATION ID
                      </p>

                      <strong
                        style={styles.applicationId}
                      >
                        {application.application_id}
                      </strong>
                    </div>

                    <span
                      style={{
                        ...styles.status,
                        background:
                          statusStyle.background,
                        color:
                          statusStyle.color,
                      }}
                    >
                      {application.status}
                    </span>

                  </div>

                  <div style={styles.applicationDivider}></div>

                  <p style={styles.applicationSmallLabel}>
                    SERVICE
                  </p>

                  <h3
                    style={styles.applicationService}
                  >
                    {application.service}
                  </h3>

                  <div style={styles.applicationBottom}>

                    <p style={styles.applicationDate}>
                      Submitted{" "}
                      {new Date(
                        application.created_at
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    <span style={styles.arrow}>
                      →
                    </span>

                  </div>

                </div>
              );
            })}

          </div>
        )}
      </section>

      {/* ================= SERVICES ================= */}

      <section style={styles.section}>

        <div style={styles.sectionHeader}>

          <div>
            <p style={styles.sectionLabel}>
              EXPLORE
            </p>

            <h2 style={styles.sectionTitle}>
              Available Services
            </h2>

            <p style={styles.sectionDescription}>
              Choose a service and start your application.
            </p>
          </div>

          <button
            style={styles.outlineButton}
            onClick={() => router.push("/apply")}
          >
            View All
          </button>

        </div>

        {services.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>
              🏛️
            </div>

            <h3 style={styles.emptyTitle}>
              No services available
            </h3>

            <p style={styles.emptyText}>
              Services will appear here when they are
              available.
            </p>
          </div>
        ) : (
          <div style={styles.serviceGrid}>

            {services.map((service) => {
              const serviceName =
                getServiceName(service);

              return (
                <div
                  key={service.id}
                  style={styles.serviceCard}
                >

                  <div style={styles.serviceCardTop}>
                    <div style={styles.serviceIcon}>
                      📋
                    </div>

                    <span style={styles.serviceArrow}>
                      →
                    </span>
                  </div>

                  <h3 style={styles.serviceTitle}>
                    {serviceName}
                  </h3>

                  <p style={styles.serviceDescription}>
                    {service.description ||
                      "Government service application and guidance."}
                  </p>

                  <button
                    style={styles.cardButton}
                    onClick={() =>
                      router.push(
                        "/apply?service=" +
                          encodeURIComponent(
                            serviceName
                          )
                      )
                    }
                  >
                    Apply Now
                    <span>→</span>
                  </button>

                </div>
              );
            })}

          </div>
        )}
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section style={styles.howSection}>

        <div style={styles.howHeader}>
          <p style={styles.sectionLabel}>
            SIMPLE PROCESS
          </p>

          <h2 style={styles.sectionTitle}>
            How Seva Sansaar works
          </h2>

          <p style={styles.sectionDescription}>
            Get your service request started in just a few
            simple steps.
          </p>
        </div>

        <div style={styles.stepsGrid}>

          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>
              01
            </div>

            <div style={styles.stepIcon}>
              🔎
            </div>

            <h3>
              Choose a Service
            </h3>

            <p>
              Select the government service you need.
            </p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>
              02
            </div>

            <div style={styles.stepIcon}>
              📝
            </div>

            <h3>
              Submit Details
            </h3>

            <p>
              Provide the required information and
              documents.
            </p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>
              03
            </div>

            <div style={styles.stepIcon}>
              📊
            </div>

            <h3>
              Track Application
            </h3>

            <p>
              Monitor your application status easily.
            </p>
          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}

      <section style={styles.ctaSection}>

        <div>
          <p style={styles.ctaLabel}>
            NEED A SERVICE?
          </p>

          <h2 style={styles.ctaTitle}>
            Start your application today.
          </h2>

          <p style={styles.ctaText}>
            Simple, digital and accessible government
            services from one place.
          </p>
        </div>

        <button
          style={styles.ctaButton}
          onClick={() => router.push("/apply")}
        >
          Start Application →
        </button>

      </section>

      {/* ================= FOOTER ================= */}

      <footer style={styles.footer}>

        <div>
          <h3 style={styles.footerLogo}>
            Seva<span>Sansaar</span>
          </h3>

          <p style={styles.footerText}>
            Making government services simpler through
            digital access.
          </p>
        </div>

        <div style={styles.footerRight}>
          <p>
            Simple • Digital • Accessible
          </p>

          <p style={styles.footerCopyright}>
            © 2026 Seva Sansaar. All rights reserved.
          </p>
        </div>

      </footer>

    </main>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f9fc",
    color: "#172033",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #e7ebf2",
  },

  headerInner: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "16px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
  },

  logoButton: {
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    cursor: "pointer",
    padding: 0,
    textAlign: "left",
  },

  logoMark: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,#1557b0,#2584f5)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "20px",
    boxShadow: "0 8px 20px rgba(37,132,245,0.25)",
  },

  logo: {
    margin: 0,
    fontSize: "22px",
    lineHeight: 1,
    fontWeight: 900,
    color: "#102a56",
  },

  logoSpan: {
    color: "#1769e0",
  },

  tagline: {
    margin: "5px 0 0",
    color: "#718096",
    fontSize: "11px",
  },

  desktopNav: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
  },

  navButton: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontWeight: 600,
    cursor: "pointer",
    padding: "8px",
  },

  headerButtons: {
    display: "flex",
    gap: "9px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "11px",
    padding: "12px 18px",
    background:
      "linear-gradient(135deg,#1769e0,#1557b0)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(23,105,224,0.18)",
  },

  logoutButton: {
    border: "1px solid #d8dee8",
    borderRadius: "11px",
    padding: "11px 17px",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },

  message: {
    maxWidth: "1280px",
    margin: "20px auto 0",
    padding: "14px 18px",
    borderRadius: "12px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
  },

  hero: {
    maxWidth: "1280px",
    margin: "34px auto 0",
    padding: "58px",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg,#092b5f 0%,#1557b0 55%,#2185ef 100%)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "40px",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 20px 50px rgba(15,61,122,0.18)",
  },

  heroContent: {
    maxWidth: "700px",
    position: "relative",
    zIndex: 2,
  },

  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 13px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#62e59b",
  },

  heroTitle: {
    margin: "20px 0 14px",
    fontSize: "clamp(38px,5vw,62px)",
    lineHeight: 1.04,
    letterSpacing: "-2px",
    fontWeight: 900,
  },

  heroText: {
    maxWidth: "650px",
    margin: 0,
    color: "#dbeafe",
    lineHeight: 1.8,
    fontSize: "16px",
  },

  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "28px",
  },

  heroButton: {
    border: "none",
    borderRadius: "12px",
    padding: "14px 20px",
    background: "#ffffff",
    color: "#1557b0",
    fontWeight: 800,
    cursor: "pointer",
  },

  heroSecondaryButton: {
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "12px",
    padding: "13px 19px",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },

  heroVisual: {
    minWidth: "300px",
    minHeight: "300px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCircle: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "rgba(255,255,255,0.08)",
  },

  heroCard: {
    position: "relative",
    zIndex: 2,
    width: "225px",
    padding: "27px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(10px)",
  },

  heroCardIcon: {
    fontSize: "45px",
  },

  heroCardTitle: {
    margin: "15px 0 7px",
    fontSize: "20px",
  },

  heroCardText: {
    margin: 0,
    color: "#dbeafe",
    lineHeight: 1.6,
    fontSize: "13px",
  },

  heroCardStatus: {
    marginTop: "18px",
    padding: "9px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.10)",
    color: "#d1fae5",
    fontSize: "12px",
    fontWeight: 700,
  },

  statsSection: {
    maxWidth: "1280px",
    margin: "22px auto 0",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "17px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 5px 20px rgba(15,23,42,0.03)",
  },

  statIconBlue: {
    width: "47px",
    height: "47px",
    borderRadius: "13px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  statIconGreen: {
    width: "47px",
    height: "47px",
    borderRadius: "13px",
    background: "#ecfdf5",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: 900,
  },

  statIconPurple: {
    width: "47px",
    height: "47px",
    borderRadius: "13px",
    background: "#f5f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  statIconOrange: {
    width: "47px",
    height: "47px",
    borderRadius: "13px",
    background: "#fff7ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  statNumber: {
    margin: 0,
    fontSize: "23px",
    fontWeight: 900,
    color: "#172033",
  },

  statLabel: {
    margin: "3px 0 0",
    color: "#718096",
    fontSize: "12px",
  },

  section: {
    maxWidth: "1280px",
    margin: "65px auto 0",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "24px",
  },

  sectionLabel: {
    margin: 0,
    color: "#1769e0",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "1.3px",
  },

  sectionTitle: {
    margin: "6px 0 7px",
    fontSize: "31px",
    lineHeight: 1.15,
    fontWeight: 900,
    color: "#172033",
  },

  sectionDescription: {
    margin: 0,
    color: "#718096",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  outlineButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "11px",
    padding: "11px 16px",
    background: "#ffffff",
    color: "#1769e0",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  loadingCard: {
    minHeight: "180px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#718096",
    gap: "15px",
  },

  spinner: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "4px solid #e5e7eb",
    borderTopColor: "#1769e0",
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "20px",
    padding: "50px 25px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "18px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "30px",
  },

  emptyTitle: {
    margin: "0 0 7px",
    fontSize: "20px",
  },

  emptyText: {
    maxWidth: "470px",
    margin: "0 auto 20px",
    color: "#718096",
    lineHeight: 1.6,
    fontSize: "14px",
  },

  applicationGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(290px,1fr))",
    gap: "17px",
  },

  applicationCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf1",
    borderRadius: "18px",
    padding: "21px",
    transition: "0.2s ease",
    boxShadow: "0 5px 18px rgba(15,23,42,0.03)",
  },

  applicationTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },

  applicationSmallLabel: {
    margin: "0 0 5px",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.8px",
  },

  applicationId: {
    color: "#1769e0",
    fontSize: "14px",
    fontWeight: 900,
  },

  status: {
    padding: "6px 10px",
    borderRadius: "30px",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  applicationDivider: {
    height: "1px",
    background: "#eef1f5",
    margin: "19px 0",
  },

  applicationService: {
    margin: "5px 0 0",
    fontSize: "19px",
    color: "#172033",
  },

  applicationBottom: {
    marginTop: "20px",
    paddingTop: "15px",
    borderTop: "1px solid #f0f2f5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  applicationDate: {
    margin: 0,
    color: "#718096",
    fontSize: "12px",
  },

  arrow: {
    color: "#1769e0",
    fontSize: "20px",
    fontWeight: 900,
  },

  serviceGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: "18px",
  },

  serviceCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf1",
    borderRadius: "20px",
    padding: "23px",
    boxShadow: "0 6px 22px rgba(15,23,42,0.03)",
  },

  serviceCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  serviceIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "15px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  serviceArrow: {
    color: "#cbd5e1",
    fontSize: "24px",
  },

  serviceTitle: {
    margin: "18px 0 8px",
    fontSize: "19px",
    fontWeight: 800,
    color: "#172033",
  },

  serviceDescription: {
    margin: 0,
    color: "#718096",
    lineHeight: 1.65,
    fontSize: "13px",
    minHeight: "64px",
  },

  cardButton: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    borderRadius: "11px",
    border: "none",
    background: "#f1f6ff",
    color: "#1769e0",
    fontWeight: 800,
    cursor: "pointer",
  },

  howSection: {
    maxWidth: "1280px",
    margin: "70px auto 0",
    padding: "55px",
    borderRadius: "28px",
    background: "#ffffff",
    border: "1px solid #e7ebf2",
  },

  howHeader: {
    textAlign: "center",
    marginBottom: "35px",
  },

  stepsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
  },

  stepCard: {
    position: "relative",
    padding: "25px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #edf0f5",
  },

  stepNumber: {
    color: "#dbeafe",
    fontSize: "40px",
    fontWeight: 900,
  },

  stepIcon: {
    fontSize: "30px",
    margin: "7px 0 13px",
  },

  ctaSection: {
    maxWidth: "1280px",
    margin: "60px auto 0",
    padding: "40px 45px",
    borderRadius: "25px",
    background:
      "linear-gradient(135deg,#0f3d7a,#1769e0)",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
  },

  ctaLabel: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "1px",
    color: "#bfdbfe",
  },

  ctaTitle: {
    margin: "7px 0",
    fontSize: "29px",
    fontWeight: 900,
  },

  ctaText: {
    margin: 0,
    color: "#dbeafe",
    fontSize: "14px",
  },

  ctaButton: {
    border: "none",
    borderRadius: "12px",
    padding: "14px 20px",
    background: "#ffffff",
    color: "#1557b0",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  footer: {
    maxWidth: "1280px",
    margin: "70px auto 0",
    padding: "35px 0",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    gap: "25px",
    color: "#64748b",
  },

  footerLogo: {
    margin: 0,
    fontSize: "20px",
    color: "#172033",
  },

  footerText: {
    margin: "7px 0 0",
    maxWidth: "400px",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  footerRight: {
    textAlign: "right",
    fontSize: "13px",
  },

  footerCopyright: {
    color: "#94a3b8",
    marginTop: "7px",
  },
};