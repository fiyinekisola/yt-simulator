import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORY_DATA = [
  { id:"Gaming",    icon:"🎮", boost:1.2,  subBoost:1.1,  desc:"High engagement, massive audience" },
  { id:"Vlogs",     icon:"📹", boost:1.0,  subBoost:1.15, desc:"Personal connection with viewers" },
  { id:"Tech",      icon:"💻", boost:1.1,  subBoost:1.05, desc:"High CPM, loyal audience" },
  { id:"Comedy",    icon:"😂", boost:1.3,  subBoost:1.2,  desc:"Viral potential is huge" },
  { id:"Music",     icon:"🎵", boost:1.15, subBoost:1.1,  desc:"Great for streams & replays" },
  { id:"Cooking",   icon:"🍕", boost:1.0,  subBoost:1.05, desc:"Steady, passionate community" },
  { id:"Fitness",   icon:"💪", boost:1.05, subBoost:1.1,  desc:"Dedicated repeat viewers" },
  { id:"Education", icon:"📚", boost:0.9,  subBoost:1.2,  desc:"Highest CPM on YouTube" },
  { id:"Fashion",   icon:"👗", boost:1.1,  subBoost:1.15, desc:"Great brand deal potential" },
  { id:"Reaction",  icon:"😮", boost:1.25, subBoost:1.05, desc:"Easy virality, broad appeal" },
];

const TITLES_BY_CATEGORY = {
  Gaming:    ["I finally beat the HARDEST level...", "This glitch breaks the entire game", "UNRANKED to PRO in 24 hours", "The RAREST item in the game 😱", "Going INSANE in ranked..."],
  Vlogs:     ["Day in my life (it went wrong 😬)", "I moved to a new city alone", "24 hours with no phone challenge", "Living on $1 for a week", "Saying YES to everything for a day"],
  Tech:      ["The BEST phone of 2025?", "I built a PC for $300...", "This gadget CHANGED my life", "Apple vs Samsung — HONEST review", "The laptop nobody talks about"],
  Comedy:    ["I did this and got BANNED", "Trolling randoms and regretting it", "The most unhinged video I've made", "My subscribers ROASTED me 💀", "I said YES to every dare..."],
  Music:     ["I made a beat in 1 hour", "Reacting to my OLD songs 😭", "Writing a song about my ex", "Can I go viral with one song?", "I made music using only my voice"],
  Cooking:   ["Gordon Ramsay's recipe but EASIER", "I only ate one meal for a week", "Making a 5-star meal for $10", "The dish that broke the internet", "Cooking ASMR for 10 minutes"],
  Fitness:   ["I trained like a pro athlete for 30 days", "The workout nobody told you about", "Getting abs in 6 weeks (real results)", "I did 100 pushups every day", "The diet that actually works"],
  Education: ["The thing schools never teach you", "I learned a language in 30 days", "How money actually works", "The science behind going viral", "This productivity hack changed everything"],
  Fashion:   ["Thrift flip that went CRAZY", "I wore the same outfit for a week", "Affordable dupes for expensive brands", "My honest wardrobe clear-out", "Fashion trends that need to DIE"],
  Reaction:  ["Reacting to the CRAZIEST videos online", "I can't believe this exists...", "Watching videos I've never seen", "Reacting to my old content 😭", "This made me emotional..."],
};

const THUMBNAILS_BY_CATEGORY = {
  Gaming:"🎮", Vlogs:"📹", Tech:"💻", Comedy:"😂", Music:"🎵",
  Cooking:"🍕", Fitness:"💪", Education:"📚", Fashion:"👗", Reaction:"😮",
};

const MILESTONES = [
  { subs:0,        label:"Nobody",          color:"#888",    badge:"👤", perk:"Start your journey" },
  { subs:100,      label:"Starter",         color:"#a0522d", badge:"🌱", perk:"You're getting noticed!" },
  { subs:1000,     label:"Rising Star",     color:"#4a9eff", badge:"⭐", perk:"Eligible for monetisation" },
  { subs:10000,    label:"Silver Creator",  color:"#aaa",    badge:"🥈", perk:"Silver Play Button! +10% views" },
  { subs:100000,   label:"Gold Creator",    color:"#ffd700", badge:"🥇", perk:"Gold Play Button! Eligible for verification" },
  { subs:1000000,  label:"Diamond Creator", color:"#b9f2ff", badge:"💎", perk:"Diamond Play Button! Brand deals" },
  { subs:10000000, label:"LEGEND",          color:"#ff4444", badge:"👑", perk:"Ruby Button! YOU ARE YOUTUBE" },
];

const UPGRADES = [
  { id:"cam",       name:"Better Camera",    cost:500,   icon:"📷", effect:"viewMult",       value:1.3,  desc:"+30% views per upload" },
  { id:"mic",       name:"Pro Microphone",   cost:300,   icon:"🎙️", effect:"retentionBonus", value:5,    desc:"+5% retention" },
  { id:"editor",    name:"Video Editor",     cost:1200,  icon:"✂️", effect:"uploadSpeed",    value:0.85, desc:"-15% cooldown" },
  { id:"thumbnail", name:"Thumbnail Artist", cost:800,   icon:"🎨", effect:"ctrBonus",       value:10,   desc:"+10% click-through" },
  { id:"studio",    name:"Home Studio",      cost:3000,  icon:"🏠", effect:"viewMult",       value:1.5,  desc:"+50% views per upload" },
  { id:"manager",   name:"Talent Manager",   cost:8000,  icon:"🤝", effect:"revMult",        value:1.4,  desc:"+40% ad revenue" },
  { id:"collab",    name:"Collab Network",   cost:5000,  icon:"🤜", effect:"subBoost",       value:1.25, desc:"+25% subscriber gain" },
  { id:"seo",       name:"SEO Mastery",      cost:2000,  icon:"🔍", effect:"discoverability",value:1.5,  desc:"+50% organic reach" },
  { id:"merch",     name:"Merch Store",      cost:15000, icon:"👕", effect:"passiveIncome",  value:50,   desc:"$50/min passive income" },
  { id:"agency",    name:"Brand Agency",     cost:50000, icon:"🏢", effect:"revMult",        value:2.0,  desc:"2x all ad revenue" },
];

// Buy-subs packages
const BUY_SUBS_PACKAGES = [
  { id:"s",  label:"Small",  subs:500,    cost:50,   risk:8,  icon:"📦" },
  { id:"m",  label:"Medium", subs:5000,   cost:350,  risk:18, icon:"📫" },
  { id:"l",  label:"Large",  subs:25000,  cost:1200, risk:30, icon:"🚀" },
  { id:"xl", label:"Mega",   subs:100000, cost:4000, risk:50, icon:"💣" },
];

