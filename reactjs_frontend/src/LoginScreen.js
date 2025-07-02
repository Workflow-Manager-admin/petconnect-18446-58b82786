import React, { useState } from "react";
import { login } from "./api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

// PUBLIC_INTERFACE
export default function LoginScreen() {
  const { login: setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // PUBLIC_INTERFACE
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(form.email, form.password);
      setUser(user);
      navigate("/"); // home
    } catch (err) {
      setError(
        err?.message ||
          (err?.error?.detail && err.error.detail[0]?.msg) ||
          "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "2.5rem auto" }}>
      <h2 style={{ marginBottom: 18 }}>Log in to PetConnect</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ textAlign: "left", marginBottom: 4, fontWeight: 500 }}>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoFocus
          required
          style={{
            padding: "0.6rem",
            marginBottom: 12,
            fontSize: "1rem",
            borderRadius: 7,
            border: "1px solid #ccc",
          }}
        />
        <label style={{ textAlign: "left", marginBottom: 4, fontWeight: 500 }}>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          style={{
            padding: "0.6rem",
            marginBottom: 18,
            fontSize: "1rem",
            borderRadius: 7,
            border: "1px solid #ccc",
          }}
        />
        {error && (
          <div style={{ color: "#e94f64", fontWeight: 500, marginBottom: 14 }}>
            {error}
          </div>
        )}
        <button
          className="btn"
          type="submit"
          style={{
            background: "var(--button-bg)",
            color: "var(--button-text)",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            padding: "0.7rem",
            marginBottom: 6,
            fontSize: "1.08rem",
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>
        <div style={{ marginTop: "1.2rem", fontSize: "0.98rem" }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: "var(--button-bg)", fontWeight: 600 }}>Sign up</Link>
        </div>
      </form>
    </div>
  );
}
