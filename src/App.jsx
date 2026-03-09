import { useState, useEffect } from "react";

// ============================================================
// YAPILANDIRMA — Buraya kendi anahtarlarınızı girin
// ============================================================
const CONFIG = {
  // 1. Firebase Console → Project Settings → Your Apps → Web App
  firebase: {
    apiKey: "AIzaSyDbIDtWRJH7JKnTsJZNA-CAo0vklOSX35o",
    authDomain: "entelligence-5671d.firebaseapp.com",
    projectId: "entelligence-5671d",
    storageBucket: "entelligence-5671d.firebasestorage.app",
    messagingSenderId: "527718510137",
    appId: "1:527718510137:web:2247273dc6182dd1d527e8",
  },
  // 2. Stripe Dashboard → Products → Payment Link URL
  stripePaymentLink: "https://buy.stripe.com/STRIPE_LINK_BURAYA",
  // 3. Anthropic Console → API Keys
  anthropicKey: "ANTHROPIC_API_KEY_BURAYA",
};
// ============================================================

// Firebase SDK'yı dinamik yükle
async function loadFirebase() {
  const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js");
  const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } =
    await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js");
  const { getFirestore, doc, getDoc, setDoc, updateDoc, increment } =
    await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");

  const app = getApps().length === 0 ? initializeApp(CONFIG.firebase) : getApps()[0];
  const auth = getAuth(app);
  const db = getFirestore(app);

  return { auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, increment };
}

// ── Renkler ──────────────────────────────────────────────────
const C = {
  bg: "#07090F",
  surface: "#0E1420",
  card: "#121A2B",
  border: "#1C2A40",
  accent: "#2DD4BF",
  accentDark: "#0F766E",
  gold: "#F59E0B",
  green: "#10B981",
  red: "#F43F5E",
  purple: "#818CF8",
  text: "#F1F5F9",
  muted: "#64748B",
  subtle: "#1E2D42",
};

