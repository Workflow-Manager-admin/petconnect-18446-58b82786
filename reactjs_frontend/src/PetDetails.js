import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPet, API_BASE_URL, sendMessage } from "./api";
import { useAuth } from "./AuthContext";

/**
 * PUBLIC_INTERFACE
 * PetDetails - Dedicated page for viewing a single pet's details.
 * Features:
 *  - Loads pet info from backend by pet_id.
 *  - Displays full photo(s), name, species, breed, age, location, description, available status.
 *  - "Adopt Now" button for sending an inquiry to the pet lister (owner).
 *  - Responsive/accessible, styled to match app look.
 * 
 * Usage: <Route path="/pets/:petId" element={<PetDetails />} />
 */
export default function PetDetails() {
  const { petId } = useParams();
  const { user, authLoading } = useAuth();
  const [pet, setPet] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdopt, setShowAdopt] = useState(false);
  const [adoptMsg, setAdoptMsg] = useState("");
  const [adoptState, setAdoptState] = useState({ loading: false, success: "", error: "" });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getPet(petId)
      .then(setPet)
      .catch(err => {
        setFetchError(
          err?.message ||
          (err?.error?.detail && err.error.detail[0]?.msg) ||
          "Could not fetch pet details"
        );
      })
      .finally(() => setLoading(false));
  }, [petId]);

  if (loading || authLoading) {
    return (
      <main className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <span role="status" aria-live="polite" style={{ color: "#23a094", fontSize: "1.35rem" }}>
          <b>Loading pet details...</b>
        </span>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <div style={{ color: "#e94f64", fontWeight: 600, fontSize: "1.25rem" }}>
          {fetchError}
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
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <div style={{ color: "#e94f64", fontWeight: 600 }}>No such pet listing found.</div>
      </main>
    );
  }

  // Prepare photo URLs (handle backend paths)
  let photos = [];
  if (Array.isArray(pet.photos) && pet.photos.length > 0) {
    photos = pet.photos
      .filter(ph => typeof ph === "string" && ph.trim() !== "")
      .map(photoPath => {
        const trimmed = photoPath.trim();
        let rel = trimmed.startsWith("/") ? trimmed : "/" + trimmed;
        return `${API_BASE_URL.replace(/\/+$/, "")}${rel}`;
      });
  }
  if (!photos.length) {
    photos = [
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80"
    ];
  }
  const mainPhoto = photos[0];

  // Handle location - display string if available
  let locationStr = null;
  if (pet.location_lat !== null && pet.location_lng !== null &&
      pet.location_lat !== undefined && pet.location_lng !== undefined) {
    locationStr = `(${Number(pet.location_lat).toFixed(2)}, ${Number(pet.location_lng).toFixed(2)})`;
  }

  // Adopt modal logic
  function handleOpenAdopt() {
    setAdoptMsg(`Hi, I'm interested in adopting ${pet.name}. Is ${pet.name} still available?`);
    setShowAdopt(true);
  }
  async function handleSendAdopt() {
    if (!adoptMsg.trim()) return;
    setAdoptState({ loading: true, success: "", error: "" });
    try {
      // Defensive: always integer for user ID
      await sendMessage(Number(pet.owner_id), adoptMsg.trim());
      setAdoptState({ loading: false, success: "Your inquiry was sent!", error: "" });
      setTimeout(() => {
        setShowAdopt(false);
        setAdoptState({ loading: false, success: "", error: "" });
        navigate("/inbox");
      }, 1300);
    } catch (err) {
      setAdoptState({
        loading: false,
        success: "",
        error:
          err?.message ||
          (err?.error?.detail && err.error.detail[0]?.msg) ||
          "Failed to send inquiry."
      });
    }
  }

  // Only show "Adopt Now" if NOT owner and user is authenticated
  const canAdopt =
    user &&
    pet.owner_id !== user.id &&
    pet.available &&
    typeof pet.owner_id === "number";

  return (
    <main
      className="container"
      style={{
        maxWidth: 700,
        margin: "2.5rem auto",
        background: "var(--bg-secondary)",
        padding: "2.6rem 2.1rem 2.2rem 2.1rem",
        borderRadius: 16,
        boxShadow: "0 2px 14px rgba(35,160,148,0.10)"
      }}
    >
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%"
        }}
      >
        {/* Main Photo */}
        <img
          src={mainPhoto}
          alt={pet.name}
          style={{
            width: 170,
            height: 170,
            borderRadius: 20,
            objectFit: "cover",
            marginBottom: 18,
            border: "3px solid var(--border-color, #e7e7e7)",
            boxShadow: "0 3px 8px rgba(50,50,55,0.13)"
          }}
        />
        {/* Name */}
        <h1
          className="title"
          style={{
            fontWeight: 800,
            fontSize: "2rem",
            marginBottom: 2,
            letterSpacing: "0.01em",
            color: "var(--primary, var(--text-primary))"
          }}
        >
          {pet.name}
        </h1>
        {/* Meta details row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 2,
            marginBottom: 6,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <span style={{ fontWeight: 600, color: "#888", fontSize: "1.12rem" }}>
            {pet.species}
            {pet.breed ? <span> &middot; {pet.breed}</span> : null}
            {pet.age !== undefined && pet.age !== null ? (
              <span> &middot; {pet.age} yr{pet.age === 1 ? "" : "s"}</span>
            ) : null}
          </span>
          <span
            style={{
              background: "#ffb900",
              color: "#222",
              borderRadius: 7,
              fontWeight: 600,
              padding: "3px 12px",
              fontSize: "0.97rem"
            }}>
            {locationStr ? `📍 ${locationStr}` : "Location: Not specified"}
          </span>
          <span
            style={{
              color: pet.available ? "#23a094" : "#888",
              fontWeight: 600,
              background: pet.available ? "rgba(35,160,148,0.10)" : "#f3f3f3",
              borderRadius: 7,
              fontSize: "0.97rem",
              padding: "1px 8px"
            }}
          >
            {pet.available ? "Available" : "Adopted"}
          </span>
        </div>
        {/* List of fields in visually grouped format */}
        <div
          style={{
            background: "rgba(250,250,250,0.85)",
            border: "1px solid var(--border-color)",
            borderRadius: 14,
            maxWidth: 470,
            minWidth: 260,
            padding: "1.1rem 1.2rem 0.5rem 1.2rem",
            margin: "10px 0 18px 0",
            boxShadow: "0 2px 8px rgba(30,80,120,0.07)"
          }}>
          <dl style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-primary)" }}>
            <dt style={{ fontWeight: 600, float: "left", minWidth: 70, color: "#888" }}>Name:</dt>
            <dd style={{ marginLeft: 90, marginBottom: 5 }}>{pet.name}</dd>
            <dt style={{ fontWeight: 600, float: "left", minWidth: 70, color: "#888" }}>Species:</dt>
            <dd style={{ marginLeft: 90, marginBottom: 5 }}>{pet.species}</dd>
            <dt style={{ fontWeight: 600, float: "left", minWidth: 70, color: "#888" }}>Breed:</dt>
            <dd style={{ marginLeft: 90, marginBottom: 5 }}>{pet.breed || <span style={{ color: "#aaa" }}>Unknown</span>}</dd>
            <dt style={{ fontWeight: 600, float: "left", minWidth: 70, color: "#888" }}>Age:</dt>
            <dd style={{ marginLeft: 90, marginBottom: 5 }}>{pet.age !== undefined && pet.age !== null ? `${pet.age} yr${pet.age === 1 ? "" : "s"}` : <span style={{ color: "#aaa" }}>Unknown</span>}</dd>
            <dt style={{ fontWeight: 600, float: "left", minWidth: 70, color: "#888" }}>Location:</dt>
            <dd style={{ marginLeft: 90, marginBottom: 5 }}>{locationStr || <span style={{ color: "#aaa" }}>Not specified</span>}</dd>
            <dt style={{ fontWeight: 600, float: "left", minWidth: 70, color: "#888" }}>Available:</dt>
            <dd style={{ marginLeft: 90, marginBottom: 5 }}>{pet.available ? "Yes" : "No"}</dd>
            <dt style={{ fontWeight: 600, float: "left", minWidth: 70, color: "#888" }}>Bio:</dt>
            <dd style={{ marginLeft: 90, marginBottom: 5 }}>
              {pet.description || <span style={{ color: "#aaa" }}>No bio/description.</span>}
            </dd>
          </dl>
          <div style={{ clear: "both" }} />
        </div>
        {/* Additional Photos Grid */}
        {photos.length > 1 &&
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 18,
              flexWrap: "wrap",
              justifyContent: "center"
            }}
          >
            {photos.slice(1).map((ph, i) => (
              <img
                src={ph}
                alt={pet.name + " photo " + (i + 2)}
                key={ph}
                style={{
                  width: 62,
                  height: 62,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1.5px solid var(--border-color, #e7e7e7)",
                  margin: 2
                }}
              />
            ))}
          </div>
        }
        {/* Main actions row */}
        <div style={{
          marginTop: 10,
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            className="btn"
            style={{
              background: "#23a094",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "0.68rem 2.1rem",
              fontSize: "1.12rem",
              marginRight: 4,
              border: "none",
              boxShadow: "0 1px 7px rgba(35,160,148,0.06)",
              opacity: canAdopt ? 1 : 0.55,
              cursor: canAdopt ? "pointer" : "not-allowed"
            }}
            onClick={canAdopt ? handleOpenAdopt : undefined}
            disabled={!canAdopt}
            aria-label={`Adopt Now: ${pet.name}`}
          >
            Adopt Now
          </button>
          <button
            className="btn"
            style={{
              background: "var(--button-bg)",
              color: "var(--button-text)",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              padding: "0.68rem 2.1rem",
              fontSize: "1.08rem",
              marginLeft: 4
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
        {user && pet.owner_id === user.id && (
          <div
            style={{
              color: "#ffb900",
              background: "#f7ebc3",
              padding: "7px 13px",
              borderRadius: 8,
              fontWeight: 600,
              marginTop: 16,
              fontSize: "1.04rem"
            }}
          >
            You posted this listing.
          </div>
        )}
        {!user && (
          <div style={{ marginTop: 20, color: "#e94f64", fontWeight: 500 }}>
            Login to contact the pet lister.
          </div>
        )}
      </section>
      {/* Modal for Adopt Now */}
      {showAdopt && (
        <div
          style={{
            position: "fixed",
            zIndex: 1000,
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(30,30,50,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: "var(--bg-primary, #fff)",
              borderRadius: 12,
              padding: "2.2rem 2.2rem 1.4rem 2.2rem",
              boxShadow: "0 4px 28px 0 rgba(60,80,120,0.16)",
              minWidth: 320,
              maxWidth: 370,
              width: "95vw"
            }}
          >
            <h3 style={{ fontWeight: 700, margin: "0 0 1rem 0", fontSize: "1.28rem" }}>
              Send Adoption Inquiry
            </h3>
            <form
              autoComplete="off"
              style={{ display: "flex", flexDirection: "column" }}
              onSubmit={e => {
                e.preventDefault();
                handleSendAdopt();
              }}
            >
              <label
                style={{
                  textAlign: "left",
                  marginBottom: 6,
                  fontWeight: 500
                }}
              >
                Message <span style={{ color: "#e94f64" }}>*</span>
              </label>
              <textarea
                required
                value={adoptMsg}
                onChange={e => setAdoptMsg(e.target.value)}
                rows={3}
                style={{
                  padding: "0.6rem",
                  fontSize: "1rem",
                  borderRadius: 7,
                  border: "1px solid #ccc",
                  resize: "vertical",
                  marginBottom: 13
                }}
                autoFocus
                disabled={adoptState.loading}
              />
              {adoptState.error && (
                <div style={{ color: "#e94f64", fontWeight: 500, marginBottom: 11 }}>
                  {adoptState.error}
                </div>
              )}
              {adoptState.success && (
                <div style={{ color: "#23a094", fontWeight: 600, marginBottom: 11 }}>
                  {adoptState.success}
                </div>
              )}
              <button
                type="submit"
                className="btn"
                style={{
                  background: "var(--button-bg)",
                  color: "var(--button-text)",
                  padding: "0.67rem",
                  border: "none",
                  fontWeight: 600,
                  borderRadius: 7,
                  fontSize: "1.08rem",
                  marginBottom: 10,
                  opacity: adoptState.loading ? 0.7 : 1,
                  cursor: adoptState.loading ? "wait" : "pointer"
                }}
                disabled={adoptState.loading}
              >
                {adoptState.loading ? "Sending..." : "Send Inquiry"}
              </button>
              <button
                type="button"
                style={{
                  padding: "0.45rem",
                  color: "#e94f64",
                  background: "transparent",
                  border: "none",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "1.01rem"
                }}
                onClick={() => setShowAdopt(false)}
                disabled={adoptState.loading}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
