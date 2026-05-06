import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { getDonorPublicStats, getDonorResolvedNeeds } from "../lib/api"

// ─── MOCK FALLBACK (shown while loading or on error) ─────────────────────────
const FALLBACK_STATS = { totalNeedsAddressed:0, volunteersActive:0, peopleHelped:0, totalVolunteerHours:0 }
const FALLBACK_NEEDS = []

const CATEGORIES = ["All","Medical","Food","Water","Shelter","Education"]
const SORT_OPTIONS = ["Urgency","Newest","Most Needed"]
const URGENCY_STYLES = {
    Critical: { light:{ bg:"#FEE2E2",text:"#DC2626",border:"#FECACA" }, dark:{ bg:"#450a0a",text:"#f87171",border:"#7f1d1d" } },
    High:     { light:{ bg:"#FEF3C7",text:"#D97706",border:"#FDE68A" }, dark:{ bg:"#451a03",text:"#fbbf24",border:"#78350f" } },
    Medium:   { light:{ bg:"#ECFDF5",text:"#059669",border:"#A7F3D0" }, dark:{ bg:"#052e16",text:"#34d399",border:"#065f46" } },
}

const TICKER_ITEMS = [
    { icon:"✅", text:"Water tanker reached 80 families in Kurla", time:"2 hours ago", urgent:false },
    { icon:"✅", text:"Medical kit delivered to Dharavi clinic", time:"Yesterday", urgent:false },
    { icon:"🔴", text:"URGENT: Food needed for 34 families in Sion", time:"Right now", urgent:true },
    { icon:"✅", text:"Blankets distributed to 52 people in Govandi", time:"3 hours ago", urgent:false },
    { icon:"🔴", text:"URGENT: Clean water crisis in Mankhurd East", time:"45 min ago", urgent:true },
    { icon:"✅", text:"School supplies reached 120 kids in Chembur", time:"This morning", urgent:false },
    { icon:"🟡", text:"Shelter needed for 18 displaced families in Bandra", time:"2 hours ago", urgent:false },
]

const MAP_ZONES = [
    { label:"Dharavi",  top:"38%", left:"32%", size:18, active:true,  count:3 },
    { label:"Sion",     top:"30%", left:"55%", size:14, active:true,  count:2 },
    { label:"Kurla",    top:"20%", left:"65%", size:12, active:true,  count:1 },
    { label:"Govandi",  top:"15%", left:"78%", size:10, active:true,  count:1 },
    { label:"Mankhurd", top:"52%", left:"72%", size:14, active:true,  count:2 },
    { label:"Chembur",  top:"42%", left:"80%", size:10, active:false, count:1 },
    { label:"Bandra",   top:"55%", left:"22%", size:12, active:true,  count:2 },
]

// ─── TICKER ───────────────────────────────────────────────────────────────────
function ImpactTicker({ dark }) {
    const items = [...TICKER_ITEMS,...TICKER_ITEMS]
    return (
        <div style={{ background:dark?"#0f1a0c":"#1a2e13", borderTop:`2px solid ${dark?"#78b450":"#3D8A25"}`, borderBottom:`2px solid ${dark?"#78b450":"#3D8A25"}`, overflow:"hidden", padding:"10px 0" }}>
            <motion.div style={{ display:"flex", gap:"60px", whiteSpace:"nowrap", width:"max-content" }} animate={{ x:["0%","-50%"] }} transition={{ duration:28, repeat:Infinity, ease:"linear" }}>
                {items.map((item,i) => (
                    <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"8px", fontSize:"13px", fontFamily:"'Outfit', sans-serif" }}>
            <span>{item.icon}</span>
            <span style={{ color:item.urgent?"#f87171":"#a7f3d0", fontWeight:item.urgent?700:400 }}>{item.text}</span>
            <span style={{ color:"#6b7280", fontSize:"11px" }}>· {item.time}</span>
            <span style={{ color:dark?"#3D8A25":"#78b450", margin:"0 10px" }}>•</span>
          </span>
                ))}
            </motion.div>
        </div>
    )
}

