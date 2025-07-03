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
      await sendMessage(pet.owner_id, adoptMsg.trim());
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
          alignItems: "center"
        }}
      >
        <img
          src={mainPhoto}
          alt={pet.name}
          style={{
            width: 170,
            height: 170,
            borderRadius: 20,
            objectFit: "cover",
            marginBottom: 22,
            border: "3px solid var(--border-color, #e7e7e7)",
            boxShadow: "0 3px 8px rgba(50,50,55,0.13)"
          }}
        />
        <h1
          className="title"
          style={{
            fontWeight: 800,
            fontSize: "2.0rem",
            marginBottom: 6,
            letterSpacing: "0.01em",
            color: "var(--primary, var(--text-primary))"
          }}
        >
          {pet.name}
        </h1>
        <div
          style={{
            fontWeight: 600,
            color: "#888",
            marginBottom: 5,
            fontSize: "1.13rem"
          }}
        >
          {pet.species}
          {pet.breed ? <> · {pet.breed}</> : null}
          {pet.age !== undefined && pet.age !== null ? (
            <> · {pet.age} yr{pet.age === 1 ? "" : "s"}</>
          ) : null}
        </div>
        <div style={{
          marginBottom: 10,
          color: "var(--text-primary)",
          fontSize: "1.08rem"
        }}>
          <span
            style={{
              background: "#ffb900",
              color: "#222",
              borderRadius: 7,
              fontWeight: 600,
              padding: "3px 12px",
              fontSize: "0.97rem",
              marginRight: 7
            }}>
            {locationStr ? `📍 ${locationStr}` : "Location: Not specified"}
          </span>
          {pet.available ? (
            <span
              style={{
                color: "#23a094",
                fontWeight: 600,
                background: "rgba(35,160,148,0.10)",
                borderRadius: 7,
                fontSize: "0.97rem",
                padding: "1px 8px",
                marginLeft: 6
              }}
            >
              Available
            </span>
          ) : (
            <span
              style={{
                color: "#888",
                fontWeight: 600,
                background: "#f3f3f3",
                borderRadius: 7,
                fontSize: "0.94rem",
                padding: "1px 8px",
                marginLeft: 6
              }}
            >
              Adopted
            </span>
          )}
        </div>
        {/* Show description */}
        <div style={{
          maxWidth: 500,
          color: "var(--text-primary)",
          fontSize: "1.11rem",
          margin: "8px 0 22px 0",
          textAlign: "center"
        }}>
          {pet.description || (
            <span style={{ color: "#aaa" }}>No description provided.</span>
          )}
        </div>
        {/* Additional Photos */}
        {photos.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 18,
              flexWrap: "wrap"
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
                  border: "1.5px solid var(--border-color, #e7e7e7)"
                }}
              />
            ))}
          </div>
        )}
        {/* Main actions */}
        <div style={{ marginTop: 16 }}>
          <button
            className="btn"
            style={{
              background: "#23a094",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "0.68rem 2.1rem",
              fontSize: "1.12rem",
              marginRight: 11,
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
              marginLeft: 6
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
              marginTop: 14,
              fontSize: "1.04rem"
            }}
          >
            You posted this listing.
          </div>
        )}
        {/* If not logged in and tries to click adopt */}
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
