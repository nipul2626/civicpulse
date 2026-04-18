import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
    Search, Filter, MapPin, Star, Clock, CheckCircle, Users, Zap, Heart, X, Award,
    Phone, Mail, Globe, Shield, ChevronDown, Menu, TrendingUp, Home, Map, Clipboard,
    FileText, MessageSquare, BarChart3, Settings, Sun, Moon, LogOut
} from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════════════
   THEME & COLORS
   ═══════════════════════════════════════════════════════════════════════════ */

const useTheme = () => {
    const [isDark, setIsDark] = useState(false)
    return { isDark, setIsDark }
}

const getColors = (isDark) => isDark ? {
    bg: "#0a0f08",
    surface: "#111a0e",
    card: "#1c2a18",
    border: "rgba(120,180,80,0.12)",
    text: "#edf5e0",
    muted: "#7a9b6a",
    accent: "#78b450",
    red: "#e05a3a",
    amber: "#e8a020",
    green: "#2dc9a0",
    blue: "#4a9fce",
    purple: "#9b7cf8",
    cyan: "#3ec9b0",
    glowGreen: "rgba(120,180,80,0.3)",
    notifBg: "#18181b",
} : {
    bg: "#eef2eb",
    surface: "#e2e8de",
    card: "#ffffff",
    border: "rgba(45,90,45,0.12)",
    text: "#1a2e1a",
    muted: "#5a7a5a",
    accent: "#2d5a2d",
    red: "#b84c2e",
    amber: "#c07a0a",
    green: "#1a6b4a",
    blue: "#1a4a8a",
    purple: "#5a3a8a",
    cyan: "#1a6b7a",
    glowGreen: "rgba(45,90,45,0.2)",
    notifBg: "#18181b",
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const VOLUNTEERS = [
    { id: 1, name: "Arjun Mehta", initials: "AM", role: "Medical", zone: "Dharavi", rating: 4.9, tasks: 142, hours: 380,
        skills: ["First Aid", "Triage", "Mental Health"], status: "active", verified: true, color: "#4f9191",
        phone: "+91 98765 43210", email: "arjun@example.com", availability: [true, true, false, true, true, true, false] },
    { id: 2, name: "Priya Nair", initials: "PN", role: "Logistics", zone: "Andheri", rating: 4.8, tasks: 98, hours: 210,
        skills: ["Supply Chain", "Route Planning", "Inventory"], status: "active", verified: true, color: "#7a6bb5",
        phone: "+91 98123 45678", email: "priya@example.com", availability: [true, true, true, true, true, false, false] },
    { id: 3, name: "Rohan Das", initials: "RD", role: "Field", zone: "Kurla", rating: 4.6, tasks: 67, hours: 145,
        skills: ["Data Collection", "GIS Mapping", "Reporting"], status: "away", verified: true, color: "#c9923a",
        phone: "+91 99876 54321", email: "rohan@example.com", availability: [false, true, true, true, false, true, true] },
    { id: 4, name: "Sunita Patil", initials: "SP", role: "Medical", zone: "Govandi", rating: 5.0, tasks: 203, hours: 510,
        skills: ["Child Care", "Counseling", "Education"], status: "active", verified: true, color: "#b85547",
        phone: "+91 97654 32109", email: "sunita@example.com", availability: [true, true, true, true, true, true, true] },
    { id: 5, name: "Vikram Joshi", initials: "VJ", role: "Tech", zone: "Thane", rating: 4.7, tasks: 54, hours: 112,
        skills: ["IT Setup", "Communication", "Digital Tools"], status: "active", verified: false, color: "#5A7863",
        phone: "+91 96543 21098", email: "vikram@example.com", availability: [true, false, true, true, true, false, true] },
    { id: 6, name: "Kavita Sharma", initials: "KS", role: "Logistics", zone: "Malad", rating: 4.5, tasks: 89, hours: 198,
        skills: ["Food Safety", "Community Outreach", "Cooking"], status: "inactive", verified: true, color: "#4a7a44",
        phone: "+91 95432 10987", email: "kavita@example.com", availability: [false, false, true, true, false, true, false] },
    { id: 7, name: "Deepak Kumar", initials: "DK", role: "Field", zone: "Bandra", rating: 4.9, tasks: 176, hours: 440,
        skills: ["Swimming", "Rope Rescue", "Navigation"], status: "active", verified: true, color: "#4f9191",
        phone: "+91 94321 09876", email: "deepak@example.com", availability: [true, true, true, false, true, true, true] },
    { id: 8, name: "Ananya Singh", initials: "AS", role: "Tech", zone: "Colaba", rating: 4.8, tasks: 41, hours: 95,
        skills: ["Legal Counsel", "Documentation", "Advocacy"], status: "away", verified: true, color: "#7a6bb5",
        phone: "+91 93210 98765", email: "ananya@example.com", availability: [false, true, true, true, true, false, true] },
]

const ZONES = ["All Zones", "Dharavi", "Andheri", "Kurla", "Govandi", "Thane", "Malad", "Bandra", "Colaba"]

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// DARK/LIGHT TOGGLE — Sun/Moon with clouds and stars
const DarkLightToggle = ({ isDark, setIsDark }) => (
    <label style={{ cursor: "pointer", position: "relative", width: 80, height: 40, display: "inline-block" }}>
        <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)}
               style={{ opacity: 0, width: 0, height: 0 }} />
        <motion.div
            animate={{ background: isDark ? "#1e293b" : "#3b82f6" }}
            style={{ position: "absolute", inset: 0, borderRadius: 34, transition: "0.3s" }}>
            {/* Stars (night) */}
            {isDark && (
                <svg style={{ position: "absolute", top: 8, left: 10, width: 20, height: 20 }}>
                    <circle cx="3" cy="3" r="1" fill="#fff" opacity="0.8" />
                    <circle cx="12" cy="5" r="1" fill="#fff" opacity="0.6" />
                    <circle cx="7" cy="11" r="1" fill="#fff" opacity="0.9" />
                    <circle cx="15" cy="10" r="1" fill="#fff" opacity="0.7" />
                </svg>
            )}
            {/* Clouds (day) */}
            {!isDark && (
                <>
                    <svg style={{ position: "absolute", top: 10, left: 8, width: 18, height: 10 }}>
                        <ellipse cx="6" cy="6" rx="6" ry="4" fill="#fff" opacity="0.8" />
                        <ellipse cx="12" cy="7" rx="5" ry="3" fill="#fff" opacity="0.8" />
                    </svg>
                    <svg style={{ position: "absolute", top: 18, right: 12, width: 16, height: 8 }}>
                        <ellipse cx="5" cy="5" rx="5" ry="3" fill="#fff" opacity="0.6" />
                        <ellipse cx="10" cy="6" rx="4" ry="2.5" fill="#fff" opacity="0.6" />
                    </svg>
                </>
            )}
        </motion.div>
        <motion.div
            animate={{ transform: isDark ? "translateX(40px)" : "translateX(4px)" }}
            style={{
                position: "absolute", top: 4, left: 0, width: 32, height: 32,
                background: isDark ? "#1e293b" : "#fbbf24",
                borderRadius: "50%", transition: "0.3s",
                boxShadow: isDark ? "0 0 0 2px #475569" : "0 0 5px rgba(251,191,36,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            {isDark ? <Moon size={16} color="#cbd5e1" /> : <Sun size={16} color="#fff" />}
            {/* Moon spots */}
            {isDark && (
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 8, left: 12, width: 4, height: 4, borderRadius: "50%", background: "#475569" }} />
                    <div style={{ position: "absolute", top: 16, left: 8, width: 3, height: 3, borderRadius: "50%", background: "#475569" }} />
                </div>
            )}
        </motion.div>
    </label>
)

