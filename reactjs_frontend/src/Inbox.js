import React, { useState, useEffect } from "react";
import { getInbox, sendMessage, getFlaggedMessages } from "./api";
import { useAuth } from "./AuthContext";

/**
 * PUBLIC_INTERFACE
 * Inbox - In-app messaging inbox UI with backend integration.
 * Features:
 *   - List received and sent messages (with sender, content, time)
 *   - Send a new inquiry/message to any user by ID
 *   - If user is admin, show "All Messages" (monitor view)
 * Usage:
 *   <Inbox />
 */

// Util: format date for display
function formatDate(dateStr) {
  const d = new Date(dateStr);
  // Friendly: 2024-07-03, 12:55 PM
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

// New Message Compose Form
function MessageCompose({ onSend, loading }) {
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    if (!receiverId) {
      setErr("Receiver User ID required.");
      return;
    }
    if (!content.trim()) {
      setErr("Message can't be empty.");
      return;
    }
    onSend({ receiverId, content })
      .then(() => {
        setContent("");
        setReceiverId("");
      })
      .catch((e) => setErr(e?.message || "Failed to send."));
  }

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-end",
        justifyContent: "center",
        marginTop: 16,
        marginBottom: 25,
        flexWrap: "wrap"
      }}
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div style={{ display: "flex", flexDirection: "column", minWidth: 100 }}>
        <label style={{ fontSize: "0.97rem", fontWeight: 500 }}>To User ID</label>
        <input
          type="number"
          min="1"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value.replace(/\D/, ""))}
          placeholder="User ID"
          style={{
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: "0.45rem",
            fontSize: "1rem",
            marginBottom: 2
          }}
          required
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 200 }}>
        <label style={{ fontSize: "0.97rem", fontWeight: 500 }}>Message</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your inquiry/message here..."
          rows={2}
          required
          style={{
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: "0.45rem",
            fontSize: "1rem",
            resize: "vertical",
            minWidth: 190,
            marginBottom: 2
          }}
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="btn"
        style={{
          background: "var(--button-bg)",
          color: "var(--button-text)",
          border: "none",
          borderRadius: 7,
          padding: "0.5rem 1.25rem",
          fontWeight: 600,
          fontSize: "1rem",
          minWidth: 88,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "wait" : "pointer"
        }}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send"}
      </button>
      <div style={{ flexBasis: "100%", height: 4 }} />
      {err && (
        <div style={{ color: "#e94f64", fontWeight: 500, width: "100%", textAlign: "center" }}>
          {err}
        </div>
      )}
    </form>
  );
}