const fmt = (n) => {
  if (n >= 1e9) return (n/1e9).toFixed(1)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(1)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
  return Math.floor(n).toString();
};
const fmtMoney = (n) => {
  if (n >= 1e6) return "$"+(n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return "$"+(n/1e3).toFixed(1)+"K";
  return "$"+n.toFixed(2);
};

function getMilestone(subs) {
  let cur = MILESTONES[0];
  for (const m of MILESTONES) { if (subs >= m.subs) cur = m; }
  return cur;
}
function getNextMilestone(subs) {
  return MILESTONES.find(m => m.subs > subs) || null;
}

// ── Shared Modal shell ─────────────────────────────────────────────────────
function Modal({ children, onClose, uncloseable }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.92)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
      backdropFilter:"blur(6px)",
    }} onClick={e => { if (!uncloseable && e.target === e.currentTarget) onClose?.(); }}>
      <div style={{
        background:"#111", border:"1px solid #2a2a2a", borderRadius:20,
        padding:32, maxWidth:460, width:"100%", animation:"popIn 0.25s ease",
        boxShadow:"0 24px 80px rgba(0,0,0,0.9)",
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Viral Celebration ──────────────────────────────────────────────────────
function ViralModal({ views, category, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:8, animation:"bounce 0.6s ease infinite alternate" }}>🔥</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#ff4444", marginBottom:4, letterSpacing:-0.5 }}>
          YOU WENT VIRAL!!
        </div>
        <div style={{ fontSize:13, color:"#888", marginBottom:20 }}>
          Your {category} video is blowing up across the platform
        </div>
        <div style={{ background:"linear-gradient(135deg,#ff000022,#ff440011)", border:"1px solid #ff444433", borderRadius:14, padding:20, marginBottom:24 }}>
          <div style={{ fontSize:42, fontWeight:800, color:"#ff4444" }}>{fmt(views)}</div>
          <div style={{ fontSize:12, color:"#aaa", marginTop:4 }}>views in the last hour</div>
        </div>
        <div style={{ fontSize:12, color:"#666", marginBottom:20 }}>
          Comments going crazy · Trending worldwide · Recommended everywhere
        </div>
        <button onClick={onClose} style={{
          background:"linear-gradient(135deg,#ff0000,#cc0000)", border:"none",
          borderRadius:10, padding:"13px 40px", color:"#fff", fontSize:15,
          fontWeight:800, cursor:"pointer", width:"100%",
        }}>LET'S GOOO 🚀</button>
      </div>
    </Modal>
  );
}

// ── Flop Modal ─────────────────────────────────────────────────────────────
function FlopModal({ views, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>💀</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#888", marginBottom:4 }}>That flopped.</div>
        <div style={{ fontSize:12, color:"#555", marginBottom:20, lineHeight:1.6 }}>
          The algorithm buried it. Barely anyone saw it. It happens to everyone — just keep uploading.
        </div>
        <div style={{ background:"#1a1a1a", border:"1px solid #222", borderRadius:14, padding:20, marginBottom:24 }}>
          <div style={{ fontSize:36, fontWeight:800, color:"#555" }}>{fmt(views)}</div>
          <div style={{ fontSize:12, color:"#444", marginTop:4 }}>total views 😬</div>
        </div>
        <button onClick={onClose} style={{
          background:"#1a1a1a", border:"1px solid #333", borderRadius:10,
          padding:"12px 40px", color:"#888", fontSize:14, fontWeight:700,
          cursor:"pointer", width:"100%",
        }}>Back to the grind...</button>
      </div>
    </Modal>
  );
}

// ── Copyright Claim Modal ──────────────────────────────────────────────────
const COPYRIGHT_SONGS = [
  { artist:"Universal Music", song:"a chart-topping pop track" },
  { artist:"Sony Music",      song:"a licensed R&B beat" },
  { artist:"Warner Records",  song:"a copyrighted hip-hop instrumental" },
  { artist:"BMI Publishing",  song:"a background jazz loop" },
  { artist:"ASCAP",           song:"an iconic film score sample" },
];
function CopyrightModal({ lost, song, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:8 }}>🎵</div>
        <div style={{ fontSize:18, fontWeight:800, color:"#ff8c00", marginBottom:6 }}>Copyright Claim!</div>
        <div style={{ fontSize:12, color:"#888", marginBottom:20, lineHeight:1.7 }}>
          <b style={{ color:"#fff" }}>{song.artist}</b> has claimed your video for using {song.song} for too long. All ad revenue from this video has been redirected to them.
        </div>
        <div style={{ background:"linear-gradient(135deg,#ff8c0018,#ff000010)", border:"1px solid #ff8c0033", borderRadius:14, padding:20, marginBottom:24 }}>
          <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>Ad revenue lost</div>
          <div style={{ fontSize:36, fontWeight:800, color:"#ff8c00" }}>–{fmtMoney(lost)}</div>
          <div style={{ fontSize:11, color:"#666", marginTop:6 }}>Goes straight to {song.artist}</div>
        </div>
        <div style={{ fontSize:11, color:"#555", marginBottom:20 }}>
          💡 Tip: Use royalty-free music to avoid claims. As you grow, labels get more aggressive.
        </div>
        <button onClick={onClose} style={{
          background:"#1a1a1a", border:"1px solid #333", borderRadius:10,
          padding:"12px 32px", color:"#888", fontSize:13, fontWeight:700,
          cursor:"pointer", width:"100%",
        }}>Lesson learned... 😤</button>
      </div>
    </Modal>
  );
}

// ── Suspension Modal ───────────────────────────────────────────────────────
function SuspensionModal({ onAppeal, wasVerified }) {
  const [appealing, setAppealing] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!appealText.trim()) return;
    setAppealing(true);
    setTimeout(() => { setSubmitted(true); setAppealing(false); }, 2500);
  };

  return (
    <Modal uncloseable>
      {submitted ? (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>⏳</div>
          <div style={{ fontSize:16, fontWeight:800, color:"#ffd700", marginBottom:8 }}>Appeal Submitted</div>
          <div style={{ fontSize:12, color:"#888", marginBottom:20, lineHeight:1.6 }}>
            YouTube is reviewing your appeal. This usually takes 24–48 hours. In the meantime you can't upload.
          </div>
          <button onClick={onAppeal} style={{
            background:"linear-gradient(135deg,#ffd700,#ff8c00)", border:"none",
            borderRadius:10, padding:"12px 32px", color:"#000",
            fontSize:13, fontWeight:800, cursor:"pointer",
          }}>Wait it out (skip ahead)</button>
        </div>
      ) : (
        <div>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>⚠️</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#ff8c00", marginBottom:6 }}>Channel Suspended</div>
            <div style={{ fontSize:12, color:"#888", lineHeight:1.6 }}>
              YouTube has detected suspicious activity on your channel. Your account has been temporarily suspended pending review.
            </div>
          </div>
          <div style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:12, padding:16, marginBottom:16, fontSize:11, color:"#666", lineHeight:1.7 }}>
            <b style={{ color:"#ff8c00" }}>Reason:</b> Artificial inflation of subscriber count via third-party services.<br/>
            <b style={{ color:"#ff8c00" }}>Status:</b> Uploading disabled until appeal is resolved.
            {wasVerified && <><br/><b style={{ color:"#ff4444" }}>⚠ Verification badge revoked.</b> Re-applying will have only a 10% success rate.</>}
          </div>
          <div style={{ fontSize:11, color:"#888", marginBottom:8, fontWeight:700 }}>Write your appeal:</div>
          <textarea
            value={appealText}
            onChange={e => setAppealText(e.target.value)}
            placeholder="Explain why your account should be reinstated..."
            style={{
              width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:10,
              padding:12, color:"#fff", fontSize:12, resize:"none", height:90,
              fontFamily:"inherit", outline:"none", marginBottom:16,
            }}
          />
          <button onClick={submit} disabled={!appealText.trim() || appealing} style={{
            width:"100%", background: appealText.trim() ? "linear-gradient(135deg,#ff8c00,#cc6600)" : "#1a1a1a",
            border:"none", borderRadius:10, padding:"13px",
            color: appealText.trim() ? "#fff" : "#444", fontSize:13,
            fontWeight:800, cursor: appealText.trim() ? "pointer" : "not-allowed",
          }}>
            {appealing ? "Submitting appeal... ⏳" : "Submit Appeal →"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ── Ban Screen (Game Over) ─────────────────────────────────────────────────
function BanScreen({ subs, onRestart }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:2000, background:"#050505",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:32, textAlign:"center",
    }}>
      <div style={{ fontSize:72, marginBottom:16, animation:"shake 0.5s ease" }}>🔴</div>
      <div style={{ fontSize:28, fontWeight:800, color:"#ff2222", marginBottom:8, letterSpacing:-1 }}>
        Channel Terminated
      </div>
      <div style={{ fontSize:13, color:"#555", maxWidth:380, lineHeight:1.8, marginBottom:32 }}>
        Your channel has been permanently removed from YouTube for repeated violations of the Community Guidelines, including the artificial inflation of subscriber counts using third-party services.
      </div>
      <div style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:16, padding:24, marginBottom:32, width:"100%", maxWidth:360 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#444", marginBottom:12, letterSpacing:1 }}>FINAL STATS</div>
        <div style={{ fontSize:32, fontWeight:800, color:"#333", marginBottom:4 }}>{fmt(subs)}</div>
        <div style={{ fontSize:12, color:"#444" }}>subscribers at time of ban</div>
      </div>
      <button onClick={onRestart} style={{
        background:"linear-gradient(135deg,#ff2222,#990000)", border:"none",
        borderRadius:12, padding:"14px 48px", color:"#fff",
        fontSize:15, fontWeight:800, cursor:"pointer",
      }}>Start Over 🔄</button>
      <div style={{ marginTop:12, fontSize:11, color:"#333" }}>
        Next time, build your audience the right way.
      </div>
    </div>
  );
}

