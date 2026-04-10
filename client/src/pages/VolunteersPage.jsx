import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Filter, MapPin, Star, Clock, CheckCircle,
    Users, Zap, Heart, ChevronDown, X, Award, Phone,
    Mail, TrendingUp, Shield, Globe, ArrowUpRight
} from "lucide-react"
/* ─── PALETTE ─── */
const C = {
    bg:      "#eef2eb",
    surface: "#e2e8de",
    card:    "#ffffff",
    border:  "rgba(45,90,45,0.12)",
    text:    "#1a2e1a",
    muted:   "#5a7a5a",
    faint:   "#c8d8c4",
    f300:    "#4a7a44",
    f400:    "#3a6a34",
    f500:    "#2d5a2d",
    f600:    "#245024",
    f700:    "#1e441e",
    amber:   "#c07a0a",
    red:     "#b84c2e",
    cyan:    "#1a6b7a",
    purple:  "#5a3a8a",
    s300:    "#7ab870",
}
/* ─── VOLUNTEER DATA ─── */
const VOLUNTEERS = [
    {
        id: 1, name: "Arjun Mehta", initials: "AM", role: "Medical Aid",
        zone: "Dharavi, Mumbai", rating: 4.9, tasks: 142, hours: 380,
        skills: ["First Aid", "Triage", "Mental Health"],
        status: "active", verified: true, joined: "Jan 2023",
        bio: "Emergency medic with 6 years field experience. Specializes in rapid triage.",
        color: "#4f9191",
    },
    {
        id: 2, name: "Priya Nair", initials: "PN", role: "Logistics Coord",
        zone: "Andheri, Mumbai", rating: 4.8, tasks: 98, hours: 210,
        skills: ["Supply Chain", "Route Planning", "Inventory"],
        status: "active", verified: true, joined: "Mar 2023",
        bio: "Former logistics manager turning skills into community impact.",
        color: "#7a6bb5",
    },
    {
        id: 3, name: "Rohan Das", initials: "RD", role: "Field Surveyor",
        zone: "Kurla, Mumbai", rating: 4.6, tasks: 67, hours: 145,
        skills: ["Data Collection", "GIS Mapping", "Reporting"],
        status: "away", verified: true, joined: "Jun 2023",
        bio: "Civil engineer using field skills for disaster mapping and assessment.",
        color: "#c9923a",
    },
    {
        id: 4, name: "Sunita Patil", initials: "SP", role: "Child Welfare",
        zone: "Govandi, Mumbai", rating: 5.0, tasks: 203, hours: 510,
        skills: ["Child Care", "Counseling", "Education"],
        status: "active", verified: true, joined: "Oct 2022",
        bio: "Child psychologist volunteering in underserved urban zones.",
        color: "#b85547",
    },
    {
        id: 5, name: "Vikram Joshi", initials: "VJ", role: "Tech Support",
        zone: "Thane", rating: 4.7, tasks: 54, hours: 112,
        skills: ["IT Setup", "Communication", "Digital Tools"],
        status: "active", verified: false, joined: "Aug 2023",
        bio: "Software dev building digital bridges for grassroots orgs.",
        color: "#5A7863",
    },
    {
        id: 6, name: "Kavita Sharma", initials: "KS", role: "Food Distribution",
        zone: "Malad, Mumbai", rating: 4.5, tasks: 89, hours: 198,
        skills: ["Food Safety", "Community Outreach", "Cooking"],
        status: "inactive", verified: true, joined: "Feb 2023",
        bio: "Nutrition expert ensuring healthy meal distribution in flood-hit areas.",
        color: "#A8CE78",
    },
    {
        id: 7, name: "Deepak Kumar", initials: "DK", role: "Rescue Ops",
        zone: "Bandra, Mumbai", rating: 4.9, tasks: 176, hours: 440,
        skills: ["Swimming", "Rope Rescue", "Navigation"],
        status: "active", verified: true, joined: "Dec 2022",
        bio: "Ex-Navy rescue specialist. Can operate in extreme conditions.",
        color: "#4f9191",
    },
    {
        id: 8, name: "Ananya Singh", initials: "AS", role: "Legal Aid",
        zone: "Colaba, Mumbai", rating: 4.8, tasks: 41, hours: 95,
        skills: ["Legal Counsel", "Documentation", "Advocacy"],
        status: "away", verified: true, joined: "May 2023",
        bio: "Human rights lawyer providing free legal aid to disaster victims.",
        color: "#7a6bb5",
    },
]

