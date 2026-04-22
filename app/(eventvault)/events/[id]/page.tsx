"use client";

import { useEffect, useMemo, useState } from "react";

type Submission = {
  id: string;
  guest_name: string;
  guest_email: string | null;
  text_content: string | null;
  submitted_at: string;
  message_type: string;
};

type EventDetail = {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string | null;
  short_code: string;
  status: string;
  submissions: Submission[];
  submission_count: number;
};

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [eventId, setEventId] = useState("");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const resolved = await params;
      if (!mounted) return;
      setEventId(resolved.id);
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    let mounted = true;

    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/events/${eventId}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load event");
        }

        if (mounted) {
          setEvent(data);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Something went wrong");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const publicLink = useMemo(() => {
    if (!event?.short_code) return "";
    if (typeof window === "undefined") return `/e/${event.short_code}`;
    return `${window.location.origin}/e/${event.short_code}`;
  }, [event]);

  async function copyGuestLink() {
    if (!publicLink) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "No date set";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "No date set";
    return d.toLocaleDateString();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EF",
        padding: "32px 20px",
        fontFamily: "DM Sans, sans-serif",
        color: "#1F2E23",
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
            color: "#1F2E23",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Back to Event Vaults
        </a>

        {loading ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E6DED0",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 10px 30px rgba(31,46,35,0.06)",
            }}
          >
            Loading event…
          </div>
        ) : error ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E6DED0",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 10px 30px rgba(31,46,35,0.06)",
            }}
          >
            <h1
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "42px",
                margin: "0 0 10px",
              }}
            >
              Unable to load event
            </h1>
            <p style={{ margin: 0, color: "#6B6B6B" }}>{error}</p>
          </div>
        ) : event ? (
          <>
            <div
              style={{
                background: "#fff",
                border: "1px solid #E6DED0",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 10px 30px rgba(31,46,35,0.06)",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6B6B6B",
                      marginBottom: "8px",
                    }}
                  >
                    Event Vault
                  </div>
                  <h1
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "48px",
                      lineHeight: 1,
                    }}
                  >
                    {event.event_name}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      color: "#6B6B6B",
                      fontSize: "14px",
                    }}
                  >
                    <span>{event.event_type}</span>
                    <span>•</span>
                    <span>{formatDate(event.event_date)}</span>
                    <span>•</span>
                    <span
                      style={{
                        background:
                          event.status === "active"
                            ? "rgba(47,107,79,0.10)"
                            : "rgba(107,107,107,0.10)",
                        color: event.status === "active" ? "#2F6B4F" : "#555",
                        borderRadius: "999px",
                        padding: "4px 10px",
                        fontWeight: 600,
                      }}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={copyGuestLink}
                  style={{
                    background: copied ? "#B89B5E" : "transparent",
                    color: "#1F2E23",
                    border: "1px solid #1F2E23",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {copied ? "✓ Copied!" : "Copy Guest Link"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E6DED0",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ color: "#6B6B6B", fontSize: "13px", marginBottom: "8px" }}>
                  Messages
                </div>
                <div style={{ fontSize: "34px", fontWeight: 700 }}>{event.submission_count || 0}</div>
              </div>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E6DED0",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ color: "#6B6B6B", fontSize: "13px", marginBottom: "8px" }}>
                  Public Link
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    wordBreak: "break-all",
                    color: "#1F2E23",
                  }}
                >
                  {publicLink}
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E6DED0",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ color: "#6B6B6B", fontSize: "13px", marginBottom: "8px" }}>
                  Status
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700 }}>{event.status}</div>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #E6DED0",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 10px 30px rgba(31,46,35,0.06)",
              }}
            >
              <div style={{ marginBottom: "18px" }}>
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "34px",
                  }}
                >
                  Guest Messages
                </h2>
                <p style={{ margin: 0, color: "#6B6B6B" }}>
                  Messages submitted through your event page.
                </p>
              </div>

              {!event.submissions || event.submissions.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #D9D2C3",
                    borderRadius: "16px",
                    padding: "26px",
                    background: "#FCFBF8",
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", fontSize: "20px" }}>No messages yet</h3>
                  <p style={{ margin: 0, color: "#6B6B6B" }}>
                    Once guests begin submitting, they’ll appear here.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {event.submissions.map((submission) => (
                    <div
                      key={submission.id}
                      style={{
                        border: "1px solid #E6DED0",
                        borderRadius: "16px",
                        padding: "18px",
                        background: "#FCFBF8",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                          marginBottom: "10px",
                        }}
                      >
                        <strong>{submission.guest_name}</strong>
                        <span style={{ color: "#6B6B6B", fontSize: "13px" }}>
                          {new Date(submission.submitted_at).toLocaleString()}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "0 0 8px",
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {submission.text_content || "No message content"}
                      </p>
                      {submission.guest_email ? (
                        <div style={{ color: "#6B6B6B", fontSize: "13px" }}>
                          {submission.guest_email}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
