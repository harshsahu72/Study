import { useState, useRef, useEffect } from "react";
import SUBJECTS from "./subjectData";

/* ─── Global Styles ─── */
import GlobalStyle from "./components/GlobalStyle";
/* ─── API Call ─── */
import { callAI } from "./utils/api";
import Spinner from "./components/Spinner";
import Toast from "./components/Toast";

/* ─── Constants ─── */

const PLANS = [
  {
    id: "1month",
    label: "1 Month",
    price: 49,
    per: "₹49/mo",
    save: "—",
    color: "var(--muted)",
  },
  {
    id: "3month",
    label: "3 Months",
    price: 159,
    per: "₹53/mo",
    save: "Save ₹51",
    color: "var(--teal)",
    badge: "Save ₹51",
  },
  {
    id: "6month",
    label: "6 Months",
    price: 399,
    per: "₹66/mo",
    save: "Save ₹96",
    color: "var(--amber)",
    badge: "⭐ Best Value",
    popular: true,
  },
  {
    id: "1year",
    label: "1 Year",
    price: 599,
    per: "₹50/mo",
    save: "Save ₹289",
    color: "var(--rose)",
    badge: "🔥 Deal",
  },
];

/* ─── Small Reusable Components ─── */

const Btn = ({
  children,
  onClick,
  variant = "amber",
  style = {},
  disabled = false,
  small = false,
}) => {
  const bg = {
    amber: "linear-gradient(135deg,#ffb830,#ff8c00)",
    ghost: "rgba(255,255,255,.06)",
    teal: "linear-gradient(135deg,#2dd4bf,#0d9488)",
    rose: "linear-gradient(135deg,#f43f5e,#be123c)",
    muted: "rgba(255,255,255,.06)",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg[variant] || bg.amber,
        border:
          variant === "ghost" || variant === "muted"
            ? "1px solid var(--border)"
            : "none",
        color:
          variant === "amber"
            ? "#05080e"
            : variant === "teal" || variant === "rose"
              ? "#fff"
              : "var(--text)",
        padding: small ? "8px 16px" : "12px 22px",
        borderRadius: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: small ? 13 : 14,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        opacity: disabled ? 0.6 : 1,
        transition: "opacity .2s, transform .1s",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = ".85";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

/* ─── Markdown-style content renderer ─── */
const renderFormatted = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={key++} style={{ height: 8 }} />);
      return;
    }
    // H1 / H2 / H3
    if (/^###\s/.test(trimmed)) {
      elements.push(
        <div
          key={key++}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--teal)",
            marginTop: 14,
            marginBottom: 4,
          }}
        >
          {trimmed.replace(/^###\s/, "")}
        </div>,
      );
    } else if (/^##\s/.test(trimmed)) {
      elements.push(
        <div
          key={key++}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 17,
            color: "var(--amber)",
            marginTop: 18,
            marginBottom: 6,
            borderBottom: "1px solid rgba(255,184,48,.15)",
            paddingBottom: 6,
          }}
        >
          {trimmed.replace(/^##\s/, "")}
        </div>,
      );
    } else if (/^#\s/.test(trimmed)) {
      elements.push(
        <div
          key={key++}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 20,
            color: "var(--text)",
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          {trimmed.replace(/^#\s/, "")}
        </div>,
      );
      // Bullet / numbered list
    } else if (/^[-*•]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[-*•]\s/, "");
      elements.push(
        <div
          key={key++}
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginBottom: 4,
            paddingLeft: 8,
          }}
        >
          <span
            style={{
              color: "var(--amber)",
              flexShrink: 0,
              marginTop: 3,
              fontSize: 10,
            }}
          >
            ◆
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>
            {inlineFormat(content)}
          </span>
        </div>,
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\.\s/)[1];
      const content = trimmed.replace(/^\d+\.\s/, "");
      elements.push(
        <div
          key={key++}
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginBottom: 4,
            paddingLeft: 8,
          }}
        >
          <span
            style={{
              color: "var(--amber)",
              flexShrink: 0,
              fontWeight: 700,
              fontSize: 13,
              minWidth: 20,
            }}
          >
            {num}.
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>
            {inlineFormat(content)}
          </span>
        </div>,
      );
      // Bold label line (e.g. **Key Points:**)
    } else if (
      /^\*\*.*\*\*/.test(trimmed) &&
      trimmed.replace(/\*\*/g, "").length < 60
    ) {
      elements.push(
        <div
          key={key++}
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "var(--amber)",
            marginTop: 12,
            marginBottom: 2,
          }}
        >
          {trimmed.replace(/\*\*/g, "")}
        </div>,
      );
    } else {
      elements.push(
        <p
          key={key++}
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            margin: "2px 0",
            color: "var(--text)",
          }}
        >
          {inlineFormat(trimmed)}
        </p>,
      );
    }
  });
  return elements;
};

const inlineFormat = (text) => {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) =>
    /^\*\*[^*]+\*\*$/.test(part) ? (
      <strong key={i} style={{ color: "var(--amber)", fontWeight: 700 }}>
        {part.replace(/\*\*/g, "")}
      </strong>
    ) : (
      part
    ),
  );
};

const ResultBox = ({
  content,
  onSave,
  onCopy,
  title = "Generated Result",
  loading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };
  if (!content && !loading) return null;
  return (
    <div
      style={{
        background: "rgba(255,184,48,.04)",
        border: "1px solid rgba(255,184,48,.15)",
        borderRadius: 14,
        padding: 24,
        marginTop: 16,
        animation: "fadeIn .4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--amber)",
            textTransform: "uppercase",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: "var(--amber)",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          {title}
        </div>
        {content && (
          <div style={{ display: "flex", gap: 8 }}>
            {onSave && (
              <Btn variant="ghost" small onClick={onSave}>
                💾 Save
              </Btn>
            )}
            <Btn variant="ghost" small onClick={handleCopy}>
              {copied ? "✓ Copied" : "📋 Copy"}
            </Btn>
          </div>
        )}
      </div>
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--muted)",
            fontSize: 14,
          }}
        >
          <Spinner /> Generating with AI…
        </div>
      ) : (
        <div style={{ lineHeight: 1.8 }}>{renderFormatted(content)}</div>
      )}
    </div>
  );
};

