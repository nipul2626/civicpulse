import { useState, useEffect } from "react"
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet"
import { motion, AnimatePresence } from "framer-motion"
import { NavLink, useNavigate } from "react-router-dom"
import L from "leaflet"
import {
    Search, Plus, X, Users, AlertTriangle,
    CheckCircle, MapPin, Zap, Activity, DropletIcon,
    BookOpen, Home, Utensils, Heart, ArrowRight,
    LayoutDashboard, ClipboardList, BarChart3, FileText,
    Settings, LogOut, ClipboardCheck, Mic, MicOff,
    ChevronLeft
} from "lucide-react"
import "leaflet/dist/leaflet.css"
import { MOCK_NEEDS, MOCK_VOLUNTEERS, MOCK_STATS, MOCK_ACTIVITY } from "../utils/mockData"

/* ─── CONSTANTS ──────────────────────────────────────────────────────────── */
const U_COLOR = { 5: "#dc2626", 4: "#ea580c", 3: "#d97706", 2: "#65a30d", 1: "#16a34a" }
const U_LABEL = { 5: "Critical", 4: "High", 3: "Medium", 2: "Low", 1: "Minimal" }
const CAT_EMOJI = { food: "🍱", medical: "❤️", shelter: "🏠", water: "💧", education: "📚" }
const CAT_COLOR = { food: "#d97706", medical: "#dc2626", shelter: "#7c3aed", water: "#2563eb", education: "#059669" }
const STATUS_CFG = {
    unassigned: { label: "Unassigned", bg: "#fef2f2", text: "#dc2626", dot: "#dc2626" },
    assigned:   { label: "Assigned",   bg: "#fffbeb", text: "#d97706", dot: "#d97706" },
    inprogress: { label: "In Progress",bg: "#eff6ff", text: "#2563eb", dot: "#2563eb" },
    completed:  { label: "Completed",  bg: "#f0fdf4", text: "#16a34a", dot: "#16a34a" },
}
const CATS = ["all", "food", "medical", "shelter", "water", "education"]
const ACT_COLORS = { ai: "#7c3aed", assign: "#2563eb", complete: "#16a34a", submit: "#d97706" }
const NAV_ITEMS = [
    { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard"  },
    { to: "/heatmap",    icon: MapPin,           label: "Heatmap"    },
    { to: "/tasks",      icon: ClipboardList,    label: "Task Board" },
    { to: "/volunteers", icon: Users,            label: "Volunteers" },
    { to: "/reports",    icon: FileText,         label: "Reports"    },
    { to: "/survey",     icon: ClipboardCheck,   label: "Survey"     },
    { to: "/analytics",  icon: BarChart3,        label: "Analytics"  },
    { to: "/settings",   icon: Settings,         label: "Settings"   },
]

/* ─── INJECT MAP STYLES ──────────────────────────────────────────────────── */
const injectMapStyles = (dark) => {
    let el = document.getElementById("civic-map-styles")
    if (!el) { el = document.createElement("style"); el.id = "civic-map-styles"; document.head.appendChild(el) }
    el.textContent = `
    @keyframes civicPulse{0%{transform:scale(1);opacity:.35}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}
    .leaflet-popup-content-wrapper{border-radius:16px!important;padding:0!important;border:1.5px solid rgba(90,120,99,.2)!important;box-shadow:0 20px 60px rgba(28,53,45,.2)!important;overflow:hidden!important}
    .leaflet-popup-content{margin:0!important}
    .leaflet-popup-tip-container{display:none!important}
    .leaflet-container{font-family:'DM Sans',sans-serif!important}
    .leaflet-control-zoom{border:none!important;border-radius:12px!important;overflow:hidden!important;box-shadow:0 4px 16px rgba(0,0,0,0.12)!important}
    .leaflet-control-zoom a{width:36px!important;height:36px!important;line-height:36px!important;font-size:18px!important;font-weight:700!important;color:#1C352D!important;background:rgba(255,255,255,0.95)!important;border:none!important}
    .leaflet-control-zoom a:hover{background:#f0f7e8!important}
    ${dark ? ".leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(0.82) contrast(0.9)}" : ""}
  `
}

/* ─── MAP HELPERS ────────────────────────────────────────────────────────── */
const makePinIcon = (need) => {
    const color = U_COLOR[need.urgency]
    const pulse = need.urgency === 5
    const size  = need.urgency >= 5 ? 36 : need.urgency >= 4 ? 30 : 24
    const emoji = CAT_EMOJI[need.category]
    const html  = `
    <div style="position:relative;width:${size}px;height:${size}px">
      ${pulse ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.25;animation:civicPulse 1.8s ease-out infinite"></div><div style="position:absolute;inset:4px;border-radius:50%;background:${color};opacity:.15;animation:civicPulse 1.8s ease-out infinite .4s"></div>` : ""}
      <div style="position:absolute;inset:0;border-radius:50%;background:white;border:3px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px ${color}88, 0 0 12px ${color}55;font-size:${Math.floor(size*0.36)}px">${emoji}</div>
    </div>`
    return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size/2, size/2] })
}

const FlyTo = ({ coords }) => {
    const map = useMap()
    useEffect(() => { if (coords) map.flyTo(coords, 14, { duration: 1.4 }) }, [coords])
    return null
}

/* ─── REUSABLE MINI-COMPONENTS ───────────────────────────────────────────── */

// Gradient border button
const GradBtn = ({ onClick, children, full }) => (
    <motion.div
        className="grad-btn"
        whileHover={{ scale: 1.01 }}
        style={{
            position: "relative",
            padding: 2,
            borderRadius: "0.9em",
            background: "linear-gradient(90deg,#1a8c40,#2d5a2d,#5a9a30)",
            cursor: "pointer",
            width: full ? "100%" : undefined
        }}
        onClick={onClick}
    >
        {/* 🔥 GLOW LAYER */}
        <div
            className="grad-glow"
            style={{
                position: "absolute",
                inset: 0,
                borderRadius: "0.9em",
                background: "linear-gradient(90deg,#1a8c40,#5a9a30)",
                opacity: 0,
                filter: "blur(22px)",
                transition: "0.3s",
                zIndex: 0
            }}
        />

        {/* 🔥 BUTTON */}
        <motion.button
            whileTap={{ scale: 0.96 }}
            style={{
                position: "relative",
                zIndex: 2,
                background: "#0d1f0d",
                color: "#d0f0a0",
                border: "none",
                borderRadius: "0.6em",
                padding: "9px 16px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                width: full ? "100%" : undefined,
                justifyContent: full ? "center" : "flex-start",
            }}
        >
            {children}
        </motion.button>
    </motion.div>
);

// Animated mic button
const MicBtn = ({ active, onToggle }) => (
    <motion.button onClick={onToggle} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                   style={{ width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer", background: active ? "rgba(220,38,38,0.12)" : "rgba(90,120,99,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <AnimatePresence mode="wait">
            <motion.div key={active ? "on" : "off"} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 30 }} transition={{ duration: 0.18 }}>
                {active ? <Mic size={13} color="#dc2626" /> : <MicOff size={13} color="#90AB8B" />}
            </motion.div>
        </AnimatePresence>
    </motion.button>
)

// Pill toggle (2 options, sliding pill)
const PillToggle = ({ options, value, onChange, dark }) => {
    const idx = options.findIndex(o => o.value === value)
    return (
        <div style={{ display: "flex", position: "relative", borderRadius: 10, background: dark ? "rgba(255,255,255,0.06)" : "rgba(90,120,99,0.1)", padding: 3 }}>
            <motion.div
                animate={{
                    left: `calc(${idx} * (100% / ${options.length}) + 3px)`
                }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{
                    position: "absolute",
                    top: 3,
                    bottom: 3,
                    width: `calc(100% / ${options.length} - 6px)`,
                    background: dark ? "#4a7a35" : "#2d5a2d",
                    borderRadius: 8
                }}
            />
            {options.map(o => (
                <button key={o.value} onClick={() => onChange(o.value)}
                        style={{ flex: 1, padding: "5px 8px", border: "none", background: "transparent", fontSize: 11, fontWeight: 700, cursor: "pointer", position: "relative", zIndex: 1, color: value === o.value ? "#fff" : dark ? "#7a9b6a" : "#5a7a5a", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    {o.label}
                </button>
            ))}
        </div>
    )
}

// Liquid radio group
const LiquidRadio = ({ options, value, onChange, dark }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {options.map(o => (
            <motion.button
                key={o.value}
                onClick={() => onChange(o.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    padding: "5px 10px",
                    borderRadius: 20,
                    border: "1.5px solid",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .18s",

                    // ✅ FIXED BACKGROUND (soft tint instead of solid)
                    background: value === o.value
                        ? (o.color
                            ? o.color + "22"
                            : (dark ? "#4a7a3522" : "#1C352D22"))
                        : "transparent",

                    // ✅ FIXED BORDER (no harsh glow)
                    borderColor: value === o.value
                        ? (o.color || (dark ? "#4a7a35" : "#1C352D"))
                        : (dark ? "rgba(120,180,80,0.18)" : "rgba(90,120,99,0.2)"),

                    // ✅ FIXED TEXT COLOR (no white, no neon)
                    color: value === o.value
                        ? (o.color || "#a0dc50")
                        : (dark ? "#7a9b6a" : "#5a7a5a"),
                }}
            >
                {o.label}
            </motion.button>
        ))}
    </div>
);

// Notification card (dark bg, colored left strip)
const NotifCard = ({ children, color = "#5b5bf0", dark, style: s = {} }) => (
    <motion.div
        whileHover={{ boxShadow: `0 0 18px ${color}88` }}
        style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            background: dark
                ? "linear-gradient(180deg, rgba(25,35,20,0.9), rgba(15,25,15,0.9))"
                : "rgba(255,255,255,0.95)",
            border: dark
                ? "1px solid rgba(120,180,80,0.08)"
                : "1.5px solid rgba(90,120,99,0.1)",
            transition: "all 0.25s ease",
            ...s
        }}
    >
        {/* 🔥 LEFT SIDE GLOW (DIRECTIONAL) */}
        <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.4 }}
            transition={{ duration: 0.3 }}
            style={{
                position: "absolute",
                left: -40,
                top: "50%",
                transform: "translateY(-50%)",
                width: 120,
                height: 120,
                background: `radial-gradient(circle, ${color}, transparent)`,
                filter: "blur(30px)",
                pointerEvents: "none"
            }}
        />

        {/* ✅ BORDER GLOW */}
        <motion.div
            initial={{ boxShadow: `0 0 0px ${color}` }}
            whileHover={{ boxShadow: `0 0 18px ${color}88` }}
            transition={{ duration: 0.25 }}
            style={{
                position: "absolute",
                inset: 0,
                borderRadius: 12,
                pointerEvents: "none"
            }}
        />

        {/* ✅ LEFT ACCENT BAR (kept from your original) */}
        <div
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                background: `linear-gradient(180deg, ${color}, ${color}77)`,
                boxShadow: `0 0 10px ${color}55`
            }}
        />

        {/* ✅ CONTENT */}
        <div style={{ paddingLeft: 11 }}>
            {children}
        </div>
    </motion.div>
);

// Stat chip with count-up
const StatChip = ({ icon: Icon, value, label, color, delay, dark }) => {
    const [n, setN] = useState(0)
    useEffect(() => {
        const t = parseInt(value); if (!t) return
        let c = 0; const step = Math.ceil(t / 18)
        const iv = setInterval(() => { c = Math.min(c + step, t); setN(c); if (c >= t) clearInterval(iv) }, 45)
        return () => clearInterval(iv)
    }, [value])
    return (
        <motion.div initial={{ opacity: 0.25, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={{ minWidth:130 }}>
            <NotifCard color={color} dark={dark}>
                <div style={{ padding: "9px 12px", display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={13} color={color} />
                    </div>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 900, color: dark ? "#edf5e0" : "#1C352D", margin: 0, lineHeight: 1 }}>{n}</p>
                        <p style={{ fontSize: 9.5, color: dark ? "#7a9b6a" : "#90AB8B", margin: "2px 0 0", fontWeight: 600 }}>{label}</p>
                    </div>
                </div>
            </NotifCard>
        </motion.div>
    )
}

// Day/night toggle
const DayNightToggle = ({ dark, onToggle }) => (
    <motion.button

        onClick={onToggle} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                   style={{ width: 50, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: dark ? "linear-gradient(135deg,#0a0f1a,#1a2540)" : "linear-gradient(135deg,#87ceeb,#c8e6f5)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        {dark
            ? [[8,5],[18,13],[34,7],[42,17]].map(([x,y],i) => <div key={i} style={{ position:"absolute", left:x, top:y, width:2, height:2, borderRadius:"50%", background:"#fff", opacity:.8 }} />)
            : <div style={{ position:"absolute", left:6, top:8, width:12, height:6, borderRadius:6, background:"rgba(255,255,255,0.7)" }} />
        }
        <motion.div animate={{ x: dark ? 24 : 2 }} transition={{ type:"spring", stiffness:400, damping:28 }}
                    style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%", background: dark ? "#e8d44d" : "#ffb84d", boxShadow: dark ? "0 0 8px #e8d44d88" : "0 2px 8px rgba(255,150,0,.4)" }} />
    </motion.button>
)

/* ─── SIDEBAR ────────────────────────────────────────────────────────────── */
const AppSidebar = ({ dark, onToggleDark, collapsed, onToggleCollapse }) => {
    const navigate = useNavigate()
    return (
        <motion.aside animate={{ width: collapsed ? 64 : 220 }} transition={{ type:"spring", stiffness:300, damping:30 }}
                      style={{ position:"fixed", left:0, top:0, bottom:0, zIndex:2000, background: dark ? "#050a04" : "#1C352D", overflow:"hidden", borderRight:"1px solid rgba(255,255,255,0.05)", display:"flex", flexDirection:"column", flexShrink:0 }}>

            <div
                style={{
                    padding: "16px 12px",
                    position: "relative",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                }}
            >
                {/* LOGO */}
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: "#3a7a3a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                    }}
                >
                    <Zap size={15} color="#d0f0a0" />
                </div>

                {/* TEXT */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                        >
                            <p style={{ fontSize: 13, fontWeight: 900, color: "#d0f0a0", margin: 0 }}>
                                CivicPulse
                            </p>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                                Coordinator
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 🔥 FIXED COLLAPSE BUTTON */}
                <motion.button
                    onClick={onToggleCollapse}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    style={{


                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",

                        background: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(6px)",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        zIndex: 20
                    }}
                >
                    <ChevronLeft
                        size={13}
                        color="rgba(255,255,255,0.6)"
                        style={{
                            transform: collapsed ? "rotate(180deg)" : "none",
                            transition: "transform 0.3s ease"
                        }}
                    />
                </motion.button>
            </div>

            <nav style={{ flex:1, padding:"8px 8px", overflowY:"auto", display:"flex", flexDirection:"column", gap:2 }}>
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to}
                             style={({ isActive }) => ({ display:"flex", height: 36, alignItems:"center", minWidth: 0,gap: 10,justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "9px 0" : "9px 12px", borderRadius:10, textDecoration:"none", background: isActive ? "rgba(160,220,80,0.12)" : "transparent", color: isActive ? "#a0dc50" : "rgba(255,255,255,0.42)", fontFamily:"inherit", fontSize:12.5, fontWeight:600, transition:"all .2s", whiteSpace:"nowrap", overflow:"hidden" })}>
                        <Icon size={17} style={{ flexShrink:0, margin: collapsed ? "0 auto" : 0 }} />
                        <AnimatePresence>{!collapsed && <motion.span
                            animate={{
                                opacity: collapsed ? 0 : 1,
                                x: collapsed ? -10 : 0
                            }}
                            transition={{ duration: 0.2 }}
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                display: "inline-block"
                            }}
                        >
                            {label}
                        </motion.span>}</AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding:"8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                {!collapsed && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, padding:"0 4px" }}>
                        <span style={{ fontSize:10, color:"rgba(255,255,255,0.28)", fontFamily:"inherit" }}>Dark mode</span>
                        <DayNightToggle dark={dark} onToggle={onToggleDark} />
                    </div>
                )}
                <button onClick={() => navigate("/login")} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, border:"none", background:"transparent", cursor:"pointer", color:"rgba(255,255,255,0.28)", fontFamily:"inherit", fontSize:12.5 }}>
                    <LogOut size={16} style={{ flexShrink:0 }} />
                    {!collapsed && "Sign out"}
                </button>
            </div>
        </motion.aside>
    )
}

/* ─── NEED CARD ──────────────────────────────────────────────────────────── */
const NeedCard = ({ need, active, onClick, dark }) => {
    const s = STATUS_CFG[need.status]
    return (
        <motion.div whileHover={{ x:2 }} whileTap={{ scale:.98 }} onClick={onClick}
                    style={{ borderRadius:12, padding:"11px 12px 11px 15px", cursor:"pointer", marginBottom:6, border: active ? `2px solid ${dark ? "#78b450" : "#5A7863"}` : `1.5px solid ${dark ? "rgba(120,180,80,0.1)" : "rgba(90,120,99,0.12)"}`, background: active ? (dark ? "rgba(120,180,80,0.08)" : "#EBF4DD") : (dark ? "#1c2a18" : "rgba(255,255,255,0.9)"), transition:"all .18s", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:U_COLOR[need.urgency], borderRadius:"12px 0 0 12px" }} />
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6, marginBottom:5 }}>
                <p style={{ fontSize:12, fontWeight:800, color: dark ? "#edf5e0" : "#1C352D", lineHeight:1.3, margin:0, flex:1 }}>{CAT_EMOJI[need.category]} {need.title}</p>
                <div style={{ display:"flex", gap:2, flexShrink:0, marginTop:1 }}>
                    {[1,2,3,4,5].map(i => <div key={i} style={{ width:3, height:11, borderRadius:2, background: i<=need.urgency ? U_COLOR[need.urgency] : dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }} />)}
                </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, color: dark ? "#7a9b6a" : "#90AB8B", fontWeight:600, display:"flex", alignItems:"center", gap:3 }}><MapPin size={9}/> {need.zone}</span>
                <span style={{ fontSize:10, color: dark ? "#7a9b6a" : "#90AB8B", fontWeight:600, display:"flex", alignItems:"center", gap:3 }}><Users size={9}/> {need.people}</span>
                <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:20, background:s.bg, color:s.text, display:"flex", alignItems:"center", gap:3 }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, display:"inline-block" }}/>{s.label}
        </span>
                <span style={{ fontSize:10, color: dark ? "#6f9f5a" : "#b0c4b8", marginLeft:"auto" }}>{need.time}</span>
            </div>
        </motion.div>
    )
}

/* ─── VOLUNTEER CARD ─────────────────────────────────────────────────────── */
const VolCard = ({ vol, onAssign, dark }) => (
    <motion.div whileHover={{ y:-1 }}
                style={{ borderRadius:12, padding:"14px 16px", background: dark ? "#1c2a18" : "rgba(255,255,255,0.9)", border:`1.5px solid ${dark ? "rgba(120,180,80,0.1)" : "rgba(90,120,99,0.12)"}`, marginBottom:6, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background: vol.available ? (dark ? "rgba(120,180,80,0.12)" : "#EBF4DD") : (dark ? "rgba(255,255,255,0.04)" : "#f1f0ee"), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:11, color: vol.available ? (dark ? "#78b450" : "#3B4953") : dark ? "#4a6a3a" : "#90AB8B", border:`2px solid ${vol.available ? (dark ? "#78b450" : "#5A7863") : dark ? "rgba(120,180,80,0.08)" : "rgba(90,120,99,0.15)"}` }}>
            {vol.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:800, color: dark ? "#edf5e0" : "#1C352D", margin:0, lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{vol.name}</p>
            <p style={{ fontSize:10, color: dark ? "#7a9b6a" : "#90AB8B", margin:0, marginTop:1 }}>{vol.skills.slice(0,2).join(" · ")}</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
            <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:20, background: vol.available ? "#f0fdf4" : "#f9fafb", color: vol.available ? "#16a34a" : "#90AB8B" }}>{vol.available ? "Free" : "Busy"}</span>
            <span style={{ fontSize:9.5, color: dark ? "#6f9f5a" : "#b0c4b8" }}>{vol.reliability}% reliable</span>
        </div>
        {onAssign && (
            <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }} onClick={() => onAssign(vol)}
                           style={{ width:28, height:28, borderRadius:9, flexShrink:0, background: dark ? "#3a7a3a" : "#1C352D", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ArrowRight size={12} color="#d0f0a0" />
            </motion.button>
        )}
    </motion.div>
)

/* ─── SUBMIT MODAL ───────────────────────────────────────────────────────── */
const SubmitModal = ({ onClose, onSubmit, dark }) => {
    const [form, setForm] = useState({ title:"", category:"food", urgency:3, people:"", zone:"", desc:"" })
    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
    const ib = { width:"100%", padding:"10px 14px", borderRadius:12, fontSize:13, border:`1.5px solid ${dark ? "rgba(120,180,80,0.15)" : "#e8f0e0"}`, background: dark ? "#111a0e" : "#f8faf6", color: dark ? "#edf5e0" : "#1C352D", outline:"none", fontFamily:"inherit" }

    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ position:"fixed", inset:0, zIndex:5000, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                    onClick={onClose}>
            <motion.div initial={{ scale:.9, y:24, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} exit={{ scale:.9, y:16, opacity:0 }}
                        transition={{ type:"spring", stiffness:360, damping:28 }} onClick={e => e.stopPropagation()}
                        style={{ width:"100%", maxWidth:520, background: dark ? "#111a0e" : "#fff", borderRadius:24, padding:28, boxShadow:"0 32px 80px rgba(0,0,0,0.3)", border:`1.5px solid ${dark ? "rgba(120,180,80,0.15)" : "rgba(90,120,99,0.2)"}`, maxHeight:"90vh", overflowY:"auto" }}>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background: dark ? "#3a7a3a" : "#1C352D", display:"flex", alignItems:"center", justifyContent:"center" }}><Plus size={16} color="#d0f0a0"/></div>
                        <div>
                            <p style={{ fontSize:17, fontWeight:900, color: dark ? "#edf5e0" : "#1C352D", margin:0 }}>Report a Need</p>
                            <p style={{ fontSize:11, color: dark ? "#7a9b6a" : "#90AB8B", margin:0 }}>AI will score and route automatically</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:30, height:30, borderRadius:9, border:"none", background: dark ? "rgba(255,255,255,0.06)" : "#f0f4ec", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <X size={14} color="#90AB8B"/>
                    </button>
                </div>

                <div style={{ display:"grid", gap:14 }}>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color: dark ? "#7a9b6a" : "#3B4953", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".6px" }}>Title</label>
                        <input value={form.title} onChange={set("title")} placeholder="Describe the need in one line..." style={ib}/>
                    </div>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color: dark ? "#7a9b6a" : "#3B4953", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:".6px" }}>Category</label>
                        <LiquidRadio options={CATS.slice(1).map(c=>({ value:c, label:CAT_EMOJI[c]+" "+c[0].toUpperCase()+c.slice(1), color:CAT_COLOR[c] }))} value={form.category} onChange={v=>setForm(p=>({...p,category:v}))} dark={dark}/>
                    </div>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color: dark ? "#7a9b6a" : "#3B4953", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:".6px" }}>Urgency — <span style={{ color:U_COLOR[form.urgency] }}>{U_LABEL[form.urgency]}</span></label>
                        <div style={{ display:"flex", gap:6 }}>
                            {[1,2,3,4,5].map(u=>(
                                <motion.button key={u} onClick={()=>setForm(p=>({...p,urgency:u}))} whileHover={{ scale:1.08 }} whileTap={{ scale:.92 }}
                                               style={{ flex:1, padding:"8px 0", borderRadius:10, border:"1.5px solid", cursor:"pointer", fontWeight:900, fontSize:13, fontFamily:"inherit", background: form.urgency===u ? U_COLOR[u] : "transparent", borderColor: form.urgency===u ? U_COLOR[u] : dark ? "rgba(120,180,80,0.15)" : "#e8f0e0", color: form.urgency===u ? "#fff" : dark ? "#7a9b6a" : "#90AB8B" }}>{u}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        {[["people","People Affected","e.g. 80"],["zone","Zone / Area","e.g. Dharavi"]].map(([k,lbl,ph])=>(
                            <div key={k}>
                                <label style={{ fontSize:10, fontWeight:700, color: dark ? "#7a9b6a" : "#3B4953", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".6px" }}>{lbl}</label>
                                <input value={form[k]} onChange={set(k)} placeholder={ph} style={ib}/>
                            </div>
                        ))}
                    </div>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color: dark ? "#7a9b6a" : "#3B4953", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".6px" }}>Description</label>
                        <textarea value={form.desc} onChange={set("desc")} rows={3} placeholder="Additional context..." style={{ ...ib, resize:"none" }}/>
                    </div>
                    <GradBtn full onClick={()=>{ onSubmit(form); onClose() }}><Zap size={14}/> Submit to AI Scoring Engine</GradBtn>
                </div>
            </motion.div>
        </motion.div>
    )
}

/* ─── ACTIVITY PANEL ─────────────────────────────────────────────────────── */
const ActivityPanel = ({ dark }) => {
    const catData = [{ name:"Food", color:"#d97706", pct:35 },{ name:"Medical", color:"#dc2626", pct:55 },{ name:"Shelter", color:"#7c3aed", pct:25 },{ name:"Water", color:"#2563eb", pct:42 },{ name:"Education", color:"#059669", pct:18 }]

    return (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
            <div style={{ padding:"14px 14px 10px", borderBottom:`1px solid ${dark ? "rgba(120,180,80,0.08)" : "rgba(90,120,99,0.1)"}`, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <motion.div animate={{ scale:[1,1.35,1] }} transition={{ duration:1.5, repeat:Infinity }} style={{ width:8, height:8, borderRadius:"50%", background:"#16a34a", boxShadow:"0 0 8px #16a34a66" }}/>
                    <p style={{ fontSize:13, fontWeight:900, color: dark ? "#edf5e0" : "#1C352D", margin:0 }}>Live Activity</p>
                </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"12px 12px",
                display:"flex",
                flexDirection:"column",
                gap:8}}>
                {MOCK_ACTIVITY.map((item,i)=>(
                    <motion.div key={item.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.07 }} style={{ marginBottom:6 }}>
                        <NotifCard color={ACT_COLORS[item.type]||"#5b5bf0"} dark={dark}>
                            <div style={{ padding:"9px 10px 9px 0" }}>
                                <p style={{ fontSize:11, color: dark ? "#e8ffd8" : "#1C352D", margin:0, lineHeight:1.5, fontWeight:600 }}>{item.msg}</p>
                                <p style={{ fontSize:9.5, color: dark ? "#6f9f5a" : "#b0c4b8", margin:"3px 0 0", fontWeight:500 }}>{item.time}</p>
                            </div>
                        </NotifCard>
                    </motion.div>
                ))}

                <div style={{ marginTop:14, padding:"12px", borderRadius:12, background: dark ? "rgba(120,180,80,0.04)" : "rgba(90,120,99,0.04)", border:`1px solid ${dark ? "rgba(120,180,80,0.08)" : "rgba(90,120,99,0.09)"}` }}>
                    <p style={{ fontSize:10, fontWeight:700, color: dark ? "#7a9b6a" : "#90AB8B", textTransform:"uppercase", letterSpacing:".5px", margin:"0 0 10px" }}>Categories</p>
                    {catData.map(c=>(
                        <div key={c.name} style={{ marginBottom:7 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                                <span style={{ fontSize:10.5, fontWeight:700, color: dark ? "#e8ffd8" : "#3B4953" }}>{c.name}</span>
                                <span style={{ fontSize:10, color:c.color, fontWeight:800 }}>{c.pct}%</span>
                            </div>
                            <div style={{ height:4, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius:4, overflow:"hidden" }}>
                                <motion.div initial={{ width:0 }} animate={{ width:`${c.pct}%` }} transition={{ delay:.5, duration:.8 }} style={{ height:"100%", background:c.color, borderRadius:4 }}/>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop:10, padding:"12px", borderRadius:12, background: dark ? "rgba(91,91,240,0.07)" : "rgba(91,91,240,0.04)", border:"1px solid rgba(91,91,240,0.14)" }}>
                    <p style={{ fontSize:10, fontWeight:700, color:"#5b5bf0", textTransform:"uppercase", letterSpacing:".5px", margin:"0 0 8px" }}>AI Model Accuracy</p>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ position:"relative", width:52, height:52, flexShrink:0 }}>
                            <svg width="52" height="52" style={{ transform:"rotate(-90deg)" }}>
                                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(91,91,240,0.15)" strokeWidth="5"/>
                                <motion.circle cx="26" cy="26" r="20" fill="none" stroke="#5b5bf0" strokeWidth="5" strokeLinecap="round" strokeDasharray="125.6" initial={{ strokeDashoffset:125.6 }} animate={{ strokeDashoffset:7.5 }} transition={{ delay:.8, duration:1.2 }}/>
                            </svg>
                            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <span style={{ fontSize:11, fontWeight:900, color:"#5b5bf0" }}>94%</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize:12, fontWeight:800, color: dark ? "#edf5e0" : "#1C352D", margin:0 }}>Scoring precision</p>
                            <p style={{ fontSize:10, color: dark ? "#7a9b6a" : "#90AB8B", margin:"2px 0 0" }}>Last 7 days · 284 needs scored</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function HeatmapPage() {
    const [dark,         setDark]         = useState(false)
    const [collapsed,    setCollapsed]    = useState(false)
    const [needs,        setNeeds]        = useState(MOCK_NEEDS)
    const [search,       setSearch]       = useState("")
    const [micActive,    setMicActive]    = useState(false)
    const [catFilter,    setCatFilter]    = useState("all")
    const [urgencyFilter,setUrgencyFilter]= useState(0)
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedNeed, setSelectedNeed] = useState(null)
    const [showModal,    setShowModal]    = useState(false)
    const [showVolPanel, setShowVolPanel] = useState(false)
    const [flyCoords,    setFlyCoords]    = useState(null)
    const [toast,        setToast]        = useState("")

    useEffect(() => { injectMapStyles(dark) }, [dark])

    const filtered = needs.filter(n => {
        const q = search.toLowerCase()
        return (!q || n.title.toLowerCase().includes(q) || n.zone.toLowerCase().includes(q)) &&
            (catFilter === "all" || n.category === catFilter) &&
            (urgencyFilter === 0 || n.urgency === urgencyFilter) &&
            (statusFilter === "all" || n.status === statusFilter)
    })

    const critical  = needs.filter(n => n.urgency === 5).length
    const sidW      = collapsed ? 64 : 220
    const panelBg   = dark ? "rgba(8,14,6,0.98)" : "rgba(243,249,236,0.98)"

    const handleNeedClick = (need) => { setSelectedNeed(need); setFlyCoords([need.lat, need.lng]); setShowVolPanel(false) }
    const handleAssign    = (vol)  => { setToast(`✓ ${vol.name} assigned to "${selectedNeed?.title}"`); setShowVolPanel(false); setTimeout(() => setToast(""), 3000) }
    const handleSubmit    = (form) => setNeeds(p => [{ ...form, id: p.length+1, lat: 19.076+(Math.random()-.5)*.05, lng: 72.877+(Math.random()-.5)*.05, people: parseInt(form.people)||50, status:"unassigned", reporter:"You", time:"just now" }, ...p])

    return (
        <div style={{ position:"fixed", inset:0, display:"flex", fontFamily:"'DM Sans',sans-serif", background: dark ? "#0a0f08" : "#f0f5ea" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(90,120,99,0.3);border-radius:2px}`}</style>

            <AppSidebar dark={dark} onToggleDark={() => setDark(d => !d)} collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)}/>

            <motion.div animate={{ marginLeft: sidW }} transition={{ type:"spring", stiffness:300, damping:30 }}
                        style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

                {/* Top stats bar */}
                <div style={{ flexShrink:0, padding:"10px 16px", display:"flex", alignItems:"center", gap:10, background:panelBg, borderBottom:`1px solid ${dark ? "rgba(120,180,80,0.07)" : "rgba(90,120,99,0.1)"}`, flexWrap:"wrap" }}>
                    <div style={{ marginRight:4 }}>
                        <p style={{ fontSize:16, fontWeight:900, color: dark ? "#edf5e0" : "#1C352D", margin:0, lineHeight:1.1 }}>Crisis Heatmap</p>
                        <p style={{ fontSize:10.5, color: dark ? "#7a9b6a" : "#90AB8B", margin:0 }}>Mumbai Metropolitan Region · Live</p>
                    </div>
                    {[
                        { icon:Activity,      value:MOCK_NEEDS.length,           label:"Total Needs",       color:"#5b5bf0", delay:.05 },
                        { icon:AlertTriangle, value:critical,                    label:"Critical",          color:"#dc2626", delay:.1  },
                        { icon:Users,         value:MOCK_STATS.volunteersActive, label:"Volunteers Active", color:"#16a34a", delay:.15 },
                        { icon:CheckCircle,   value:MOCK_STATS.resolvedToday,    label:"Resolved Today",    color:"#2563eb", delay:.2  },
                    ].map(s => <StatChip key={s.label} {...s} dark={dark}/>)}
                </div>

                {/* Body */}
                <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

                    {/* LEFT PANEL — 300px */}
                    <div style={{ width:300, flexShrink:0, display:"flex", flexDirection:"column", background:panelBg, borderRight:`1px solid ${dark ? "rgba(120,180,80,0.07)" : "rgba(90,120,99,0.09)"}`, overflow:"hidden" }}>

                        {/* Search */}
                        <div style={{ padding:"14px 16px", borderBottom:`1px solid ${dark ? "rgba(120,180,80,0.07)" : "rgba(90,120,99,0.08)"}` }}>
                            <div style={{ display:"flex", alignItems:"center", gap:7, background: dark ? "rgba(120,180,80,0.04)" : "rgba(255,255,255,0.92)", border:`1.5px solid ${dark ? "rgba(120,180,80,0.1)" : "rgba(90,120,99,0.14)"}`, borderRadius:12, padding:"9px 12px" }}>
                                <Search size={13} color={dark ? "#7a9b6a" : "#90AB8B"} style={{ flexShrink:0 }}/>
                                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search zone or need..." style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:12, color: dark ? "#edf5e0" : "#1C352D", fontFamily:"inherit" }}/>
                                {search && <button onClick={()=>setSearch("")} style={{ border:"none", background:"none", cursor:"pointer", display:"flex" }}><X size={11} color="#90AB8B"/></button>}
                                <MicBtn active={micActive} onToggle={()=>setMicActive(m=>!m)}/>
                            </div>
                        </div>

                        {/* Filters */}
                        <div style={{ padding:"14px 16px", borderBottom:`1px solid ${dark ? "rgba(120,180,80,0.07)" : "rgba(90,120,99,0.08)"}`, display:"flex", flexDirection:"column", gap:12 }}>
                            <div>
                                <p style={{ fontSize:9.5, fontWeight:700, color: dark ? "#7a9b6a" : "#90AB8B", textTransform:"uppercase", letterSpacing:".5px", margin:"0 0 6px" }}>Category</p>
                                <LiquidRadio options={CATS.map(c=>({ value:c, label:c==="all"?"All":CAT_EMOJI[c]+" "+c[0].toUpperCase()+c.slice(1), color: c!=="all"?CAT_COLOR[c]:undefined }))} value={catFilter} onChange={setCatFilter} dark={dark}/>
                            </div>
                            <div>
                                <p style={{ fontSize:9.5, fontWeight:700, color: dark ? "#7a9b6a" : "#90AB8B", textTransform:"uppercase", letterSpacing:".5px", margin:"0 0 6px" }}>Status</p>
                                <PillToggle options={[{value:"all",label:"All"},{value:"unassigned",label:"Unassigned"}]} value={statusFilter} onChange={setStatusFilter} dark={dark}/>
                            </div>
                            <div>
                                <p style={{ fontSize:9.5, fontWeight:700, color: dark ? "#7a9b6a" : "#90AB8B", textTransform:"uppercase", letterSpacing:".5px", margin:"0 0 6px" }}>Urgency</p>
                                <div style={{ display:"flex", gap:4 }}>
                                    {[0,1,2,3,4,5].map(u=>(
                                        <motion.button key={u} onClick={()=>setUrgencyFilter(u)} whileHover={{ scale:1.08 }} whileTap={{ scale:.92 }}
                                                       style={{ flex:1, padding:"5px 0", borderRadius:8, border:"1.5px solid", cursor:"pointer", fontSize:10.5, fontWeight:700, fontFamily:"inherit", background: urgencyFilter===u ? (u===0 ? (dark?"#3a7a3a":"#1C352D") : U_COLOR[u]) : "transparent", borderColor: urgencyFilter===u ? (u===0 ? (dark?"#3a7a3a":"#1C352D") : U_COLOR[u]) : dark?"rgba(120,180,80,0.14)":"rgba(90,120,99,0.18)", color: urgencyFilter===u ? "#fff" : dark ? "#7a9b6a" : "#90AB8B" }}>
                                            {u===0?"All":u}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tab switcher */}
                        <div style={{ padding:"8px 12px", borderBottom:`1px solid ${dark ? "rgba(120,180,80,0.07)" : "rgba(90,120,99,0.08)"}` }}>
                            <PillToggle options={[{value:"needs",label:`Needs (${filtered.length})`},{value:"vols",label:`Vols (${MOCK_VOLUNTEERS.filter(v=>v.available).length})`}]} value={showVolPanel?"vols":"needs"} onChange={v=>setShowVolPanel(v==="vols")} dark={dark}/>
                        </div>

                        {/* List */}
                        <div style={{ flex:1, overflowY:"auto", padding:"8px 10px" }}>
                            {!showVolPanel
                                ? filtered.sort((a,b)=>b.urgency-a.urgency).map(need=><NeedCard key={need.id} need={need} active={selectedNeed?.id===need.id} onClick={()=>handleNeedClick(need)} dark={dark}/>)
                                : MOCK_VOLUNTEERS.map(vol=><VolCard key={vol.id} vol={vol} onAssign={selectedNeed?handleAssign:null} dark={dark}/>)
                            }
                            {!showVolPanel && filtered.length===0 && (
                                <div style={{ textAlign:"center", padding:"40px 0", color: dark ? "#6f9f5a" : "#b0c4b8" }}>
                                    <p style={{ fontSize:12, fontWeight:600 }}>No needs match filters</p>
                                </div>
                            )}
                        </div>

                        {/* Selected need detail */}
                        <AnimatePresence>
                            {selectedNeed && !showVolPanel && (
                                <motion.div initial={{ y:100, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:100, opacity:0 }} transition={{ type:"spring", stiffness:380, damping:30 }}
                                            style={{ borderTop:`1.5px solid ${dark ? "rgba(120,180,80,0.1)" : "rgba(90,120,99,0.12)"}`, background: dark ? "#111a0e" : "rgba(255,255,255,0.98)", padding:12 }}>
                                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
                                        <p style={{ fontSize:12, fontWeight:800, color: dark ? "#edf5e0" : "#1C352D", margin:0 }}>{CAT_EMOJI[selectedNeed.category]} {selectedNeed.title}</p>
                                        <button onClick={()=>setSelectedNeed(null)} style={{ border:"none", background:"none", cursor:"pointer" }}><X size={12} color="#90AB8B"/></button>
                                    </div>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:9 }}>
                                        {[["Zone",selectedNeed.zone],["People",`${selectedNeed.people} affected`],["Urgency",U_LABEL[selectedNeed.urgency]],["Status",STATUS_CFG[selectedNeed.status].label]].map(([k,v])=>(
                                            <div key={k} style={{ padding:"7px 9px", borderRadius:9, background: dark ? "rgba(120,180,80,0.05)" : "#f8faf6", border:`1px solid ${dark ? "rgba(120,180,80,0.08)" : "#e8f0e0"}` }}>
                                                <p style={{ fontSize:9, fontWeight:700, color: dark ? "#7a9b6a" : "#90AB8B", margin:0, textTransform:"uppercase", letterSpacing:".4px" }}>{k}</p>
                                                <p style={{ fontSize:11, fontWeight:800, color: dark ? "#edf5e0" : "#1C352D", margin:"2px 0 0" }}>{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <GradBtn full onClick={()=>setShowVolPanel(true)}><Users size={12}/> Find & Assign Volunteer <ChevronLeft size={12} style={{ transform:"rotate(180deg)" }}/></GradBtn>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit button */}
                        <div style={{ padding:"14px 16px", borderTop:`1px solid ${dark ? "rgba(120,180,80,0.07)" : "rgba(90,120,99,0.09)"}` }}>
                            <GradBtn full onClick={()=>setShowModal(true)}><Plus size={13}/> Report New Need</GradBtn>
                        </div>
                    </div>

                    {/* MAP */}
                    <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
                        <MapContainer center={[19.076, 72.877]} zoom={12} style={{ width:"100%", height:"100%", zIndex:1 }} zoomControl={true}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" attribution="© CartoDB"/>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" pane="shadowPane"/>
                            {flyCoords && <FlyTo coords={flyCoords}/>}
                            {filtered.map(need=>(
                                <Marker key={need.id} position={[need.lat, need.lng]} icon={makePinIcon(need)} eventHandlers={{ click:()=>handleNeedClick(need) }}>
                                    <Popup maxWidth={220} minWidth={200}>
                                        <div style={{ padding:"14px 16px", fontFamily:"'DM Sans',sans-serif" }}>
                                            <p style={{ fontSize:14, fontWeight:900, color:"#1C352D", margin:"0 0 6px" }}>{CAT_EMOJI[need.category]} {need.title}</p>
                                            <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
                                                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:U_COLOR[need.urgency]+"18", color:U_COLOR[need.urgency] }}>{U_LABEL[need.urgency]} urgency</span>
                                                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:STATUS_CFG[need.status].bg, color:STATUS_CFG[need.status].text }}>{STATUS_CFG[need.status].label}</span>
                                            </div>
                                            <p style={{ fontSize:11, color:"#90AB8B", marginBottom:10 }}>📍 {need.zone} · 👥 {need.people} affected</p>
                                            <button onClick={()=>{ handleNeedClick(need); setShowVolPanel(true) }} style={{ width:"100%", padding:"8px 12px", borderRadius:10, border:"none", background:"#1C352D", color:"#d0f0a0", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                                                <Users size={11}/> Find Volunteers
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Bottom legend */}
                        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:.5 }}
                                    style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", zIndex:1000, pointerEvents:"none", display:"flex", alignItems:"center", gap:11, padding:"8px 18px", background: dark ? "rgba(20,30,20,0.9)" : "rgba(255,255,255,0.92)", backdropFilter:"blur(20px)", borderRadius:14, border:"1.5px solid rgba(90,120,99,0.15)", boxShadow:"0 4px 20px rgba(28,53,45,0.1)", whiteSpace:"nowrap" }}>
                            <span style={{ fontSize:9.5, fontWeight:700, color:"#90AB8B", textTransform:"uppercase", letterSpacing:".5px" }}>Urgency</span>
                            {[1,2,3,4,5].map(u=>(
                                <div key={u} style={{ display:"flex", alignItems:"center", gap:4 }}>
                                    <div style={{ width:10, height:10, borderRadius:"50%", background:U_COLOR[u] }}/>
                                    <span style={{ fontSize:10.5, fontWeight:700, color: dark ? "#e8ffd8" : "#3B4953" }}>{u===1?"Low":u===3?"Med":u===5?"Critical":u}</span>
                                </div>
                            ))}
                            <div style={{ width:1, height:14, background:"#e8f0e0" }}/>
                            <span style={{ fontSize:10.5, fontWeight:700, color:"#5A7863" }}>{filtered.length} visible</span>
                            {critical > 0 && <><div style={{ width:1, height:14, background:"#e8f0e0" }}/><div style={{ display:"flex", alignItems:"center", gap:4 }}><motion.div animate={{ scale:[1,1.35,1] }} transition={{ duration:1.5, repeat:Infinity }} style={{ width:7, height:7, borderRadius:"50%", background:"#dc2626" }}/><span style={{ fontSize:10.5, fontWeight:900, color:"#dc2626" }}>{critical} critical</span></div></>}
                        </motion.div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div style={{ width:280, flexShrink:0, background: dark ? "#0d150a" : "rgba(242,248,234,0.98)", borderLeft:`1px solid ${dark ? "rgba(120,180,80,0.07)" : "rgba(90,120,99,0.09)"}`, overflow:"hidden" }}>
                        <ActivityPanel dark={dark}/>
                    </div>
                </div>
            </motion.div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity:0, y:20, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:10, scale:.95 }}
                                style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999, padding:"10px 20px", borderRadius:14, background:"#1C352D", color:"#d0f0a0", fontSize:13, fontWeight:700, boxShadow:"0 8px 24px rgba(28,53,45,.35)", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit", whiteSpace:"nowrap", pointerEvents:"none" }}>
                        <CheckCircle size={15} color="#4ade80"/> {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {showModal && <SubmitModal onClose={()=>setShowModal(false)} onSubmit={handleSubmit} dark={dark}/>}
            </AnimatePresence>
        </div>
    )
}
