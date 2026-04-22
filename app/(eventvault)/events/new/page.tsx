"use client";

import { useState } from "react";

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding", icon: "💍" },
  { value: "engagement", label: "Engagement", icon: "🥂" },
  { value: "baby_shower", label: "Baby Shower", icon: "🧸" },
  { value: "birthday", label: "Birthday", icon: "🎂" },
  { value: "graduation", label: "Graduation", icon: "🎓" },
  { value: "retirement", label: "Retirement", icon: "🌅" },
  { value: "anniversary", label: "Anniversary", icon: "💞" },
  { value: "other", label: "Other", icon: "✨" },
];

type CreatedEvent = {
  id: string;
  event_name: string;
  short_code: string;
  qr_code_url?: string | null;
};

export default function NewEventPage() {
  const [eventType, setEventType] = useState("wedding");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [allowGifts, setAllowGifts] = useState(false);
  const [autoClose, setAutoClose] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CreatedEvent | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          event_type: eventType,
          event_name: eventName,
          event_date: eventDate || null,
          guest_message: guestMessage || null,
          submission_deadline: submissionDeadline || null,
          allow_gifts: allowGifts,
          auto_close_on_event_date: autoClose,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create event");
      }

      setCreatedEvent(data);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyPublicLink() {
    if (!createdEvent) return;

    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/e/${createdEvent.short_code}`
        : `/e/${createdEvent.short_code}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EF",
        padding: "40px 20px 60px",
        fontFamily: "DM Sans, sans-serif",
        color: "#2B1E1A",
      }}
    >
      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
        }}
      >
        <a
          href="/events"
          style={{
            display: "inline-block",
            marginBottom: "18px",
            color: "#2B1E1A",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          ← Back to Event Vaults
        </a>

        {!createdEvent ? (
          <>
            <section
              style={{
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "#D66A4E",
                  marginBottom: "10px",
                }}
              >
                Event Vault
              </div>

              <h1
                style={{
                  margin: "0 0 12px",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(40px, 5vw, 60px)",
                  lineHeight: 0.95,
                  color: "#2B1E1A",
                  fontWeight: 600,
                }}
              >
                Create your
                <br />
                event page.
              </h1>

              <p
                style={{
                  margin: 0,
                  maxWidth: "720px",
                  color: "#6B625E",
                  fontSize: "18px",
                  lineHeight: 1.75,
                }}
              >
                Set up a private page for guests to share messages without downloading
                anything or creating an account.
              </p>
            </section>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,248,244,0.96) 100%)",
                  border: "1px solid rgba(43,30,26,0.08)",
                  borderRadius: "30px",
                  padding: "30px",
                  boxShadow: "0 18px 45px rgba(43,30,26,0.06)",
                }}
              >
                <div style={{ marginBottom: "28px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      color: "#D66A4E",
                      marginBottom: "8px",
                    }}
                  >
                    Step 1
                  </div>

                  <h2
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "34px",
                      lineHeight: 1,
                      color: "#2B1E1A",
                    }}
                  >
                    Event details
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#6B625E",
                      fontSize: "15px",
                      lineHeight: 1.7,
                    }}
                  >
                    Choose the type of event and add the key details guests will see.
                  </p>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#2B1E1A",
                    }}
                  >
                    Event Type
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {EVENT_TYPES.map((type) => {
                      const active = eventType === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setEventType(type.value)}
                          style={{
                            border: active
                              ? "1.5px solid #D66A4E"
                              : "1px solid rgba(43,30,26,0.08)",
                            background: active ? "rgba(214,106,78,0.10)" : "#FFFFFF",
                            color: "#2B1E1A",
                            borderRadius: "18px",
                            padding: "16px 14px",
                            cursor: "pointer",
                            textAlign: "center",
                            boxShadow: active
                              ? "0 10px 24px rgba(214,106,78,0.10)"
                              : "none",
                          }}
                        >
                          <div style={{ fontSize: "24px", marginBottom: "8px" }}>{type.icon}</div>
                          <div style={{ fontSize: "14px", fontWeight: 700 }}>{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "18px",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#2B1E1A",
                      }}
                    >
                      Event Name
                    </label>
                    <input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Jessica & Mark’s Wedding"
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        border: "1px solid rgba(43,30,26,0.10)",
                        background: "#FFFFFF",
                        color: "#2B1E1A",
                        borderRadius: "18px",
                        padding: "15px 16px",
                        fontSize: "15px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#2B1E1A",
                      }}
                    >
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        border: "1px solid rgba(43,30,26,0.10)",
                        background: "#FFFFFF",
                        color: "#2B1E1A",
                        borderRadius: "18px",
                        padding: "15px 16px",
                        fontSize: "15px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#2B1E1A",
                    }}
                  >
                    Message to Guests
                  </label>
                  <textarea
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    placeholder="Leave us a message we can look back on for years to come."
                    rows={5}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid rgba(43,30,26,0.10)",
                      background: "#FFFFFF",
                      color: "#2B1E1A",
                      borderRadius: "18px",
                      padding: "16px",
                      fontSize: "15px",
                      lineHeight: 1.7,
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "18px",
                    marginBottom: "22px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#2B1E1A",
                      }}
                    >
                      Submission Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={submissionDeadline}
                      onChange={(e) => setSubmissionDeadline(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        border: "1px solid rgba(43,30,26,0.10)",
                        background: "#FFFFFF",
                        color: "#2B1E1A",
                        borderRadius: "18px",
                        padding: "15px 16px",
                        fontSize: "15px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: allowGifts ? "rgba(214,106,78,0.10)" : "#FFFFFF",
                        border: allowGifts
                          ? "1.5px solid #D66A4E"
                          : "1px solid rgba(43,30,26,0.08)",
                        borderRadius: "18px",
                        padding: "14px 16px",
                        minHeight: "56px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allowGifts}
                        onChange={(e) => setAllowGifts(e.target.checked)}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#2B1E1A",
                        }}
                      >
                        Allow gifts for this event
                      </span>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#FFFFFF",
                        border: "1px solid rgba(43,30,26,0.08)",
                        borderRadius: "18px",
                        padding: "14px 16px",
                        minHeight: "56px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={autoClose}
                        onChange={(e) => setAutoClose(e.target.checked)}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#2B1E1A",
                        }}
                      >
                        Auto-close on event date
                      </span>
                    </label>
                  </div>
                </div>

                {error ? (
                  <div
                    style={{
                      marginBottom: "18px",
                      background: "rgba(214,106,78,0.10)",
                      border: "1px solid rgba(214,106,78,0.18)",
                      color: "#A54E38",
                      borderRadius: "18px",
                      padding: "14px 16px",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                    paddingTop: "8px",
                    borderTop: "1px solid rgba(43,30,26,0.08)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#6B625E",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Guests won’t need an app or account to leave a message.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href="/events"
                      style={{
                        textDecoration: "none",
                        color: "#2B1E1A",
                        border: "1px solid rgba(43,30,26,0.14)",
                        background: "transparent",
                        padding: "13px 18px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      Cancel
                    </a>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        border: "none",
                        background: loading ? "#E7B0A3" : "#D66A4E",
                        color: "#FFFFFF",
                        padding: "13px 20px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: "0 14px 32px rgba(214,106,78,0.22)",
                      }}
                    >
                      {loading ? "Creating…" : "Create My Event Vault"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </>
        ) : (
          <section
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,248,244,0.96) 100%)",
              border: "1px solid rgba(43,30,26,0.08)",
              borderRadius: "30px",
              padding: "34px",
              boxShadow: "0 18px 45px rgba(43,30,26,0.06)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "999px",
                background: "rgba(214,106,78,0.10)",
                color: "#D66A4E",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              ✦ Your vault is live
            </div>

            <h1
              style={{
                margin: "0 0 10px",
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(40px, 5vw, 56px)",
                lineHeight: 0.95,
                color: "#2B1E1A",
              }}
            >
              {createdEvent.event_name}
            </h1>

            <p
              style={{
                margin: "0 0 22px",
                color: "#6B625E",
                fontSize: "17px",
                lineHeight: 1.8,
                maxWidth: "760px",
              }}
            >
              Share your event link or QR code with guests so they can leave messages
              you’ll be able to revisit long after the event ends.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(43,30,26,0.08)",
                  borderRadius: "24px",
                  padding: "22px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#D66A4E",
                    marginBottom: "10px",
                  }}
                >
                  Public Link
                </div>

                <div
                  style={{
                    background: "#FCFBF9",
                    border: "1px solid rgba(43,30,26,0.06)",
                    borderRadius: "18px",
                    padding: "14px 16px",
                    fontSize: "14px",
                    color: "#2B1E1A",
                    wordBreak: "break-all",
                    marginBottom: "16px",
                  }}
                >
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/e/${createdEvent.short_code}`
                    : `/e/${createdEvent.short_code}`}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href={`/e/${createdEvent.short_code}`}
                    style={{
                      textDecoration: "none",
                      background: "#D66A4E",
                      color: "#FFFFFF",
                      padding: "13px 18px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: 700,
                      boxShadow: "0 14px 32px rgba(214,106,78,0.22)",
                    }}
                  >
                    View Event Page
                  </a>

                  <button
                    type="button"
                    onClick={copyPublicLink}
                    style={{
                      border: "1px solid rgba(43,30,26,0.14)",
                      background: copied ? "#D8B56A" : "transparent",
                      color: "#2B1E1A",
                      padding: "13px 18px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </button>

                  <a
                    href="/events"
                    style={{
                      textDecoration: "none",
                      color: "#2B1E1A",
                      border: "1px solid rgba(43,30,26,0.14)",
                      background: "transparent",
                      padding: "13px 18px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(43,30,26,0.08)",
                  borderRadius: "24px",
                  padding: "22px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#D66A4E",
                    marginBottom: "12px",
                  }}
                >
                  QR Code
                </div>

                {createdEvent.qr_code_url ? (
                  <>
                    <img
                      src={createdEvent.qr_code_url}
                      alt="Event QR code"
                      style={{
                        width: "100%",
                        maxWidth: "220px",
                        borderRadius: "16px",
                        border: "1px solid rgba(43,30,26,0.08)",
                        background: "#FFFFFF",
                      }}
                    />
                    <div style={{ marginTop: "14px" }}>
                      <a
                        href={createdEvent.qr_code_url}
                        download={`${createdEvent.short_code}-qr.png`}
                        style={{
                          textDecoration: "none",
                          color: "#2B1E1A",
                          border: "1px solid rgba(43,30,26,0.14)",
                          background: "transparent",
                          padding: "11px 16px",
                          borderRadius: "999px",
                          fontSize: "14px",
                          fontWeight: 700,
                          display: "inline-block",
                        }}
                      >
                        Download QR
                      </a>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      color: "#6B625E",
                      fontSize: "14px",
                    }}
                  >
                    QR code unavailable
                  </div>
                )}
              </div>
            </div>

            <p
              style={{
                margin: "22px 0 0",
                color: "#6B625E",
                fontSize: "14px",
                lineHeight: 1.7,
              }}
            >
              Print the QR on invitations, display it at the venue, or text the link
              directly to guests.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