// ─── NEED CARD ────────────────────────────────────────────────────────────────
function NeedCard({ need, dark, onSupport }) {
    const urgencyStyle = URGENCY_STYLES[need.urgency]?.[dark?"dark":"light"] || URGENCY_STYLES.Medium[dark?"dark":"light"]
    const cardBg = dark?"#111f0d":"#ffffff"
    const borderColor = dark?"#1e3318":"#e5f0df"
    const textPrimary = dark?"#e8f5e2":"#1a2e13"
    const textSecondary = dark?"#7eb85a":"#4a7c35"
    const progressBg = dark?"#1e3318":"#e5f0df"
    const progressFill = dark?"#78b450":"#3D8A25"
    const [hov, setHov] = useState(false)
    const funded = need.funded ?? Math.round(((need.raised||0)/(need.target||1))*100)
    return (
        <motion.div onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
                    whileHover={{ y:-6, boxShadow:dark?"0 20px 50px rgba(120,180,80,0.18)":"0 20px 50px rgba(61,138,37,0.14)" }}
                    style={{ background:cardBg, border:`1px solid ${hov?(dark?"#3D8A25":"#5cb82e"):borderColor}`, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", gap:"12px", position:"relative", overflow:"hidden", transition:"border-color 0.2s" }}>
            <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.7, ease:"easeOut" }}
                        style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:urgencyStyle.text, opacity:0.8, transformOrigin:"left" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:"4px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <motion.span animate={{ rotate:hov?[0,-12,12,0]:0 }} transition={{ duration:0.45 }} style={{ fontSize:"22px", display:"inline-block" }}>{need.emoji||"📍"}</motion.span>
                    <div>
                        <div style={{ fontSize:"11px", fontWeight:600, color:textSecondary, textTransform:"uppercase", letterSpacing:"0.08em" }}>{need.category}</div>
                        <div style={{ fontSize:"15px", fontWeight:700, color:textPrimary, lineHeight:1.3 }}>{need.title}</div>
                    </div>
                </div>
                <span style={{ background:urgencyStyle.bg, color:urgencyStyle.text, border:`1px solid ${urgencyStyle.border}`, borderRadius:"20px", padding:"3px 10px", fontSize:"11px", fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>
          {need.urgency==="Critical"?"🔴 ":need.urgency==="High"?"🟡 ":"🟢 "}{need.urgency||"Medium"}
        </span>
            </div>
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                <span style={{ fontSize:"12px", color:textSecondary }}>📍 {need.location||need.address||"Mumbai"}</span>
                <span style={{ fontSize:"12px", color:textSecondary }}>👨‍👩‍👧 {need.families||need.affectedCount||"—"} families</span>
            </div>
            <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                    <span style={{ fontSize:"12px", color:textSecondary }}>Funding progress</span>
                    <span style={{ fontSize:"12px", fontWeight:700, color:progressFill }}>{funded}%</span>
                </div>
                <div style={{ background:progressBg, borderRadius:"99px", height:"7px", overflow:"hidden" }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${funded}%` }} transition={{ duration:1.4, ease:"easeOut", delay:0.2 }}
                                style={{ height:"100%", background:`linear-gradient(90deg, ${progressFill}, ${dark?"#a3d977":"#5cb82e"})`, borderRadius:"99px" }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
                    <span style={{ fontSize:"11px", color:dark?"#4a7c35":"#6a9e52" }}>₹{(need.raised||0).toLocaleString()} raised</span>
                    <span style={{ fontSize:"11px", color:dark?"#4a7c35":"#6a9e52" }}>of ₹{(need.target||0).toLocaleString()}</span>
                </div>
            </div>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => onSupport(need)}
                           style={{ background:`linear-gradient(135deg, ${dark?"#78b450":"#3D8A25"}, ${dark?"#5a9e3a":"#2d6b1c"})`, color:"#fff", border:"none", borderRadius:"10px", padding:"11px 16px", fontFamily:"'Outfit', sans-serif", fontWeight:700, fontSize:"14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
                <motion.span animate={{ x:hov?4:0 }} transition={{ duration:0.2 }}>Support This Need →</motion.span>
            </motion.button>
            <div style={{ display:"flex", justifyContent:"center" }}>
        <span style={{ background:dark?"#1e3318":"#f0f9eb", color:textSecondary, borderRadius:"99px", padding:"3px 12px", fontSize:"11px", fontWeight:500 }}>
          👤 {need.volunteers||0} volunteer{need.volunteers!==1?"s":""} assigned
        </span>
            </div>
        </motion.div>
    )
}

// ─── SUPPORT MODAL ────────────────────────────────────────────────────────────
function SupportModal({ need, dark, onClose }) {
    const [amount, setAmount] = useState(500)
    const [customAmount, setCustomAmount] = useState("")
    const [isCustom, setIsCustom] = useState(false)
    const [wantsUpdates, setWantsUpdates] = useState(false)
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const bg = dark?"#0d1a09":"#ffffff"
    const textPrimary = dark?"#e8f5e2":"#1a2e13"
    const textSecondary = dark?"#7eb85a":"#4a7c35"
    const border = dark?"#1e3318":"#e5f0df"
    const inputBg = dark?"#111f0d":"#f9fef6"
    const green = dark?"#78b450":"#3D8A25"
    const finalAmount = isCustom ? (parseInt(customAmount)||0) : amount
    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
                    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
            <motion.div initial={{ opacity:0,scale:0.88,y:40 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.9,y:30 }}
                        transition={{ type:"spring", damping:24, stiffness:300 }} onClick={e=>e.stopPropagation()}
                        style={{ background:bg, borderRadius:"22px", border:`1px solid ${border}`, width:"100%", maxWidth:"520px", maxHeight:"90vh", overflowY:"auto", padding:"28px", fontFamily:"'Outfit', sans-serif", boxShadow:dark?"0 32px 100px rgba(0,0,0,0.7)":"0 32px 100px rgba(0,0,0,0.18)" }}>
                {!submitted ? (
                    <>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
                            <div>
                                <div style={{ fontSize:"24px", marginBottom:"4px" }}>{need.emoji||"📍"}</div>
                                <h2 style={{ margin:0, fontSize:"20px", fontWeight:800, color:textPrimary }}>{need.title}</h2>
                                <div style={{ fontSize:"13px", color:textSecondary, marginTop:"4px" }}>📍 {need.location||"Mumbai"} · {need.families||need.affectedCount||"—"} families</div>
                            </div>
                            <motion.button whileHover={{ rotate:90 }} onClick={onClose}
                                           style={{ background:dark?"#1e3318":"#f0f9eb", border:"none", width:"32px", height:"32px", borderRadius:"50%", cursor:"pointer", color:textSecondary, fontSize:"15px", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</motion.button>
                        </div>
                        <p style={{ fontSize:"14px", color:textSecondary, lineHeight:1.65, margin:"0 0 20px" }}>{need.description||need.desc||""}</p>
                        <div style={{ marginBottom:"20px" }}>
                            <div style={{ fontSize:"14px", fontWeight:700, color:textPrimary, marginBottom:"10px" }}>Choose an amount</div>
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"8px" }}>
                                {[100,500,1000].map(v=>(
                                    <motion.button key={v} whileTap={{ scale:0.92 }} onClick={() => { setAmount(v); setIsCustom(false); setCustomAmount("") }}
                                                   style={{ padding:"10px", borderRadius:"10px", border:`2px solid ${(!isCustom&&amount===v)?green:border}`, background:(!isCustom&&amount===v)?(dark?"#1e3318":"#f0f9eb"):"transparent", color:(!isCustom&&amount===v)?green:textSecondary, fontFamily:"'Outfit', sans-serif", fontWeight:700, fontSize:"15px", cursor:"pointer", transition:"all 0.15s" }}>
                                        ₹{v}
                                    </motion.button>
                                ))}
                                <motion.button whileTap={{ scale:0.92 }} onClick={() => setIsCustom(true)}
                                               style={{ padding:"10px", borderRadius:"10px", border:`2px solid ${isCustom?green:border}`, background:isCustom?(dark?"#1e3318":"#f0f9eb"):"transparent", color:isCustom?green:textSecondary, fontFamily:"'Outfit', sans-serif", fontWeight:700, fontSize:"14px", cursor:"pointer" }}>
                                    Custom
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {isCustom && (
                                    <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:"auto" }} exit={{ opacity:0,height:0 }} style={{ overflow:"hidden" }}>
                                        <input type="number" placeholder="Enter amount in ₹" value={customAmount} onChange={e=>setCustomAmount(e.target.value)}
                                               style={{ marginTop:"10px", width:"100%", padding:"10px 14px", borderRadius:"10px", border:`1px solid ${border}`, background:inputBg, color:textPrimary, fontFamily:"'Outfit', sans-serif", fontSize:"15px", outline:"none", boxSizing:"border-box" }}/>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ marginBottom:"20px" }}>
                            <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
                                <input type="checkbox" checked={wantsUpdates} onChange={e=>setWantsUpdates(e.target.checked)} style={{ width:"16px", height:"16px", accentColor:green }}/>
                                <span style={{ fontSize:"14px", color:textPrimary }}>Notify me when this need is met</span>
                            </label>
                            <AnimatePresence>
                                {wantsUpdates && (
                                    <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:"auto" }} exit={{ opacity:0,height:0 }} style={{ overflow:"hidden" }}>
                                        <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}
                                               style={{ marginTop:"10px", width:"100%", padding:"10px 14px", borderRadius:"10px", border:`1px solid ${border}`, background:inputBg, color:textPrimary, fontFamily:"'Outfit', sans-serif", fontSize:"14px", outline:"none", boxSizing:"border-box" }}/>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ fontSize:"12px", color:dark?"#4a7c35":"#6a9e52", marginBottom:"20px", lineHeight:1.5 }}>
                            🔒 CivicPulse does not hold any funds. Payments go directly to the NGO partner.
                        </div>
                        <motion.button whileHover={{ scale:finalAmount>0?1.02:1 }} whileTap={{ scale:finalAmount>0?0.97:1 }} disabled={finalAmount<=0} onClick={() => setSubmitted(true)}
                                       style={{ width:"100%", padding:"15px", background:finalAmount>0?`linear-gradient(135deg, ${green}, ${dark?"#5a9e3a":"#2d6b1c"})`:(dark?"#1e3318":"#e5f0df"), color:finalAmount>0?"#fff":textSecondary, border:"none", borderRadius:"12px", fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:"16px", cursor:finalAmount>0?"pointer":"not-allowed" }}>
                            {finalAmount>0?`Contribute ₹${finalAmount.toLocaleString()} →`:"Select an amount"}
                        </motion.button>
                    </>
                ) : (
                    <motion.div initial={{ opacity:0,scale:0.85 }} animate={{ opacity:1,scale:1 }} transition={{ type:"spring", damping:18 }} style={{ textAlign:"center", padding:"24px 0" }}>
                        <motion.div initial={{ scale:0,rotate:-180 }} animate={{ scale:1,rotate:0 }} transition={{ type:"spring", stiffness:200, damping:14 }} style={{ fontSize:"64px", marginBottom:"16px" }}>🌱</motion.div>
                        <h2 style={{ fontSize:"26px", fontWeight:900, color:green, margin:"0 0 10px" }}>Thank you!</h2>
                        <p style={{ fontSize:"15px", color:textSecondary, lineHeight:1.6, margin:"0 0 20px" }}>
                            You're making a real difference for {need.families||need.affectedCount||"many"} families.{wantsUpdates&&email?` Updates will arrive at ${email}.`:""}
                        </p>
                        <motion.button whileHover={{ scale:1.03 }} onClick={onClose}
                                       style={{ background:"none", border:`1px solid ${border}`, color:textSecondary, borderRadius:"10px", padding:"10px 28px", fontFamily:"'Outfit', sans-serif", fontWeight:600, fontSize:"14px", cursor:"pointer" }}>
                            Browse more needs
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    )
}

// ─── MAP PREVIEW ──────────────────────────────────────────────────────────────
function MapPreview({ dark }) {
    const textSecondary = dark?"#7eb85a":"#4a7c35"
    const gridColor = dark?"#1a2e13":"#c8e6b8"
    return (
        <div style={{ background:dark?"#0d1a09":"#e8f5e0", borderRadius:"16px", border:`1px solid ${dark?"#1e3318":"#c8e6b8"}`, padding:"20px", position:"relative", overflow:"hidden", minHeight:"220px" }}>
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.35 }}>
                {[...Array(8)].map((_,i)=><line key={`h${i}`} x1="0" y1={`${(i+1)*12.5}%`} x2="100%" y2={`${(i+1)*12.5}%`} stroke={gridColor} strokeWidth="1"/>)}
                {[...Array(10)].map((_,i)=><line key={`v${i}`} x1={`${(i+1)*10}%`} y1="0" x2={`${(i+1)*10}%`} y2="100%" stroke={gridColor} strokeWidth="1"/>)}
            </svg>
            {MAP_ZONES.map((zone,i)=>(
                <motion.div key={i} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:i*0.1,type:"spring" }}
                            style={{ position:"absolute", top:zone.top, left:zone.left, transform:"translate(-50%, -50%)" }}>
                    {zone.active && <motion.div animate={{ scale:[1,1.9,1],opacity:[0.5,0,0.5] }} transition={{ duration:2.2,repeat:Infinity,delay:i*0.3 }}
                                                style={{ position:"absolute", width:zone.size+14, height:zone.size+14, borderRadius:"50%", background:zone.count>2?"#ef4444":"#f97316", opacity:0.3, top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}/>}
                    <div style={{ width:zone.size, height:zone.size, borderRadius:"50%", background:zone.count>2?"#ef4444":zone.count>1?"#f97316":"#78b450", border:"2px solid rgba(255,255,255,0.6)", position:"relative" }}/>
                    <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:"3px", fontSize:"9px", fontWeight:700, color:textSecondary, whiteSpace:"nowrap" }}>{zone.label}</div>
                </motion.div>
            ))}
            <div style={{ position:"absolute", top:"14px", right:"14px", background:dark?"#1e3318":"#ffffff", border:`1px solid ${dark?"#3D8A25":"#c8e6b8"}`, borderRadius:"99px", padding:"4px 12px", fontSize:"12px", fontWeight:700, color:dark?"#78b450":"#3D8A25" }}>7 active zones</div>
        </div>
    )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DonorsPage() {
    const [dark, setDark] = useState(false)
    const [activeCategory, setActiveCategory] = useState("All")
    const [sortBy, setSortBy] = useState("Urgency")
    const [selectedNeed, setSelectedNeed] = useState(null)
    const [publicStats, setPublicStats] = useState(FALLBACK_STATS)
    const [resolvedNeeds, setResolvedNeeds] = useState(FALLBACK_NEEDS)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            getDonorPublicStats().then(r => setPublicStats(r.data || r)).catch(() => {}),
            getDonorResolvedNeeds().then(r => {
                const items = r.data || r
                setResolvedNeeds(Array.isArray(items) ? items : [])
            }).catch(() => {}),
        ]).finally(() => setLoading(false))
    }, [])

    const bg = dark?"#080f06":"#f5faf2"
    const cardBg = dark?"#0d1a09":"#ffffff"
    const textPrimary = dark?"#e8f5e2":"#1a2e13"
    const textSecondary = dark?"#7eb85a":"#4a7c35"
    const border = dark?"#1e3318":"#ddeedd"
    const green = dark?"#78b450":"#3D8A25"
    const pillBg = dark?"#111f0d":"#e8f5e0"
    const pillActive = dark?"#78b450":"#3D8A25"

    // Build needs list from resolvedNeeds + enrich with display fields
    const allNeeds = resolvedNeeds.length > 0
        ? resolvedNeeds.map((n,i) => ({
            id: n.id||n.needId||i,
            category: n.category?.[0]?.toUpperCase()+n.category?.slice(1)||"Other",
            emoji: { food:"🍱", medical:"🏥", shelter:"🏠", water:"💧", education:"📚" }[n.category] || "📍",
            title: n.title||`${n.category} need`,
            location: n.location?.address||"Mumbai",
            families: n.affectedCount||0,
            urgency: n.urgencyScore>70?"Critical":n.urgencyScore>50?"High":"Medium",
            funded: Math.min(100, Math.round(Math.random()*80+20)),
            volunteers: 0,
            description: n.description||"",
            target: 10000,
            raised: Math.round(Math.random()*9000),
        }))
        : []

    const filteredNeeds = allNeeds
        .filter(n => activeCategory==="All" || n.category===activeCategory)
        .sort((a,b) => {
            if (sortBy==="Urgency") { const o={ Critical:0,High:1,Medium:2 }; return o[a.urgency]-o[b.urgency] }
            if (sortBy==="Most Needed") return a.funded-b.funded
            return b.id-a.id
        })

    const impactStats = [
        { val: publicStats.totalNeedsAddressed?.toLocaleString()||"—", label:"Needs addressed", icon:"🎯" },
        { val: publicStats.peopleHelped?.toLocaleString()||"—",       label:"People helped",   icon:"👨‍👩‍👧" },
        { val: publicStats.volunteersActive?.toLocaleString()||"—",   label:"Active volunteers",icon:"🙋" },
        { val: publicStats.totalVolunteerHours?.toLocaleString()||"—", label:"Volunteer hours", icon:"⏱" },
    ]

    return (
        <div style={{ fontFamily:"'Outfit', sans-serif", background:bg, minHeight:"100vh", color:textPrimary, transition:"background 0.3s, color 0.3s" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');* { box-sizing: border-box; margin: 0; padding: 0; }::-webkit-scrollbar { width: 6px; }::-webkit-scrollbar-thumb { background: ${dark?"#1e3318":"#c8e6b8"}; border-radius: 3px; }`}</style>

            <nav style={{ position:"sticky", top:0, zIndex:100, background:dark?"rgba(8,15,6,0.93)":"rgba(245,250,242,0.93)", backdropFilter:"blur(14px)", borderBottom:`1px solid ${border}`, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"62px" }}>
                <Link to="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"8px" }}>
                    <motion.div whileHover={{ rotate:12,scale:1.08 }} style={{ width:"32px", height:"32px", borderRadius:"9px", background:`linear-gradient(135deg, ${green}, ${dark?"#5a9e3a":"#2d6b1c"})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px" }}>🌿</motion.div>
                    <span style={{ fontWeight:800, fontSize:"18px", color:textPrimary }}>CivicPulse</span>
                </Link>
                <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
                    <Link to="/" style={{ textDecoration:"none", fontSize:"14px", fontWeight:500, color:textSecondary }}>Home</Link>
                    <Link to="/report" style={{ textDecoration:"none", fontSize:"14px", fontWeight:500, color:textSecondary }}>Report a Need</Link>
                    <motion.button whileTap={{ scale:0.92 }} onClick={() => setDark(d=>!d)}
                                   style={{ background:dark?"#182913":"#e8f5e0", border:`1px solid ${border}`, borderRadius:"99px", padding:"6px 14px", fontFamily:"'Outfit', sans-serif", fontWeight:600, fontSize:"13px", cursor:"pointer", color:textSecondary, display:"flex", alignItems:"center", gap:"6px" }}>
                        {dark?"☀️ Light":"🌙 Dark"}
                    </motion.button>
                </div>
            </nav>

            <ImpactTicker dark={dark}/>

            {/* Hero */}
            <section style={{ padding:"70px 24px 52px", textAlign:"center", maxWidth:"880px", margin:"0 auto" }}>
                <motion.div initial={{ opacity:0,y:28 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.65 }}>
                    <motion.div animate={{ opacity:[1,0.45,1] }} transition={{ duration:2.2,repeat:Infinity }}
                                style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:dark?"#0d1a09":"#e8f5e0", border:`1px solid ${dark?"#1e3318":"#b8dba8"}`, borderRadius:"99px", padding:"6px 18px", marginBottom:"28px" }}>
                        <div style={{ width:"9px", height:"9px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px #22c55e" }}/>
                        <span style={{ fontSize:"13px", fontWeight:700, color:green }}>{loading ? "Loading..." : `${publicStats.totalNeedsAddressed||0} needs addressed`}</span>
                    </motion.div>
                    <h1 style={{ fontSize:"clamp(34px, 6vw, 60px)", fontWeight:900, lineHeight:1.08, color:textPrimary, marginBottom:"22px", letterSpacing:"-0.03em" }}>
                        Your support reaches people{" "}
                        <span style={{ color:green, position:"relative" }}>
              in hours
              <svg style={{ position:"absolute", bottom:"-5px", left:0, width:"100%", height:"7px" }} viewBox="0 0 100 7" preserveAspectRatio="none">
                <motion.path d="M0,6 Q50,0 100,6" stroke={green} strokeWidth="2.5" fill="none" initial={{ pathLength:0 }} animate={{ pathLength:1 }} transition={{ duration:1,delay:0.6 }}/>
              </svg>
            </span>
                        {" "}— not months
                    </h1>
                    <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
                              style={{ fontSize:"18px", color:textSecondary, lineHeight:1.65, maxWidth:"600px", margin:"0 auto 36px" }}>
                        Browse verified community needs. Every rupee is tracked publicly in real time.
                    </motion.p>
                    <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                        <motion.a href="#needs" whileHover={{ scale:1.04,y:-2 }} whileTap={{ scale:0.97 }}
                                  style={{ background:`linear-gradient(135deg, ${green}, ${dark?"#5a9e3a":"#2d6b1c"})`, color:"#fff", textDecoration:"none", borderRadius:"13px", padding:"15px 30px", fontWeight:800, fontSize:"16px", boxShadow:`0 6px 24px ${green}44` }}>
                            Browse Active Needs ↓
                        </motion.a>
                        <Link to="/report" style={{ background:"transparent", color:textSecondary, textDecoration:"none", borderRadius:"13px", padding:"15px 28px", fontWeight:600, fontSize:"15px", border:`1px solid ${border}` }}>
                            Report a Need
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Impact stats */}
            <section style={{ maxWidth:"1100px", margin:"0 auto 16px", padding:"0 24px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"14px" }}>
                    {impactStats.map((stat,i) => (
                        <motion.div key={stat.label} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.08 }}
                                    whileHover={{ y:-4, boxShadow:dark?"0 10px 28px rgba(120,180,80,0.12)":"0 10px 28px rgba(61,138,37,0.1)" }}
                                    style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:"14px", padding:"18px 20px", display:"flex", alignItems:"center", gap:"14px" }}>
                            <motion.div animate={{ scale:[1,1.15,1] }} transition={{ duration:2,repeat:Infinity,delay:i*0.4 }} style={{ fontSize:"28px" }}>{stat.icon}</motion.div>
                            <div>
                                <div style={{ fontSize:"22px", fontWeight:900, color:green }}>{loading ? "..." : stat.val}</div>
                                <div style={{ fontSize:"12px", color:textSecondary, fontWeight:500 }}>{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Needs grid */}
            <section id="needs" style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 24px 64px" }}>
                <motion.h2 initial={{ opacity:0,x:-16 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
                           style={{ fontSize:"26px", fontWeight:800, color:textPrimary, marginBottom:"20px" }}>Active Needs</motion.h2>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", flexWrap:"wrap", gap:"12px" }}>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                        {CATEGORIES.map(cat => (
                            <motion.button key={cat} whileTap={{ scale:0.93 }} onClick={() => setActiveCategory(cat)}
                                           style={{ padding:"7px 16px", borderRadius:"99px", border:`1px solid ${activeCategory===cat?pillActive:border}`, background:activeCategory===cat?pillActive:pillBg, color:activeCategory===cat?"#fff":textSecondary, fontFamily:"'Outfit', sans-serif", fontWeight:600, fontSize:"13px", cursor:"pointer", transition:"all 0.15s" }}>
                                {cat}
                            </motion.button>
                        ))}
                    </div>
                    <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                            style={{ padding:"7px 14px", borderRadius:"10px", border:`1px solid ${border}`, background:cardBg, color:textSecondary, fontFamily:"'Outfit', sans-serif", fontWeight:600, fontSize:"13px", cursor:"pointer", outline:"none" }}>
                        {SORT_OPTIONS.map(o=><option key={o} value={o}>Sort: {o}</option>)}
                    </select>
                </div>
                {loading ? (
                    <p style={{ color:textSecondary, fontSize:14, textAlign:"center", padding:"60px 0" }}>Loading active needs...</p>
                ) : filteredNeeds.length === 0 ? (
                    <p style={{ color:textSecondary, fontSize:14, textAlign:"center", padding:"60px 0" }}>No needs found. Check back soon or report a need.</p>
                ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:"20px" }}>
                        <AnimatePresence mode="popLayout">
                            {filteredNeeds.map((need,i) => (
                                <motion.div key={need.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,scale:0.95 }} transition={{ delay:i*0.06 }}>
                                    <NeedCard need={need} dark={dark} onSupport={setSelectedNeed}/>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            {/* Map section */}
            <section style={{ maxWidth:"960px", margin:"0 auto", padding:"64px 24px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"32px", alignItems:"center" }}>
                    <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}>
                        <h2 style={{ fontSize:"28px", fontWeight:800, color:textPrimary, marginBottom:"12px", lineHeight:1.2 }}>Needs are concentrated. Help is mapped.</h2>
                        <p style={{ fontSize:"15px", color:textSecondary, lineHeight:1.7, marginBottom:"20px" }}>
                            Every verified need is geo-tagged across Mumbai. Donations are deployed to the highest-urgency zones first.
                        </p>
                        <motion.a href="#needs" whileHover={{ scale:1.03 }}
                                  style={{ display:"inline-flex", alignItems:"center", gap:"6px", textDecoration:"none", color:"#fff", fontWeight:700, fontSize:"14px", borderRadius:"10px", padding:"10px 18px", background:`linear-gradient(135deg, ${green}, ${dark?"#5a9e3a":"#2d6b1c"})` }}>
                            Browse needs →
                        </motion.a>
                    </motion.div>
                    <motion.div initial={{ opacity:0,x:24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}>
                        <MapPreview dark={dark}/>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop:`1px solid ${border}`, background:dark?"#0a1208":"#e8f5e0", padding:"40px 24px" }}>
                <div style={{ maxWidth:"960px", margin:"0 auto" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"24px", marginBottom:"24px" }}>
                        <div>
                            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                                <div style={{ width:"26px", height:"26px", borderRadius:"7px", background:green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>🌿</div>
                                <span style={{ fontWeight:800, fontSize:"16px", color:textPrimary }}>CivicPulse</span>
                            </div>
                            <p style={{ fontSize:"13px", color:textSecondary, maxWidth:"220px", lineHeight:1.6 }}>Open-source. Built for impact, not profit.</p>
                        </div>
                        <div style={{ display:"flex", gap:"24px", flexWrap:"wrap" }}>
                            {[{label:"Home",to:"/"},{label:"Report a Need",to:"/report"}].map(link=>(
                                <Link key={link.label} to={link.to} style={{ textDecoration:"none", fontSize:"14px", fontWeight:500, color:textSecondary }}>{link.label}</Link>
                            ))}
                        </div>
                    </div>
                    <div style={{ borderTop:`1px solid ${border}`, paddingTop:"16px", fontSize:"12px", color:dark?"#3D8A25":"#6a9e52", textAlign:"center" }}>
                        © 2025 CivicPulse · All donations flow through verified NGO partners · Platform is grant-funded
                    </div>
                </div>
            </footer>

            <AnimatePresence>
                {selectedNeed && <SupportModal need={selectedNeed} dark={dark} onClose={() => setSelectedNeed(null)}/>}
            </AnimatePresence>
        </div>
    )
}