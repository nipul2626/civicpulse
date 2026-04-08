import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useTransform, useScroll } from "framer-motion"
import {
    Zap, Menu, X, ArrowRight, Mail, Lock, Eye, EyeOff,
    User, Building2, Check, MapPin, Phone, Globe,
    ChevronRight, Shield, BarChart3, Users, Heart,
    MessageSquare, Send,
    TrendingUp, Clock, AlertCircle,
    Sparkles, Target, Activity
} from "lucide-react"

/* ─── INLINE INPUT COMPONENT (no external dep) ──────────────────────────── */
const Input = ({ label, type = "text", placeholder, value, onChange, icon }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {label && (
            <label style={{ fontSize:13, fontWeight:600, color:"#3B4953" }}>{label}</label>
        )}
        <div style={{ position:"relative" }}>
            {icon && (
                <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                    color:"#90AB8B", pointerEvents:"none", display:"flex" }}>
                    {icon}
                </div>
            )}
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                   style={{
                       width:"100%", borderRadius:12, padding:"11px 16px",
                       paddingLeft: icon ? 40 : 16,
                       fontSize:14, outline:"none", boxSizing:"border-box",
                       background:"#f8faf6", border:"1.5px solid #d4e4cc", color:"#1C352D",
                       transition:"all 0.2s",
                   }}
                   onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                   onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.background="#f8faf6"; e.target.style.boxShadow="none" }}
            />
        </div>
    </div>
)

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */

const NAV_LINKS = [
    { label: "Home",       href: "#home"     },
    { label: "About",      href: "#about"    },
    { label: "NGOs",       href: "#ngos"     },
    { label: "Contact",    href: "#contact"  },
]

const STATS = [
    { value: "2,400+", label: "Active Volunteers", icon: <Users size={18} /> },
    { value: "180+",   label: "NGOs Registered",   icon: <Building2 size={18} /> },
    { value: "94%",    label: "Match Accuracy",     icon: <Target size={18} /> },
    { value: "12,000+",label: "Needs Addressed",    icon: <Heart size={18} /> },
]

const FEATURES = [
    {
        icon: <Sparkles size={22} />,
        title: "AI-Powered Urgency Scoring",
        desc: "Every field report is scored in real-time using Gemini AI — so coordinators always know what needs attention first.",
        color: "#5A7863",
    },
    {
        icon: <Users size={22} />,
        title: "Smart Volunteer Matching",
        desc: "A 6-factor algorithm matches volunteers by skill, proximity, availability, and past history. Zero manual calls.",
        color: "#3B7D6E",
    },
    {
        icon: <BarChart3 size={22} />,
        title: "Live Impact Dashboard",
        desc: "Donors see exactly where their contributions go — in real-time. Transparent, powerful, trust-building.",
        color: "#4A6741",
    },
    {
        icon: <Activity size={22} />,
        title: "Geo Heatmaps",
        desc: "Visual hotspots of community need overlaid on live maps. Identify underserved zones at a glance.",
        color: "#2D5E4E",
    },
    {
        icon: <Shield size={22} />,
        title: "Verified NGO Network",
        desc: "All NGOs go through a structured verification process. Every volunteer knows they're contributing to legitimate causes.",
        color: "#5A7863",
    },
    {
        icon: <TrendingUp size={22} />,
        title: "Closed-Loop Tracking",
        desc: "From survey submission to volunteer deployed to donor notified — the full loop closes in one platform.",
        color: "#3B5C38",
    },
]

const NGOS = [
    {
        name: "Green Horizon Foundation",
        city: "Mumbai, Maharashtra",
        focus: "Environment & Climate",
        volunteers: 248,
        needs: 34,
        rating: 4.9,
        verified: true,
        badge: "Top Rated",
        badgeColor: "#5A7863",
        desc: "Working on urban reforestation, plastic-free drives, and climate resilience programs across coastal Maharashtra.",
        avatar: "GH",
        since: "2019",
    },
    {
        name: "Asha Jyoti Trust",
        city: "Delhi NCR",
        focus: "Education & Literacy",
        volunteers: 315,
        needs: 51,
        rating: 4.8,
        verified: true,
        badge: "Most Active",
        badgeColor: "#3B7D6E",
        desc: "Bridging education gaps in slum communities through peer-tutoring networks and digital literacy programs.",
        avatar: "AJ",
        since: "2016",
    },
    {
        name: "Prayas Welfare Society",
        city: "Pune, Maharashtra",
        focus: "Health & Nutrition",
        volunteers: 190,
        needs: 28,
        rating: 4.7,
        verified: true,
        badge: "New",
        badgeColor: "#6B8F71",
        desc: "Mobile health clinics, nutrition camps, and maternal health support reaching 12 rural talukas every month.",
        avatar: "PW",
        since: "2021",
    },
    {
        name: "Udaan Skill Center",
        city: "Bengaluru, Karnataka",
        focus: "Skill Development",
        volunteers: 167,
        needs: 19,
        rating: 4.8,
        verified: true,
        badge: "High Impact",
        badgeColor: "#4A6741",
        desc: "Vocational training for youth from marginalised backgrounds — from coding bootcamps to carpentry workshops.",
        avatar: "US",
        since: "2020",
    },
    {
        name: "Sevalaya Trust",
        city: "Chennai, Tamil Nadu",
        focus: "Women Empowerment",
        volunteers: 280,
        needs: 42,
        rating: 4.9,
        verified: true,
        badge: "Top Rated",
        badgeColor: "#5A7863",
        desc: "Self-help groups, legal aid clinics, and micro-finance support for women entrepreneurs across Tamil Nadu.",
        avatar: "ST",
        since: "2017",
    },
    {
        name: "Jal Shakti NGO",
        city: "Jaipur, Rajasthan",
        focus: "Water & Sanitation",
        volunteers: 142,
        needs: 23,
        rating: 4.6,
        verified: true,
        badge: "Urgent Needs",
        badgeColor: "#C4853E",
        desc: "Rainwater harvesting, borewell restoration, and open defecation free village campaigns across desert regions.",
        avatar: "JS",
        since: "2018",
    },
]

const STEPS = [
    { id: 0, label: "Choose role",  desc: "Who are you?"       },
    { id: 1, label: "Your details", desc: "Basic information"  },
    { id: 2, label: "Skills",       desc: "What can you do?"   },
    { id: 3, label: "Confirm",      desc: "Review and finish"  },
]

const SKILLS_LIST = [
    "Medical Aid","Logistics","Teaching","Construction",
    "Counseling","Driving","Cooking","IT Support",
    "Translation","Photography","Legal Aid","Finance",
]

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    size: Math.random()*3+2, dur: Math.random()*8+6, delay: Math.random()*4,
}))

/* ─── FLOATING PARTICLES ─────────────────────────────────────────────────── */
const BgParticles = () => (
    <>
        {PARTICLES.map(p => (
            <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
                        style={{ left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size,
                            background:"#5A7863", opacity:0.08 }}
                        animate={{ y:[0,-35,0], opacity:[0.04,0.18,0.04] }}
                        transition={{ duration:p.dur, delay:p.delay, repeat:Infinity, ease:"easeInOut" }}
            />
        ))}
    </>
)