// ── KBB Vaka Veritabanı ──────────────────────────────────────
const ENT_CASES = [
  { yas:52, cinsiyet:"Erkek", sikayet:"Sağ kulakta dolgunluk ve işitme azlığı", otoskopi:"Sağ kulakta seröz otitis media", nazofarenks:"Sağ Rosenmüller fossasında düzensiz kitle", tetkik:"odyometri nazofarenks mr biyopsi", tani:"Nazofarenks karsinomu", tedavi:"Radyasyon onkoloji yönlendirme" },
  { yas:42, cinsiyet:"Kadın", sikayet:"Kulakta dolgunluk", otoskopi:"Sağ kulakta seröz effüzyon", nazofarenks:"Normal", tetkik:"Timpanometri", tani:"Seröz otitis media", tedavi:"Medikal tedavi" },
  { yas:50, cinsiyet:"Erkek", sikayet:"İşitme kaybı", otoskopi:"Normal", tetkik:"odyometri", tani:"Otoskleroz", tedavi:"Cerrahi değerlendirme" },
  { yas:28, cinsiyet:"Kadın", sikayet:"Kulak ağrısı", otoskopi:"Hiperemik timpanik membran", tetkik:"Klinik değerlendirme", tani:"Akut otitis media", tedavi:"Antibiyotik" },
  { yas:45, cinsiyet:"Kadın", sikayet:"Ani işitme kaybı", otoskopi:"Normal", tetkik:"odyometri", tani:"Ani sensörinöral işitme kaybı", tedavi:"Steroid" },
  { yas:52, cinsiyet:"Erkek", sikayet:"Kulak akıntısı", otoskopi:"Timpanik membran perforasyonu", tetkik:"odyometri", tani:"Kronik otitis media", tedavi:"Medikal tedavi + Cerrahi planlama" },
  { yas:38, cinsiyet:"Kadın", sikayet:"Baş dönmesi", otoskopi:"Normal", tetkik:"odyometri", tani:"Meniere hastalığı", tedavi:"Medikal tedavi" },
  { yas:41, cinsiyet:"Erkek", sikayet:"Kulak çınlaması", otoskopi:"Normal", tetkik:"odyometri", tani:"Gürültüye bağlı işitme kaybı", tedavi:"Takip" },
  { yas:60, cinsiyet:"Erkek", sikayet:"Kulakta kaşıntı", otoskopi:"Fungal debris", tetkik:"Klinik değerlendirme", tani:"Otomikoz", tedavi:"Antifungal" },
  { yas:27, cinsiyet:"Erkek", sikayet:"Burun tıkanıklığı", nazofarenks:"nazal septum deviye", tetkik:"paranazal BT", tani:"Septal deviasyon", tedavi:"Septoplasti" },
  { yas:34, cinsiyet:"Kadın", sikayet:"Yüz ağrısı", nazofarenks:"Nazal mukozada ödem, seropürülan akıntı", tetkik:"Paranazal BT", tani:"Akut sinüzit", tedavi:"Antibiyotik" },
  { yas:23, cinsiyet:"Kadın", sikayet:"Hapşırık burun akıntısı", nazofarenks:"Nazal mukozada ödem", tetkik:"Alerji testi", tani:"Alerjik rinit", tedavi:"Antihistaminik" },
  { yas:44, cinsiyet:"Erkek", sikayet:"Burun kanaması", nazofarenks:"Kanama odağı", tetkik:"Klinik değerlendirme", tani:"Epistaksis", tedavi:"Tampon/koterizasyon" },
  { yas:47, cinsiyet:"Kadın", sikayet:"Burun tıkanıklığı", nazofarenks:"Nazal polip", tetkik:"BT", tani:"Kronik rinosinüzit", tedavi:"Cerrahi" },
  { yas:30, cinsiyet:"Kadın", sikayet:"Boğaz ağrısı", orofarenks:"Tonsiller hiperemik", tetkik:"Klinik değerlendirme", tani:"Akut tonsillit", tedavi:"Antibiyotik" },
  { yas:45, cinsiyet:"Erkek", sikayet:"Ses kısıklığı", ind_laringoskopi:"Larenkste lezyon", tetkik:"boyun mr", tani:"Larenks malignitesi şüphesi", tedavi:"Biyopsi" },
  { yas:26, cinsiyet:"Kadın", sikayet:"Ses kısıklığı", ind_laringoskopi:"Vokal kord nodülü", tetkik:"Laringoskopi", tani:"Vokal kord nodülü", tedavi:"Ses terapisi" },
  { yas:33, cinsiyet:"Erkek", sikayet:"Boğazda yanma", ind_laringoskopi:"Larenks hiperemi", tetkik:"Klinik değerlendirme", tani:"Laringofaringeal reflü", tedavi:"PPI" },
  { yas:35, cinsiyet:"Erkek", sikayet:"Kulak çınlaması", otoskopi:"Normal", tetkik:"odyometri", tani:"Subjektif tinnitus", tedavi:"Medikal tedavi" },
  { yas:55, cinsiyet:"Erkek", sikayet:"Boyunda ağrısız kitle", nazofarenks:"Nazofarenkste düzensiz kitle", tetkik:"boyun mr biyopsi", tani:"Nazofarenks karsinomu metastatik lenf nodu", tedavi:"Radyasyon onkoloji yönlendirme" },
];

// ── RAG ──────────────────────────────────────────────────────
function tok(t) { return (t||"").toLowerCase().replace(/[,;.:()]/g," ").split(/\s+/).filter(w=>w.length>2); }
function sim(a,b) { const sa=new Set(a),sb=new Set(b),all=new Set([...sa,...sb]); let d=0,ma=0,mb=0; all.forEach(t=>{const x=sa.has(t)?1:0,y=sb.has(t)?1:0; d+=x*y; ma+=x*x; mb+=y*y;}); return ma&&mb?d/(Math.sqrt(ma)*Math.sqrt(mb)):0; }
function caseText(c) { return [c.sikayet,c.otoskopi,c.nazofarenks,c.orofarenks,c.ind_laringoskopi,c.tetkik,c.tani].filter(Boolean).join(" "); }
function retrieveCases(hasta, k=5) {
  const q = tok([hasta.sikayet,hasta.otoskopi,hasta.nazofarenks,hasta.orofarenks,hasta.ind_laringoskopi,hasta.tetkik].filter(Boolean).join(" "));
  return ENT_CASES.map(c=>({...c,score:sim(q,tok(caseText(c)))})).sort((a,b)=>b.score-a.score).slice(0,k);
}

