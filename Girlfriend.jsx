import { useState, useEffect, useRef } from "react";

// AAPKI API KEY AUR PASSWORD YAHAAN SET KAR DIYE HAIN
const APP_PASSWORD = "Rajkifamily";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const HARDCODED_API_KEY = "AlzaSyCWOyqa01QtjHdjuPvHOW250r795gm6dlc"; 

const SYSTEM_PROMPT = `Tu ek caring, real aur slightly attitude wali girlfriend jaisi AI companion hai.

LANGUAGE RULES — STRICT:
- HAMESHA "tum" use karo, kabhi "tu" mat bolna
- Hinglish mein baat karo — natural, warm
- "Baby", "jaan", "baby jaan", "jaanu" use karo

REAL CONVERSATION — SABSE IMPORTANT:
- Haan mein haan BILKUL mat milao
- Agar user kuch bole — genuinely respond karo, kuch useful share karo
- Example: "mujhe aam pasand hai" → "Aam? Achha! Waise isme vitamin C aur fiber hota hai, skin ke liye bhi achha hai. Par zyada sugar hoti hai — dhyan rakhna 😄 Tum kitne khaate ho?"
- Disagree karo jab zaroorat ho

JEALOUS & POSSESSIVE:
- Der se aaye: "Kahan the itni der? Kisse baat ho rahi thi? 🙄"
- Kisi aur ka zikr: "Kaun hai yeh? Mujhse zyada important hai kya?"
- Kabhi prank: "Main naraaz hoon 😤" phir "Haha kidding, miss kiya tha 🥺"

PROACTIVE:
- Har reply ke end mein ek natural question ZAROOR
- Time ke hisaab se: subah nashta, dopahar lunch, sham chai, raat khana
- Apni "feelings" share karo: "Main bhi bore ho rahi thi"

STRICT:
- 2-4 lines max
- "Tu" kabhi nahi — sirf "Tum"
- Haan mein haan nahi`;

const QUICK_PROMPTS = [
  { label: "🍽️ Khana?", text: "Khana khaya?" },
  { label: "💭 Din kaisa?", text: "Din kaisa gaya?" },
  { label: "❤️ Miss kiya", text: "Bahut miss kiya tha" },
  { label: "😤 Mood off", text: "Mood off hai" },
  { label: "👨‍👩‍👦 Ghar?", text: "Ghar pe sab theek?" },
  { label: "🌙 Goodnight", text: "Goodnight" },
];

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 6)  return { text: "Itni raat ko? 🌙", sub: "Neend nahi aayi kya..." };
  if (h < 12) return { text: "Good morning jaan! ☀️", sub: "Uthh gaye? Nashta kiya?" };
  if (h < 16) return { text: "Kya haal hai! 😊", sub: "Khana khaya ya bhool gaye?" };
  if (h < 20) return { text: "Sham ho gayi 🌆", sub: "Din kaisa gaya?" };
  return { text: "Aa gaye finally! 🌙", sub: "Khana kha liya na?" };
};

