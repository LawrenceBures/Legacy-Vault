"use client";
import { useEffect, useRef, useState } from "react";

export default function EventVaultDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [nameTyped, setNameTyped] = useState("");
  const [guestNameTyped, setGuestNameTyped] = useState("");
  const [msgTyped, setMsgTyped] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [copyDone, setCopyDone] = useState(false);
  const [sendState, setSendState] = useState<"idle"|"sending"|"sent">("idle");
  const [toastVisible, setToastVisible] = useState(false);
  const [msgCount, setMsgCount] = useState(12);
  const [msgCountGreen, setMsgCountGreen] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [qrRipple, setQrRipple] = useState(false);

  const autoPlayTimer = useRef<NodeJS.Timeout|null>(null);
  const progressInterval = useRef<NodeJS.Timeout|null>(null);
  const typingRefs = useRef<NodeJS.Timeout[]>([]);
  const STEP_DURATION = 7000;
  const TOTAL_STEPS = 8;

  const STEP_CONFIG = [
    { label:"Host Dashboard",         url:"/events" },
    { label:"Create Event Form",      url:"/events/new" },
    { label:"Event Created — Share",  url:"/events/new" },
    { label:"The QR Experience",      url:"/e/ev-harrison-wed" },
    { label:"Guest Event Page",       url:"/e/ev-harrison-wed" },
    { label:"Guest Submitting",       url:"/e/ev-harrison-wed/submit" },
    { label:"Confirmation",           url:"/e/ev-harrison-wed/success" },
    { label:"Host — New Message!",    url:"/events/abc123" },
  ];

  const clearTyping = () => {
    typingRefs.current.forEach(clearTimeout);
    typingRefs.current = [];
  };

  const typeText = (text: string, setter: (v:string)=>void, speed=55, onDone?:()=>void) => {
    let i = 0;
    const tick = () => {
      if (i <= text.length) {
        setter(text.slice(0, i));
        i++;
        const t = setTimeout(tick, speed);
        typingRefs.current.push(t);
      } else { onDone?.(); }
    };
    tick();
  };

  const resetState = () => {
    clearTyping();
    setNameTyped(""); setGuestNameTyped(""); setMsgTyped(""); setCharCount(0);
    setCopyDone(false); setSendState("idle"); setToastVisible(false);
    setMsgCount(12); setMsgCountGreen(false); setQrScanned(false); setQrRipple(false);
  };

  const runAnimation = (step: number) => {
    if (step === 2) {
      const t = setTimeout(() => typeText("Sarah & James Harrison", setNameTyped, 70), 900);
      typingRefs.current.push(t);
    }
    if (step === 3) {
      const t = setTimeout(() => { setCopyDone(true); setTimeout(() => setCopyDone(false), 2500); }, 1400);
      typingRefs.current.push(t);
    }
    if (step === 4) {
      const t1 = setTimeout(() => { setQrRipple(true); }, 1000);
      const t2 = setTimeout(() => { setQrScanned(true); }, 2800);
      typingRefs.current.push(t1, t2);
    }
    if (step === 6) {
      const t1 = setTimeout(() => {
        typeText("Grandma Rose", setGuestNameTyped, 80, () => {
          const t2 = setTimeout(() => {
            const fullMsg = "Watching you walk down that aisle was the most beautiful thing I have ever seen in my life. I am so proud of the woman you have become, Sarah...";
            typeText(fullMsg, (v) => { setMsgTyped(v); setCharCount(v.length); }, 28, () => {
              const t3 = setTimeout(() => setSendState("sending"), 600);
              const t4 = setTimeout(() => setSendState("sent"), 1400);
              typingRefs.current.push(t3, t4);
            });
          }, 400);
          typingRefs.current.push(t2);
        });
      }, 800);
      typingRefs.current.push(t1);
    }
    if (step === 8) {
      const t1 = setTimeout(() => setToastVisible(true), 1500);
      const t2 = setTimeout(() => { setMsgCountGreen(true); setMsgCount(13); }, 1800);
      const t3 = setTimeout(() => setMsgCountGreen(false), 3200);
      typingRefs.current.push(t1, t2, t3);
    }
  };

  const resetAutoPlay = (step: number, paused: boolean) => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    setAutoplayProgress(0);
    if (paused) return;
    const start = Date.now();
    progressInterval.current = setInterval(() => {
      const pct = Math.min((Date.now() - start) / STEP_DURATION, 1);
      setAutoplayProgress(pct);
      if (pct >= 1) clearInterval(progressInterval.current!);
    }, 50);
    autoPlayTimer.current = setTimeout(() => {
      goToStep(step >= TOTAL_STEPS ? 1 : step + 1, false);
    }, STEP_DURATION);
  };

  const goToStep = (step: number, paused: boolean = isPaused) => {
    if (step < 1 || step > TOTAL_STEPS) step = 1;
    resetState();
    setCurrentStep(step);
    setTimeout(() => runAnimation(step), 50);
    resetAutoPlay(step, paused);
  };

  useEffect(() => {
    goToStep(1, false);
    return () => {
      clearTyping();
      if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToStep(currentStep >= TOTAL_STEPS ? 1 : currentStep + 1);
      if (e.key === "ArrowLeft" && currentStep > 1) goToStep(currentStep - 1);
      if (e.key === " ") { e.preventDefault(); togglePause(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentStep, isPaused]);

  const togglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    if (next) {
      if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else { resetAutoPlay(currentStep, false); }
  };

  const circumference = 2 * Math.PI * 16;
  const strokeOffset = circumference * (1 - autoplayProgress);

  const QR_PATTERN = [
    1,1,1,1,1,1,1,0,1,0,
    1,0,0,0,0,0,1,0,0,1,
    1,0,1,1,1,0,1,0,1,0,
    1,0,1,1,1,0,1,0,0,1,
    1,0,1,1,1,0,1,0,1,1,
    1,0,0,0,0,0,1,0,0,0,
    1,1,1,1,1,1,1,0,1,0,
    0,0,0,0,0,0,0,0,0,1,
    0,1,1,0,1,0,1,1,0,1,
    1,0,0,1,0,1,1,0,1,1,
  ];

  const s = {
    shell:{width:"100%",background:"#1a1a1a",borderRadius:"20px",overflow:"hidden",boxShadow:"0 40px 120px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.06)"},
    chrome:{background:"#2a2a2a",padding:"13px 20px",display:"flex",alignItems:"center",gap:"16px",borderBottom:"1px solid rgba(255,255,255,.06)"},
    dots:{display:"flex",gap:"7px"},
    dot:(c:string)=>({width:"12px",height:"12px",borderRadius:"50%",background:c}),
    bar:{flex:1,background:"#1a1a1a",borderRadius:"8px",padding:"7px 14px",display:"flex",alignItems:"center",gap:"8px",fontSize:"12px",color:"rgba(255,255,255,.4)"},
    viewport:{width:"100%",height:"600px",position:"relative" as const,overflow:"hidden",background:"#F5F3EF"},
    panel:(visible:boolean)=>({position:"absolute" as const,inset:0,opacity:visible?1:0,pointerEvents:visible?"all" as const:"none" as const,transition:"opacity .5s ease"}),
    controls:{background:"#1a1a1a",padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.05)"},
    stepDot:(state:"active"|"done"|"idle")=>({width:"8px",height:"8px",borderRadius:"50%",cursor:"pointer",transition:"all .3s",background:state==="active"?"#D66A4E":state==="done"?"rgba(255,255,255,.4)":"rgba(255,255,255,.15)",transform:state==="active"?"scale(1.4)":"scale(1)",boxShadow:state==="active"?"0 0 0 3px rgba(214,106,78,.25)":"none"}),
    ctrlBtn:(primary?:boolean)=>({background:primary?"#D66A4E":"rgba(255,255,255,.08)",border:primary?"none":"1px solid rgba(255,255,255,.1)",color:"white",fontSize:"13px",fontWeight:"500",padding:"9px 20px",borderRadius:"100px",cursor:"pointer"}),
    badge:{background:"rgba(214,106,78,.2)",color:"#D66A4E",border:"1px solid rgba(214,106,78,.3)",fontSize:"11px",fontWeight:"600",padding:"3px 10px",borderRadius:"100px"},
    sceneLabel:{position:"absolute" as const,top:"14px",left:"50%",transform:"translateX(-50%)",background:"rgba(26,15,10,.8)",backdropFilter:"blur(10px)",color:"white",fontSize:"11px",fontWeight:"500",letterSpacing:".06em",padding:"6px 16px",borderRadius:"100px",border:"1px solid rgba(255,255,255,.1)",pointerEvents:"none" as const,zIndex:50,whiteSpace:"nowrap" as const},
    sidebar:{position:"absolute" as const,top:0,left:0,bottom:0,width:"200px",background:"#2B1E1A",padding:"20px 0",display:"flex",flexDirection:"column" as const},
    sidebarLogo:{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",color:"white",padding:"0 18px 18px",borderBottom:"1px solid rgba(255,255,255,.08)"},
    navItem:(active:boolean)=>({padding:"10px 18px",fontSize:"12px",color:active?"white":"rgba(255,255,255,.45)",background:active?"rgba(255,255,255,.06)":"transparent",cursor:"pointer",position:"relative" as const,display:"flex",alignItems:"center",gap:"8px"}),
    main:{position:"absolute" as const,top:0,left:"200px",right:0,bottom:0,background:"#F5F3EF",padding:"32px",overflowY:"auto" as const},
    overlay:{position:"absolute" as const,inset:0,background:"rgba(43,30,26,.5)",display:"flex",alignItems:"center",justifyContent:"center"},
    modal:{background:"white",borderRadius:"20px",width:"520px",maxWidth:"90%",padding:"40px",boxShadow:"0 30px 80px rgba(0,0,0,.25)",position:"relative" as const,maxHeight:"520px",overflowY:"auto" as const},
    formInput:(focused?:boolean)=>({width:"100%",height:"42px",border:`1px solid ${focused?"#D66A4E":"rgba(43,30,26,.12)"}`,borderRadius:"10px",padding:"0 13px",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#2B1E1A",background:"white",outline:"none",boxShadow:focused?"0 0 0 3px rgba(214,106,78,.1)":"none"}),
  };

  const Sidebar = ({activeItem=0}:{activeItem?:number}) => (
    <div style={s.sidebar}>
      <div style={s.sidebarLogo}>Event<span style={{color:"#D8B56A"}}>Vault</span></div>
      {["📋 My Events","👤 Profile","⚙️ Settings"].map((item,i)=>(
        <div key={i} style={s.navItem(i===activeItem)}>
          {i===activeItem && <div style={{position:"absolute",left:0,top:0,bottom:0,width:"2px",background:"#D66A4E",borderRadius:"0 2px 2px 0"}}/>}
          {item}
        </div>
      ))}
    </div>
  );

  const SceneLabel = ({text}:{text:string}) => (
    <div style={s.sceneLabel}>
      <span style={{display:"inline-block",width:"6px",height:"6px",borderRadius:"50%",background:"#D66A4E",marginRight:"7px",verticalAlign:"middle"}}/>
      {text}
    </div>
  );

  const TypedInput = ({value,placeholder,focused}:{value:string,placeholder:string,focused?:boolean}) => (
    <div style={{...s.formInput(focused),display:"flex",alignItems:"center"}}>
      <span style={{fontSize:"14px",color:"#2B1E1A"}}>{value}</span>
      {focused && value.length > 0 && value.length < 22 && <span style={{display:"inline-block",width:"2px",height:"16px",background:"#D66A4E",marginLeft:"2px",animation:"blink .7s ease-in-out infinite",verticalAlign:"middle"}}/>}
      {!value && <span style={{color:"rgba(43,30,26,.3)",fontSize:"14px"}}>{placeholder}</span>}
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",width:"100%"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes badgePulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.3)}50%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ornamentPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes qrPulse{0%{box-shadow:0 0 0 0 rgba(214,106,78,.5)}70%{box-shadow:0 0 0 20px rgba(214,106,78,0)}100%{box-shadow:0 0 0 0 rgba(214,106,78,0)}}
        @keyframes scanLine{0%{top:8px}100%{top:calc(100% - 8px)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes chipPop{from{opacity:0;transform:scale(0.8) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes phoneShake{0%,100%{transform:rotate(0deg)}20%{transform:rotate(-3deg)}40%{transform:rotate(3deg)}60%{transform:rotate(-2deg)}80%{transform:rotate(2deg)}}
      `}</style>

      <div style={s.shell}>
        {/* BROWSER CHROME */}
        <div style={s.chrome}>
          <div style={s.dots}>{["#FF5F57","#FFBD2E","#28C840"].map((c,i)=><div key={i} style={s.dot(c)}/>)}</div>
          <div style={s.bar}>
            <span style={{fontSize:"11px",color:"rgba(255,255,255,.3)"}}>🔒</span>
            <span style={{color:"rgba(255,255,255,.45)"}}>eventvault.co<span style={{color:"#D66A4E",fontWeight:"500"}}>{STEP_CONFIG[currentStep-1].url}</span></span>
          </div>
          <svg width="32" height="32" viewBox="0 0 36 36" style={{transform:"rotate(-90deg)",flexShrink:0}}>
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3"/>
            <circle cx="18" cy="18" r="16" fill="none" stroke="#D66A4E" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeOffset} strokeLinecap="round" style={{transition:"stroke-dashoffset .05s linear"}}/>
          </svg>
        </div>

        {/* VIEWPORT */}
        <div style={s.viewport}>

          {/* ── PANEL 1: Empty Dashboard ── */}
          <div style={s.panel(currentStep===1)}>
            <SceneLabel text="Host Dashboard"/>
            <Sidebar activeItem={0}/>
            <div style={s.main}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"30px",fontWeight:400}}>My Events</div>
                <button style={{...s.ctrlBtn(true),fontSize:"12px",padding:"9px 20px"}}>+ Create Event</button>
              </div>
              <div style={{textAlign:"center",padding:"60px 40px",border:"2px dashed rgba(43,30,26,.1)",borderRadius:"20px",background:"white"}}>
                <div style={{fontSize:"48px",marginBottom:"14px"}}>🎉</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",marginBottom:"8px"}}>Your first event is waiting.</div>
                <div style={{fontSize:"13px",color:"#6B6B6B",maxWidth:"300px",margin:"0 auto 24px",lineHeight:1.65}}>Create an event page in two minutes. Share a link. Watch messages arrive from everyone who matters.</div>
                <button style={{...s.ctrlBtn(true),fontSize:"12px",padding:"9px 22px"}}>Create Your First Event</button>
              </div>
            </div>
          </div>

          {/* ── PANEL 2: Create Form ── */}
          <div style={s.panel(currentStep===2)}>
            <SceneLabel text="Creating an Event"/>
            <Sidebar activeItem={0}/>
            <div style={s.overlay}>
              <div style={s.modal}>
                <div style={{display:"flex",alignItems:"center",marginBottom:"24px"}}>
                  {["Details","Settings & Share"].map((label,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:i<1?"12px":"0"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <div style={{width:"24px",height:"24px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:600,background:i===0?"#D66A4E":"rgba(43,30,26,.08)",color:i===0?"white":"#6B6B6B"}}>{i===0?"1":"2"}</div>
                        <span style={{fontSize:"12px",color:i===0?"#2B1E1A":"#6B6B6B",fontWeight:i===0?500:400}}>{label}</span>
                      </div>
                      {i===0 && <div style={{flex:1,height:"1px",background:"rgba(43,30,26,.1)",margin:"0 16px",width:"60px"}}/>}
                    </div>
                  ))}
                </div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",fontWeight:400,textAlign:"center",marginBottom:"22px"}}>What are we <em style={{color:"#D66A4E"}}>celebrating?</em></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"22px"}}>
                  {[["💍","Wedding",true],["👶","Baby Shower",false],["🎓","Graduation",false],["🎂","Birthday",false]].map(([emoji,label,active],i)=>(
                    <div key={i} style={{border:`1.5px solid ${active?"#D66A4E":"rgba(43,30,26,.1)"}`,borderRadius:"12px",padding:"12px 8px",textAlign:"center",background:active?"rgba(214,106,78,.06)":"white"}}>
                      <div style={{fontSize:"22px",marginBottom:"5px"}}>{emoji}</div>
                      <div style={{fontSize:"10px",fontWeight:500,color:"#2B1E1A"}}>{String(label)}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:"16px"}}>
                  <label style={{fontSize:"11px",letterSpacing:".14em",textTransform:"uppercase" as const,color:"#6B6B6B",display:"block",marginBottom:"7px"}}>Event Name *</label>
                  <TypedInput value={nameTyped} placeholder="e.g. Sarah & James' Wedding" focused={currentStep===2}/>
                </div>
                <div style={{marginBottom:"20px"}}>
                  <label style={{fontSize:"11px",letterSpacing:".14em",textTransform:"uppercase" as const,color:"#6B6B6B",display:"block",marginBottom:"7px"}}>Event Date</label>
                  <input style={{...s.formInput(),display:"block"}} defaultValue="June 14, 2025" readOnly/>
                </div>
                <button style={{...s.ctrlBtn(true),width:"100%",padding:"14px",fontSize:"14px",borderRadius:"100px"}}>Continue →</button>
              </div>
            </div>
          </div>

          {/* ── PANEL 3: QR + Share ── */}
          <div style={s.panel(currentStep===3)}>
            <SceneLabel text="Event Created — Share Anywhere"/>
            <Sidebar activeItem={0}/>
            <div style={s.overlay}>
              <div style={{...s.modal,textAlign:"center"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"44px",color:"#D8B56A",marginBottom:"10px"}}>✦</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",marginBottom:"6px"}}>Your vault is live.</div>
                <div style={{fontSize:"13px",color:"#6B6B6B",marginBottom:"20px",lineHeight:1.6}}>Share this link with your guests and watch the messages arrive.</div>
                <div style={{background:"#F5F3EF",border:"1px solid rgba(43,30,26,.1)",borderRadius:"12px",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",marginBottom:"20px",textAlign:"left"}}>
                  <span style={{fontSize:"12px",color:"#2B1E1A",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>eventvault.co/e/<span style={{color:"#D66A4E"}}>ev-harrison-wed</span></span>
                  <button style={{background:copyDone?"#22C55E":"#D66A4E",color:"white",fontSize:"11px",fontWeight:500,padding:"7px 16px",borderRadius:"100px",border:"none",cursor:"pointer",flexShrink:0,transition:"background .3s"}}>{copyDone?"✓ Copied!":"Copy"}</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"16px"}}>
                  <div style={{width:"120px",height:"120px",borderRadius:"10px",border:"1px solid rgba(43,30,26,.1)",padding:"8px",background:"white",display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:"2px"}}>
                    {QR_PATTERN.map((px,i)=><div key={i} style={{borderRadius:"2px",background:px?"#2B1E1A":"transparent"}}/>)}
                  </div>
                  <span style={{fontSize:"11px",color:"#D66A4E",textDecoration:"underline",marginTop:"7px",cursor:"pointer"}}>↓ Download QR Code</span>
                </div>
                <div style={{fontSize:"12px",color:"#6B6B6B",lineHeight:1.65}}>Print on invitations, display at the venue, or send by text.</div>
              </div>
            </div>
          </div>

          {/* ── PANEL 4: QR EXPERIENCE — new star scene ── */}
          <div style={s.panel(currentStep===4)}>
            <SceneLabel text="Guests scan — and the magic begins"/>
            <div style={{
              minHeight:"100%",
              background:"linear-gradient(135deg,#FDF8F1 0%,#F7E5D0 100%)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              padding:"32px 24px",position:"relative",overflow:"hidden",
            }}>
              {/* background glow */}
              <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:"400px",height:"400px",borderRadius:"50%",background:"radial-gradient(circle,rgba(214,106,78,0.15),transparent 70%)",pointerEvents:"none"}}/>

              {/* top label */}
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"13px",letterSpacing:".2em",textTransform:"uppercase" as const,color:"#B85438",marginBottom:"24px",position:"relative"}}>One scan. That's all it takes.</div>

              <div style={{display:"flex",gap:"48px",alignItems:"center",position:"relative",zIndex:2,flexWrap:"wrap" as const,justifyContent:"center"}}>

                {/* QR card */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"}}>
                  <div style={{
                    background:"white",borderRadius:"20px",padding:"20px",
                    boxShadow:qrRipple?"0 0 0 8px rgba(214,106,78,0.3), 0 20px 60px rgba(0,0,0,0.4)":"0 20px 60px rgba(0,0,0,0.4)",
                    transition:"box-shadow .4s ease",
                    position:"relative",overflow:"hidden",
                    animation:qrRipple?"qrPulse 1s ease-out":"none",
                  }}>
                    {/* scan line animation */}
                    {qrRipple && !qrScanned && (
                      <div style={{position:"absolute",left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#D66A4E,transparent)",animation:"scanLine 1.2s ease-in-out",zIndex:10}}/>
                    )}
                    <div style={{width:"140px",height:"140px",display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:"2px"}}>
                      {QR_PATTERN.map((px,i)=><div key={i} style={{borderRadius:"2px",background:px?"#2B1E1A":"transparent"}}/>)}
                    </div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",color:"#2B1E1A",marginBottom:"4px"}}>Sarah & James Harrison</div>
                    <div style={{fontSize:"11px",color:"rgba(43,30,26,0.45)",letterSpacing:".08em"}}>💍 WEDDING · JUNE 14, 2025</div>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{fontSize:"28px",color:"#D66A4E",transition:"all .5s",opacity:qrScanned?1:0.3}}>→</div>

                {/* What guests can do */}
                <div style={{display:"flex",flexDirection:"column",gap:"12px",maxWidth:"260px"}}>
                  {[
                    {icon:"✍️",title:"Write a personal message",desc:"Pour your heart into words — as long or short as you like",delay:"0s",color:"rgba(214,106,78,0.15)",border:"rgba(214,106,78,0.3)"},
                    {icon:"📹",title:"Record a video message",desc:"Say it face to face — capture tone, tears, and laughter",delay:".15s",color:"rgba(216,181,106,0.1)",border:"rgba(216,181,106,0.3)"},
                    {icon:"🎙",title:"Leave a voice note",desc:"Sometimes your voice says everything words can't",delay:".3s",color:"rgba(125,207,164,0.1)",border:"rgba(125,207,164,0.3)"},
                    {icon:"🎁",title:"Send a gift",desc:"Attach a cash gift directly to your message",delay:".45s",color:"rgba(245,200,66,0.1)",border:"rgba(245,200,66,0.3)"},
                  ].map((item,i)=>(
                    <div key={i} style={{
                      background:item.color,
                      border:`1px solid ${item.border}`,
                      borderRadius:"14px",padding:"12px 16px",
                      display:"flex",gap:"12px",alignItems:"flex-start",
                      opacity:qrScanned?1:0,
                      transform:qrScanned?"translateY(0)":"translateY(10px)",
                      transition:`all .5s ease ${item.delay}`,
                    }}>
                      <span style={{fontSize:"20px",flexShrink:0}}>{item.icon}</span>
                      <div>
                        <div style={{fontSize:"12px",fontWeight:600,color:"#2B1E1A",marginBottom:"2px"}}>{item.title}</div>
                        <div style={{fontSize:"11px",color:"rgba(43,30,26,0.55)",lineHeight:1.4}}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* bottom note */}
              <div style={{
                marginTop:"28px",position:"relative",zIndex:2,
                display:"flex",alignItems:"center",gap:"8px",
                opacity:qrScanned?1:0,transition:"opacity .5s ease .6s",
              }}>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#22C55E",animation:"badgePulse 2s ease-in-out infinite"}}/>
                <span style={{fontSize:"12px",color:"rgba(43,30,26,0.5)",letterSpacing:".04em"}}>No app download. No account needed. Works on any phone.</span>
              </div>
            </div>
          </div>

          {/* ── PANEL 5: Guest Landing ── */}
          <div style={s.panel(currentStep===5)}>
            <SceneLabel text="Guest Experience — Event Page"/>
            <div style={{minHeight:"100%",background:"#F5F3EF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"17px",color:"#6B6B6B",marginBottom:"28px"}}>Event<span style={{color:"#D66A4E"}}>Vault</span></div>
              <div style={{background:"white",borderRadius:"20px",padding:"40px 36px",width:"100%",maxWidth:"380px",boxShadow:"0 24px 60px rgba(43,30,26,.1)",textAlign:"center"}}>
                <div style={{fontSize:"11px",letterSpacing:".16em",textTransform:"uppercase" as const,color:"#6B6B6B",marginBottom:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>💍 Wedding</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"30px",fontWeight:400,lineHeight:1.05,marginBottom:"6px"}}>Sarah & James<br/>Harrison</div>
                <div style={{fontSize:"12px",color:"#6B6B6B",marginBottom:"18px"}}>June 14, 2025 · Malibu, CA</div>
                <div style={{height:"1px",background:"rgba(43,30,26,.07)",marginBottom:"18px"}}/>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"15px",lineHeight:1.6,color:"#2B1E1A",borderLeft:"3px solid #D66A4E",paddingLeft:"13px",textAlign:"left",marginBottom:"18px"}}>"We'd love a message from your heart. Your words will be our most treasured gift."</div>
                <div style={{fontSize:"12px",color:"#6B6B6B",marginBottom:"16px"}}><strong style={{color:"#2B1E1A"}}>12 people</strong> have already left a message</div>
                <div style={{height:"1px",background:"rgba(43,30,26,.07)",marginBottom:"16px"}}/>
                <button style={{display:"block",width:"100%",background:"#D66A4E",color:"white",fontSize:"14px",fontWeight:500,padding:"14px",borderRadius:"100px",border:"none",cursor:"pointer",boxShadow:"0 6px 20px rgba(214,106,78,.3)"}}>Leave a Message ✦</button>
                <div style={{fontSize:"11px",color:"#6B6B6B",marginTop:"10px"}}>🎁 Gifts welcome</div>
              </div>
            </div>
          </div>

          {/* ── PANEL 6: Submit ── */}
          <div style={s.panel(currentStep===6)}>
            <SceneLabel text="Guest Submitting a Message"/>
            <div style={{minHeight:"100%",background:"#F5F3EF",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 20px 40px"}}>
              <div style={{fontSize:"12px",color:"#6B6B6B",marginBottom:"20px",alignSelf:"flex-start",cursor:"pointer"}}>← Sarah & James Harrison</div>
              <div style={{background:"white",borderRadius:"20px",padding:"32px",width:"100%",maxWidth:"420px",boxShadow:"0 16px 40px rgba(43,30,26,.07)"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:400,lineHeight:1.2,marginBottom:"6px"}}>Leave your message for <em style={{color:"#D66A4E"}}>Sarah & James.</em></div>
                <div style={{fontSize:"12px",color:"#6B6B6B",marginBottom:"20px",lineHeight:1.55}}>💍 Privately saved and delivered to the host.</div>
                <div style={{height:"1px",background:"rgba(43,30,26,.07)",marginBottom:"18px"}}/>
                <label style={{fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase" as const,color:"#6B6B6B",display:"block",marginBottom:"7px"}}>Your name *</label>
                <TypedInput value={guestNameTyped} placeholder="e.g. Grandma Rose" focused={currentStep===6 && guestNameTyped.length < 12}/>
                <div style={{marginBottom:"16px"}}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
                  {[["✍️","Write"],["📹","Video"],["🎙","Voice"]].map(([icon,label],i)=>(
                    <div key={i} style={{border:`1.5px solid ${i===0?"#D66A4E":"rgba(43,30,26,.1)"}`,borderRadius:"12px",padding:"12px 8px",textAlign:"center",cursor:"pointer",background:i===0?"rgba(214,106,78,.06)":"white"}}>
                      <div style={{fontSize:"22px",marginBottom:"5px"}}>{icon}</div>
                      <div style={{fontSize:"10px",fontWeight:500}}>{label}</div>
                    </div>
                  ))}
                </div>
                <textarea readOnly value={msgTyped} style={{width:"100%",border:"1px solid #D66A4E",borderRadius:"10px",padding:"12px 13px",fontSize:"13px",color:"#2B1E1A",background:"white",resize:"none",height:"100px",lineHeight:1.65,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 0 0 3px rgba(214,106,78,.1)",outline:"none"}}/>
                <div style={{textAlign:"right",fontSize:"10px",color:"#6B6B6B",marginBottom:"16px",marginTop:"4px"}}>{charCount} / 5,000</div>
                <button style={{width:"100%",fontSize:"13px",fontWeight:500,padding:"14px",borderRadius:"100px",border:"none",cursor:"pointer",background:sendState==="sent"?"#22C55E":sendState==="sending"?"#6B6B6B":"#D66A4E",color:"white",transition:"background .3s"}}>
                  {sendState==="sent"?"✓ Message Sent!":sendState==="sending"?"Saving...":"Send My Message ✦"}
                </button>
              </div>
            </div>
          </div>

          {/* ── PANEL 7: Success ── */}
          <div style={s.panel(currentStep===7)}>
            <SceneLabel text="Message Saved ✓"/>
            <div style={{minHeight:"100%",background:"#F5F3EF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px"}}>
              <div style={{background:"white",borderRadius:"20px",padding:"44px 40px",width:"100%",maxWidth:"380px",boxShadow:"0 24px 60px rgba(43,30,26,.1)",textAlign:"center"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"48px",color:"#D8B56A",marginBottom:"14px",animation:"ornamentPop .5s cubic-bezier(.22,1,.36,1)"}}>✦</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",marginBottom:"8px"}}>Your message has been saved.</div>
                <div style={{fontSize:"13px",color:"#6B6B6B",lineHeight:1.7,marginBottom:"20px"}}>It's safe and will be delivered to Sarah & James on the date they choose.</div>
                <div style={{width:"44px",height:"2px",background:"#D8B56A",margin:"0 auto 20px",borderRadius:"2px"}}/>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"15px",lineHeight:1.6,color:"#2B1E1A",borderLeft:"3px solid #D66A4E",paddingLeft:"13px",textAlign:"left",marginBottom:"22px"}}>"Thank you for being part of this special day."</div>
                <button style={{border:"1.5px solid rgba(43,30,26,.12)",color:"#2B1E1A",fontSize:"12px",padding:"10px 24px",borderRadius:"100px",background:"none",cursor:"pointer",display:"block",margin:"0 auto 18px"}}>← Back to event page</button>
                <div style={{fontSize:"12px",color:"#6B6B6B"}}>Want to preserve your own legacy?<br/><a href="#" style={{color:"#D66A4E",textDecoration:"none",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"14px"}}>Create your own Event Vault →</a></div>
              </div>
            </div>
          </div>

          {/* ── PANEL 8: Host with new message ── */}
          <div style={s.panel(currentStep===8)}>
            <SceneLabel text="Host View — New Message!"/>
            <Sidebar activeItem={0}/>
            <div style={s.main}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"22px"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",fontWeight:400}}>My Events</div>
                <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.2)",color:"#16A34A",fontSize:"11px",fontWeight:500,padding:"6px 14px",borderRadius:"100px",display:"flex",alignItems:"center",gap:"6px",animation:"badgePulse 2s ease-in-out infinite"}}>
                  <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#22C55E",display:"inline-block",animation:"blink .8s ease-in-out infinite"}}/>
                  New message received
                </div>
              </div>
              <div style={{background:"white",borderRadius:"14px",padding:"20px 22px",border:"1px solid rgba(43,30,26,.05)",boxShadow:"0 3px 12px rgba(43,30,26,.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"13px",marginBottom:"14px"}}>
                  <div style={{width:"42px",height:"42px",borderRadius:"12px",background:"rgba(214,106,78,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>💍</div>
                  <div style={{flex:1}}><div style={{fontSize:"10px",letterSpacing:".12em",textTransform:"uppercase" as const,color:"#6B6B6B",marginBottom:"2px"}}>Wedding</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",fontWeight:500,color:"#2B1E1A"}}>Sarah & James Harrison</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"11px",fontWeight:500,color:"#22C55E"}}><span style={{width:"5px",height:"5px",borderRadius:"50%",background:"#22C55E",display:"inline-block"}}/>Active</div>
                </div>
                <div style={{display:"flex",gap:"20px",padding:"14px 0",borderTop:"1px solid rgba(43,30,26,.05)",borderBottom:"1px solid rgba(43,30,26,.05)",marginBottom:"14px"}}>
                  {[[String(msgCount),"Messages"],[`$640`,"Gifted"],["21","Days left"]].map(([num,label],i)=>(
                    <div key={i}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",fontWeight:400,color:i===0&&msgCountGreen?"#22C55E":"#2B1E1A",lineHeight:1,transition:"color .4s"}}>{num}</div><div style={{fontSize:"9px",color:"#6B6B6B",letterSpacing:".08em",textTransform:"uppercase" as const,marginTop:"2px"}}>{label}</div></div>
                  ))}
                </div>
                <div style={{display:"flex",gap:"8px"}}>
                  <button style={{background:"#D66A4E",color:"white",fontSize:"11px",fontWeight:500,padding:"8px 16px",borderRadius:"100px",border:"none",cursor:"pointer"}}>View Event</button>
                  <button style={{border:"1px solid rgba(43,30,26,.12)",color:"#2B1E1A",fontSize:"11px",padding:"8px 16px",borderRadius:"100px",background:"none",cursor:"pointer"}}>Copy Link</button>
                </div>
              </div>
              {toastVisible && (
                <div style={{position:"absolute",bottom:"20px",right:"20px",background:"white",borderRadius:"14px",padding:"14px 16px",boxShadow:"0 16px 40px rgba(43,30,26,.15)",display:"flex",alignItems:"flex-start",gap:"12px",borderLeft:"3px solid #D66A4E",maxWidth:"270px",animation:"toastIn .5s cubic-bezier(.22,1,.36,1)"}}>
                  <div style={{width:"30px",height:"30px",borderRadius:"50%",background:"linear-gradient(135deg,#D66A4E,#F48567)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:"13px",color:"white",flexShrink:0}}>G</div>
                  <div><div style={{fontSize:"11px",fontWeight:600,color:"#2B1E1A",marginBottom:"3px"}}>Grandma Rose left a message ✍️</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"12px",color:"#6B6B6B",lineHeight:1.4}}>"Watching you walk down that aisle was the most beautiful thing..."</div></div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* CONTROLS */}
        <div style={s.controls}>
          <div style={{display:"flex",gap:"8px"}}>
            {Array.from({length:TOTAL_STEPS},(_,i)=>(
              <div key={i} onClick={()=>goToStep(i+1)} style={s.stepDot(i+1===currentStep?"active":i+1<currentStep?"done":"idle")}/>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={s.badge}>{currentStep} / {TOTAL_STEPS}</span>
            <strong style={{fontSize:"13px",color:"white"}}>{STEP_CONFIG[currentStep-1].label}</strong>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button style={{...s.ctrlBtn(),opacity:currentStep===1?.4:1}} onClick={()=>currentStep>1&&goToStep(currentStep-1)} disabled={currentStep===1}>← Prev</button>
            <button style={s.ctrlBtn()} onClick={togglePause}>{isPaused?"▶ Play":"⏸ Pause"}</button>
            <button style={s.ctrlBtn(true)} onClick={()=>goToStep(currentStep>=TOTAL_STEPS?1:currentStep+1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
