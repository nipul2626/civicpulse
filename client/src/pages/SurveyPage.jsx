import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
    Utensils, Heart, Home, Droplets, BookOpen, MapPin, Upload, CheckCircle,
    Send, Users, Activity, Zap, Sun, Moon, Menu, Map, Clipboard, FileText,
    MessageSquare, BarChart3, Settings, X, Plus, Minus, Loader
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
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const CATEGORIES = [
    { key: "food", label: "Food", emoji: "🍱", color: "#F59E0B" },
    { key: "medical", label: "Medical", emoji: "❤️", color: "#EF4444" },
    { key: "shelter", label: "Shelter", emoji: "🏠", color: "#8B5CF6" },
    { key: "water", label: "Water", emoji: "💧", color: "#06B6D4" },
    { key: "education", label: "Education", emoji: "📚", color: "#10B981" },
    { key: "other", label: "Other", emoji: "⭐", color: "#6B7280" },
]

const URGENCY_LEVELS = [
    { level: 1, label: "Low", color: "#10B981" },
    { level: 2, label: "Medium", color: "#F59E0B" },
    { level: 3, label: "High", color: "#F97316" },
    { level: 4, label: "Critical", color: "#EF4444" },
]

const ZONES = [
    "Dharavi", "Kurla", "Andheri", "Bandra", "Chembur", "Ghatkopar",
    "Govandi", "Mankhurd", "Vikhroli", "Sion", "Thane", "Malad", "Colaba"
]

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// DARK/LIGHT TOGGLE
const DarkLightToggle = ({ isDark, setIsDark }) => (
    <label style={{ cursor: "pointer", position: "relative", width: 60, height: 30, display: "inline-block" }}>
        <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)}
               style={{ opacity: 0, width: 0, height: 0 }} />
        <motion.div
            animate={{ background: isDark ? "#1e293b" : "#3b82f6" }}
            style={{ position: "absolute", inset: 0, borderRadius: 20, transition: "0.3s" }}>
            {isDark && (
                <svg style={{ position: "absolute", top: 6, left: 8, width: 14, height: 14 }}>
                    <circle cx="2" cy="2" r="0.5" fill="#fff" opacity="0.8" />
                    <circle cx="8" cy="3" r="0.5" fill="#fff" opacity="0.6" />
                    <circle cx="5" cy="7" r="0.5" fill="#fff" opacity="0.9" />
                </svg>
            )}
            {!isDark && (
                <svg style={{ position: "absolute", top: 8, left: 6, width: 12, height: 8 }}>
                    <ellipse cx="4" cy="4" rx="4" ry="2.5" fill="#fff" opacity="0.7" />
                </svg>
            )}
        </motion.div>
        <motion.div
            animate={{ transform: isDark ? "translateX(30px)" : "translateX(3px)" }}
            style={{
                position: "absolute", top: 3, left: 0, width: 24, height: 24,
                background: isDark ? "#1e293b" : "#fbbf24",
                borderRadius: "50%", transition: "0.3s",
                boxShadow: isDark ? "0 0 0 1px #475569" : "0 0 3px rgba(251,191,36,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            {isDark ? <Moon size={12} color="#cbd5e1" /> : <Sun size={12} color="#fff" />}
        </motion.div>
    </label>
)

// MIC TOGGLE
const MicToggle = ({ active, setActive }) => (
    <label style={{ cursor: "pointer", position: "relative", display: "inline-block" }}>
        <input type="checkbox" checked={active} onChange={() => setActive(!active)}
               style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
        <motion.div
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: active ? 360 : 0, scale: active ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{
                width: 28, height: 28, borderRadius: 8,
                background: active ? "rgba(34,197,94,0.15)" : "rgba(120,113,108,0.1)",
                border: `1.5px solid ${active ? "#22c55e" : "#78716c"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s, border 0.2s"
            }}>
            {active ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2">
                    <line x1="2" y1="2" x2="22" y2="22" /><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                    <path d="M5 10v2a7 7 0 0 0 12 5" /><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" /><line x1="12" y1="19" x2="12" y2="22" />
                </svg>
            )}
        </motion.div>
    </label>
)

// GRADIENT BORDER BUTTON
const GradientButton = ({ children, onClick, disabled, isDark, small }) => {
    const [isHover, setIsHover] = useState(false)

    return (
        <motion.div
            onHoverStart={() => !disabled && setIsHover(true)}
            onHoverEnd={() => setIsHover(false)}
            style={{
                padding: 3, borderRadius: "0.9em", position: "relative",
                background: disabled
                    ? (isDark ? "rgba(120,180,80,0.2)" : "rgba(45,90,45,0.2)")
                    : (isDark ? "linear-gradient(90deg, #2dc9a0, #78b450)" : "linear-gradient(90deg, #1a6b4a, #2d5a2d)"),
                opacity: disabled ? 0.5 : 1
            }}>
            <AnimatePresence>
                {isHover && !disabled && (
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
                whileTap={disabled ? {} : { scale: 0.97 }}
                onClick={onClick}
                disabled={disabled}
                style={{
                    width: "100%", padding: small ? "8px 14px" : "10px 16px", borderRadius: "0.5em",
                    border: "none", background: isDark ? "#1c2a18" : "#1a2e1a",
                    color: isDark ? "#edf5e0" : "#ffffff",
                    fontSize: small ? 12 : 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 6
                }}>
                {children}
            </motion.button>
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

            {/* Toggle */}
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
   SUCCESS MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

const SuccessModal = ({ onClose, isDark }) => {
    const C = getColors(isDark)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)", zIndex: 200,
                display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: C.card, borderRadius: 20, padding: 40,
                    maxWidth: 420, width: "90%", textAlign: "center",
                    border: `1px solid ${C.border}`
                }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: `${C.green}20`, margin: "0 auto 20px",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                    <CheckCircle size={40} color={C.green} />
                </motion.div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>
                    Report Submitted!
                </h3>
                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 8px" }}>
                    AI scored urgency at <strong style={{ color: C.green }}>87/100</strong>
                </p>
                <p style={{ fontSize: 12, color: C.muted, margin: "0 0 24px" }}>
                    Matched to 3 volunteers · Reference: <strong>NR-{Math.floor(Math.random() * 9000) + 1000}</strong>
                </p>
                <GradientButton onClick={onClose} isDark={isDark}>
                    Submit Another Report
                </GradientButton>
            </motion.div>
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SurveyPage() {
    const { isDark, setIsDark } = useTheme()
    const C = getColors(isDark)

    const [collapsed, setCollapsed] = useState(false)
    const [category, setCategory] = useState("")
    const [urgency, setUrgency] = useState(2)
    const [zone, setZone] = useState("")
    const [address, setAddress] = useState("")
    const [people, setPeople] = useState(50)
    const [description, setDescription] = useState("")
    const [voiceActive, setVoiceActive] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const canSubmit = category && zone && address && description.length > 10

    const handleSubmit = () => {
        if (!canSubmit) return
        setSubmitting(true)
        setTimeout(() => {
            setSubmitting(false)
            setSuccess(true)
        }, 2000)
    }

    const reset = () => {
        setCategory("")
        setUrgency(2)
        setZone("")
        setAddress("")
        setPeople(50)
        setDescription("")
        setSuccess(false)
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
            <Sidebar active="survey" collapsed={collapsed} setCollapsed={setCollapsed} isDark={isDark} />

            <div style={{ flex: 1, marginLeft: collapsed ? 64 : 220, transition: "margin 0.25s" }}>
                {/* Topbar */}
                <div style={{
                    background: C.card, borderBottom: `1px solid ${C.border}`,
                    padding: "14px 24px", display: "flex", alignItems: "center",
                    justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50
                }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 2px" }}>
                            Report Community Need
                        </h1>
                        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                            Field survey submission · AI-powered routing
                        </p>
                    </div>
                    <DarkLightToggle isDark={isDark} setIsDark={setIsDark} />
                </div>

                {/* Main Form - Compact Single View */}
                <div style={{ padding: "20px 24px", maxWidth: 1400 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: C.card, border: `1px solid ${C.border}`,
                            borderRadius: 16, padding: "24px"
                        }}>

                        {/* SECTION 1: Category + Urgency in one row */}
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
                            {/* Categories */}
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 10, textTransform: "uppercase" }}>
                                    Category
                                </label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                                    {CATEGORIES.map((cat) => (
                                        <motion.button key={cat.key}
                                                       whileHover={{ scale: 1.02 }}
                                                       whileTap={{ scale: 0.98 }}
                                                       onClick={() => setCategory(cat.key)}
                                                       style={{
                                                           padding: "12px 10px", borderRadius: 10, cursor: "pointer",
                                                           border: category === cat.key ? `2px solid ${cat.color}` : `1px solid ${C.border}`,
                                                           background: category === cat.key ? `${cat.color}15` : C.surface,
                                                           fontFamily: "'DM Sans', sans-serif", position: "relative",
                                                           display: "flex", alignItems: "center", gap: 8,
                                                           transition: "all 0.2s"
                                                       }}>
                                            <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{cat.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Urgency */}
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 10, textTransform: "uppercase" }}>
                                    Urgency Level
                                </label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {URGENCY_LEVELS.map((urg) => (
                                        <motion.button key={urg.level}
                                                       whileTap={{ scale: 0.98 }}
                                                       onClick={() => setUrgency(urg.level)}
                                                       style={{
                                                           padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                                                           border: urgency === urg.level ? `2px solid ${urg.color}` : `1px solid ${C.border}`,
                                                           background: urgency === urg.level ? `${urg.color}15` : C.surface,
                                                           fontFamily: "'DM Sans', sans-serif",
                                                           fontSize: 12, fontWeight: 700,
                                                           color: urgency === urg.level ? urg.color : C.text,
                                                           display: "flex", alignItems: "center", justifyContent: "space-between",
                                                           transition: "all 0.2s"
                                                       }}>
                                            {urg.label}
                                            {urgency === urg.level && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    style={{ width: 6, height: 6, borderRadius: "50%", background: urg.color }} />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Location Details */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: 14, marginBottom: 20 }}>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                                    Zone
                                </label>
                                <select value={zone} onChange={e => setZone(e.target.value)}
                                        style={{
                                            width: "100%", padding: "10px 12px", borderRadius: 8,
                                            border: `1px solid ${C.border}`, background: C.surface,
                                            color: C.text, fontSize: 13, fontWeight: 600,
                                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                            outline: "none"
                                        }}>
                                    <option value="">Select zone...</option>
                                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                                    Address
                                </label>
                                <input
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Street or coordinates..."
                                    style={{
                                        width: "100%", padding: "10px 12px", borderRadius: 8,
                                        border: `1px solid ${C.border}`, background: C.surface,
                                        color: C.text, fontSize: 13, outline: "none",
                                        fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                                    People
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setPeople(Math.max(0, people - 10))}
                                        style={{
                                            width: 32, height: 32, borderRadius: 6,
                                            border: `1px solid ${C.border}`, background: C.surface,
                                            color: C.text, fontSize: 16, fontWeight: 700,
                                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                        <Minus size={14} />
                                    </motion.button>
                                    <input
                                        type="number"
                                        value={people}
                                        onChange={e => setPeople(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{
                                            flex: 1, padding: "10px", borderRadius: 8, textAlign: "center",
                                            border: `1px solid ${C.border}`, background: C.surface,
                                            color: C.text, fontSize: 14, fontWeight: 700,
                                            outline: "none", fontFamily: "'DM Sans', sans-serif",
                                            width: 50
                                        }}
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setPeople(people + 10)}
                                        style={{
                                            width: 32, height: 32, borderRadius: 6,
                                            border: `1px solid ${C.border}`, background: C.surface,
                                            color: C.text, fontSize: 16, fontWeight: 700,
                                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                        <Plus size={14} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: Description */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>
                                    Description
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <MicToggle active={voiceActive} setActive={setVoiceActive} />
                                    <span style={{ fontSize: 10, color: C.muted }}>{description.length}/500</span>
                                </div>
                            </div>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value.slice(0, 500))}
                                placeholder="Describe the situation in detail..."
                                style={{
                                    width: "100%", padding: "12px", borderRadius: 8,
                                    border: `1px solid ${C.border}`, background: C.surface,
                                    color: C.text, fontSize: 13, outline: "none",
                                    fontFamily: "'DM Sans', sans-serif", resize: "vertical",
                                    minHeight: 90, maxHeight: 140, boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {/* SECTION 4: Photo Upload + Submit */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14 }}>
                            <div style={{
                                padding: "20px", borderRadius: 10,
                                border: `2px dashed ${C.border}`, background: C.surface,
                                textAlign: "center", cursor: "pointer",
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                            }}>
                                <Upload size={20} color={C.muted} style={{ marginBottom: 6 }} />
                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                    Drop photo or click to upload
                                </p>
                            </div>

                            <div style={{ width: 200 }}>
                                <GradientButton
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || submitting}
                                    isDark={isDark}>
                                    {submitting ? (
                                        <>
                                            <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Submit Report
                                        </>
                                    )}
                                </GradientButton>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {success && <SuccessModal onClose={reset} isDark={isDark} />}
            </AnimatePresence>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}