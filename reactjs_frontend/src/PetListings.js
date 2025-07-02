import React, { useState, useEffect } from "react";
import { listPets } from "./api";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * PetListings - A responsive dashboard that fetches and displays all pet listings from the backend.
 * Only logged-in users have full access; guests see public/published pets.
 * Handles loading, error, and empty states. Responsive grid layout. Pet photos are displayed when available.
 */
export default function PetListings() {
  const { user, authLoading } = useAuth();

  // UI state
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all pet listings (public view for guest; all for logged-in if backend allows)
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    listPets({})
      .then((data) => {
        if (!active) return;
        setPets(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err?.message ||
            (err?.error?.detail && err.error.detail[0]?.msg) ||
            "Failed to fetch pets"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Render loading state
  if (loading || authLoading) {
    return (
      <section className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <span role="status" aria-live="polite" style={{ color: "#23a094", fontSize: "1.35rem" }}>
          <b>Loading pet listings...</b>
        </span>
      </section>
    );
  }

  // Error display
  if (error) {
    return (
      <section className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <div style={{ color: "#e94f64", fontWeight: 600, fontSize: "1.25rem" }}>
          {error}
        </div>
        <button
          className="btn"
          onClick={() => window.location.reload()}
          style={{
            background: "var(--button-bg)",
            color: "var(--button-text)",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "1rem",
            marginTop: 20,
            padding: "0.5rem 1.1rem"
          }}
        >
          Retry
        </button>
      </section>
    );
  }

  // Empty state
  if (!pets || pets.length === 0) {
    return (
      <main className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <h3>No pets listed yet.</h3>
        <p>Be the first to <Link to="/register">register</Link> and add a pet in need!</p>
      </main>
    );
  }

  // Responsive card grid for pet listings
  return (
    <main className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.2rem 1.6rem 1.2rem" }}>
      <h2 className="title" style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: 28 }}>
        Adoptable Pets
      </h2>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "2rem",
          padding: 0
        }}
      >
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} isLoggedIn={!!user} />
        ))}
      </section>
    </main>
  );
}

/**
 * PetCard - Single pet listing (with image, details, and CTA)
 */
function PetCard({ pet, isLoggedIn }) {
  // Photo fallback
  let mainPhoto = pet.photos && pet.photos.length > 0
    ? pet.photos[0]
    : "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?fit=crop&w=400&q=80"; // stock pet img
  const petName = pet.name || "Unnamed Pet";
  const locationStr =
    (pet.location_lat && pet.location_lng)
      ? `📍 (${pet.location_lat.toFixed(2)}, ${pet.location_lng.toFixed(2)})`
      : undefined;
  const availableTxt = pet.available ? (
    <span style={{
      color: "#23a094",
      fontWeight: 600,
      background: "rgba(35,160,148,0.10)",
      borderRadius: 7,
      fontSize: "0.97rem",
      marginLeft: 6,
      padding: "1px 8px"
    }}>Available</span>
  ) : (
    <span style={{
      color: "#888",
      fontWeight: 600,
      background: "#f3f3f3",
      borderRadius: 7,
      fontSize: "0.94rem",
      marginLeft: 6,
      padding: "1px 8px"
    }}>Adopted</span>
  );

  return (
    <article
      style={{
        background: "var(--bg-secondary)",
        boxShadow: "0 1px 5px 0 rgba(30,50,50,0.10)",
        borderRadius: "18px",
        border: "1px solid var(--border-color)",
        padding: "1.1rem 1.15rem 1rem 1.15rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "box-shadow 0.18s",
        minHeight: 340
      }}
      tabIndex={0}
      aria-label={`Pet listing: ${petName}`}
    >
      <img
        src={mainPhoto}
        alt={petName}
        style={{
          width: 128,
          height: 128,
          borderRadius: "16px",
          objectFit: "cover",
          marginBottom: 16,
          border: "2px solid var(--border-color, #e7e7e7)",
          boxShadow: "0 3px 8px rgba(50,50,55,0.07)"
        }}
      />
      <h3 style={{ fontWeight: 700, margin: 0, fontSize: "1.28rem" }}>
        {petName} {availableTxt}
      </h3>
      <p style={{ color: "#888", fontWeight: 500, margin: "0.28rem 0 0.55rem 0" }}>
        {pet.species}
        {pet.breed ? ` • ${pet.breed}` : ""}
        {pet.age ? ` • ${pet.age} yr${pet.age !== 1 ? "s" : ""}` : ""}
        {locationStr ? <span> • {locationStr}</span> : null}
      </p>
      <p
        style={{
          fontSize: "1rem",
          textAlign: "center",
          color: "var(--text-primary)",
          marginBottom: 12,
          marginTop: 0,
          minHeight: 54
        }}
      >
        {pet.description || <span style={{ color: "#aaa" }}>No description.</span>}
      </p>
      {isLoggedIn ? (
        <Link
          to={`/pets/${pet.id}`}
          className="btn"
          style={{
            background: "#23a094",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "7px",
            padding: "0.5rem 1.3rem",
            textDecoration: "none",
            fontSize: "1.06rem"
          }}
        >
          View Details
        </Link>
      ) : (
        <span style={{ color: "#e94f64", fontWeight: 500, marginTop: 10, fontSize: "0.97rem" }}>
          <Link to="/login" style={{ color: "#e94f64", fontWeight: 600 }} tabIndex={0}>Login</Link>
          {" "}to contact or save pets.
        </span>
      )}
    </article>
  );
}
