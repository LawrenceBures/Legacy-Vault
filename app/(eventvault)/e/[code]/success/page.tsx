"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PublicEvent = {
  event_name: string;
  event_type: string;
  thank_you_message: string | null;
  delivery_date: string | null;
};

export default function SuccessPage() {
  const params = useParams();
  const code = params.code as string;

  const [event, setEvent] = useState<PublicEvent | null>(null);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/public/events/${code}`)
      .then((r) => r.json())
      .then((data) => { if (!data.error) setEvent(data); })
      .catch(() => {});
  }, [code]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
        .sc-root{min-height:100vh;background:#F5F3EF;font-family:'DM Sans',sans-serif;font-weight:300;color:#2B1E1A;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px 80px}
        .sc-logo{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500;color:#6B6B6B;letter-spacing:.04em;margin-bottom:48px;text-decoration:none}
        .sc-logo span{color:#D66A4E}
        .sc-card{background:white;border-radius:24px;padding:52px 48px;width:100%;max-width:480px;box-shadow:0 40px 80px rgba(43,30,26,.10);text-align:center}
        .sc-ornament{font-family:'Cormorant Garamond',serif;font-size:52px;color:#D8B56A;display:block;margin-bottom:20px;line-height:1;animation:scFadeIn .8s ease both}
        .sc-heading{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,4vw,38px);font-weight:400;line-height:1.15;color:#2B1E1A;margin-bottom:8px;animation:scFadeIn .8s .1s ease both;opacity:0}
        .sc-subhead{font-size:14px;color:#6B6B6B;line-height:1.7;margin-bottom:28px;animation:scFadeIn .8s .2s ease both;opacity:0}
        .sc-divider{width:60px;height:2px;background:#D8B56A;margin:0 auto 28px;animation:scFadeIn .8s .3s ease both;opacity:0}
        .sc-thank-you{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:18px;line-height:1.65;color:#2B1E1A;border-left:3px solid #D66A4E;padding-left:18px;text-align:left;margin-bottom:28px;animation:scFadeIn .8s .35s ease both;opacity:0}
        .sc-delivery{font-size:14px;color:#6B6B6B;line-height:1.6;margin-bottom:32px;animation:scFadeIn .8s .4s ease both;opacity:0}
        .sc-delivery strong{color:#2B1E1A;font-weight:500}
        .sc-btn-back{display:inline-block;border:1.5px solid rgba(43,30,26,.15);color:#2B1E1A;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:400;padding:12px 32px;border-radius:100px;text-decoration:none;transition:all .22s;animation:scFadeIn .8s .5s ease both;opacity:0}
        .sc-btn-back:hover{border-color:#D66A4E;color:#D66A4E}
        @keyframes scFadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

        .sc-upsell{margin-top:40px;text-align:center;animation:scFadeIn .8s .7s ease both;opacity:0}
        .sc-upsell-text{font-size:14px;color:#6B6B6B;margin-bottom:6px}
        .sc-upsell-link{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;color:#D66A4E;text-decoration:none;border-bottom:1px solid rgba(214,106,78,.3);padding-bottom:1px;transition:border-color .2s}
        .sc-upsell-link:hover{border-color:#D66A4E}

        .sc-powered{font-size:11px;color:rgba(43,30,26,.3);margin-top:48px;font-style:italic;font-family:'Cormorant Garamond',serif;animation:scFadeIn .8s .9s ease both;opacity:0}

        @media(max-width:560px){
          .sc-card{padding:36px 28px;border-radius:16px}
        }
      `}</style>

      <div className="sc-root">
        <a href="/" className="sc-logo">Event<span>Vault</span></a>

        <div className="sc-card">
          <span className="sc-ornament">✦</span>

          <h1 className="sc-heading">
            Your message<br />has been saved.
          </h1>

          <p className="sc-subhead">
            It's safe with us and will be delivered<br />
            to {event?.event_name || "the host"} on the date they choose.
          </p>

          <div className="sc-divider" />

          {event?.thank_you_message && (
            <p className="sc-thank-you">
              "{event.thank_you_message}"
            </p>
          )}

          {event?.delivery_date && (
            <p className="sc-delivery">
              All messages will be received on{" "}
              <strong>{formatDate(event.delivery_date)}</strong>.
            </p>
          )}

          <a href={`/e/${code}`} className="sc-btn-back">
            ← Back to event page
          </a>
        </div>

        <div className="sc-upsell">
          <p className="sc-upsell-text">Want to preserve your own legacy?</p>
          <a href="/event-vault" className="sc-upsell-link">
            Create your own Event Vault →
          </a>
        </div>

        <p className="sc-powered">Powered by Event Vault</p>
      </div>
    </>
  );
}