const ROLES   = ["All Roles", "Medical Aid", "Logistics Coord", "Field Surveyor", "Child Welfare", "Tech Support", "Food Distribution", "Rescue Ops", "Legal Aid"]
const STATUSES = ["All", "active", "away", "inactive"]
const ZONES   = ["All Zones", "Dharavi", "Andheri", "Kurla", "Govandi", "Thane", "Malad", "Bandra", "Colaba"]

/* ─── TOOLTIP COMPONENT (adapted from user's provided animation) ─── */
const ShareTooltip = ({ name }) => (
    <div className="group relative flex justify-center items-center">
        <div style={{
            position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
            marginBottom: 10, pointerEvents: "none", zIndex: 50,
            opacity: 0, transition: "opacity .3s, transform .3s",
        }}
             className="group-hover:opacity-100"
        >
            <div style={{
                background: "#a3c09a", color: "#0D1F19", fontSize: 11, fontWeight: 700,
                padding: "5px 10px", borderRadius: 7, whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}>
                View {name}'s profile
            </div>
            <div style={{
                position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                width: 0, height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #a3c09a",
            }} />
        </div>
        <motion.div
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
                width: 34, height: 34, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.f500}, ${C.f700})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", border: `2px solid ${C.f600}`,
            }}>
            <ArrowUpRight size={14} color={C.f300} />
        </motion.div>
    </div>
)

/* ─── STATUS DOT ─── */
const StatusDot = ({ status }) => {
    const colors = { active: C.s300, away: C.amber, inactive: C.faint }
    return (
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700,
            color: colors[status], textTransform: "capitalize" }}>
      <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: colors[status],
          boxShadow: status === "active" ? `0 0 6px ${C.s300}` : "none",
          display: "inline-block",
      }} />
            {status}
    </span>
    )
}

