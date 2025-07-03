import React, { useState, useEffect } from "react";
import { listPets, updatePet, deletePet, API_BASE_URL } from "./api";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";

// Filtering Controls - for breed, age, and location search.
// (Placed above main PetListings component for clarity.)
function PetFilters({ filters, setFilters, loading }) {
  // Debounce typing for search inputs
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local/parent state if props change externally (uncommon here)
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Only handle UI change locally, propagate up after a brief debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters(localFilters);
    }, 320);
    return () => clearTimeout(delay);
    // eslint-disable-next-line
  }, [localFilters]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setLocalFilters(f => ({
      ...f,
      [name]: value
    }));
  }
  function handleLocationChange(type, value) {
    setLocalFilters(f => ({
      ...f,
      [type]: value
    }));
  }

  return (
    <section style={{
      margin: "0 auto 2rem auto",
      maxWidth: 880,
      background: "var(--bg-secondary)",
      padding: "1.24rem 1.5rem 1.16rem 1.5rem",
      borderRadius: 11,
      boxShadow: "0 2px 8px rgba(35,160,148,0.07)"
    }}>
      <form style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "end",
        gap: "1.5rem 1.15rem",
        justifyContent: "center"
      }}
        autoComplete="off"
        onSubmit={e => e.preventDefault()}
      >
        <div style={{ minWidth: 170, flex: 1 }}>
          <label htmlFor="filter-breed" style={filterLabelStyle}>Breed</label>
          <input
            id="filter-breed"
            name="breed"
            value={localFilters.breed || ""}
            onChange={handleInputChange}
            placeholder="e.g. Labrador"
            style={filterInputStyle}
            disabled={loading}
          />
        </div>
        <div style={{ minWidth: 120, flex: 1 }}>
          <label htmlFor="filter-age" style={filterLabelStyle}>Age (years)</label>
          <input
            id="filter-age"
            type="number"
            min="0"
            name="age"
            value={localFilters.age || ""}
            onChange={handleInputChange}
            placeholder="Any"
            style={filterInputStyle}
            disabled={loading}
          />
        </div>
        <div style={{ minWidth: 200, flex: 2 }}>
          <label style={filterLabelStyle}>Location (lat/lng, optional)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              step="0.01"
              min="-90"
              max="90"
              name="location_lat"
              value={localFilters.location_lat || ""}
              onChange={e => handleLocationChange("location_lat", e.target.value)}
              placeholder="Latitude"
              style={{ ...filterInputStyle, width: 88 }}
              disabled={loading}
            />
            <input
              type="number"
              step="0.01"
              min="-180"
              max="180"
              name="location_lng"
              value={localFilters.location_lng || ""}
              onChange={e => handleLocationChange("location_lng", e.target.value)}
              placeholder="Longitude"
              style={{ ...filterInputStyle, width: 88 }}
              disabled={loading}
            />
          </div>
        </div>
        <div style={{ alignSelf: "center", marginTop: 8 }}>
          <span role="status" aria-live="polite" style={{
            color: "#23a094",
            fontSize: "0.99rem",
            marginLeft: 7,
            fontWeight: 600
          }}>
            {loading ? "Searching..." : ""}
          </span>
        </div>
      </form>
    </section>
  );
}

// Small styles for filter UI
const filterLabelStyle = {
  textAlign: "left",
  marginBottom: 2,
  fontWeight: 500,
  fontSize: "0.99rem"
};
const filterInputStyle = {
  padding: "0.525rem",
  marginBottom: 0,
  fontSize: "1rem",
  borderRadius: 7,
  border: "1px solid #ccc",
  width: "100%"
};
/**
 * PUBLIC_INTERFACE
 * PetEditModal - modal dialog for editing a pet listing (owner or admin only).
 * Props: open (bool), onClose, pet (obj), onSave (fn)
 */