/* ─── Auth Modal ─── */
const AuthModal = ({ mode, onClose, onAuth }) => {
  const [view, setView] = useState(mode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setErr("Please fill all fields.");
      return;
    }
    setLoading(true);
    setErr("");
    await new Promise((r) => setTimeout(r, 700));
    onAuth({ name: form.email.split("@")[0], email: form.email, plan: "free" });
    setLoading(false);
    onClose();
  };
  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setErr("Please fill all fields.");
      return;
    }
    if (form.password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setErr("");
    await new Promise((r) => setTimeout(r, 700));
    onAuth({ name: form.name, email: form.email, plan: "free" });
    setLoading(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0,0,0,.85)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 0 0",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-card"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          padding: "32px 24px",
          width: "100%",
          maxWidth: 440,
          position: "relative",
          animation: "fadeIn .3s ease",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,.07)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            width: 32,
            height: 32,
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {view === "login" ? (
          <>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              Welcome back 👋
            </div>
            <div
              style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}
            >
              Log in to access your study dashboard
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                className="inp"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="inp"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              {err && (
                <div style={{ color: "var(--rose)", fontSize: 13 }}>{err}</div>
              )}
              <Btn
                onClick={handleLogin}
                disabled={loading}
                style={{ justifyContent: "center", padding: 15 }}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Logging in…
                  </>
                ) : (
                  "Log In →"
                )}
              </Btn>
            </div>
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
                marginTop: 20,
              }}
            >
              Don't have an account?{" "}
              <span
                style={{
                  color: "var(--amber)",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
                onClick={() => setView("register")}
              >
                Sign up free
              </span>
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              Create account 🎓
            </div>
            <div
              style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}
            >
              Join 1.2L+ students on StudyMind AI
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                className="inp"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="inp"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="inp"
                type="tel"
                placeholder="Phone number (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="inp"
                type="password"
                placeholder="Create password (min 6 chars)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
              {err && (
                <div style={{ color: "var(--rose)", fontSize: 13 }}>{err}</div>
              )}
              <Btn
                onClick={handleRegister}
                disabled={loading}
                style={{ justifyContent: "center", padding: 15 }}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Creating…
                  </>
                ) : (
                  "Create Account →"
                )}
              </Btn>
            </div>
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
                marginTop: 20,
              }}
            >
              Already have an account?{" "}
              <span
                style={{
                  color: "var(--amber)",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
                onClick={() => setView("login")}
              >
                Log in
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Upgrade Modal — Real Razorpay Payment ─── */
const UpgradeModal = ({ onClose, onPaymentSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [payingPlan, setPayingPlan] = useState(null);
  const [payStatus, setPayStatus] = useState(null); // null | "success" | "failed"

  const handleSelectPlan = async (plan) => {
    if (loading) return;
    setPayingPlan(plan.id);
    setLoading(true);
    setPayStatus(null);

    try {
      // Step 1: Create Razorpay order on our backend
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          planId: plan.id,
          planLabel: plan.label,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Could not create order. Please try again.");
        setLoading(false);
        setPayingPlan(null);
        return;
      }

      const order = orderData.order;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_YourKeyIdHere",
        amount: order.amount,
        currency: order.currency,
        name: "StudyMind AI",
        description: `Pro Plan — ${plan.label}`,
        order_id: order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#ffb830" },
        handler: async (response) => {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              setPayStatus("success");
              setLoading(false);
              // Auto-approve: upgrade user to Pro after 1.4s to show success UI
              setTimeout(() => {
                onPaymentSuccess({
                  plan: "pro",
                  planLabel: plan.label,
                  planId: plan.id,
                });
              }, 1400);
            } else {
              setPayStatus("failed");
              setLoading(false);
              setPayingPlan(null);
            }
          } catch (err) {
            console.error("Verify error:", err);
            setPayStatus("failed");
            setLoading(false);
            setPayingPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPayingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setPayStatus("failed");
        setLoading(false);
        setPayingPlan(null);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment init error:", err);
      alert(
        "Payment service unavailable. Make sure the backend server is running on port 5000.",
      );
      setLoading(false);
      setPayingPlan(null);
    }
  };

  // ── Success Screen ──
  if (payStatus === "success") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 3000,
          background: "rgba(0,0,0,.9)",
          backdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "var(--card)",
            border: "1px solid rgba(45,212,191,.3)",
            borderRadius: 24,
            padding: 48,
            width: "100%",
            maxWidth: 440,
            textAlign: "center",
            animation: "fadeIn .4s ease",
          }}
        >
          <div
            style={{
              fontSize: 64,
              marginBottom: 16,
              animation: "fadeIn .5s ease",
            }}
          >
            🎉
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 800,
              color: "var(--teal)",
              marginBottom: 10,
            }}
          >
            Payment Successful!
          </div>
          <div style={{ color: "var(--muted)", fontSize: 15, marginBottom: 8 }}>
            Your Pro plan is now active.
          </div>
          <div
            style={{
              background: "rgba(45,212,191,.08)",
              border: "1px solid rgba(45,212,191,.2)",
              borderRadius: 12,
              padding: "12px 20px",
              display: "inline-block",
              color: "var(--teal)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            ⚡ Activating Pro Access…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0,0,0,.85)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-card"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          padding: "28px 20px 32px",
          width: "100%",
          maxWidth: 640,
          textAlign: "center",
          animation: "fadeIn .3s ease",
          maxHeight: "96vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Upgrade to Pro
        </div>
        <div style={{ color: "var(--muted)", fontSize: 15, marginBottom: 10 }}>
          Unlock unlimited AI notes, doubt solving, mock tests & more
        </div>

        {/* Secure payment badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 28,
            color: "var(--muted)",
            fontSize: 12,
          }}
        >
          <span>🔒</span>
          <span>
            Secure payment via Razorpay · UPI · Cards · Net Banking · Wallets
          </span>
        </div>

        {payStatus === "failed" && (
          <div
            style={{
              background: "rgba(244,63,94,.08)",
              border: "1px solid rgba(244,63,94,.25)",
              borderRadius: 10,
              padding: "10px 16px",
              color: "var(--rose)",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            ⚠️ Payment failed or was cancelled. Please try again.
          </div>
        )}

        {/* Plan Cards */}
        <div className="plans-grid">
          {PLANS.map((p) => {
            const isPaying = payingPlan === p.id && loading;
            return (
              <div
                key={p.id}
                onClick={() => !loading && handleSelectPlan(p)}
                style={{
                  background: p.popular
                    ? "linear-gradient(135deg,rgba(255,184,48,.15),rgba(255,140,0,.08))"
                    : "var(--bg3)",
                  border: p.popular
                    ? "1.5px solid rgba(255,184,48,.4)"
                    : "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "16px 14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "transform .15s, opacity .2s",
                  position: "relative",
                  opacity: loading && payingPlan !== p.id ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {p.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: p.popular ? "var(--amber)" : "var(--bg3)",
                      color: p.popular ? "#05080e" : "var(--muted)",
                      border: p.popular ? "none" : "1px solid var(--border)",
                      borderRadius: 50,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.badge}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--muted)",
                    marginBottom: 6,
                    marginTop: p.badge ? 8 : 0,
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 30,
                    fontWeight: 800,
                    color: "var(--amber)",
                  }}
                >
                  ₹{p.price}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    margin: "2px 0",
                  }}
                >
                  {p.per}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: p.color,
                    marginTop: 4,
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  {p.save}
                </div>
                {isPaying ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      background: "rgba(255,184,48,.1)",
                      borderRadius: 8,
                      padding: "8px",
                      fontSize: 12,
                      color: "var(--amber)",
                      fontWeight: 700,
                    }}
                  >
                    <Spinner /> Opening…
                  </div>
                ) : (
                  <div
                    style={{
                      background: p.popular
                        ? "linear-gradient(135deg,#ffb830,#ff8c00)"
                        : "rgba(255,255,255,.07)",
                      color: p.popular ? "#05080e" : "var(--text)",
                      borderRadius: 8,
                      padding: "8px",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Pay ₹{p.price} →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Features reminder */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          {[
            "Unlimited Notes",
            "Unlimited Doubts",
            "Mock Tests",
            "PDF Summarizer",
            "All PYQs",
          ].map((f) => (
            <span
              key={f}
              style={{
                background: "rgba(45,212,191,.07)",
                border: "1px solid rgba(45,212,191,.15)",
                color: "var(--teal)",
                borderRadius: 50,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ✓ {f}
            </span>
          ))}
        </div>

        <button
          onClick={onClose}
          disabled={loading}
          style={{
            color: "var(--muted)",
            background: "none",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            opacity: loading ? 0.5 : 1,
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

/* ─── Toast ─── */

/* ─── LANDING PAGE ─── */
const Landing = ({ onLaunch, onPricing, onAuth }) => {
  const [faqOpen, setFaqOpen] = useState(null);
  const faqs = [
    [
      "Is the free plan really free forever?",
      "Yes! The free plan is always free with 5 AI notes/day, 3 assignments/day, and 5 doubt questions/day. No credit card required.",
    ],
    [
      "Which classes and subjects are supported?",
      "We cover Class 9 to Masters — Mathematics, Science, English, History, Commerce, Engineering, and 50+ more subjects.",
    ],
    [
      "Can I cancel my Pro subscription anytime?",
      "Yes, you can cancel anytime. Your Pro access remains until the end of your billing period.",
    ],
    [
      "How is this different from ChatGPT?",
      "We are purpose-built for Indian students — with PYQs, syllabus notes, CBSE/ICSE content, and exam-ready formats. ChatGPT is general-purpose.",
    ],
    [
      "Is my data safe?",
      "Absolutely. We never sell your data. Your notes and history are private to your account.",
    ],
  ];

  return (
    <div>
      {/* HERO */}
      <section
        style={{
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(255,184,48,.12) 0%,transparent 70%)",
            animation: "orb1 8s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "8%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(45,212,191,.1) 0%,transparent 70%)",
            animation: "orb2 10s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            background: "rgba(255,184,48,.08)",
            border: "1px solid rgba(255,184,48,.2)",
            color: "var(--amber)",
            padding: "6px 18px",
            borderRadius: 50,
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 32,
            display: "inline-block",
          }}
        >
          🎓 India's Most Complete Student AI Platform
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px,7vw,80px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          One App.
          <br />
          <span style={{ color: "var(--amber)" }}>Every Subject.</span>
          <br />
          <span style={{ color: "var(--teal)" }}>Every Class.</span>
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "clamp(15px,2vw,18px)",
            maxWidth: 600,
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          From Class 9 to Masters — get AI notes, solve doubts, crack PYQs,
          practice mock tests & get chapter-wise PDFs instantly.
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 56,
          }}
        >
          <Btn
            onClick={onLaunch}
            style={{ padding: "16px 32px", fontSize: 16 }}
          >
            🚀 Start Learning Free
          </Btn>
          <Btn
            onClick={onPricing}
            variant="ghost"
            style={{ padding: "16px 28px", fontSize: 16 }}
          >
            View Plans
          </Btn>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            maxWidth: 700,
          }}
        >
          {[
            ["p1", "var(--amber)", "AI Notes Generator"],
            ["p2", "var(--teal)", "Doubt Solving Chat"],
            ["p3", "var(--rose)", "Previous Year Papers"],
            ["p4", "var(--violet)", "Mock Test Generator"],
            ["p5", "var(--amber)", "Chapter-wise PDFs"],
            ["p6", "var(--teal)", "Topic Deep Dive"],
            ["p7", "var(--rose)", "Assignment Helper"],
            ["p8", "var(--violet)", "PDF Summarizer"],
          ].map(([k, c, label]) => (
            <div
              key={k}
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid var(--border)",
                borderRadius: 50,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: c,
                  flexShrink: 0,
                }}
              />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg2)",
          padding: "36px 24px",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 48,
        }}
      >
        {[
          ["1.2L+", "Students Enrolled"],
          ["50+", "Subjects Covered"],
          ["5 Yrs", "PYQ Papers"],
          ["24/7", "AI Doubt Solving"],
          ["4.9★", "Student Rating"],
        ].map(([n, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 800,
                color: "var(--amber)",
              }}
            >
              {n}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* PRICING */}
      <section
        id="pricing-section"
        style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              background: "rgba(255,184,48,.08)",
              border: "1px solid rgba(255,184,48,.2)",
              color: "var(--amber)",
              padding: "5px 16px",
              borderRadius: 50,
              fontSize: 12,
              fontWeight: 700,
              display: "inline-block",
              marginBottom: 16,
            }}
          >
            Pricing
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px,4vw,48px)",
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            Simple Subscriptions
            <br />
            for Every Student
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16 }}>
            Start free. Pick any plan. Longer plan = bigger savings.
          </p>
        </div>

        {/* Free vs Pro */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 0,
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 48,
          }}
        >
          <div style={{ padding: 32 }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20 }}>
              🆓 Free Plan — Always Free
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "5 AI Notes/day",
                "3 Assignments/day",
                "5 Doubt questions/day",
                "PYQ (last 2 years)",
              ].map((f) => (
                <span key={f} style={{ fontSize: 14, color: "var(--teal)" }}>
                  ✓ {f}
                </span>
              ))}
              {[
                "Mock Tests",
                "Download/Save",
                "PDF Summarizer",
                "Syllabus Notes",
              ].map((f) => (
                <span key={f} style={{ fontSize: 14, color: "var(--muted)" }}>
                  ✗ {f}
                </span>
              ))}
            </div>
            <Btn
              onClick={onLaunch}
              variant="ghost"
              style={{ marginTop: 20, width: "100%", justifyContent: "center" }}
            >
              Start Free →
            </Btn>
          </div>
          <div
            style={{
              width: 1,
              background: "var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                color: "var(--muted)",
              }}
            >
              VS
            </div>
          </div>
          <div style={{ padding: 32, background: "rgba(255,184,48,.03)" }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20 }}>
              ⚡ Pro Plan — All Features Unlocked
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Unlimited AI Notes",
                "Unlimited Assignments",
                "Unlimited Doubt Solving",
                "All 5 Years PYQ + Answers",
                "Weekly Mock Tests",
                "Download & Save Notes",
                "PDF Summarizer (Unlimited)",
                "Syllabus → Notes Generator",
                "Chapter-wise PDFs",
                "Priority AI Responses",
              ].map((f) => (
                <span key={f} style={{ fontSize: 14, color: "var(--amber)" }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 16,
          }}
        >
          {PLANS.map((p) => (
            <div
              key={p.id}
              onClick={() => onAuth("register")}
              style={{
                background: p.popular
                  ? "linear-gradient(135deg,rgba(255,184,48,.12),rgba(255,140,0,.06))"
                  : "var(--bg2)",
                border: p.popular
                  ? "1.5px solid rgba(255,184,48,.35)"
                  : "1px solid var(--border)",
                borderRadius: 16,
                padding: 28,
                textAlign: "center",
                cursor: "pointer",
                transition: "transform .2s",
                position: "relative",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {p.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: p.popular ? "var(--amber)" : "var(--card)",
                    color: p.popular ? "#05080e" : "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 50,
                    padding: "4px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.badge}
                </div>
              )}
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--muted)",
                  fontSize: 13,
                  marginBottom: 8,
                  marginTop: p.badge ? 10 : 0,
                }}
              >
                {p.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  fontWeight: 800,
                  color: "var(--amber)",
                }}
              >
                ₹{p.price}
              </div>
              <div
                style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0" }}
              >
                {p.per}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: p.color,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                {p.save}
              </div>
              <Btn
                style={{ width: "100%", justifyContent: "center" }}
                variant={p.popular ? "amber" : "ghost"}
                small
              >
                Get Started →
              </Btn>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{ padding: "60px 24px", maxWidth: 760, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              background: "rgba(45,212,191,.08)",
              border: "1px solid rgba(45,212,191,.2)",
              color: "var(--teal)",
              padding: "5px 16px",
              borderRadius: 50,
              fontSize: 12,
              fontWeight: 700,
              display: "inline-block",
              marginBottom: 16,
            }}
          >
            FAQ
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px,3vw,40px)",
              fontWeight: 800,
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map(([q, a], i) => (
            <div
              key={i}
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: "left",
                  gap: 12,
                }}
              >
                {q}
                <span
                  style={{
                    color: "var(--amber)",
                    fontSize: 20,
                    flexShrink: 0,
                    transition: "transform .2s",
                    transform: faqOpen === i ? "rotate(45deg)" : "rotate(0)",
                  }}
                >
                  {faqOpen === i ? "−" : "+"}
                </span>
              </button>
              {faqOpen === i && (
                <div
                  style={{
                    padding: "0 22px 18px",
                    color: "var(--muted)",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "40px 24px",
          borderTop: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          📚 Cheat<em>sheet</em>
        </div>
        <p>Made with ❤️ for students across India</p>
        <p style={{ marginTop: 6, opacity: 0.4, fontSize: 12 }}>
          © 2025 StudyMind AI · Privacy · Terms
        </p>
      </footer>
    </div>
  );
};

/* ─── PANEL WRAPPER ─── */
const Panel = ({ title, subtitle, icon, children }) => (
  <div style={{ animation: "fadeIn .4s ease" }}>
    <div style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          fontWeight: 800,
        }}
      >
        {icon} {title}
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>
        {subtitle}
      </p>
    </div>
    {children}
  </div>
);