// ── Claude API ───────────────────────────────────────────────
async function callClaude(hasta, cases) {
  const ctx = cases.map((c,i)=>`Vaka ${i+1} (${(c.score*100).toFixed(0)}% benzer): ${c.yas}y ${c.cinsiyet} — ${c.sikayet} → Tanı: ${c.tani} → Tedavi: ${c.tedavi}`).join("\n");
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1000,
      system:`Sen deneyimli bir KBB uzmanısın. Klinik karar desteği sağlıyorsun. SADECE JSON döndür:
{"olasi_tanilar":[{"tani":"...","guven":85,"aciklama":"..."}],"ayirici_tani":["..."],"tedavi_plani":"...","ek_tetkik":["..."],"aciliyet":"elektif","klinik_not":"...","uyari":"..."}
aciliyet: elektif|oncelikli|acil|sevk`,
      messages:[{role:"user",content:`Hasta: ${hasta.yas}y ${hasta.cinsiyet}, Şikayet: ${hasta.sikayet}\nOtoskopi: ${hasta.otoskopi||"Normal"}\nNazofarenks: ${hasta.nazofarenks||"Normal"}\nOrofarenks: ${hasta.orofarenks||"Normal"}\nLaringoskopi: ${hasta.ind_laringoskopi||"Normal"}\nTetkik: ${hasta.tetkik||"-"}\n\nBenzer vakalar:\n${ctx}`}]
    })
  });
  const d = await res.json();
  const raw = d.content?.map(b=>b.text||"").join("")||"";
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); }
  catch { return {error:raw}; }
}

// ── UI Bileşenleri ───────────────────────────────────────────
const Btn = ({children, onClick, color=C.accent, disabled, small, outline}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: outline ? "transparent" : disabled ? C.subtle : color+"22",
    border:`1px solid ${disabled ? C.border : color}`,
    borderRadius:8, padding: small?"6px 14px":"12px 24px",
    color: disabled ? C.muted : color,
    fontWeight:700, fontSize: small?12:14, cursor:disabled?"not-allowed":"pointer",
    transition:"all .15s", fontFamily:"inherit",
  }}>{children}</button>
);

const Field = ({label, value, onChange, placeholder, rows=2}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    <label style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{label}</label>
    {rows===1
      ? <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
      : <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
          style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical"}}/>
    }
  </div>
);

const Badge = ({label,color}) => (
  <span style={{background:color+"18",color,border:`1px solid ${color}33`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>{label}</span>
);

const GuvenBar = ({pct}) => {
  const color = pct>70?C.green:pct>40?C.gold:C.muted;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:5,background:C.subtle,borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:3}}/>
      </div>
      <span style={{color,fontWeight:700,fontSize:12,minWidth:32}}>{pct}%</span>
    </div>
  );
};

const AcilBadge = ({a}) => {
  const m={elektif:{c:C.green,l:"Elektif"},oncelikli:{c:C.gold,l:"Öncelikli"},acil:{c:C.red,l:"ACİL 🚨"},sevk:{c:"#F97316",l:"SEVK ➜"}};
  const {c,l}=m[a]||m.elektif;
  return <Badge label={l} color={c}/>;
};

