import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * PetList - Grid page showing available pets for adoption, using static sample data (prepared for later API integration).
 * Displays: pet's image, name, species, breed, age, description, and location.
 * Modern, pet-friendly UI. Responsive (CSS grid style compatible with Tailwind/classic).
 *
 * Usage:
 * <PetList />
 */
const SAMPLE_PETS = [
  {
    id: 1,
    name: "Bella",
    species: "Dog",
    breed: "Labrador Retriever",
    age: 3,
    description: "Sweet, playful, and loves fetch. Great with kids!",
    location: "San Francisco, CA",
    photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Milo",
    species: "Cat",
    breed: "Maine Coon",
    age: 5,
    description: "Gentle giant. Prefers quiet homes. Loves chin scratches.",
    location: "Oakland, CA",
    photo: "https://images.unsplash.com/photo-1518715308788-3005759c0614?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Daisy",
    species: "Dog",
    breed: "Beagle",
    age: 2,
    description: "Curious and energetic. Adorable howl.",
    location: "San Jose, CA",
    photo: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Shadow",
    species: "Cat",
    breed: "Bombay",
    age: 4,
    description: "Very affectionate and talkative. Litter-trained.",
    location: "Palo Alto, CA",
    photo: "https://images.unsplash.com/photo-1518715308788-3005759c0614?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Cleo",
    species: "Dog",
    breed: "Mixed",
    age: 1,
    description: "Goofy puppy energy. Learning basic commands; very smart.",
    location: "Mountain View, CA",
    photo: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=400&q=80",
  },
];

export default function PetList() {
  // When API integration is ready, replace this with a real fetch/useEffect, etc.
  const [pets] = useState(SAMPLE_PETS);

  return (
    <main className="container" style={{
      maxWidth: 1200, margin: "0 auto", padding: "3rem 1.2rem 1.6rem 1.2rem"
    }}>
      <h2 className="title" style={{
        fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: 24
      }}>
        Available Pets for Adoption
      </h2>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          padding: 0,
        }}
      >
        {pets.map((pet) => (
          <article
            key={pet.id}
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
            aria-label={`Pet listing: ${pet.name}`}
          >
            <img
              src={pet.photo}
              alt={pet.name}
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
              {pet.name}
            </h3>
            <p style={{
              color: "#888", fontWeight: 500, margin: "0.28rem 0 0.55rem 0", fontSize: "1.04rem"
            }}>
              {pet.species}{pet.breed ? ` • ${pet.breed}` : ""}
              {pet.age ? ` • ${pet.age} yr${pet.age !== 1 ? "s" : ""}` : ""}
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
              {pet.description}
            </p>
            <span style={{
              background: "#ffb900",
              color: "#222",
              borderRadius: 7,
              fontWeight: 600,
              padding: "3px 12px",
              fontSize: "0.97rem",
              margin: "0 0 4px 0"
            }}>
              {pet.location}
            </span>
          </article>
        ))}
      </section>
    </main>
  );
}