// ANIMATED MIC TOGGLE
const MicToggle = ({ active, setActive }) => (
    <label style={{ cursor: "pointer", position: "relative", display: "inline-block" }}>
        <input type="checkbox" checked={active} onChange={() => setActive(!active)}
               style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
        <motion.div
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: active ? 360 : 0, scale: active ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{
                width: 36, height: 36, borderRadius: 10,
                background: active ? "rgba(34,197,94,0.15)" : "rgba(120,113,108,0.1)",
                border: `1.5px solid ${active ? "#22c55e" : "#78716c"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s, border 0.2s"
            }}>
            {active ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
                </svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2">
                    <line x1="2" y1="2" x2="22" y2="22" /><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                    <path d="M5 10v2a7 7 0 0 0 12 5" /><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" /><line x1="12" y1="19" x2="12" y2="22" />
                </svg>
            )}
        </motion.div>
    </label>
)

// LIQUID SLIDING RADIO GROUP
const LiquidRadio = ({ options, value, onChange, isDark }) => {
    const C = getColors(isDark)
    const selectedIndex = options.indexOf(value)

    return (
        <div style={{
            display: "flex", gap: 0, background: isDark ? "#1c2a18" : "#1a2e1a",
            padding: 4, borderRadius: 12, position: "relative", overflow: "hidden"
        }}>
            <motion.div
                layoutId="liquid-pill"
                animate={{
                    x: selectedIndex * (100 / options.length) + "%",
                    width: `${100 / options.length}%`
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
                style={{
                    position: "absolute", top: 4, left: 0, bottom: 4,
                    background: isDark ? "#78b450" : "#eef2eb",
                    borderRadius: 8
                }}
            />
            {options.map((opt, i) => (
                <button key={opt} onClick={() => onChange(opt)}
                        style={{
                            flex: 1, padding: "8px 14px", borderRadius: 8, border: "none",
                            background: "transparent", cursor: "pointer",
                            fontSize: 12, fontWeight: 700, position: "relative", zIndex: 1,
                            color: value === opt ? (isDark ? "#0a0f08" : "#1a2e1a") : (isDark ? "#7a9b6a" : "#eef2eb"),
                            transition: "color 0.2s", fontFamily: "'DM Sans', sans-serif",
                            whiteSpace: "nowrap"
                        }}>
                    {opt}
                </button>
            ))}
        </div>
    )
}

// ANIMATED SLIDING PILL TOGGLE (2 options)
const PillToggle = ({ options, value, onChange, isDark }) => {
    const C = getColors(isDark)
    const selectedIndex = options.indexOf(value)

    return (
        <div style={{
            display: "flex", gap: 0, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(45,90,45,0.08)",
            padding: 4, borderRadius: 12, position: "relative", border: `1px solid ${C.border}`
        }}>
            <motion.div
                animate={{ x: selectedIndex === 0 ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30,
                    cubicBezier: [0.47, 1.64, 0.41, 0.8] }}
                style={{
                    position: "absolute", top: 4, left: 4, bottom: 4, width: "calc(50% - 4px)",
                    background: C.accent, borderRadius: 8
                }}
            />
            {options.map((opt) => (
                <button key={opt} onClick={() => onChange(opt)}
                        style={{
                            flex: 1, padding: "8px 16px", borderRadius: 8, border: "none",
                            background: "transparent", cursor: "pointer",
                            fontSize: 12, fontWeight: 700, position: "relative", zIndex: 1,
                            color: value === opt ? (isDark ? "#0a0f08" : "#ffffff") : C.muted,
                            transition: "color 0.2s", fontFamily: "'DM Sans', sans-serif"
                        }}>
                    {opt}
                </button>
            ))}
        </div>
    )
}

// GRADIENT BORDER BUTTON
const GradientButton = ({ children, onClick, isDark }) => {
    const [isHover, setIsHover] = useState(false)

    return (
        <motion.div
            onHoverStart={() => setIsHover(true)}
            onHoverEnd={() => setIsHover(false)}
            style={{
                padding: 3, borderRadius: "0.9em", position: "relative",
                background: isDark ? "linear-gradient(90deg, #2dc9a0, #78b450)" : "linear-gradient(90deg, #1a6b4a, #2d5a2d)",
            }}>
            <AnimatePresence>
                {isHover && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "absolute", inset: -8, borderRadius: "0.9em", zIndex: -1,
                            background: isDark ? "linear-gradient(90deg, #2dc9a0, #78b450)" : "linear-gradient(90deg, #1a6b4a, #2d5a2d)",
                            filter: "blur(1.2em)", opacity: 0.6
                        }}
                    />
                )}
            </AnimatePresence>
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClick}
                style={{
                    width: "100%", padding: "10px 18px", borderRadius: "0.5em",
                    border: "none", background: isDark ? "#1c2a18" : "#1a2e1a",
                    color: isDark ? "#edf5e0" : "#ffffff",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                {children}
            </motion.button>
        </motion.div>
    )
}

// NOTIFICATION CARD (used for stats and activity items)
const NotificationCard = ({ children, color, isDark }) => {
    const C = getColors(isDark)
    const [isHover, setIsHover] = useState(false)

    return (
        <motion.div
            onHoverStart={() => setIsHover(true)}
            onHoverEnd={() => setIsHover(false)}
            whileHover={{ y: -2 }}
            style={{
                background: isDark ? "#18181b" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(120,180,80,0.15)" : "rgba(45,90,45,0.12)"}`,
                borderRadius: 12, padding: "14px 16px", position: "relative", overflow: "hidden",
                boxShadow: isHover ? `0 0 20px ${color || C.accent}30` : "none",
                transition: "box-shadow 0.3s"
            }}>
            {/* Colored left strip */}
            <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                background: `linear-gradient(180deg, ${color || C.accent}, ${color || C.accent}aa)`
            }} />
            {/* Radial glow on hover */}
            <AnimatePresence>
                {isHover && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.15, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: "absolute", top: "50%", left: "50%",
                            width: 100, height: 100, borderRadius: "50%",
                            background: `radial-gradient(circle, ${color || C.accent}, transparent)`,
                            transform: "translate(-50%, -50%)", pointerEvents: "none"
                        }}
                    />
                )}
            </AnimatePresence>
            <div style={{ position: "relative", zIndex: 1 }}>
                {children}
            </div>
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════ */