/* ─── PANEL: NOTES ─── */
const NotesPanel = ({ subject }) => {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Brief Notes");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState([]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    const text = await callAI([
      {
        role: "user",
        content: `Generate ${style} on the topic: "${topic}"${subject ? ` for a student studying ${subject}.` : "."} Format it clearly with sections, key points, and examples where needed.`,
      },
    ]);
    setResult(text);
    setLoading(false);
  };

  return (
    <Panel
      icon="📝"
      title="Notes Generator"
      subtitle="Generate crisp, exam-ready notes on any topic in seconds."
    >
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          className="inp"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Enter topic (e.g. Photosynthesis, Trigonometry, French Revolution…)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <select
          className="sel"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          {[
            "Brief Notes",
            "Detailed Notes",
            "Exam Notes",
            "Mind Map Style",
            "Q&A Format",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Btn onClick={generate} disabled={loading || !topic.trim()}>
          {loading ? (
            <>
              <Spinner />
              Generating…
            </>
          ) : (
            "✦ Generate Notes"
          )}
        </Btn>
      </div>
      <ResultBox
        content={result}
        loading={loading}
        onSave={() => setSaved((s) => [...s, { topic, text: result }])}
        title="Generated Notes"
      />
      {saved.length > 0 && (
        <div style={{ marginTop: 16, fontSize: 13, color: "var(--teal)" }}>
          ✓ {saved.length} note(s) saved this session
        </div>
      )}
    </Panel>
  );
};

/* ─── PANEL: ASSIGNMENT ─── */
const AssignmentPanel = ({ subject }) => {
  const [q, setQ] = useState("");
  const [style, setStyle] = useState("Detailed Answer");
  const [tone, setTone] = useState("Academic Tone");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setResult("");
    const text = await callAI([
      {
        role: "user",
        content: `Answer this assignment question in ${style} with ${tone}${subject ? ` (Subject: ${subject})` : ""}:\n\n${q}`,
      },
    ]);
    setResult(text);
    setLoading(false);
  };

  return (
    <Panel
      icon="💡"
      title="Assignment Helper"
      subtitle="Paste your question, get a complete, well-structured answer."
    >
      <textarea
        className="ta"
        placeholder={
          "Paste your assignment question here…\ne.g. 'Explain the causes of World War 1 in 500 words'\nor 'Write a Python program to find prime numbers'"
        }
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select
          className="sel"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          {[
            "Detailed Answer",
            "Bullet Points",
            "Essay Format",
            "Step-by-Step",
            "Short Answer (100 words)",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="sel"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          {["Academic Tone", "Simple Language", "Formal"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Btn onClick={generate} disabled={loading || !q.trim()}>
          {loading ? (
            <>
              <Spinner />
              Generating…
            </>
          ) : (
            "✦ Get Answer"
          )}
        </Btn>
      </div>
      <ResultBox content={result} loading={loading} title="Answer" />
    </Panel>
  );
};

/* ─── PANEL: TOPIC DEEP DIVE ─── */
const TopicPanel = ({ subject }) => {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("Standard");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    const text = await callAI([
      {
        role: "user",
        content: `Give a ${depth} depth explanation of: "${topic}"${subject ? ` in the context of ${subject}` : ""}. Include definition, key concepts, real-world examples, common misconceptions, and exam tips.`,
      },
    ]);
    setResult(text);
    setLoading(false);
  };

  return (
    <Panel
      icon="🔍"
      title="Ask a Topic"
      subtitle="Deep-dive into any topic with AI-powered explanations."
    >
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          className="inp"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Enter any topic to explore deeply…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <select
          className="sel"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        >
          {["Quick Overview", "Standard", "In-Depth", "Research Level"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
        <Btn
          onClick={generate}
          disabled={loading || !topic.trim()}
          variant="teal"
        >
          {loading ? (
            <>
              <Spinner />
              Exploring…
            </>
          ) : (
            "🔍 Explore Topic"
          )}
        </Btn>
      </div>
      <ResultBox content={result} loading={loading} title="Topic Explanation" />
    </Panel>
  );
};

/* ─── PANEL: AI DOUBT SOLVER (chat) ─── */
const DoubtPanel = ({ subject }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm your AI Doubt Solver. Ask me anything — formulas, concepts, problems, or theory.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    const history = newMsgs
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));
    const reply = await callAI(
      history,
      `You are an expert tutor for Indian students. Answer clearly and helpfully${subject ? `, especially for ${subject}` : ""}. Use examples, formulas, and structured explanations.`,
    );
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  return (
    <Panel
      icon="🤖"
      title="AI Doubt Solver"
      subtitle="Ask any doubt — get instant, expert explanations."
    >
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          height: 400,
          overflowY: "auto",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: 14,
                fontSize: 14,
                lineHeight: 1.7,
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg,rgba(255,184,48,.2),rgba(255,140,0,.1))"
                    : "var(--bg3)",
                border:
                  m.role === "user"
                    ? "1px solid rgba(255,184,48,.25)"
                    : "1px solid var(--border)",
              }}
            >
              <pre style={{ margin: 0 }}>{m.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            <Spinner /> Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          className="inp"
          placeholder="Type your doubt here…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Btn onClick={send} disabled={loading || !input.trim()} variant="teal">
          Send
        </Btn>
      </div>
    </Panel>
  );
};

/* ─── PANEL: MOCK TEST ─── */
const MockTestPanel = ({ subject }) => {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("10");
  const [type, setType] = useState("MCQ");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    const text = await callAI([
      {
        role: "user",
        content: `Generate ${count} ${type} questions on "${topic}"${subject ? ` for ${subject}` : ""}. 
Return ONLY a JSON array with this format (no markdown, no explanation):
[{"q":"question text","opts":["A) option1","B) option2","C) option3","D) option4"],"ans":"A"}]
For Short Answer, omit opts and set ans to the answer string.`,
      },
    ]);
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed);
    } catch {
      setQuestions([
        {
          q: "Could not parse questions. Please try again.",
          opts: [],
          ans: "",
        },
      ]);
    }
    setLoading(false);
  };

  const score = () => {
    let s = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.ans) s++;
    });
    return s;
  };

  return (
    <Panel
      icon="✍️"
      title="Mock Test Generator"
      subtitle="Auto-generate practice tests on any topic."
    >
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          className="inp"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Topic for mock test…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <select
          className="sel"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        >
          {["5", "10", "15", "20"].map((n) => (
            <option key={n}>{n} Questions</option>
          ))}
        </select>
        <select
          className="sel"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {["MCQ", "True/False", "Short Answer"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <Btn
          onClick={generate}
          disabled={loading || !topic.trim()}
          variant="rose"
        >
          {loading ? (
            <>
              <Spinner />
              Generating…
            </>
          ) : (
            "✦ Generate Test"
          )}
        </Btn>
      </div>

      {questions.length > 0 && (
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            animation: "fadeIn .4s ease",
          }}
        >
          {submitted && (
            <div
              style={{
                background: "rgba(45,212,191,.08)",
                border: "1px solid rgba(45,212,191,.2)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--teal)",
                }}
              >
                {score()}/{questions.length}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 14 }}>
                Score — {Math.round((score() / questions.length) * 100)}%
              </div>
            </div>
          )}
          {questions.map((q, i) => (
            <div
              key={i}
              style={{
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom:
                  i < questions.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 15 }}>
                {i + 1}. {q.q}
              </div>
              {q.opts?.length > 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {q.opts.map((o, j) => {
                    const letter = String.fromCharCode(65 + j);
                    const isSelected = answers[i] === letter;
                    const isCorrect = submitted && letter === q.ans;
                    const isWrong = submitted && isSelected && letter !== q.ans;
                    return (
                      <button
                        key={j}
                        onClick={() => {
                          if (!submitted)
                            setAnswers((a) => ({ ...a, [i]: letter }));
                        }}
                        style={{
                          background: isCorrect
                            ? "rgba(45,212,191,.12)"
                            : isWrong
                              ? "rgba(244,63,94,.12)"
                              : isSelected
                                ? "rgba(255,184,48,.1)"
                                : "rgba(255,255,255,.03)",
                          border: `1px solid ${isCorrect ? "rgba(45,212,191,.4)" : isWrong ? "rgba(244,63,94,.4)" : isSelected ? "rgba(255,184,48,.3)" : "var(--border)"}`,
                          color: "var(--text)",
                          borderRadius: 10,
                          padding: "10px 14px",
                          cursor: submitted ? "default" : "pointer",
                          textAlign: "left",
                          fontFamily: "var(--font-body)",
                          fontSize: 14,
                          transition: "all .15s",
                        }}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <textarea
                    className="ta"
                    style={{ minHeight: 60 }}
                    placeholder="Your answer…"
                    value={answers[i] || ""}
                    onChange={(e) => {
                      if (!submitted)
                        setAnswers((a) => ({ ...a, [i]: e.target.value }));
                    }}
                  />
                  {submitted && (
                    <div
                      style={{
                        color: "var(--teal)",
                        fontSize: 13,
                        marginTop: 6,
                      }}
                    >
                      ✓ Answer: {q.ans}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {!submitted ? (
            <Btn
              onClick={() => setSubmitted(true)}
              variant="amber"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Submit Test →
            </Btn>
          ) : (
            <Btn
              onClick={() => {
                setQuestions([]);
                setSubmitted(false);
                setAnswers({});
              }}
              variant="ghost"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Try Another Test
            </Btn>
          )}
        </div>
      )}
    </Panel>
  );
};

/* ─── PANEL: 100 QUESTIONS ─── */
const HundredQPanel = ({ subject }) => {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    const text = await callAI([
      {
        role: "user",
        content: `Generate 30 important exam questions on "${topic}"${subject ? ` for ${subject}` : ""}. Include a mix of: definitions, explain-type, numerical, application, and MCQs. Number each question clearly.`,
      },
    ]);
    setResult(text);
    setLoading(false);
  };

  return (
    <Panel
      icon="💯"
      title="100 Questions"
      subtitle="Get important exam questions on any chapter or topic."
    >
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          className="inp"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Chapter or topic name…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <Btn
          onClick={generate}
          disabled={loading || !topic.trim()}
          variant="violet"
          style={{ "--violet": "var(--violet)" }}
        >
          {loading ? (
            <>
              <Spinner />
              Generating…
            </>
          ) : (
            "💯 Get Questions"
          )}
        </Btn>
      </div>
      <ResultBox
        content={result}
        loading={loading}
        title="Important Questions"
      />
    </Panel>
  );
};

/* ─── PANEL: SYLLABUS NOTES ─── */
const SyllabusPanel = ({ subject }) => {
  const [syllabus, setSyllabus] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!syllabus.trim()) return;
    setLoading(true);
    setResult("");
    const text = await callAI([
      {
        role: "user",
        content: `Convert this syllabus into comprehensive study notes${subject ? ` for ${subject}` : ""}. For each topic in the syllabus, write key points, definitions, formulas, and examples.\n\nSyllabus:\n${syllabus}`,
      },
    ]);
    setResult(text);
    setLoading(false);
  };

  return (
    <Panel
      icon="📤"
      title="Syllabus → Notes"
      subtitle="Paste your syllabus and get complete notes for all topics."
    >
      <textarea
        className="ta"
        style={{ minHeight: 140, marginBottom: 12 }}
        placeholder={
          "Paste your syllabus here…\nE.g.:\nUnit 1: Electrostatics\n- Electric charge and fields\n- Gauss's law\nUnit 2: Current Electricity\n…"
        }
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
      />
      <Btn onClick={generate} disabled={loading || !syllabus.trim()}>
        {loading ? (
          <>
            <Spinner />
            Generating…
          </>
        ) : (
          "✦ Generate Notes from Syllabus"
        )}
      </Btn>
      <ResultBox content={result} loading={loading} title="Syllabus Notes" />
    </Panel>
  );
};

/* ─── PANEL: PDF SUMMARIZER (with file upload) ─── */
const PDFSumPanel = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const readFileText = (f) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(f);
    });
  };

  const handleFile = async (f) => {
    if (!f || f.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    setFile(f);
    setExtractedText("");
    setResult("");
    setExtracting(true);

    // Try reading as text (works for text-based PDFs)
    try {
      const raw = await readFileText(f);
      // Extract readable text from PDF binary (basic extraction)
      const matches = raw.match(/BT[\s\S]*?ET/g) || [];
      let extracted = "";
      matches.forEach((block) => {
        const textMatches = block.match(/\(([^)]+)\)/g) || [];
        extracted += textMatches.map((t) => t.slice(1, -1)).join(" ") + "\n";
      });
      // fallback: grab printable ASCII
      if (extracted.trim().length < 50) {
        extracted = raw
          .replace(/[^\x20-\x7E\n]/g, " ")
          .replace(/ {2,}/g, " ")
          .trim()
          .substring(0, 6000);
      }
      setExtractedText(extracted.substring(0, 6000));
    } catch (err) {
      setExtractedText(
        "Could not extract text automatically. Please paste the text below.",
      );
    }
    setExtracting(false);
  };

  const summarize = async () => {
    const content = extractedText.trim();
    if (!content) return;
    setLoading(true);
    setResult("");
    const t = await callAI([
      {
        role: "user",
        content: `You are an expert academic summarizer. Analyze the following PDF content and produce a well-structured summary with these sections:\n\n## 📌 Key Highlights\n## 🧠 Main Concepts\n## 📖 Important Terms & Definitions\n## 🔑 Key Takeaways\n## 📝 Brief Summary\n\nPDF Content:\n${content.substring(0, 5000)}`,
      },
    ]);
    setResult(t);
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <Panel
      icon="📄"
      title="PDF Summarizer"
      subtitle="Upload a PDF file and get an instant AI-powered structured summary."
    >
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--amber)" : file ? "rgba(45,212,191,.5)" : "var(--border)"}`,
          borderRadius: 16,
          padding: "36px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver
            ? "rgba(255,184,48,.04)"
            : file
              ? "rgba(45,212,191,.03)"
              : "var(--bg3)",
          transition: "all .2s",
          marginBottom: 16,
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {extracting ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Spinner />
            <div style={{ fontSize: 14, color: "var(--muted)" }}>
              Extracting PDF content…
            </div>
          </div>
        ) : file ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 36 }}>📄</div>
            <div
              style={{ fontWeight: 700, fontSize: 15, color: "var(--teal)" }}
            >
              {file.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {(file.size / 1024).toFixed(1)} KB · Click to change file
            </div>
            {extractedText && (
              <div
                style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600 }}
              >
                ✓ {extractedText.length.toLocaleString()} characters extracted
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 48, opacity: 0.5 }}>📤</div>
            <div
              style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}
            >
              Drop your PDF here
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              or click to browse · PDF files only
            </div>
          </div>
        )}
      </div>

      {/* Manual text fallback */}
      {file && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
            Extracted text preview (editable):
          </div>
          <textarea
            className="ta"
            style={{ minHeight: 120, fontSize: 13 }}
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="PDF text will appear here. You can also paste/edit text manually…"
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Btn
          onClick={summarize}
          disabled={loading || !extractedText.trim() || extracting}
          style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
        >
          {loading ? (
            <>
              <Spinner />
              Summarizing…
            </>
          ) : (
            "✦ Summarize PDF"
          )}
        </Btn>
        {file && (
          <Btn
            variant="ghost"
            small
            onClick={() => {
              setFile(null);
              setExtractedText("");
              setResult("");
            }}
          >
            ✕ Clear
          </Btn>
        )}
        {extractedText && (
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {extractedText.length.toLocaleString()} chars
          </span>
        )}
      </div>
      <ResultBox content={result} loading={loading} title="PDF Summary" />
    </Panel>
  );
};

