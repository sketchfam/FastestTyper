import { useState } from "react";

export default function AuthModal({ mode, onSuccess, onClose, onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (isSignup && !form.name) { setError("Please enter your name."); return; }

    setLoading(true);
    // ── TODO: replace with real API call to your ASP.NET backend ──
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);

    // Simulate success
    onSuccess({
      name: isSignup ? form.name : "Returning Typer",
      email: form.email,
      entries: [],
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>{isSignup ? "Join the race" : "Welcome back"}</h2>
        <p className="modal-sub">
          {isSignup
            ? "Create an account to enter the competition."
            : "Log in to manage your entries."}
        </p>

        {isSignup && (
          <div className="form-group">
            <label>Your name</label>
            <input
              type="text"
              placeholder="e.g. Jordan Smith"
              value={form.name}
              onChange={update("name")}
            />
          </div>
        )}

        <div className="form-group">
          <label>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update("email")}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={update("password")}
          />
        </div>

        {error && <p style={{ color: "#FF4D6D", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</p>}

        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </button>

        <p className="form-switch">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => onSwitch(isSignup ? "login" : "signup")}>
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
