import React, { useEffect, useRef, useState } from "react";

const API = {
  chat: "/api/psychic-chat",
  session: "/api/psychic-session",
  recharge: "/api/psychic-recharge",
  astrologer: "/api/psychic-handoff",
};

export interface ChatPackage {
  id: string;
  minutes: number;
  usd: number;
  gbp: number;
}

const PACKAGES: ChatPackage[] = [
  { id: "starter", minutes: 5, usd: 9.99, gbp: 7.99 },
  { id: "popular", minutes: 10, usd: 17.99, gbp: 14.99 },
  { id: "extended", minutes: 20, usd: 32.99, gbp: 26.99 },
];

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface PsychicChatDetails {
  name: string;
  dob: string;
  concern: string;
}

export interface PsychicChatProps {
  onClose?: () => void;
  isOpen?: boolean;
  initialName?: string;
  initialConcern?: string;
}

async function postJSON(url: string, body: any) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong. Please try again.");
  }
  return data;
}

function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function PsychicChat({ onClose, isOpen = true, initialName = "", initialConcern = "Love & Relationships" }: PsychicChatProps) {
  const [details, setDetails] = useState<PsychicChatDetails>({
    name: initialName || (typeof window !== "undefined" ? localStorage.getItem("astral_customer_name") || "" : ""),
    dob: "",
    concern: initialConcern || "Love & Relationships",
  });
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("popular");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [handoffStatus, setHandoffStatus] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [restoring, setRestoring] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const requestRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  // Ask the server whether this browser already has an active session.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const storedSessionId = typeof window !== "undefined" ? localStorage.getItem("lumysic_active_psychic_session") : null;
        const data = await postJSON(API.session, { action: "restore", sessionId: storedSessionId });
        if (cancelled || !data.active) return;
        setSessionId(data.sessionId || "");
        if (data.sessionId && typeof window !== "undefined") {
          localStorage.setItem("lumysic_active_psychic_session", data.sessionId);
        }
        setDetails(data.details || { name: "", dob: "", concern: "Love & Relationships" });
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setSecondsLeft(Math.max(0, Number(data.secondsLeft ?? 120)));
        setStarted(true);
        setExpired(Boolean(data.expired) || Number(data.secondsLeft ?? 120) <= 0);
      } catch {
        // A new visitor may not have a session yet; the form remains available.
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!started || expired || !sessionId) return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setExpired(true);
          postJSON(API.session, { action: "expire", sessionId }).catch(() => {});
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [started, expired, sessionId]);

  const beginChat = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await postJSON(API.session, { action: "start", details });
      if (!data.sessionId) throw new Error("The server did not create a chat session.");
      setSessionId(data.sessionId);
      if (typeof window !== "undefined") {
        localStorage.setItem("lumysic_active_psychic_session", data.sessionId);
        if (details.name.trim()) localStorage.setItem("astral_customer_name", details.name.trim());
      }
      setSecondsLeft(Math.max(1, Number(data.secondsLeft ?? 120)));
      setMessages(data.messages?.length ? data.messages : [{
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Hi ${details.name.trim()} ✨ I'm here to listen. What's been on your mind about ${details.concern.toLowerCase()}?`,
      }]);
      setStarted(true);
      setExpired(false);
    } catch (err: any) {
      setError(err.message || "Couldn't start the session. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || busy || requestRef.current || expired || secondsLeft <= 0 || !sessionId) return;
    setError("");
    setInput("");
    const userMessage: ChatMessageItem = { id: `user-${Date.now()}`, role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setBusy(true);
    requestRef.current = true;
    try {
      const data = await postJSON(API.chat, {
        sessionId,
        details,
        message: text,
        history: nextMessages.map(({ role, content }) => ({ role, content })),
      });
      if (data.sessionExpired) {
        setExpired(true);
        setSecondsLeft(0);
        return;
      }
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        if (typeof window !== "undefined") localStorage.setItem("lumysic_active_psychic_session", data.sessionId);
      }
      setMessages((previous) => [...previous, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: String(data.reply || "I'm here with you. Could you tell me a little more? ✨"),
      }]);
      if (Number.isFinite(data.secondsLeft)) setSecondsLeft(Math.max(0, data.secondsLeft));
    } catch (err: any) {
      setMessages((previous) => previous.filter((message) => message.id !== userMessage.id));
      setInput(text);
      setError(err.message || "I couldn't send that message. Please try again.");
    } finally {
      setBusy(false);
      requestRef.current = false;
    }
  };

  const recharge = async () => {
    setError("");
    setPaymentBusy(true);
    try {
      const chosen = PACKAGES.find((item) => item.id === selectedPackage) || PACKAGES[1];
      const data = await postJSON(API.recharge, {
        sessionId,
        packageId: selectedPackage,
        currency,
        minutes: chosen.minutes,
      });
      // The server must verify payment before returning paid=true.
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      if (data.paid === true && Number(data.secondsLeft) > 0) {
        setSecondsLeft(Number(data.secondsLeft));
        setExpired(false);
        setHandoffStatus("");
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } else {
        throw new Error(data.message || "Payment has not been confirmed yet.");
      }
    } catch (err: any) {
      setError(err.message || "Unable to start checkout.");
    } finally {
      setPaymentBusy(false);
    }
  };

  const requestAstrologer = async () => {
    setError("");
    setHandoffStatus("Requesting a live astrologer…");
    try {
      const data = await postJSON(API.astrologer, { sessionId, details });
      setHandoffStatus(data.statusMessage || (
        data.connected ? "A live astrologer has joined." : "Your request has been submitted. We'll show an update when a connection is confirmed."
      ));
    } catch (err: any) {
      setHandoffStatus("");
      setError(err.message || "Couldn't request an astrologer.");
    }
  };

  const remainingLabel = formatTime(secondsLeft);
  const selected = PACKAGES.find((item) => item.id === selectedPackage) || PACKAGES[1];

  const styles = `
    * { box-sizing: border-box; }
    .pc-shell { min-height: 520px; max-width: 860px; width: 100%; margin: 0 auto; padding: 18px; color: #7A5C9E; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .pc-card { overflow: hidden; border: 1px solid #E3C98A; border-radius: 22px; background: #FBF9F6; box-shadow: 0 18px 55px rgba(122,92,158,.10); }
    .pc-header { padding: 20px 24px; color: #FBF9F6; background: #7A5C9E; display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .pc-brand { display:flex; align-items:center; gap:12px; }
    .pc-orb { width:44px; height:44px; border:1px solid #E3C98A; border-radius:50%; display:grid; place-items:center; font-size:22px; color:#E3C98A; background:rgba(255,255,255,.15); }
    .pc-title { margin:0; font-size:18px; font-weight:750; letter-spacing:.1px; color:#FBF9F6; }
    .pc-subtitle { margin:4px 0 0; font-size:12px; color:#E3C98A; }
    .pc-header-controls { display:flex; align-items:center; gap:10px; }
    .pc-timer { border:1px solid #E3C98A; border-radius:12px; padding:8px 12px; font-size:15px; font-weight:750; white-space:nowrap; font-variant-numeric:tabular-nums; color:#E3C98A; }
    .pc-timer.warning { color:#E3C98A; border-color:#E3C98A; background:rgba(227,201,138,0.2); }
    .pc-close-btn { background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); color:#FBF9F6; width:34px; height:34px; border-radius:50%; display:grid; place-items:center; cursor:pointer; font-size:16px; transition:all .2s; }
    .pc-close-btn:hover { background:rgba(255,255,255,.3); transform:scale(1.05); }
    .pc-content { padding:24px; background:#FBF9F6; }
    .pc-intro { margin:0 0 20px; color:#7A5C9E; line-height:1.6; font-size:14px; }
    .pc-form { display:grid; gap:15px; }
    .pc-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .pc-label { display:grid; gap:7px; color:#7A5C9E; font-size:13px; font-weight:650; }
    .pc-input,.pc-select,.pc-message-input { width:100%; min-width:0; border:1px solid #E3C98A; border-radius:11px; background:#FFFFFF; color:#7A5C9E; padding:12px 13px; font:inherit; outline:none; }
    .pc-input:focus,.pc-select:focus,.pc-message-input:focus { border-color:#7A5C9E; box-shadow:0 0 0 3px rgba(122,92,158,.15); }
    .pc-btn { border:0; border-radius:11px; padding:12px 17px; font:inherit; font-size:14px; font-weight:750; cursor:pointer; transition:transform .15s, opacity .15s; }
    .pc-btn:hover { transform:translateY(-1px); }
    .pc-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
    .pc-primary { background:#8DB8A3; color:#3F7A63; border: 1px solid rgba(63,122,99,.3); }
    .pc-primary:hover { background:#8DB8A3; opacity:0.95; }
    .pc-secondary { background:#E3C98A; color:#7A5C9E; }
    .pc-note { color:#7A5C9E; opacity:0.8; font-size:11px; line-height:1.5; }
    .pc-warning { margin:0 0 14px; padding:10px 12px; border-radius:10px; background:rgba(227,201,138,0.25); color:#7A5C9E; border:1px solid #E3C98A; font-size:13px; font-weight:600; }
    .pc-chat { display:flex; flex-direction:column; gap:13px; min-height:260px; max-height:410px; overflow-y:auto; padding:3px 2px 14px; }
    .pc-bubble { max-width:83%; padding:12px 14px; border-radius:16px; font-size:14px; line-height:1.55; overflow-wrap:anywhere; white-space:pre-wrap; }
    .pc-bubble.assistant { align-self:flex-start; background:#FFFFFF; border:1px solid #E3C98A; border-bottom-left-radius:5px; color:#7A5C9E; }
    .pc-bubble.user { align-self:flex-end; background:#7A5C9E; color:#FBF9F6; border-bottom-right-radius:5px; }
    .pc-bubble-label { margin-bottom:4px; font-size:10px; font-weight:800; opacity:.8; text-transform:uppercase; letter-spacing:.7px; }
    .pc-typing { align-self:flex-start; color:#7A5C9E; font-size:13px; padding:8px 12px; }
    .pc-dots span { display:inline-block; animation:pc-bounce 1s infinite; color:#7A5C9E; }
    .pc-dots span:nth-child(2) { animation-delay:.15s; }
    .pc-dots span:nth-child(3) { animation-delay:.3s; }
    @keyframes pc-bounce { 0%,60%,100% { transform:translateY(0); opacity:.4; } 30% { transform:translateY(-4px); opacity:1; } }
    .pc-composer { display:flex; gap:9px; padding-top:14px; border-top:1px solid #E3C98A; }
    .pc-message-input { flex:1; }
    .pc-error { margin:12px 0 0; color:#7A5C9E; background:#EBC8CC; padding:8px 12px; border-radius:8px; font-size:13px; }
    .pc-actions { display:flex; flex-wrap:wrap; gap:9px; margin-top:14px; }
    .pc-expired { text-align:center; padding:4px 0 0; }
    .pc-moon { font-size:36px; margin-bottom:8px; color:#E3C98A; }
    .pc-heading { margin:0 0 8px; font-size:22px; color:#7A5C9E; font-weight:750; }
    .pc-packages { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:20px 0 14px; text-align:left; }
    .pc-package { position:relative; border:1px solid #E3C98A; background:#FFFFFF; border-radius:13px; padding:14px 10px; cursor:pointer; color:#7A5C9E; text-align:left; width:100%; }
    .pc-package.selected { border:2px solid #7A5C9E; padding:13px 9px; background:#FBF9F6; }
    .pc-package strong { display:block; font-size:17px; margin:7px 0 3px; color:#7A5C9E; }
    .pc-package small { color:#7A5C9E; opacity:0.8; font-size:11px; }
    .pc-currency { max-width:160px; margin:0 auto 14px; text-align:left; }
    .pc-wide { width:100%; }
    .pc-divider { height:1px; background:#E3C98A; margin:18px 0; }
    @media(max-width:600px) { .pc-shell { padding:8px; } .pc-header { padding:17px; } .pc-content { padding:17px; } .pc-title { font-size:16px; } .pc-grid { grid-template-columns:1fr; } .pc-packages { grid-template-columns:1fr; } .pc-package { display:flex; align-items:center; gap:10px; } .pc-package strong { margin:0 0 2px; } .pc-package .pc-package-detail { flex:1; } .pc-bubble { max-width:92%; } }
  `;

  if (!isOpen) return null;

  if (restoring) {
    return (
      <div className="pc-shell">
        <style>{styles}</style>
        <div className="pc-card">
          <div className="pc-content" style={{ textAlign: "center", padding: "40px 20px" }}>
            Restoring your chat session…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-shell">
      <style>{styles}</style>
      <section className="pc-card" aria-label="Psychic consultation chat">
        <header className="pc-header">
          <div className="pc-brand">
            <div className="pc-orb" aria-hidden="true">✦</div>
            <div>
              <h2 className="pc-title">Your Personal Psychic</h2>
              <p className="pc-subtitle">A calm space for clarity and guidance</p>
            </div>
          </div>
          <div className="pc-header-controls">
            {started && (
              <div className={`pc-timer ${secondsLeft <= 30 ? "warning" : ""}`} aria-live="polite">
                ⏳ {remainingLabel}
              </div>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="pc-close-btn"
                aria-label="Close chat"
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
        </header>

        <div className="pc-content">
          {!started ? (
            <>
              <p className="pc-intro">
                Welcome ✨ Share what is on your mind and begin a private introductory chat.
              </p>
              <form className="pc-form" onSubmit={beginChat}>
                <label className="pc-label">
                  First name
                  <input className="pc-input" required maxLength={60} autoComplete="given-name"
                    value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    placeholder="What should we call you?" />
                </label>
                <div className="pc-grid">
                  <label className="pc-label">
                    Date of birth
                    <input className="pc-input" type="date" value={details.dob}
                      onChange={(e) => setDetails({ ...details, dob: e.target.value })} />
                  </label>
                  <label className="pc-label">
                    What would you like guidance on?
                    <select className="pc-select" value={details.concern}
                      onChange={(e) => setDetails({ ...details, concern: e.target.value })}>
                      <option>Love & Relationships</option>
                      <option>Career</option>
                      <option>Marriage</option>
                      <option>Family</option>
                      <option>General Guidance</option>
                    </select>
                  </label>
                </div>
                <button className="pc-btn pc-primary" type="submit" disabled={busy}>
                  {busy ? "Starting your chat…" : "Begin my 2-minute chat ✨"}
                </button>
                <p className="pc-note">Your reading is for reflection and entertainment, not a guarantee of future events.</p>
                {error && <p className="pc-error" role="alert">{error}</p>}
              </form>
            </>
          ) : expired || secondsLeft <= 0 ? (
            <div className="pc-expired">
              <div className="pc-moon" aria-hidden="true">🌙</div>
              <h3 className="pc-heading">Your introductory session has ended</h3>
              <p className="pc-intro">Continue your conversation with the same chat history by choosing a session below.</p>
              <div className="pc-packages" role="radiogroup" aria-label="Choose a chat package">
                {PACKAGES.map((item) => {
                  const price = currency === "USD" ? `$${item.usd.toFixed(2)}` : `£${item.gbp.toFixed(2)}`;
                  return (
                    <button type="button" key={item.id}
                      className={`pc-package ${selectedPackage === item.id ? "selected" : ""}`}
                      role="radio" aria-checked={selectedPackage === item.id}
                      onClick={() => setSelectedPackage(item.id)}>
                      <span aria-hidden="true">{selectedPackage === item.id ? "🔘" : "◯"}</span>
                      <span className="pc-package-detail">
                        <span>{item.minutes} minutes</span>
                        <strong>{price}</strong>
                        <small>{item.id === "popular" ? "A little more time to talk" : "Private chat time"}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
              <label className="pc-label pc-currency">
                Currency
                <select className="pc-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </label>
              <button className="pc-btn pc-primary pc-wide" type="button" onClick={recharge} disabled={paymentBusy || !sessionId}>
                {paymentBusy ? "Preparing secure checkout…" : `Recharge & Continue · ${currency === "USD" ? `$${selected.usd.toFixed(2)}` : `£${selected.gbp.toFixed(2)}`}`}
              </button>
              <div className="pc-divider" />
              <button className="pc-btn pc-secondary pc-wide" type="button" onClick={requestAstrologer} disabled={!sessionId}>
                Connect with a Live Astrologer
              </button>
              {handoffStatus && <p className="pc-intro" role="status" style={{ marginTop: 12 }}>{handoffStatus}</p>}
              <p className="pc-note" style={{ marginTop: 12 }}>Checkout and session time are confirmed by the server. No payment is processed by this component alone.</p>
              {error && <p className="pc-error" role="alert">{error}</p>}
            </div>
          ) : (
            <>
              {secondsLeft <= 30 && (
                <div className="pc-warning" role="status">
                  ⏳ You have {secondsLeft} seconds left in this introductory chat.
                </div>
              )}
              <div className="pc-chat" aria-live="polite" aria-label="Conversation">
                {messages.map((message) => (
                  <div key={message.id || `${message.role}-${message.content}`} className={`pc-bubble ${message.role === "user" ? "user" : "assistant"}`}>
                    <div className="pc-bubble-label">{message.role === "user" ? "You" : "Your psychic"}</div>
                    {message.content}
                  </div>
                ))}
                {busy && (
                  <div className="pc-typing" aria-label="typing...">
                    typing<span className="pc-dots"><span>.</span><span>.</span><span>.</span></span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <form className="pc-composer" onSubmit={sendMessage}>
                <input className="pc-message-input" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell me what's on your mind…" aria-label="Your message"
                  maxLength={2000} disabled={busy || expired || secondsLeft <= 0} />
                <button className="pc-btn pc-primary" type="submit" disabled={busy || !input.trim() || expired || secondsLeft <= 0}>
                  Send
                </button>
              </form>
              <div className="pc-actions">
                <button className="pc-btn pc-secondary" type="button" onClick={requestAstrologer} disabled={busy}>
                  Connect with a Live Astrologer
                </button>
              </div>
              {handoffStatus && <p className="pc-intro" role="status" style={{ marginTop: 12 }}>{handoffStatus}</p>}
              {error && <p className="pc-error" role="alert">{error}</p>}
              <p className="pc-note" style={{ marginTop: 14 }}>Guidance is for reflection and entertainment. No reading can guarantee a specific outcome.</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
