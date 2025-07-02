import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import PetListings from "./PetListings";
import PetCreateForm from "./PetCreateForm";
import PetList from "./PetList";
import Inbox from "./Inbox";
import { AuthProvider, useAuth } from "./AuthContext";

// Main navigation bar component using auth context
function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border-color)",
      padding: "0.7rem 2rem"
    }}>
      <span
        className="navbar-brand"
        style={{
          fontWeight: 700,
          fontSize: "1.35rem",
          color: "var(--text-primary)",
          letterSpacing: "0.02em"
        }}
      >
        <span role="img" aria-label="Pet paw" style={{ marginRight: 8 }}>🐾</span>
        PetConnect
      </span>
      <div>
        <Link
          className="App-link"
          to="/"
          style={{ marginRight: 16, fontWeight: 600, textDecoration: "none", color: "var(--text-primary)" }}
        >
          Home
        </Link>
        <Link
          className="App-link"
          to="/pets"
          style={{ marginRight: 16, fontWeight: 600, textDecoration: "none", color: "var(--text-primary)" }}
        >
          Find Pets
        </Link>
        <Link
          className="App-link"
          to="/inbox"
          style={{ marginRight: 16, fontWeight: 600, textDecoration: "none", color: "var(--button-bg)" }}
        >
          Inbox
        </Link>
        <Link
          className="App-link"
          to="/pets/new"
          style={{ marginRight: 16, fontWeight: 600, textDecoration: "none", color: "var(--button-bg)" }}
        >
          Register Pet
        </Link>
        {user ? (
          <>
            <span style={{ color: "var(--button-bg)", fontWeight: 600, marginRight: 12 }}>
              {user.full_name ? user.full_name : user.email}
            </span>
            <button
              className="btn"
              onClick={() => { logout(); navigate("/"); }}
              style={{
                background: "var(--button-bg)",
                color: "var(--button-text)",
                padding: "0.55rem 1.5rem",
                border: "none",
                borderRadius: 7,
                fontWeight: 600,
                marginLeft: 2,
                fontSize: "1.01rem"
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              className="App-link"
              to="/login"
              style={{
                fontWeight: 600,
                textDecoration: "none",
                color: "var(--text-primary)",
                marginRight: 10
              }}
            >
              Login
            </Link>
            <Link
              className="App-link"
              to="/register"
              style={{
                fontWeight: 600,
                textDecoration: "none",
                color: "var(--button-bg)"
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
      <ThemeButton />
    </nav>
  );
}

// Theme toggle
function ThemeButton() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{ marginLeft: 24 }}
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

// Home landing content
function HomePage() {
  const { user } = useAuth();
  return (
    <main className="container" style={{
      margin: "0 auto",
      maxWidth: 800,
      padding: "3rem 1.2rem 1.6rem 1.2rem"
    }}>
      <section style={{ margin: "0 auto", textAlign: "center" }}>
        <h1 className="title" style={{
          fontFamily: "'Segoe UI', 'Roboto', sans-serif",
          fontSize: "2.6rem",
          fontWeight: 700,
          marginBottom: "1.1rem",
          color: "var(--primary-color, var(--text-primary, #282c34))"
        }}>
          Welcome to PetConnect!
        </h1>
        <p className="subtitle" style={{
          fontSize: "1.3rem",
          marginBottom: 18,
          color: "var(--text-secondary, #61dafb)"
        }}>
          A modern platform to adopt, rescue, and connect pets with loving families.
        </p>
        <p className="description" style={{
          maxWidth: 540,
          margin: "0 auto 2.2rem auto",
          fontSize: "1.08rem",
          color: "var(--text-primary)"
        }}>
          Browse adoptable animals, list a pet in need, and connect with the community. Sign up to get started, or explore our listings as a guest.
        </p>
        <hr style={{
          width: "40%",
          margin: "2rem auto",
          border: "1px solid var(--border-color)"
        }}/>
        <div>
          <Link className="btn"
            to="/pets"
            style={{
              background: "var(--button-bg)",
              color: "var(--button-text)",
              padding: "0.7rem 2.2rem",
              borderRadius: 8,
              fontWeight: 600,
              marginRight: 18,
              boxShadow: "0 2px 8px rgba(35,160,148,0.08)",
              fontSize: "1.07rem",
              display: "inline-block",
              textDecoration: "none"
            }}>
            View Pets
          </Link>
          <Link className="btn"
            to="/pets/new"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--button-bg)",
              padding: "0.7rem 2.2rem",
              borderRadius: 8,
              fontWeight: 600,
              border: "1px solid var(--button-bg)",
              fontSize: "1.07rem",
              display: "inline-block",
              textDecoration: "none"
            }}>
            Register Pet
          </Link>
        </div>
        <p style={{ fontSize: "0.97rem", marginTop: "2.1rem", color: "var(--text-secondary, #61dafb)" }}>
          {user ? (
            <>
              Logged in as{" "}
              <span style={{ color: "var(--button-bg)", fontWeight: "600" }}>
                {user.full_name || user.email}
              </span>
            </>
          ) : (
            <>
              Ready to join?{" "}
              <Link to="/register" style={{ color: "var(--button-bg)", fontWeight: "600" }}>
                Create an account
              </Link>{" "}
              or{" "}
              <Link to="/login" style={{ color: "var(--button-bg)", fontWeight: "600" }}>
                Log in
              </Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppNav />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            {/* Use PetList (static sample data) instead of dynamic PetListings for test/demo */}
            <Route path="/pets" element={<PetList />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/pets/new" element={<PetCreateForm />} />
            {/* TODO: Add more routes/screens here */}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
