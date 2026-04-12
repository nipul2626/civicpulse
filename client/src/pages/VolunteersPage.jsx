import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Filter, MapPin, Star, Clock, CheckCircle,
    Users, Zap, Heart, X, Award, Phone,
    TrendingUp, Shield, ArrowUpRight, ChevronDown
} from "lucide-react"

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
    s300:    "#7ab870",
    amber:   "#c07a0a",
    red:     "#b84c2e",
    cyan:    "#1a6b7a",
}

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
        color: "#4a7a44",
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

const statusColors = { active: C.s300, away: C.amber, inactive: C.faint }

const StatusBadge = ({ status }) => (
    <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
        background: status === "active" ? `${C.s300}18` : status === "away" ? `${C.amber}18` : `${C.faint}40`,
        color: statusColors[status],
        textTransform: "capitalize",
        border: `1px solid ${statusColors[status]}30`,
    }}>
        <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: statusColors[status],
            boxShadow: status === "active" ? `0 0 5px ${C.s300}` : "none",
            display: "inline-block",
        }} />
        {status}
    </span>
)

// Clean volunteer card — less dense, more breathable
const VolunteerCard = ({ vol, onSelect, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(45,90,45,0.10)", transition: { duration: 0.18 } }}
        onClick={() => onSelect(vol)}
        style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "20px",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "border-color .2s",
        }}>

        {/* Left color strip */}
        <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: 3, background: vol.color, opacity: 0.6,
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${vol.color}20`,
                border: `1.5px solid ${vol.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: vol.color, flexShrink: 0,
            }}>
                {vol.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>{vol.name}</p>
                    {vol.verified && <CheckCircle size={12} style={{ color: C.s300, flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: 11, color: vol.color, fontWeight: 700, margin: 0 }}>{vol.role}</p>
            </div>
            <StatusBadge status={vol.status} />
        </div>

        {/* Bio — 2 lines max */}
        <p style={{
            fontSize: 12, color: C.muted, margin: "0 0 12px", lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
            {vol.bio}
        </p>

        {/* Skills — max 3 shown */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {vol.skills.slice(0, 3).map(sk => (
                <span key={sk} style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                    background: `${C.f500}12`, color: C.f400,
                    border: `1px solid ${C.f500}20`,
                }}>{sk}</span>
            ))}
        </div>

        {/* Footer row — zone + 2 key stats only */}
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingTop: 12, borderTop: `1px solid ${C.border}`,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={10} style={{ color: C.muted }} />
                <span style={{ fontSize: 11, color: C.muted }}>{vol.zone}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>{vol.tasks}</p>
                    <p style={{ fontSize: 9, color: C.muted, margin: 0, textTransform: "uppercase", letterSpacing: ".4px" }}>Tasks</p>
                </div>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>{vol.rating}</p>
                    <p style={{ fontSize: 9, color: C.muted, margin: 0, textTransform: "uppercase", letterSpacing: ".4px" }}>Rating</p>
                </div>
            </div>
        </div>
    </motion.div>
)

// Side drawer — full details
const DetailDrawer = ({ vol, onClose }) => (
    <AnimatePresence>
        {vol && (
            <>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400 }} />
                <motion.div
                    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 340, damping: 36 }}
                    style={{
                        position: "fixed", top: 0, right: 0, bottom: 0, width: 380,
                        background: C.surface, borderLeft: `1px solid ${C.border}`,
                        zIndex: 500, overflowY: "auto", padding: "28px 24px",
                        fontFamily: "'DM Sans', sans-serif",
                    }}>

                    {/* Close button */}
                    <motion.button whileTap={{ scale: .9 }} onClick={onClose}
                                   style={{
                                       position: "absolute", top: 18, right: 18,
                                       width: 30, height: 30, borderRadius: "50%",
                                       background: C.faint, border: "none", cursor: "pointer",
                                       display: "flex", alignItems: "center", justifyContent: "center",
                                   }}>
                        <X size={13} color={C.muted} />
                    </motion.button>

                    {/* Avatar + name */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 18,
                            background: `${vol.color}20`, border: `2px solid ${vol.color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, fontWeight: 900, color: vol.color, marginBottom: 12,
                        }}>{vol.initials}</div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: 0 }}>{vol.name}</h2>
                            {vol.verified && <CheckCircle size={14} style={{ color: C.s300 }} />}
                        </div>
                        <p style={{ fontSize: 12, color: vol.color, fontWeight: 700, margin: "0 0 8px" }}>{vol.role}</p>
                        <StatusBadge status={vol.status} />
                    </div>

                    {/* Bio */}
                    <div style={{
                        padding: "12px 14px", background: C.card, borderRadius: 10,
                        border: `1px solid ${C.border}`, marginBottom: 16,
                    }}>
                        <p style={{ fontSize: 12.5, color: C.text, lineHeight: 1.7, margin: 0 }}>{vol.bio}</p>
                    </div>

                    {/* Stats — 3 cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                        {[
                            { label: "Tasks", value: vol.tasks, color: C.s300 },
                            { label: "Hours", value: vol.hours, color: C.amber },
                            { label: "Rating", value: vol.rating, color: "#f0c040" },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: C.card, border: `1px solid ${C.border}`,
                                borderRadius: 10, padding: "10px 8px", textAlign: "center",
                            }}>
                                <p style={{ fontSize: 18, fontWeight: 900, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
                                <p style={{ fontSize: 9.5, color: C.muted, margin: 0, textTransform: "uppercase", letterSpacing: ".4px" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Skills */}
                    <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".8px", margin: "0 0 8px" }}>Skills</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {vol.skills.map(sk => (
                                <span key={sk} style={{
                                    fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20,
                                    background: `${C.f500}18`, color: C.f300,
                                    border: `1px solid ${C.f500}28`,
                                }}>{sk}</span>
                            ))}
                        </div>
                    </div>

                    {/* Meta info */}
                    <div style={{ marginBottom: 22 }}>
                        {[
                            { icon: MapPin,  label: "Zone",         value: vol.zone },
                            { icon: Clock,   label: "Member since", value: vol.joined },
                            { icon: Award,   label: "Verification", value: vol.verified ? "Verified" : "Pending" },
                        ].map(item => (
                            <div key={item.label} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "9px 0", borderBottom: `1px solid ${C.border}`,
                            }}>
                                <item.icon size={13} style={{ color: C.f500, flexShrink: 0 }} />
                                <span style={{ fontSize: 11.5, color: C.muted, minWidth: 100 }}>{item.label}</span>
                                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                       style={{
                                           width: "100%", padding: "11px", borderRadius: 10, border: "none",
                                           background: C.f500, color: "#dcebd6", fontSize: 13, fontWeight: 800,
                                           cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                           display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                       }}>
                            <Zap size={13} /> Assign Task
                        </motion.button>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {[
                                { icon: Phone, label: "Contact" },
                                { icon: Heart, label: "Favourite" },
                            ].map(btn => (
                                <motion.button key={btn.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                               style={{
                                                   padding: "9px", borderRadius: 9,
                                                   border: `1px solid ${C.border}`, background: "transparent",
                                                   color: C.muted, fontSize: 12, fontWeight: 700,
                                                   cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                                   display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                               }}>
                                    <btn.icon size={12} /> {btn.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
)

export default function VolunteersPage() {
    const [search, setSearch]   = useState("")
    const [role, setRole]       = useState("All Roles")
    const [status, setStatus]   = useState("All")
    const [zone, setZone]       = useState("All Zones")
    const [selected, setSelected] = useState(null)
    const [sortBy, setSortBy]   = useState("tasks")
    const [showFilters, setShowFilters] = useState(false)

    const filtered = VOLUNTEERS
        .filter(v =>
            (search === "" ||
                v.name.toLowerCase().includes(search.toLowerCase()) ||
                v.role.toLowerCase().includes(search.toLowerCase()) ||
                v.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) &&
            (role === "All Roles" || v.role === role) &&
            (status === "All" || v.status === status) &&
            (zone === "All Zones" || v.zone.includes(zone))
        )
        .sort((a, b) => {
            if (sortBy === "tasks")  return b.tasks - a.tasks
            if (sortBy === "rating") return b.rating - a.rating
            if (sortBy === "hours")  return b.hours - a.hours
            return 0
        })

    const activeCount   = VOLUNTEERS.filter(v => v.status === "active").length
    const totalHours    = VOLUNTEERS.reduce((acc, v) => acc + v.hours, 0)
    const totalTasks    = VOLUNTEERS.reduce((acc, v) => acc + v.tasks, 0)
    const verifiedCount = VOLUNTEERS.filter(v => v.verified).length
    const hasFilters    = role !== "All Roles" || status !== "All" || zone !== "All Zones"

    return (
        <div style={{
            minHeight: "100vh", background: C.bg, color: C.text,
            fontFamily: "'DM Sans', sans-serif",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(90,120,99,0.3); border-radius: 2px; }
                input, select { font-family: 'DM Sans', sans-serif; }
            `}</style>

            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px" }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 9,
                                background: `${C.f500}18`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Users size={16} style={{ color: C.f400 }} />
                            </div>
                            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, letterSpacing: "-.4px" }}>
                                Volunteers
                            </h1>
                        </div>
                        <p style={{ fontSize: 12, color: C.muted }}>
                            {filtered.length} of {VOLUNTEERS.length} volunteers · Sorted by {sortBy}
                        </p>
                    </div>

                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                                   style={{
                                       display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                                       borderRadius: 10, border: "none", background: C.f500,
                                       color: "#dcebd6", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                       fontFamily: "'DM Sans',sans-serif",
                                   }}>
                        <TrendingUp size={13} /> Add Volunteer
                    </motion.button>
                </motion.div>

                {/* Stats strip — 4 simple cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
                    {[
                        { label: "Total",     value: VOLUNTEERS.length, icon: Users,       color: C.f400  },
                        { label: "Active",    value: activeCount,       icon: Zap,         color: C.s300  },
                        { label: "Tasks Done",value: totalTasks,        icon: CheckCircle, color: C.cyan  },
                        { label: "Hours",     value: totalHours,        icon: Clock,       color: C.amber },
                    ].map((s, i) => (
                        <motion.div key={s.label}
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.06 + i * 0.04 }}
                                    style={{
                                        background: C.card, border: `1px solid ${C.border}`,
                                        borderRadius: 12, padding: "14px 16px",
                                        display: "flex", alignItems: "center", gap: 10,
                                    }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 9,
                                background: `${s.color}14`,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <s.icon size={15} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1 }}>{s.value}</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "3px 0 0" }}>{s.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search + filter bar */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        {/* Search */}
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center", gap: 9,
                            background: C.card, border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: "0 12px",
                        }}>
                            <Search size={14} style={{ color: C.muted, flexShrink: 0 }} />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, role or skill..."
                                style={{
                                    flex: 1, background: "transparent", border: "none", outline: "none",
                                    color: C.text, fontSize: 13, padding: "10px 0",
                                }} />
                            {search && (
                                <button onClick={() => setSearch("")}
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                    <X size={13} color={C.muted} />
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <div style={{ position: "relative" }}>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                    style={{
                                        padding: "0 30px 0 10px", height: 40, borderRadius: 10, outline: "none",
                                        border: `1px solid ${C.border}`, background: C.card,
                                        color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                        appearance: "none",
                                    }}>
                                <option value="tasks">By Tasks</option>
                                <option value="rating">By Rating</option>
                                <option value="hours">By Hours</option>
                            </select>
                            <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
                        </div>

                        {/* Filter toggle */}
                        <motion.button whileTap={{ scale: .97 }}
                                       onClick={() => setShowFilters(f => !f)}
                                       style={{
                                           display: "flex", alignItems: "center", gap: 6, padding: "0 14px",
                                           borderRadius: 10,
                                           border: `1px solid ${showFilters || hasFilters ? C.f500 : C.border}`,
                                           background: showFilters || hasFilters ? `${C.f500}12` : C.card,
                                           color: showFilters || hasFilters ? C.f300 : C.muted,
                                           fontSize: 12, fontWeight: 600, cursor: "pointer",
                                           fontFamily: "'DM Sans',sans-serif",
                                       }}>
                            <Filter size={13} /> Filters
                            {hasFilters && (
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.s300 }} />
                            )}
                        </motion.button>
                    </div>

                    {/* Expanded filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    display: "flex", gap: 12, flexWrap: "wrap",
                                    padding: "14px 16px",
                                    background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
                                    overflow: "hidden",
                                }}>
                                {[
                                    { label: "Role",   value: role,   options: ROLES,    onChange: setRole },
                                    { label: "Status", value: status, options: STATUSES, onChange: setStatus },
                                    { label: "Zone",   value: zone,   options: ZONES,    onChange: setZone },
                                ].map(f => (
                                    <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{f.label}</span>
                                        <div style={{ position: "relative" }}>
                                            <select value={f.value} onChange={e => f.onChange(e.target.value)}
                                                    style={{
                                                        padding: "5px 26px 5px 9px", borderRadius: 7, outline: "none",
                                                        border: `1px solid ${C.border}`, background: C.surface,
                                                        color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                                        appearance: "none",
                                                    }}>
                                                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                            <ChevronDown size={10} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
                                        </div>
                                    </div>
                                ))}
                                {hasFilters && (
                                    <button onClick={() => { setRole("All Roles"); setStatus("All"); setZone("All Zones") }}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 5,
                                                padding: "5px 10px", borderRadius: 7,
                                                border: `1px solid rgba(184,85,71,0.25)`,
                                                background: "rgba(184,85,71,0.08)", color: C.red,
                                                fontSize: 11, fontWeight: 700, cursor: "pointer",
                                                fontFamily: "'DM Sans',sans-serif",
                                            }}>
                                        <X size={10} /> Clear
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Cards grid */}
                {filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ textAlign: "center", padding: "60px 0" }}>
                        <Users size={36} style={{ color: C.faint, margin: "0 auto 12px" }} />
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.muted }}>No volunteers found</p>
                        <p style={{ fontSize: 12, color: C.faint, marginTop: 5 }}>Try adjusting your filters</p>
                    </motion.div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 14,
                    }}>
                        {filtered.map((vol, i) => (
                            <VolunteerCard
                                key={vol.id} vol={vol}
                                onSelect={setSelected}
                                delay={i * 0.035}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DetailDrawer vol={selected} onClose={() => setSelected(null)} />
        </div>
    )
}