/* ─── VOLUNTEER CARD ─── */
const VolunteerCard = ({ vol, onSelect, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={() => onSelect(vol)}
        style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: "20px 20px 18px",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "border-color .2s, box-shadow .2s",
        }}
        onHoverStart={e => {
            e.target.style && (e.target.style.borderColor = C.f500)
        }}
    >
        {/* Accent top bar */}
        <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 3, background: vol.color, opacity: 0.7,
        }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                {/* Avatar */}
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${vol.color}22`,
                    border: `2px solid ${vol.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 900, color: vol.color,
                    flexShrink: 0,
                }}>
                    {vol.initials}
                </div>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>{vol.name}</p>
                        {vol.verified && (
                            <div style={{
                                width: 16, height: 16, borderRadius: "50%",
                                background: `${C.s300}20`, display: "flex",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <CheckCircle size={10} style={{ color: C.s300 }} />
                            </div>
                        )}
                    </div>
                    <p style={{ fontSize: 11, color: vol.color, fontWeight: 700, margin: "2px 0 0" }}>{vol.role}</p>
                </div>
            </div>
            <StatusDot status={vol.status} />
        </div>

        {/* Bio */}
        <p style={{ fontSize: 11.5, color: C.muted, margin: "0 0 14px", lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {vol.bio}
        </p>

        {/* Skills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {vol.skills.map(sk => (
                <span key={sk} style={{
                    fontSize: 9.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                    background: `${C.f500}18`, color: C.f300,
                    border: `1px solid ${C.f500}25`,
                    letterSpacing: ".3px",
                }}>{sk}</span>
            ))}
        </div>

        {/* Stats row */}
        <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8, padding: "10px 0 0",
            borderTop: `1px solid ${C.border}`,
        }}>
            {[
                { icon: CheckCircle, label: "Tasks", value: vol.tasks },
                { icon: Clock,       label: "Hours", value: vol.hours },
                { icon: Star,        label: "Rating", value: vol.rating },
            ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 15, fontWeight: 900, color: C.text, margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: 9.5, color: C.muted, margin: "2px 0 0", letterSpacing: ".4px", textTransform: "uppercase" }}>{s.label}</p>
                </div>
            ))}
        </div>

        {/* Footer */}
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}`,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={10} style={{ color: C.muted }} />
                <span style={{ fontSize: 10.5, color: C.muted }}>{vol.zone}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={10} style={{ color: C.muted }} />
                <span style={{ fontSize: 10.5, color: C.muted }}>Since {vol.joined}</span>
            </div>
        </div>
    </motion.div>
)

/* ─── DETAIL DRAWER ─── */
const DetailDrawer = ({ vol, onClose }) => (
    <AnimatePresence>
        {vol && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={onClose}
                            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400 }} />
                <motion.div
                    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 320, damping: 34 }}
                    style={{
                        position: "fixed", top: 0, right: 0, bottom: 0, width: 400,
                        background: C.surface, borderLeft: `1px solid ${C.border}`,
                        zIndex: 500, overflowY: "auto", padding: "32px 28px",
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                    {/* Close */}
                    <motion.button whileTap={{ scale: .9 }} onClick={onClose}
                                   style={{
                                       position: "absolute", top: 20, right: 20,
                                       width: 32, height: 32, borderRadius: "50%",
                                       background: C.faint, border: "none", cursor: "pointer",
                                       display: "flex", alignItems: "center", justifyContent: "center",
                                   }}>
                        <X size={14} color={C.muted} />
                    </motion.button>

                    {/* Profile header */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: 20,
                            background: `${vol.color}22`, border: `2px solid ${vol.color}55`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 900, color: vol.color,
                            marginBottom: 14,
                        }}>{vol.initials}</div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>{vol.name}</h2>
                            {vol.verified && <CheckCircle size={16} style={{ color: C.s300 }} />}
                        </div>
                        <p style={{ fontSize: 12, color: vol.color, fontWeight: 700, margin: "0 0 8px" }}>{vol.role}</p>
                        <StatusDot status={vol.status} />
                    </div>

                    {/* Bio */}
                    <div style={{
                        padding: "14px 16px", background: C.card, borderRadius: 12,
                        border: `1px solid ${C.border}`, marginBottom: 18,
                    }}>
                        <p style={{ fontSize: 12.5, color: C.text, lineHeight: 1.7, margin: 0 }}>{vol.bio}</p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                        {[
                            { label: "Tasks Done", value: vol.tasks, icon: CheckCircle, color: C.s300 },
                            { label: "Total Hours", value: vol.hours, icon: Clock, color: C.amber },
                            { label: "Rating", value: vol.rating, icon: Star, color: "#f0c040" },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: C.card, border: `1px solid ${C.border}`,
                                borderRadius: 12, padding: "12px 10px", textAlign: "center",
                            }}>
                                <s.icon size={14} style={{ color: s.color, marginBottom: 4 }} />
                                <p style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: "2px 0" }}>{s.value}</p>
                                <p style={{ fontSize: 9.5, color: C.muted, margin: 0, textTransform: "uppercase", letterSpacing: ".4px" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Skills */}
                    <div style={{ marginBottom: 18 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                            letterSpacing: ".8px", margin: "0 0 10px" }}>Skills</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                            {vol.skills.map(sk => (
                                <span key={sk} style={{
                                    fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
                                    background: `${C.f500}20`, color: C.f300,
                                    border: `1px solid ${C.f500}30`,
                                }}>{sk}</span>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ marginBottom: 24 }}>
                        {[
                            { icon: MapPin, label: "Zone", value: vol.zone },
                            { icon: Clock, label: "Member since", value: vol.joined },
                            { icon: Award, label: "Verification", value: vol.verified ? "Verified Volunteer" : "Pending" },
                        ].map(item => (
                            <div key={item.label} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 0", borderBottom: `1px solid ${C.border}`,
                            }}>
                                <item.icon size={14} style={{ color: C.f500, flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: C.muted, minWidth: 110 }}>{item.label}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                       style={{
                                           width: "100%", padding: "11px", borderRadius: 11, border: "none",
                                           background: C.f500, color: "#dcebd6", fontSize: 13, fontWeight: 800,
                                           cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                           display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                       }}>
                            <Zap size={14} /> Assign Task
                        </motion.button>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                           style={{
                                               padding: "9px", borderRadius: 10,
                                               border: `1px solid ${C.border}`, background: "transparent",
                                               color: C.muted, fontSize: 12, fontWeight: 700,
                                               cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                               display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                           }}>
                                <Phone size={12} /> Contact
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                           style={{
                                               padding: "9px", borderRadius: 10,
                                               border: `1px solid ${C.border}`, background: "transparent",
                                               color: C.muted, fontSize: 12, fontWeight: 700,
                                               cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                               display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                           }}>
                                <Heart size={12} /> Favourite
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
)

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function VolunteerPage() {
    const [search, setSearch]   = useState("")
    const [role, setRole]       = useState("All Roles")
    const [status, setStatus]   = useState("All")
    const [zone, setZone]       = useState("All Zones")
    const [selected, setSelected] = useState(null)
    const [sortBy, setSortBy]   = useState("tasks")
    const [showFilters, setShowFilters] = useState(false)

    const filtered = VOLUNTEERS
        .filter(v =>
            (search === "" || v.name.toLowerCase().includes(search.toLowerCase()) ||
                v.role.toLowerCase().includes(search.toLowerCase()) ||
                v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) &&
            (role === "All Roles" || v.role === role) &&
            (status === "All" || v.status === status) &&
            (zone === "All Zones" || v.zone.includes(zone.replace("All Zones", "")))
        )
        .sort((a, b) => {
            if (sortBy === "tasks")  return b.tasks - a.tasks
            if (sortBy === "rating") return b.rating - a.rating
            if (sortBy === "hours")  return b.hours - a.hours
            return 0
        })

    const activeCount  = VOLUNTEERS.filter(v => v.status === "active").length
    const totalHours   = VOLUNTEERS.reduce((acc, v) => acc + v.hours, 0)
    const totalTasks   = VOLUNTEERS.reduce((acc, v) => acc + v.tasks, 0)
    const verifiedCount = VOLUNTEERS.filter(v => v.verified).length

    return (
        <div style={{
            minHeight: "100vh", background: C.bg, color: C.text,
            fontFamily: "'DM Sans', sans-serif",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(90,120,99,0.3); border-radius: 2px; }
        input, select { font-family: 'DM Sans', sans-serif; }
        .vol-card:hover { border-color: ${C.f500} !important; box-shadow: 0 8px 32px rgba(13,31,25,0.6); }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

            <div style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 32px" }}>

                {/* ── HEADER ── */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: `${C.f500}20`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Users size={18} style={{ color: C.f400 }} />
                            </div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: "-.5px" }}>
                                Volunteers
                            </h1>
                        </div>
                        <p style={{ fontSize: 12.5, color: C.muted, marginLeft: 2 }}>
                            {filtered.length} volunteers found · Sorted by {sortBy}
                        </p>
                    </div>

                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                                   style={{
                                       display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                                       borderRadius: 11, border: "none", background: C.f500,
                                       color: "#dcebd6", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                       fontFamily: "'DM Sans',sans-serif",
                                   }}>
                        <TrendingUp size={14} /> Add Volunteer
                    </motion.button>
                </motion.div>

                {/* ── STATS STRIP ── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
                    {[
                        { label: "Total Volunteers", value: VOLUNTEERS.length, icon: Users,       color: C.f400 },
                        { label: "Currently Active", value: activeCount,       icon: Zap,         color: C.s300 },
                        { label: "Tasks Completed",  value: totalTasks,        icon: CheckCircle, color: C.cyan },
                        { label: "Hours Contributed",value: totalHours,        icon: Clock,       color: C.amber },
                    ].map((s, i) => (
                        <motion.div key={s.label}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08 + i * 0.04 }}
                                    style={{
                                        background: C.card, border: `1px solid ${C.border}`,
                                        borderRadius: 14, padding: "16px 18px",
                                        display: "flex", alignItems: "center", gap: 12,
                                    }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: `${s.color}18`,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <s.icon size={16} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1 }}>{s.value}</p>
                                <p style={{ fontSize: 10.5, color: C.muted, margin: "3px 0 0", letterSpacing: ".3px" }}>{s.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── SEARCH + FILTERS ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
                            style={{ marginBottom: 24 }}>
                    {/* Search bar */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center", gap: 10,
                            background: C.card, border: `1px solid ${C.border}`,
                            borderRadius: 11, padding: "0 14px",
                        }}>
                            <Search size={15} style={{ color: C.muted, flexShrink: 0 }} />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, role or skill..."
                                style={{
                                    flex: 1, background: "transparent", border: "none", outline: "none",
                                    color: C.text, fontSize: 13, padding: "11px 0",
                                }} />
                            {search && (
                                <motion.button whileTap={{ scale: .9 }} onClick={() => setSearch("")}
                                               style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                    <X size={13} color={C.muted} />
                                </motion.button>
                            )}
                        </div>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                                       onClick={() => setShowFilters(f => !f)}
                                       style={{
                                           display: "flex", alignItems: "center", gap: 6, padding: "0 16px",
                                           borderRadius: 11,
                                           border: `1px solid ${showFilters ? C.f500 : C.border}`,
                                           background: showFilters ? `${C.f500}18` : C.card,
                                           color: showFilters ? C.f300 : C.muted,
                                           fontSize: 12, fontWeight: 700, cursor: "pointer",
                                           fontFamily: "'DM Sans',sans-serif",
                                       }}>
                            <Filter size={13} /> Filters
                            {(role !== "All Roles" || status !== "All" || zone !== "All Zones") && (
                                <span style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: C.s300, display: "inline-block",
                                }} />
                            )}
                        </motion.button>
                    </div>

                    {/* Filter row */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ display: "flex", gap: 10, flexWrap: "wrap", overflow: "hidden" }}>
                                {[
                                    { label: "Role", value: role, options: ROLES, onChange: setRole },
                                    { label: "Status", value: status, options: STATUSES, onChange: setStatus },
                                    { label: "Zone", value: zone, options: ZONES, onChange: setZone },
                                    { label: "Sort by", value: sortBy, options: ["tasks", "rating", "hours"], onChange: setSortBy },
                                ].map(f => (
                                    <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{f.label}</span>
                                        <select value={f.value} onChange={e => f.onChange(e.target.value)}
                                                style={{
                                                    padding: "6px 28px 6px 10px", borderRadius: 8, outline: "none",
                                                    border: `1px solid ${C.border}`, background: C.card,
                                                    color: C.text, fontSize: 11, fontWeight: 700, cursor: "pointer",
                                                    appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237a9b83'/%3E%3C/svg%3E")`,
                                                    backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
                                                }}>
                                            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                ))}
                                <motion.button whileTap={{ scale: .95 }}
                                               onClick={() => { setRole("All Roles"); setStatus("All"); setZone("All Zones"); setSortBy("tasks") }}
                                               style={{
                                                   padding: "6px 12px", borderRadius: 8, border: `1px solid rgba(184,85,71,0.3)`,
                                                   background: "rgba(184,85,71,0.1)", color: C.red,
                                                   fontSize: 11, fontWeight: 700, cursor: "pointer",
                                                   fontFamily: "'DM Sans',sans-serif",
                                                   display: "flex", alignItems: "center", gap: 5,
                                               }}>
                                    <X size={11} /> Clear
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── GRID ── */}
                {filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ textAlign: "center", padding: "80px 0" }}>
                        <Users size={40} style={{ color: C.faint, margin: "0 auto 14px" }} />
                        <p style={{ fontSize: 16, fontWeight: 700, color: C.muted }}>No volunteers found</p>
                        <p style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>Try adjusting your filters or search query</p>
                    </motion.div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: 16,
                    }}>
                        {filtered.map((vol, i) => (
                            <VolunteerCard
                                key={vol.id} vol={vol}
                                onSelect={setSelected}
                                delay={i * 0.04}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── DETAIL DRAWER ── */}
            <DetailDrawer vol={selected} onClose={() => setSelected(null)} />
        </div>
    )
}