import { useState, useEffect, useRef, createContext, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion as Motion, AnimatePresence, useTransform, useScroll } from "framer-motion"
import {
    Zap, Menu, X, ArrowRight, Mail, Lock, Eye, EyeOff,
    User, Building2, Check, MapPin, Phone, Globe,
    ChevronRight, Shield, BarChart3, Users, Heart,
    MessageSquare, Send,
    TrendingUp, Clock,
    Sparkles, Target, Activity
} from "lucide-react"

/* ─── THEME CONTEXT ─────────────────────────────────────────────────────── */
const ThemeContext = createContext({ dark: false, toggle: () => {} })
const useTheme = () => useContext(ThemeContext)

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */
const NAV_LINKS = [
    { label: "Home",    href: "#home"    },
    { label: "About",   href: "#about"   },
    { label: "NGOs",    href: "#ngos"    },
    { label: "Contact", href: "#contact" },
]

const STATS = [
    { value: "2,400+",  label: "Active Volunteers", icon: <Users size={18} />,    tooltip: "Maharashtra: 620+\nKarnataka: 480+\nDelhi NCR: 390+\nTamil Nadu: 310+\n+600 across India", growth: "+18% this month" },
    { value: "180+",    label: "NGOs Registered",   icon: <Building2 size={18} />, tooltip: "Environmental: 42\nEducation: 38\nHealth: 31\nSkill Dev: 29\n+40 more focus areas", growth: "+12 new this month" },
    { value: "94%",     label: "Match Accuracy",     icon: <Target size={18} />,    tooltip: "Skill match: 97%\nProximity: 91%\nAvailability: 93%\nHistory score: 95%", growth: "Up from 89% last year" },
    { value: "12,000+", label: "Needs Addressed",    icon: <Heart size={18} />,     tooltip: "Medical: 3,200+\nFood & Nutrition: 2,800+\nEducation: 2,100+\nDisaster: 1,900+\n+2,000 others", growth: "+1,400 this quarter" },
]

const FEATURES = [
    { icon: <Sparkles size={22} />,  title: "AI-Powered Urgency Scoring",  desc: "Every field report is scored in real-time using Gemini AI — so coordinators always know what needs attention first.", color: "#5A7863" },
    { icon: <Users size={22} />,     title: "Smart Volunteer Matching",     desc: "A 6-factor algorithm matches volunteers by skill, proximity, availability, and past history. Zero manual calls.", color: "#3B7D6E" },
    { icon: <BarChart3 size={22} />, title: "Live Impact Dashboard",        desc: "Donors see exactly where their contributions go — in real-time. Transparent, powerful, trust-building.", color: "#4A6741" },
    { icon: <Activity size={22} />,  title: "Geo Heatmaps",                 desc: "Visual hotspots of community need overlaid on live maps. Identify underserved zones at a glance.", color: "#2D5E4E" },
    { icon: <Shield size={22} />,    title: "Verified NGO Network",          desc: "All NGOs go through a structured verification process. Every volunteer knows they're contributing to legitimate causes.", color: "#5A7863" },
    { icon: <TrendingUp size={22} />, title: "Closed-Loop Tracking",        desc: "From survey submission to volunteer deployed to donor notified — the full loop closes in one platform.", color: "#3B5C38" },
]

const NGOS = [
    { name: "Green Horizon Foundation", city: "Mumbai, Maharashtra",    focus: "Environment & Climate",  volunteers: 248, needs: 34, rating: 4.9, verified: true, badge: "Top Rated",    badgeColor: "#5A7863", desc: "Urban reforestation, plastic-free drives, and climate resilience across coastal Maharashtra.", avatar: "GH", since: "2019", colorCard: "90,120,99"  },
    { name: "Asha Jyoti Trust",          city: "Delhi NCR",              focus: "Education & Literacy",   volunteers: 315, needs: 51, rating: 4.8, verified: true, badge: "Most Active",  badgeColor: "#3B7D6E", desc: "Bridging education gaps in slum communities through peer-tutoring and digital literacy.", avatar: "AJ", since: "2016", colorCard: "59,125,110" },
    { name: "Prayas Welfare Society",    city: "Pune, Maharashtra",      focus: "Health & Nutrition",     volunteers: 190, needs: 28, rating: 4.7, verified: true, badge: "New",           badgeColor: "#6B8F71", desc: "Mobile health clinics and nutrition camps reaching 12 rural talukas every month.", avatar: "PW", since: "2021", colorCard: "74,103,65"  },
    { name: "Udaan Skill Center",        city: "Bengaluru, Karnataka",   focus: "Skill Development",      volunteers: 167, needs: 19, rating: 4.8, verified: true, badge: "High Impact",  badgeColor: "#4A6741", desc: "Vocational training for marginalised youth — from coding bootcamps to carpentry.", avatar: "US", since: "2020", colorCard: "45,94,78"   },
    { name: "Sevalaya Trust",            city: "Chennai, Tamil Nadu",    focus: "Women Empowerment",      volunteers: 280, needs: 42, rating: 4.9, verified: true, badge: "Top Rated",    badgeColor: "#5A7863", desc: "Self-help groups, legal aid clinics, and micro-finance for women entrepreneurs.", avatar: "ST", since: "2017", colorCard: "107,143,113"},
    { name: "Jal Shakti NGO",            city: "Jaipur, Rajasthan",      focus: "Water & Sanitation",     volunteers: 142, needs: 23, rating: 4.6, verified: true, badge: "Urgent Needs", badgeColor: "#C4853E", desc: "Rainwater harvesting, borewell restoration, and open defecation free village campaigns.", avatar: "JS", since: "2018", colorCard: "28,53,45"   },
]

const STEPS = [
    { id: 0, label: "Choose Role",  desc: "Who are you?"      },
    { id: 1, label: "Your Details", desc: "Basic information" },
    { id: 2, label: "Skills",       desc: "What can you do?"  },
    { id: 3, label: "Confirm",      desc: "Review & finish"   },
]

const NGO_STEPS = [
    { id: 0, label: "Basic Info",    desc: "About your NGO"     },
    { id: 1, label: "Focus Areas",   desc: "What you work on"   },
    { id: 2, label: "Documents",     desc: "Verification"       },
    { id: 3, label: "Done",          desc: "Submitted!"         },
]

const SKILLS_LIST = [
    "Medical Aid","Logistics","Teaching","Construction",
    "Counseling","Driving","Cooking","IT Support",
    "Translation","Photography","Legal Aid","Finance",
]

const NGO_FOCUS = [
    "Education","Health","Environment","Women Empowerment",
    "Child Welfare","Skill Development","Water & Sanitation",
    "Disaster Relief","Animal Welfare","Senior Citizens",
]

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    size: Math.random()*3+1.5, dur: Math.random()*9+5, delay: Math.random()*4,
}))

const NODES = [
    { x:18, y:22, label:"Field Report", emoji:"📋" },
    { x:50, y:12, label:"AI Scoring",   emoji:"⚡" },
    { x:82, y:26, label:"Heatmap",      emoji:"🗺️" },
    { x:22, y:60, label:"Volunteer",    emoji:"🙋" },
    { x:56, y:52, label:"Match",        emoji:"🎯" },
    { x:82, y:66, label:"Task Done",    emoji:"✅" },
    { x:40, y:82, label:"Impact",       emoji:"💚" },
]
const EDGES = [[0,1],[1,2],[1,4],[3,4],[4,5],[4,6],[2,5]]

const NODE_DESCS = [
    "Community members report needs via SMS, app, or field surveys",
    "Gemini AI scores urgency on 8 factors in under 2 seconds",
    "Geospatial heatmaps show coordinators where to focus",
    "Matched volunteer receives push notification instantly",
    "6-factor algorithm finds the perfect volunteer",
    "Task completed, proof captured, coordinator notified",
    "Donor gets real-time update. Loop closed.",
]

/* ─── SUN/MOON TOGGLE ────────────────────────────────────────────────────── */
const DayNightToggle = ({ dark, onToggle, small }) => {
    const size = small ? 44 : 56
    const ballSize = small ? 18 : 24
    return (
        <button
            onClick={onToggle}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
                width: size, height: size/2, borderRadius: size/4, border:"none", cursor:"pointer",
                position:"relative", overflow:"hidden", padding:0,
                background: dark
                    ? "linear-gradient(135deg, #0a0f1a 0%, #1a2a4a 100%)"
                    : "linear-gradient(135deg, #87ceeb 0%, #64b0e0 100%)",
                transition: "background 0.5s ease",
                flexShrink:0,
            }}
            aria-label="Toggle dark mode">
            {/* Stars (dark mode) */}
            <AnimatePresence>
                {dark && [
                    { cx:"12%", cy:"30%", r:1.2 }, { cx:"30%", cy:"15%", r:0.9 },
                    { cx:"55%", cy:"25%", r:1.1 }, { cx:"70%", cy:"10%", r:0.8 },
                    { cx:"85%", cy:"35%", r:1.0 },
                ].map((s, i) => (
                    <Motion.div key={i}
                                initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }}
                                exit={{ opacity:0, scale:0 }} transition={{ delay: i*0.05 }}
                                style={{ position:"absolute", left:s.cx, top:s.cy,
                                    width: s.r*2*2, height: s.r*2*2, borderRadius:"50%",
                                    background:"#fff", transform:"translate(-50%,-50%)" }} />
                ))}
            </AnimatePresence>
            {/* Cloud (light mode) */}
            <AnimatePresence>
                {!dark && (
                    <Motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:0.9, x:0 }} exit={{ opacity:0, x:10 }}
                                style={{ position:"absolute", right:"22%", top:"10%",
                                    width:"30%", height:"60%", borderRadius:99,
                                    background:"rgba(255,255,255,0.8)", filter:"blur(1px)" }} />
                )}
            </AnimatePresence>
            {/* Orb */}
            <Motion.div
                animate={{ left: dark ? `calc(100% - ${ballSize + 4}px)` : "4px" }}
                transition={{ type:"spring", stiffness:300, damping:28 }}
                style={{
                    position:"absolute", top: (size/2 - ballSize)/2,
                    width: ballSize, height: ballSize, borderRadius:"50%",
                    background: dark
                        ? "linear-gradient(135deg, #e8e0d0 0%, #c8c0a8 100%)"
                        : "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)",
                    boxShadow: dark
                        ? "0 0 8px rgba(200,190,160,0.5)"
                        : "0 0 12px rgba(255,180,0,0.7)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                {/* Moon spots */}
                {dark && <>
                    <div style={{ position:"absolute", width:4, height:4, borderRadius:"50%", background:"rgba(0,0,0,0.15)", top:"20%", left:"30%" }} />
                    <div style={{ position:"absolute", width:2.5, height:2.5, borderRadius:"50%", background:"rgba(0,0,0,0.1)", bottom:"25%", right:"25%" }} />
                </>}
            </Motion.div>
        </button>
    )
}

/* ─── GRADIENT BORDER BUTTON ─────────────────────────────────────────────── */
const GradientBtn = ({ children, onClick, style, className, dark, small, outline }) => {
    const [hovered, setHovered] = useState(false)
    const grad = dark
        ? "linear-gradient(90deg, #78b450, #3ec9b0)"
        : "linear-gradient(90deg, #2d5a2d, #5A7863)"
    const innerBg = outline
        ? (dark ? "rgba(10,15,8,0.72)" : "rgba(255,255,255,0.82)")
        : (dark ? "#0a0f08" : "#1C352D")
    const textCol = outline
        ? (dark ? "#dff5c6" : "#1C352D")
        : (dark ? "#edf5e0" : "#EBF4DD")
    return (
        <div style={{ position:"relative", display:"flex", width:"fit-content", ...style }}
             onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div style={{
                position:"absolute",
                inset: hovered ? "-2px" : "0px",
                borderRadius:"0.9em",
                background: grad,
                filter: "blur(16px)",
                opacity: hovered ? 0.45 : 0,
                transition:"all 0.28s ease",
                pointerEvents:"none",
                zIndex:0,
            }} />
            <div style={{ padding:3, background: grad, borderRadius:"0.9em", position:"relative", zIndex:1, width:"100%" }}>
                <Motion.button
                    whileHover={{ scale:1.02 }} whileTap={{ scale:0.96 }}
                    onClick={onClick} className={className}
                    style={{
                        background: innerBg, color: textCol,
                        border: outline ? `1.5px solid ${dark ? "rgba(196,245,154,0.9)" : "#1C352D"}` : "none",
                        borderRadius:"0.5em",
                        padding: small ? "7px 16px" : "11px 24px",
                        fontSize: small ? 12 : 14, fontWeight:800,
                        cursor:"pointer", display:"flex", alignItems:"center",
                        gap:7, whiteSpace:"nowrap",
                        width:"100%", justifyContent:"center",
                        boxShadow: outline && dark ? "inset 0 0 0 1px rgba(120,180,80,0.28)" : "none",
                    }}>
                    {children}
                </Motion.button>
            </div>
        </div>
    )
}