/* ─── PANEL: PYQ ─── */
const PYQPanel = ({ subject }) => {
  const [year, setYear] = useState("2023");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setResult("");
    const text = await callAI([
      {
        role: "user",
        content: `Generate a realistic Previous Year Question paper style set for ${year}${subject ? ` for ${subject}` : " (general)"}. Include 20 questions of varying difficulty: MCQs, short answers, and long answers. Mark each with marks allocated.`,
      },
    ]);
    setResult(text);
    setLoading(false);
  };

  return (
    <Panel
      icon="📋"
      title="Previous Year Papers"
      subtitle="Practice with PYQ-style questions for any subject."
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <div style={{ color: "var(--muted)", fontSize: 14 }}>Select Year:</div>
        {["2023", "2022", "2021", "2020", "2019"].map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            style={{
              background: year === y ? "rgba(255,184,48,.15)" : "var(--bg3)",
              border: `1px solid ${year === y ? "rgba(255,184,48,.4)" : "var(--border)"}`,
              color: year === y ? "var(--amber)" : "var(--muted)",
              borderRadius: 8,
              padding: "7px 14px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {y}
          </button>
        ))}
        <Btn onClick={generate} disabled={loading}>
          {loading ? (
            <>
              <Spinner />
              Loading…
            </>
          ) : (
            "📋 Get PYQ"
          )}
        </Btn>
      </div>
      <ResultBox content={result} loading={loading} title={`PYQ ${year}`} />
    </Panel>
  );
};

