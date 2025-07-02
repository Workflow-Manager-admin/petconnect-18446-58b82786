import React, { useState } from "react";
import { register } from "./api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

// PUBLIC_INTERFACE
export default function RegisterScreen() {
  const { login: setUser } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "adopter"
  });
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
      const user = await register(form);
      setUser(user);
      navigate("/"); // home
    } catch (err) {
      setError(
        err?.message ||
          (err?.error?.detail && err.error.detail[0]?.msg) ||
          "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "2.5rem auto" }}>
      <h2 style={{ marginBottom: 18 }}>Sign Up for PetConnect</h2>
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
        <label style={{ textAlign: "left", marginBottom: 4, fontWeight: 500 }}>Password (min 6 chars)</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
          style={{
            padding: "0.6rem",
            marginBottom: 12,
            fontSize: "1rem",
            borderRadius: 7,
            border: "1px solid #ccc",
          }}
        />
        <label style={{ textAlign: "left", marginBottom: 4, fontWeight: 500 }}>Full Name (optional)</label>
        <input
          name="full_name"
          type="text"
          value={form.full_name}
          onChange={handleChange}
          style={{
            padding: "0.6rem",
            marginBottom: 12,
            fontSize: "1rem",
            borderRadius: 7,
            border: "1px solid #ccc",
          }}
        />
        <label style={{ textAlign: "left", marginBottom: 4, fontWeight: 500 }}>Account Type</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          style={{
            padding: "0.6rem",
            marginBottom: 18,
            fontSize: "1rem",
            borderRadius: 7,
            border: "1px solid #ccc"
          }}
        >
          <option value="adopter">Adopter</option>
          <option value="rescuer">Rescuer</option>
        </select>
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
          {submitting ? "Registering..." : "Register"}
        </button>
        <div style={{ marginTop: "1.2rem", fontSize: "0.98rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--button-bg)", fontWeight: 600 }}>Log in</Link>
        </div>
      </form>
    </div>
  );
}