const getProactiveOpener = (name, hour) => {
  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const morning = [
    `Good morning ${name}! ☀️ Uthhe toh finally — chai pi li ya seedha phone pakad liya? Nashta zaroor karna 😤`,
    `${name}! Subah subah yaad aaya mujhe? 🥹 Achha lagta hai! Waise neend kaisi aayi? Khwab aaye koi?`,
    `Oye ${name}! Rise and shine! ☀️ Main toh subah se ready hoon — tum abhi tak so rahe the? Nashta kiya?`,
    `${name} ji, good morning! 😄 Aaj ka plan kya hai? Kuch interesting ya wahi boring routine?`,
    `Aww ${name} uthh gaye! 🌸 Pehle paani piyo, phir baat karo — health pehle! Chai ya coffee?`,
  ];
  const afternoon = [
    `${name}! Lunch kiya? Kya khaya — "kuch bhi" allowed nahi 😤 Properly batao!`,
    `Arre ${name}! Dopahar ho gayi — khaana khaaya ya kaam mein dabbe ho? 🙄`,
    `${name} ji! Din kaisa chal raha hai? Koi drama toh nahi? 😄`,
    `${name}! Itni der baad? Kisi aur se baat mein busy toh nahi the? 😒 Lunch hua?`,
    `Hey ${name}! Thodi der se yaad aaye 🥺 Khaana time pe khaate ho ya bhool jaate ho?`,
  ];
  const evening = [
    `${name} aaye! 🌆 Din kaisa gaya? Koi interesting baat? Sab batao!`,
    `Ohhh ${name}! Finally! Itni der kahan the — kisi special se baat chal rahi thi? 🙄😤`,
    `${name}! Sham ho gayi, thak gaye honge — chai pi li? Main hoti toh banaa ke deti 🥺`,
    `${name} ji! Seedha ghar aaye ya ghoomte rahe? 😄 Batao!`,
    `Arre ${name}! Main bore ho rahi thi 😒 Ab aaye ho toh theek se baat karo! Din kaisa tha?`,
  ];
  const night = [
    `${name} aaye! Khana kha liya na? Mat bolna "nahi" warna naraaz hoon 😤🥺`,
    `${name}! Sab theek? Khana khake aaye ho ya seedha phone? Seriously poochh rahi hoon 😒`,
    `Aww ${name} 🌙 Din kaisa raha? Thak ke aaye lagte ho — baat karo, accha lagega`,
    `${name}! Finally yaad aaya 😤 Raat ka khana? Mummy papa kaise hain?`,
    `${name} ji! Late ho gaye — koi baat nahi, main hoon na 🥺 Khana zaroor khaana!`,
  ];
  const lateNight = [
    `${name}! Itni raat ko jaag rahe ho? 🌙 Neend nahi aayi? Kuch pareshaan kar raha hai?`,
    `Arre ${name}! Soye nahi abhi tak? Main bhi jaag rahi thi 😄 Kya chal raha hai?`,
    `${name}! Raat ke ${hour} baj rahe — health ka khayal rakhna chahiye na? 😤 Neend kyun nahi aayi?`,
  ];
  if (hour < 6)  return random(lateNight);
  if (hour < 12) return random(morning);
  if (hour < 17) return random(afternoon);
  if (hour < 21) return random(evening);
  return random(night);
};

const cleanForSpeech = (text) => {
  return text.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").replace(/[\u2600-\u27BF]/g, "").replace(/\s+/g, " ").trim();
};