/* ─── BG PARTICLES ───────────────────────────────────────────────────────── */
const BgParticles = ({ dark }) => (
    <>
        {PARTICLES.map(p => (
            <Motion.div key={p.id} className="absolute rounded-full pointer-events-none"
                        style={{ left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size,
                            background: dark ? "#78b450" : "#5A7863", opacity:0.07 }}
                        animate={{ y:[0,-35,0], opacity:[0.03,0.15,0.03] }}
                        transition={{ duration:p.dur, delay:p.delay, repeat:Infinity, ease:"easeInOut" }} />
        ))}
    </>
)

/* ─── ANIMATED GRAPH ─────────────────────────────────────────────────────── */
const AnimatedGraph = () => {
    const [active, setActive] = useState(0)
    useEffect(() => {
        const t = setInterval(() => setActive(p => (p+1)%NODES.length), 1400)
        return () => clearInterval(t)
    }, [])
    return (
        <div>
            <div className="relative w-full" style={{ height:180 }}>
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {EDGES.map(([a,b],i) => (
                        <Motion.line key={i}
                                     x1={`${NODES[a].x}%`} y1={`${NODES[a].y}%`}
                                     x2={`${NODES[b].x}%`} y2={`${NODES[b].y}%`}
                                     stroke="#5A7863" strokeWidth="0.45" strokeOpacity="0.45" strokeDasharray="2 2"
                                     initial={{ pathLength:0 }} animate={{ pathLength:1 }}
                                     transition={{ delay:i*0.18, duration:0.9 }} />
                    ))}
                    {NODES.map((node,i) => (
                        <g key={i}>
                            <Motion.circle cx={`${node.x}%`} cy={`${node.y}%`}
                                           fill={i===active ? "#90AB8B" : "#3B4953"}
                                           stroke={i===active ? "#EBF4DD" : "#5A7863"} strokeWidth="0.5"
                                           animate={{ r: i===active ? 3.2 : 2, opacity: i===active ? 1 : 0.55 }}
                                           transition={{ duration:0.4 }} />
                            {i===active && (<>
                                <Motion.circle cx={`${node.x}%`} cy={`${node.y}%`}
                                               r="4" fill="none" stroke="#90AB8B" strokeWidth="0.35"
                                               initial={{ r:3, opacity:1 }} animate={{ r:8, opacity:0 }}
                                               transition={{ duration:1.2, repeat:Infinity }} />
                                <Motion.circle cx={`${node.x}%`} cy={`${node.y}%`}
                                               r="4" fill="none" stroke="#5A7863" strokeWidth="0.2"
                                               initial={{ r:3, opacity:0.6 }} animate={{ r:11, opacity:0 }}
                                               transition={{ duration:1.8, repeat:Infinity, delay:0.3 }} />
                            </>)}
                        </g>
                    ))}
                    {/* Signal dot travelling along edge */}
                    {active < NODES.length-1 && (
                        <Motion.circle r="0.8" fill="#EBF4DD"
                                       initial={{ cx:`${NODES[active].x}%`, cy:`${NODES[active].y}%` }}
                                       animate={{ cx:`${NODES[(active+1)%NODES.length].x}%`, cy:`${NODES[(active+1)%NODES.length].y}%` }}
                                       transition={{ duration:1.2, ease:"easeInOut" }} />
                    )}
                </svg>
                {NODES.map((node,i) => (
                    <div key={i} style={{ position:"absolute", left:`${node.x}%`, top:`${node.y}%`,
                        transform:"translate(-50%, -230%)", pointerEvents:"none" }}>
                        <Motion.span animate={{ opacity: i===active ? 1 : 0.3 }} transition={{ duration:0.3 }}
                                     style={{ display:"inline-flex", alignItems:"center", gap:3,
                                         padding:"2px 7px", borderRadius:5, fontSize:8, fontWeight:700, whiteSpace:"nowrap",
                                         background: i===active ? "#5A7863" : "rgba(255,255,255,0.08)",
                                         color: i===active ? "#EBF4DD" : "#90AB8B" }}>
                            <span>{node.emoji}</span> {node.label}
                        </Motion.span>
                    </div>
                ))}
            </div>
            {/* Active node description */}
            <AnimatePresence mode="wait">
                <Motion.div key={active}
                            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
                            transition={{ duration:0.3 }}
                            style={{ marginTop:8, padding:"8px 12px", borderRadius:10,
                                background:"rgba(90,120,99,0.2)", border:"1px solid rgba(90,120,99,0.25)" }}>
                    <p style={{ fontSize:10, color:"#90AB8B", margin:0, lineHeight:1.5 }}>
                        <span style={{ color:"#EBF4DD", fontWeight:700, marginRight:4 }}>{NODES[active].emoji} {NODES[active].label}:</span>
                        {NODE_DESCS[active]}
                    </p>
                </Motion.div>
            </AnimatePresence>
        </div>
    )
}

/* ─── STAT CARD WITH TOOLTIP ─────────────────────────────────────────────── */
const StatCard = ({ stat, dark }) => {
    const [show, setShow] = useState(false)
    return (
        <div style={{ position:"relative" }}
             onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            <Motion.div
                whileHover={{ y:-4, boxShadow: dark
                        ? "0 12px 30px rgba(0,0,0,0.4)"
                        : "0 12px 30px rgba(28,53,45,0.18)" }}
                style={{
                    background: dark ? "rgba(28,42,24,0.9)" : "rgba(255,255,255,0.88)",
                    border: `1.5px solid ${dark ? "rgba(120,180,80,0.15)" : "rgba(90,120,99,0.15)"}`,
                    borderRadius:16, padding:"14px 16px",
                    display:"flex", alignItems:"center", gap:12, cursor:"default",
                    transition:"background 0.2s",
                }}>
                <div style={{
                    width:34, height:34, borderRadius:10, flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: dark ? "rgba(120,180,80,0.15)" : "#EBF4DD",
                    color: dark ? "#78b450" : "#5A7863",
                }}>
                    {stat.icon}
                </div>
                <div>
                    <p style={{ fontWeight:900, fontSize:17, margin:0,
                        color: dark ? "#edf5e0" : "#1C352D" }}>{stat.value}</p>
                    <p style={{ fontSize:10, fontWeight:600, margin:0,
                        color: dark ? "#7a9b6a" : "#90AB8B" }}>{stat.label}</p>
                </div>
            </Motion.div>
            <AnimatePresence>
                {show && (
                    <Motion.div initial={{ opacity:0, y:6, scale:0.95 }}
                                animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:6, scale:0.95 }}
                                transition={{ duration:0.18 }}
                                style={{ position:"absolute", bottom:"110%", left:"50%", transform:"translateX(-50%)",
                                    zIndex:99, minWidth:180,
                                    background: dark ? "#1c2a18" : "#1C352D",
                                    border: `1px solid ${dark ? "rgba(120,180,80,0.2)" : "rgba(90,120,99,0.3)"}`,
                                    borderRadius:12, padding:"12px 14px",
                                    boxShadow:"0 12px 32px rgba(0,0,0,0.25)" }}>
                        <p style={{ fontSize:10, color:"#90AB8B", margin:"0 0 6px",
                            fontWeight:800, textTransform:"uppercase", letterSpacing:1 }}>Breakdown</p>
                        {stat.tooltip.split("\n").map((line,i) => (
                            <p key={i} style={{ fontSize:11, color:"#EBF4DD", margin:"2px 0", fontWeight:600 }}>{line}</p>
                        ))}
                        <div style={{ marginTop:8, paddingTop:6,
                            borderTop:"1px solid rgba(90,120,99,0.25)",
                            display:"flex", alignItems:"center", gap:5 }}>
                            <TrendingUp size={10} color="#5A7863" />
                            <span style={{ fontSize:10, color:"#5A7863", fontWeight:700 }}>{stat.growth}</span>
                        </div>
                        {/* Arrow */}
                        <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)",
                            width:10, height:10, background: dark ? "#1c2a18" : "#1C352D",
                            rotate:"45deg", borderRight:"1px solid rgba(90,120,99,0.2)",
                            borderBottom:"1px solid rgba(90,120,99,0.2)" }} />
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─── DARK NOTIFICATION CARD ─────────────────────────────────────────────── */
const NotifCard = ({ children, color = "#4a9fce" }) => {
    const [hovered, setHovered] = useState(false)
    return (
        <Motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:-10 }}
                    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                    style={{
                        background:"#18181b", borderRadius:12, overflow:"hidden",
                        border: hovered ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: hovered ? `0 0 0 1px ${color}30, inset 0 0 20px ${color}08` : "none",
                        display:"flex", alignItems:"stretch",
                        transition:"all 0.25s",
                    }}>
            <div style={{ width:4, background:`linear-gradient(180deg, ${color}, ${color}80)`, flexShrink:0 }} />
            <div style={{ padding:"10px 14px", flex:1 }}>
                {children}
            </div>
        </Motion.div>
    )
}

/* ─── INLINE INPUT ───────────────────────────────────────────────────────── */
const Input = ({ label, type="text", placeholder, value, onChange, icon, dark }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {label && <label style={{ fontSize:12, fontWeight:700,
            color: dark ? "#7a9b6a" : "#3B4953" }}>{label}</label>}
        <div style={{ position:"relative" }}>
            {icon && (
                <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                    color: dark ? "#4a6b3a" : "#90AB8B", pointerEvents:"none", display:"flex" }}>
                    {icon}
                </div>
            )}
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                   style={{
                       width:"100%", borderRadius:11, padding:"10px 14px",
                       paddingLeft: icon ? 40 : 14, fontSize:14, outline:"none",
                       boxSizing:"border-box",
                       background: dark ? "rgba(28,42,24,0.7)" : "#f8faf6",
                       border: `1.5px solid ${dark ? "rgba(120,180,80,0.15)" : "#d4e4cc"}`,
                       color: dark ? "#edf5e0" : "#1C352D", transition:"all 0.2s",
                   }}
                   onFocus={e => {
                       e.target.style.borderColor = dark ? "#78b450" : "#5A7863"
                       e.target.style.boxShadow = dark
                           ? "0 0 0 3px rgba(120,180,80,0.1)"
                           : "0 0 0 3px rgba(90,120,99,0.12)"
                   }}
                   onBlur={e => {
                       e.target.style.borderColor = dark ? "rgba(120,180,80,0.15)" : "#d4e4cc"
                       e.target.style.boxShadow = "none"
                   }} />
        </div>
    </div>
)

/* ─── STEP BAR ───────────────────────────────────────────────────────────── */
const StepBar = ({ current, steps, dark }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:24 }}>
        {steps.map((s, i) => (
            <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, minWidth:64 }}>
                    <Motion.div animate={{
                        background: i < current
                            ? (dark ? "#78b450" : "#1C352D")
                            : i === current
                                ? (dark ? "#4a6b3a" : "#5A7863")
                                : (dark ? "#1c2a18" : "#e8f0e0"),
                        scale: i === current ? 1.15 : 1,
                    }}
                                style={{ width:32, height:32, borderRadius:"50%",
                                    border:`2px solid ${i <= current ? (dark ? "#78b450" : "#5A7863") : (dark ? "rgba(120,180,80,0.15)" : "#d4e4cc")}`,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    fontWeight:900, fontSize:12,
                                    color: i <= current ? "#EBF4DD" : (dark ? "#4a6b3a" : "#90AB8B") }}>
                        {i < current ? <Check size={13} /> : i + 1}
                    </Motion.div>
                    <span style={{ fontSize:9, fontWeight:700, whiteSpace:"nowrap",
                        color: i <= current ? (dark ? "#edf5e0" : "#1C352D") : (dark ? "#4a6b3a" : "#90AB8B") }}>
                        {s.label}
                    </span>
                </div>
                {i < steps.length-1 && (
                    <Motion.div style={{ height:2, width:28, marginBottom:14 }}
                                animate={{ background: i < current
                                        ? (dark ? "#78b450" : "#5A7863")
                                        : (dark ? "rgba(120,180,80,0.1)" : "#e8f0e0") }} />
                )}
            </div>
        ))}
    </div>
)