/* ─── PANEL: CHAPTER PDFs ─── */
const ChaptersPanel = ({ subject }) => {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    const text = await callAI([
      {
        role: "user",
        content: `Create a comprehensive chapter-wise notes document for "${topic}"${subject ? ` (${subject})` : ""}. Include: Chapter Overview, Learning Objectives, Detailed Content with sub-topics, Important Formulas/Definitions, Examples, Summary, and Practice Questions.`,
      },
    ]);
    setResult(text);
    setLoading(false);
  };

  return (
    <Panel
      icon="📚"
      title="Chapter PDFs"
      subtitle="Generate complete chapter notes ready to download."
    >
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          className="inp"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Chapter name (e.g. Thermodynamics, The French Revolution)…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <Btn
          onClick={generate}
          disabled={loading || !topic.trim()}
          variant="teal"
        >
          {loading ? (
            <>
              <Spinner />
              Generating…
            </>
          ) : (
            "📚 Generate Chapter"
          )}
        </Btn>
      </div>
      <ResultBox content={result} loading={loading} title="Chapter Notes" />
    </Panel>
  );
};

/* ─── PANEL: SAVED NOTES ─── */
const SavedPanel = ({ saved, onClear }) => (
  <Panel
    icon="💾"
    title="Saved Notes"
    subtitle="Your saved notes from this session."
  >
    {saved.length === 0 ? (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--muted)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>No saved notes yet</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>
          Generate notes and click 💾 Save to store them here.
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            {saved.length} saved note(s)
          </div>
          <Btn onClick={onClear} variant="ghost" small>
            Clear All
          </Btn>
        </div>
        {saved.map((n, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: 6,
                color: "var(--amber)",
              }}
            >
              {n.topic || `Note ${i + 1}`}
            </div>
            <pre style={{ maxHeight: 200, overflowY: "auto", fontSize: 13 }}>
              {n.text}
            </pre>
          </div>
        ))}
      </div>
    )}
  </Panel>
);

