import React, { useState } from "react";
import { createPet } from "./api";
import { useNavigate } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * PetCreateForm - Form for creating a new pet listing, supporting multi-photo upload and form validation.
 * Integrates with backend POST /pets/ endpoint (multipart/form-data).
 *
 * Usage:
 * <PetCreateForm />
 */
export default function PetCreateForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    description: "",
    location_lat: "",
    location_lng: "",
    files: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // PUBLIC_INTERFACE
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  // PUBLIC_INTERFACE
  function handleFilesChange(e) {
    setForm(f => ({ ...f, files: Array.from(e.target.files) }));
  }

  // Simple form validation (required: name, species; age/location numeric if entered)
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
    setSuccessMsg(null);
    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return;
    }
    setSubmitting(true);

    // Prepare multipart form data as per OpenAPI backend spec
    const data = new FormData();
    data.append("name", form.name);
    data.append("species", form.species);
    if (form.breed) data.append("breed", form.breed);
    if (form.age) data.append("age", form.age);
    if (form.description) data.append("description", form.description);
    if (form.location_lat) data.append("location_lat", form.location_lat);
    if (form.location_lng) data.append("location_lng", form.location_lng);
    form.files.forEach((f) => data.append("files", f));

    try {
      await createPet(data);
      setSuccessMsg("Pet successfully added!");
      setForm({
        name: "",
        species: "",
        breed: "",
        age: "",
        description: "",
        location_lat: "",
        location_lng: "",
        files: []
      });
      setTimeout(() => {
        // After successful creation, redirect to pet listings and pass a trigger to refresh
        navigate("/pets", { state: { petCreated: true, refresh: Date.now() } });
      }, 1200);
    } catch (err) {
      setError(
        err?.message ||
        (err?.error?.detail && err.error.detail[0]?.msg) ||
        "Could not create pet listing"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{
      maxWidth: 480,
      margin: "2.2rem auto 2rem auto",
      background: "var(--bg-secondary)",
      padding: "2.4rem 2.1rem 2.2rem 2.1rem",
      borderRadius: 14,
      boxShadow: "0 2px 14px rgba(35,160,148,0.10)"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 18, fontWeight: 700 }}>Register a New Pet</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete="off" style={{ display: "flex", flexDirection: "column" }}>
        <label style={labelStyle}>Name <span style={{ color: "#e94f64" }}>*</span></label>
        <input name="name" value={form.name} onChange={handleChange} required minLength={2} style={inputStyle} />

        <label style={labelStyle}>Species <span style={{ color: "#e94f64" }}>*</span></label>
        <input name="species" value={form.species} onChange={handleChange} required minLength={2} style={inputStyle} />

        <label style={labelStyle}>Breed</label>
        <input name="breed" value={form.breed} onChange={handleChange} style={inputStyle} />

        <label style={labelStyle}>Age (years)</label>
        <input name="age" type="number" min="0" value={form.age} onChange={handleChange} style={inputStyle} />

        <label style={labelStyle}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange}
          rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 62, fontFamily: "inherit" }}
        />

        <label style={labelStyle}>Location Latitude</label>
        <input name="location_lat" value={form.location_lat} onChange={handleChange} style={inputStyle} placeholder="e.g. 37.773" />

        <label style={labelStyle}>Location Longitude</label>
        <input name="location_lng" value={form.location_lng} onChange={handleChange} style={inputStyle} placeholder="e.g. -122.419" />

        <label style={labelStyle}>Photos (up to 5, jpg/png/gif)</label>
        <input
          name="files"
          type="file"
          accept="image/*"
          onChange={handleFilesChange}
          multiple
          style={{ marginBottom: 16 }}
          maxLength={5}
        />
        {form.files && form.files.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <small>{form.files.length} photo{form.files.length > 1 ? "s" : ""} selected</small>
          </div>
        )}

        {error && <div style={{ color: "#e94f64", fontWeight: 500, marginBottom: 11 }}>{error}</div>}
        {successMsg && <div style={{ color: "#23a094", fontWeight: 600, marginBottom: 11 }}>{successMsg}</div>}

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
            marginBottom: 2,
            fontSize: "1.08rem",
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.7 : 1
          }}
          disabled={submitting}
        >
          {submitting ? "Registering..." : "Add Pet"}
        </button>
      </form>
    </div>
  );
}

const labelStyle = {
  textAlign: "left", marginBottom: 4, fontWeight: 500,
  marginTop: 10
};

const inputStyle = {
  padding: "0.6rem",
  marginBottom: 12,
  fontSize: "1rem",
  borderRadius: 7,
  border: "1px solid #ccc"
};