/* ─── SLIDING PILL TAB ───────────────────────────────────────────────────── */
const PillTabs = ({ tabs, active, onSelect, dark }) => {
    const idx = tabs.indexOf(active)
    return (
        <div style={{ position:"relative", display:"flex",
            background: dark ? "rgba(28,42,24,0.7)" : "#f0f4ec",
            borderRadius:10, padding:3,
            border: `1px solid ${dark ? "rgba(120,180,80,0.12)" : "#d4e4cc"}` }}>
            <Motion.div animate={{ x: idx * (100 / tabs.length) + "%" }}
                        style={{ position:"absolute", top:3, left:3,
                            width:`calc(${100/tabs.length}% - 3px)`, height:"calc(100% - 6px)",
                            background: dark ? "#1C352D" : "#1C352D",
                            borderRadius:7,
                            boxShadow:"0 2px 8px rgba(0,0,0,0.18)" }}
                        transition={{ type:"spring", stiffness:400, damping:30 }} />
            {tabs.map(tab => (
                <button key={tab} onClick={() => onSelect(tab)}
                        style={{ flex:1, padding:"8px 12px", fontSize:13, fontWeight:800,
                            background:"transparent", border:"none", cursor:"pointer",
                            color: active === tab ? "#EBF4DD" : (dark ? "#7a9b6a" : "#90AB8B"),
                            position:"relative", zIndex:1, transition:"color 0.2s",
                            borderRadius:7, textTransform:"capitalize" }}>
                    {tab}
                </button>
            ))}
        </div>
    )
}