function PetEditModal({ open, onClose, pet, onSave }) {
  const [form, setForm] = useState({
    name: pet?.name || "",
    species: pet?.species || "",
    breed: pet?.breed || "",
    age: pet?.age || "",
    description: pet?.description || "",
    location_lat: pet?.location_lat || "",
    location_lng: pet?.location_lng || "",
    available: pet?.available === false ? false : true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Sync form with pet prop when modal is opened/changed
  React.useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name || "",
        species: pet.species || "",
        breed: pet.breed || "",
        age: pet.age === null ? "" : pet.age,
        description: pet.description || "",
        location_lat: pet.location_lat === null ? "" : pet.location_lat,
        location_lng: pet.location_lng === null ? "" : pet.location_lng,
        available: pet.available === false ? false : true,
      });
    }
  }, [pet, open]);

  if (!open || !pet) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  function validate() {
    if (!form.name.trim()) return "Name is required";
    if (!form.species.trim()) return "Species is required";
    if (form.age && (isNaN(Number(form.age)) || Number(form.age) < 0)) {
      return "Age must be a positive number";
    }
    if (form.location_lat && isNaN(Number(form.location_lat))) {
      return "Latitude must be a valid number";
    }
    if (form.location_lng && isNaN(Number(form.location_lng))) {
      return "Longitude must be a valid number";
    }
    return null;
  }
  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return;
    }
    setSubmitting(true);
    try {
      const updateObj = {
        name: form.name,
        species: form.species,
        breed: form.breed,
        age: form.age === "" ? null : Number(form.age),
        description: form.description,
        location_lat: form.location_lat === "" ? null : Number(form.location_lat),
        location_lng: form.location_lng === "" ? null : Number(form.location_lng),
        available: typeof form.available === "boolean" ? form.available : true,
      };
      await onSave(pet.id, updateObj);
      onClose();
    } catch (err) {
      setError(
        err?.message ||
          (err?.error?.detail && err.error.detail[0]?.msg) ||
          "Update failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} role="dialog" aria-modal="true">
        <h3 style={{ marginBottom: 10, fontWeight: 700 }}>
          Edit Pet Listing
        </h3>
        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>Name <span style={{ color: "#e94f64" }}>*</span></label>
          <input name="name" value={form.name} onChange={handleChange} required minLength={2} style={inputStyle} />

          <label style={labelStyle}>Species <span style={{ color: "#e94f64" }}>*</span></label>
          <input name="species" value={form.species} onChange={handleChange} required minLength={2} style={inputStyle} />

          <label style={labelStyle}>Breed</label>
          <input name="breed" value={form.breed} onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Age (years)</label>
          <input name="age" type="number" min="0" value={form.age} onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            style={{ ...inputStyle, resize: "vertical", minHeight: 44, fontFamily: "inherit" }}
          />

          <label style={labelStyle}>Location Latitude</label>
          <input name="location_lat" value={form.location_lat} onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Location Longitude</label>
          <input name="location_lng" value={form.location_lng} onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>
            <input
              type="checkbox"
              name="available"
              checked={!!form.available}
              onChange={handleChange}
              style={{ marginRight: 6 }}
            />
            Available for Adoption
          </label>

          {error && <div style={{ color: "#e94f64", fontWeight: 500, marginBottom: 10 }}>{error}</div>}

          <div style={{ display: "flex", marginTop: 10, gap: 8 }}>
            <button
              className="btn"
              type="submit"
              style={{
                background: "var(--button-bg)",
                color: "var(--button-text)",
                border: "none",
                borderRadius: 7,
                fontWeight: 600,
                padding: "0.53rem 1.4rem",
                marginRight: 4,
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.7 : 1
              }}
              disabled={submitting}
            >
              Save
            </button>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{
                background: "#e94f64",
                color: "white",
                border: "none",
                borderRadius: 7,
                fontWeight: 600,
                padding: "0.53rem 1.4rem",
                marginLeft: 4
              }}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: "fixed",
  zIndex: 9999,
  left: 0,
  top: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(30,50,60,0.28)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const modalContentStyle = {
  background: "var(--bg-primary, #fff)",
  borderRadius: 13,
  padding: "2.2rem 1.6rem 1.2rem 1.6rem",
  boxShadow: "0 4px 32px 0 rgba(30,50,80,0.12)",
  width: "95vw",
  maxWidth: 390,
  minWidth: 244
};
const labelStyle = {
  textAlign: "left", marginBottom: 4, fontWeight: 500, marginTop: 7
};
const inputStyle = {
  padding: "0.6rem",
  marginBottom: 11,
  fontSize: "1rem",
  borderRadius: 7,
  border: "1px solid #ccc"
};
/**
 * PUBLIC_INTERFACE
 * PetListings - A responsive dashboard that fetches and displays all pet listings from the backend.
 * Only logged-in users have full access; guests see public/published pets.
 * Handles loading, error, and empty states. Responsive grid layout. Pet photos are displayed when available.
 */
export default function PetListings() {
  const { user, authLoading } = useAuth();

  // ---- MOCK DEMO PETS ----
  // These demo/mock pets will be shown along with backend pets
  const MOCK_PETS = [
    {
      id: "mock1",
      name: "Bella",
      species: "Dog",
      breed: "Labrador Retriever",
      age: 3,
      description: "Sweet, playful, and loves fetch. Great with kids! (Demo)",
      location_lat: 37.7749, // San Francisco
      location_lng: -122.4194,
      available: true,
      photos: [
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80",
      ],
      owner_id: null,
      created_at: "2024-05-17T14:00:00Z",
    },
    {
      id: "mock2",
      name: "Milo",
      species: "Cat",
      breed: "Maine Coon",
      age: 5,
      description: "Gentle giant. Prefers quiet homes. Loves chin scratches. (Demo)",
      location_lat: 37.8044, // Oakland
      location_lng: -122.2712,
      available: true,
      photos: [
        "https://images.unsplash.com/photo-1518715308788-3005759c0614?auto=format&fit=crop&w=400&q=80",
      ],
      owner_id: null,
      created_at: "2024-05-12T12:10:00Z",
    },
    {
      id: "mock3",
      name: "Daisy",
      species: "Dog",
      breed: "Beagle",
      age: 2,
      description: "Curious and energetic. Adorable howl. (Demo)",
      location_lat: 37.3382,
      location_lng: -121.8863, // San Jose
      available: true,
      photos: [
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=400&q=80",
      ],
      owner_id: null,
      created_at: "2024-04-28T11:20:00Z",
    },
    {
      id: "mock4",
      name: "Shadow",
      species: "Cat",
      breed: "Bombay",
      age: 4,
      description: "Very affectionate and talkative. Litter-trained. (Demo)",
      location_lat: 37.4419,
      location_lng: -122.1430, // Palo Alto
      available: true,
      photos: [
        "https://images.unsplash.com/photo-1518715308788-3005759c0614?auto=format&fit=crop&w=400&q=80",
      ],
      owner_id: null,
      created_at: "2024-05-08T09:30:00Z",
    },
    {
      id: "mock5",
      name: "Cleo",
      species: "Dog",
      breed: "Mixed",
      age: 1,
      description: "Goofy puppy energy. Learning basic commands; very smart. (Demo)",
      location_lat: 37.3861,
      location_lng: -122.0839, // Mountain View
      available: false,
      photos: [
        "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=400&q=80",
      ],
      owner_id: null,
      created_at: "2024-04-20T08:15:00Z",
    },
  ];

  // UI state
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state (breed, age, lat, lng)
  const [filters, setFilters] = useState({
    breed: "",
    age: "",
    location_lat: "",
    location_lng: ""
  });

  // For edit/delete modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [deletingPetId, setDeletingPetId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Real-time fetch for pet listings w/filters
  // Each filter value triggers backend call
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    // Compose clean filters object for backend call
    const apiFilters = {};
    if (filters.breed && filters.breed.trim()) apiFilters.breed = filters.breed.trim();
    if (filters.age !== undefined && filters.age !== null && filters.age !== "") apiFilters.age = filters.age;
    if (
      filters.location_lat !== undefined &&
      filters.location_lat !== null &&
      filters.location_lat !== ""
    )
      apiFilters.location_lat = filters.location_lat;
    if (
      filters.location_lng !== undefined &&
      filters.location_lng !== null &&
      filters.location_lng !== ""
    )
      apiFilters.location_lng = filters.location_lng;

    listPets(apiFilters)
      .then((data) => {
        if (!active) return;
        // Combine backend pets with mock pets.
        // To keep UX/filters realistic, only show mock pets that match active filters.
        const filteredMocks = MOCK_PETS.filter(mock => {
          // Simple filter logic matching filter panel
          if (apiFilters.breed && (!mock.breed || !mock.breed.toLowerCase().includes(apiFilters.breed.toLowerCase()))) return false;
          if (apiFilters.age && Number(mock.age) !== Number(apiFilters.age)) return false;
          if (apiFilters.location_lat && Number(mock.location_lat).toFixed(2) !== Number(apiFilters.location_lat).toFixed(2)) return false;
          if (apiFilters.location_lng && Number(mock.location_lng).toFixed(2) !== Number(apiFilters.location_lng).toFixed(2)) return false;
          return true;
        });
        // Render backend-registered pets *first* then mock demo pets after
        setPets([
          ...(Array.isArray(data) ? data : []),
          ...filteredMocks
        ]);
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

    return () => { active = false; };
  }, [filters]);

  // Handler for opening edit modal
  function handleEditClick(pet) {
    setEditingPet(pet);
    setEditModalOpen(true);
  }

  // Handler for saving pet edits (calls backend, then updates state)
  async function handleEditSave(petId, updateObj) {
    await updatePet(petId, updateObj);
    // Update pet in UI state optimistically
    setPets((current) =>
      current.map((p) => (p.id === petId ? { ...p, ...updateObj } : p))
    );
    setSuccessMsg("Pet updated!");
    setTimeout(() => setSuccessMsg(null), 1500);
  }

  // Handler for delete request
  async function handleDeleteClick(pet) {
    if (!window.confirm("Are you sure you want to delete this pet listing? This action cannot be undone.")) {
      return;
    }
    setDeletingPetId(pet.id);
    try {
      await deletePet(pet.id);
      setPets((current) => current.filter((p) => p.id !== pet.id));
      setSuccessMsg("Pet deleted.");
      setTimeout(() => setSuccessMsg(null), 1300);
    } catch (err) {
      setError(
        err?.message ||
          (err?.error?.detail && err.error.detail[0]?.msg) ||
          "Failed to delete pet"
      );
    } finally {
      setDeletingPetId(null);
    }
  }

  // Loading state
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

  // Pet empty state
  if (!pets || pets.length === 0) {
    return (
      <main className="container" style={{ textAlign: "center", padding: "3rem 0" }}>
        <PetFilters filters={filters} setFilters={setFilters} loading={loading} />
        <h3>No pets found for your criteria.</h3>
        <p>
          Clear or adjust your filters or be the first to <Link to="/register">register</Link> and add a pet in need!
        </p>
      </main>
    );
  }

  // Responsive card grid for pet listings
  return (
    <main className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.2rem 1.6rem 1.2rem" }}>
      <h2 className="title" style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: 24 }}>
        Adoptable Pets
      </h2>
      <PetFilters filters={filters} setFilters={setFilters} loading={loading} />
      {successMsg && (
        <div style={{
          background: "#23a094",
          color: "#fff",
          textAlign: "center",
          padding: "0.63rem 0.8rem",
          margin: "0 auto 13px auto",
          borderRadius: 7,
          fontWeight: 600,
          maxWidth: 380,
          fontSize: "1.07rem"
        }}>
          {successMsg}
        </div>
      )}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "2rem",
          padding: 0
        }}
      >
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            isLoggedIn={!!user}
            user={user}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            deleting={deletingPetId === pet.id}
          />
        ))}
      </section>
      {/* Edit Modal */}
      <PetEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        pet={editingPet}
        onSave={handleEditSave}
      />
    </main>
  );
}

