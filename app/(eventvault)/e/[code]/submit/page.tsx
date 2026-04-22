"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EVENT_TYPE_EMOJIS } from "@/lib/eventVaultConstants";

type PublicEvent = {
  id: string;
  event_type: string;
  event_name: string;
  allow_gifts: boolean;
  thank_you_message: string | null;
  short_code: string;
};

type MessageType = "text" | "audio" | "video";

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("text");
  const [textContent, setTextContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    setFormError(null);

    if (!guestName.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (messageType === "text" && !textContent.trim()) {
      setFormError("Please write your message.");
      return;
    }
    if (messageType === "text" && textContent.length > 5000) {
      setFormError("Message cannot exceed 5,000 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/events/${code}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName,
          guest_email: guestEmail || null,
          message_type: messageType,
          text_content: messageType === "text" ? textContent : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Something went wrong. Please try again.");
        return;
      }

      router.push(`/e/${code}/success`);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
        .sp-root{min-height:100vh;background:#F5F3EF;font-family:'DM Sans',sans-serif;font-weight:300;color:#2B1E1A;display:flex;flex-direction:column;align-items:center;padding:32px 20px 80px}
        .sp-logo{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500;color:#6B6B6B;letter-spacing:.04em;margin-bottom:16px;text-decoration:none}
        .sp-logo span{color:#D66A4E}
        .sp-back{font-size:13px;color:#6B6B6B;text-decoration:none;display:flex;align-items:center;gap:6px;margin-bottom:32px;transition:color .2s}
        .sp-back:hover{color:#D66A4E}
        .sp-card{background:white;border-radius:24px;padding:48px;width:100%;max-width:520px;box-shadow:0 24px 60px rgba(43,30,26,.08)}
        .sp-heading{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,4vw,38px);font-weight:400;line-height:1.1;margin-bottom:6px}
        .sp-heading em{font-style:italic;color:#D66A4E}
        .sp-subhead{font-size:14px;color:#6B6B6B;margin-bottom:32px;line-height:1.6}
        .sp-divider{width:100%;height:1px;background:rgba(43,30,26,.08);margin:0 0 28px}
        .sp-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6B6B6B;display:block;margin-bottom:8px}
        .sp-input{width:100%;height:48px;border:1px solid rgba(43,30,26,.12);border-radius:12px;padding:0 16px;font-family:'DM Sans',sans-serif;font-size:15px;color:#2B1E1A;background:white;outline:none;transition:border-color .2s,box-shadow .2s;margin-bottom:20px}
        .sp-input:focus{border-color:#D66A4E;box-shadow:0 0 0 3px rgba(214,106,78,.1)}
        .sp-input::placeholder{color:rgba(43,30,26,.3)}
        .sp-field{margin-bottom:20px}
        .sp-optional{font-size:11px;color:#6B6B6B;margin-left:6px;font-style:italic}

        /* type selector */
        .sp-type-selector{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
        .sp-type-card{border:1.5px solid rgba(43,30,26,.1);border-radius:14px;padding:16px 12px;text-align:center;cursor:pointer;transition:all .22s;background:white}
        .sp-type-card:hover{border-color:#D66A4E;background:rgba(214,106,78,.04)}
        .sp-type-card.selected{border-color:#D66A4E;background:rgba(214,106,78,.06)}
        .sp-type-icon{font-size:26px;display:block;margin-bottom:6px}
        .sp-type-label{font-size:12px;font-weight:500;color:#2B1E1A}

        /* textarea */
        .sp-textarea{width:100%;border:1px solid rgba(43,30,26,.12);border-radius:12px;padding:14px 16px;font-family:'DM Sans',sans-serif;font-size:15px;color:#2B1E1A;background:white;outline:none;resize:none;min-height:180px;line-height:1.7;transition:border-color .2s,box-shadow .2s}
        .sp-textarea:focus{border-color:#D66A4E;box-shadow:0 0 0 3px rgba(214,106,78,.1)}
        .sp-textarea::placeholder{color:rgba(43,30,26,.3)}
        .sp-char-count{text-align:right;font-size:11px;color:#6B6B6B;margin-top:6px;margin-bottom:20px}
        .sp-char-count.over{color:#E53E3E}

        /* recording placeholder */
        .sp-record-box{border:1.5px dashed rgba(43,30,26,.15);border-radius:14px;padding:40px 24px;text-align:center;margin-bottom:20px;background:rgba(245,243,239,.5)}
        .sp-record-icon{font-size:40px;display:block;margin-bottom:14px}
        .sp-record-btn{display:inline-block;background:#D66A4E;color:white;font-size:13px;font-weight:500;padding:11px 28px;border-radius:100px;border:none;cursor:pointer;margin-bottom:10px;transition:all .22s}
        .sp-record-btn:hover{background:#B85438}
        .sp-record-or{font-size:13px;color:#6B6B6B;display:block;margin-bottom:10px}
        .sp-record-upload{font-size:13px;color:#D66A4E;text-decoration:underline;cursor:pointer;background:none;border:none}
        .sp-record-limit{font-size:11px;color:#6B6B6B;margin-top:8px;letter-spacing:.04em}

        /* error */
        .sp-error{background:rgba(229,62,62,.06);border:1px solid rgba(229,62,62,.2);border-radius:10px;padding:12px 16px;font-size:13px;color:#C53030;margin-bottom:20px}

        /* submit button */
        .sp-btn{width:100%;background:#D66A4E;color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;letter-spacing:.03em;padding:17px;border-radius:100px;border:none;cursor:pointer;transition:all .25s;box-shadow:0 8px 28px rgba(214,106,78,.32)}
        .sp-btn:hover:not(:disabled){background:#B85438;transform:translateY(-1px);box-shadow:0 14px 36px rgba(214,106,78,.4)}
        .sp-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}

        .sp-powered{font-size:11px;color:rgba(43,30,26,.3);margin-top:32px;font-style:italic;font-family:'Cormorant Garamond',serif}

        .sp-loading{display:flex;align-items:center;justify-content:center;min-height:60vh}
        .sp-spinner{width:36px;height:36px;border:2px solid rgba(214,106,78,.2);border-top-color:#D66A4E;border-radius:50%;animation:spSpin .8s linear infinite}
        @keyframes spSpin{to{transform:rotate(360deg)}}

        @media(max-width:560px){
          .sp-card{padding:32px 24px;border-radius:16px}
        }
      `}</style>

      <div className="sp-root">
        <a href="/" className="sp-logo">Event<span>Vault</span></a>

        {!loading && event && (
          <a href={`/e/${code}`} className="sp-back">
            ← {event.event_name}
          </a>
        )}

        {loading && (
          <div className="sp-loading"><div className="sp-spinner" /></div>
        )}

        {!loading && error && (
          <div style={{textAlign:"center",padding:"80px 24px"}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",marginBottom:"12px"}}>This event isn't available</p>
            <p style={{fontSize:"15px",color:"#6B6B6B"}}>{error}</p>
          </div>
        )}

        {!loading && event && (
          <div className="sp-card">
            <h1 className="sp-heading">
              Leave your message<br />
              for <em>{event.event_name}.</em>
            </h1>
            <p className="sp-subhead">
              {EVENT_TYPE_EMOJIS[event.event_type]} Your message will be privately saved and delivered to the host.
            </p>
            <div className="sp-divider" />

            {/* Name */}
            <div className="sp-field">
              <label className="sp-label">Your name *</label>
              <input
                className="sp-input"
                placeholder="e.g. Grandma Rose"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="sp-field">
              <label className="sp-label">
                Your email <span className="sp-optional">optional</span>
              </label>
              <input
                className="sp-input"
                type="email"
                placeholder="We'll confirm your message was saved"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>

            <div className="sp-divider" />

            {/* Message type */}
            <label className="sp-label">How would you like to share?</label>
            <div className="sp-type-selector">
              {([
                {type:"text" as MessageType, icon:"✍️", label:"Write"},
                {type:"video" as MessageType, icon:"📹", label:"Video"},
                {type:"audio" as MessageType, icon:"🎙", label:"Voice"},
              ]).map((t) => (
                <div
                  key={t.type}
                  className={`sp-type-card${messageType === t.type ? " selected" : ""}`}
                  onClick={() => setMessageType(t.type)}
                >
                  <span className="sp-type-icon">{t.icon}</span>
                  <span className="sp-type-label">{t.label}</span>
                </div>
              ))}
            </div>

            {/* Dynamic input */}
            {messageType === "text" && (
              <>
                <textarea
                  className="sp-textarea"
                  placeholder="Write your message here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  maxLength={5000}
                />
                <div className={`sp-char-count${textContent.length > 4800 ? " over" : ""}`}>
                  {textContent.length} / 5,000
                </div>
              </>
            )}

            {messageType === "video" && (
              <div className="sp-record-box">
                <span className="sp-record-icon">📹</span>
                <button className="sp-record-btn">Start Recording</button>
                <span className="sp-record-or">or</span>
                <button className="sp-record-upload">upload a file</button>
                <p className="sp-record-limit">Max 5 minutes · 150MB · MP4, WebM, MOV</p>
              </div>
            )}

            {messageType === "audio" && (
              <div className="sp-record-box">
                <span className="sp-record-icon">🎙</span>
                <button className="sp-record-btn">Start Recording</button>
                <span className="sp-record-or">or</span>
                <button className="sp-record-upload">upload a file</button>
                <p className="sp-record-limit">Max 10 minutes · 50MB · MP3, M4A, WebM</p>
              </div>
            )}

            {formError && (
              <div className="sp-error">{formError}</div>
            )}

            <button
              className="sp-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving your message..." : "Send My Message ✦"}
            </button>
          </div>
        )}

        <p className="sp-powered">Powered by Event Vault</p>
      </div>
    </>
  );
}
