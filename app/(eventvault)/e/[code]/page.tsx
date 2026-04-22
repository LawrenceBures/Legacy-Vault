"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EVENT_TYPE_EMOJIS, EVENT_TYPE_LABELS } from "@/lib/eventVaultConstants";

type PublicEvent = {
  id: string;
  event_type: string;
  event_name: string;
  event_date: string | null;
  guest_message: string | null;
  short_code: string;
  status: string;
  allow_gifts: boolean;
  submission_deadline: string | null;
  thank_you_message: string | null;
  submission_count: number;
};

export default function PublicEventPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/public/events/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setEvent(data);
      })
      .catch(() => setError("Something went wrong"))
      .finally(() => setLoading(false));
  }, [code]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
        .ep-root{min-height:100vh;background:#F5F3EF;font-family:'DM Sans',sans-serif;font-weight:300;color:#2B1E1A;display:flex;flex-direction:column;align-items:center;padding:32px 20px 60px}
        .ep-logo{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500;color:#6B6B6B;letter-spacing:.04em;margin-bottom:48px;text-decoration:none}
        .ep-logo span{color:#D66A4E}
        .ep-card{background:white;border-radius:24px;padding:52px 48px;width:100%;max-width:480px;box-shadow:0 40px 80px rgba(43,30,26,.10);text-align:center}
        .ep-type{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px}
        .ep-event-name{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,5vw,52px);font-weight:400;line-height:1.05;color:#2B1E1A;margin-bottom:8px;letter-spacing:-.01em}
        .ep-date{font-size:14px;color:#6B6B6B;margin-bottom:28px}
        .ep-divider{width:100%;height:1px;background:rgba(43,30,26,.08);margin:0 0 28px}
        .ep-message{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:18px;line-height:1.6;color:#2B1E1A;border-left:3px solid #D66A4E;padding-left:18px;text-align:left;margin-bottom:28px}
        .ep-proof{font-size:13px;color:#6B6B6B;margin-bottom:28px}
        .ep-proof strong{color:#2B1E1A;font-weight:500}
        .ep-btn{display:block;width:100%;background:#D66A4E;color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;letter-spacing:.03em;padding:18px;border-radius:100px;border:none;cursor:pointer;transition:all .25s;box-shadow:0 8px 28px rgba(214,106,78,.32);text-decoration:none}
        .ep-btn:hover{background:#B85438;transform:translateY(-2px);box-shadow:0 16px 40px rgba(214,106,78,.4)}
        .ep-gifts{font-size:12px;color:#6B6B6B;margin-top:14px;display:flex;align-items:center;justify-content:center;gap:6px}
        .ep-powered{font-size:11px;color:rgba(43,30,26,.3);margin-top:48px;font-style:italic;font-family:'Cormorant Garamond',serif}
        .ep-powered a{color:rgba(43,30,26,.4);text-decoration:none}
        .ep-powered a:hover{color:#D66A4E}
        .ep-error{text-align:center;padding:80px 24px}
        .ep-error h2{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:400;margin-bottom:12px}
        .ep-error p{font-size:15px;color:#6B6B6B}
        .ep-loading{display:flex;align-items:center;justify-content:center;min-height:60vh}
        .ep-spinner{width:36px;height:36px;border:2px solid rgba(214,106,78,.2);border-top-color:#D66A4E;border-radius:50%;animation:epSpin .8s linear infinite}
        @keyframes epSpin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="ep-root">
        <a href="/" className="ep-logo">Event<span>Vault</span></a>

        {loading && (
          <div className="ep-loading">
            <div className="ep-spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="ep-error">
            <h2>This event isn't available</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && event && (
          <>
            <div className="ep-card">
              <div className="ep-type">
                <span>{EVENT_TYPE_EMOJIS[event.event_type] || "✦"}</span>
                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
              </div>

              <h1 className="ep-event-name">{event.event_name}</h1>

              {event.event_date && (
                <p className="ep-date">{formatDate(event.event_date)}</p>
              )}

              {event.guest_message && (
                <>
                  <div className="ep-divider" />
                  <p className="ep-message">"{event.guest_message}"</p>
                </>
              )}

              {event.submission_count > 0 && (
                <p className="ep-proof">
                  <strong>{event.submission_count}</strong>{" "}
                  {event.submission_count === 1 ? "person has" : "people have"} left a message
                </p>
              )}

              <div className="ep-divider" />

              <a
                href={`/e/${code}/submit`}
                className="ep-btn"
              >
                Leave a Message ✦
              </a>

              {event.allow_gifts && (
                <p className="ep-gifts">🎁 Gifts welcome</p>
              )}
            </div>

            <p className="ep-powered">
              Powered by <a href="/event-vault">Event Vault</a>
            </p>
          </>
        )}
      </div>
    </>
  );
}