/**
 * PetCard - Single pet listing (with image, details, and CTA)
 * Shows edit/delete if user is owner or admin.
 * 
 * Updated: 
 *  - Registered pets from the backend use uploaded photo URLs (pet.photos) as `${API_BASE_URL}${photo}`.
 *  - Mock/demo pets use their static photo/images.
 */
function PetCard({ pet, isLoggedIn, user, onEditClick, onDeleteClick, deleting }) {
  // Determine if this is a mock/demo pet (id: string starting with "mock")
  const isMockPet = typeof pet.id === "string" && pet.id.startsWith("mock");

  // Always build an array of all image URLs: for registered pets, API_BASE_URL+photo; for mocks, use the full demo URLs
  let mainPhoto = "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?fit=crop&w=400&q=80";
  let allPhotos = [];

  if (isMockPet) {
    if (
      Array.isArray(pet.photos) &&
      pet.photos.length > 0 &&
      typeof pet.photos[0] === "string" &&
      pet.photos[0].trim() !== ""
    ) {
      // For demo pets, their photos array is already absolute URLs
      allPhotos = pet.photos;
      mainPhoto = pet.photos[0];
    } else if (typeof pet.photo === "string" && pet.photo.trim() !== "") {
      allPhotos = [pet.photo];
      mainPhoto = pet.photo;
    }
  } else {
    // Registered (real) pets: always use `${API_BASE_URL}${photo}`
    if (Array.isArray(pet.photos) && pet.photos.length > 0) {
      allPhotos = pet.photos
        .filter(ph => typeof ph === "string" && ph.trim() !== "")
        .map(photoPath => {
          // Prepend API_BASE_URL to all photo entries (even if photo is an absolute URL, backend should only emit rel paths)
          const trimmed = photoPath.trim();
          // If already absolute, still prepend, unless required to retain as absolute (business rule: use only `${API_BASE_URL}${photo}` for real pets)
          if (/^https?:\/\//i.test(trimmed)) {
            // Optionally, do not prepend. But per the task, backend pet => always prepend.
            let rel = trimmed.startsWith("/") ? trimmed : "/" + trimmed;
            return `${API_BASE_URL.replace(/\/+$/, "")}${rel}`;
          }
          // Always prepend
          let rel = trimmed.startsWith("/") ? trimmed : "/" + trimmed;
          return `${API_BASE_URL.replace(/\/+$/, "")}${rel}`;
        });
      if (allPhotos.length > 0) {
        mainPhoto = allPhotos[0];
      }
    }
  }

  // Defensive fallback for broken/empty photos
  if (
    !mainPhoto ||
    typeof mainPhoto !== "string" ||
    mainPhoto.trim() === "" ||
    mainPhoto.startsWith("blob:") ||
    mainPhoto.startsWith("data:")
  ) {
    mainPhoto = "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?fit=crop&w=400&q=80";
    allPhotos = [mainPhoto];
  }
  const petName = pet.name || "Unnamed Pet";
  const locationStr =
    (pet.location_lat && pet.location_lng)
      ? `📍 (${Number(pet.location_lat).toFixed(2)}, ${Number(pet.location_lng).toFixed(2)})`
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

  // Owner or admin logic
  const isOwner = user && pet.owner_id === user.id;
  const isAdmin = user && user.role === "admin";
  const canEditOrDelete = isOwner || isAdmin;

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
        minHeight: 340,
        position: "relative"
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
        <>
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
              fontSize: "1.06rem",
              marginBottom: canEditOrDelete ? 8 : 0
            }}
          >
            View Details
          </Link>
          {canEditOrDelete && (
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button
                className="btn"
                style={{
                  background: "#ffb900",
                  color: "#222",
                  fontWeight: 600,
                  borderRadius: "7px",
                  padding: "0.37rem 1.08rem",
                  fontSize: "0.97rem",
                  border: "none"
                }}
                onClick={() => onEditClick(pet)}
                title="Edit listing"
              >
                ✏️ Edit
              </button>
              <button
                className="btn"
                style={{
                  background: "#e94f64",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: "7px",
                  padding: "0.37rem 1.08rem",
                  fontSize: "0.97rem",
                  border: "none",
                  opacity: deleting ? 0.5 : 1
                }}
                onClick={() => onDeleteClick(pet)}
                title="Delete listing"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "🗑️ Delete"}
              </button>
            </div>
          )}
        </>
      ) : (
        <span style={{ color: "#e94f64", fontWeight: 500, marginTop: 10, fontSize: "0.97rem" }}>
          <Link to="/login" style={{ color: "#e94f64", fontWeight: 600 }} tabIndex={0}>Login</Link>
          {" "}to contact or save pets.
        </span>
      )}
    </article>
  );
}