function MessageList({ messages, currentUserId, directionLabel = "inbox", emptyMsg = "No messages." }) {
  // Sort by newest first
  const sorted = (messages || []).slice().sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  return (
    <>
      {sorted.length === 0 ? (
        <div style={{
          color: "#888",
          textAlign: "center",
          fontSize: "1.07rem",
          margin: "2.2rem 0 1rem 0"
        }}>
          {emptyMsg}
        </div>
      ) : (
        <ul style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 18
        }}>
          {sorted.map(msg => {
            const isInbox = msg.receiver_id === currentUserId;
            const isSent = msg.sender_id === currentUserId;
            return (
              <li
                key={msg.id}
                style={{
                  background: isInbox
                    ? "#e8f6f5"
                    : "var(--bg-primary, #fff)",
                  borderRadius: 9,
                  boxShadow: "0 1px 7px rgba(35,160,148,0.06)",
                  border: "1px solid var(--border-color)",
                  padding: "0.87rem 1.05rem 0.76rem 1.05rem",
                  textAlign: "left",
                  position: "relative"
                }}
                aria-label={`Message #${msg.id} from User ${msg.sender_id}`}
              >
                <div style={{
                  fontSize: "0.97rem",
                  color: "#23a094",
                  fontWeight: 600,
                  marginBottom: 2
                }}>
                  {isInbox
                    ? <>From: <b>User {msg.sender_id}</b></>
                    : <>To:&nbsp; <b>User {msg.receiver_id}</b></>}
                  <span style={{
                    color: "#888",
                    fontWeight: 400,
                    fontSize: "0.94rem",
                    marginLeft: 12
                  }}>
                    {formatDate(msg.sent_at)}
                  </span>
                  <span style={{
                    position: "absolute",
                    top: 8,
                    right: 20
                  }}>
                    {isInbox ? (
                      <span style={{
                        background: "#ffb900",
                        color: "#222",
                        borderRadius: 5,
                        fontSize: "0.92rem",
                        padding: "2px 9px"
                      }}>{directionLabel === "admin" ? "All" : "Inbox"}</span>
                    ) : (
                      <span style={{
                        background: "#e94f64",
                        color: "#fff",
                        borderRadius: 5,
                        fontSize: "0.92rem",
                        padding: "2px 9px"
                      }}>Sent</span>
                    )}
                  </span>
                </div>
                <div style={{
                  fontSize: "1.08rem",
                  color: "var(--text-primary)",
                  marginBottom: 7,
                  marginTop: 5
                }}>
                  {msg.content}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

// ADMIN: View table for flagged messages. Reuses MessageList but with flagged info.
function AdminFlagged({}) {
  const [flagged, setFlagged] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    getFlaggedMessages()
      .then(setFlagged)
      .catch(e => setErr(e?.message || "Failed to fetch flagged messages"))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ textAlign: "center" }}><b>Loading flagged messages...</b></div>;
  if (err) return <div style={{ color: "#e94f64", textAlign: "center" }}>{err}</div>;
  return (
    <section style={{ marginTop: 18 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 10, color: "#e94f64", textAlign: "center" }}>🚩 Flagged Messages</h3>
      <MessageList messages={flagged} currentUserId={null} directionLabel="admin" emptyMsg="No flagged messages." />
    </section>
  );
}

// Inbox Main Component
// PUBLIC_INTERFACE
export default function Inbox() {
  const { user, authLoading } = useAuth();
  const [allMsgs, setAllMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState("");
  const [sendError, setSendError] = useState(null);

  // Backend integration - fetch inbox
  function fetchInbox() {
    setLoading(true);
    getInbox()
      .then(msgs => setAllMsgs(Array.isArray(msgs) ? msgs : []))
      .catch(() => setAllMsgs([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!authLoading) {
      fetchInbox();
    }
    // eslint-disable-next-line
  }, [authLoading]);

  // Group into received (inbox) and sent
  const inboxMsgs = allMsgs.filter(m => user && m.receiver_id === user.id);
  const sentMsgs = allMsgs.filter(m => user && m.sender_id === user.id);

  // Send message handler
  async function handleSendMessage({ receiverId, content }) {
    setSendLoading(true);
    setSendError(null);
    try {
      // Always send integer ID, API requires integer for receiver_id.
      await sendMessage(parseInt(receiverId, 10), content);
      setSendSuccess("Message sent!");
      setTimeout(() => setSendSuccess(""), 1300);
      fetchInbox();
    } catch (err) {
      setSendError(
        err?.message ||
        (err?.error?.detail && err.error.detail[0]?.msg) ||
        "Could not send message"
      );
      throw err;
    } finally {
      setSendLoading(false);
    }
  }

  if (authLoading) {
    return (
      <main className="container" style={{ margin: "2.8rem auto", textAlign: "center" }}>
        <span style={{ color: "#23a094", fontWeight: 600 }}>Loading messages...</span>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container" style={{ margin: "2.8rem auto", textAlign: "center", padding: "2.2rem 1rem" }}>
        <h2 className="title" style={{ fontSize: "1.7rem", fontWeight: 700, marginBottom: 13 }}>📥 Messages Inbox</h2>
        <div style={{ color: "#e94f64", marginBottom: 16 }}>You must be logged in to view your in-app messages.</div>
      </main>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <main className="container"
      style={{
        maxWidth: 760,
        margin: "2.8rem auto",
        padding: "2.2rem 1.2rem 1rem 1.2rem",
        background: "var(--bg-secondary)",
        borderRadius: 14,
        boxShadow: "0 2px 22px rgba(35,160,148,0.08)"
      }}>
      <h2 className="title" style={{
        fontSize: "1.65rem",
        fontWeight: 700,
        marginBottom: 13,
        textAlign: "center"
      }}>
        📥 Messages Inbox
      </h2>
      <div style={{ marginBottom: 23, color: "var(--text-secondary)", textAlign: "center" }}>
        <span>
          View your adoption inquiries and sent messages.<br />
          {isAdmin && <b>Admin:</b>} {isAdmin ? "Monitor all flagged/inquiries." : "Contact others by their User ID."}
        </span>
      </div>
      {/* Compose message */}
      <section style={{ marginBottom: 10 }}>
        <div style={{
          background: "#fff8d9",
          color: "#b49915",
          borderRadius: 8,
          padding: "0.77rem 1.5rem 0.62rem 1.5rem",
          marginBottom: 3,
          fontWeight: 500,
          textAlign: "center",
          border: "1px solid #ffe7a0"
        }}>
          To send a new inquiry, enter the recipient User ID below.
        </div>
        <MessageCompose onSend={handleSendMessage} loading={sendLoading} />
        {sendSuccess && <div style={{ color: "#23a094", fontWeight: 600, textAlign: "center" }}>{sendSuccess}</div>}
        {sendError && <div style={{ color: "#e94f64", fontWeight: 500, textAlign: "center" }}>{sendError}</div>}
      </section>
      <hr style={{ margin: "1.3rem auto", width: "68%", border: "1px solid var(--border-color)" }} />
      <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
        <section style={{ flex: 1, minWidth: 270, maxWidth: 370 }}>
          <h3 style={{ fontSize: "1.11rem", fontWeight: 700, marginBottom: 7, textAlign: "left", color: "#23a094" }}>Received (Inbox)</h3>
          {loading
            ? <div style={{ textAlign: "center", color: "#23a094" }}><b>Loading...</b></div>
            : <MessageList messages={inboxMsgs} currentUserId={user.id} directionLabel="inbox" emptyMsg="No inbox messages." />}
        </section>
        <section style={{ flex: 1, minWidth: 270, maxWidth: 370 }}>
          <h3 style={{ fontSize: "1.11rem", fontWeight: 700, marginBottom: 7, textAlign: "left", color: "#e94f64" }}>Sent</h3>
          {loading
            ? <div style={{ textAlign: "center", color: "#e94f64" }}><b>Loading...</b></div>
            : <MessageList messages={sentMsgs} currentUserId={user.id} directionLabel="sent" emptyMsg="No sent messages." />}
        </section>
      </div>
      {/* Admin View: flagged/monitor messages */}
      {isAdmin && (
        <div style={{ marginTop: 32 }}>
          <AdminFlagged />
        </div>
      )}
      <div style={{ marginTop: 30, textAlign: "center", fontSize: "0.97rem" }}>
        <span style={{ color: "#888" }}>
          Want to message someone? Enter their User ID above or click <b>Adopt Now</b> on a pet to start an inquiry.
        </span>
      </div>
    </main>
  );
}
