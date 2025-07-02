import React from "react";

/**
 * PUBLIC_INTERFACE
 * Inbox - In-app messaging inbox UI (static demo).
 * Shows a list of received/sent messages with sender, content, and timestamp.
 * For static demo only; no API integration yet.
 * 
 * Usage:
 *   <Inbox />
 */
const STATIC_MESSAGES = [
  {
    id: 1,
    sender: "admin@petconnect.com",
    receiver: "user@example.com",
    content: "Thank you for your interest in Bella! We'll connect you with her foster soon.",
    sent_at: "2024-05-01T15:35:00Z",
    direction: "in", // received
  },
  {
    id: 2,
    sender: "you",
    receiver: "rescuer@catpro.org",
    content: "Hi, I'm interested in adopting Milo. Is he still available?",
    sent_at: "2024-05-03T11:11:00Z",
    direction: "out", // sent
  },
  {
    id: 3,
    sender: "rescuer@doghelpers.com",
    receiver: "you",
    content: "Yes, Daisy is available! When would you like to meet her?",
    sent_at: "2024-05-03T13:45:00Z",
    direction: "in",
  },
  {
    id: 4,
    sender: "you",
    receiver: "rescuer@doghelpers.com",
    content: "Great! I'm available this weekend. Thank you.",
    sent_at: "2024-05-03T14:00:00Z",
    direction: "out",
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

// PUBLIC_INTERFACE
export default function Inbox() {
  return (
    <main className="container" style={{
      maxWidth: 650,
      margin: "2.8rem auto",
      padding: "2.2rem 1.2rem 1rem 1.2rem",
      background: "var(--bg-secondary)",
      borderRadius: 14,
      boxShadow: "0 2px 22px rgba(35,160,148,0.08)"
    }}>
      <h2 className="title" style={{
        fontSize: "1.7rem",
        fontWeight: 700,
        marginBottom: 16,
        textAlign: "center"
      }}>
        📥 Messages Inbox
      </h2>
      <div style={{ marginBottom: 28, color: "var(--text-secondary)", textAlign: "center" }}>
        <span>
          View inquiries and responses about adoptions and listings.<br />
          (This is a static demo &mdash; messaging will be interactive soon.)
        </span>
      </div>
      <section>
        {STATIC_MESSAGES.length === 0 ? (
          <div style={{
            color: "#888",
            textAlign: "center",
            fontSize: "1.07rem",
            margin: "2.5rem 0"
          }}>
            No messages yet.
          </div>
        ) : (
          <ul style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 22
          }}>
            {STATIC_MESSAGES.map(msg => (
              <li
                key={msg.id}
                style={{
                  background: msg.direction === "in"
                    ? "#e8f6f5"
                    : "var(--bg-primary, #fff)",
                  borderRadius: 11,
                  boxShadow: "0 1px 7px rgba(35,160,148,0.06)",
                  border: "1px solid var(--border-color)",
                  padding: "1.05rem 1.25rem 0.89rem 1.25rem",
                  textAlign: "left",
                  position: "relative"
                }}
                aria-label={`Message from ${msg.sender}`}
              >
                <div style={{
                  fontSize: "0.96rem",
                  color: "#23a094",
                  fontWeight: 600,
                  marginBottom: 3
                }}>
                  {msg.direction === "in" ? `From: ${msg.sender}` : `To: ${msg.receiver}`}
                  <span style={{
                    color: "#888",
                    fontWeight: 400,
                    fontSize: "0.95rem",
                    marginLeft: 12
                  }}>
                    {formatDate(msg.sent_at)}
                  </span>
                </div>
                <div style={{
                  fontSize: "1.07rem",
                  color: "var(--text-primary)",
                  marginBottom: 7,
                  marginTop: 5
                }}>
                  {msg.content}
                </div>
                <div style={{ position: "absolute", top: 13, right: 19 }}>
                  {msg.direction === "in" ? (
                    <span style={{ background: "#ffb900", color: "#222", borderRadius: 5, fontSize: "0.92rem", padding: "2px 9px" }}>Inbox</span>
                  ) : (
                    <span style={{ background: "#e94f64", color: "#fff", borderRadius: 5, fontSize: "0.92rem", padding: "2px 9px" }}>Sent</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div style={{ marginTop: 25, textAlign: "center", fontSize: "0.97rem" }}>
        <span style={{ color: "#888" }}>
          Want to message someone? Click <b>Adopt Now</b> on a pet to start an inquiry.
        </span>
      </div>
    </main>
  );
}
