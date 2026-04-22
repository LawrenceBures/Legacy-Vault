"use client";
import { useState } from "react";
import EventVaultDemo from "./demo";
import Link from "next/link";

export default function EventVaultLanding() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ev-root *,.ev-root *::before,.ev-root *::after{box-sizing:border-box;margin:0;padding:0}
        .ev-root{font-family:'DM Sans',sans-serif;font-weight:300;color:#2B1E1A;background:#F5F3EF;overflow-x:hidden}

        /* NAV */
        .ev-nav{display:flex;align-items:center;justify-content:space-between;padding:22px 64px;border-bottom:1px solid rgba(43,30,26,0.08);background:rgba(245,243,239,0.95);backdrop-filter:blur(12px);position:sticky;top:0;z-index:300}
        .ev-logo{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;letter-spacing:.02em;color:#2B1E1A;text-decoration:none}
        .ev-logo span{color:#D66A4E}
        .ev-nav-links{display:flex;align-items:center;gap:32px}
        .ev-nav-link{font-size:13px;color:#6B6B6B;text-decoration:none;transition:color .2s}
        .ev-nav-link:hover{color:#2B1E1A}
        .ev-btn-nav{background:#D66A4E;color:white;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;padding:10px 28px;border-radius:100px;text-decoration:none;border:none;cursor:pointer;transition:all .22s;box-shadow:0 4px 14px rgba(214,106,78,0.28)}
        .ev-btn-nav:hover{background:#B85438;transform:translateY(-1px);box-shadow:0 8px 22px rgba(214,106,78,0.35)}

        /* TICKER */
        .ev-ticker{background:#2B1E1A;overflow:hidden;padding:12px 0;display:flex}
        .ev-ticker-track{display:flex;animation:evTick 40s linear infinite;white-space:nowrap}
        .ev-ticker-track:hover{animation-play-state:paused}
        @keyframes evTick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .ev-tick-item{display:inline-flex;align-items:center;gap:8px;padding:0 26px;color:rgba(255,255,255,.48);font-size:11px;letter-spacing:.09em;text-transform:uppercase}
        .ev-tick-item span{font-size:14px}
        .ev-tick-sep{color:#D66A4E;font-size:12px;opacity:.65;flex-shrink:0;padding:0 2px}

        /* HERO */
        .ev-hero{display:grid;grid-template-columns:55% 45%;min-height:92vh;position:relative;overflow:hidden}
        .ev-hero-left{background:#D66A4E;padding:80px 68px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
        .ev-hero-left::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,.035) 40px,rgba(255,255,255,.035) 41px);pointer-events:none}
        .ev-hero-left::after{content:'VAULT';position:absolute;bottom:-44px;right:-16px;font-family:'Cormorant Garamond',serif;font-size:210px;font-weight:600;color:rgba(255,255,255,.05);line-height:1;letter-spacing:-6px;pointer-events:none}
        .ev-hero-glow{position:absolute;top:-100px;right:-80px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);pointer-events:none}
        .ev-hero-badge{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:6px 14px;border-radius:4px;margin-bottom:44px;width:fit-content}
        .ev-hero-badge::before{content:'✦';font-size:9px;color:#D8B56A}
        .ev-hero-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(52px,5.5vw,86px);font-weight:400;line-height:1.0;color:white;letter-spacing:-.02em}
        .ev-hero-h1 em{font-style:italic;color:#EDD08A}
        .ev-hero-desc{font-size:16px;line-height:1.78;color:rgba(255,255,255,.68);max-width:380px;margin-bottom:40px}
        .ev-btn-hero{display:inline-block;background:white;color:#D66A4E;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;letter-spacing:.05em;padding:15px 44px;border-radius:100px;text-decoration:none;transition:all .25s;box-shadow:0 8px 28px rgba(0,0,0,.16);width:fit-content;border:none;cursor:pointer}
        .ev-btn-hero:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(0,0,0,.22)}

        /* HERO RIGHT */
        .ev-hero-right{background:#F7EDE2;padding:56px 48px;display:flex;flex-direction:column;justify-content:center;gap:14px}
        .ev-hr-eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;margin-bottom:4px}
        .ev-card{background:white;border-radius:14px;padding:20px 24px;display:flex;align-items:center;gap:18px;box-shadow:0 3px 14px rgba(43,30,26,.055);border:1px solid rgba(43,30,26,.04);border-left:3px solid transparent;transition:all .25s;cursor:pointer}
        .ev-card:hover{border-left-color:#D66A4E;transform:translateX(5px);box-shadow:0 8px 28px rgba(214,106,78,.12)}
        .ev-card.active{border-left-color:#D8B56A}
        .ev-card-icon{width:46px;height:46px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
        .ic-sunset{background:rgba(214,106,78,.1)}
        .ic-gold{background:rgba(216,181,106,.15)}
        .ic-warm{background:rgba(245,160,122,.12)}
        .ic-rose{background:rgba(220,120,120,.1)}
        .ev-card-info{flex:1;min-width:0}
        .ev-card-type{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#6B6B6B;margin-bottom:3px}
        .ev-card-name{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:500;color:#2B1E1A;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ev-card-stats{font-size:12px;color:#6B6B6B}
        .ev-card-arrow{color:#D66A4E;font-size:16px;opacity:0;transition:opacity .2s;flex-shrink:0}
        .ev-card:hover .ev-card-arrow{opacity:1}

        /* STAT STRIP */
        .ev-stat-strip{display:flex;overflow:hidden;border-top:1px solid rgba(43,30,26,0.08);border-bottom:1px solid rgba(43,30,26,0.08)}
        .ev-stat-item{flex:1;padding:32px 20px;border-right:1px solid rgba(43,30,26,0.08);text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center}
        .ev-stat-item:last-child{border-right:none}
        .ev-stat-item:nth-child(odd){background:#F5F3EF}
        .ev-stat-item:nth-child(even){background:rgba(216,181,106,0.15)}
        .ev-stat-num{font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:400;color:#2B1E1A;display:block;line-height:1;margin-bottom:6px}
        .ev-stat-num.word{font-size:30px;font-style:italic}
        .ev-stat-label{font-size:12px;color:#6B6B6B;letter-spacing:.04em;line-height:1.4}
        .ev-icon-pyramid{display:flex;flex-direction:column;align-items:center;gap:3px;margin-bottom:10px}
        .ev-pyramid-row{display:flex;gap:5px;align-items:center;justify-content:center}
        .ev-p-icon{font-size:22px;line-height:1}

        /* HOW IT WORKS */
        .ev-hiw{padding:120px 64px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .ev-eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#D66A4E;margin-bottom:20px;display:flex;align-items:center;gap:10px}
        .ev-eyebrow::before{content:'';width:24px;height:1px;background:#D66A4E}
        .ev-hiw-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(38px,4vw,56px);font-weight:400;line-height:1.1;margin-bottom:20px}
        .ev-hiw-h2 em{font-style:italic;color:#D66A4E}
        .ev-hiw-p{font-size:15px;line-height:1.78;color:rgba(43,30,26,.58);max-width:380px}
        .ev-hiw-steps{display:flex;flex-direction:column}
        .ev-hiw-step{padding:30px 0;border-bottom:1px solid rgba(43,30,26,0.08);display:flex;gap:24px;align-items:flex-start;transition:all .2s}
        .ev-hiw-step:first-child{padding-top:0}
        .ev-hiw-step:last-child{border-bottom:none}
        .ev-hiw-step:hover .ev-step-circle{background:#D66A4E;color:white;border-color:#D66A4E}
        .ev-step-circle{width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(43,30,26,0.15);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:500;color:#2B1E1A;flex-shrink:0;transition:all .25s}
        .ev-step-h{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:500;margin-bottom:6px}
        .ev-step-p{font-size:14px;line-height:1.68;color:rgba(43,30,26,.55)}

        /* OCCASIONS */
        .ev-occasions{background:#F7EDE2;padding:120px 64px}
        .ev-occ-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:52px}
        .ev-occ-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(38px,4vw,56px);font-weight:400;line-height:1.1}
        .ev-occ-h2 em{font-style:italic;color:#D66A4E}
        .ev-occ-sub{font-size:14px;color:#6B6B6B;max-width:200px;text-align:right;line-height:1.6}
        .ev-occ-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .ev-occ-tile{background:white;border-radius:16px;padding:28px 24px;transition:all .28s;cursor:pointer;border:1px solid rgba(43,30,26,.04)}
        .ev-occ-tile:hover{background:#D66A4E;transform:translateY(-5px);box-shadow:0 20px 44px rgba(214,106,78,.22);border-color:transparent}
        .ev-occ-tile:hover .ev-occ-name,.ev-occ-tile:hover .ev-occ-desc{color:white}
        .ev-occ-emoji{font-size:34px;display:block;margin-bottom:14px}
        .ev-occ-name{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500;color:#2B1E1A;margin-bottom:5px;transition:color .25s}
        .ev-occ-desc{font-size:12px;color:rgba(43,30,26,.48);line-height:1.5;transition:color .25s}

        /* UPGRADE SECTION */
        .ev-upgrade{padding:120px 64px;background:#F5F3EF;position:relative;overflow:hidden}
        .ev-upgrade::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 60% 40%,rgba(216,181,106,.12) 0%,transparent 65%);pointer-events:none}
        .ev-upgrade-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;position:relative;z-index:2}
        .ev-upgrade-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,4vw,54px);font-weight:400;line-height:1.1;margin-bottom:16px}
        .ev-upgrade-h2 em{font-style:italic;color:#D8B56A}
        .ev-upgrade-p{font-size:15px;line-height:1.78;color:rgba(43,30,26,.58);max-width:380px;margin-bottom:36px}
        .ev-price-display{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}
        .ev-price-num{font-family:'Cormorant Garamond',serif;font-size:56px;font-weight:400;color:#2B1E1A;line-height:1}
        .ev-price-per{font-size:15px;color:#6B6B6B}
        .ev-price-note{font-size:12px;color:#6B6B6B;letter-spacing:.04em;margin-bottom:36px}
        .ev-btn-outline{display:inline-block;background:transparent;border:1.5px solid #D66A4E;color:#D66A4E;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:.05em;padding:12px 36px;border-radius:100px;text-decoration:none;cursor:pointer;transition:all .22s}
        .ev-btn-outline:hover{background:#D66A4E;color:white;box-shadow:0 8px 24px rgba(214,106,78,.3)}
        .ev-benefit-chips{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:36px}
        .ev-benefit-chip{display:flex;align-items:flex-start;gap:10px;background:white;border-radius:10px;padding:14px 16px;border:1px solid rgba(43,30,26,.06)}
        .ev-benefit-icon{font-size:20px;flex-shrink:0;line-height:1;margin-top:2px}
        .ev-benefit-title{font-size:13px;font-weight:500;color:#2B1E1A;margin-bottom:2px}
        .ev-benefit-desc{font-size:12px;color:#6B6B6B;line-height:1.4}

        /* UPGRADE PREVIEW CARD */
        .ev-upgrade-preview{background:white;border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(43,30,26,.1);border:1px solid rgba(43,30,26,.06)}
        .ev-up-header{background:linear-gradient(135deg,#D66A4E 0%,#B85438 100%);padding:28px 32px;position:relative;overflow:hidden}
        .ev-up-header::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.07)}
        .ev-up-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(216,181,106,.25);border:1px solid rgba(216,181,106,.4);color:#EDD08A;font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:12px}
        .ev-up-badge::before{content:'✦';font-size:8px}
        .ev-up-name{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:500;color:white;margin-bottom:4px;line-height:1.2}
        .ev-up-meta{font-size:12px;color:rgba(255,255,255,.55)}
        .ev-up-body{padding:24px 32px}
        .ev-up-stats{display:flex;gap:24px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(43,30,26,0.08)}
        .ev-up-stat-num{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:400;color:#2B1E1A;display:block;line-height:1}
        .ev-up-stat-lbl{font-size:11px;color:#6B6B6B;letter-spacing:.06em;text-transform:uppercase}
        .ev-up-msg{background:#F5F3EF;border-radius:10px;padding:14px 16px;margin-bottom:10px;border-left:3px solid #D66A4E}
        .ev-up-msg.gold{border-left-color:#D8B56A;margin-bottom:0}
        .ev-up-msg-from{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6B6B6B;margin-bottom:4px}
        .ev-up-msg-text{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;color:#2B1E1A;line-height:1.5}
        .ev-gift-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(216,181,106,.15);color:#8B6914;font-size:11px;font-weight:500;padding:3px 10px;border-radius:100px;margin-top:6px}

        /* CTA SECTION */
        .ev-cta{padding:120px 64px;background:#2B1E1A;text-align:center;position:relative;overflow:hidden}
        .ev-cta::before{content:'"';position:absolute;top:-80px;left:50%;transform:translateX(-50%);font-family:'Cormorant Garamond',serif;font-size:440px;font-weight:400;color:rgba(214,106,78,.05);line-height:1;pointer-events:none}
        .ev-cta-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(44px,5vw,74px);font-weight:400;line-height:1.05;color:white;margin-bottom:16px;position:relative}
        .ev-cta-h2 em{font-style:italic;color:#F5A07A}
        .ev-cta-p{font-size:16px;color:rgba(255,255,255,.42);max-width:420px;margin:0 auto 48px;line-height:1.75;position:relative}
        .ev-btn-cta{display:inline-block;background:#D66A4E;color:white;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;letter-spacing:.04em;padding:17px 56px;border-radius:100px;text-decoration:none;transition:all .25s;position:relative;box-shadow:0 8px 32px rgba(214,106,78,.45);border:none;cursor:pointer}
        .ev-btn-cta:hover{background:#B85438;transform:translateY(-2px);box-shadow:0 16px 48px rgba(214,106,78,.5)}
        .ev-btn-cta-sec{display:block;margin-top:18px;font-size:13px;color:rgba(255,255,255,.3);text-decoration:none;letter-spacing:.06em;transition:color .2s;background:none;border:none;cursor:pointer;width:100%}
        .ev-btn-cta-sec:hover{color:rgba(255,255,255,.6)}

        /* FOOTER */
        .ev-footer{background:#2B1E1A;border-top:1px solid rgba(255,255,255,.06);padding:36px 64px;display:flex;align-items:center;justify-content:space-between}
        .ev-fl{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500;color:white}
        .ev-fl span{color:#D66A4E}
        .ev-fc{font-size:11px;color:rgba(255,255,255,.2);letter-spacing:.06em}
        .ev-fr{font-size:11px;color:rgba(255,255,255,.2);font-style:italic;font-family:'Cormorant Garamond',serif}

        /* MODAL */
        .ev-modal-backdrop{position:fixed;inset:0;z-index:500;background:rgba(43,30,26,.65);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .35s ease}
        .ev-modal-backdrop.open{opacity:1;pointer-events:all}
        .ev-modal{background:white;border-radius:24px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;box-shadow:0 40px 100px rgba(43,30,26,.25);transform:translateY(24px) scale(.97);transition:all .35s cubic-bezier(.22,1,.36,1);position:relative}
        .ev-modal-backdrop.open .ev-modal{transform:translateY(0) scale(1)}
        .ev-modal-close{position:absolute;top:20px;right:20px;width:36px;height:36px;border-radius:50%;background:#F5F3EF;border:none;cursor:pointer;font-size:16px;color:#6B6B6B;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:10}
        .ev-modal-close:hover{background:#F7EDE2;color:#2B1E1A}
        .ev-modal-header{background:linear-gradient(135deg,#D66A4E 0%,#B85438 100%);padding:44px 48px 36px;border-radius:24px 24px 0 0;position:relative;overflow:hidden}
        .ev-modal-header::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none}
        .ev-modal-kicker{display:inline-flex;align-items:center;gap:6px;background:rgba(216,181,106,.2);border:1px solid rgba(216,181,106,.35);color:#EDD08A;font-size:10px;letter-spacing:.16em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:16px;position:relative}
        .ev-modal-kicker::before{content:'✦';font-size:9px}
        .ev-modal-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,3.5vw,40px);font-weight:400;line-height:1.1;color:white;margin-bottom:10px;position:relative}
        .ev-modal-h1 em{font-style:italic;color:#EDD08A}
        .ev-modal-sub{font-size:15px;line-height:1.7;color:rgba(255,255,255,.62);max-width:440px;position:relative}
        .ev-modal-body{padding:36px 48px 44px}

        /* VAULT PREVIEW */
        .ev-vault-preview{background:#F5F3EF;border-radius:16px;padding:20px 24px;margin-bottom:28px;border:1px solid rgba(43,30,26,0.08)}
        .ev-vp-label{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;margin-bottom:14px}
        .ev-vp-messages{display:flex;flex-direction:column;gap:8px}
        .ev-vp-msg{background:white;border-radius:10px;padding:12px 16px;display:flex;align-items:flex-start;gap:12px;border-left:3px solid #D66A4E;box-shadow:0 2px 8px rgba(43,30,26,.05)}
        .ev-vp-msg.gold{border-left-color:#D8B56A}
        .ev-vp-avatar{width:32px;height:32px;border-radius:50%;background:rgba(214,106,78,.1);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:14px;color:#D66A4E;flex-shrink:0;font-weight:500}
        .ev-vp-msg.gold .ev-vp-avatar{background:rgba(216,181,106,.15);color:#8B6914}
        .ev-vp-name{font-size:12px;font-weight:500;color:#2B1E1A;margin-bottom:2px}
        .ev-vp-text{font-size:13px;color:#6B6B6B;line-height:1.5;font-style:italic;font-family:'Cormorant Garamond',serif}
        .ev-vp-gift{display:inline-flex;align-items:center;gap:4px;background:rgba(216,181,106,.15);color:#8B6914;font-size:10px;font-weight:500;padding:2px 8px;border-radius:100px;margin-top:4px}
        .ev-vp-more{text-align:center;font-size:12px;color:#6B6B6B;padding-top:10px;font-style:italic;font-family:'Cormorant Garamond',serif}

        /* BENEFIT GROUPS */
        .ev-benefit-groups{display:flex;flex-direction:column;gap:14px;margin-bottom:32px}
        .ev-benefit-group{background:#F5F3EF;border-radius:14px;padding:18px 20px;display:flex;gap:16px;align-items:flex-start}
        .ev-bg-icon{font-size:24px;flex-shrink:0;margin-top:2px}
        .ev-bg-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:500;color:#2B1E1A;margin-bottom:4px}
        .ev-bg-items{font-size:13px;color:#6B6B6B;line-height:1.65}
        .ev-bg-item::before{content:'· ';color:#D66A4E}

        /* MODAL PRICING */
        .ev-modal-pricing{background:linear-gradient(135deg,rgba(214,106,78,.06),rgba(216,181,106,.08));border:1px solid rgba(214,106,78,.15);border-radius:16px;padding:24px 28px;display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .ev-mp-amount{font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:400;color:#2B1E1A;line-height:1}
        .ev-mp-per{font-size:15px;color:#6B6B6B;margin-left:6px}
        .ev-mp-note{font-size:12px;color:#6B6B6B;letter-spacing:.04em;margin-top:4px}
        .ev-mp-tag{display:inline-block;background:rgba(216,181,106,.15);border:1px solid rgba(216,181,106,.3);color:#8B6914;font-size:11px;font-weight:500;letter-spacing:.06em;padding:5px 14px;border-radius:100px;margin-bottom:6px}
        .ev-mp-sub{font-size:12px;color:#6B6B6B}

        /* MODAL CTAS */
        .ev-modal-ctas{display:flex;flex-direction:column;gap:12px}
        .ev-btn-upgrade{width:100%;background:#D66A4E;color:white;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;letter-spacing:.04em;padding:16px;border-radius:100px;border:none;cursor:pointer;transition:all .25s;box-shadow:0 8px 28px rgba(214,106,78,.38)}
        .ev-btn-upgrade:hover{background:#B85438;transform:translateY(-1px);box-shadow:0 14px 36px rgba(214,106,78,.45)}
        .ev-btn-continue{width:100%;background:transparent;color:#6B6B6B;font-family:'DM Sans',sans-serif;font-size:13px;padding:12px;border-radius:100px;border:none;cursor:pointer;transition:color .2s}
        .ev-btn-continue:hover{color:#2B1E1A}

        /* RESPONSIVE */
        @media(max-width:960px){
          .ev-nav{padding:18px 28px}
          .ev-nav-links .ev-nav-link{display:none}
          .ev-hero{grid-template-columns:1fr}
          .ev-hero-right{display:none}
          .ev-hero-left{padding:72px 32px 60px;min-height:85vh}
          .ev-stat-strip{flex-direction:column}
          .ev-stat-item{border-right:none;border-bottom:1px solid rgba(43,30,26,0.08)}
          .ev-stat-item:last-child{border-bottom:none}
          .ev-hiw{grid-template-columns:1fr;padding:80px 32px;gap:52px}
          .ev-occasions{padding:80px 32px}
          .ev-occ-head{flex-direction:column;align-items:flex-start;gap:12px}
          .ev-occ-sub{text-align:left}
          .ev-occ-grid{grid-template-columns:1fr 1fr}
          .ev-upgrade{padding:80px 32px}
          .ev-upgrade-inner{grid-template-columns:1fr;gap:48px}
          .ev-benefit-chips{grid-template-columns:1fr}
          .ev-cta{padding:80px 32px}
          .ev-footer{flex-direction:column;gap:12px;text-align:center;padding:36px 28px}
          .ev-modal-header{padding:36px 28px 28px}
          .ev-modal-body{padding:28px 28px 36px}
          .ev-modal-pricing{flex-direction:column;gap:16px;align-items:flex-start}
        }
      `}</style>

      <div className="ev-root">
        {/* NAV */}
        <nav className="ev-nav">
          <a href="#" className="ev-logo">Event<span>Vault</span></a>
          <div className="ev-nav-links">
            <a href="#how" className="ev-nav-link">How it works</a>
            <a href="#occasions" className="ev-nav-link">Occasions</a>
            <a href="#pricing" className="ev-nav-link">Pricing</a>
            <button className="ev-btn-nav" onClick={() => setModalOpen(true)}>Create Your Event</button>
          </div>
        </nav>

        {/* TICKER */}
        <div className="ev-ticker">
          <div className="ev-ticker-track">
            {[
              ["💍","Weddings"],["👶","Baby Showers"],["🎓","Graduations"],
              ["🎂","Milestone Birthdays"],["💎","Engagements"],["🌿","Retirements"],
              ["🥂","Anniversaries"],["✦","Any Occasion"],["🎁","Gift Collection"],
              ["📹","Video Messages"],["🎙","Audio Messages"],["✍️","Written Messages"],
              ["💍","Weddings"],["👶","Baby Showers"],["🎓","Graduations"],
              ["🎂","Milestone Birthdays"],["💎","Engagements"],["🌿","Retirements"],
              ["🥂","Anniversaries"],["✦","Any Occasion"],["🎁","Gift Collection"],
              ["📹","Video Messages"],["🎙","Audio Messages"],["✍️","Written Messages"],
            ].map(([emoji, label], i) => (
              <span key={i} style={{display:"contents"}}>
                <div className="ev-tick-item"><span>{emoji}</span> {label}</div>
                <span className="ev-tick-sep">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* HERO */}
        <section className="ev-hero">
          <div className="ev-hero-left">
            <div className="ev-hero-glow" />
            <div>
              <div className="ev-hero-badge">Powered by Legacy Vault</div>
              <h1 className="ev-hero-h1">
                Every voice.<br />
                Every <em>moment.</em><br />
                Forever yours.
              </h1>
            </div>
            <div>
              <p className="ev-hero-desc">Create a private event page. Guests leave messages you can revisit forever.</p>
              <button className="ev-btn-hero" onClick={() => setModalOpen(true)}>Create Your Event →</button>
            </div>
          </div>
          <div className="ev-hero-right">
            <p className="ev-hr-eyebrow">Live events</p>
            {[
              {icon:"💍",cls:"ic-sunset",type:"Wedding",name:"Sarah & James Harrison",stats:"47 messages · $1,840 gifted",active:true},
              {icon:"🎓",cls:"ic-gold",type:"Graduation",name:"Zoe Chen — Class of 2025",stats:"31 messages · 8 videos"},
              {icon:"👶",cls:"ic-warm",type:"Baby Shower",name:"Baby Okafor — August",stats:"23 messages · $640 gifted"},
              {icon:"🎂",cls:"ic-rose",type:"Birthday",name:"Marcus's 50th",stats:"62 messages · 19 videos"},
            ].map((card,i) => (
              <div key={i} className={`ev-card${card.active?" active":""}`}>
                <div className={`ev-card-icon ${card.cls}`}>{card.icon}</div>
                <div className="ev-card-info">
                  <div className="ev-card-type">{card.type}</div>
                  <div className="ev-card-name">{card.name}</div>
                  <div className="ev-card-stats">{card.stats}</div>
                </div>
                <div className="ev-card-arrow">→</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURE STRIP */}
        <div className="ev-stat-strip">
          <div className="ev-stat-item">
            <div className="ev-icon-pyramid">
              <div className="ev-pyramid-row"><span className="ev-p-icon">📹</span></div>
              <div className="ev-pyramid-row"><span className="ev-p-icon">🎙</span><span className="ev-p-icon">✍️</span></div>
            </div>
            <div className="ev-stat-label">Text, video, or voice</div>
          </div>
          <div className="ev-stat-item">
            <span className="ev-stat-num">0</span>
            <div className="ev-stat-label">No apps. No accounts.</div>
          </div>
          <div className="ev-stat-item">
            <span className="ev-stat-num word">Infinite</span>
            <div className="ev-stat-label">Messages per event</div>
          </div>
          <div className="ev-stat-item">
            <span className="ev-stat-num">5%</span>
            <div className="ev-stat-label">Gift platform fee only</div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section style={{background:"#0f0f0f",padding:"80px 60px"}}>
          <div style={{textAlign:"center",marginBottom:"40px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"rgba(214,106,78,0.15)",border:"1px solid rgba(214,106,78,0.3)",color:"#D66A4E",fontSize:"12px",fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",padding:"7px 18px",borderRadius:"100px",marginBottom:"16px"}}>✦ Live Demo</div>
            <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:"clamp(36px,4vw,52px)",fontWeight:400,color:"white",lineHeight:1.1,marginBottom:"12px"}}>See it in action.</div>
            <div style={{fontSize:"15px",color:"rgba(255,255,255,0.45)",maxWidth:"440px",margin:"0 auto"}}>Walk through the full product — from creating an event to a guest leaving a message.</div>
          </div>
          <EventVaultDemo />
        </section>

        <section className="ev-hiw" id="how">
          <div>
            <p className="ev-eyebrow">How it works</p>
            <h2 className="ev-hiw-h2">Simple enough<br />for any <em>occasion</em></h2>
            <p className="ev-hiw-p">Three steps is all it takes. Your guests need nothing but a link — no account, no app, no friction.</p>
          </div>
          <div className="ev-hiw-steps">
            {[
              {n:"1",h:"Create Your Event Page",p:"Name it, set the date, write a note to guests. Your page is live in two minutes."},
              {n:"2",h:"Share the QR or Link",p:"Print the QR on invitations or text the link. Guests open it in any browser and submit instantly."},
              {n:"3",h:"Receive Your Vault",p:"Every message is saved privately and delivered on the date you choose. Yours to keep forever."},
            ].map((step,i) => (
              <div key={i} className="ev-hiw-step">
                <div className="ev-step-circle">{step.n}</div>
                <div>
                  <div className="ev-step-h">{step.h}</div>
                  <p className="ev-step-p">{step.p}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OCCASIONS */}
        <section className="ev-occasions" id="occasions">
          <div className="ev-occ-head">
            <h2 className="ev-occ-h2">For every <em>beautiful</em><br />chapter</h2>
            <p className="ev-occ-sub">Every milestone deserves to be preserved.</p>
          </div>
          <div className="ev-occ-grid">
            {[
              {e:"💍",n:"Weddings",d:"Messages from every guest"},
              {e:"👶",n:"Baby Showers",d:"Wishes for the new arrival"},
              {e:"🎓",n:"Graduations",d:"Tributes from proud families"},
              {e:"🎂",n:"Birthdays",d:"Milestone celebrations"},
              {e:"💎",n:"Engagements",d:"Celebrate the yes"},
              {e:"🌿",n:"Retirements",d:"Honor a career well lived"},
              {e:"🥂",n:"Anniversaries",d:"Love from everyone"},
              {e:"✦",n:"Any Occasion",d:"Your moment, your vault"},
            ].map((tile,i) => (
              <div key={i} className="ev-occ-tile">
                <span className="ev-occ-emoji">{tile.e}</span>
                <div className="ev-occ-name">{tile.n}</div>
                <div className="ev-occ-desc">{tile.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* UPGRADE TEASER */}
        <section className="ev-upgrade" id="pricing">
          <div className="ev-upgrade-inner">
            <div>
              <p className="ev-eyebrow">Elevate your vault</p>
              <h2 className="ev-upgrade-h2">Turn this into something<br />you'll keep <em>forever</em></h2>
              <p className="ev-upgrade-p">Upgrade your Event Vault to create a more complete, lasting experience. One price. One event. No subscription.</p>
              <div className="ev-price-display">
                <span className="ev-price-num">$29</span>
                <span className="ev-price-per">per event</span>
              </div>
              <p className="ev-price-note">One-time · No subscription</p>
              <button className="ev-btn-outline" onClick={() => setModalOpen(true)}>Explore the Upgrade →</button>
              <div className="ev-benefit-chips">
                {[
                  {i:"🎨",t:"Make it personal",d:"Custom design & styling"},
                  {i:"📦",t:"A delivered vault",d:"Organized, replayable memories"},
                  {i:"🎥",t:"Capture more",d:"Extended recording limits"},
                  {i:"💸",t:"Keep more gifts",d:"Reduced platform fee"},
                ].map((b,i) => (
                  <div key={i} className="ev-benefit-chip">
                    <div className="ev-benefit-icon">{b.i}</div>
                    <div>
                      <div className="ev-benefit-title">{b.t}</div>
                      <div className="ev-benefit-desc">{b.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ev-upgrade-preview">
              <div className="ev-up-header">
                <div className="ev-up-badge">Premium Vault</div>
                <div className="ev-up-name">Sarah & James Harrison</div>
                <div className="ev-up-meta">💍 Wedding · June 14, 2025 · Malibu, CA</div>
              </div>
              <div className="ev-up-body">
                <div className="ev-up-stats">
                  {[{n:"47",l:"Messages"},{n:"$1,840",l:"Gifted"},{n:"12",l:"Videos"}].map((s,i) => (
                    <div key={i}>
                      <span className="ev-up-stat-num">{s.n}</span>
                      <span className="ev-up-stat-lbl">{s.l}</span>
                    </div>
                  ))}
                </div>
                <div className="ev-up-msg">
                  <div className="ev-up-msg-from">Grandma Rose</div>
                  <div className="ev-up-msg-text">"Watching you walk down that aisle was the most beautiful thing I've ever seen..."</div>
                </div>
                <div className="ev-up-msg gold">
                  <div className="ev-up-msg-from">Aunt Patricia</div>
                  <div className="ev-up-msg-text">"He was always meant for someone extraordinary."</div>
                  <div className="ev-gift-tag">🎁 $150 gifted</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="ev-cta">
          <h2 className="ev-cta-h2">Your moment deserves<br />to be <em>remembered.</em></h2>
          <p className="ev-cta-p">Create a private event page. Guests leave messages you can revisit forever.</p>
          <button className="ev-btn-cta" onClick={() => setModalOpen(true)}>Create Your Event</button>
          <button className="ev-btn-cta-sec" onClick={() => setModalOpen(true)}>Start Free →</button>
        </section>

        {/* FOOTER */}
        <footer className="ev-footer">
          <div className="ev-fl">Event<span>Vault</span></div>
          <div className="ev-fc">© 2025 Event Vault · Powered by Legacy Vault</div>
          <div className="ev-fr">Every voice. Every moment.</div>
        </footer>

        {/* UPGRADE MODAL */}
        <div
          className={`ev-modal-backdrop${modalOpen ? " open" : ""}`}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="ev-modal" role="dialog" aria-modal="true">
            <button className="ev-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            <div className="ev-modal-header">
              <div className="ev-modal-kicker">Upgrade Your Event</div>
              <h2 className="ev-modal-h1">Make this moment<br />even more <em>meaningful.</em></h2>
              <p className="ev-modal-sub">Upgrade your Event Vault to create a more complete, lasting experience.</p>
            </div>
            <div className="ev-modal-body">
              <div className="ev-vault-preview">
                <div className="ev-vp-label">Your vault preview</div>
                <div className="ev-vp-messages">
                  <div className="ev-vp-msg">
                    <div className="ev-vp-avatar">G</div>
                    <div>
                      <div className="ev-vp-name">Grandma Rose · Video</div>
                      <div className="ev-vp-text">"Watching you walk down that aisle was the most beautiful thing..."</div>
                    </div>
                  </div>
                  <div className="ev-vp-msg gold">
                    <div className="ev-vp-avatar">A</div>
                    <div>
                      <div className="ev-vp-name">Aunt Patricia · Voice</div>
                      <div className="ev-vp-text">"He was always meant for someone extraordinary."</div>
                      <div className="ev-vp-gift">🎁 $150 gifted</div>
                    </div>
                  </div>
                </div>
                <div className="ev-vp-more">+ 45 more messages waiting for you</div>
              </div>
              <div className="ev-benefit-groups">
                {[
                  {i:"🎨",t:"Make it feel personal",items:["Custom event page design","Personalized colors & styling"]},
                  {i:"🎥",t:"Capture more than words",items:["Extended video — up to 15 min","Extended voice — up to 30 min"]},
                  {i:"📦",t:"Receive your completed vault",items:["Beautifully organized, replayable format","Delivered on the date you choose"]},
                  {i:"💸",t:"Keep more of what you receive",items:["Reduced platform fee — just 2% on gifts","Stripe payouts within 2 business days"]},
                ].map((g,i) => (
                  <div key={i} className="ev-benefit-group">
                    <div className="ev-bg-icon">{g.i}</div>
                    <div>
                      <div className="ev-bg-title">{g.t}</div>
                      <div className="ev-bg-items">
                        {g.items.map((item,j) => <div key={j} className="ev-bg-item">{item}</div>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ev-modal-pricing">
                <div>
                  <div style={{display:"flex",alignItems:"baseline"}}>
                    <span className="ev-mp-amount">$29</span>
                    <span className="ev-mp-per">per event</span>
                  </div>
                  <div className="ev-mp-note">One-time · No subscription · No hidden fees</div>
                </div>
                <div>
                  <div className="ev-mp-tag">✦ One-time upgrade</div>
                  <div className="ev-mp-sub">Applies to this event only</div>
                </div>
              </div>
              <div className="ev-modal-ctas">
                <button className="ev-btn-upgrade">Upgrade My Event</button>
                <a className="ev-btn-continue" href="/events/new">Continue with free version</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