const NAV = [
    { icon: <Home size={18} />, label: "Dashboard", key: "dashboard", path: "/dashboard" },
    { icon: <Map size={18} />, label: "Heatmap", key: "heatmap", path: "/heatmap" },
    { icon: <Clipboard size={18} />, label: "Tasks", key: "tasks", path: "/tasks" },
    { icon: <Users size={18} />, label: "Volunteers", key: "volunteers", path: "/volunteers" },
    { icon: <FileText size={18} />, label: "Reports", key: "reports", path: "/reports" },
    { icon: <MessageSquare size={18} />, label: "Survey", key: "survey", path: "/survey" },
    { icon: <BarChart3 size={18} />, label: "Analytics", key: "analytics", path: "/analytics" },
    { icon: <Settings size={18} />, label: "Settings", key: "settings", path: "/settings" },
]

const Sidebar = ({ active, collapsed, setCollapsed, isDark }) => {
    const C = getColors(isDark)
    const navigate = useNavigate()

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 220 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
                background: C.card, borderRight: `1px solid ${C.border}`,
                height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 100,
                display: "flex", flexDirection: "column", overflow: "hidden"
            }}>
            {/* Logo */}
            <div style={{
                padding: "18px 14px", display: "flex", alignItems: "center", gap: 10,
                borderBottom: `1px solid ${C.border}`
            }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10, background: C.accent,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                    <Zap size={16} color={isDark ? "#0a0f08" : "#ffffff"} />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                            <p style={{ color: C.text, fontWeight: 800, fontSize: 20, margin: 0 }}>CivicPulse</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                {NAV.map(item => (
                    <motion.button key={item.key}
                                   whileHover={{ background: isDark ? "rgba(120,180,80,0.15)" : "rgba(45,90,45,0.15)" }}
                                   whileTap={{ scale: 0.97 }}
                                   onClick={() => navigate(item.path)}
                                   style={{
                                       display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
                                       borderRadius: 10, border: "none", cursor: "pointer", width: "100%",
                                       background: active === item.key ? (isDark ? "rgba(120,180,80,0.25)" : "rgba(45,90,45,0.25)") : "transparent",
                                       color: active === item.key ? C.text : C.muted, transition: "all 0.15s"
                                   }}>
                        <span style={{ flexShrink: 0, color: active === item.key ? C.accent : C.muted }}>
                            {item.icon}
                        </span>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                             style={{ fontSize: 13, fontWeight: active === item.key ? 700 : 500, whiteSpace: "nowrap" }}>
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </nav>

            {/* Toggle button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    margin: "12px 8px", padding: 10, borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.surface,
                    cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                <Menu size={18} />
            </motion.button>
        </motion.aside>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════════════════ */

const DetailDrawer = ({ vol, onClose, isDark }) => {
    const C = getColors(isDark)
    if (!vol) return null

    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const taskHistory = [
        { id: 1, title: "Medical camp setup", zone: "Dharavi", date: "2 days ago", status: "completed" },
        { id: 2, title: "Food distribution", zone: "Kurla", date: "5 days ago", status: "completed" },
        { id: 3, title: "Emergency response", zone: "Andheri", date: "1 week ago", status: "completed" },
        { id: 4, title: "Survey coordination", zone: "Bandra", date: "2 weeks ago", status: "completed" },
        { id: 5, title: "Supply logistics", zone: "Thane", date: "3 weeks ago", status: "completed" },
    ]

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)", zIndex: 200
                }}>
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: "fixed", right: 0, top: 0, bottom: 0, width: 440,
                        background: isDark ? "#111a0e" : C.card,
                        boxShadow: "-8px 0 40px rgba(0,0,0,0.3)",
                        display: "flex", flexDirection: "column", overflow: "auto"
                    }}>
                    {/* Header */}
                    <div style={{
                        padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
                            Volunteer Profile
                        </h3>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
                                       style={{
                                           width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                                           background: C.surface, cursor: "pointer",
                                           display: "flex", alignItems: "center", justifyContent: "center"
                                       }}>
                            <X size={16} color={C.muted} />
                        </motion.button>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Profile header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: 16,
                                background: `${vol.color}20`, border: `2px solid ${vol.color}40`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 24, fontWeight: 800, color: vol.color
                            }}>
                                {vol.initials}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <h4 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
                                        {vol.name}
                                    </h4>
                                    {vol.verified && <Shield size={16} color={C.green} />}
                                </div>
                                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{vol.role} Specialist</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            {[
                                { label: "Tasks", value: vol.tasks, icon: <Clipboard size={14} /> },
                                { label: "Hours", value: vol.hours, icon: <Clock size={14} /> },
                                { label: "Rating", value: vol.rating.toFixed(1), icon: <Star size={14} /> }
                            ].map((stat, i) => (
                                <div key={i} style={{
                                    background: C.surface, borderRadius: 10, padding: "12px",
                                    textAlign: "center", border: `1px solid ${C.border}`
                                }}>
                                    <div style={{ color: C.accent, marginBottom: 6, display: "flex", justifyContent: "center" }}>
                                        {stat.icon}
                                    </div>
                                    <p style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 2px" }}>
                                        {stat.value}
                                    </p>
                                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div>
                            <h5 style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: "0 0 10px", textTransform: "uppercase" }}>
                                Skills & Expertise
                            </h5>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {vol.skills.map((skill, i) => (
                                    <div key={i}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{skill}</span>
                                            <span style={{ fontSize: 11, color: C.muted }}>{90 - i * 5}%</span>
                                        </div>
                                        <div style={{
                                            height: 6, borderRadius: 3, background: C.surface,
                                            overflow: "hidden"
                                        }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${90 - i * 5}%` }}
                                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                                style={{
                                                    height: "100%",
                                                    background: `linear-gradient(90deg, ${C.accent}, ${C.green})`,
                                                    borderRadius: 3
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability */}
                        <div>
                            <h5 style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: "0 0 10px", textTransform: "uppercase" }}>
                                Weekly Availability
                            </h5>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                                {DAYS.map((day, i) => (
                                    <div key={i} style={{
                                        padding: "8px 4px", borderRadius: 8, textAlign: "center",
                                        background: vol.availability[i] ? `${C.green}20` : C.surface,
                                        border: `1px solid ${vol.availability[i] ? C.green : C.border}`
                                    }}>
                                        <p style={{
                                            fontSize: 10, fontWeight: 700, margin: 0,
                                            color: vol.availability[i] ? C.green : C.muted
                                        }}>
                                            {day}
                                        </p>
                                        <div style={{
                                            width: 4, height: 4, borderRadius: "50%", margin: "4px auto 0",
                                            background: vol.availability[i] ? C.green : C.border
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Task History */}
                        <div>
                            <h5 style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: "0 0 10px", textTransform: "uppercase" }}>
                                Recent Tasks
                            </h5>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {taskHistory.map((task, i) => (
                                    <NotificationCard key={task.id} color={C.blue} isDark={isDark}>
                                        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                                background: `${C.blue}20`, border: `1px solid ${C.blue}40`,
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <CheckCircle size={14} color={C.blue} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>
                                                    {task.title}
                                                </p>
                                                <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
                                                    {task.zone} · {task.date}
                                                </p>
                                            </div>
                                        </div>
                                    </NotificationCard>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h5 style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: "0 0 10px", textTransform: "uppercase" }}>
                                Contact Information
                            </h5>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Phone size={14} color={C.muted} />
                                    <span style={{ fontSize: 12, color: C.text }}>{vol.phone}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Mail size={14} color={C.muted} />
                                    <span style={{ fontSize: 12, color: C.text }}>{vol.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: "auto", paddingTop: 16 }}>
                            <GradientButton isDark={isDark}>
                                Assign New Task
                            </GradientButton>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VOLUNTEER CARD
   ═══════════════════════════════════════════════════════════════════════════ */

const VolunteerCard = ({ vol, onSelect, delay, isDark }) => {
    const C = getColors(isDark)
    const statusColors = {
        active: C.green,
        away: C.amber,
        inactive: C.muted
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, boxShadow: `0 8px 24px ${vol.color}30` }}
            onClick={() => onSelect(vol)}
            style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: 20, cursor: "pointer", position: "relative", overflow: "hidden"
            }}>
            {/* Left strip */}
            <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                background: vol.color, opacity: 0.6
            }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${vol.color}20`, border: `1.5px solid ${vol.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: vol.color
                }}>
                    {vol.initials}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>
                            {vol.name}
                        </h4>
                        {vol.verified && <Shield size={12} color={C.green} />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                            background: `${vol.color}15`, color: vol.color
                        }}>
                            {vol.role}
                        </span>
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                            background: `${statusColors[vol.status]}18`,
                            color: statusColors[vol.status],
                            textTransform: "capitalize"
                        }}>
                            <span style={{
                                width: 4, height: 4, borderRadius: "50%",
                                background: statusColors[vol.status],
                                boxShadow: vol.status === "active" ? `0 0 4px ${statusColors[vol.status]}` : "none"
                            }} />
                            {vol.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                {vol.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} style={{
                        fontSize: 9, fontWeight: 600, padding: "3px 7px", borderRadius: 5,
                        background: isDark ? "rgba(120,180,80,0.15)" : "rgba(45,90,45,0.1)",
                        color: C.accent, border: `1px solid ${isDark ? "rgba(120,180,80,0.25)" : "rgba(45,90,45,0.15)"}`
                    }}>
                        {skill}
                    </span>
                ))}
            </div>

            {/* Zone */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <MapPin size={12} color={C.muted} />
                <span style={{ fontSize: 11, color: C.muted }}>{vol.zone}</span>
            </div>

            {/* Reliability */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>Reliability</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.accent }}>
                        {(vol.rating * 20).toFixed(0)}%
                    </span>
                </div>
                <div style={{
                    height: 6, borderRadius: 3, background: C.surface, overflow: "hidden"
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${vol.rating * 20}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.6 }}
                        style={{
                            height: "100%",
                            background: `linear-gradient(90deg, ${C.green}, ${C.accent})`,
                            borderRadius: 3
                        }}
                    />
                </div>
            </div>

            {/* Stats row */}
            <div style={{
                display: "flex", gap: 12, marginBottom: 12,
                padding: "8px 0", borderTop: `1px solid ${C.border}`
            }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: "0 0 2px" }}>
                        {vol.tasks}
                    </p>
                    <p style={{ fontSize: 9, color: C.muted, margin: 0 }}>Tasks done</p>
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: "0 0 2px" }}>
                        {vol.hours}h
                    </p>
                    <p style={{ fontSize: 9, color: C.muted, margin: 0 }}>Hours logged</p>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1 }}>
                    <GradientButton isDark={isDark}>
                        Assign Task
                    </GradientButton>
                </div>
                {[
                    { icon: <Phone size={14} />, color: C.blue },
                    { icon: <Mail size={14} />, color: C.purple },
                    { icon: <Globe size={14} />, color: C.cyan }
                ].map((action, i) => (
                    <motion.button key={i}
                                   whileTap={{ scale: 0.9 }}
                                   style={{
                                       width: 36, height: 36, borderRadius: 8, border: "none",
                                       background: `${action.color}15`, color: action.color,
                                       cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                                   }}>
                        {action.icon}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function VolunteersPage() {
    const { isDark, setIsDark } = useTheme()
    const C = getColors(isDark)

    const [collapsed, setCollapsed] = useState(false)
    const [search, setSearch] = useState("")
    const [voiceActive, setVoiceActive] = useState(false)
    const [roleFilter, setRoleFilter] = useState("All")
    const [zoneFilter, setZoneFilter] = useState("All Zones")
    const [statusFilter, setStatusFilter] = useState("All")
    const [sortBy, setSortBy] = useState("Rating")
    const [selected, setSelected] = useState(null)

    // Filter volunteers
    const filtered = VOLUNTEERS.filter(v => {
        const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
        const matchRole = roleFilter === "All" || v.role === roleFilter
        const matchZone = zoneFilter === "All Zones" || v.zone === zoneFilter
        const matchStatus = statusFilter === "All" || v.status === statusFilter
        return matchSearch && matchRole && matchZone && matchStatus
    }).sort((a, b) => {
        if (sortBy === "Rating") return b.rating - a.rating
        if (sortBy === "Tasks") return b.tasks - a.tasks
        if (sortBy === "Name") return a.name.localeCompare(b.name)
        return 0
    })

    // Stats
    const totalVols = VOLUNTEERS.length
    const available = VOLUNTEERS.filter(v => v.status === "active").length
    const avgReliability = (VOLUNTEERS.reduce((sum, v) => sum + v.rating, 0) / totalVols).toFixed(1)
    const activeTasks = VOLUNTEERS.reduce((sum, v) => sum + (v.status === "active" ? 1 : 0), 0) * 2

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
            <Sidebar active="volunteers" collapsed={collapsed} setCollapsed={setCollapsed} isDark={isDark} />

            <div style={{ flex: 1, marginLeft: collapsed ? 64 : 220, transition: "margin 0.25s" }}>
                {/* Topbar */}
                <div style={{
                    background: C.card, borderBottom: `1px solid ${C.border}`,
                    padding: "16px 24px", display: "flex", alignItems: "center",
                    justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50
                }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 4px" }}>
                            Volunteer Directory
                        </h1>
                        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                            {filtered.length} volunteers found
                        </p>
                    </div>
                    <DarkLightToggle isDark={isDark} setIsDark={setIsDark} />
                </div>

                {/* Main content */}
                <div style={{ padding: "24px" }}>
                    {/* Top stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
                        {[
                            { label: "Total Volunteers", value: totalVols, color: C.blue },
                            { label: "Available Now", value: available, color: C.green, pulse: true },
                            { label: "Avg Reliability", value: `${avgReliability}/5.0`, color: C.purple },
                            { label: "Active Tasks", value: activeTasks, color: C.amber }
                        ].map((stat, i) => (
                            <motion.div key={i}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}>
                                <NotificationCard color={stat.color} isDark={isDark}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: `${stat.color}20`, flexShrink: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            {stat.pulse && (
                                                <motion.div
                                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    style={{
                                                        position: "absolute", width: 8, height: 8,
                                                        borderRadius: "50%", background: C.green
                                                    }}
                                                />
                                            )}
                                            <span style={{
                                                width: 8, height: 8, borderRadius: "50%",
                                                background: stat.color
                                            }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 2px" }}>
                                                {stat.value}
                                            </p>
                                            <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{stat.label}</p>
                                        </div>
                                    </div>
                                </NotificationCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search + Filters */}
                    <div style={{ marginBottom: 24 }}>
                        {/* Search row */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                            <div style={{
                                flex: 1, display: "flex", alignItems: "center", gap: 10,
                                background: C.card, border: `1px solid ${C.border}`,
                                borderRadius: 10, padding: "0 12px"
                            }}>
                                <Search size={16} color={C.muted} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name, role, or skill..."
                                    style={{
                                        flex: 1, background: "transparent", border: "none",
                                        outline: "none", color: C.text, fontSize: 13,
                                        padding: "10px 0", fontFamily: "'DM Sans', sans-serif"
                                    }}
                                />
                                {search && (
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSearch("")}
                                                   style={{
                                                       background: "none", border: "none", cursor: "pointer", padding: 4
                                                   }}>
                                        <X size={14} color={C.muted} />
                                    </motion.button>
                                )}
                            </div>
                            <MicToggle active={voiceActive} setActive={setVoiceActive} />
                        </div>

                        {/* Filter row */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <LiquidRadio
                                    options={["All", "Medical", "Logistics", "Field", "Tech"]}
                                    value={roleFilter}
                                    onChange={setRoleFilter}
                                    isDark={isDark}
                                />
                            </div>
                            <div style={{ minWidth: 140 }}>
                                <select
                                    value={zoneFilter}
                                    onChange={e => setZoneFilter(e.target.value)}
                                    style={{
                                        width: "100%", padding: "8px 32px 8px 12px", borderRadius: 10,
                                        border: `1px solid ${C.border}`, background: C.card,
                                        color: C.text, fontSize: 12, fontWeight: 600,
                                        cursor: "pointer", appearance: "none",
                                        fontFamily: "'DM Sans', sans-serif"
                                    }}>
                                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                            </div>
                            <div style={{ minWidth: 140 }}>
                                <PillToggle
                                    options={["Available", "All"]}
                                    value={statusFilter === "active" ? "Available" : "All"}
                                    onChange={v => setStatusFilter(v === "Available" ? "active" : "All")}
                                    isDark={isDark}
                                />
                            </div>
                            <div style={{ minWidth: 140 }}>
                                <LiquidRadio
                                    options={["Rating", "Tasks", "Name"]}
                                    value={sortBy}
                                    onChange={setSortBy}
                                    isDark={isDark}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cards grid */}
                    {filtered.length === 0 ? (
                        <NotificationCard color={C.amber} isDark={isDark}>
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <Users size={36} color={C.muted} style={{ marginBottom: 12 }} />
                                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
                                    No volunteers found
                                </p>
                                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                                    Try adjusting your filters
                                </p>
                            </div>
                        </NotificationCard>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: 16
                        }}>
                            {filtered.map((vol, i) => (
                                <VolunteerCard
                                    key={vol.id}
                                    vol={vol}
                                    onSelect={setSelected}
                                    delay={i * 0.05}
                                    isDark={isDark}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <DetailDrawer vol={selected} onClose={() => setSelected(null)} isDark={isDark} />
        </div>
    )
}