"use client";

import { useEffect, useMemo, useState } from "react";

type EventListItem = {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string | null;
  short_code: string;
  status: string;
  submission_count?: number;
  qr_code_url?: string | null;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  baby_shower: "Baby Shower",
  birthday: "Birthday",
  graduation: "Graduation",
  retirement: "Retirement",
  anniversary: "Anniversary",
  other: "Other",
};

const EVENT_TYPE_EMOJIS: Record<string, string> = {
  wedding: "💍",
  engagement: "🥂",
  baby_shower: "🧸",
  birthday: "🎂",
  graduation: "🎓",
  retirement: "🌅",
  anniversary: "💞",
  other: "✨",
};

function formatDate(dateString: string | null) {
  if (!dateString) return "No date set";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "No date set";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusStyles(status: string) {
  if (status === "active") {
    return {
      background: "rgba(214,106,78,0.10)",
      color: "#D66A4E",
      border: "1px solid rgba(214,106,78,0.18)",
    };
  }

  if (status === "delivered") {
    return {
      background: "rgba(216,181,106,0.14)",
      color: "#8B6A2F",
      border: "1px solid rgba(216,181,106,0.22)",
    };
  }

  return {
    background: "rgba(43,30,26,0.06)",
    color: "#5A4A43",
    border: "1px solid rgba(43,30,26,0.10)",
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/events", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load events");
        }

        if (mounted) {
          setEvents(Array.isArray(data) ? data : []);
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

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const eventCountLabel = useMemo(() => {
    if (loading) return "Loading your events...";
    if (events.length === 0) return "No events yet";
    if (events.length === 1) return "1 event";
    return `${events.length} events`;
  }, [events, loading]);

  async function copyLink(shortCode: string) {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/e/${shortCode}`
          : `/e/${shortCode}`;

      await navigator.clipboard.writeText(url);
      setCopied(shortCode);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EF",
        padding: "40px 20px 56px",
        fontFamily: "DM Sans, sans-serif",
        color: "#2B1E1A",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <section
          style={{
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "760px" }}>
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
                fontSize: "clamp(42px, 6vw, 64px)",
                lineHeight: 0.95,
                color: "#2B1E1A",
                fontWeight: 600,
              }}
            >
              Your events,
              <br />
              beautifully organized.
            </h1>

            <p
              style={{
                margin: "0 0 14px",
                fontSize: "18px",
                lineHeight: 1.75,
                color: "#6B625E",
                maxWidth: "720px",
              }}
            >
              Create private event pages, share them in seconds, and collect messages
              your guests can leave without downloading anything or making an account.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(43,30,26,0.08)",
                color: "#6B625E",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#D66A4E" }}>✦</span>
              {eventCountLabel}
            </div>
          </div>

          <a
            href="/events/new"
            style={{
              textDecoration: "none",
              background: "#D66A4E",
              color: "#FFFFFF",
              padding: "14px 22px",
              borderRadius: "999px",
              fontSize: "15px",
              fontWeight: 700,
              boxShadow: "0 14px 32px rgba(214,106,78,0.22)",
              alignSelf: "flex-start",
              whiteSpace: "nowrap",
            }}
          >
            Create Your Event
          </a>
        </section>

        {loading ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(43,30,26,0.08)",
              borderRadius: "28px",
              padding: "30px",
              boxShadow: "0 18px 45px rgba(43,30,26,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                color: "#6B625E",
              }}
            >
              Loading your Event Vaults…
            </div>
          </div>
        ) : error ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(43,30,26,0.08)",
              borderRadius: "28px",
              padding: "30px",
              boxShadow: "0 18px 45px rgba(43,30,26,0.06)",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "34px",
                color: "#2B1E1A",
              }}
            >
              We couldn’t load your events
            </h2>
            <p
              style={{
                margin: 0,
                color: "#6B625E",
                lineHeight: 1.7,
              }}
            >
              {error}
            </p>
          </div>
        ) : events.length === 0 ? (
          <section
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,248,244,0.96) 100%)",
              border: "1px solid rgba(43,30,26,0.08)",
              borderRadius: "32px",
              padding: "48px 28px",
              boxShadow: "0 18px 45px rgba(43,30,26,0.06)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "78px",
                height: "78px",
                margin: "0 auto 18px",
                borderRadius: "24px",
                background: "rgba(214,106,78,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "34px",
              }}
            >
              ✨
            </div>

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
              Start here
            </div>

            <h2
              style={{
                margin: "0 0 12px",
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(34px, 5vw, 48px)",
                lineHeight: 1,
                color: "#2B1E1A",
              }}
            >
              Create your first Event Vault
            </h2>

            <p
              style={{
                margin: "0 auto 22px",
                maxWidth: "640px",
                color: "#6B625E",
                fontSize: "17px",
                lineHeight: 1.8,
              }}
            >
              Set up a private page for a wedding, birthday, graduation, baby shower,
              or any moment worth keeping. Guests can leave messages in seconds.
            </p>

            <a
              href="/events/new"
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#D66A4E",
                color: "#FFFFFF",
                padding: "14px 24px",
                borderRadius: "999px",
                fontSize: "15px",
                fontWeight: 700,
                boxShadow: "0 14px 32px rgba(214,106,78,0.22)",
              }}
            >
              Create Your First Event
            </a>
          </section>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {events.map((event) => {
              const status = statusStyles(event.status);
              const publicLink =
                typeof window !== "undefined"
                  ? `${window.location.origin}/e/${event.short_code}`
                  : `/e/${event.short_code}`;

              return (
                <article
                  key={event.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(43,30,26,0.08)",
                    borderRadius: "26px",
                    padding: "22px",
                    boxShadow: "0 18px 45px rgba(43,30,26,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "18px",
                          background: "rgba(214,106,78,0.10)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          flexShrink: 0,
                        }}
                      >
                        {EVENT_TYPE_EMOJIS[event.event_type] || "✨"}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <h3
                          style={{
                            margin: "0 0 6px",
                            fontFamily: "Cormorant Garamond, serif",
                            fontSize: "34px",
                            lineHeight: 0.95,
                            color: "#2B1E1A",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {event.event_name}
                        </h3>

                        <div
                          style={{
                            color: "#6B625E",
                            fontSize: "14px",
                          }}
                        >
                          {EVENT_TYPE_LABELS[event.event_type] || "Event"} ·{" "}
                          {formatDate(event.event_date)}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        ...status,
                      }}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        background: "#FCFBF9",
                        border: "1px solid rgba(43,30,26,0.06)",
                        borderRadius: "18px",
                        padding: "14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6B625E",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: ".04em",
                        }}
                      >
                        Messages
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: 700,
                          color: "#2B1E1A",
                        }}
                      >
                        {event.submission_count || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#FCFBF9",
                        border: "1px solid rgba(43,30,26,0.06)",
                        borderRadius: "18px",
                        padding: "14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6B625E",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: ".04em",
                        }}
                      >
                        Short Code
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#2B1E1A",
                          wordBreak: "break-word",
                        }}
                      >
                        {event.short_code}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#FCFBF9",
                      border: "1px solid rgba(43,30,26,0.06)",
                      borderRadius: "18px",
                      padding: "14px",
                      color: "#6B625E",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      wordBreak: "break-all",
                    }}
                  >
                    {publicLink}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={`/events/${event.id}`}
                      style={{
                        flex: "1 1 160px",
                        textAlign: "center",
                        textDecoration: "none",
                        background: "#D66A4E",
                        color: "#FFFFFF",
                        padding: "13px 16px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        fontWeight: 700,
                        boxShadow: "0 10px 24px rgba(214,106,78,0.18)",
                      }}
                    >
                      View My Event
                    </a>

                    <button
                      onClick={() => copyLink(event.short_code)}
                      style={{
                        flex: "1 1 140px",
                        background: copied === event.short_code ? "#D8B56A" : "transparent",
                        color: "#2B1E1A",
                        border: "1px solid rgba(43,30,26,0.14)",
                        padding: "13px 16px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {copied === event.short_code ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