/* ─── NAVBAR ─────────────────────────────────────────────────────────────── */
const Navbar = ({ onAuthClick, authMode, onNgoRegister }) => {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { scrollY } = useScroll()

    useEffect(() => {
        const unsub = scrollY.on("change", v => setScrolled(v > 60))
        return unsub
    }, [scrollY])

    const scrollTo = (href) => {
        setMobileOpen(false)
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-[999]"
            style={{
                background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                borderBottom: scrolled ? "1px solid rgba(90,120,99,0.15)" : "1px solid transparent",
                boxShadow: scrolled ? "0 2px 30px rgba(28,53,45,0.08)" : "none",
                transition: "all 0.3s ease",
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
                {/* Logo */}
                <motion.div className="flex items-center gap-3 cursor-pointer"
                            onClick={() => scrollTo("#home")}
                            whileHover={{ scale: 1.02 }}>
                    <motion.div
                        animate={{ boxShadow:["0 0 0px #5A786300","0 0 18px #5A786355","0 0 0px #5A786300"] }}
                        transition={{ duration:3, repeat:Infinity }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background:"#1C352D" }}>
                        <Zap size={16} color="#EBF4DD" />
                    </motion.div>
                    <div>
                        <span className="font-black text-lg tracking-tight" style={{ color:"#1C352D" }}>CivicPulse</span>
                        <p className="text-[9px] tracking-widest uppercase font-semibold leading-none" style={{ color:"#90AB8B" }}>by CivicPlus</p>
                    </div>
                </motion.div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map(link => (
                        <button key={link.label}
                                onClick={() => scrollTo(link.href)}
                                className="text-sm font-semibold transition-all duration-200 hover:opacity-100"
                                style={{ color:"#3B4953", opacity:0.75 }}
                                onMouseEnter={e => { e.currentTarget.style.color="#1C352D"; e.currentTarget.style.opacity="1" }}
                                onMouseLeave={e => { e.currentTarget.style.color="#3B4953"; e.currentTarget.style.opacity="0.75" }}>
                            {link.label}
                        </button>
                    ))}
                    <button
                        onClick={onNgoRegister}
                        className="text-sm font-semibold transition-all duration-200 flex items-center gap-1"
                        style={{ color:"#5A7863", opacity:1 }}
                        onMouseEnter={e => e.currentTarget.style.color="#1C352D"}
                        onMouseLeave={e => e.currentTarget.style.color="#5A7863"}>
                        <Building2 size={13} /> Register NGO
                    </button>
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                        onClick={() => onAuthClick("login")}
                        className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{
                            background: authMode === "login" ? "#1C352D" : "transparent",
                            color: authMode === "login" ? "#EBF4DD" : "#1C352D",
                            border: "1.5px solid #1C352D"
                        }}>
                        Sign In
                    </motion.button>
                    <motion.button
                        whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                        onClick={() => onAuthClick("signup")}
                        className="px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5"
                        style={{ background:"#5A7863", color:"#EBF4DD" }}>
                        Join Free <ArrowRight size={13} />
                    </motion.button>
                </div>

                {/* Mobile toggle */}
                <button className="md:hidden" onClick={() => setMobileOpen(p => !p)}
                        style={{ color:"#1C352D" }}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                        exit={{ opacity:0, height:0 }}
                        className="md:hidden overflow-hidden"
                        style={{ background:"rgba(255,255,255,0.99)", borderTop:"1px solid #e8f0e0" }}>
                        <div className="px-6 py-4 flex flex-col gap-4">
                            {NAV_LINKS.map(l => (
                                <button key={l.label} onClick={() => scrollTo(l.href)}
                                        className="text-sm font-semibold text-left" style={{ color:"#3B4953" }}>
                                    {l.label}
                                </button>
                            ))}
                            <button onClick={() => { onNgoRegister(); setMobileOpen(false) }}
                                    className="text-sm font-semibold text-left flex items-center gap-1.5" style={{ color:"#5A7863" }}>
                                <Building2 size={13} /> Register NGO
                            </button>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { onAuthClick("login"); setMobileOpen(false) }}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                                        style={{ borderColor:"#1C352D", color:"#1C352D" }}>Sign In</button>
                                <button onClick={() => { onAuthClick("signup"); setMobileOpen(false) }}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                                        style={{ background:"#1C352D", color:"#EBF4DD" }}>Join Free</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

/* ─── NGO REGISTRATION MODAL ─────────────────────────────────────────────── */
const NGO_STEPS = ["Basic Info", "Focus Areas", "Documents", "Done"]
const NGO_FOCUS = ["Education","Health","Environment","Women Empowerment","Skill Dev","Nutrition","Water & Sanitation","Disaster Relief","Child Welfare","Elder Care","Animal Welfare","Legal Aid"]