// ── Buy Subs Modal ─────────────────────────────────────────────────────────
function BuySubsModal({ money, monetised, onBuy, onClose }) {
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const pkg = BUY_SUBS_PACKAGES.find(p => p.id === selected);

  const handleConfirm = () => {
    if (!pkg) return;
    setConfirming(true);
    setTimeout(() => { onBuy(pkg); onClose(); }, 1200);
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize:11, color:"#ff4444", fontWeight:700, letterSpacing:2, marginBottom:8 }}>⚠ RISKY</div>
      <div style={{ fontSize:17, fontWeight:800, color:"#fff", marginBottom:4 }}>Buy Subscribers</div>
      <div style={{ fontSize:12, color:"#666", marginBottom:20, lineHeight:1.6 }}>
        Third-party services can boost your numbers fast — but YouTube is watching. Get caught and face suspension or a permanent ban.
      </div>
      <div style={{ display:"grid", gap:8, marginBottom:16 }}>
        {BUY_SUBS_PACKAGES.map(p => {
          const canAfford = monetised && money >= p.cost;
          return (
            <button key={p.id} onClick={() => canAfford && setSelected(p.id)} style={{
              background: selected===p.id ? "#ff000018" : "#1a1a1a",
              border:`1px solid ${selected===p.id?"#ff4444":"#2a2a2a"}`,
              borderRadius:10, padding:"11px 14px", cursor: canAfford ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", gap:12, opacity: canAfford ? 1 : 0.4,
              textAlign:"left",
            }}>
              <span style={{ fontSize:22 }}>{p.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>+{fmt(p.subs)} subs</div>
                <div style={{ fontSize:10, color:"#666", marginTop:2 }}>Detection risk: <span style={{ color: p.risk>25?"#ff4444":"#ff8c00", fontWeight:700 }}>{p.risk}%</span> per purchase</div>
              </div>
              <div style={{ fontSize:13, fontWeight:800, color:"#4caf50" }}>{fmtMoney(p.cost)}</div>
            </button>
          );
        })}
      </div>
      {!monetised && <div style={{ fontSize:11, color:"#555", textAlign:"center", marginBottom:12 }}>Get monetised first to buy subs.</div>}
      <button onClick={handleConfirm} disabled={!pkg || confirming} style={{
        width:"100%", background: pkg ? "linear-gradient(135deg,#ff4444,#aa0000)" : "#161616",
        border:"none", borderRadius:10, padding:"13px",
        color: pkg ? "#fff" : "#444", fontSize:13, fontWeight:800,
        cursor: pkg ? "pointer" : "not-allowed",
      }}>
        {confirming ? "Processing... 🤫" : pkg ? `Buy ${fmt(pkg.subs)} subs for ${fmtMoney(pkg.cost)}` : "Select a package"}
      </button>
      <div style={{ textAlign:"center", marginTop:10 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#444", fontSize:12, cursor:"pointer" }}>Never mind</button>
      </div>
    </Modal>
  );
}

// ── Monetise Modal ─────────────────────────────────────────────────────────
function MonetiseModal({ suspicion, onApply, onClose }) {
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null); // null | "approved" | "rejected"

  // High suspicion = lower approval chance
  const approvalChance = Math.max(0.2, 1 - suspicion / 100);

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      const approved = Math.random() < approvalChance;
      setResult(approved ? "approved" : "rejected");
      setApplying(false);
      if (approved) onApply();
    }, 2200);
  };

  if (result === "approved") return (
    <Modal onClose={onClose}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#4caf50", marginBottom:8 }}>You're Monetised!</div>
        <div style={{ fontSize:13, color:"#aaa", marginBottom:24, lineHeight:1.6 }}>Ads will now run on your videos. Every 1,000 views earns you money. Keep uploading!</div>
        <button onClick={onClose} style={{ background:"linear-gradient(135deg,#4caf50,#2e7d32)", border:"none", borderRadius:10, padding:"12px 32px", color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer" }}>Let's get that money 💰</button>
      </div>
    </Modal>
  );

  if (result === "rejected") return (
    <Modal onClose={onClose}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>❌</div>
        <div style={{ fontSize:18, fontWeight:800, color:"#ff4444", marginBottom:8 }}>Application Rejected</div>
        <div style={{ fontSize:12, color:"#888", marginBottom:20, lineHeight:1.6 }}>
          YouTube's system flagged unusual activity on your channel. Your monetisation application has been denied. You may reapply in 30 days.
        </div>
        <div style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:14, marginBottom:20, fontSize:11, color:"#666" }}>
          💡 Tip: Channels with authentic, organic growth are more likely to be approved.
        </div>
        <button onClick={onClose} style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:10, padding:"12px 32px", color:"#888", fontSize:13, fontWeight:700, cursor:"pointer" }}>Close</button>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize:40, marginBottom:12, textAlign:"center" }}>💵</div>
      <div style={{ fontSize:18, fontWeight:800, color:"#ffd700", marginBottom:8, textAlign:"center" }}>You're eligible for monetisation!</div>
      <div style={{ fontSize:12, color:"#888", marginBottom:20, textAlign:"center", lineHeight:1.6 }}>
        You've hit 1,000 subscribers and can now join the YouTube Partner Programme.
      </div>
      <div style={{ background:"#1a1a1a", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#888", marginBottom:10, letterSpacing:1 }}>REQUIREMENTS MET</div>
        {[["✅","1,000+ subscribers"],["✅","4,000 watch hours (estimated)"],["✅","No community strikes"],["✅","AdSense account linked"]].map(([icon,txt]) => (
          <div key={txt} style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, color:"#ccc", marginBottom:6 }}>
            <span>{icon}</span><span>{txt}</span>
          </div>
        ))}
      </div>
      <button onClick={handleApply} disabled={applying} style={{
        width:"100%", background: applying ? "#222" : "linear-gradient(135deg,#ffd700,#ff8c00)",
        border:"none", borderRadius:10, padding:"14px", color: applying ? "#888" : "#000",
        fontSize:14, fontWeight:800, cursor: applying ? "not-allowed" : "pointer",
      }}>
        {applying ? "Reviewing your application... ⏳" : "Apply for Monetisation →"}
      </button>
      <div style={{ textAlign:"center", marginTop:10 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:12, cursor:"pointer" }}>Maybe later</button>
      </div>
    </Modal>
  );
}