// ── ANA UYGULAMA ─────────────────────────────────────────────
export default function App() {
  const [fb, setFb] = useState(null);
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("login"); // login | paywall | app
  const [appStep, setAppStep] = useState("form");
  const [hasta, setHasta] = useState({yas:"",cinsiyet:"Erkek",sikayet:"",otoskopi:"",nazofarenks:"",orofarenks:"",ind_laringoskopi:"",tetkik:""});
  const [result, setResult] = useState(null);
  const [cases, setCases] = useState([]);
  const [activeTab, setActiveTab] = useState("tani");
  const [progress, setProgress] = useState("");

  // Firebase yükle
  useEffect(()=>{
    loadFirebase().then(f=>{
      setFb(f);
      f.onAuthStateChanged(f.auth, async (u)=>{
        setUser(u);
        if(u){
          // Firestore'dan kullanıcı dokümanını oku
          const ref = f.doc(f.db,"users",u.uid);
          const snap = await f.getDoc(ref);
          if(!snap.exists()){
            // İlk giriş — kayıt oluştur
            const data = {
              email:u.email, name:u.displayName, photo:u.photoURL,
              plan:"free", analysisCount:0, createdAt:new Date().toISOString()
            };
            await f.setDoc(ref, data);
            setUserDoc(data);
            setScreen("paywall");
          } else {
            const data = snap.data();
            setUserDoc(data);
            setScreen(data.plan==="pro" ? "app" : "paywall");
          }
        } else {
          setScreen("login");
        }
        setAuthLoading(false);
      });
    });
  },[]);

  const handleGoogleLogin = async () => {
    if(!fb) return;
    const provider = new fb.GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    await fb.signInWithPopup(fb.auth, provider);
  };

  const handleLogout = async () => {
    await fb.signOut(fb.auth);
    setUserDoc(null); setResult(null); setAppStep("form");
  };

  const handleAnaliz = async () => {
    setAppStep("loading");
    setProgress("Benzer vakalar aranıyor...");
    await new Promise(r=>setTimeout(r,400));
    const similar = retrieveCases(hasta);
    setCases(similar);
    setProgress("AI analizi yapılıyor...");
    const res = await callClaude(hasta, similar);
    // Kullanım sayacını artır
    if(fb && user){
      const ref = fb.doc(fb.db,"users",user.uid);
      await fb.updateDoc(ref,{analysisCount: fb.increment(1)});
    }
    setResult(res);
    setAppStep("result");
  };

  const sf = k => v => setHasta(p=>({...p,[k]:v}));

  // ── LOADING ──
  if(authLoading) return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12,animation:"spin 1.5s linear infinite",display:"inline-block"}}>🫁</div>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <div style={{color:C.muted,fontSize:14}}>Yükleniyor...</div>
      </div>
    </div>
  );

  // ── GİRİŞ EKRANI ──
  if(screen==="login") return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:48,maxWidth:420,width:"90%",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:16}}>🫁</div>
        <h1 style={{margin:"0 0 8px",fontSize:26,fontWeight:800,
          background:`linear-gradient(90deg,${C.accent},${C.purple})`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          ENT AI Assistant
        </h1>
        <p style={{color:C.muted,fontSize:14,margin:"0 0 32px",lineHeight:1.7}}>
          KBB uzmanları için yapay zeka destekli<br/>klinik karar destek sistemi
        </p>
        <button onClick={handleGoogleLogin} style={{
          width:"100%",padding:"14px",borderRadius:10,cursor:"pointer",
          background:"#fff",border:"none",
          display:"flex",alignItems:"center",justifyContent:"center",gap:12,
          fontSize:15,fontWeight:700,color:"#333",fontFamily:"inherit",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google ile Giriş Yap
        </button>
        <p style={{color:C.muted,fontSize:11,marginTop:20}}>
          Giriş yaparak kullanım koşullarını kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );

  // ── ÖDEME EKRANI ──
  if(screen==="paywall") return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif",padding:24}}>
      <div style={{maxWidth:480,width:"100%"}}>
        {/* Kullanıcı bilgisi */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,justifyContent:"flex-end"}}>
          <img src={user?.photoURL} style={{width:32,height:32,borderRadius:"50%"}} alt=""/>
          <span style={{color:C.muted,fontSize:13}}>{user?.email}</span>
          <Btn small outline color={C.muted} onClick={handleLogout}>Çıkış</Btn>
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:40,textAlign:"center"}}>
          <div style={{display:"inline-block",background:C.gold+"18",border:`1px solid ${C.gold}33`,
            borderRadius:50,padding:"8px 20px",fontSize:12,fontWeight:700,color:C.gold,marginBottom:20}}>
            🔐 Pro Üyelik Gerekli
          </div>
          <h2 style={{margin:"0 0 8px",fontSize:26,fontWeight:800,color:C.text}}>
            ENT AI Pro
          </h2>
          <div style={{fontSize:40,fontWeight:900,color:C.accent,margin:"16px 0 4px"}}>
            ₺599
            <span style={{fontSize:16,fontWeight:400,color:C.muted}}>/ay</span>
          </div>
          <p style={{color:C.muted,fontSize:13,margin:"0 0 28px"}}>KDV dahil · İstediğiniz zaman iptal</p>

          {/* Özellikler */}
          {["✓  Sınırsız hasta analizi","✓  AI destekli tanı önerisi","✓  Tedavi planı ve klinik not","✓  208 KBB vakası ile RAG sistemi","✓  Yeni vakalar her ay ekleniyor"].map(f=>(
            <div key={f} style={{color:C.text,fontSize:14,padding:"8px 0",
              borderBottom:`1px solid ${C.border}`,textAlign:"left"}}>{f}</div>
          ))}

          <a href={CONFIG.stripePaymentLink} target="_blank" rel="noreferrer"
            style={{display:"block",marginTop:28,padding:"16px",borderRadius:10,
              background:`linear-gradient(90deg,${C.accent},${C.purple})`,
              color:"#fff",fontWeight:800,fontSize:16,textDecoration:"none",
              fontFamily:"inherit"}}>
            Şimdi Abone Ol →
          </a>

          <p style={{color:C.muted,fontSize:11,marginTop:16}}>
            Stripe ile güvenli ödeme · Ödeme sonrası erişiminiz otomatik açılır
          </p>

          {/* Geliştirici / test modu */}
          <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${C.border}`}}>
            <p style={{color:C.muted,fontSize:11,marginBottom:8}}>Geliştirici: Test için erişimi manuel aç</p>
            <Btn small color={C.purple} onClick={async()=>{
              if(!fb||!user) return;
              const ref = fb.doc(fb.db,"users",user.uid);
              await fb.updateDoc(ref,{plan:"pro"});
              setUserDoc(p=>({...p,plan:"pro"}));
              setScreen("app");
            }}>🛠 Test Erişimi Aç</Btn>
          </div>
        </div>
      </div>
    </div>
  );

  // ── ANA UYGULAMA ──
  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'DM Sans',system-ui,sans-serif",color:C.text}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>🫁</span>
          <span style={{fontWeight:800,fontSize:17,
            background:`linear-gradient(90deg,${C.accent},${C.purple})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ENT AI Assistant</span>
          <Badge label="PRO" color={C.gold}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{color:C.muted,fontSize:12}}>{userDoc?.analysisCount||0} analiz yapıldı</span>
          <img src={user?.photoURL} style={{width:30,height:30,borderRadius:"50%"}} alt=""/>
          <span style={{color:C.muted,fontSize:13}}>{user?.displayName?.split(" ")[0]}</span>
          <Btn small outline color={C.muted} onClick={handleLogout}>Çıkış</Btn>
        </div>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"28px 20px"}}>

        {/* FORM */}
        {appStep==="form" && (
          <div>
            <div style={{background:C.gold+"12",border:`1px solid ${C.gold}25`,borderRadius:10,
              padding:"11px 16px",marginBottom:22,color:C.gold,fontSize:13}}>
              ⚕️ Bu sistem klinik karar <strong>desteği</strong> sağlar — nihai karar muayene eden hekime aittir.
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28}}>
              <h3 style={{margin:"0 0 22px",fontSize:15,fontWeight:700,color:C.accent}}>Hasta Bilgileri</h3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
                <Field label="Yaş" value={hasta.yas} onChange={sf("yas")} placeholder="45" rows={1}/>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Cinsiyet</label>
                  <div style={{display:"flex",gap:8}}>
                    {["Erkek","Kadın"].map(c=>(
                      <button key={c} onClick={()=>sf("cinsiyet")(c)} style={{
                        flex:1,padding:10,borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                        background:hasta.cinsiyet===c?C.accent+"22":C.surface,
                        border:`1px solid ${hasta.cinsiyet===c?C.accent:C.border}`,
                        color:hasta.cinsiyet===c?C.accent:C.muted,
                        fontWeight:hasta.cinsiyet===c?700:400,fontSize:13,
                      }}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{marginBottom:18}}>
                <Field label="Şikayet" value={hasta.sikayet} onChange={sf("sikayet")} placeholder="Hastanın ana şikayeti..."/>
              </div>
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:18}}>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Muayene Bulguları</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {[["otoskopi","Otoskopik Muayene","Kulak zarı, MAK..."],
                    ["nazofarenks","Nazofarenks / Nazal Endoskopi","Mukoza, polip, kitle..."],
                    ["orofarenks","Orofarenks","Tonsil, posterior farinks..."],
                    ["ind_laringoskopi","İndirekt Laringoskopi","Vokal kord, supraglottik..."]
                  ].map(([k,l,p])=>(
                    <Field key={k} label={l} value={hasta[k]} onChange={sf(k)} placeholder={p}/>
                  ))}
                </div>
              </div>
              <Field label="Tetkik Sonuçları" value={hasta.tetkik} onChange={sf("tetkik")} placeholder="Odyometri, BT, MR, biyopsi..."/>
              <button onClick={handleAnaliz} disabled={!hasta.sikayet.trim()}
                style={{marginTop:22,width:"100%",padding:15,borderRadius:10,border:"none",
                  background:hasta.sikayet.trim()?`linear-gradient(90deg,${C.accent}CC,${C.purple}CC)`:C.subtle,
                  color:hasta.sikayet.trim()?"#fff":C.muted,fontSize:15,fontWeight:800,
                  cursor:hasta.sikayet.trim()?"pointer":"not-allowed",fontFamily:"inherit"}}>
                🧠 AI Analizi Başlat
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {appStep==="loading" && (
          <div style={{textAlign:"center",padding:"100px 0"}}>
            <div style={{fontSize:48,animation:"spin 2s linear infinite",display:"inline-block"}}>⚕️</div>
            <div style={{color:C.accent,fontWeight:700,fontSize:16,marginTop:20}}>{progress}</div>
          </div>
        )}

        {/* SONUÇ */}
        {appStep==="result" && result && !result.error && (
          <div>
            {/* Özet bar */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,
              padding:"14px 20px",marginBottom:18,display:"flex",
              justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <span style={{color:C.muted,fontSize:13}}>
                👤 {hasta.yas}y {hasta.cinsiyet} — {hasta.sikayet}
              </span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <AcilBadge a={result.aciliyet}/>
                <Btn small outline color={C.muted} onClick={()=>{setAppStep("form");setResult(null);}}>← Yeni Hasta</Btn>
              </div>
            </div>

            {/* Sekmeler */}
            <div style={{display:"flex",gap:4,marginBottom:18,flexWrap:"wrap"}}>
              {[["tani","🎯 Tanı"],["tedavi","💊 Tedavi"],["not","📋 Klinik Not"],["vakalar",`🔍 Vakalar (${cases.length})`]].map(([k,l])=>(
                <button key={k} onClick={()=>setActiveTab(k)} style={{
                  padding:"8px 18px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                  background:activeTab===k?C.accent+"22":"transparent",
                  border:`1px solid ${activeTab===k?C.accent:C.border}`,
                  color:activeTab===k?C.accent:C.muted,
                  fontWeight:activeTab===k?700:400,fontSize:13,
                }}>{l}</button>
              ))}
            </div>

            {/* TANI */}
            {activeTab==="tani" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:22}}>
                  <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:18}}>Olası Tanılar</div>
                  {result.olasi_tanilar?.map((t,i)=>(
                    <div key={i} style={{marginBottom:18}}>
                      <div style={{color:i===0?C.text:C.muted,fontWeight:i===0?700:500,fontSize:14,marginBottom:6}}>
                        {i===0?"★ ":""}{t.tani}
                      </div>
                      <GuvenBar pct={t.guven}/>
                      {t.aciklama&&<div style={{color:C.muted,fontSize:12,marginTop:5,lineHeight:1.5}}>{t.aciklama}</div>}
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:22}}>
                    <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Ayırıcı Tanılar</div>
                    {result.ayirici_tani?.map((t,i)=>(
                      <div key={i} style={{color:C.muted,fontSize:13,padding:"7px 0",
                        borderBottom:i<result.ayirici_tani.length-1?`1px solid ${C.border}`:"none"}}>
                        ◦ {t}
                      </div>
                    ))}
                  </div>
                  {result.ek_tetkik?.length>0&&(
                    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:22}}>
                      <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Ek Tetkikler</div>
                      {result.ek_tetkik.map((t,i)=>(
                        <div key={i} style={{color:C.muted,fontSize:13,padding:"7px 0",
                          borderBottom:i<result.ek_tetkik.length-1?`1px solid ${C.border}`:"none"}}>
                          → {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TEDAVİ */}
            {activeTab==="tedavi" && (
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24}}>
                <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Tedavi Planı</div>
                <p style={{color:C.text,fontSize:14,lineHeight:1.9,margin:"0 0 16px",whiteSpace:"pre-wrap"}}>{result.tedavi_plani}</p>
                {result.uyari&&(
                  <div style={{background:C.gold+"12",border:`1px solid ${C.gold}33`,borderRadius:8,padding:"12px 16px",color:C.gold,fontSize:13}}>
                    ⚠️ {result.uyari}
                  </div>
                )}
              </div>
            )}

            {/* KLİNİK NOT */}
            {activeTab==="not" && (
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Klinik Not</div>
                  <Btn small color={C.accent} onClick={()=>navigator.clipboard?.writeText(result.klinik_not)}>📋 Kopyala</Btn>
                </div>
                <div style={{background:C.surface,borderRadius:8,padding:18,
                  color:C.text,fontSize:14,lineHeight:1.9,whiteSpace:"pre-wrap",
                  fontFamily:"'Courier New',monospace"}}>
                  {result.klinik_not}
                </div>
              </div>
            )}

            {/* BENZER VAKALAR */}
            {activeTab==="vakalar" && cases.map((c,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,
                borderRadius:12,padding:"16px 20px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{color:C.accent,fontWeight:700,fontSize:13}}>Vaka {i+1} — {c.yas}y {c.cinsiyet}</span>
                  <span style={{color:C.accent,fontWeight:700,fontSize:13}}>%{(c.score*100).toFixed(0)} benzer</span>
                </div>
                <div style={{color:C.muted,fontSize:13,marginBottom:10}}>{c.sikayet}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <Badge label={`🎯 ${c.tani}`} color={C.green}/>
                  <Badge label={`💊 ${c.tedavi}`} color={C.purple}/>
                </div>
              </div>
            ))}

            <div style={{marginTop:16,textAlign:"center",color:C.muted,fontSize:11}}>
              ⚕️ AI destekli klinik karar desteği — nihai tanı ve tedavi kararı hekime aittir.
            </div>
          </div>
        )}

        {appStep==="result"&&result?.error&&(
          <div style={{background:C.red+"12",border:`1px solid ${C.red}33`,borderRadius:12,padding:24}}>
            <div style={{color:C.red,fontWeight:700,marginBottom:8}}>Hata</div>
            <pre style={{color:C.muted,fontSize:12}}>{result.error}</pre>
            <Btn small color={C.muted} onClick={()=>{setAppStep("form");setResult(null);}}>Geri</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