/* ─── SIDEBAR ─── */
const SIDEBAR_ITEMS = [
  { id: "notes", icon: "📝", label: "Notes Generator", section: "Study Tools" },
  {
    id: "assignment",
    icon: "💡",
    label: "Assignment Helper",
    section: "Study Tools",
  },
  { id: "topic", icon: "🔍", label: "Ask a Topic", section: "Study Tools" },
  {
    id: "doubt",
    icon: "🤖",
    label: "AI Doubt Solver",
    badge: "Live",
    section: "Study Tools",
  },
  {
    id: "syllabus",
    icon: "📤",
    label: "Syllabus → Notes",
    badge: "New",
    section: "Explore",
  },
  {
    id: "pyq",
    icon: "📋",
    label: "Previous Year Papers",
    badge: "5 Yrs",
    section: "Resources",
  },
  { id: "chapters", icon: "📚", label: "Chapter PDFs", section: "Resources" },
  {
    id: "pdfsum",
    icon: "📄",
    label: "PDF Summarizer",
    badge: "Upload",
    section: "Resources",
  },
  {
    id: "mocktest",
    icon: "✍️",
    label: "Mock Test",
    badge: "Weekly",
    section: "Practice",
  },
  {
    id: "hundredq",
    icon: "💯",
    label: "100 Questions",
    badge: "New",
    section: "Practice",
  },
  { id: "saved", icon: "💾", label: "Saved Notes", section: "My Library" },
];