// ── Verified Modal ─────────────────────────────────────────────────────────
function VerifiedModal({ suspicion, everSuspended, onApply, onClose }) {
  const [step, setStep] = useState(0);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);
  // If ever suspended: hard cap at 10%. Otherwise scale with suspicion.
  const approvalChance = everSuspended ? 0.10 : Math.max(0.15, 1 - suspicion / 80);

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      const approved = Math.random() < approvalChance;
      setResult(approved ? "approved" : "rejected");
      setApplying(false);
      if (approved) onApply();
    }, 2500);
  };

  if (result === "approved") return (
    <Modal onClose={onClose}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#4a9eff", marginBottom:8 }}>Verified!</div>
        <div style={{ fontSize:13, color:"#aaa", marginBottom:24, lineHeight:1.6 }}>Your channel now has the official checkmark. You're one of the biggest creators on the platform.</div>
        <button onClick={onClose} style={{ background:"linear-gradient(135deg,#4a9eff,#0066cc)", border:"none", borderRadius:10, padding:"12px 32px", color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer" }}>Flex that checkmark ✅</button>
      </div>
    </Modal>
  );

  if (result === "rejected") return (
    <Modal onClose={onClose}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>❌</div>
        <div style={{ fontSize:18, fontWeight:800, color:"#ff4444", marginBottom:8 }}>Verification Denied</div>
        <div style={{ fontSize:12, color:"#888", marginBottom:20, lineHeight:1.6 }}>
          YouTube's review team found that your channel does not meet the authenticity standards required for verification. Channels must demonstrate genuine audience growth.
        </div>
        <button onClick={onClose} style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:10, padding:"12px 32px", color:"#888", fontSize:13, fontWeight:700, cursor:"pointer" }}>Close</button>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose}>
      {step === 0 ? (
        <div>
          <div style={{ fontSize:40, marginBottom:12, textAlign:"center" }}>✅</div>
          <div style={{ fontSize:18, fontWeight:800, color:"#4a9eff", marginBottom:8, textAlign:"center" }}>Verification Badge Available!</div>
          <div style={{ fontSize:12, color:"#888", marginBottom:20, textAlign:"center", lineHeight:1.6 }}>
            You've hit 100,000 subscribers. Apply for the official YouTube checkmark.
          </div>
          <div style={{ background:"#1a1a1a", borderRadius:12, padding:16, marginBottom:20 }}>
            {[["✅","Official checkmark on your channel"],["✅","Higher priority in search results"],["✅","Custom URL"],["✅","Exclusive creator events"]].map(([icon,txt]) => (
              <div key={txt} style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, color:"#ccc", marginBottom:6 }}><span>{icon}</span><span>{txt}</span></div>
            ))}
          </div>
          {everSuspended && (
            <div style={{ background:"#ff440011", border:"1px solid #ff444433", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:11, color:"#ff8888", lineHeight:1.6 }}>
              ⚠ Your channel has a suspension on record. Approval chance is capped at <b>10%</b>.
            </div>
          )}
          <button onClick={() => setStep(1)} style={{ width:"100%", background:"linear-gradient(135deg,#4a9eff,#0066cc)", border:"none", borderRadius:10, padding:"14px", color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer" }}>Apply for Verification →</button>
          <div style={{ textAlign:"center", marginTop:10 }}><button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:12, cursor:"pointer" }}>Maybe later</button></div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:16 }}>Verification Application</div>
          <div style={{ background:"#1a1a1a", borderRadius:10, padding:14, marginBottom:16, fontSize:12, color:"#aaa", lineHeight:1.7 }}>
            <b style={{ color:"#fff" }}>Channel:</b> My Channel<br/>
            <b style={{ color:"#fff" }}>Subscribers:</b> 100K+<br/>
            <b style={{ color:"#fff" }}>Reason:</b> Established creator with authentic audience growth.
          </div>
          <button onClick={handleApply} disabled={applying} style={{
            width:"100%", background: applying ? "#222" : "linear-gradient(135deg,#4a9eff,#0066cc)",
            border:"none", borderRadius:10, padding:"14px", color: applying ? "#888" : "#fff",
            fontSize:14, fontWeight:800, cursor: applying ? "not-allowed" : "pointer",
          }}>
            {applying ? "YouTube is reviewing... ⏳" : "Submit Application →"}
          </button>
          <div style={{ textAlign:"center", marginTop:10 }}><button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:12, cursor:"pointer" }}>Cancel</button></div>
        </div>
      )}
    </Modal>
  );
}