const NgoRegisterModal = ({ onClose }) => {
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [form, setForm] = useState({
        name:"", email:"", phone:"", city:"", website:"",
        regNumber:"", yearFounded:"", focus:[], description:"",
    })
    const s = k => e => setForm(p => ({...p, [k]: e.target.value}))
    const toggleFocus = f => setForm(p => ({
        ...p, focus: p.focus.includes(f) ? p.focus.filter(x=>x!==f) : [...p.focus, f]
    }))

    const next = () => {
        if (step < NGO_STEPS.length - 2) { setStep(s => s+1); return }
        setLoading(true)
        setTimeout(() => { setLoading(false); setDone(true); setStep(3) }, 2000)
    }

    const inputStyle = {
        width:"100%", borderRadius:10, padding:"10px 14px",
        fontSize:13, outline:"none", boxSizing:"border-box",
        background:"#f8faf6", border:"1.5px solid #d4e4cc", color:"#1C352D",
    }
    const labelStyle = { fontSize:12, fontWeight:600, color:"#5A7863", marginBottom:4, display:"block" }

    return (
        <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background:"rgba(28,53,45,0.7)", backdropFilter:"blur(10px)" }}
            onClick={onClose}>
            <motion.div
                initial={{ scale:0.92, y:30 }} animate={{ scale:1, y:0 }}
                exit={{ scale:0.92, y:30 }} transition={{ type:"spring", stiffness:280, damping:28 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width:"100%", maxWidth:520, background:"#fff",
                    borderRadius:28, overflow:"hidden",
                    boxShadow:"0 40px 120px rgba(28,53,45,0.25)",
                    border:"1.5px solid rgba(90,120,99,0.2)",
                }}>

                {/* Header */}
                <div style={{ background:"#1C352D", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(90,120,99,0.4)",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Building2 size={18} color="#EBF4DD" />
                        </div>
                        <div>
                            <p style={{ color:"#EBF4DD", fontWeight:800, fontSize:15, margin:0 }}>Register Your NGO</p>
                            <p style={{ color:"#90AB8B", fontSize:11, margin:0 }}>Free · Verified in 48hrs</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ color:"#90AB8B", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Step bar */}
                <div style={{ display:"flex", background:"#f8faf6", borderBottom:"1px solid #e8f0e0" }}>
                    {NGO_STEPS.map((s, i) => (
                        <div key={s} style={{
                            flex:1, padding:"10px 4px", textAlign:"center", fontSize:11, fontWeight:700,
                            color: i === step ? "#1C352D" : i < step ? "#5A7863" : "#90AB8B",
                            borderBottom: i === step ? "2.5px solid #5A7863" : "2.5px solid transparent",
                            transition:"all 0.2s",
                        }}>{i < step ? "✓ " : ""}{s}</div>
                    ))}
                </div>

                {/* Body */}
                <div style={{ padding:24, maxHeight:"55vh", overflowY:"auto" }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={step}
                                    initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                                    exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>

                            {/* Step 0: Basic Info */}
                            {step === 0 && (
                                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                    <p style={{ fontSize:14, fontWeight:800, color:"#1C352D", margin:0 }}>Basic Information</p>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                        <div style={{ gridColumn:"1/-1" }}>
                                            <label style={labelStyle}>Organization Name *</label>
                                            <input value={form.name} onChange={s("name")} placeholder="Green Future Foundation"
                                                   style={inputStyle}
                                                   onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                                                   onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.boxShadow="none" }} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Email *</label>
                                            <input value={form.email} onChange={s("email")} type="email" placeholder="contact@ngo.org"
                                                   style={inputStyle}
                                                   onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                                                   onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.boxShadow="none" }} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Phone *</label>
                                            <input value={form.phone} onChange={s("phone")} placeholder="+91 98765 00001"
                                                   style={inputStyle}
                                                   onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                                                   onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.boxShadow="none" }} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>City *</label>
                                            <input value={form.city} onChange={s("city")} placeholder="Mumbai"
                                                   style={inputStyle}
                                                   onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                                                   onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.boxShadow="none" }} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Year Founded</label>
                                            <input value={form.yearFounded} onChange={s("yearFounded")} placeholder="2018"
                                                   style={inputStyle}
                                                   onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                                                   onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.boxShadow="none" }} />
                                        </div>
                                        <div style={{ gridColumn:"1/-1" }}>
                                            <label style={labelStyle}>Website (optional)</label>
                                            <input value={form.website} onChange={s("website")} placeholder="https://yourngo.org"
                                                   style={inputStyle}
                                                   onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                                                   onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.boxShadow="none" }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Focus Areas */}
                            {step === 1 && (
                                <div>
                                    <p style={{ fontSize:14, fontWeight:800, color:"#1C352D", marginBottom:6 }}>Focus Areas</p>
                                    <p style={{ fontSize:12, color:"#90AB8B", marginBottom:14 }}>Select all that apply — this helps us match the right volunteers</p>
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
                                        {NGO_FOCUS.map(f => (
                                            <motion.button key={f} whileTap={{ scale:0.94 }}
                                                           onClick={() => toggleFocus(f)}
                                                           style={{
                                                               padding:"8px 14px", borderRadius:10, fontSize:12, fontWeight:600,
                                                               border:"1.5px solid", cursor:"pointer", transition:"all 0.15s",
                                                               background: form.focus.includes(f) ? "#1C352D" : "#f8faf6",
                                                               borderColor: form.focus.includes(f) ? "#1C352D" : "#d4e4cc",
                                                               color: form.focus.includes(f) ? "#EBF4DD" : "#5A7863",
                                                           }}>{f}</motion.button>
                                        ))}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Brief Description</label>
                                        <textarea value={form.description} onChange={s("description")}
                                                  placeholder="Tell us about your NGO's mission and impact..."
                                                  rows={3} style={{ ...inputStyle, resize:"none", lineHeight:1.5 }}
                                                  onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                                                  onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.boxShadow="none" }} />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Documents */}
                            {step === 2 && (
                                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                    <p style={{ fontSize:14, fontWeight:800, color:"#1C352D", margin:0 }}>Verification Documents</p>
                                    <p style={{ fontSize:12, color:"#90AB8B", margin:0 }}>These help us verify your NGO within 48 hours</p>
                                    {[
                                        { label:"Registration Number (12A / 80G / FCRA)", key:"regNumber", placeholder:"AAABCD1234E" },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label style={labelStyle}>{f.label}</label>
                                            <input value={form[f.key]} onChange={s(f.key)} placeholder={f.placeholder}
                                                   style={inputStyle}
                                                   onFocus={e => { e.target.style.borderColor="#5A7863"; e.target.style.boxShadow="0 0 0 3px rgba(90,120,99,0.12)" }}
                                                   onBlur={e => { e.target.style.borderColor="#d4e4cc"; e.target.style.boxShadow="none" }} />
                                        </div>
                                    ))}
                                    {/* Upload placeholders */}
                                    {["Registration Certificate", "Pan Card / Tax Document"].map(doc => (
                                        <div key={doc} style={{
                                            border:"1.5px dashed #d4e4cc", borderRadius:12, padding:"16px",
                                            display:"flex", alignItems:"center", gap:12, cursor:"pointer",
                                            background:"#fafcf8", transition:"all 0.2s",
                                        }}
                                             onMouseEnter={e => e.currentTarget.style.borderColor="#5A7863"}
                                             onMouseLeave={e => e.currentTarget.style.borderColor="#d4e4cc"}>
                                            <div style={{ width:36, height:36, borderRadius:8, background:"#EBF4DD",
                                                display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A7863" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p style={{ fontSize:13, fontWeight:700, color:"#1C352D", margin:0 }}>{doc}</p>
                                                <p style={{ fontSize:11, color:"#90AB8B", margin:0 }}>PDF or image · Max 5MB</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ padding:"12px 14px", borderRadius:10, background:"#EBF4DD",
                                        border:"1px solid #d4e4cc", display:"flex", gap:8, alignItems:"flex-start" }}>
                                        <Shield size={14} style={{ color:"#5A7863", marginTop:2, flexShrink:0 }} />
                                        <p style={{ fontSize:11, color:"#3B5C38", margin:0, lineHeight:1.5 }}>
                                            Your documents are encrypted and only used for verification. They are never shared publicly.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Done */}
                            {step === 3 && (
                                <div style={{ textAlign:"center", padding:"20px 0" }}>
                                    <motion.div
                                        initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
                                        transition={{ type:"spring", stiffness:200, damping:15 }}
                                        style={{ width:64, height:64, borderRadius:20, background:"#1C352D",
                                            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                                        <Check size={28} color="#EBF4DD" />
                                    </motion.div>
                                    <p style={{ fontSize:20, fontWeight:800, color:"#1C352D", marginBottom:8 }}>
                                        Application Submitted! 🎉
                                    </p>
                                    <p style={{ fontSize:13, color:"#5A7863", marginBottom:20, lineHeight:1.6 }}>
                                        <strong>{form.name || "Your NGO"}</strong> has been submitted for verification.
                                        Our team will review and activate your account within <strong>48 hours</strong>.
                                        Check <strong>{form.email || "your email"}</strong> for updates.
                                    </p>
                                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                        {[
                                            { icon:"✓", text:"Application received" },
                                            { icon:"⏳", text:"Under verification (48hrs)" },
                                            { icon:"🚀", text:"Access granted to dashboard" },
                                        ].map(i => (
                                            <div key={i.text} style={{ display:"flex", alignItems:"center", gap:10,
                                                padding:"10px 14px", borderRadius:10, background:"#f8faf6",
                                                border:"1px solid #e8f0e0", textAlign:"left" }}>
                                                <span style={{ fontSize:14 }}>{i.icon}</span>
                                                <span style={{ fontSize:12, fontWeight:600, color:"#3B5C38" }}>{i.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={onClose}
                                            style={{ marginTop:20, padding:"12px 32px", borderRadius:14, background:"#1C352D",
                                                color:"#EBF4DD", fontWeight:800, fontSize:13, border:"none", cursor:"pointer",
                                                boxShadow:"0 4px 16px rgba(28,53,45,0.25)" }}>
                                        Back to CivicPulse
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer buttons */}
                {step < 3 && (
                    <div style={{ padding:"16px 24px", borderTop:"1px solid #e8f0e0",
                        display:"flex", gap:10, background:"#fafcf8" }}>
                        {step > 0 && (
                            <button onClick={() => setStep(s => s-1)}
                                    style={{ padding:"10px 20px", borderRadius:12, border:"1.5px solid #d4e4cc",
                                        color:"#3B4953", fontWeight:700, fontSize:13, background:"#fff", cursor:"pointer" }}>
                                Back
                            </button>
                        )}
                        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                       onClick={next} disabled={loading}
                                       style={{ flex:1, padding:"11px 20px", borderRadius:12, background:"#1C352D",
                                           color:"#EBF4DD", fontWeight:800, fontSize:13, border:"none", cursor:"pointer",
                                           display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                                           boxShadow:"0 4px 16px rgba(28,53,45,0.2)", opacity: loading ? 0.7 : 1 }}>
                            {loading
                                ? <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                : step === 2 ? <><Check size={14}/> Submit Application</> : <>Continue <ArrowRight size={14}/></>}
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}


const StepBar = ({ current }) => (
    <div className="flex items-center justify-center gap-0 mb-6">
        {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
                <motion.div className="flex flex-col items-center gap-1" style={{ minWidth:64 }}>
                    <motion.div
                        animate={{
                            background: i < current ? "#1C352D" : i === current ? "#5A7863" : "#e8f0e0",
                            scale: i === current ? 1.15 : 1,
                        }}
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs"
                        style={{ borderColor: i <= current ? "#5A7863" : "#d4e4cc",
                            color: i <= current ? "#EBF4DD" : "#90AB8B" }}>
                        {i < current ? <Check size={13} /> : i + 1}
                    </motion.div>
                    <span className="text-[9px] font-semibold whitespace-nowrap hidden sm:block"
                          style={{ color: i <= current ? "#1C352D" : "#90AB8B" }}>{s.label}</span>
                </motion.div>
                {i < STEPS.length - 1 && (
                    <motion.div className="h-0.5 w-8 mb-4 -mx-1"
                                animate={{ background: i < current ? "#5A7863" : "#e8f0e0" }} />
                )}
            </div>
        ))}
    </div>
)

/* ─── AUTH PANEL (Login + Signup combined) ──────────────────────────────── */
const AuthPanel = ({ mode, onSwitchMode }) => {
    const navigate = useNavigate()
    // Login state
    const [email,    setEmail]    = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading,  setLoading]  = useState(false)
    const [error,    setError]    = useState("")

    // Signup state
    const [step,  setStep]  = useState(0)
    const [role,  setRole]  = useState(null)
    const [form,  setForm]  = useState({
        name:"", email:"", password:"", org:"", phone:"", city:"",
        skills:[], days:[],
    })
    const set = k => e => setForm(p => ({...p, [k]: e.target.value}))
    const toggleSkill = s => setForm(p => ({
        ...p, skills: p.skills.includes(s) ? p.skills.filter(x=>x!==s) : [...p.skills,s]
    }))
    const toggleDay = d => setForm(p => ({
        ...p, days: p.days.includes(d) ? p.days.filter(x=>x!==d) : [...p.days,d]
    }))

    const handleLogin = () => {
        if (!email || !password) { setError("Please fill in all fields"); return }
        setLoading(true); setError("")
        // Simulate login — in real app check user role from API response
        // Defaulting to NGO dashboard; swap logic with actual auth
        setTimeout(() => {
            setLoading(false)
            navigate("/dashboard")
        }, 1600)
    }

    const handleSignupNext = () => {
        if (step === 0 && !role) return
        if (step < STEPS.length - 1) { setStep(s => s+1); return }
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            // Role-based redirect after successful signup
            if (role === "ngo") navigate("/dashboard")
            else navigate("/volunteer-home")
        }, 1800)
    }

    return (
        <motion.div
            initial={{ opacity:0, y:20, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:20, scale:0.97 }}
            transition={{ duration:0.4, ease:"easeOut" }}
            className="rounded-3xl overflow-hidden w-full max-w-[460px] mx-auto"
            style={{
                background:"rgba(255,255,255,0.97)",
                border:"1.5px solid rgba(90,120,99,0.2)",
                boxShadow:"0 32px 100px rgba(28,53,45,0.18)",
                backdropFilter:"blur(20px)",
            }}>

            {/* Tab switcher */}
            <div className="flex" style={{ borderBottom:"1.5px solid #e8f0e0" }}>
                {["login","signup"].map(m => (
                    <button key={m}
                            onClick={() => { onSwitchMode(m); setStep(0); setError("") }}
                            className="flex-1 py-4 text-sm font-black capitalize transition-all"
                            style={{
                                background: mode === m ? "#fff" : "#f8faf6",
                                color: mode === m ? "#1C352D" : "#90AB8B",
                                borderBottom: mode === m ? "2.5px solid #5A7863" : "none",
                            }}>
                        {m === "login" ? "Sign In" : "Create Account"}
                    </button>
                ))}
            </div>

            <div className="p-7">
                <AnimatePresence mode="wait">
                    {mode === "login" ? (
                        <motion.div key="login"
                                    initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                                    exit={{ opacity:0, x:20 }} transition={{ duration:0.25 }}>

                            <div className="mb-6">
                                <h2 className="font-black text-2xl" style={{ color:"#1C352D" }}>Welcome back</h2>
                                <p className="text-sm mt-1" style={{ color:"#90AB8B" }}>
                                    Sign in to manage your community needs
                                </p>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                                            className="rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2"
                                            style={{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" }}>
                                    <AlertCircle size={14} /> {error}
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <Input label="Email address" type="email" placeholder="you@organization.org"
                                       value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={15} />} />

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold" style={{ color:"#3B4953" }}>Password</label>
                                        <button className="text-xs font-semibold" style={{ color:"#5A7863" }}>Forgot?</button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"#90AB8B" }}>
                                            <Lock size={15} />
                                        </div>
                                        <input type={showPass ? "text" : "password"} value={password}
                                               onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                               className="w-full rounded-xl px-4 py-3 pl-10 pr-10 text-sm outline-none transition-all"
                                               style={{ background:"#f8faf6", border:"1.5px solid #d4e4cc", color:"#1C352D" }}
                                               onFocus={e => e.target.style.borderColor="#5A7863"}
                                               onBlur={e => e.target.style.borderColor="#d4e4cc"} />
                                        <button type="button" onClick={() => setShowPass(p=>!p)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:"#90AB8B" }}>
                                            {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                                        </button>
                                    </div>
                                </div>

                                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                               onClick={handleLogin} disabled={loading}
                                               className="w-full rounded-2xl py-3.5 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60"
                                               style={{ background:"#1C352D", color:"#EBF4DD", boxShadow:"0 4px 20px rgba(28,53,45,0.3)" }}>
                                    {loading
                                        ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                        : <>Sign in <ArrowRight size={15}/></>}
                                </motion.button>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px" style={{ background:"#e8f0e0" }} />
                                    <span className="text-xs" style={{ color:"#90AB8B" }}>or</span>
                                    <div className="flex-1 h-px" style={{ background:"#e8f0e0" }} />
                                </div>

                                <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                                               className="w-full rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                               style={{ background:"#fff", border:"1.5px solid #d4e4cc", color:"#3B4953" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Continue with Google
                                </motion.button>
                            </div>

                            <p className="text-center text-sm mt-5" style={{ color:"#90AB8B" }}>
                                New?{" "}
                                <button className="font-black" style={{ color:"#1C352D" }}
                                        onClick={() => onSwitchMode("signup")}>
                                    Create account →
                                </button>
                            </p>
                        </motion.div>

                    ) : (
                        <motion.div key="signup"
                                    initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                                    exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }}>

                            <div className="mb-5">
                                <h2 className="font-black text-2xl" style={{ color:"#1C352D" }}>Join CivicPulse</h2>
                                <p className="text-sm mt-1" style={{ color:"#90AB8B" }}>
                                    {STEPS[step].desc}
                                </p>
                            </div>

                            <StepBar current={step} />

                            <AnimatePresence mode="wait">
                                <motion.div key={step}
                                            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
                                            exit={{ opacity:0, x:-30 }} transition={{ duration:0.2 }}>

                                    {/* Step 0: Role */}
                                    {step === 0 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { key:"ngo", icon:<Building2 size={22}/>, title:"NGO Coordinator",
                                                    desc:"Manage needs, assign volunteers & track impact." },
                                                { key:"volunteer", icon:<User size={22}/>, title:"Volunteer",
                                                    desc:"Get matched to tasks that fit your skills & schedule." },
                                            ].map(r => (
                                                <motion.button key={r.key} whileTap={{ scale:0.97 }}
                                                               onClick={() => setRole(r.key)}
                                                               className="text-left rounded-2xl p-4 border-2 transition-all"
                                                               style={{
                                                                   background: role===r.key ? "#EBF4DD" : "#f8faf6",
                                                                   borderColor: role===r.key ? "#5A7863" : "#d4e4cc",
                                                                   boxShadow: role===r.key ? "0 6px 24px rgba(90,120,99,0.2)" : "none",
                                                               }}>
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                                         style={{ background: role===r.key ? "#5A7863" : "#e8f0e0",
                                                             color: role===r.key ? "#EBF4DD" : "#5A7863" }}>
                                                        {r.icon}
                                                    </div>
                                                    <p className="font-black text-sm mb-1" style={{ color:"#1C352D" }}>{r.title}</p>
                                                    <p className="text-xs leading-relaxed" style={{ color:"#5A7863" }}>{r.desc}</p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Step 1: Details */}
                                    {step === 1 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <Input label={role==="ngo" ? "Organization name" : "Full name"}
                                                       placeholder={role==="ngo" ? "Green Future NGO" : "Alex Johnson"}
                                                       value={form.name} onChange={set("name")}
                                                       icon={role==="ngo" ? <Building2 size={14}/> : <User size={14}/>} />
                                            </div>
                                            <div className="col-span-2">
                                                <Input label="Email" type="email" placeholder="you@org.org"
                                                       value={form.email} onChange={set("email")} icon={<Mail size={14}/>} />
                                            </div>
                                            <Input label="Password" type="password" placeholder="••••••••"
                                                   value={form.password} onChange={set("password")} icon={<Lock size={14}/>} />
                                            <Input label="City" placeholder="Mumbai"
                                                   value={form.city} onChange={set("city")} icon={<MapPin size={14}/>} />
                                        </div>
                                    )}

                                    {/* Step 2: Skills */}
                                    {step === 2 && (
                                        <div>
                                            <p className="text-xs font-bold mb-2" style={{ color:"#1C352D" }}>Skills</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {SKILLS_LIST.map(s => (
                                                    <motion.button key={s} whileTap={{ scale:0.93 }}
                                                                   onClick={() => toggleSkill(s)}
                                                                   className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
                                                                   style={{
                                                                       background: form.skills.includes(s) ? "#1C352D" : "#f8faf6",
                                                                       borderColor: form.skills.includes(s) ? "#1C352D" : "#d4e4cc",
                                                                       color: form.skills.includes(s) ? "#EBF4DD" : "#5A7863",
                                                                   }}>{s}</motion.button>
                                                ))}
                                            </div>
                                            <p className="text-xs font-bold mb-2" style={{ color:"#1C352D" }}>Available days</p>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {DAYS.map(d => (
                                                    <motion.button key={d} whileTap={{ scale:0.93 }}
                                                                   onClick={() => toggleDay(d)}
                                                                   className="w-12 py-2 rounded-xl text-xs font-bold border-2 transition-all"
                                                                   style={{
                                                                       background: form.days.includes(d) ? "#5A7863" : "#f8faf6",
                                                                       borderColor: form.days.includes(d) ? "#5A7863" : "#d4e4cc",
                                                                       color: form.days.includes(d) ? "#EBF4DD" : "#90AB8B",
                                                                   }}>{d}</motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Confirm */}
                                    {step === 3 && (
                                        <div className="text-center">
                                            <motion.div
                                                initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
                                                transition={{ type:"spring", stiffness:200, damping:15 }}
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                                style={{ background:"#1C352D" }}>
                                                <Check size={26} color="#EBF4DD" />
                                            </motion.div>
                                            <h3 className="font-black text-lg mb-1" style={{ color:"#1C352D" }}>You're all set!</h3>
                                            <div className="rounded-2xl p-4 text-left mt-4 space-y-2"
                                                 style={{ background:"#f8faf6", border:"1.5px solid #e8f0e0" }}>
                                                {[
                                                    ["Role", role==="ngo" ? "NGO Coordinator" : "Volunteer"],
                                                    ["Name", form.name||"—"],
                                                    ["Email", form.email||"—"],
                                                    ["Skills", form.skills.length ? form.skills.slice(0,3).join(", ")+"…" : "—"],
                                                ].map(([k,v]) => (
                                                    <div key={k} className="flex justify-between text-xs">
                                                        <span className="font-semibold" style={{ color:"#90AB8B" }}>{k}</span>
                                                        <span className="font-bold" style={{ color:"#1C352D" }}>{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Nav buttons */}
                            <div className="flex gap-2 mt-5">
                                {step > 0 && (
                                    <button onClick={() => setStep(s=>s-1)}
                                            className="px-4 py-2.5 rounded-xl text-sm font-black border"
                                            style={{ borderColor:"#d4e4cc", color:"#3B4953" }}>
                                        Back
                                    </button>
                                )}
                                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                               onClick={handleSignupNext}
                                               disabled={(step===0 && !role) || loading}
                                               className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40"
                                               style={{ background:"#1C352D", color:"#EBF4DD" }}>
                                    {loading
                                        ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                        : step === STEPS.length-1
                                            ? <><Check size={14}/> Create account</>
                                            : <>Continue <ArrowRight size={14}/></>}
                                </motion.button>
                            </div>

                            <p className="text-center text-xs mt-4" style={{ color:"#90AB8B" }}>
                                Already have an account?{" "}
                                <button className="font-black" style={{ color:"#1C352D" }}
                                        onClick={() => onSwitchMode("login")}>
                                    Sign in →
                                </button>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

/* ─── ANIMATED GRAPH (Hero decoration) ─────────────────────────────────── */
const NODES = [
    { x:18, y:22, label:"Field Report" }, { x:50, y:15, label:"AI Scoring" },
    { x:82, y:28, label:"Heatmap"      }, { x:25, y:58, label:"Volunteer"  },
    { x:58, y:52, label:"Match"        }, { x:80, y:65, label:"Task Done"  },
    { x:40, y:80, label:"Impact"       },
]
const EDGES = [[0,1],[1,2],[1,4],[3,4],[4,5],[4,6],[2,5]]

const AnimatedGraph = () => {
    const [active, setActive] = useState(0)
    useEffect(() => {
        const t = setInterval(() => setActive(p => (p+1)%NODES.length), 1300)
        return () => clearInterval(t)
    }, [])
    return (
        <div className="relative w-full h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {EDGES.map(([a,b],i) => (
                    <motion.line key={i}
                                 x1={`${NODES[a].x}%`} y1={`${NODES[a].y}%`}
                                 x2={`${NODES[b].x}%`} y2={`${NODES[b].y}%`}
                                 stroke="#5A7863" strokeWidth="0.4" strokeOpacity="0.5" strokeDasharray="2 2"
                                 initial={{ pathLength:0 }} animate={{ pathLength:1 }}
                                 transition={{ delay:i*0.2, duration:1 }} />
                ))}
                {NODES.map((node,i) => (
                    <g key={i}>
                        <motion.circle cx={`${node.x}%`} cy={`${node.y}%`} r="1.8"
                                       fill={i===active ? "#90AB8B" : "#3B4953"}
                                       stroke={i===active ? "#EBF4DD" : "#5A7863"} strokeWidth="0.5"
                                       animate={{ r: i===active ? 2.8 : 1.8, opacity: i===active ? 1 : 0.6 }}
                                       transition={{ duration:0.4 }} />
                        {i===active && (
                            <motion.circle cx={`${node.x}%`} cy={`${node.y}%`}
                                           r="4" fill="none" stroke="#90AB8B" strokeWidth="0.3"
                                           initial={{ r:2, opacity:1 }} animate={{ r:7, opacity:0 }}
                                           transition={{ duration:1, repeat:Infinity }} />
                        )}
                    </g>
                ))}
            </svg>
            {NODES.map((node,i) => (
                <motion.div key={i} className="absolute text-[8px] font-semibold pointer-events-none"
                            style={{ left:`${node.x}%`, top:`${node.y}%`, transform:"translate(-50%,-220%)" }}
                            animate={{ opacity: i===active ? 1 : 0.3 }} transition={{ duration:0.3 }}>
          <span className={`px-1.5 py-0.5 rounded-md whitespace-nowrap ${
              i===active ? "bg-moss-500 text-sage-50" : "bg-white/10 text-moss-300"}`}
                style={{
                    background: i===active ? "#5A7863" : "rgba(255,255,255,0.1)",
                    color: i===active ? "#EBF4DD" : "#90AB8B"
                }}>
            {node.label}
          </span>
                </motion.div>
            ))}
        </div>
    )
}

/* ─── HERO SECTION ───────────────────────────────────────────────────────── */
const HeroSection = ({ onAuthClick }) => {
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 500], [0, -80])

    return (
        <section id="home" className="min-h-screen relative flex overflow-hidden" style={{ background:"#f0f4ec" }}>
            <BgParticles />

            {/* Left: Dark panel */}
            <motion.div
                className="hidden lg:flex w-[52%] flex-col relative overflow-hidden"
                style={{ y, background:"#1C352D" }}>

                {/* Orbs */}
                <div className="absolute w-96 h-96 rounded-full pointer-events-none"
                     style={{ background:"radial-gradient(circle, #5A7863 0%, transparent 70%)",
                         opacity:0.2, top:"-100px", left:"-80px", filter:"blur(60px)" }} />
                <div className="absolute w-72 h-72 rounded-full pointer-events-none"
                     style={{ background:"radial-gradient(circle, #90AB8B 0%, transparent 70%)",
                         opacity:0.15, bottom:"0", right:"-60px", filter:"blur(60px)" }} />

                <div className="relative z-10 flex flex-col h-full p-12 gap-8 pt-28">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ boxShadow:["0 0 0px #5A786300","0 0 24px #5A786366","0 0 0px #5A786300"] }}
                            transition={{ duration:3, repeat:Infinity }}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{ background:"#5f887f" }}>
                            <Zap size={20} color="#EBF4DD" />
                        </motion.div>
                        <div>
                            <span className="font-black text-xl" style={{ color:"#EBF4DD" }}>CivicPulse</span>
                            <p className="text-[10px] font-medium tracking-widest uppercase mt-0.5" style={{ color:"#90AB8B" }}>
                                by CivicPlus
                            </p>
                        </div>
                    </div>

                    {/* Graph */}
                    <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                                transition={{ delay:0.3, duration:0.7 }}
                                className="rounded-3xl border p-4"
                                style={{ background:"rgb(236 243 237)", borderColor:"rgb(220 230 222)" }}>
                        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color:"#0b3511" }}>
                            Live coordination network
                        </p>
                        <AnimatedGraph />
                    </motion.div>

                    {/* Hero text */}
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                                transition={{ delay:0.4 }}>
                        <h2 className="font-black text-3xl leading-tight mb-3" style={{ color:"#EBF4DD" }}>
                            Turning scattered data<br />into community action
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color:"#90AB8B" }}>
                            The only platform that closes the full loop — from paper survey to volunteer deployed to donor notified.
                        </p>
                    </motion.div>

                    {/* Feature pills */}
                    <div className="flex flex-col gap-2 mt-auto">
                        {[
                            { icon:"⚡", t:"AI Urgency Scoring", d:"Every need scored in real-time", delay:0.5 },
                            { icon:"🎯", t:"Smart Volunteer Match", d:"6-factor algorithm, zero manual calls", delay:0.65 },
                            { icon:"📊", t:"Live Impact Dashboard", d:"Donors see their contribution in real-time", delay:0.8 },
                        ].map(f => (
                            <motion.div key={f.t}
                                        initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                                        transition={{ delay:f.delay }}
                                        className="flex items-center gap-3 rounded-xl p-3 border"
                                        style={{ background:"rgba(255,255,255,0.06)", borderColor:"rgba(255,255,255,0.1)" }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                                     style={{ background:"rgba(90,120,99,0.3)" }}>{f.icon}</div>
                                <div>
                                    <p className="text-white text-xs font-bold">{f.t}</p>
                                    <p className="text-xs mt-0.5" style={{ color:"#90AB8B" }}>{f.d}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right: Auth + CTA */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10 pt-24">
                <div className="absolute inset-0 pointer-events-none"
                     style={{ backgroundImage:`radial-gradient(circle, #5A786315 1px, transparent 1px)`, backgroundSize:"28px 28px" }} />

                <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
                            transition={{ duration:0.7 }}
                            className="w-full max-w-[460px] relative z-10">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"#1C352D" }}>
                            <Zap size={16} color="#EBF4DD" />
                        </div>
                        <span className="font-black text-xl" style={{ color:"#1C352D" }}>CivicPulse</span>
                    </div>

                    {/* Badge */}
                    <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                                transition={{ delay:0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4"
                                style={{ background:"#EBF4DD", color:"#3B4953" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#5A7863" }} />
                        Community Platform · India
                    </motion.div>

                    <h1 className="font-black text-4xl lg:text-5xl leading-tight mb-3" style={{ color:"#1C352D" }}>
                        Make real<br />community impact
                    </h1>
                    <p className="text-sm mb-8 leading-relaxed" style={{ color:"#5A7863" }}>
                        Join 2,400+ volunteers and 180+ NGOs already using CivicPulse to coordinate relief, track needs, and close the loop.
                    </p>

                    {/* Auth buttons → show panel below */}
                    <div className="flex gap-3 mb-8">
                        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                       onClick={() => onAuthClick("login")}
                                       className="flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                                       style={{ background:"#1C352D", color:"#EBF4DD", boxShadow:"0 4px 20px rgba(28,53,45,0.3)" }}>
                            Sign In <ArrowRight size={14} />
                        </motion.button>
                        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                       onClick={() => onAuthClick("signup")}
                                       className="flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                                       style={{ background:"rgba(90,120,99,0.15)", color:"#1C352D", border:"1.5px solid #d4e4cc" }}>
                            Join Free <Zap size={14} />
                        </motion.button>
                    </div>

                    {/* Stats mini row */}
                    <div className="grid grid-cols-2 gap-3">
                        {STATS.map((s, i) => (
                            <motion.div key={s.label}
                                        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                                        transition={{ delay:0.5 + i*0.1 }}
                                        className="rounded-2xl p-4 flex items-center gap-3"
                                        style={{ background:"rgba(255,255,255,0.85)", border:"1.5px solid rgba(90,120,99,0.15)" }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                     style={{ background:"#EBF4DD", color:"#5A7863" }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <p className="font-black text-base" style={{ color:"#1C352D" }}>{s.value}</p>
                                    <p className="text-[10px] font-semibold" style={{ color:"#90AB8B" }}>{s.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ─── AUTH MODAL (overlay) ───────────────────────────────────────────────── */
const AuthModal = ({ mode, onClose, onSwitch }) => (
    <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background:"rgba(28,53,45,0.6)", backdropFilter:"blur(8px)" }}
        onClick={onClose}>
        <div onClick={e => e.stopPropagation()} className="w-full max-w-[460px]">
            <button onClick={onClose}
                    className="ml-auto mb-4 flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color:"#EBF4DD" }}>
                <X size={16} /> Close
            </button>
            <AuthPanel mode={mode} onSwitchMode={onSwitch} />
        </div>
    </motion.div>
)

/* ─── ABOUT SECTION ─────────────────────────────────────────────────────── */
const AboutSection = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({ target:ref, offset:["start end","end start"] })
    const y = useTransform(scrollYProgress, [0,1], [40, -40])

    return (
        <section id="about" ref={ref}
                 className="py-32 relative overflow-hidden"
                 style={{ background:"#1C352D" }}>

            <div className="absolute inset-0 pointer-events-none"
                 style={{ backgroundImage:`radial-gradient(circle, rgba(90,120,99,0.15) 1px, transparent 1px)`, backgroundSize:"32px 32px" }} />
            <motion.div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
                        style={{ background:"radial-gradient(circle, #5A7863 0%, transparent 70%)",
                            opacity:0.08, filter:"blur(80px)", top:"-200px", right:"-200px", y }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} transition={{ duration:0.6 }}
                            className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                         style={{ background:"rgba(90,120,99,0.2)", color:"#90AB8B", border:"1px solid rgba(90,120,99,0.3)" }}>
                        <Zap size={11} /> What is CivicPulse
                    </div>
                    <h2 className="font-black text-4xl lg:text-5xl leading-tight mb-6" style={{ color:"#EBF4DD" }}>
                        One platform.<br />Entire relief loop closed.
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color:"#90AB8B" }}>
                        CivicPulse is an AI-powered coordination engine that connects community needs, NGO coordinators, volunteers, and donors on a single transparent platform — so no need goes unmet.
                    </p>
                </motion.div>

                {/* Feature grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((f, i) => (
                        <motion.div key={f.title}
                                    initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                                    viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }}
                                    whileHover={{ y:-4, transition:{ duration:0.2 } }}
                                    className="rounded-2xl p-6 group cursor-default"
                                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                                        transition:"background 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}
                                    onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                 style={{ background:`${f.color}30`, color:f.color }}>
                                {f.icon}
                            </div>
                            <h3 className="font-black text-base mb-2" style={{ color:"#EBF4DD" }}>{f.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color:"#7A9B83" }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} transition={{ delay:0.4 }}
                            className="mt-16 rounded-3xl p-10 text-center"
                            style={{ background:"rgba(90,120,99,0.12)", border:"1px solid rgba(90,120,99,0.25)" }}>
                    <p className="font-black text-2xl mb-3" style={{ color:"#EBF4DD" }}>
                        Built for India's civic ecosystem
                    </p>
                    <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color:"#90AB8B" }}>
                        From coastal disaster response to urban slum nutrition drives — CivicPulse scales with every kind of community need.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {["NGO Coordinators","Field Volunteers","Donors & Funders","Government Bodies"].map(tag => (
                            <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-bold"
                                  style={{ background:"rgba(90,120,99,0.25)", color:"#90AB8B", border:"1px solid rgba(90,120,99,0.3)" }}>
                {tag}
              </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ─── NGO CARDS SECTION ─────────────────────────────────────────────────── */
const NGOSection = ({ onNgoRegister }) => {
    const [isPaused, setIsPaused] = useState(false)

    return (
        <section id="ngos" className="py-32 relative overflow-hidden" style={{ background:"#f0f4ec" }}>
            <BgParticles />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                         style={{ background:"#EBF4DD", color:"#5A7863", border:"1px solid #d4e4cc" }}>
                        <Building2 size={11} /> Registered NGOs
                    </div>
                    <h2 className="font-black text-4xl lg:text-5xl mb-4" style={{ color:"#1C352D" }}>
                        NGOs making change happen
                    </h2>
                    <p className="text-lg max-w-xl mx-auto" style={{ color:"#5A7863" }}>
                        Verified organisations across India, actively coordinating real-world impact through CivicPulse.
                    </p>
                </motion.div>

                {/* Scrollable card strip */}
                <div className="relative">
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                         style={{ background:"linear-gradient(to right, #f0f4ec, transparent)" }} />
                    <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                         style={{ background:"linear-gradient(to left, #f0f4ec, transparent)" }} />

                    <div className="overflow-x-auto pb-4 scroll-smooth"
                         style={{ scrollbarWidth:"none", msOverflowStyle:"none" }}
                         onMouseEnter={() => setIsPaused(true)}
                         onMouseLeave={() => setIsPaused(false)}>
                        <motion.div
                            className="flex gap-5"
                            style={{ width:"max-content" }}
                            animate={isPaused ? {} : { x:[0, -((NGOS.length/2)*340)] }}
                            transition={{ duration:30, repeat:Infinity, ease:"linear", repeatType:"loop" }}>
                            {/* Duplicate for infinite scroll */}
                            {[...NGOS, ...NGOS].map((ngo, i) => (
                                <motion.div key={i}
                                            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                                            viewport={{ once:true }} transition={{ delay:(i%NGOS.length)*0.08 }}
                                            whileHover={{ y:-6, transition:{ duration:0.2 } }}
                                            className="rounded-3xl p-6 shrink-0 cursor-pointer group"
                                            style={{
                                                width:320,
                                                background:"rgba(255,255,255,0.92)",
                                                border:"1.5px solid rgba(90,120,99,0.15)",
                                                boxShadow:"0 4px 24px rgba(28,53,45,0.06)",
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor="#5A7863"; e.currentTarget.style.boxShadow="0 12px 40px rgba(28,53,45,0.15)" }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(90,120,99,0.15)"; e.currentTarget.style.boxShadow="0 4px 24px rgba(28,53,45,0.06)" }}>

                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm"
                                                 style={{ background:"#1C352D", color:"#EBF4DD" }}>
                                                {ngo.avatar}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-sm leading-tight" style={{ color:"#1C352D" }}>
                                                    {ngo.name}
                                                </h3>
                                                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color:"#90AB8B" }}>
                                                    <MapPin size={10} /> {ngo.city}
                                                </p>
                                            </div>
                                        </div>
                                        {ngo.verified && (
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                                                 style={{ background:"#EBF4DD", color:"#3B5C38" }}>
                                                <Shield size={9} /> Verified
                                            </div>
                                        )}
                                    </div>

                                    {/* Badge + focus */}
                                    <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background:ngo.badgeColor, color:"#EBF4DD" }}>
                      {ngo.badge}
                    </span>
                                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                                              style={{ background:"#EBF4DD", color:"#5A7863" }}>
                      {ngo.focus}
                    </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs leading-relaxed mb-4" style={{ color:"#5A7863" }}>
                                        {ngo.desc}
                                    </p>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {[
                                            { label:"Volunteers", value:ngo.volunteers },
                                            { label:"Active Needs", value:ngo.needs },
                                            { label:"Rating", value:`${ngo.rating}★` },
                                        ].map(s => (
                                            <div key={s.label} className="rounded-xl p-2 text-center"
                                                 style={{ background:"#f8faf6", border:"1px solid #e8f0e0" }}>
                                                <p className="font-black text-sm" style={{ color:"#1C352D" }}>{s.value}</p>
                                                <p className="text-[9px] font-semibold" style={{ color:"#90AB8B" }}>{s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <motion.button whileTap={{ scale:0.97 }}
                                                   className="w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all group-hover:gap-2.5"
                                                   style={{ background:"#1C352D", color:"#EBF4DD" }}>
                                        View NGO <ChevronRight size={12} />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Register CTA */}
                <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} transition={{ delay:0.3 }}
                            className="mt-12 text-center">
                    <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                                   onClick={onNgoRegister}
                                   className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm"
                                   style={{ background:"#1C352D", color:"#EBF4DD", boxShadow:"0 8px 30px rgba(28,53,45,0.2)" }}>
                        <Building2 size={16} /> Register your NGO <ArrowRight size={14} />
                    </motion.button>
                    <p className="text-xs mt-3" style={{ color:"#90AB8B" }}>
                        Free to register · Verified within 48 hours · Instant access to volunteer pool
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

/* ─── CONTACT SECTION ───────────────────────────────────────────────────── */
const ContactSection = () => {
    const [formState, setFormState] = useState({ name:"", email:"", message:"" })
    const [sent, setSent] = useState(false)

    const handleSubmit = () => {
        if (!formState.name || !formState.email || !formState.message) return
        setSent(true)
    }

    return (
        <section id="contact" className="py-32 relative overflow-hidden"
                 style={{ background:"linear-gradient(180deg, #1C352D 0%, #142820 100%)" }}>

            <div className="absolute inset-0 pointer-events-none"
                 style={{ backgroundImage:`radial-gradient(circle, rgba(90,120,99,0.1) 1px, transparent 1px)`, backgroundSize:"30px 30px" }} />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                         style={{ background:"rgba(90,120,99,0.2)", color:"#90AB8B", border:"1px solid rgba(90,120,99,0.3)" }}>
                        <MessageSquare size={11} /> Get in touch
                    </div>
                    <h2 className="font-black text-4xl lg:text-5xl mb-4" style={{ color:"#EBF4DD" }}>
                        Let's build something<br />meaningful together
                    </h2>
                    <p className="text-lg max-w-xl mx-auto" style={{ color:"#90AB8B" }}>
                        Partner with us, register your NGO, or just say hello — we're always around.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Info cards */}
                    <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }}
                                viewport={{ once:true }} transition={{ duration:0.5 }}
                                className="lg:col-span-2 flex flex-col gap-5">
                        {[
                            { icon:<MapPin size={18}/>, label:"Location", value:"Pune, Maharashtra, India" },
                            { icon:<Mail size={18}/>, label:"Email", value:"hello@civicpulse.in" },
                            { icon:<Phone size={18}/>, label:"Phone", value:"+91 98765 00001" },
                            { icon:<Globe size={18}/>, label:"Website", value:"civicpulse.in" },
                            { icon:<Clock size={18}/>, label:"Response time", value:"Within 24 hours" },
                        ].map(info => (
                            <div key={info.label} className="flex items-center gap-4 rounded-2xl p-4"
                                 style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                     style={{ background:"rgba(90,120,99,0.25)", color:"#90AB8B" }}>
                                    {info.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color:"#5A7863" }}>
                                        {info.label}
                                    </p>
                                    <p className="text-sm font-semibold mt-0.5" style={{ color:"#EBF4DD" }}>{info.value}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Contact form */}
                    <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }}
                                viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
                                className="lg:col-span-3 rounded-3xl p-8"
                                style={{ background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.1)" }}>

                        <AnimatePresence mode="wait">
                            {sent ? (
                                <motion.div key="sent"
                                            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                                            className="flex flex-col items-center justify-center h-64 text-center">
                                    <motion.div
                                        initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
                                        transition={{ type:"spring", stiffness:200, damping:15 }}
                                        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                                        style={{ background:"#5A7863" }}>
                                        <Check size={28} color="#EBF4DD" />
                                    </motion.div>
                                    <h3 className="font-black text-xl mb-2" style={{ color:"#EBF4DD" }}>Message sent!</h3>
                                    <p className="text-sm" style={{ color:"#90AB8B" }}>We'll get back to you within 24 hours.</p>
                                    <button onClick={() => { setSent(false); setFormState({name:"",email:"",message:""}) }}
                                            className="mt-5 text-xs font-bold" style={{ color:"#5A7863" }}>
                                        Send another →
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div key="form" className="space-y-5">
                                    <h3 className="font-black text-xl mb-1" style={{ color:"#EBF4DD" }}>Send us a message</h3>
                                    <p className="text-sm mb-2" style={{ color:"#90AB8B" }}>
                                        NGO registration, partnership, or general inquiry
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold" style={{ color:"#90AB8B" }}>Name</label>
                                            <input value={formState.name}
                                                   onChange={e => setFormState(p=>({...p, name:e.target.value}))}
                                                   placeholder="Your name"
                                                   className="rounded-xl px-4 py-3 text-sm outline-none"
                                                   style={{ background:"rgba(255,255,255,0.08)", border:"1.5px solid rgba(255,255,255,0.12)",
                                                       color:"#EBF4DD" }}
                                                   onFocus={e => e.target.style.borderColor="#5A7863"}
                                                   onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.12)"} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold" style={{ color:"#90AB8B" }}>Email</label>
                                            <input value={formState.email} type="email"
                                                   onChange={e => setFormState(p=>({...p, email:e.target.value}))}
                                                   placeholder="you@email.com"
                                                   className="rounded-xl px-4 py-3 text-sm outline-none"
                                                   style={{ background:"rgba(255,255,255,0.08)", border:"1.5px solid rgba(255,255,255,0.12)",
                                                       color:"#EBF4DD" }}
                                                   onFocus={e => e.target.style.borderColor="#5A7863"}
                                                   onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.12)"} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold" style={{ color:"#90AB8B" }}>Subject</label>
                                        <select className="rounded-xl px-4 py-3 text-sm outline-none"
                                                style={{ background:"rgba(255,255,255,0.08)", border:"1.5px solid rgba(255,255,255,0.12)",
                                                    color:"#EBF4DD" }}>
                                            <option value="" style={{ background:"#1C352D" }}>Choose a topic</option>
                                            <option value="ngo" style={{ background:"#1C352D" }}>NGO Registration</option>
                                            <option value="volunteer" style={{ background:"#1C352D" }}>Volunteer Inquiry</option>
                                            <option value="partnership" style={{ background:"#1C352D" }}>Partnership</option>
                                            <option value="other" style={{ background:"#1C352D" }}>Other</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold" style={{ color:"#90AB8B" }}>Message</label>
                                        <textarea rows={4} value={formState.message}
                                                  onChange={e => setFormState(p=>({...p, message:e.target.value}))}
                                                  placeholder="Tell us about your project, NGO, or inquiry..."
                                                  className="rounded-xl px-4 py-3 text-sm outline-none resize-none"
                                                  style={{ background:"rgba(255,255,255,0.08)", border:"1.5px solid rgba(255,255,255,0.12)",
                                                      color:"#EBF4DD" }}
                                                  onFocus={e => e.target.style.borderColor="#5A7863"}
                                                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.12)"} />
                                    </div>

                                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                                   onClick={handleSubmit}
                                                   className="w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                                                   style={{ background:"#5A7863", color:"#EBF4DD" }}>
                                        <Send size={14} /> Send Message
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */
const Footer = () => (
    <footer style={{ background:"#0D1F19" }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                {/* Brand */}
                <div className="col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"#5A7863" }}>
                            <Zap size={16} color="#EBF4DD" />
                        </div>
                        <div>
                            <span className="font-black text-lg" style={{ color:"#EBF4DD" }}>CivicPulse</span>
                            <p className="text-[9px] tracking-widest uppercase font-semibold leading-none" style={{ color:"#5A7863" }}>by CivicPlus</p>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed mb-5" style={{ color:"#5A7863" }}>
                        AI-powered community coordination. Turning scattered civic data into real action — across India and beyond.
                    </p>
                    <div className="flex gap-3">
                        {[
                            { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, href:"#" },
                            { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, href:"#" },
                            { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>, href:"#" },
                        ].map((s, i) => (
                            <motion.a key={i} href={s.href} whileHover={{ scale:1.1, y:-2 }}
                                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                      style={{ background:"rgba(90,120,99,0.2)", color:"#90AB8B", border:"1px solid rgba(90,120,99,0.2)" }}
                                      onMouseEnter={e => e.currentTarget.style.background="rgba(90,120,99,0.35)"}
                                      onMouseLeave={e => e.currentTarget.style.background="rgba(90,120,99,0.2)"}>
                                {s.icon}
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Links */}
                {[
                    {
                        title:"Platform",
                        links:["How it works","NGO Dashboard","Volunteer App","Donor Portal","AI Features"]
                    },
                    {
                        title:"Company",
                        links:["About Us","Blog","Press","Careers","Partners"]
                    },
                    {
                        title:"Legal",
                        links:["Privacy Policy","Terms of Service","Cookie Policy","Data Protection"]
                    },
                ].map(col => (
                    <div key={col.title}>
                        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color:"#EBF4DD" }}>
                            {col.title}
                        </p>
                        <ul className="space-y-2.5">
                            {col.links.map(l => (
                                <li key={l}>
                                    <a href="#"
                                       className="text-sm transition-colors"
                                       style={{ color:"#5A7863" }}
                                       onMouseEnter={e => e.currentTarget.style.color="#90AB8B"}
                                       onMouseLeave={e => e.currentTarget.style.color="#5A7863"}>
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Bottom bar */}
            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
                 style={{ borderTop:"1px solid rgba(90,120,99,0.2)" }}>
                <p className="text-xs" style={{ color:"#3B5C38" }}>
                    © 2025 CivicPulse by CivicPlus. Built for India's communities.
                </p>
                <div className="flex items-center gap-6">
                    {["Privacy","Terms","Cookies"].map(l => (
                        <a key={l} href="#" className="text-xs transition-colors"
                           style={{ color:"#3B5C38" }}
                           onMouseEnter={e => e.currentTarget.style.color="#5A7863"}
                           onMouseLeave={e => e.currentTarget.style.color="#3B5C38"}>
                            {l}
                        </a>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#5A7863" }} />
                    <span className="text-xs" style={{ color:"#3B5C38" }}>All systems operational</span>
                </div>
            </div>
        </div>
    </footer>
)

/* ─── SCROLL-TO-TOP ─────────────────────────────────────────────────────── */
const ScrollTop = () => {
    const { scrollYProgress } = useScroll()
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const unsub = scrollYProgress.on("change", v => setVisible(v > 0.2))
        return unsub
    }, [scrollYProgress])

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                    exit={{ opacity:0, scale:0.8 }}
                    onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
                    className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background:"#1C352D", color:"#EBF4DD", boxShadow:"0 8px 24px rgba(28,53,45,0.3)" }}
                    whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 15l-6-6-6 6"/>
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    )
}

/* ─── ROOT COMPONENT ─────────────────────────────────────────────────────── */
const LandingPage = () => {
    const [authMode,  setAuthMode]  = useState(null) // null | "login" | "signup"
    const [ngoModal,  setNgoModal]  = useState(false)
    const location = useLocation()

    // Auto-open modal when redirected from /login or /signup
    useEffect(() => {
        const state = location.state
        if (state?.openAuth) {
            setAuthMode(state.openAuth)
            window.history.replaceState({}, "")
        }
    }, [location.state])

    const handleAuthClick  = (mode) => setAuthMode(mode)
    const handleClose      = () => setAuthMode(null)
    const handleSwitch     = (mode) => setAuthMode(mode)
    const handleNgoOpen    = () => setNgoModal(true)
    const handleNgoClose   = () => setNgoModal(false)

    return (
        <div className="font-sans">
            <Navbar onAuthClick={handleAuthClick} authMode={authMode} onNgoRegister={handleNgoOpen} />

            {/* Auth Modal */}
            <AnimatePresence>
                {authMode && (
                    <AuthModal mode={authMode} onClose={handleClose} onSwitch={handleSwitch} />
                )}
            </AnimatePresence>

            {/* NGO Registration Modal */}
            <AnimatePresence>
                {ngoModal && <NgoRegisterModal onClose={handleNgoClose} />}
            </AnimatePresence>

            <HeroSection onAuthClick={handleAuthClick} onNgoRegister={handleNgoOpen} />
            <AboutSection />
            <NGOSection onNgoRegister={handleNgoOpen} />
            <ContactSection />
            <Footer />
            <ScrollTop />
        </div>
    )
}

export default LandingPage