/* ─── APP DASHBOARD ─── */
const Dashboard = ({
  user,
  onLogout,
  onUpgrade,
  mobileSidebarOpen,
  onMobileSidebarChange,
}) => {
  const [panel, setPanel] = useState("notes");
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSem, setSelectedSem] = useState("");
  const [customSem, setCustomSem] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);

  // Use parent-controlled mobile sidebar if provided, else internal state
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const sidebarOpen =
    mobileSidebarOpen !== undefined ? mobileSidebarOpen : internalSidebarOpen;
  const setSidebarOpen = onMobileSidebarChange || setInternalSidebarOpen;

  const classes = [
    "9",
    "10",
    "11",
    "12",
    "B.Tech",
    "B.Tech (CSE)",
    "B.Tech (AI & DS)",
    "B.Tech (CyberSec)",
    "B.Sc",
    "B.Com",
    "B.Com (Hons)",
    "B.A",
    "BCA",
    "BCA (AI & ML)",
    "BCA (DS)",
    "BBA",
    "BBA (Finance)",
    "BBA (Marketing)",
    "BDS",
    "BHM",
    "BPT",
    "B.V.Sc",
    "B.F.A",
    "BMS",
    "BAMS",
    "BHMS",
    "M.Tech",
    "M.Sc",
    "M.Com",
    "M.A",
    "MCA",
    "MBA",
    "MBA (Finance)",
    "MBA (Marketing)",
    "MBA (HR)",
    "MD",
    "MS",
    "LLM",
    "M.Ed",
    "M.Des",
    "M.Arch",
    "M.Pharm",
    "CA",
    "LLB",
    "MBBS",
    "B.Arch",
    "B.Pharm",
    "B.Sc Nursing",
    "B.Ed",
    "B.Des",
  ];

  const classData = SUBJECTS[selectedClass] || [];
  const isSemBased = !Array.isArray(classData);
  const semesters = isSemBased ? Object.keys(classData) : [];
  const subjects = isSemBased
    ? selectedSem
      ? classData[selectedSem]
      : []
    : classData;

  const addNote = (topic, text) =>
    setSavedNotes((n) => [...n, { topic, text }]);

  const renderPanel = () => {
    const fullContext = [
      selectedClass &&
        (["9", "10", "11", "12"].includes(selectedClass)
          ? `Class ${selectedClass}`
          : selectedClass),
      selectedSem,
      selectedSubject &&
      selectedSubject !== "All Subjects" &&
      selectedSubject !== "Other"
        ? selectedSubject
        : customSubject,
    ]
      .filter(Boolean)
      .join(" - ");

    const props = { subject: fullContext, selectedClass };
    switch (panel) {
      case "notes":
        return <NotesPanel {...props} onSave={addNote} />;
      case "assignment":
        return <AssignmentPanel {...props} />;
      case "topic":
        return <TopicPanel {...props} />;
      case "doubt":
        return <DoubtPanel {...props} />;
      case "syllabus":
        return <SyllabusPanel {...props} />;
      case "pyq":
        return <PYQPanel {...props} />;
      case "chapters":
        return <ChaptersPanel {...props} />;
      case "pdfsum":
        return <PDFSumPanel />;
      case "mocktest":
        return <MockTestPanel {...props} />;
      case "hundredq":
        return <HundredQPanel {...props} />;
      case "saved":
        return (
          <SavedPanel saved={savedNotes} onClear={() => setSavedNotes([])} />
        );
      default:
        return null;
    }
  };

  // Group sidebar items by section
  const sections = [...new Set(SIDEBAR_ITEMS.map((i) => i.section))];

  const Sidebar = () => (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        height: "100%",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: 1,
          padding: "4px 8px",
          marginBottom: 8,
        }}
      >
        Study Tools
      </div>
      {sections.map((sec) => (
        <div key={sec}>
          {sec !== "Study Tools" && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
                padding: "12px 8px 4px",
              }}
            >
              {sec}
            </div>
          )}
          {SIDEBAR_ITEMS.filter((i) => i.section === sec).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPanel(item.id);
                setSidebarOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background:
                  panel === item.id ? "rgba(255,184,48,.1)" : "transparent",
                color: panel === item.id ? "var(--amber)" : "var(--text)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: panel === item.id ? 700 : 500,
                textAlign: "left",
                transition: "background .15s",
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === "saved" && savedNotes.length > 0 && (
                <span
                  style={{
                    background: "rgba(255,184,48,.2)",
                    color: "var(--amber)",
                    borderRadius: 50,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {savedNotes.length}
                </span>
              )}
              {item.badge && item.id !== "saved" && (
                <span
                  style={{
                    background: "rgba(45,212,191,.15)",
                    color: "var(--teal)",
                    borderRadius: 50,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
      {/* Upgrade CTA at sidebar bottom for free users */}
      {user?.plan !== "pro" && (
        <div style={{ marginTop: "auto", padding: "16px 8px 8px" }}>
          <div
            onClick={onUpgrade}
            style={{
              background:
                "linear-gradient(135deg,rgba(255,184,48,.12),rgba(255,140,0,.06))",
              border: "1px solid rgba(255,184,48,.25)",
              borderRadius: 12,
              padding: "14px 14px",
              cursor: "pointer",
              transition: "transform .15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.02)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--amber)",
                marginBottom: 4,
              }}
            >
              ⚡ Upgrade to Pro
            </div>
            <div
              style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}
            >
              Unlock unlimited AI features from ₹49/mo
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <div
      style={{
        height: "calc(100vh - 65px)",
        display: "flex",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Mobile overlay — clicks close the sidebar */}
      <div
        className={`mob-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar — desktop: static | mobile: fixed drawer via CSS */}
      <div className={`mob-sidebar-wrap${sidebarOpen ? " open" : ""}`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Mobile top bar: hamburger + current panel label */}
        <div
          className="mob-only"
          style={{
            borderBottom: "1px solid var(--border)",
            padding: "10px 14px",
            background: "var(--bg2)",
            flexShrink: 0,
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              width: 36,
              height: 36,
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ☰
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
            {SIDEBAR_ITEMS.find((i) => i.id === panel)?.icon}{" "}
            {SIDEBAR_ITEMS.find((i) => i.id === panel)?.label}
          </span>
        </div>

        {/* Class/Subject selector bar */}
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            padding: "10px 16px",
            background: "var(--bg2)",
            flexShrink: 0,
          }}
        >
          <div className="selector-bar">
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--muted)",
                flexShrink: 0,
              }}
            >
              📍
            </span>
            <select
              className="sel"
              style={{
                fontSize: 12,
                padding: "5px 8px",
                minWidth: 100,
                flexShrink: 0,
              }}
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubject("");
                setSelectedSem("");
                setCustomSem("");
                setCustomSubject("");
              }}
            >
              {classes.map((c) => (
                <option key={c} value={c}>
                  {["9", "10", "11", "12"].includes(c) ? `Class ${c}` : c}
                </option>
              ))}
            </select>

            {(isSemBased || selectedSem) && (
              <>
                <select
                  className="sel"
                  style={{ fontSize: 12, padding: "5px 8px", flexShrink: 0 }}
                  value={selectedSem}
                  onChange={(e) => {
                    setSelectedSem(e.target.value);
                    setSelectedSubject("");
                    setCustomSem("");
                  }}
                >
                  <option value="">Sem</option>
                  {semesters.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {selectedSem === "Other" && (
                  <input
                    className="inp"
                    style={{ width: 90, padding: "5px 8px", flexShrink: 0 }}
                    placeholder="Sem 3"
                    value={customSem}
                    onChange={(e) => setCustomSem(e.target.value)}
                  />
                )}
              </>
            )}

            {(subjects.length > 0 || selectedSem === "Other") && (
              <>
                <select
                  className="sel"
                  style={{ fontSize: 12, padding: "5px 8px", flexShrink: 0 }}
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCustomSubject("");
                  }}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {selectedSubject === "Other" && (
                  <input
                    className="inp"
                    style={{ width: 130, padding: "5px 8px", flexShrink: 0 }}
                    placeholder="Subject..."
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Panel content */}
        <div
          className="panel-content"
          style={{ flex: 1, padding: "24px 20px", overflowY: "auto" }}
        >
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};

/* ─── TOPNAV ─── */
const Topnav = ({
  user,
  onLogo,
  onPricing,
  onAuth,
  onLogout,
  onDashboard,
  onUpgrade,
  onMenuToggle,
}) => (
  <nav
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 600,
      height: 65,
      background: "rgba(5,8,14,.96)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      justifyContent: "space-between",
    }}
  >
    {/* Left: hamburger (mobile only) + logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Hamburger — only shown on mobile via CSS */}
      <button
        className="mob-only"
        onClick={onMenuToggle}
        style={{
          background: "rgba(255,255,255,.07)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          width: 38,
          height: 38,
          borderRadius: 10,
          cursor: "pointer",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <button
        onClick={onLogo}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 800,
          color: "var(--text)",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        📚 Cheat<em>sheet</em>
      </button>
    </div>

    {/* Right: nav actions */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        className="desk-only"
        onClick={onPricing}
        style={{
          background: "none",
          border: "none",
          color: "var(--muted)",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Pricing
      </button>
      {user ? (
        <>
          <div
            style={{
              background: "rgba(255,184,48,.1)",
              border: "1px solid rgba(255,184,48,.25)",
              color: "var(--amber)",
              padding: "4px 10px",
              borderRadius: 50,
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user.plan === "pro" ? "⚡ PRO" : "FREE"}
          </div>
          <span
            className="nav-name"
            style={{
              fontSize: 13,
              fontWeight: 600,
              maxWidth: 90,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name}
          </span>
          {user.plan !== "pro" && (
            <button
              onClick={onUpgrade}
              style={{
                background: "linear-gradient(135deg,#ffb830,#ff8c00)",
                border: "none",
                color: "#05080e",
                padding: "7px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <span>⚡</span>
              <span className="nav-upgrade-text">Upgrade</span>
            </button>
          )}
          <button
            className="desk-only"
            onClick={onDashboard}
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Dashboard
          </button>
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              padding: "6px 10px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 12,
            }}
          >
            Out
          </button>
        </>
      ) : (
        <>
          <button
            className="desk-only"
            onClick={() => onAuth("login")}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Log In
          </button>
          <Btn onClick={() => onAuth(user ? "login" : "register")} small>
            {user ? "Log In" : "Sign Up Free →"}
          </Btn>
        </>
      )}
    </div>
  </nav>
);

/* ─── ROOT APP ─── */
export default function App() {
  const [page, setPage] = useState("landing"); // landing | dashboard
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null); // null | "login" | "register"
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  const handleAuth = (userData) => {
    setUser(userData);
    showToast(`Welcome, ${userData.name}! 🎉`);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("landing");
    setMobileSidebarOpen(false);
    showToast("Logged out successfully.");
  };

  const handleLaunch = () => {
    if (user) setPage("dashboard");
    else setAuthModal("register");
  };

  const handlePricing = () => {
    setPage("landing");
    setTimeout(
      () =>
        document
          .getElementById("pricing-section")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  // Called after Razorpay payment is verified on the backend
  const handlePaymentSuccess = ({ plan, planLabel, planId }) => {
    setUser((u) => ({ ...u, plan: "pro", planLabel, planId }));
    setUpgradeModal(false);
    showToast(`🎉 Pro Plan activated! Welcome to StudyMind Pro!`);
  };

  return (
    <>
      <GlobalStyle />
      <Topnav
        user={user}
        onLogo={() => {
          setPage("landing");
          setMobileSidebarOpen(false);
        }}
        onPricing={handlePricing}
        onAuth={(mode) => setAuthModal(mode)}
        onLogout={handleLogout}
        onDashboard={() => setPage("dashboard")}
        onUpgrade={() => setUpgradeModal(true)}
        onMenuToggle={() => setMobileSidebarOpen((s) => !s)}
      />
      <div
        style={{ paddingTop: 65, minHeight: "100vh", background: "var(--bg)" }}
      >
        {page === "landing" ? (
          <Landing
            onLaunch={handleLaunch}
            onPricing={handlePricing}
            onAuth={setAuthModal}
          />
        ) : (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onUpgrade={() => setUpgradeModal(true)}
            mobileSidebarOpen={mobileSidebarOpen}
            onMobileSidebarChange={setMobileSidebarOpen}
          />
        )}
      </div>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onAuth={handleAuth}
        />
      )}
      {upgradeModal && (
        <UpgradeModal
          onClose={() => setUpgradeModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          user={user}
        />
      )}
      <Toast msg={toast.msg} show={toast.show} />
    </>
  );
}