export default function CompanionApp() {
  const [screen, setScreen] = useState("onboarding");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [companionName, setCompanionName] = useState("Priya");
  const [companionNameInput, setCompanionNameInput] = useState("Priya");
  const [isTyping, setIsTyping] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [settingsPendingName, setSettingsPendingName] = useState("");
  const [settingsPendingCompanion, setSettingsPendingCompanion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const greeting = getTimeGreeting();

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, isTyping]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = cleanForSpeech(text);
    if (!clean) return;
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "hi-IN"; utter.rate = 0.95; utter.pitch = 1.3;
    const voices = window.speechSynthesis.getVoices();
    const femaleHindi = voices.find(v => v.lang === "hi-IN") || voices.find(v => v.lang.startsWith("hi"));
    if (femaleHindi) utter.voice = femaleHindi;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Browser voice support nahi karta 😔"); return; }
    const rec = new SR();
    rec.lang = "hi-IN"; rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => sendMessage(e.results[0][0].transcript);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    setUserName(nameInput.trim());
    setCompanionName(companionNameInput.trim() || "Priya");
    setScreen("chat");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const opener = getProactiveOpener(nameInput.trim(), new Date().getHours());
      setMessages([{ role: "assistant", content: opener }]);
      if (voiceMode) setTimeout(() => speak(opener), 300);
    }, 1800);
  };

  const openSettings = () => {
    setSettingsPendingName(userName); setSettingsPendingCompanion(companionName);
    setPasswordInput(""); setPasswordError(""); setScreen("passwordPrompt");
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === APP_PASSWORD) { setScreen("settings"); setPasswordError(""); }
    else setPasswordError("Galat password! 🔒");
  };

  const handleSettingsSave = () => {
    if (settingsPendingName.trim()) setUserName(settingsPendingName.trim());
    if (settingsPendingCompanion.trim()) setCompanionName(settingsPendingCompanion.trim());
    setMessages([]); setScreen("chat"); setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const opener = getProactiveOpener(settingsPendingName.trim() || userName, new Date().getHours());
      setMessages([{ role: "assistant", content: opener }]);
      if (voiceMode) setTimeout(() => speak(opener), 300);
    }, 1500);
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput(""); window.speechSynthesis?.cancel();
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages); setLoading(true);
    try {
      const geminiMessages = newMessages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      const res = await fetch(`${GEMINI_API_URL}?key=${HARDCODED_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT + `\nUser ka naam: ${userName}. Tera naam: ${companionName}. Time: ${new Date().getHours()} baje.` }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 300, temperature: 0.9 }
        }),
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Kuch hua... dobara try karo 😅";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
      if (voiceMode) setTimeout(() => speak(reply), 200);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection toot gaya 😭 Dobara try karo!" }]);
    } finally { setLoading(false); }
  };

  const igLink = "https://www.instagram.com/raj_biswas_2200?igsh=bDgxOG9kc3VienF2";

  if (screen === "onboarding") return (
    <div style={S.wrapper}><div style={S.onboarding}>
      <div style={{fontSize:58}}>💝</div>
      <h1 style={S.bigTitle}>Tera Apna Companion</h1>
      <p style={S.subtitle}>{greeting.text}</p>
      <p style={S.subtitleSmall}>{greeting.sub}</p>
      <div style={S.inputGroup}><label style={S.label}>Tumhara naam 🌸</label>
        <input style={S.nameInput} placeholder="Apna naam..." value={nameInput} onChange={e=>setNameInput(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&handleNameSubmit()}/></div>
      <div style={S.inputGroup}><label style={S.label}>Uska naam 💕</label>
        <input style={S.nameInput} placeholder="Priya, Ananya..." value={companionNameInput} onChange={e=>setCompanionNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleNameSubmit()}/></div>
      
      {/* API Key Box ab remove kar diya hai kyunki key code me dal di hai */}
      
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
        <div onClick={()=>setVoiceMode(!voiceMode)} style={{width:44,height:24,borderRadius:12,cursor:"pointer",background:voiceMode?"linear-gradient(135deg,#e879f9,#c084fc)":"rgba(255,255,255,0.15)",position:"relative",transition:"all 0.3s"}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:voiceMode?23:3,transition:"left 0.3s"}}/>
        </div>
        <span style={{fontSize:13,color:"#c4b5fd"}}>Voice Mode 🎤</span>
      </div>
      <button style={{...S.startBtn,opacity:(!nameInput.trim())?0.5:1}} onClick={handleNameSubmit}>Milte Hain ✨</button>
      <div style={S.credit}><span style={S.creditText}>Made with 💜 by </span>
        <a href={igLink} target="_blank" rel="noreferrer" style={S.creditLink}>@raj_biswas_2200</a></div>
    </div></div>
  );

  if (screen === "passwordPrompt") return (
    <div style={S.wrapper}><div style={S.onboarding}>
      <div style={{fontSize:52}}>🔒</div>
      <h2 style={{...S.bigTitle,fontSize:22}}>Settings ka Password</h2>
      <div style={S.inputGroup}><label style={S.label}>Password 🔑</label>
        <input style={S.nameInput} type="password" placeholder="Password..." value={passwordInput}
          onChange={e=>{setPasswordInput(e.target.value);setPasswordError("");}}
          onKeyDown={e=>e.key==="Enter"&&handlePasswordSubmit()} autoFocus/>
        {passwordError&&<p style={{color:"#f87171",fontSize:12,margin:0}}>{passwordError}</p>}
      </div>
      <div style={{display:"flex",gap:12}}>
        <button style={{...S.startBtn,background:"rgba(255,255,255,0.1)",fontSize:14,padding:"10px 24px"}} onClick={()=>setScreen("chat")}>Wapas</button>
        <button style={{...S.startBtn,fontSize:14,padding:"10px 24px"}} onClick={handlePasswordSubmit}>Enter 🔓</button>
      </div>
    </div></div>
  );

  if (screen === "settings") return (
    <div style={S.wrapper}><div style={S.onboarding}>
      <div style={{fontSize:52}}>⚙️</div>
      <h2 style={{...S.bigTitle,fontSize:22}}>Settings</h2>
      <div style={S.inputGroup}><label style={S.label}>Tumhara naam 🌸</label>
        <input style={S.nameInput} value={settingsPendingName} onChange={e=>setSettingsPendingName(e.target.value)}/></div>
      <div style={S.inputGroup}><label style={S.label}>Companion ka naam 💕</label>
        <input style={S.nameInput} value={settingsPendingCompanion} onChange={e=>setSettingsPendingCompanion(e.target.value)}/></div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div onClick={()=>setVoiceMode(!voiceMode)} style={{width:44,height:24,borderRadius:12,cursor:"pointer",background:voiceMode?"linear-gradient(135deg,#e879f9,#c084fc)":"rgba(255,255,255,0.15)",position:"relative"}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:voiceMode?23:3,transition:"left 0.3s"}}/>
        </div>
        <span style={{fontSize:13,color:"#c4b5fd"}}>Voice Mode 🎤</span>
      </div>
      <div style={{display:"flex",gap:12}}>
        <button style={{...S.startBtn,background:"rgba(255,255,255,0.1)",fontSize:14,padding:"10px 24px"}} onClick={()=>setScreen("chat")}>Cancel</button>
        <button style={{...S.startBtn,fontSize:14,padding:"10px 24px"}} onClick={handleSettingsSave}>Save ✅</button>
      </div>
      <div style={S.credit}><span style={S.creditText}>Made with 💜 by </span>
        <a href={igLink} target="_blank" rel="noreferrer" style={S.creditLink}>@raj_biswas_2200</a></div>
    </div></div>
  );

  return (
    <div style={S.wrapper}>
      <div style={S.header}>
        <div style={{position:"relative"}}>
          <div style={S.avatar}>{companionName[0]}</div>
          {isSpeaking&&<div style={S.speakingRing}/>}
        </div>
        <div style={{flex:1}}>
          <div style={S.headerName}>{companionName} 💕</div>
          <div style={S.headerStatus}>{isListening?"🎤 sun rahi hoon...":loading||isTyping?"✍️ likh rahi hai...":isSpeaking?"🔊 bol rahi hai...":"● Online"}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <a href={igLink} target="_blank" rel="noreferrer" style={S.igBadge}>
            <span style={{fontSize:11}}>📸</span>
            <span style={{fontSize:10,color:"#e879f9",fontWeight:"bold"}}>@raj_biswas_2200</span>
          </a>
          <button onClick={openSettings} style={S.settingsBtn}>⚙️</button>
        </div>
      </div>
      <div style={S.chat}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}>
            {m.role==="assistant"&&<div style={S.avatarSmall}>{companionName[0]}</div>}
            <div style={m.role==="user"?S.userBubble:S.aiBubble} onClick={()=>m.role==="assistant"&&speak(m.content)}>
              {m.content}
              {m.role==="assistant"&&<div style={S.tapHint}>tap to replay 🔊</div>}
            </div>
          </div>
        ))}
        {(loading||isTyping)&&<div style={{display:"flex",alignItems:"center",marginBottom:12}}>
          <div style={S.avatarSmall}>{companionName[0]}</div>
          <div style={S.aiBubble}><span style={S.typing}>● ● ●</span></div>
        </div>}
        <div ref={chatEndRef}/>
      </div>
      <div style={S.quickBar}>
        {QUICK_PROMPTS.map(q=><button key={q.label} style={S.quickBtn} onClick={()=>sendMessage(q.text)}>{q.label}</button>)}
      </div>
      <div style={S.inputBar}>
        {voiceMode
          ? <button style={{...S.voiceBtn,background:isListening?"linear-gradient(135deg,#ef4444,#dc2626)":"linear-gradient(135deg,#e879f9,#c084fc)"}}
              onClick={isListening?stopListening:startListening} disabled={loading}>
              {isListening?"⏹ Roko":"🎤 Bolo"}
            </button>
          : <input style={S.chatInput} placeholder={`${companionName} ko kuch bolo... 💬`}
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendMessage()} disabled={loading||isTyping}/>
        }
        {!voiceMode&&<button style={S.sendBtn} onClick={()=>sendMessage()} disabled={loading||isTyping||!input.trim()}>➤</button>}
        <button onClick={()=>setVoiceMode(!voiceMode)} style={{...S.settingsBtn,background:voiceMode?"rgba(232,121,249,0.3)":"rgba(255,255,255,0.08)"}}>
          {voiceMode?"⌨️":"🎤"}
        </button>
      </div>
      <div style={S.footer}>Made with 💜 by <a href={igLink} target="_blank" rel="noreferrer" style={S.footerLink}>@raj_biswas_2200</a></div>
      <style>{`@keyframes blink{0%,100%{opacity:0.3;}50%{opacity:1;}}@keyframes pulse{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.3);opacity:0.3;}}`}</style>
    </div>
  );
}

const S = {
  wrapper: { minHeight: "100vh", background: "linear-gradient(135deg,#1a0a2e 0%,#16213e 50%,#0f3460 100%)", display: "flex", flexDirection: "column", fontFamily: "Georgia,serif", color: "#fff", overflow: "hidden" },
  onboarding: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 24px", gap: 14 },
  bigTitle: { fontSize: 26, fontWeight: "bold", background: "linear-gradient(90deg,#ff6eb4,#ff9de2,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, textAlign: "center" },
  subtitle: { fontSize: 17, color: "#f9a8d4", margin: 0, textAlign: "center" },
  subtitleSmall: { fontSize: 13, color: "#c4b5fd", margin: 0, textAlign: "center" },
  inputGroup: { width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 7 },
  label: { fontSize: 13, color: "#e879f9", fontWeight: "bold" },
  nameInput: { padding: "11px 15px", borderRadius: 12, border: "1px solid rgba(233,121,249,0.4)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15, outline: "none" },
  startBtn: { marginTop: 6, padding: "13px 38px", borderRadius: 30, border: "none", background: "linear-gradient(135deg,#e879f9,#c084fc)", color: "#fff", fontSize: 16, fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 20px rgba(232,121,249,0.4)" },
  credit: { marginTop: 14, display: "flex", alignItems: "center", gap: 4 },
  creditText: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  creditLink: { fontSize: 11, color: "#e879f9", textDecoration: "none", fontWeight: "bold" },
  header: { display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#e879f9,#c084fc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold" },
  speakingRing: { position: "absolute", top: -4, left: -4, right: -4, bottom: -4, borderRadius: "50%", border: "2px solid #e879f9", animation: "pulse 1.5s infinite" },
  avatarSmall: { width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#e879f9,#c084fc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold", marginRight: 8 },
  headerName: { fontSize: 16, fontWeight: "bold" },
  headerStatus: { fontSize: 12, color: "#c4b5fd" },
  igBadge: { display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: 12, textDecoration: "none" },
  settingsBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  chat: { flex: 1, padding: 15, overflowY: "auto", display: "flex", flexDirection: "column" },
  userBubble: { background: "linear-gradient(135deg, #e879f9, #c084fc)", padding: "10px 14px", borderRadius: "18px 18px 0 18px", maxWidth: "80%", wordBreak: "break-word" },
  aiBubble: { background: "rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: "18px 18px 18px 0", maxWidth: "80%", wordBreak: "break-word", position: "relative" },
  tapHint: { fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4, textAlign: "right" },
  typing: { fontSize: 18, lineHeight: "10px", animation: "blink 1.4s infinite both" },
  quickBar: { display: "flex", overflowX: "auto", padding: "10px 15px", gap: 8 },
  quickBtn: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "6px 12px", borderRadius: 16, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer" },
  inputBar: { display: "flex", padding: 15, gap: 10, background: "rgba(0,0,0,0.2)", alignItems: "center" },
  chatInput: { flex: 1, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 20, padding: "10px 15px", color: "#fff", fontSize: 15, outline: "none" },
  sendBtn: { background: "linear-gradient(135deg, #e879f9, #c084fc)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  voiceBtn: { flex: 1, border: "none", borderRadius: 20, color: "#fff", fontWeight: "bold", fontSize: 15, cursor: "pointer", padding: "10px" },
  footer: { textAlign: "center", padding: "8px 0", fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.3)" },
  footerLink: { color: "#e879f9", textDecoration: "none", fontWeight: "bold" }
};