// ── Category Picker ────────────────────────────────────────────────────────
function CategoryPickerModal({ onSelect, onClose }) {
  const [selected, setSelected] = useState(null);
  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:4 }}>What type of video?</div>
      <div style={{ fontSize:12, color:"#666", marginBottom:14 }}>Each category has different growth potential.</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, maxHeight:340, overflowY:"auto", marginBottom:14 }}>
        {CATEGORY_DATA.map(cat => (
          <button key={cat.id} onClick={() => setSelected(cat.id)} style={{
            background: selected===cat.id ? "#ff000022" : "#1a1a1a",
            border:`1px solid ${selected===cat.id?"#ff0000":"#2a2a2a"}`,
            borderRadius:10, padding:"10px 12px", cursor:"pointer", textAlign:"left", transition:"all 0.15s",
          }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{cat.icon}</div>
            <div style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{cat.id}</div>
            <div style={{ fontSize:10, color:"#666", marginTop:2, lineHeight:1.4 }}>{cat.desc}</div>
            <div style={{ display:"flex", gap:6, marginTop:6 }}>
              <span style={{ fontSize:9, background:"#ff000022", color:"#ff6b6b", borderRadius:4, padding:"1px 5px", fontWeight:700 }}>👁 ×{cat.boost.toFixed(1)}</span>
              <span style={{ fontSize:9, background:"#4caf5022", color:"#4caf50", borderRadius:4, padding:"1px 5px", fontWeight:700 }}>👥 ×{cat.subBoost.toFixed(1)}</span>
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => selected && onSelect(selected)} disabled={!selected} style={{
        width:"100%", background: selected ? "linear-gradient(135deg,#ff0000,#cc0000)" : "#1a1a1a",
        border:"none", borderRadius:10, padding:"13px",
        color: selected ? "#fff" : "#555", fontSize:14, fontWeight:800,
        cursor: selected ? "pointer" : "not-allowed",
      }}>
        {selected ? `🎬 Upload ${CATEGORY_DATA.find(c=>c.id===selected)?.icon} ${selected} Video` : "Select a category first"}
      </button>
    </Modal>
  );
}

// ── Notifications ──────────────────────────────────────────────────────────
function Notifs({ notifs }) {
  return (
    <div style={{ position:"fixed", top:16, right:16, zIndex:998, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {notifs.map(n => (
        <div key={n.id} style={{
          background: n.type==="viral" ? "linear-gradient(135deg,#ff0000,#ff6b6b)"
            : n.type==="milestone" ? "linear-gradient(135deg,#ffd700,#ff8c00)"
            : n.type==="flop" ? "#1a1a1a"
            : n.type==="danger" ? "linear-gradient(135deg,#ff4444,#880000)"
            : "#1a1a1a",
          border:`1px solid ${n.type==="viral"?"#ff4444":n.type==="milestone"?"#ffd700":n.type==="danger"?"#ff4444":"#333"}`,
          borderRadius:12, padding:"10px 16px", color: n.type==="flop" ? "#666" : "#fff",
          fontSize:13, fontWeight:600, fontFamily:"inherit", maxWidth:280,
          boxShadow:"0 4px 20px rgba(0,0,0,0.5)", animation:"slideIn 0.3s ease",
        }}>{n.msg}</div>
      ))}
    </div>
  );
}

// ── Video Card ─────────────────────────────────────────────────────────────
function VideoCard({ video, monetised }) {
  const age = Date.now() - video.uploadedAt;
  const ageStr = age < 60000 ? "just now" : age < 3600000 ? Math.floor(age/60000)+"m ago" : Math.floor(age/3600000)+"h ago";
  return (
    <div style={{
      background:"#111", border:`1px solid ${video.copyrightClaimed?"#ff8c0033":video.flopped?"#1a1a1a":video.viral?"#ff000033":"#222"}`,
      borderRadius:12, overflow:"hidden", transition:"transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=video.flopped?"none":"0 8px 24px rgba(255,0,0,0.15)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
    >
      <div style={{ background: video.flopped?"#111":"#1a1a1a", height:90, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, position:"relative", opacity: video.flopped ? 0.5 : 1 }}>
        {video.thumbnail}
        {video.viral && <div style={{ position:"absolute", top:6, right:6, background:"#ff0000", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:4, letterSpacing:1 }}>VIRAL</div>}
        {video.flopped && <div style={{ position:"absolute", top:6, right:6, background:"#333", color:"#777", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:4, letterSpacing:1 }}>FLOPPED</div>}
        {video.copyrightClaimed && !video.flopped && <div style={{ position:"absolute", top:6, right:6, background:"#ff8c00", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:4, letterSpacing:1 }}>©️ CLAIMED</div>}
        <div style={{ position:"absolute", bottom:4, left:6, background:"#ff000022", border:"1px solid #ff000033", color:"#ff8888", fontSize:9, padding:"1px 5px", borderRadius:3, fontWeight:700 }}>{video.category}</div>
        <div style={{ position:"absolute", bottom:4, right:6, background:"rgba(0,0,0,0.8)", color:"#fff", fontSize:9, padding:"1px 5px", borderRadius:3 }}>{Math.floor(video.duration/60)}:{String(video.duration%60).padStart(2,"0")}</div>
      </div>
      <div style={{ padding:"10px 12px" }}>
        <div style={{ fontSize:11, fontWeight:700, color: video.flopped?"#555":"#fff", lineHeight:1.3, marginBottom:5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{video.title}</div>
        <div style={{ display:"flex", gap:8, fontSize:10, color:"#aaa", marginBottom:4 }}>
          <span>👁 {fmt(video.views)}</span>
          <span>👍 {fmt(video.likes)}</span>
        </div>
        {/* Subs gained */}
        {!video.flopped && (
          <div style={{ fontSize:10, color:"#4a9eff", fontWeight:600, marginBottom:3 }}>
            +{fmt(video.subsGained || 0)} subs
          </div>
        )}
        {monetised && (
          video.copyrightClaimed
            ? <div style={{ fontSize:10, color:"#ff8c00", fontWeight:700 }}>©️ Revenue claimed</div>
            : <div style={{ fontSize:10, color: video.flopped?"#333":"#4caf50", fontWeight:700 }}>{fmtMoney(video.revenue)} earned</div>
        )}
        {!monetised && <div style={{ fontSize:10, color:"#444", fontStyle:"italic" }}>Not monetised</div>}
        <div style={{ fontSize:10, color:"#555", marginTop:2 }}>{ageStr}</div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function YouTubeSimulator() {
  const [subs, setSubs] = useState(0);
  const [money, setMoney] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [videos, setVideos] = useState([]);
  const [uploads, setUploads] = useState(0);
  const [ownedUpgrades, setOwnedUpgrades] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [tab, setTab] = useState("studio");
  const [uploadCooldown, setUploadCooldown] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [viralCount, setViralCount] = useState(0);
  const [flopCount, setFlopCount] = useState(0);

  // Gate states
  const [monetised, setMonetised] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showMonetiseModal, setShowMonetiseModal] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [monetisePrompted, setMonetisePrompted] = useState(false);
  const [verifyPrompted, setVerifyPrompted] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Viral / Flop celebration modals
  const [viralEvent, setViralEvent] = useState(null); // { views, category }
  const [flopEvent, setFlopEvent] = useState(null);   // { views }

  // Risk system
  const [suspicion, setSuspicion] = useState(0);       // 0–100, hidden
  const [suspended, setSuspended] = useState(false);
  const [everSuspended, setEverSuspended] = useState(false);
  const [banned, setBanned] = useState(false);
  const [showBuySubsModal, setShowBuySubsModal] = useState(false);

  // Copyright system
  const [copyrightEvent, setCopyrightEvent] = useState(null); // { lost, song }

  const [prevMilestoneSubs, setPrevMilestoneSubs] = useState(0);
  const passiveRef = useRef(null);
  const cooldownRef = useRef(null);

  // Refs to avoid stale closures inside setInterval
  // Copyright cooldown ref — prevents claims firing too close together
  const lastClaimRef = useRef(0);
  const suspicionRef = useRef(0);
  const monetisedRef = useRef(false);
  const suspendedRef = useRef(false);
  const bannedRef = useRef(false);
  const copyrightActiveRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { subsRef.current = subs; }, [subs]);
  useEffect(() => { suspicionRef.current = suspicion; }, [suspicion]);
  useEffect(() => { monetisedRef.current = monetised; }, [monetised]);
  useEffect(() => { suspendedRef.current = suspended; }, [suspended]);
  useEffect(() => { bannedRef.current = banned; }, [banned]);
  useEffect(() => { copyrightActiveRef.current = !!copyrightEvent; }, [copyrightEvent]);

  const addNotif = useCallback((msg, type="info") => {
    const id = Date.now() + Math.random();
    setNotifs(n => [...n, { id, msg, type }]);
    setTimeout(() => setNotifs(n => n.filter(x => x.id !== id)), 3800);
  }, []);

  const getEffects = useCallback(() => {
    return ownedUpgrades.reduce((acc, id) => {
      const u = UPGRADES.find(x => x.id === id);
      if (!u) return acc;
      if (u.effect === "viewMult")        acc.viewMult        = (acc.viewMult||1)*u.value;
      if (u.effect === "revMult")         acc.revMult         = (acc.revMult||1)*u.value;
      if (u.effect === "subBoost")        acc.subBoost        = (acc.subBoost||1)*u.value;
      if (u.effect === "ctrBonus")        acc.ctrBonus        = (acc.ctrBonus||0)+u.value;
      if (u.effect === "discoverability") acc.discoverability = (acc.discoverability||1)*u.value;
      if (u.effect === "passiveIncome")   acc.passiveIncome   = (acc.passiveIncome||0)+u.value;
      if (u.effect === "uploadSpeed")     acc.uploadSpeed     = (acc.uploadSpeed||1)*u.value;
      return acc;
    }, {});
  }, [ownedUpgrades]);

  // Passive tick
  useEffect(() => {
    passiveRef.current = setInterval(() => {
      if (suspendedRef.current || bannedRef.current) return;
      const fx = getEffects();

      if ((fx.passiveIncome||0) > 0 && monetisedRef.current) {
        const inc = fx.passiveIncome/60;
        setMoney(m => m+inc);
        setTotalEarned(t => t+inc);
      }

      // Copyright claim — rare, scales with subs, minimum 60s between claims
      const now = Date.now();
      const timeSinceLastClaim = now - lastClaimRef.current;
      if (monetisedRef.current && subsRef.current > 5000 && !copyrightActiveRef.current && timeSinceLastClaim > 60000) {
        // 0.3% at 5K subs, scaling slowly to max 3% at 1M+ subs
        const claimChance = Math.min(0.03, 0.003 + (subsRef.current / 1000000) * 0.027);
        if (Math.random() < claimChance) {
          setVideos(vids => {
            const eligible = vids.filter(v => !v.flopped && !v.copyrightClaimed && v.revenue > 0);
            if (eligible.length === 0) return vids;
            const target = eligible[Math.floor(Math.random() * eligible.length)];
            const lost = target.revenue;
            const song = COPYRIGHT_SONGS[Math.floor(Math.random() * COPYRIGHT_SONGS.length)];
            copyrightActiveRef.current = true;
            lastClaimRef.current = now;
            setCopyrightEvent({ lost, song });
            setMoney(m => Math.max(0, m - lost));
            return vids.map(v => v.id === target.id ? { ...v, revenue:0, copyrightClaimed:true } : v);
          });
        }
      }

      setVideos(vids => vids.map(v => {
        if (v.flopped || v.views > 10000000) return v;
        const rate = v.viral ? 1.06 : 1.015;
        const newViews = Math.floor(v.views*rate);
        const gain = newViews - v.views;
        if (gain <= 0) return v;
        const newSubs = Math.floor(gain*0.02*(fx.subBoost||1));
        const rev = monetisedRef.current ? gain*0.003*(fx.revMult||1) : 0;
        setSubs(s => s+newSubs);
        setTotalViews(t => t+gain);
        if (monetisedRef.current) { setMoney(m=>m+rev); setTotalEarned(t=>t+rev); }
        return { ...v, views:newViews, revenue:v.revenue+rev, likes:Math.floor(newViews*0.06), comments:Math.floor(newViews*0.008) };
      }));
    }, 2000);
    return () => clearInterval(passiveRef.current);
  }, [ownedUpgrades, getEffects]);

  // Cooldown
  useEffect(() => {
    if (uploadCooldown > 0) {
      cooldownRef.current = setTimeout(() => setUploadCooldown(c=>c-1), 1000);
    }
    return () => clearTimeout(cooldownRef.current);
  }, [uploadCooldown]);

  // Milestone + gate checks
  useEffect(() => {
    const cur = getMilestone(subs);
    if (cur.subs > prevMilestoneSubs) {
      setPrevMilestoneSubs(cur.subs);
      addNotif(`🎉 ${cur.badge} ${cur.label} — ${cur.perk}`, "milestone");
    }
    if (subs >= 1000 && !monetised && !monetisePrompted) {
      setMonetisePrompted(true);
      setTimeout(() => setShowMonetiseModal(true), 800);
    }
    if (subs >= 100000 && !verified && !verifyPrompted) {
      setVerifyPrompted(true);
      setTimeout(() => setShowVerifiedModal(true), 800);
    }
  }, [subs]);

  const doUpload = (categoryId) => {
    setShowCategoryPicker(false);
    setIsUploading(true);
    setUploadProgress(0);
    const iv = setInterval(() => setUploadProgress(p => Math.min(p+12, 100)), 150);
    setTimeout(() => {
      clearInterval(iv);
      setIsUploading(false);
      setUploadProgress(0);

      const fx = getEffects();
      const cat = CATEGORY_DATA.find(c => c.id === categoryId);
      const baseCooldown = Math.max(8, 30 - uploads*0.4);
      setUploadCooldown(Math.round(baseCooldown*(fx.uploadSpeed||1)));

      // Flop chance: starts high (20%), reduces with subs
      const flopChance = Math.max(0.03, 0.20 - subs/50000);
      const flopped = Math.random() < flopChance;

      // Viral chance: starts tiny (1%), scales with subs + uploads
      const viralChance = Math.min(0.25, 0.01 + subs/200000 + uploads*0.002 + (fx.ctrBonus||0)*0.003);
      const viral = !flopped && Math.random() < viralChance;

      const baseViews = Math.max(50, subs*0.15 + Math.random()*500);
      const viewMult = (fx.viewMult||1) * cat.boost * (fx.discoverability||1);
      let views = Math.floor(baseViews * viewMult * (0.7 + Math.random()*0.8));
      if (flopped) views = Math.floor(Math.random() * 80 + 5);
      if (viral)   views = Math.floor(views * (8 + Math.random()*20));

      const revenue = monetised && !flopped ? views*0.004*(fx.revMult||1) : 0;
      const newSubs = flopped ? 0 : Math.floor(views*0.04*(fx.subBoost||1)*cat.subBoost);

      const titles = TITLES_BY_CATEGORY[categoryId] || ["Untitled video"];
      const video = {
        id:Date.now(), title:titles[Math.floor(Math.random()*titles.length)],
        thumbnail:THUMBNAILS_BY_CATEGORY[categoryId]||"🎬", category:categoryId,
        views, likes:Math.floor(views*0.06), comments:Math.floor(views*0.008),
        revenue, viral, flopped, subsGained: flopped ? 0 : newSubs,
        uploadedAt:Date.now(), duration:180+Math.floor(Math.random()*900),
      };

      setVideos(v => [video,...v].slice(0,24));
      setUploads(u => u+1);
      if (!flopped) {
        setSubs(s => s+newSubs);
        setTotalViews(t => t+views);
        if (monetised) { setMoney(m=>m+revenue); setTotalEarned(te=>te+revenue); }
      }

      if (viral) {
        setViralCount(vc => vc+1);
        setViralEvent({ views, category: cat.icon+" "+categoryId });
      } else if (flopped) {
        setFlopCount(fc => fc+1);
        setFlopEvent({ views });
      } else {
        addNotif(`✅ ${cat.icon} uploaded! +${fmt(newSubs)} subs, ${fmt(views)} views`);
      }
    }, 1900);
  };

  const handleBuySubs = (pkg) => {
    if (money < pkg.cost || !monetised) return;
    setMoney(m => m - pkg.cost);
    setSubs(s => s + pkg.subs);
    const newSuspicion = Math.min(100, suspicionRef.current + pkg.risk);
    setSuspicion(newSuspicion);
    suspicionRef.current = newSuspicion;
    addNotif(`🤫 +${fmt(pkg.subs)} subs added. Be careful...`, "danger");

    if (newSuspicion >= 100) {
      setTimeout(() => setBanned(true), 1500);
    } else if (newSuspicion >= 60 && Math.random() < 0.5) {
      setTimeout(() => setSuspended(true), 1500);
      addNotif("⚠️ YouTube has flagged your channel!", "danger");
    } else if (newSuspicion >= 30 && Math.random() < 0.3) {
      setTimeout(() => setSuspended(true), 1500);
      addNotif("⚠️ Suspicious activity detected!", "danger");
    }
  };

  const handleAppeal = () => {
    setSuspended(false);
    setEverSuspended(true);
    setVerified(false); // suspension strips verification
    setVerifyPrompted(false); // allow re-prompt if still eligible
    setSuspicion(s => Math.max(0, s - 20));
    addNotif("✅ Appeal accepted. Verification revoked. Watch yourself...", "danger");
  };

  const handleRestart = () => {
    setSubs(0); setMoney(0); setTotalViews(0); setVideos([]);
    setUploads(0); setOwnedUpgrades([]); setNotifs([]);
    setUploadCooldown(0); setTotalEarned(0); setViralCount(0); setFlopCount(0);
    setMonetised(false); setVerified(false);
    setShowMonetiseModal(false); setShowVerifiedModal(false);
    setMonetisePrompted(false); setVerifyPrompted(false);
    setSuspicion(0); setSuspended(false); setEverSuspended(false); setBanned(false);
    setCopyrightEvent(null);
    setPrevMilestoneSubs(0);
  };

  const buyUpgrade = (upg) => {
    if (money < upg.cost || ownedUpgrades.includes(upg.id)) return;
    setMoney(m => m - upg.cost);
    setOwnedUpgrades(o => [...o, upg.id]);
    addNotif(`🛒 Purchased ${upg.name}! ${upg.desc}`);
  };

  const milestone = getMilestone(subs);
  const nextMilestone = getNextMilestone(subs);
  const progress = nextMilestone ? ((subs-milestone.subs)/(nextMilestone.subs-milestone.subs))*100 : 100;

  if (banned) return <BanScreen subs={subs} onRestart={handleRestart} />;

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", color:"#fff", fontFamily:"'Space Grotesk','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#111; } ::-webkit-scrollbar-thumb { background:#333; border-radius:2px; }
        @keyframes slideIn { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes popIn { from{transform:scale(0.88);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,0,0,0.4)} 50%{box-shadow:0 0 0 14px rgba(255,0,0,0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes bounce { from{transform:translateY(0)} to{transform:translateY(-12px)} }
      `}</style>

      <Notifs notifs={notifs} />
      {viralEvent && <ViralModal views={viralEvent.views} category={viralEvent.category} onClose={() => setViralEvent(null)} />}
      {flopEvent && <FlopModal views={flopEvent.views} onClose={() => setFlopEvent(null)} />}
      {copyrightEvent && <CopyrightModal lost={copyrightEvent.lost} song={copyrightEvent.song} onClose={() => setCopyrightEvent(null)} />}
      {suspended && <SuspensionModal onAppeal={handleAppeal} wasVerified={verified} />}
      {showMonetiseModal && !suspended && <MonetiseModal suspicion={suspicion} onApply={() => setMonetised(true)} onClose={() => setShowMonetiseModal(false)} />}
      {showVerifiedModal && !suspended && <VerifiedModal suspicion={suspicion} everSuspended={everSuspended} onApply={() => setVerified(true)} onClose={() => setShowVerifiedModal(false)} />}
      {showCategoryPicker && !suspended && <CategoryPickerModal onSelect={doUpload} onClose={() => setShowCategoryPicker(false)} />}
      {showBuySubsModal && <BuySubsModal money={money} monetised={monetised} onBuy={handleBuySubs} onClose={() => setShowBuySubsModal(false)} />}

      {/* Header */}
      <div style={{ background:"#111", borderBottom:"1px solid #1e1e1e", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:90 }}>
        <div style={{ fontSize:20, fontWeight:800, color:"#ff0000", letterSpacing:-0.5 }}>▶ YT Simulator</div>
        <div style={{ flex:1 }} />
        <div style={{ display:"flex", gap:14, fontSize:12, fontWeight:600, alignItems:"center" }}>
          <span style={{ color:"#aaa" }}>👥 <span style={{ color:"#fff", fontSize:13 }}>{fmt(subs)}</span></span>
          <span style={{ color:"#aaa" }}>💰 <span style={{ color: monetised?"#4caf50":"#555", fontSize:13 }}>{monetised?fmtMoney(money):"—"}</span></span>
          <span style={{ color:"#aaa" }}>👁 <span style={{ color:"#fff", fontSize:13 }}>{fmt(totalViews)}</span></span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:milestone.color+"22", border:`1px solid ${milestone.color}44`, borderRadius:20, padding:"4px 10px" }}>
          <span style={{ fontSize:11, fontWeight:700, color:milestone.color }}>{milestone.badge} {milestone.label}</span>
          {verified && <span title="Verified">✅</span>}
          {monetised && <span style={{ fontSize:11, background:"#4caf5022", border:"1px solid #4caf5044", borderRadius:10, padding:"1px 6px", color:"#4caf50", fontWeight:700 }}>$</span>}
        </div>
      </div>

      {/* Progress bar */}
      {nextMilestone && (
        <div style={{ background:"#111", borderBottom:"1px solid #161616", padding:"7px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#555", marginBottom:4 }}>
            <span>{fmt(subs)} subs</span>
            <span>{nextMilestone.badge} {nextMilestone.label} @ {fmt(nextMilestone.subs)}</span>
          </div>
          <div style={{ background:"#1a1a1a", borderRadius:4, height:3, overflow:"hidden" }}>
            <div style={{ height:"100%", background:"linear-gradient(90deg,#ff0000,#ff6b6b)", width:`${progress}%`, transition:"width 0.6s ease", borderRadius:4 }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background:"#111", borderBottom:"1px solid #161616", display:"flex", padding:"0 20px" }}>
        {[["studio","🎬 Studio"],["videos","📺 Videos"],["shop","🛒 Shop"],["stats","📊 Stats"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background:"none", border:"none", color:tab===id?"#ff0000":"#666",
            padding:"11px 15px", fontSize:12, fontWeight:700, cursor:"pointer",
            borderBottom:tab===id?"2px solid #ff0000":"2px solid transparent",
            transition:"all 0.15s", letterSpacing:0.5,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding:20, maxWidth:900, margin:"0 auto" }}>

        {/* ── STUDIO ── */}
        {tab==="studio" && (
          <div style={{ display:"grid", gap:16 }}>
            <div style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:16, padding:24, textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#555", marginBottom:16 }}>
                {uploads===0 ? "Welcome! Pick a content category and upload your first video." : `${uploads} video${uploads!==1?"s":""} uploaded. Keep grinding! 🔥`}
              </div>
              {isUploading ? (
                <div style={{ padding:16 }}>
                  <div style={{ fontSize:13, color:"#aaa", marginBottom:10 }}>Uploading... {uploadProgress}%</div>
                  <div style={{ background:"#1a1a1a", borderRadius:4, height:6, overflow:"hidden", maxWidth:280, margin:"0 auto" }}>
                    <div style={{ height:"100%", background:"linear-gradient(90deg,#ff0000,#ff4444)", width:`${uploadProgress}%`, transition:"width 0.15s linear", borderRadius:4 }} />
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                  <button onClick={() => { if (uploadCooldown===0 && !suspended) setShowCategoryPicker(true); }}
                    disabled={uploadCooldown>0 || suspended} style={{
                      background: (uploadCooldown>0||suspended) ? "#1a1a1a" : "linear-gradient(135deg,#ff0000,#cc0000)",
                      border:"none", borderRadius:12, padding:"15px 36px",
                      color:(uploadCooldown>0||suspended)?"#555":"#fff",
                      fontSize:15, fontWeight:800, cursor:(uploadCooldown>0||suspended)?"not-allowed":"pointer",
                      animation:(uploadCooldown===0&&!suspended)?"pulse 2s infinite":"none", letterSpacing:0.5,
                    }}>
                    {suspended ? "⚠️ Suspended — appeal first" : uploadCooldown>0 ? `⏳ Cooldown: ${uploadCooldown}s` : "🎬 UPLOAD VIDEO"}
                  </button>

                  {/* Buy subs button */}
                  <button onClick={() => setShowBuySubsModal(true)} style={{
                    background:"none", border:"1px solid #2a2a2a", borderRadius:10,
                    padding:"8px 20px", color:"#666", fontSize:11, fontWeight:700,
                    cursor:"pointer", letterSpacing:0.5, transition:"all 0.2s",
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="#ff4444"; e.currentTarget.style.color="#ff4444"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="#2a2a2a"; e.currentTarget.style.color="#666"; }}
                  >
                    💀 Buy Subscribers (risky)
                  </button>
                </div>
              )}

              {!monetised && subs>=1000 && (
                <div onClick={()=>setShowMonetiseModal(true)} style={{ marginTop:14, background:"#ffd70011", border:"1px solid #ffd70033", borderRadius:10, padding:"10px 16px", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 }}>
                  <span>💵</span><span style={{ fontSize:12, color:"#ffd700", fontWeight:700 }}>Eligible for monetisation — Apply now</span>
                </div>
              )}
              {!monetised && subs<1000 && (
                <div style={{ marginTop:12, fontSize:11, color:"#444" }}>Reach 1,000 subs to apply for monetisation ({fmt(Math.max(0,1000-subs))} to go)</div>
              )}
              {monetised && !verified && subs>=100000 && (
                <div onClick={()=>setShowVerifiedModal(true)} style={{ marginTop:14, background:"#4a9eff11", border:"1px solid #4a9eff33", borderRadius:10, padding:"10px 16px", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 }}>
                  <span>✅</span><span style={{ fontSize:12, color:"#4a9eff", fontWeight:700 }}>Eligible for verification — Apply now</span>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {[
                { label:"Total Earned", value:monetised?fmtMoney(totalEarned):"—", icon:"💵", color:monetised?"#4caf50":"#333" },
                { label:"Viral Videos", value:viralCount, icon:"🔥", color:"#ff6b6b" },
                { label:"Flopped", value:flopCount, icon:"💀", color:"#555" },
                { label:"Total Videos", value:videos.length, icon:"📺", color:"#4a9eff" },
              ].map(s => (
                <div key={s.label} style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:12, padding:12, textAlign:"center" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:10, color:"#444", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {videos.length>0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#444", marginBottom:10, letterSpacing:1 }}>RECENT UPLOADS</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:10 }}>
                  {videos.slice(0,6).map(v => <VideoCard key={v.id} video={v} monetised={monetised} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── VIDEOS ── */}
        {tab==="videos" && (
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"#444", marginBottom:14, letterSpacing:1 }}>ALL VIDEOS ({videos.length})</div>
            {videos.length===0
              ? <div style={{ textAlign:"center", color:"#333", padding:60, fontSize:13 }}>No videos yet — head to Studio! 🎬</div>
              : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:10 }}>
                  {videos.map(v => <VideoCard key={v.id} video={v} monetised={monetised} />)}
                </div>}
          </div>
        )}

        {/* ── SHOP ── */}
        {tab==="shop" && (
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"#444", marginBottom:4, letterSpacing:1 }}>UPGRADES</div>
            <div style={{ fontSize:11, color:"#444", marginBottom:16 }}>Balance: <span style={{ color:monetised?"#4caf50":"#555", fontWeight:700 }}>{monetised?fmtMoney(money):"Not monetised yet"}</span></div>
            <div style={{ display:"grid", gap:10 }}>
              {UPGRADES.map(upg => {
                const owned = ownedUpgrades.includes(upg.id);
                const canAfford = money>=upg.cost && monetised;
                return (
                  <div key={upg.id} style={{
                    background:owned?"#0d1f0d":"#111",
                    border:`1px solid ${owned?"#1a3a1a":canAfford?"#2a2a2a":"#161616"}`,
                    borderRadius:12, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, opacity:owned?0.7:1,
                  }}>
                    <div style={{ fontSize:24 }}>{upg.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:12, color:owned?"#4caf50":"#fff" }}>{upg.name} {owned&&"✓"}</div>
                      <div style={{ fontSize:11, color:"#444", marginTop:2 }}>{upg.desc}</div>
                    </div>
                    {owned
                      ? <div style={{ fontSize:11, color:"#4caf50", fontWeight:700 }}>OWNED</div>
                      : <button onClick={()=>buyUpgrade(upg)} disabled={!canAfford} style={{
                          background:canAfford?"linear-gradient(135deg,#ff0000,#cc0000)":"#161616",
                          border:"none", borderRadius:8, padding:"7px 12px",
                          color:canAfford?"#fff":"#444", fontSize:11, fontWeight:700,
                          cursor:canAfford?"pointer":"not-allowed", whiteSpace:"nowrap",
                        }}>{fmtMoney(upg.cost)}</button>
                    }
                  </div>
                );
              })}
            </div>
            {!monetised && <div style={{ marginTop:16, textAlign:"center", fontSize:12, color:"#444" }}>💡 Get monetised to spend money on upgrades.</div>}
          </div>
        )}

        {/* ── STATS ── */}
        {tab==="stats" && (
          <div style={{ display:"grid", gap:14 }}>
            <div style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:16, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#444", marginBottom:14, letterSpacing:1 }}>MILESTONES</div>
              <div style={{ display:"grid", gap:8 }}>
                {MILESTONES.map(m => {
                  const reached = subs>=m.subs;
                  const isCur = getMilestone(subs).subs===m.subs;
                  return (
                    <div key={m.subs} style={{
                      display:"flex", alignItems:"center", gap:10,
                      background:isCur?m.color+"11":"transparent",
                      border:`1px solid ${isCur?m.color+"33":"#161616"}`,
                      borderRadius:10, padding:"9px 12px", opacity:reached?1:0.35,
                    }}>
                      <span style={{ fontSize:18 }}>{m.badge}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:reached?m.color:"#555" }}>{m.label}</div>
                        <div style={{ fontSize:10, color:"#444" }}>{m.perk}</div>
                      </div>
                      <div style={{ fontSize:10, color:"#333", fontWeight:700 }}>{fmt(m.subs)}</div>
                      {reached && <span style={{ fontSize:10, color:"#4caf50" }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:16, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#444", marginBottom:14, letterSpacing:1 }}>CHANNEL STATUS</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  ["Subscribers", fmt(subs)],
                  ["Total Views", fmt(totalViews)],
                  ["Videos", uploads],
                  ["Viral Hits", viralCount],
                  ["Flopped", flopCount],
                  ["Monetised", monetised?"Yes ✓":"No"],
                  ["Verified", verified?"Yes ✅":"No"],
                  ["Balance", monetised?fmtMoney(money):"—"],
                ].map(([k,v]) => (
                  <div key={k} style={{ borderBottom:"1px solid #161616", paddingBottom:8 }}>
                    <div style={{ fontSize:10, color:"#444", marginBottom:2 }}>{k}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:16, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#444", marginBottom:12, letterSpacing:1 }}>ACTIVE UPGRADES</div>
              {ownedUpgrades.length===0
                ? <div style={{ fontSize:12, color:"#2a2a2a" }}>No upgrades yet.</div>
                : <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {ownedUpgrades.map(id => {
                      const u=UPGRADES.find(x=>x.id===id);
                      return u?<div key={id} style={{ background:"#0d1f0d", border:"1px solid #1a3a1a", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600, color:"#4caf50" }}>{u.icon} {u.name}</div>:null;
                    })}
                  </div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