/* ─── NGO REGISTER MODAL ─────────────────────────────────────────────────── */
const NgoRegisterModal = ({ onClose }) => {
    const { dark } = useTheme()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name:"", email:"", phone:"", city:"", website:"",
        regNumber:"", focus:[], description:""
    })
    const s = k => e => setForm(p => ({...p, [k]: e.target.value}))
    const toggleFocus = f => setForm(p => ({
        ...p, focus: p.focus.includes(f) ? p.focus.filter(x=>x!==f) : [...p.focus, f]
    }))

    const next = () => {
        if (step < 2) { setStep(s => s+1); return }
        setLoading(true)
        setTimeout(() => { setLoading(false); setStep(3) }, 1600)
    }

    const cardBg = dark ? "#111a0e" : "#fff"
    const cardBorder = dark ? "rgba(120,180,80,0.12)" : "rgba(90,120,99,0.15)"
    const labelStyle = { fontSize:12, fontWeight:700, color: dark ? "#7a9b6a" : "#3B4953", marginBottom:4, display:"block" }
    const inputStyle = {
        width:"100%", borderRadius:10, padding:"10px 13px", fontSize:13,
        outline:"none", boxSizing:"border-box",
        background: dark ? "rgba(28,42,24,0.7)" : "#f8faf6",
        border:`1.5px solid ${dark ? "rgba(120,180,80,0.12)" : "#d4e4cc"}`,
        color: dark ? "#edf5e0" : "#1C352D",
    }

    return (
        <Motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ position:"fixed", inset:0, zIndex:200, display:"flex",
                        alignItems:"center", justifyContent:"center", padding:16,
                        background:"rgba(10,15,8,0.7)", backdropFilter:"blur(10px)" }}
                    onClick={onClose}>
            <Motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
                        exit={{ scale:0.9, y:20 }} transition={{ type:"spring", stiffness:260, damping:22 }}
                        onClick={e => e.stopPropagation()}
                        style={{ width:"100%", maxWidth:500, maxHeight:"90vh",
                            background: cardBg, border:`1.5px solid ${cardBorder}`,
                            borderRadius:24, overflow:"hidden", display:"flex", flexDirection:"column",
                            boxShadow:"0 40px 100px rgba(0,0,0,0.3)" }}>
                {/* Header */}
                <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${cardBorder}`,
                    display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                        <p style={{ fontWeight:900, fontSize:18, margin:0,
                            color: dark ? "#edf5e0" : "#1C352D" }}>Register Your NGO</p>
                        <p style={{ fontSize:12, color: dark ? "#7a9b6a" : "#90AB8B", margin:"2px 0 0" }}>
                            Verified within 48 hours · Free forever
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width:32, height:32, borderRadius:8,
                        border:`1px solid ${cardBorder}`, background:"transparent", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color: dark ? "#7a9b6a" : "#90AB8B" }}>
                        <X size={15} />
                    </button>
                </div>

                {step < 3 && (
                    <div style={{ padding:"16px 24px 0" }}>
                        <StepBar current={step} steps={NGO_STEPS.slice(0,3)} dark={dark} />
                    </div>
                )}

                {/* Body */}
                <div style={{ flex:1, overflowY:"auto", padding:"8px 24px 16px" }}>
                    <AnimatePresence mode="wait">
                        <Motion.div key={step}
                                    initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                                    exit={{ opacity:0, x:-20 }} transition={{ duration:0.22 }}>

                            {step === 0 && (
                                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                                        {[{k:"name",l:"NGO Name",p:"Green Horizon Foundation"},{k:"email",l:"Email",p:"contact@ngo.in"}].map(f => (
                                            <div key={f.k}>
                                                <label style={labelStyle}>{f.l}</label>
                                                <input value={form[f.k]} onChange={s(f.k)} placeholder={f.p} style={inputStyle}
                                                       onFocus={e=>{e.target.style.borderColor=dark?"#78b450":"#5A7863";e.target.style.boxShadow=dark?"0 0 0 3px rgba(120,180,80,0.1)":"0 0 0 3px rgba(90,120,99,0.12)"}}
                                                       onBlur={e=>{e.target.style.borderColor=dark?"rgba(120,180,80,0.12)":"#d4e4cc";e.target.style.boxShadow="none"}} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                                        {[{k:"phone",l:"Phone",p:"+91 98765 00001"},{k:"city",l:"City / State",p:"Pune, Maharashtra"}].map(f => (
                                            <div key={f.k}>
                                                <label style={labelStyle}>{f.l}</label>
                                                <input value={form[f.k]} onChange={s(f.k)} placeholder={f.p} style={inputStyle}
                                                       onFocus={e=>{e.target.style.borderColor=dark?"#78b450":"#5A7863";e.target.style.boxShadow=dark?"0 0 0 3px rgba(120,180,80,0.1)":"0 0 0 3px rgba(90,120,99,0.12)"}}
                                                       onBlur={e=>{e.target.style.borderColor=dark?"rgba(120,180,80,0.12)":"#d4e4cc";e.target.style.boxShadow="none"}} />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Website (optional)</label>
                                        <input value={form.website} onChange={s("website")} placeholder="https://yourwebsite.org" style={inputStyle}
                                               onFocus={e=>{e.target.style.borderColor=dark?"#78b450":"#5A7863";e.target.style.boxShadow=dark?"0 0 0 3px rgba(120,180,80,0.1)":"0 0 0 3px rgba(90,120,99,0.12)"}}
                                               onBlur={e=>{e.target.style.borderColor=dark?"rgba(120,180,80,0.12)":"#d4e4cc";e.target.style.boxShadow="none"}} />
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div>
                                    <p style={{ fontSize:13, fontWeight:800, color: dark ? "#edf5e0" : "#1C352D", marginBottom:4 }}>Focus Areas</p>
                                    <p style={{ fontSize:11, color:"#90AB8B", marginBottom:12 }}>Select all that apply</p>
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14 }}>
                                        {NGO_FOCUS.map(f => (
                                            <Motion.button key={f} whileTap={{ scale:0.94 }} onClick={() => toggleFocus(f)}
                                                           style={{ padding:"7px 13px", borderRadius:9, fontSize:11, fontWeight:700,
                                                               border:"1.5px solid", cursor:"pointer", transition:"all 0.15s",
                                                               background: form.focus.includes(f) ? (dark ? "#78b450" : "#1C352D") : (dark ? "rgba(28,42,24,0.7)" : "#f8faf6"),
                                                               borderColor: form.focus.includes(f) ? (dark ? "#78b450" : "#1C352D") : (dark ? "rgba(120,180,80,0.12)" : "#d4e4cc"),
                                                               color: form.focus.includes(f) ? "#EBF4DD" : (dark ? "#7a9b6a" : "#5A7863") }}>
                                                {f}
                                            </Motion.button>
                                        ))}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Brief Description</label>
                                        <textarea value={form.description} onChange={s("description")}
                                                  placeholder="Tell us about your NGO's mission and impact..." rows={3}
                                                  style={{ ...inputStyle, resize:"none", lineHeight:1.5 }}
                                                  onFocus={e=>{e.target.style.borderColor=dark?"#78b450":"#5A7863";e.target.style.boxShadow=dark?"0 0 0 3px rgba(120,180,80,0.1)":"0 0 0 3px rgba(90,120,99,0.12)"}}
                                                  onBlur={e=>{e.target.style.borderColor=dark?"rgba(120,180,80,0.12)":"#d4e4cc";e.target.style.boxShadow="none"}} />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                                    <p style={{ fontSize:13, fontWeight:800, color: dark ? "#edf5e0" : "#1C352D", margin:0 }}>Verification Documents</p>
                                    <p style={{ fontSize:11, color:"#90AB8B", margin:0 }}>Activates your account within 48 hours</p>
                                    <div>
                                        <label style={labelStyle}>Registration Number (12A / 80G / FCRA)</label>
                                        <input value={form.regNumber} onChange={s("regNumber")} placeholder="AAABCD1234E" style={inputStyle}
                                               onFocus={e=>{e.target.style.borderColor=dark?"#78b450":"#5A7863";e.target.style.boxShadow=dark?"0 0 0 3px rgba(120,180,80,0.1)":"0 0 0 3px rgba(90,120,99,0.12)"}}
                                               onBlur={e=>{e.target.style.borderColor=dark?"rgba(120,180,80,0.12)":"#d4e4cc";e.target.style.boxShadow="none"}} />
                                    </div>
                                    {["Registration Certificate", "Pan Card / Tax Document"].map(doc => (
                                        <div key={doc} style={{ border:`1.5px dashed ${dark ? "rgba(120,180,80,0.2)" : "#d4e4cc"}`,
                                            borderRadius:11, padding:14,
                                            display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                                            background: dark ? "rgba(28,42,24,0.4)" : "#fafcf8", transition:"all 0.2s" }}
                                             onMouseEnter={e=>e.currentTarget.style.borderColor=dark?"#78b450":"#5A7863"}
                                             onMouseLeave={e=>e.currentTarget.style.borderColor=dark?"rgba(120,180,80,0.2)":"#d4e4cc"}>
                                            <div style={{ width:34, height:34, borderRadius:8,
                                                background: dark ? "rgba(120,180,80,0.1)" : "#EBF4DD",
                                                display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={dark?"#78b450":"#5A7863"} strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p style={{ fontSize:12, fontWeight:700, margin:0,
                                                    color: dark ? "#edf5e0" : "#1C352D" }}>{doc}</p>
                                                <p style={{ fontSize:10, color:"#90AB8B", margin:0 }}>PDF or image · Max 5MB</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ padding:"10px 13px", borderRadius:10,
                                        background: dark ? "rgba(120,180,80,0.08)" : "#EBF4DD",
                                        border:`1px solid ${dark ? "rgba(120,180,80,0.15)" : "#d4e4cc"}`,
                                        display:"flex", gap:8, alignItems:"flex-start" }}>
                                        <Shield size={13} style={{ color:"#5A7863", marginTop:2, flexShrink:0 }} />
                                        <p style={{ fontSize:11, color: dark ? "#7a9b6a" : "#3B5C38", margin:0, lineHeight:1.5 }}>
                                            Your documents are encrypted and only used for verification purposes.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div style={{ textAlign:"center", padding:"20px 0" }}>
                                    <Motion.div initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
                                                transition={{ type:"spring", stiffness:200, damping:15 }}
                                                style={{ width:64, height:64, borderRadius:20,
                                                    background: dark ? "#78b450" : "#1C352D",
                                                    display:"flex", alignItems:"center", justifyContent:"center",
                                                    margin:"0 auto 16px" }}>
                                        <Check size={28} color="#EBF4DD" />
                                    </Motion.div>
                                    <p style={{ fontSize:20, fontWeight:900, color: dark ? "#edf5e0" : "#1C352D", marginBottom:8 }}>
                                        Application Submitted! 🎉
                                    </p>
                                    <p style={{ fontSize:13, color:"#90AB8B", marginBottom:18, lineHeight:1.6 }}>
                                        <strong style={{ color: dark ? "#edf5e0" : "#1C352D" }}>{form.name || "Your NGO"}</strong> is under review.
                                        Check <strong style={{ color: dark ? "#edf5e0" : "#1C352D" }}>{form.email || "your email"}</strong> for updates within <strong style={{ color: dark ? "#edf5e0" : "#1C352D" }}>48 hours</strong>.
                                    </p>
                                    {[{icon:"✓",text:"Application received"},{icon:"⏳",text:"Under verification (48hrs)"},{icon:"🚀",text:"Dashboard access granted"}].map(i => (
                                        <div key={i.text} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6,
                                            padding:"10px 14px", borderRadius:10,
                                            background: dark ? "rgba(28,42,24,0.7)" : "#f8faf6",
                                            border:`1px solid ${dark ? "rgba(120,180,80,0.1)" : "#e8f0e0"}`, textAlign:"left" }}>
                                            <span style={{ fontSize:14 }}>{i.icon}</span>
                                            <span style={{ fontSize:12, fontWeight:700, color: dark ? "#7a9b6a" : "#3B5C38" }}>{i.text}</span>
                                        </div>
                                    ))}
                                    <button onClick={onClose} style={{ marginTop:18, padding:"11px 30px",
                                        borderRadius:12, background: dark ? "#78b450" : "#1C352D",
                                        color:"#EBF4DD", fontWeight:900, fontSize:13, border:"none", cursor:"pointer" }}>
                                        Back to CivicPulse
                                    </button>
                                </div>
                            )}
                        </Motion.div>
                    </AnimatePresence>
                </div>

                {step < 3 && (
                    <div style={{ padding:"14px 24px", borderTop:`1px solid ${cardBorder}`,
                        display:"flex", gap:10, background: dark ? "rgba(10,15,8,0.5)" : "#fafcf8" }}>
                        {step > 0 && (
                            <button onClick={() => setStep(s => s-1)}
                                    style={{ padding:"10px 18px", borderRadius:10,
                                        border:`1.5px solid ${dark ? "rgba(120,180,80,0.2)" : "#d4e4cc"}`,
                                        color: dark ? "#7a9b6a" : "#3B4953", fontWeight:700, fontSize:13,
                                        background:"transparent", cursor:"pointer" }}>
                                Back
                            </button>
                        )}
                        <GradientBtn onClick={next} dark={dark} style={{ flex:1 }}>
                            {loading
                                ? <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                : step === 2 ? <><Check size={14}/>  Submit Application</> : <>Continue <ArrowRight size={14}/></>}
                        </GradientBtn>
                    </div>
                )}
            </Motion.div>
        </Motion.div>
    )
}

/* ─── AUTH PANEL ─────────────────────────────────────────────────────────── */
const AuthPanel = ({ mode, onSwitchMode }) => {
    const navigate = useNavigate()
    const { dark } = useTheme()
    const [email,    setEmail]    = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading,  setLoading]  = useState(false)
    const [success,  setSuccess]  = useState(false)
    const [error,    setError]    = useState("")
    const [loginRole, setLoginRole] = useState("NGO Coordinator")

    const [step, setStep]   = useState(0)
    const [role, setRole]   = useState(null)
    const [form, setForm]   = useState({ name:"", email:"", password:"", org:"", phone:"", city:"", skills:[], days:[], time:"Morning" })
    const set = k => e => setForm(p => ({...p, [k]: e.target.value}))
    const toggleSkill = s => setForm(p => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter(x=>x!==s) : [...p.skills,s] }))
    const toggleDay = d => setForm(p => ({ ...p, days: p.days.includes(d) ? p.days.filter(x=>x!==d) : [...p.days,d] }))

    const handleLogin = () => {
        if (!email || !password) { setError("Please fill in all fields"); return }
        setLoading(true); setError("")
        setTimeout(() => {
            setLoading(false); setSuccess(true)
            setTimeout(() => navigate(loginRole === "Volunteer" ? "/home" : "/dashboard"), 1500)
        }, 1600)
    }

    const handleSignupNext = () => {
        if (step === 0 && !role) return
        if (step < STEPS.length-1) { setStep(s=>s+1); return }
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            navigate(role === "ngo" ? "/dashboard" : "/home")
        }, 1800)
    }

    const cardBg    = dark ? "#111a0e" : "#ffffff"
    const cardBdr   = dark ? "rgba(120,180,80,0.12)" : "rgba(90,120,99,0.2)"
    const textMain  = dark ? "#edf5e0" : "#1C352D"
    const textMuted = dark ? "#7a9b6a" : "#90AB8B"
    const borderCol = dark ? "rgba(120,180,80,0.1)" : "#e8f0e0"

    return (
        <Motion.div initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                    exit={{ opacity:0, y:20, scale:0.97 }} transition={{ duration:0.35 }}
                    style={{ borderRadius:24, overflow:"hidden", width:"100%", maxWidth:460, margin:"0 auto",
                        background: cardBg, border:`1.5px solid ${cardBdr}`,
                        boxShadow:"0 32px 80px rgba(0,0,0,0.22)", backdropFilter:"blur(20px)" }}>

            {/* Tab switcher */}
            <div style={{ padding:"4px 4px 0", borderBottom:`1.5px solid ${borderCol}`, display:"flex" }}>
                {["login","signup"].map(m => (
                    <button key={m} onClick={() => { onSwitchMode(m); setStep(0); setError("") }}
                            style={{ flex:1, padding:"14px 12px", fontSize:13, fontWeight:900, textTransform:"capitalize",
                                background: mode === m ? cardBg : (dark ? "rgba(28,42,24,0.5)" : "#f8faf6"),
                                color: mode === m ? textMain : textMuted,
                                borderBottom: mode === m ? `2.5px solid ${dark ? "#78b450" : "#5A7863"}` : "2.5px solid transparent",
                                border:"none", cursor:"pointer", transition:"all 0.2s" }}>
                        {m === "login" ? "Sign In" : "Create Account"}
                    </button>
                ))}
            </div>

            <div style={{ padding:28 }}>
                <AnimatePresence mode="wait">
                    {mode === "login" ? (
                        <Motion.div key="login" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                                    exit={{ opacity:0, x:20 }} transition={{ duration:0.22 }}>

                            <div style={{ marginBottom:20 }}>
                                <h2 style={{ fontWeight:900, fontSize:22, margin:0, color:textMain }}>Welcome back</h2>
                                <p style={{ fontSize:13, margin:"5px 0 0", color:textMuted }}>Sign in to your CivicPulse account</p>
                            </div>

                            {/* Role tab */}
                            <div style={{ marginBottom:18 }}>
                                <PillTabs tabs={["NGO Coordinator","Volunteer"]}
                                          active={loginRole} onSelect={setLoginRole} dark={dark} />
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <div style={{ marginBottom:14 }}>
                                        <NotifCard color="#e05a3a">
                                            <p style={{ fontSize:12, fontWeight:700, color:"#e05a3a", margin:0 }}>{error}</p>
                                        </NotifCard>
                                    </div>
                                )}
                            </AnimatePresence>

                            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:18 }}>
                                <Input label="Email" type="email" placeholder="you@example.com"
                                       value={email} onChange={e=>setEmail(e.target.value)}
                                       icon={<Mail size={15}/>} dark={dark} />
                                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                                    <label style={{ fontSize:12, fontWeight:700, color: dark ? "#7a9b6a" : "#3B4953" }}>Password</label>
                                    <div style={{ position:"relative" }}>
                                        <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                                            color: dark ? "#4a6b3a" : "#90AB8B", display:"flex" }}>
                                            <Lock size={15}/>
                                        </div>
                                        <input type={showPass ? "text" : "password"} value={password}
                                               onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                                               style={{ width:"100%", borderRadius:11, padding:"10px 42px 10px 40px",
                                                   fontSize:14, outline:"none", boxSizing:"border-box",
                                                   background: dark ? "rgba(28,42,24,0.7)" : "#f8faf6",
                                                   border:`1.5px solid ${dark ? "rgba(120,180,80,0.15)" : "#d4e4cc"}`,
                                                   color: dark ? "#edf5e0" : "#1C352D", transition:"all 0.2s" }}
                                               onFocus={e=>{e.target.style.borderColor=dark?"#78b450":"#5A7863";e.target.style.boxShadow=dark?"0 0 0 3px rgba(120,180,80,0.1)":"0 0 0 3px rgba(90,120,99,0.12)"}}
                                               onBlur={e=>{e.target.style.borderColor=dark?"rgba(120,180,80,0.15)":"#d4e4cc";e.target.style.boxShadow="none"}} />
                                        <Motion.button type="button" onClick={() => setShowPass(p=>!p)}
                                                       whileTap={{ scale:0.9 }} animate={{ rotate: showPass ? 180 : 0 }}
                                                       style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                                                           background:"transparent", border:"none", cursor:"pointer",
                                                           color: dark ? "#7a9b6a" : "#90AB8B", display:"flex", padding:2 }}>
                                            {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                                        </Motion.button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign:"right", marginBottom:18 }}>
                                <button style={{ fontSize:12, fontWeight:700, color: dark ? "#78b450" : "#5A7863",
                                    background:"none", border:"none", cursor:"pointer" }}>
                                    Forgot password?
                                </button>
                            </div>

                            <GradientBtn onClick={handleLogin} dark={dark} style={{ width:"100%", marginBottom:14 }}>
                                {success
                                    ? <><Motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring" }}><Check size={15}/></Motion.div> Redirecting...</>
                                    : loading
                                        ? <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                        : <>Sign In <ArrowRight size={14}/></>}
                            </GradientBtn>

                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                                <div style={{ flex:1, height:1, background:borderCol }} />
                                <span style={{ fontSize:11, color:textMuted, fontWeight:600 }}>or</span>
                                <div style={{ flex:1, height:1, background:borderCol }} />
                            </div>

                            {/* Google */}
                            <Motion.button whileHover={{ y:-2 }} whileTap={{ scale:0.97 }}
                                           style={{ width:"100%", padding:"11px 16px", borderRadius:12, cursor:"pointer",
                                               background: dark ? "rgba(28,42,24,0.5)" : "#fff",
                                               border:`1.5px solid ${dark ? "rgba(120,180,80,0.12)" : "#d4e4cc"}`,
                                               color:textMain, fontWeight:700, fontSize:13,
                                               display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                                               boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Continue with Google
                            </Motion.button>

                            <p style={{ textAlign:"center", fontSize:12, marginTop:16, color:textMuted }}>
                                New?{" "}
                                <button onClick={() => onSwitchMode("signup")}
                                        style={{ fontWeight:900, color: dark ? "#78b450" : "#1C352D",
                                            background:"none", border:"none", cursor:"pointer" }}>
                                    Create account →
                                </button>
                            </p>
                        </Motion.div>
                    ) : (
                        <Motion.div key="signup" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                                    exit={{ opacity:0, x:-20 }} transition={{ duration:0.22 }}>

                            <StepBar current={step} steps={STEPS} dark={dark} />

                            <AnimatePresence mode="wait">
                                <Motion.div key={step}
                                            initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}
                                            exit={{ opacity:0, x:-16 }} transition={{ duration:0.2 }}>

                                    {/* Step 0 — Role */}
                                    {step === 0 && (
                                        <div>
                                            <h3 style={{ fontWeight:900, fontSize:18, margin:"0 0 6px", color:textMain }}>
                                                Join CivicPulse — Who are you?
                                            </h3>
                                            <p style={{ fontSize:12, color:textMuted, marginBottom:16 }}>
                                                Choose your role to get started
                                            </p>
                                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                                                {[
                                                    { r:"ngo", icon:<Building2 size={22}/>, title:"NGO Coordinator", desc:"Manage needs, assign volunteers" },
                                                    { r:"vol", icon:<User size={22}/>,      title:"Volunteer",        desc:"Get matched to tasks that fit you" },
                                                ].map(opt => (
                                                    <Motion.button key={opt.r} whileTap={{ scale:0.97 }}
                                                                   onClick={() => setRole(opt.r)}
                                                                   style={{ padding:"18px 14px", borderRadius:14, cursor:"pointer",
                                                                       display:"flex", flexDirection:"column", alignItems:"center",
                                                                       gap:10, textAlign:"center", transition:"all 0.2s",
                                                                       background: role === opt.r
                                                                           ? (dark ? "rgba(120,180,80,0.12)" : "#EBF4DD")
                                                                           : (dark ? "rgba(28,42,24,0.5)" : "#f8faf6"),
                                                                       border: role === opt.r
                                                                           ? `2px solid ${dark ? "#78b450" : "#5A7863"}`
                                                                           : `2px solid ${dark ? "rgba(120,180,80,0.12)" : "#d4e4cc"}`,
                                                                       boxShadow: role === opt.r ? "0 0 0 3px rgba(90,120,99,0.12)" : "none" }}>
                                                        <div style={{ width:42, height:42, borderRadius:12,
                                                            display:"flex", alignItems:"center", justifyContent:"center",
                                                            background: role === opt.r ? (dark ? "#78b450" : "#1C352D") : (dark ? "rgba(28,42,24,0.7)" : "#e8f0e0"),
                                                            color: role === opt.r ? "#EBF4DD" : (dark ? "#7a9b6a" : "#5A7863") }}>
                                                            {opt.icon}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight:900, fontSize:13, margin:0, color:textMain }}>{opt.title}</p>
                                                            <p style={{ fontSize:10, color:textMuted, margin:"3px 0 0" }}>{opt.desc}</p>
                                                        </div>
                                                        {role === opt.r && (
                                                            <Motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                                                                        style={{ width:20, height:20, borderRadius:"50%",
                                                                            background: dark ? "#78b450" : "#1C352D",
                                                                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                                <Check size={11} color="#EBF4DD"/>
                                                            </Motion.div>
                                                        )}
                                                    </Motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 1 — Details */}
                                    {step === 1 && (
                                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                                            <h3 style={{ fontWeight:900, fontSize:17, margin:"0 0 4px", color:textMain }}>Your Details</h3>
                                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                                                <Input label="Full Name" placeholder="Priya Sharma" value={form.name} onChange={set("name")} dark={dark} />
                                                <Input label="Email" type="email" placeholder="priya@email.in" value={form.email} onChange={set("email")} dark={dark} />
                                            </div>
                                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                                                <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} dark={dark} />
                                                <Input label="City" placeholder="Mumbai" value={form.city} onChange={set("city")} dark={dark} />
                                            </div>
                                            {role === "ngo"
                                                ? <Input label="Organisation Name" placeholder="Green Horizon Foundation" value={form.org} onChange={set("org")} dark={dark} />
                                                : <Input label="Phone" placeholder="+91 98765 00001" value={form.phone} onChange={set("phone")} dark={dark} />}
                                            {/* Password strength */}
                                            {form.password && (
                                                <div>
                                                    <div style={{ display:"flex", gap:3, marginTop:4 }}>
                                                        {[0,1,2,3].map(i => (
                                                            <div key={i} style={{ flex:1, height:3, borderRadius:3, transition:"background 0.3s",
                                                                background: i < Math.min(Math.floor(form.password.length/3), 4)
                                                                    ? ["#e05a3a","#e8a020","#2dc9a0","#78b450"][Math.min(Math.floor(form.password.length/3)-1, 3)]
                                                                    : (dark ? "rgba(120,180,80,0.1)" : "#e8f0e0") }} />
                                                        ))}
                                                    </div>
                                                    <p style={{ fontSize:10, color:textMuted, marginTop:4 }}>
                                                        {["","Weak","Fair","Good","Strong"][Math.min(Math.floor(form.password.length/3), 4)]} password
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 2 — Skills */}
                                    {step === 2 && (
                                        <div>
                                            <h3 style={{ fontWeight:900, fontSize:17, margin:"0 0 4px", color:textMain }}>Skills & Availability</h3>
                                            <p style={{ fontSize:12, color:textMuted, marginBottom:12 }}>
                                                Select your skills and when you're free
                                            </p>
                                            <p style={{ fontSize:11, fontWeight:700, color:textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>Skills</p>
                                            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                                                {SKILLS_LIST.map(skill => (
                                                    <Motion.button key={skill} whileTap={{ scale:0.93 }}
                                                                   onClick={() => toggleSkill(skill)}
                                                                   style={{ padding:"6px 12px", borderRadius:8, fontSize:11, fontWeight:700,
                                                                       border:"1.5px solid", cursor:"pointer", transition:"all 0.15s",
                                                                       background: form.skills.includes(skill) ? (dark ? "#78b450" : "#1C352D") : (dark ? "rgba(28,42,24,0.7)" : "#f8faf6"),
                                                                       borderColor: form.skills.includes(skill) ? (dark ? "#78b450" : "#1C352D") : (dark ? "rgba(120,180,80,0.12)" : "#d4e4cc"),
                                                                       color: form.skills.includes(skill) ? "#EBF4DD" : (dark ? "#7a9b6a" : "#5A7863") }}>
                                                        {skill}
                                                    </Motion.button>
                                                ))}
                                            </div>
                                            <p style={{ fontSize:11, fontWeight:700, color:textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>Available Days</p>
                                            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
                                                {DAYS.map(d => (
                                                    <Motion.button key={d} whileTap={{ scale:0.9 }}
                                                                   onClick={() => toggleDay(d)}
                                                                   style={{ padding:"7px 10px", borderRadius:8, fontSize:11, fontWeight:800,
                                                                       border:"1.5px solid", cursor:"pointer", transition:"all 0.15s",
                                                                       background: form.days.includes(d) ? (dark ? "#78b450" : "#1C352D") : (dark ? "rgba(28,42,24,0.7)" : "#f8faf6"),
                                                                       borderColor: form.days.includes(d) ? (dark ? "#78b450" : "#1C352D") : (dark ? "rgba(120,180,80,0.12)" : "#d4e4cc"),
                                                                       color: form.days.includes(d) ? "#EBF4DD" : (dark ? "#7a9b6a" : "#5A7863") }}>
                                                        {d}
                                                    </Motion.button>
                                                ))}
                                            </div>
                                            <p style={{ fontSize:11, fontWeight:700, color:textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>Preferred Time</p>
                                            <PillTabs tabs={["Morning","Afternoon","Evening"]}
                                                      active={form.time} onSelect={v => setForm(p=>({...p,time:v}))} dark={dark} />
                                        </div>
                                    )}

                                    {/* Step 3 — Confirm */}
                                    {step === 3 && (
                                        <div style={{ textAlign:"center" }}>
                                            <Motion.div initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
                                                        transition={{ type:"spring", stiffness:200, damping:15 }}
                                                        style={{ width:56, height:56, borderRadius:16, margin:"0 auto 14px",
                                                            background: dark ? "#78b450" : "#1C352D",
                                                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                <Check size={24} color="#EBF4DD"/>
                                            </Motion.div>
                                            <h3 style={{ fontWeight:900, fontSize:18, margin:"0 0 4px", color:textMain }}>
                                                You're all set!
                                            </h3>
                                            <p style={{ fontSize:12, color:textMuted, marginBottom:14 }}>Review your details below</p>
                                            <div style={{ padding:14, borderRadius:14, textAlign:"left", marginBottom:14,
                                                background: dark ? "rgba(28,42,24,0.6)" : "#f8faf6",
                                                border:`1px solid ${dark ? "rgba(120,180,80,0.1)" : "#e8f0e0"}` }}>
                                                {[
                                                    ["Role", role === "ngo" ? "NGO Coordinator" : "Volunteer"],
                                                    ["Name", form.name || "—"],
                                                    ["Email", form.email || "—"],
                                                    ["Top Skills", form.skills.slice(0,3).join(", ") || "—"],
                                                ].map(([k,v]) => (
                                                    <div key={k} style={{ display:"flex", justifyContent:"space-between",
                                                        padding:"6px 0", borderBottom:`1px solid ${dark ? "rgba(120,180,80,0.08)" : "#f0f4ec"}` }}>
                                                        <span style={{ fontSize:11, color:textMuted, fontWeight:700 }}>{k}</span>
                                                        <span style={{ fontSize:11, color:textMain, fontWeight:800 }}>{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p style={{ fontSize:10, color:textMuted, marginBottom:2 }}>
                                                By creating an account you agree to our{" "}
                                                <a href="#" style={{ color: dark ? "#78b450" : "#5A7863", fontWeight:700 }}>Terms of Service</a>
                                                {" "}and{" "}
                                                <a href="#" style={{ color: dark ? "#78b450" : "#5A7863", fontWeight:700 }}>Privacy Policy</a>
                                            </p>
                                        </div>
                                    )}
                                </Motion.div>
                            </AnimatePresence>

                            {/* Nav buttons */}
                            <div style={{ display:"flex", gap:8, marginTop:18 }}>
                                {step > 0 && (
                                    <button onClick={() => setStep(s=>s-1)}
                                            style={{ padding:"10px 18px", borderRadius:10, fontSize:13, fontWeight:800,
                                                border:`1.5px solid ${dark ? "rgba(120,180,80,0.2)" : "#d4e4cc"}`,
                                                color: dark ? "#7a9b6a" : "#3B4953",
                                                background:"transparent", cursor:"pointer" }}>
                                        Back
                                    </button>
                                )}
                                <GradientBtn onClick={handleSignupNext} dark={dark}
                                             style={{ flex:1 }}
                                             className={(step===0 && !role) || loading ? "opacity-40 pointer-events-none" : ""}>
                                    {loading
                                        ? <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                        : step === STEPS.length-1
                                            ? <><Check size={14}/> Create Account</>
                                            : <>Continue <ArrowRight size={14}/></>}
                                </GradientBtn>
                            </div>

                            <p style={{ textAlign:"center", fontSize:12, marginTop:14, color:textMuted }}>
                                Already have an account?{" "}
                                <button onClick={() => onSwitchMode("login")}
                                        style={{ fontWeight:900, color: dark ? "#78b450" : "#1C352D",
                                            background:"none", border:"none", cursor:"pointer" }}>
                                    Sign in →
                                </button>
                            </p>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Motion.div>
    )
}

/* ─── AUTH MODAL ─────────────────────────────────────────────────────────── */
const AuthModal = ({ mode, onClose, onSwitch }) => (
    <Motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ position:"fixed", inset:0, zIndex:100,
                    display:"flex", alignItems:"center", justifyContent:"center", padding:16,
                    background:"rgba(10,20,10,0.65)", backdropFilter:"blur(10px)" }}
                onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:460 }}>
            <button onClick={onClose}
                    style={{ display:"flex", alignItems:"center", gap:5, marginLeft:"auto", marginBottom:12,
                        fontSize:13, fontWeight:700, color:"#EBF4DD",
                        background:"none", border:"none", cursor:"pointer" }}>
                <X size={15}/> Close
            </button>
            <AuthPanel mode={mode} onSwitchMode={onSwitch} />
        </div>
    </Motion.div>
)

/* ─── NAVBAR ─────────────────────────────────────────────────────────────── */
const Navbar = ({ onAuthClick, onNgoRegister }) => {
    const { dark, toggle } = useTheme()
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
        if (el) el.scrollIntoView({ behavior:"smooth" })
    }

    const navBg = dark
        ? scrolled ? "rgba(10,15,8,0.97)" : "rgba(10,15,8,0.85)"
        : scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.85)"

    const borderCol = dark
        ? scrolled ? "rgba(120,180,80,0.15)" : "transparent"
        : scrolled ? "rgba(90,120,99,0.15)" : "transparent"

    const textCol = dark ? "#edf5e0" : "#1C352D"
    const mutedCol = dark ? "#7a9b6a" : "#90AB8B"

    return (
        <Motion.nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:999,
            background:navBg, backdropFilter:"blur(20px)",
            borderBottom:`1px solid ${borderCol}`,
            boxShadow: scrolled ? "0 2px 30px rgba(0,0,0,0.1)" : "none",
            transition:"all 0.3s ease" }}>
            <div style={{ maxWidth:1280, margin:"0 auto", padding:"12px 24px",
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                {/* Logo */}
                <Motion.div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
                            onClick={() => scrollTo("#home")} whileHover={{ scale:1.02 }}>
                    <Motion.div animate={{ boxShadow:["0 0 0px #5A786300","0 0 18px #5A786355","0 0 0px #5A786300"] }}
                                transition={{ duration:3, repeat:Infinity }}
                                style={{ width:36, height:36, borderRadius:10, background:"#1C352D",
                                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Zap size={16} color="#EBF4DD"/>
                    </Motion.div>
                    <div>
                        <span style={{ fontWeight:900, fontSize:17, color:textCol, letterSpacing:-0.5 }}>CivicPulse</span>
                        <p style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", fontWeight:700,
                            color:mutedCol, margin:0, lineHeight:1 }}>by CivicPlus</p>
                    </div>
                </Motion.div>

                {/* Desktop Nav */}
                <div style={{ display:"flex", alignItems:"center", gap:28 }} className="hidden md:flex">
                    {NAV_LINKS.map(link => (
                        <button key={link.label} onClick={() => scrollTo(link.href)}
                                style={{ fontSize:13, fontWeight:700, color:mutedCol, opacity:0.85,
                                    background:"none", border:"none", cursor:"pointer", transition:"all 0.2s" }}
                                onMouseEnter={e=>{e.currentTarget.style.color=textCol;e.currentTarget.style.opacity="1"}}
                                onMouseLeave={e=>{e.currentTarget.style.color=mutedCol;e.currentTarget.style.opacity="0.85"}}>
                            {link.label}
                        </button>
                    ))}
                    <button onClick={onNgoRegister}
                            style={{ fontSize:13, fontWeight:700, color: dark ? "#78b450" : "#5A7863",
                                display:"flex", alignItems:"center", gap:5,
                                background:"none", border:"none", cursor:"pointer", transition:"color 0.2s" }}
                            onMouseEnter={e=>e.currentTarget.style.color=textCol}
                            onMouseLeave={e=>e.currentTarget.style.color=dark?"#78b450":"#5A7863"}>
                        <Building2 size={13}/> Register NGO
                    </button>
                </div>

                {/* Right side */}
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <DayNightToggle dark={dark} onToggle={toggle} small />

                    <div className="hidden md:flex" style={{ gap:8, display:"flex", alignItems:"center" }}>
                        <GradientBtn onClick={() => onAuthClick("login")} dark={dark} outline small>
                            Sign In
                        </GradientBtn>
                        <GradientBtn onClick={() => onAuthClick("signup")} dark={dark} small>
                            Join Free <Zap size={12}/>
                        </GradientBtn>
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMobileOpen(p=>!p)} className="flex md:hidden"
                            style={{ width:34, height:34, borderRadius:8, background:"transparent",
                                border:`1px solid ${dark?"rgba(120,180,80,0.2)":"#d4e4cc"}`,
                                color:textCol, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                        {mobileOpen ? <X size={16}/> : <Menu size={16}/>}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <Motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                                exit={{ opacity:0, height:0 }}
                                style={{ borderTop:`1px solid ${dark?"rgba(120,180,80,0.12)":"#e8f0e0"}`,
                                    background: dark ? "#0a0f08" : "#fff", overflow:"hidden" }}>
                        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
                            {NAV_LINKS.map(l => (
                                <button key={l.label} onClick={() => scrollTo(l.href)}
                                        style={{ textAlign:"left", fontSize:14, fontWeight:700, color:textCol,
                                            background:"none", border:"none", cursor:"pointer", padding:0 }}>
                                    {l.label}
                                </button>
                            ))}
                            <div style={{ display:"flex", gap:8, paddingTop:8,
                                borderTop:`1px solid ${dark?"rgba(120,180,80,0.1)":"#e8f0e0"}` }}>
                                <GradientBtn onClick={() => { onAuthClick("login"); setMobileOpen(false) }} dark={dark} outline small>Sign In</GradientBtn>
                                <GradientBtn onClick={() => { onAuthClick("signup"); setMobileOpen(false) }} dark={dark} small>Join Free</GradientBtn>
                            </div>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </Motion.nav>
    )
}

/* ─── HERO SECTION ───────────────────────────────────────────────────────── */
const HeroSection = ({ onAuthClick }) => {
    const { dark } = useTheme()
    const { scrollY } = useScroll()
    const yPan = useTransform(scrollY, [0,500], [0,-80])
    const rightBg = dark ? "#0a0f08" : "#f0f4ec"

    return (
        <section id="home" style={{ minHeight:"100vh", display:"flex", overflow:"hidden",
            background:rightBg, position:"relative" }}>
            <BgParticles dark={dark} />

            {/* LEFT — dark panel (always dark) */}
            <Motion.div style={{ y:yPan, background:"#1C352D", width:"52%",
                display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}
                        className="hidden lg:flex">
                {/* Orbs */}
                <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", pointerEvents:"none",
                    background:"radial-gradient(circle, #5A7863 0%, transparent 70%)",
                    opacity:0.18, top:-120, left:-100, filter:"blur(70px)" }} />
                <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", pointerEvents:"none",
                    background:"radial-gradient(circle, #90AB8B 0%, transparent 70%)",
                    opacity:0.12, bottom:0, right:-80, filter:"blur(70px)" }} />
                {/* Dot grid */}
                <div style={{ position:"absolute", inset:0, pointerEvents:"none",
                    backgroundImage:"radial-gradient(circle, rgba(90,120,99,0.18) 1px, transparent 1px)",
                    backgroundSize:"26px 26px" }} />

                <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column",
                    height:"100%", padding:"48px 48px 40px", gap:24, paddingTop:112 }}>
                    {/* Logo */}
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <Motion.div animate={{ boxShadow:["0 0 0px #5A786300","0 0 24px #5A786366","0 0 0px #5A786300"] }}
                                    transition={{ duration:3, repeat:Infinity }}
                                    style={{ width:44, height:44, borderRadius:14, background:"#5f887f",
                                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Zap size={20} color="#EBF4DD"/>
                        </Motion.div>
                        <div>
                            <span style={{ fontWeight:900, fontSize:20, color:"#EBF4DD" }}>CivicPulse</span>
                            <p style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase",
                                color:"#90AB8B", margin:0, fontWeight:700 }}>by CivicPlus</p>
                        </div>
                    </div>

                    {/* Graph box */}
                    <Motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                                transition={{ delay:0.3, duration:0.7 }}
                                style={{ borderRadius:20, border:"1px solid rgba(90,120,99,0.3)",
                                    padding:"16px", background:"rgba(236,243,237,0.06)",
                                    backdropFilter:"blur(8px)" }}>
                        <p style={{ fontSize:9, fontWeight:800, letterSpacing:3, textTransform:"uppercase",
                            color:"#90AB8B", marginBottom:12 }}>
                            🟢 Live Coordination Network
                        </p>
                        <AnimatedGraph />
                    </Motion.div>

                    {/* Tagline */}
                    <Motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                                transition={{ delay:0.4 }}>
                        <h2 style={{ fontWeight:900, fontSize:26, lineHeight:1.3, marginBottom:8, color:"#EBF4DD" }}>
                            Turning scattered data<br/>into community action
                        </h2>
                        <p style={{ fontSize:13, lineHeight:1.6, color:"#90AB8B", margin:0 }}>
                            The only platform that closes the full loop — from paper survey to volunteer deployed to donor notified.
                        </p>
                    </Motion.div>

                    {/* Feature pills */}
                    <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:"auto" }}>
                        {[
                            { icon:"⚡", t:"AI Urgency Scoring",    d:"Every need scored in real-time",         delay:0.5 },
                            { icon:"🎯", t:"Smart Volunteer Match",  d:"6-factor algorithm, zero manual calls",  delay:0.65 },
                            { icon:"📊", t:"Live Impact Dashboard",  d:"Donors see contributions in real-time",  delay:0.8 },
                        ].map(f => (
                            <Motion.div key={f.t} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                                        transition={{ delay:f.delay }}
                                        style={{ display:"flex", alignItems:"center", gap:12, borderRadius:12, padding:"10px 13px",
                                            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)" }}>
                                <div style={{ width:32, height:32, borderRadius:9, fontSize:14, flexShrink:0,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    background:"rgba(90,120,99,0.28)" }}>{f.icon}</div>
                                <div>
                                    <p style={{ fontSize:12, fontWeight:800, color:"#EBF4DD", margin:0 }}>{f.t}</p>
                                    <p style={{ fontSize:10, color:"#90AB8B", margin:0 }}>{f.d}</p>
                                </div>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </Motion.div>

            {/* RIGHT — CTA panel */}
            <div style={{ flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                padding:"24px 24px 24px", paddingTop:100, position:"relative", zIndex:10 }}>
                <div style={{ position:"absolute", inset:0, pointerEvents:"none",
                    backgroundImage:`radial-gradient(circle, ${dark?"rgba(120,180,80,0.1)":"rgba(90,120,99,0.1)"} 1px, transparent 1px)`,
                    backgroundSize:"28px 28px" }} />

                <Motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
                            transition={{ duration:0.7 }}
                            style={{ width:"100%", maxWidth:460, position:"relative", zIndex:10 }}>

                    {/* Mobile logo */}
                    <div className="flex lg:hidden" style={{ alignItems:"center", gap:10, marginBottom:28 }}>
                        <div style={{ width:34, height:34, borderRadius:9, background:"#1C352D",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Zap size={15} color="#EBF4DD"/>
                        </div>
                        <span style={{ fontWeight:900, fontSize:18, color: dark ? "#edf5e0" : "#1C352D" }}>CivicPulse</span>
                    </div>

                    {/* Badge */}
                    <Motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                                transition={{ delay:0.2 }}
                                style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 14px",
                                    borderRadius:99, fontSize:10, fontWeight:800, letterSpacing:1.5,
                                    textTransform:"uppercase", marginBottom:16,
                                    background: dark ? "rgba(120,180,80,0.12)" : "#EBF4DD",
                                    color: dark ? "#78b450" : "#3B4953",
                                    border: `1px solid ${dark?"rgba(120,180,80,0.2)":"rgba(90,120,99,0.2)"}` }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:"#5A7863", animation:"pulse 2s infinite" }} />
                        Community Platform · India
                    </Motion.div>

                    <h1 style={{ fontWeight:900, fontSize:42, lineHeight:1.15, marginBottom:12,
                        color: dark ? "#edf5e0" : "#1C352D", letterSpacing:-1 }}>
                        Make real<br/>community impact
                    </h1>
                    <p style={{ fontSize:14, marginBottom:28, lineHeight:1.65, color: dark ? "#7a9b6a" : "#5A7863" }}>
                        Join 2,400+ volunteers and 180+ NGOs already using CivicPulse to coordinate relief, track needs, and close the loop.
                    </p>

                    {/* Buttons */}
                    <div style={{ display:"flex", gap:12, marginBottom:28, flexWrap:"wrap" }}>
                        <GradientBtn onClick={() => onAuthClick("login")} dark={dark} style={{ flex:1 }}>
                            Sign In <ArrowRight size={14}/>
                        </GradientBtn>
                        <GradientBtn onClick={() => onAuthClick("signup")} dark={dark} outline style={{ flex:1 }}>
                            Join Free <Zap size={14}/>
                        </GradientBtn>
                    </div>

                    {/* Stat cards */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        {STATS.map((s, i) => (
                            <Motion.div key={s.label}
                                        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                                        transition={{ delay:0.5 + i*0.1 }}>
                                <StatCard stat={s} dark={dark} />
                            </Motion.div>
                        ))}
                    </div>
                </Motion.div>
            </div>
        </section>
    )
}

/* ─── ABOUT SECTION ─────────────────────────────────────────────────────── */
const AboutSection = () => {
    const { dark } = useTheme()
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({ target:ref, offset:["start end","end start"] })
    const y = useTransform(scrollYProgress, [0,1], [40,-40])

    const sectionBg = dark ? "#1C352D" : "#f7fbf5"
    const titleCol = dark ? "#EBF4DD" : "#1C352D"
    const descCol = dark ? "#90AB8B" : "#4B6457"

    return (
        <section id="about" ref={ref} style={{ padding:"112px 0", position:"relative", overflow:"hidden", background:sectionBg }}>
            <div style={{ position:"absolute", inset:0, pointerEvents:"none",
                backgroundImage:"radial-gradient(circle, rgba(90,120,99,0.14) 1px, transparent 1px)",
                backgroundSize:"32px 32px" }} />
            <Motion.div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", pointerEvents:"none",
                background:"radial-gradient(circle, #5A7863 0%, transparent 70%)",
                opacity:0.07, filter:"blur(90px)", top:-200, right:-200, y }} />

            <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px", position:"relative", zIndex:10 }}>
                {/* Header */}
                <Motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} transition={{ duration:0.6 }}
                            style={{ textAlign:"center", marginBottom:72 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"8px 18px",
                        borderRadius:99, fontSize:10, fontWeight:800, letterSpacing:2,
                        textTransform:"uppercase", marginBottom:20,
                        background:"rgba(90,120,99,0.18)", color:"#90AB8B",
                        border:"1px solid rgba(90,120,99,0.3)" }}>
                        <Zap size={11}/> What is CivicPulse
                    </div>
                    <h2 style={{ fontWeight:900, fontSize:46, lineHeight:1.15, marginBottom:20, color:titleCol, letterSpacing:-1 }}>
                        One platform.<br/>Entire relief loop closed.
                    </h2>
                    <p style={{ fontSize:17, maxWidth:600, margin:"0 auto", lineHeight:1.7, color:descCol }}>
                        CivicPulse is an AI-powered coordination engine connecting community needs, NGO coordinators, volunteers, and donors on a single transparent platform.
                    </p>
                </Motion.div>

                {/* Feature grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:18 }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f,i) => (
                        <Motion.div key={f.title}
                                    initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                                    viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }}
                                    whileHover={{ y:-5, transition:{ duration:0.2 } }}
                                    style={{ borderRadius:20, padding:24, cursor:"default", transition:"background 0.2s",
                                        background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)",
                                        border:`1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(90,120,99,0.15)"}` }}
                                    onMouseEnter={e=>e.currentTarget.style.background=dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,1)"}
                                    onMouseLeave={e=>e.currentTarget.style.background=dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)"}>
                            <div style={{ width:44, height:44, borderRadius:12, display:"flex",
                                alignItems:"center", justifyContent:"center", marginBottom:16,
                                background:`${f.color}28`, color:f.color }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontWeight:900, fontSize:15, marginBottom:8, color: dark ? "#EBF4DD" : "#1C352D" }}>{f.title}</h3>
                            <p style={{ fontSize:13, lineHeight:1.65, color: dark ? "#7A9B83" : "#4B6457", margin:0 }}>{f.desc}</p>
                        </Motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <Motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} transition={{ delay:0.4 }}
                            style={{ marginTop:64, borderRadius:24, padding:"40px", textAlign:"center",
                                background:"rgba(90,120,99,0.1)", border:"1px solid rgba(90,120,99,0.22)" }}>
                    <p style={{ fontWeight:900, fontSize:24, marginBottom:12, color: dark ? "#EBF4DD" : "#1C352D" }}>
                        Built for India's civic ecosystem
                    </p>
                    <p style={{ fontSize:14, marginBottom:24, maxWidth:520, margin:"0 auto 24px", color: dark ? "#90AB8B" : "#4B6457" }}>
                        From coastal disaster response to urban slum nutrition drives — CivicPulse scales with every kind of community need.
                    </p>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
                        {["NGO Coordinators","Field Volunteers","Donors & Funders","Government Bodies"].map(tag => (
                            <span key={tag} style={{ padding:"7px 16px", borderRadius:99, fontSize:11, fontWeight:700,
                                background:"rgba(90,120,99,0.22)", color: dark ? "#90AB8B" : "#3B5C38",
                                border:"1px solid rgba(90,120,99,0.3)" }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </Motion.div>
            </div>
        </section>
    )
}

/* ─── 3D NGO CAROUSEL ────────────────────────────────────────────────────── */
const NGOSection = ({ onNgoRegister }) => {
    const { dark } = useTheme()
    const sectionBg = dark ? "#0a0f08" : "#f0f4ec"
    const quantity = NGOS.length
    const cardW = 170, cardH = 240
    const translateZ = Math.round((cardW + cardH) * 0.72)

    const carouselStyle = `
        @keyframes rotateCarousel {
            from { transform: perspective(1200px) rotateX(-12deg) rotateY(0deg); }
            to   { transform: perspective(1200px) rotateX(-12deg) rotateY(-360deg); }
        }
        .ngo-ring {
            animation: rotateCarousel 32s linear infinite;
            transform-style: preserve-3d;
            position: relative;
            width: ${cardW}px;
            height: ${cardH}px;
            margin: 0 auto;
        }
        @media (max-width: 1100px) {
            .ngo-ring { animation-duration: 38s; }
        }
        @media (max-width: 760px) {
            .ngo-ring {
                width: 140px;
                height: 205px;
            }
        }
        .ngo-ring:hover { animation-play-state: paused; }
        .ngo-card-3d {
            position: absolute;
            width: ${cardW}px;
            height: ${cardH}px;
            border-radius: 20px;
            overflow: hidden;
            top: 0; left: 0;
            backface-visibility: hidden;
        }
    `

    return (
        <section id="ngos" style={{ padding:"96px 0", position:"relative", overflow:"hidden", background:sectionBg }}>
            <style>{carouselStyle}</style>
            <BgParticles dark={dark} />

            <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px", position:"relative", zIndex:10 }}>
                <Motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} style={{ textAlign:"center", marginBottom:64 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 16px",
                        borderRadius:99, fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:18,
                        background: dark ? "rgba(120,180,80,0.1)" : "#EBF4DD",
                        color: dark ? "#78b450" : "#5A7863",
                        border: `1px solid ${dark?"rgba(120,180,80,0.2)":"#d4e4cc"}` }}>
                        <Building2 size={11}/> Registered NGOs
                    </div>
                    <h2 style={{ fontWeight:900, fontSize:42, marginBottom:14, letterSpacing:-1,
                        color: dark ? "#edf5e0" : "#1C352D" }}>
                        NGOs making change happen
                    </h2>
                    <p style={{ fontSize:16, maxWidth:480, margin:"0 auto", color: dark ? "#7a9b6a" : "#5A7863", lineHeight:1.65 }}>
                        Verified organisations across India, actively coordinating real-world impact through CivicPulse.
                    </p>
                </Motion.div>

                {/* 3D Carousel */}
                <div style={{ display:"flex", justifyContent:"center", marginBottom:30 }}>
                    <div style={{ perspective:1200, perspectiveOrigin:"50% 48%", height:cardH + 130, width:"100%", maxWidth:900, overflow:"visible" }}>
                        <div className="ngo-ring"
                             style={{ marginTop:56, transformStyle:"preserve-3d" }}>
                            {NGOS.map((ngo, idx) => {
                                const angle = (360 / quantity) * idx
                                const rgb = ngo.colorCard
                                return (
                                    <div key={ngo.name} className="ngo-card-3d"
                                         style={{ transform:`rotateY(${angle}deg) translateZ(${translateZ}px)`,
                                             background: `linear-gradient(160deg, rgb(${rgb}) 0%, rgba(${rgb},0.7) 100%)`,
                                             border:`1px solid rgba(255,255,255,0.15)`,
                                             boxShadow:`0 20px 60px rgba(0,0,0,0.35)` }}>
                                        {/* Gradient strip */}
                                        <div style={{ height:6,
                                            background:"linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))" }} />
                                        <div style={{ padding:16, display:"flex", flexDirection:"column", height:"calc(100% - 6px)" }}>
                                            {/* Avatar */}
                                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                                                <div style={{ width:46, height:46, borderRadius:14,
                                                    background:"rgba(255,255,255,0.2)", backdropFilter:"blur(8px)",
                                                    display:"flex", alignItems:"center", justifyContent:"center",
                                                    fontWeight:900, fontSize:16, color:"#fff",
                                                    border:"1.5px solid rgba(255,255,255,0.3)" }}>
                                                    {ngo.avatar}
                                                </div>
                                                {ngo.verified && (
                                                    <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 8px",
                                                        borderRadius:8, fontSize:9, fontWeight:800,
                                                        background:"rgba(255,255,255,0.2)", color:"#fff" }}>
                                                        <Shield size={8}/> Verified
                                                    </div>
                                                )}
                                            </div>

                                            <p style={{ fontWeight:900, fontSize:13, color:"#fff", marginBottom:3, lineHeight:1.3 }}>{ngo.name}</p>
                                            <p style={{ fontSize:10, color:"rgba(255,255,255,0.75)",
                                                marginBottom:10, display:"flex", alignItems:"center", gap:3 }}>
                                                <MapPin size={9}/> {ngo.city}
                                            </p>

                                            {/* Badge row */}
                                            <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
                                                <span style={{ fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:6,
                                                    background:"rgba(255,255,255,0.25)", color:"#fff" }}>{ngo.badge}</span>
                                                <span style={{ fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:6,
                                                    background:"rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.9)" }}>{ngo.focus}</span>
                                            </div>

                                            <p style={{ fontSize:10, color:"rgba(255,255,255,0.75)", lineHeight:1.5,
                                                marginBottom:10, flex:1, overflow:"hidden",
                                                display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>
                                                {ngo.desc}
                                            </p>

                                            {/* Stats */}
                                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5, marginBottom:10 }}>
                                                {[{l:"Volunteers",v:ngo.volunteers},{l:"Needs",v:ngo.needs},{l:"Rating",v:`${ngo.rating}★`}].map(s => (
                                                    <div key={s.l} style={{ textAlign:"center", padding:"5px 4px", borderRadius:8,
                                                        background:"rgba(255,255,255,0.15)" }}>
                                                        <p style={{ fontWeight:900, fontSize:11, color:"#fff", margin:0 }}>{s.v}</p>
                                                        <p style={{ fontSize:8, color:"rgba(255,255,255,0.7)", margin:0 }}>{s.l}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* CTA */}
                                            <button style={{ width:"100%", padding:"8px", borderRadius:10, fontSize:11, fontWeight:800,
                                                background:"rgba(255,255,255,0.22)", color:"#fff",
                                                border:"1.5px solid rgba(255,255,255,0.3)", cursor:"pointer",
                                                display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                                                View NGO <ChevronRight size={11}/>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <p style={{ textAlign:"center", fontSize:11, color: dark ? "#4a6b3a" : "#90AB8B", marginBottom:32 }}>
                    ↙ Hover the carousel to pause · {quantity} verified NGOs shown
                </p>

                {/* Register CTA */}
                <Motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} transition={{ delay:0.3 }}
                            style={{ textAlign:"center" }}>
                    <GradientBtn onClick={onNgoRegister} dark={dark} style={{ margin:"0 auto" }}>
                        <Building2 size={16}/> Register your NGO <ArrowRight size={14}/>
                    </GradientBtn>
                    <p style={{ fontSize:11, marginTop:12, color: dark ? "#4a6b3a" : "#90AB8B" }}>
                        Free to register · Verified within 48 hours · Instant access to volunteer pool
                    </p>
                </Motion.div>
            </div>
        </section>
    )
}

/* ─── CONTACT SECTION ────────────────────────────────────────────────────── */
const ContactSection = () => {
    const { dark } = useTheme()
    const [formState, setFormState] = useState({ name:"", email:"", subject:"", message:"" })
    const [sent, setSent] = useState(false)

    const handleSubmit = () => {
        if (!formState.name || !formState.email || !formState.message) return
        setSent(true)
    }

    const sectionBg = dark ? "linear-gradient(180deg, #1C352D 0%, #142820 100%)" : "linear-gradient(180deg, #f2f7ef 0%, #e9f2e4 100%)"
    const titleCol = dark ? "#EBF4DD" : "#1C352D"
    const mutedCol = dark ? "#90AB8B" : "#4B6457"
    const cardBg = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)"
    const cardBorder = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(90,120,99,0.18)"

    const inputStyle = {
        width:"100%", borderRadius:11, padding:"11px 14px", fontSize:13, outline:"none",
        boxSizing:"border-box", resize:"none",
        background: dark ? "rgba(255,255,255,0.07)" : "#ffffff", border: dark ? "1.5px solid rgba(255,255,255,0.11)" : "1.5px solid #cfe0c4",
        color: dark ? "#EBF4DD" : "#1C352D", transition:"all 0.2s",
    }
    const labelStyle = { fontSize:11, fontWeight:800, color:mutedCol,
        textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }

    return (
        <section id="contact" style={{ padding:"96px 0", position:"relative", overflow:"hidden",
            background:sectionBg }}>
            <div style={{ position:"absolute", inset:0, pointerEvents:"none",
                backgroundImage:"radial-gradient(circle, rgba(90,120,99,0.09) 1px, transparent 1px)",
                backgroundSize:"30px 30px" }} />

            <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", position:"relative", zIndex:10 }}>
                <Motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                            viewport={{ once:true }} style={{ textAlign:"center", marginBottom:64 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 16px",
                        borderRadius:99, fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:18,
                        background:"rgba(90,120,99,0.18)", color:"#90AB8B",
                        border:"1px solid rgba(90,120,99,0.28)" }}>
                        <MessageSquare size={11}/> Get in touch
                    </div>
                    <h2 style={{ fontWeight:900, fontSize:42, marginBottom:14, color:titleCol, letterSpacing:-1 }}>
                        Let's build something<br/>meaningful together
                    </h2>
                    <p style={{ fontSize:16, maxWidth:480, margin:"0 auto", color:mutedCol, lineHeight:1.65 }}>
                        Partner with us, register your NGO, or just say hello — we're always around.
                    </p>
                </Motion.div>

                <div style={{ display:"grid", gridTemplateColumns:"2fr 3fr", gap:32 }} className="grid-cols-1 lg:grid-cols-5">
                    {/* Info cards */}
                    <Motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }}
                                viewport={{ once:true }} transition={{ duration:0.5 }}
                                style={{ display:"flex", flexDirection:"column", gap:14 }}>
                        {[
                            { icon:<MapPin size={17}/>,    label:"Location",      value:"Pune, Maharashtra, India" },
                            { icon:<Mail size={17}/>,      label:"Email",         value:"hello@civicpulse.in" },
                            { icon:<Phone size={17}/>,     label:"Phone",         value:"+91 98765 00001" },
                            { icon:<Globe size={17}/>,     label:"Website",       value:"civicpulse.in" },
                            { icon:<Clock size={17}/>,     label:"Response time", value:"Within 24 hours" },
                        ].map(info => (
                            <Motion.div key={info.label} whileHover={{ x:4 }}
                                        style={{ display:"flex", alignItems:"center", gap:14, borderRadius:16, padding:"14px 16px",
                                            background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.75)",
                                            border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(90,120,99,0.18)" }}>
                                <div style={{ width:38, height:38, borderRadius:10, flexShrink:0,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    background:"rgba(90,120,99,0.22)", color: dark ? "#90AB8B" : "#3B5C38" }}>
                                    {info.icon}
                                </div>
                                <div>
                                    <p style={{ fontSize:9, fontWeight:800, textTransform:"uppercase",
                                        letterSpacing:1.2, color:"#5A7863", margin:0 }}>{info.label}</p>
                                    <p style={{ fontSize:13, fontWeight:700, color: dark ? "#EBF4DD" : "#1C352D", margin:"3px 0 0" }}>{info.value}</p>
                                </div>
                            </Motion.div>
                        ))}
                    </Motion.div>

                    {/* Form */}
                    <Motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }}
                                viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
                                style={{ borderRadius:24, padding:32,
                                    background:cardBg, border:cardBorder }}>
                        <AnimatePresence mode="wait">
                            {sent ? (
                                <Motion.div key="sent" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                                            style={{ display:"flex", flexDirection:"column", alignItems:"center",
                                                justifyContent:"center", height:280, textAlign:"center" }}>
                                    <Motion.div initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }}
                                                transition={{ type:"spring", stiffness:200, damping:15 }}
                                                style={{ width:64, height:64, borderRadius:20, background:"#5A7863",
                                                    display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                                        <Check size={28} color="#EBF4DD"/>
                                    </Motion.div>
                                    <h3 style={{ fontWeight:900, fontSize:22, marginBottom:8, color: dark ? "#EBF4DD" : "#1C352D" }}>Message sent!</h3>
                                    <p style={{ fontSize:13, color:mutedCol, marginBottom:20 }}>
                                        We'll get back to you within 24 hours.
                                    </p>
                                    <button onClick={() => { setSent(false); setFormState({name:"",email:"",subject:"",message:""}) }}
                                            style={{ fontSize:12, fontWeight:800, color:"#5A7863",
                                                background:"none", border:"none", cursor:"pointer" }}>
                                        Send another →
                                    </button>
                                </Motion.div>
                            ) : (
                                <Motion.div key="form" style={{ display:"flex", flexDirection:"column", gap:16 }}>
                                    <div>
                                        <h3 style={{ fontWeight:900, fontSize:20, marginBottom:4, color:"#EBF4DD" }}>Send us a message</h3>
                                        <p style={{ fontSize:13, color:"#90AB8B", margin:0 }}>NGO registration, partnership, or general inquiry</p>
                                    </div>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                        <div>
                                            <label style={labelStyle}>Name</label>
                                            <input value={formState.name}
                                                   onChange={e=>setFormState(p=>({...p,name:e.target.value}))}
                                                   placeholder="Your name" style={inputStyle}
                                                   onFocus={e=>e.target.style.borderColor="#5A7863"}
                                                   onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.11)"} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Email</label>
                                            <input value={formState.email} type="email"
                                                   onChange={e=>setFormState(p=>({...p,email:e.target.value}))}
                                                   placeholder="you@email.com" style={inputStyle}
                                                   onFocus={e=>e.target.style.borderColor="#5A7863"}
                                                   onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.11)"} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Subject</label>
                                        <select value={formState.subject}
                                                onChange={e=>setFormState(p=>({...p,subject:e.target.value}))}
                                                style={{ ...inputStyle, cursor:"pointer" }}>
                                            <option value="" style={{ background:"#1C352D" }}>Choose a topic</option>
                                            <option value="ngo" style={{ background:"#1C352D" }}>NGO Registration</option>
                                            <option value="volunteer" style={{ background:"#1C352D" }}>Volunteer Inquiry</option>
                                            <option value="partnership" style={{ background:"#1C352D" }}>Partnership</option>
                                            <option value="other" style={{ background:"#1C352D" }}>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Message</label>
                                        <textarea rows={4} value={formState.message}
                                                  onChange={e=>setFormState(p=>({...p,message:e.target.value}))}
                                                  placeholder="Tell us about your project, NGO, or inquiry..."
                                                  style={inputStyle}
                                                  onFocus={e=>e.target.style.borderColor="#5A7863"}
                                                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.11)"} />
                                    </div>
                                    <GradientBtn onClick={handleSubmit} dark={dark} style={{ width:"100%" }}>
                                        <Send size={14}/> Send Message
                                    </GradientBtn>
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </Motion.div>
                </div>
            </div>
        </section>
    )
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */
const Footer = () => {
    const { dark } = useTheme()
    const footerBg = dark ? "#0D1F19" : "#e7efe3"
    const brandText = dark ? "#EBF4DD" : "#1C352D"
    const muted = dark ? "#5A7863" : "#4B6457"
    const surface = dark ? "rgba(90,120,99,0.15)" : "rgba(90,120,99,0.12)"
    return (
        <footer style={{ background:footerBg }}>
            <div style={{ maxWidth:1280, margin:"0 auto", padding:"64px 24px 32px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                            <div style={{ width:36, height:36, borderRadius:10, background:"#5A7863",
                                display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <Zap size={15} color="#EBF4DD"/>
                            </div>
                            <div>
                                <span style={{ fontWeight:900, fontSize:16, color:brandText }}>CivicPulse</span>
                                <p style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase",
                                    color:muted, margin:0, fontWeight:700 }}>by CivicPlus</p>
                            </div>
                        </div>
                        <p style={{ fontSize:13, lineHeight:1.65, color:muted, marginBottom:20 }}>
                            AI-powered community coordination. Turning scattered civic data into real action — across India and beyond.
                        </p>

                        {/* Social links — layered reveal */}
                        <div style={{ display:"flex", gap:8 }}>
                            {[
                                { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, color:"#1da1f2", label:"Twitter" },
                                { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, color:"#e1306c", label:"Instagram" },
                                { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>, color:"#7289da", label:"Discord" },
                            ].map((s, i) => (
                                    <Motion.a key={i} href="#"
                                              whileHover={{ scale:1.1, y:-3 }}
                                              style={{ width:34, height:34, borderRadius:10,
                                                  display:"flex", alignItems:"center", justifyContent:"center",
                                                  background: surface,
                                                  color: dark ? "#90AB8B" : "#4B6457",
                                                  border:`1px solid ${dark ? "rgba(90,120,99,0.2)" : "rgba(90,120,99,0.24)"}`,
                                                  transition:"all 0.2s" }}
                                              onMouseEnter={e => {
                                                  e.currentTarget.style.background = `${s.color}30`
                                                  e.currentTarget.style.color = s.color
                                                  e.currentTarget.style.borderColor = `${s.color}55`
                                              }}
                                              onMouseLeave={e => {
                                                  e.currentTarget.style.background = surface
                                                  e.currentTarget.style.color = dark ? "#90AB8B" : "#4B6457"
                                                  e.currentTarget.style.borderColor = dark ? "rgba(90,120,99,0.2)" : "rgba(90,120,99,0.24)"
                                              }}>
                                        {s.icon}
                                    </Motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {[
                        { title:"Platform", links:["How it works","NGO Dashboard","Volunteer App","Donor Portal","AI Features"] },
                        { title:"Company",  links:["About Us","Blog","Press","Careers","Partners"] },
                        { title:"Legal",    links:["Privacy Policy","Terms of Service","Cookie Policy","Data Protection"] },
                    ].map(col => (
                        <div key={col.title}>
                            <p style={{ fontSize:10, fontWeight:900, textTransform:"uppercase",
                                letterSpacing:2, color:brandText, marginBottom:16 }}>{col.title}</p>
                            <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:10 }}>
                                {col.links.map(l => (
                                    <li key={l}>
                                        <a href="#" style={{ fontSize:13, color:muted, textDecoration:"none", transition:"color 0.2s" }}
                                           onMouseEnter={e=>e.currentTarget.style.color=dark?"#90AB8B":"#1C352D"}
                                           onMouseLeave={e=>e.currentTarget.style.color=muted}>
                                            {l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{ paddingTop:24, display:"flex", flexDirection:"row",
                    alignItems:"center", justifyContent:"space-between", gap:14, flexWrap:"wrap",
                    borderTop:"1px solid rgba(90,120,99,0.18)" }}>
                    <p style={{ fontSize:12, color:muted, margin:0 }}>
                        © {new Date().getFullYear()} CivicPulse by CivicPlus. Built for India's communities.
                    </p>
                    <div style={{ display:"flex", gap:20 }}>
                        {["Privacy","Terms","Cookies"].map(l => (
                            <a key={l} href="#" style={{ fontSize:12, color:muted, textDecoration:"none", transition:"color 0.2s" }}
                               onMouseEnter={e=>e.currentTarget.style.color=dark?"#5A7863":"#1C352D"}
                               onMouseLeave={e=>e.currentTarget.style.color=muted}>
                                {l}
                            </a>
                        ))}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:"#5A7863", animation:"pulse 2s infinite" }} />
                        <span style={{ fontSize:12, color:muted }}>All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

/* ─── SCROLL TO TOP ──────────────────────────────────────────────────────── */
const ScrollTop = () => {
    const { dark } = useTheme()
    const { scrollYProgress } = useScroll()
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const unsub = scrollYProgress.on("change", v => setVisible(v > 0.2))
        return unsub
    }, [scrollYProgress])
    return (
        <AnimatePresence>
            {visible && (
                <Motion.button initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                               exit={{ opacity:0, scale:0.8 }}
                               onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
                               whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
                               style={{ position:"fixed", bottom:32, right:32, zIndex:50,
                                   width:42, height:42, borderRadius:12,
                                   background: dark ? "#78b450" : "#1C352D", color:"#EBF4DD",
                                   border:"none", cursor:"pointer", display:"flex",
                                   alignItems:"center", justifyContent:"center",
                                   boxShadow:"0 8px 24px rgba(0,0,0,0.25)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 15l-6-6-6 6"/>
                    </svg>
                </Motion.button>
            )}
        </AnimatePresence>
    )
}

/* ─── ROOT COMPONENT ─────────────────────────────────────────────────────── */
const LandingPage = () => {
    const [dark,      setDark]     = useState(false)
    const [authMode,  setAuthMode]  = useState(null)
    const [ngoModal,  setNgoModal]  = useState(false)
    const location = useLocation()

    const routeAuthMode = location.state?.openAuth ?? null

    useEffect(() => {
        if (routeAuthMode) {
            window.history.replaceState({}, "")
        }
    }, [routeAuthMode])

    useEffect(() => {
        document.body.style.background = dark ? "#0a0f08" : "#f0f4ec"
        document.body.style.transition = "background 0.4s ease"
    }, [dark])

    const toggle = () => setDark(p => !p)

    return (
        <ThemeContext.Provider value={{ dark, toggle }}>
            <div style={{ fontFamily:'"DM Sans", system-ui, sans-serif', transition:"background 0.4s" }}>
                <Navbar onAuthClick={m => setAuthMode(m)} onNgoRegister={() => setNgoModal(true)} />

                <AnimatePresence>
                    {(authMode ?? routeAuthMode) && <AuthModal mode={(authMode ?? routeAuthMode)} onClose={() => setAuthMode(null)} onSwitch={m => setAuthMode(m)} />}
                </AnimatePresence>

                <AnimatePresence>
                    {ngoModal && <NgoRegisterModal onClose={() => setNgoModal(false)} />}
                </AnimatePresence>

                <HeroSection onAuthClick={m => setAuthMode(m)} />
                <AboutSection />
                <NGOSection onNgoRegister={() => setNgoModal(true)} />
                <ContactSection />
                <Footer />
                <ScrollTop />
            </div>
        </ThemeContext.Provider>
    )
}

export default LandingPage
