import { useState } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { NavLink, useNavigate } from "react-router-dom"
import {
    Plus, Search, Zap, Clock, CheckCircle, User, X, MapPin,
    Calendar, Flame, Paperclip, LayoutDashboard, ClipboardList,
    BarChart3, FileText, Settings, LogOut, Users, ClipboardCheck,
    Mic, MicOff, ChevronLeft
} from "lucide-react"

/* ─── COLORS ─────────────────────────────────────────────────────────────── */
const C = {
    bg: "#eef2eb", surface: "#e2e8de", card: "#ffffff",
    border: "rgba(45,90,45,0.12)", text: "#1a2e1a", muted: "#5a7a5a",
    faint: "#c8d8c4", f300: "#4a7a44", f400: "#3a6a34", f500: "#2d5a2d",
    s300: "#7ab870", amber: "#c07a0a", red: "#b84c2e", cyan: "#1a6b7a", purple: "#5a3a8a",
}
const DC = {
    bg: "#0f1a0f", surface: "#162417", card: "#1e2e1f",
    border: "rgba(120,180,80,0.12)", text: "#edf5e0", muted: "#7a9b6a",
    faint: "#2a4a2a", f300: "#8aca70", f400: "#78b450", f500: "#5a9a35",
    s300: "#2dc9a0", amber: "#e8a020", red: "#e05a3a", cyan: "#3ec9b0", purple: "#9b7cf8",
}

const COLUMNS = [
    { id: "unassigned", label: "Unassigned", color: "#c0392b", dot: "#e05a3a", tint: "rgba(192,57,43,0.06)" },
    { id: "assigned",   label: "Assigned",   color: "#d4860a", dot: "#e8a020", tint: "rgba(212,134,10,0.06)" },
    { id: "inprogress", label: "In Progress",color: "#1a6b9a", dot: "#3ec9b0", tint: "rgba(26,107,154,0.06)" },
    { id: "completed",  label: "Completed",  color: "#1a6b4a", dot: "#2dc9a0", tint: "rgba(26,107,74,0.06)" },
]

const PRIORITY = {
    urgent: { bg: "rgba(184,76,46,0.1)",  text: "#b84c2e", label: "Urgent"  },
    high:   { bg: "rgba(192,122,10,0.1)", text: "#c07a0a", label: "High"    },
    medium: { bg: "rgba(26,107,122,0.1)", text: "#1a6b7a", label: "Medium"  },
    low:    { bg: "rgba(45,90,45,0.1)",   text: "#3a6a34", label: "Low"     },
}
const PRIORITY_D = {
    urgent: { bg: "rgba(224,90,58,0.15)", text: "#e05a3a", label: "Urgent" },
    high:   { bg: "rgba(232,160,32,0.15)",text: "#e8a020", label: "High"   },
    medium: { bg: "rgba(62,201,176,0.15)",text: "#3ec9b0", label: "Medium" },
    low:    { bg: "rgba(90,154,53,0.15)", text: "#5a9a35", label: "Low"    },
}

const CAT_EMOJI = { food: "🍱", medical: "❤️", shelter: "🏠", water: "💧", education: "📚", "Field Work": "🏕️", Logistics: "📦", Technology: "💻", Distribution: "🚚", Welfare: "🤝", "Legal Aid": "⚖️", Rescue: "🚨", Admin: "📋" }
const urgencyColor = (u, dark) => {
    if (u >= 5) return dark ? "#e05a3a" : "#b84c2e"
    if (u >= 4) return dark ? "#e8a020" : "#c07a0a"
    if (u >= 3) return dark ? "#3ec9b0" : "#1a6b7a"
    return dark ? "#5a9a35" : "#3a6a34"
}

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

const CATS_FILTER = ["all", "food", "medical", "shelter", "water", "education"]

/* ─── MOCK DATA ──────────────────────────────────────────────────────────── */
const INIT_TASKS = {
    unassigned: [
        { id:"t1", title:"Survey flood-hit Zone B households", desc:"Complete 50 household surveys in Govandi sector 4 before Thursday.", priority:"urgent", tags:["survey","field"], volunteer:"Rohan Das", zone:"Govandi", due:"Apr 15", attachments:2, urgency:5, category:"field" },
        { id:"t2", title:"Restock medical supply cache at Andheri hub", desc:"Coordinate with Dr. Arjun for inventory list and procure essentials.", priority:"high", tags:["medical","logistics"], volunteer:"Priya Nair", zone:"Andheri", due:"Apr 13", attachments:0, urgency:4, category:"medical" },
        { id:"t3", title:"Set up digital reporting terminals", desc:"Install 3 tablets with CivicPulse app in Kurla relief center.", priority:"medium", tags:["tech","setup"], volunteer:"Vikram Joshi", zone:"Kurla", due:"Apr 18", attachments:1, urgency:3, category:"education" },
    ],
    assigned: [
        { id:"t4", title:"Water distribution drive — Malad West", desc:"Coordinating 3 volunteer teams for daily water tanker distribution.", priority:"urgent", tags:["water","community"], volunteer:"Kavita Sharma", zone:"Malad", due:"Apr 12", attachments:1, urgency:5, category:"water", progress:65 },
        { id:"t5", title:"Child welfare assessment — Dharavi", desc:"Document children's conditions and connect families to support programs.", priority:"high", tags:["children","welfare"], volunteer:"Sunita Patil", zone:"Dharavi", due:"Apr 14", attachments:3, urgency:4, category:"medical", progress:40 },
    ],
    inprogress: [
        { id:"t6", title:"Legal documentation for displaced families", desc:"Help 25 families with emergency legal paperwork and ID replacement.", priority:"high", tags:["legal","documentation"], volunteer:"Ananya Singh", zone:"Colaba", due:"Apr 16", attachments:5, urgency:4, category:"shelter", progress:30 },
        { id:"t7", title:"Zone A rescue operation debrief", desc:"Compile incident report and lessons learned from Bandra rescue mission.", priority:"medium", tags:["report","rescue"], volunteer:"Deepak Kumar", zone:"Bandra", due:"Apr 11", attachments:4, urgency:3, category:"field" },
    ],
    completed: [
        { id:"t8", title:"Emergency food pack distribution — Round 1", desc:"1,200 food packs distributed across 5 zones successfully.", priority:"low", tags:["food","distribution"], volunteer:"Kavita Sharma", zone:"Multiple", due:"Apr 9", attachments:2, urgency:2, category:"food" },
        { id:"t9", title:"Volunteer onboarding — April batch", desc:"8 new volunteers briefed and assigned to their respective zones.", priority:"low", tags:["onboarding","training"], volunteer:"Priya Nair", zone:"HQ", due:"Apr 8", attachments:1, urgency:1, category:"education" },
    ],
}

const MOCK_VOLUNTEERS = ["Rohan Das","Priya Nair","Vikram Joshi","Kavita Sharma","Sunita Patil","Ananya Singh","Deepak Kumar"]

/* ─── REUSABLE COMPONENTS ────────────────────────────────────────────────── */

const GradBtn = ({ onClick, children, full }) => {
    return (
        <div
            className="grad-btn"
            onClick={onClick}
            style={{
                position: "relative",
                padding: 2,
                borderRadius: 10,
                background: "linear-gradient(45deg, #2dc9a0, #5a9a35, #8aca70)",
                cursor: "pointer",
                width: full ? "100%" : "auto"
            }}
        >
            <button
                style={{
                    position: "relative",
                    zIndex: 1,
                    border: "none",
                    borderRadius: 9,
                    padding: "9px 16px",
                    fontSize: 12,
                    fontWeight: 800,
                    background: "#0d1f0d",
                    color: "#d0f0a0",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    cursor: "pointer",
                    width: full ? "100%" : "auto",
                    justifyContent: "center"
                }}
            >
                {children}
            </button>

            <div className="glow-layer" />
        </div>
    )

}


const MicBtn = ({ active, onToggle }) => (
    <motion.button onClick={onToggle} whileHover={{ scale:1.1 }} whileTap={{ scale:.9 }}
                   style={{ width:32, height:32, borderRadius:"50%", border:"none", cursor:"pointer", background: active?"rgba(220,38,38,0.12)":"rgba(90,120,99,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <AnimatePresence mode="wait">
            <motion.div key={active?"on":"off"} initial={{ scale:0, rotate:-30 }} animate={{ scale:1, rotate:0 }} exit={{ scale:0, rotate:30 }} transition={{ duration:.18 }}>
                {active ? <Mic size={13} color="#dc2626"/> : <MicOff size={13} color="#90AB8B"/>}
            </motion.div>
        </AnimatePresence>
    </motion.button>
)

const PillToggle = ({ options, value, onChange, dark }) => {
    const idx = options.findIndex(o => o.value === value)
    const c = dark ? DC : C
    return (
        <div style={{ display:"flex", position:"relative", borderRadius:10, background: dark?"rgba(255,255,255,0.06)":"rgba(90,120,99,0.1)", padding:3, gap:2}}>
            <motion.div
                animate={{
                    left: `calc(${idx} * (100% / ${options.length}) + 3px)`
                }}
                transition={{ type:"spring", stiffness:420, damping:30 }}
                style={{
                    position:"absolute",
                    top:3,
                    bottom:3,
                    width:`calc(100% / ${options.length} - 6px)`,
                    background: dark ? c.f400 : c.f500,
                    borderRadius:8
                }}
            />
            {options.map(o=>(
                <button key={o.value} onClick={()=>onChange(o.value)} style={{
                    flex:1,
                    minWidth:60,
                    padding:"6px 10px",
                    border:"none",
                    background:"transparent",
                    fontSize:11,
                    fontWeight:700,
                    cursor:"pointer",
                    position:"relative",
                    zIndex:1,
                    textAlign:"center",
                    color: value===o.value ? "#fff" : c.muted,
                    fontFamily:"inherit",
                    whiteSpace:"nowrap"
                }}>{o.label}</button>
            ))}
        </div>
    )
}

const LiquidRadio = ({ options, value, onChange, dark, small }) => (
    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
        {options.map(o=>(
            <motion.button key={o.value} onClick={()=>onChange(o.value)} whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                           style={{ padding: small?"4px 9px":"5px 11px", borderRadius:20, border:"1.5px solid", fontSize:small?10:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all .18s", background: value===o.value?(o.color||(dark?DC.f400:C.f500)):"transparent", borderColor: value===o.value?(o.color||(dark?DC.f400:C.f500)):dark?"rgba(120,180,80,0.18)":"rgba(90,120,99,0.2)", color: value===o.value?"#fff":dark?DC.muted:C.muted }}>
                {o.label}
            </motion.button>
        ))}
    </div>
)

const NotifChip = ({ icon: Icon, value, label, color, dark }) => {
    const c = dark ? DC : C
    return (
        <div style={{ background: dark?c.card:c.card, borderRadius:12, overflow:"hidden", position:"relative", border:`1px solid ${c.border}`,minWidth:120,
            flex: "0 0 auto" }}>
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${color},${color}77)` }}/>
            <div style={{ padding:"8px 11px 8px 14px", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:8, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon size={12} color={color}/>
                </div>
                <div>
                    <p style={{ fontSize:16, fontWeight:900, color:c.text, margin:0, lineHeight:1 }}>{value}</p>
                    <p style={{ fontSize:9.5, color:c.muted, margin:"2px 0 0", fontWeight:600 }}>{label}</p>
                </div>
            </div>
        </div>
    )
}

const DayNightToggle = ({ dark, onToggle }) => (
    <motion.button onClick={onToggle} whileHover={{ scale:1.04 }} whileTap={{ scale:.95 }}
                   style={{ width:50, height:26, borderRadius:13, border:"none", cursor:"pointer", background: dark?"linear-gradient(135deg,#0a0f1a,#1a2540)":"linear-gradient(135deg,#87ceeb,#c8e6f5)", position:"relative", overflow:"hidden", flexShrink:0 }}>
        {dark ? [[8,5],[18,13],[34,7],[42,17]].map(([x,y],i)=><div key={i} style={{ position:"absolute", left:x, top:y, width:2, height:2, borderRadius:"50%", background:"#fff", opacity:.8 }}/>) : <div style={{ position:"absolute", left:6, top:8, width:12, height:6, borderRadius:6, background:"rgba(255,255,255,0.7)" }}/>}
        <motion.div animate={{ x: dark?24:2 }} transition={{ type:"spring", stiffness:400, damping:28 }} style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%", background: dark?"#e8d44d":"#ffb84d", boxShadow: dark?"0 0 8px #e8d44d88":"0 2px 8px rgba(255,150,0,.4)" }}/>
    </motion.button>
)

/* ─── SIDEBAR ────────────────────────────────────────────────────────────── */
const AppSidebar = ({ dark, onToggleDark, collapsed, onToggleCollapse }) => {
    const navigate = useNavigate()
    return (
        <motion.aside animate={{ width: collapsed?64:220 }} transition={{ type:"spring", stiffness:300, damping:30 }}
                      style={{ position:"fixed", left:0, top:0, bottom:0, zIndex:2000, background: dark?"#050a04":"#1C352D", overflow:"hidden", borderRight:"1px solid rgba(255,255,255,0.05)", display:"flex", flexDirection:"column", flexShrink:0 }}>
            <div style={{ padding:"16px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? "center" : "flex-start", }}>
                <div style={{ width:32, height:32, borderRadius:10, background:"#3a7a3a", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Zap size={15} color="#d0f0a0"/>
                </div>
                <AnimatePresence>
                    {!collapsed && <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }} style={{ overflow:"hidden", whiteSpace:"nowrap" }}>
                        <p style={{ fontSize:13, fontWeight:900, color:"#d0f0a0", margin:0 }}>CivicPulse</p>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>Coordinator</p>
                    </motion.div>}
                </AnimatePresence>
                <motion.button onClick={onToggleCollapse} whileHover={{ scale:1.1 }} style={{ marginLeft:"auto", background:"rgba(255,255,255,0.07)", border:"none", cursor:"pointer", borderRadius:7, width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ChevronLeft size={11} color="rgba(255,255,255,0.45)" style={{ transform:collapsed?"rotate(180deg)":"none", transition:"transform .3s" }}/>
                </motion.button>
            </div>
            <nav style={{ flex:1, padding:"8px", overflowY:"auto", display:"flex", flexDirection:"column", gap:2 }}>
                {NAV_ITEMS.map(({ to, icon:Icon, label })=>(
                    <NavLink key={to} to={to} style={({ isActive })=>({ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, textDecoration:"none", background: isActive
                            ? "linear-gradient(90deg, rgba(160,220,80,0.2), transparent)"
                            : "transparent",
                        borderLeft: isActive ? "3px solid #a0dc50" : "3px solid transparent",
                        paddingLeft: isActive ? 9 : 12, color: isActive?"#a0dc50":"rgba(255,255,255,0.42)", fontFamily:"inherit", fontSize:12.5, fontWeight:600, transition:"all .2s", whiteSpace:"nowrap", overflow:"hidden" })}>
                        <Icon size={17} style={{ flexShrink:0 }}/>
                        <AnimatePresence>{!collapsed && <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>{label}</motion.span>}</AnimatePresence>
                    </NavLink>
                ))}
            </nav>
            <div style={{ padding:"8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                {!collapsed && <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6, padding:"0 4px" }}>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.28)", fontFamily:"inherit" }}>Dark mode</span>
                    <DayNightToggle dark={dark} onToggle={onToggleDark}/>
                </div>}
                <button onClick={()=>navigate("/login")} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, border:"none", background:"transparent", cursor:"pointer", color:"rgba(255,255,255,0.28)", fontFamily:"inherit", fontSize:12.5 }}>
                    <LogOut size={16} style={{ flexShrink:0 }}/>{!collapsed&&"Sign out"}
                </button>
            </div>
        </motion.aside>
    )
}

/* ─── TASK CARD ──────────────────────────────────────────────────────────── */
const TaskCard = ({ task, colId, onClick, delay = 0, dark }) => {
    const c   = dark ? DC : C
    const p   = dark ? PRIORITY_D[task.priority] : PRIORITY[task.priority]
    const uc  = urgencyColor(task.urgency, dark)
    const emoji = CAT_EMOJI[task.category] || "📌"

    return (
        <motion.div layout
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:.96 }}
                    transition={{ delay, duration:.22 }}
                    whileHover={{
                        y: -6,
                        scale: 1.01,
                        boxShadow: dark
                            ? "0 12px 30px rgba(0,0,0,0.5)"
                            : "0 10px 25px rgba(45,90,45,0.15)",
                        transition: { duration: 0.15 }
                    }}
                    onClick={onClick}
                    style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:14, padding:"14px", cursor:"pointer", position:"relative", overflow:"hidden" }}>

            {/* Urgency left strip */}
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:uc, borderRadius:"14px 0 0 14px" }}/>

            <div style={{ paddingLeft:8 }}>
                {/* Top: category + priority */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <span style={{ fontSize:16 }}>{emoji}</span>

                    <span style={{
                        fontSize:10,
                        fontWeight:800,
                        padding:"3px 8px",
                        borderRadius:20,
                        background:p.bg,
                        color:p.text
                    }}>
        {p.label}
    </span>
                </div>

                {/* Title */}
                <p style={{ fontSize:12.5, fontWeight:800, color:c.text, margin:"0 0 4px", lineHeight:1.4 }}>{task.title}</p>

                {/* Desc */}
                <p style={{ fontSize:11, color:c.muted, margin:"0 0 9px", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{task.desc}</p>

                {/* Tags */}
                <div style={{ display:"flex", gap:4, marginBottom:9, flexWrap:"wrap" }}>
                    {task.tags.map(t=>(
                        <span key={t} style={{ fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:20, background: dark?DC.f500+"22":C.f500+"12", color: dark?DC.f300:C.f400 }}>#{t}</span>
                    ))}
                </div>

                {/* Progress bar */}
                {task.progress !== undefined && (
                    <div style={{ marginBottom:9 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ fontSize:10, color:c.muted }}>Progress</span>
                            <span style={{ fontSize:10, fontWeight:700, color: dark?DC.cyan:C.cyan }}>{task.progress}%</span>
                        </div>
                        <div style={{ height:4, background:c.faint, borderRadius:4, overflow:"hidden" }}>
                            <motion.div initial={{ width:0 }} animate={{ width:`${task.progress}%` }} transition={{ delay:delay+.2, duration:.6, ease:"easeOut" }}
                                        style={{ height:"100%", background: dark?DC.cyan:C.cyan, borderRadius:4 }}/>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:9, borderTop:`1px solid ${c.border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background:dark?DC.f500+"25":C.f500+"22", border:`1px solid ${dark?DC.f500+"35":C.f500+"30"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:800, color: dark?DC.f300:C.f300 }}>
                            {task.volunteer.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <span style={{ fontSize:10.5, color:c.muted }}>{task.volunteer}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {task.attachments>0 && <div style={{ display:"flex", alignItems:"center", gap:3 }}><Paperclip size={10} color={c.faint}/><span style={{ fontSize:10, color:c.faint }}>{task.attachments}</span></div>}
                        <div style={{ display:"flex", alignItems:"center", gap:3 }}><Calendar size={10} color={c.faint}/><span style={{ fontSize:10, color:c.faint }}>{task.due}</span></div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

/* ─── TASK MODAL ─────────────────────────────────────────────────────────── */
const TaskModal = ({ task, colId, onClose, onMove, dark }) => {
    if (!task) return null
    const c    = dark ? DC : C
    const p    = dark ? PRIORITY_D[task.priority] : PRIORITY[task.priority]
    const uc   = urgencyColor(task.urgency, dark)
    const cols = COLUMNS.map(col=>col.id)
    const idx  = cols.indexOf(colId)

    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
                    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(6px)" }}>
            <motion.div initial={{ scale:.93, y:18 }} animate={{ scale:1, y:0 }} exit={{ scale:.93, opacity:0 }}
                        transition={{ type:"spring", stiffness:380, damping:30 }} onClick={e=>e.stopPropagation()}
                        style={{ background:c.surface, border:`1px solid ${c.border}`, borderRadius:20, padding:"24px 22px 20px", maxWidth:480, width:"100%", position:"relative", maxHeight:"90vh", overflowY:"auto" }}>

                {/* Top accent bar */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:uc, borderRadius:"20px 20px 0 0" }}/>

                {/* Close */}
                <button onClick={onClose} style={{ position:"absolute", top:14, right:14, width:28, height:28, borderRadius:"50%", background:c.faint, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <X size={12} color={c.muted}/>
                </button>

                {/* Emoji + Title */}
                <div style={{ marginBottom:14 }}>
                    <span style={{ fontSize:28, display:"block", marginBottom:8 }}>{CAT_EMOJI[task.category] || "📌"}</span>
                    <h2 style={{ fontSize:17, fontWeight:900, color:c.text, margin:"0 0 6px", lineHeight:1.3 }}>{task.title}</h2>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:c.faint, color:c.muted, textTransform:"uppercase", letterSpacing:".5px" }}>{task.category}</span>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:p.bg, color:p.text }}>{p.label}</span>
                    </div>
                </div>

                <p style={{ fontSize:12.5, color:c.muted, margin:"0 0 16px", lineHeight:1.65 }}>{task.desc}</p>

                {/* Progress */}
                {task.progress !== undefined && (
                    <div style={{ marginBottom:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:c.text }}>Progress</span>
                            <span style={{ fontSize:11, fontWeight:800, color: dark?DC.cyan:C.cyan }}>{task.progress}%</span>
                        </div>
                        <div style={{ height:6, background:c.faint, borderRadius:6, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${task.progress}%`, background: dark?DC.cyan:C.cyan, borderRadius:6 }}/>
                        </div>
                    </div>
                )}

                {/* 2x2 info grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                    {[
                        { icon:User,     label:"Volunteer", value:task.volunteer },
                        { icon:MapPin,   label:"Zone",      value:task.zone      },
                        { icon:Calendar, label:"Due",       value:task.due       },
                        { icon:Flame,    label:"Urgency",   value:`Level ${task.urgency}/5` },
                    ].map(item=>(
                        <div key={item.label} style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:10, padding:"9px 11px", display:"flex", alignItems:"center", gap:7 }}>
                            <item.icon size={12} style={{ color: dark?DC.f400:C.f500, flexShrink:0 }}/>
                            <div>
                                <p style={{ fontSize:9, color:c.muted, margin:0, textTransform:"uppercase", letterSpacing:".5px" }}>{item.label}</p>
                                <p style={{ fontSize:12, fontWeight:700, color:c.text, margin:"2px 0 0" }}>{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tags */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:18 }}>
                    {task.tags.map(t=>(
                        <span key={t} style={{ fontSize:10.5, fontWeight:700, padding:"4px 10px", borderRadius:20, background: dark?DC.f500+"22":C.f500+"14", color: dark?DC.f300:C.f300, border:`1px solid ${dark?DC.f500+"22":C.f500+"22"}` }}>#{t}</span>
                    ))}
                </div>

                {/* Action buttons */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {idx > 0 && (
                        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }} onClick={()=>{ onMove(task.id,colId,COLUMNS[idx-1].id); onClose() }}
                                       style={{ flex:1, padding:"10px", borderRadius:10, border:`1px solid ${c.border}`, background:"transparent", color:c.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                            ← Move Back
                        </motion.button>
                    )}
                    {idx < COLUMNS.length - 1 && (
                        <GradBtn onClick={()=>{ onMove(task.id,colId,COLUMNS[idx+1].id); onClose() }}>
                            Move to {COLUMNS[idx+1].label} →
                        </GradBtn>
                    )}
                    {idx === COLUMNS.length - 1 && (
                        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }} onClick={onClose}
                                       style={{ flex:1, padding:"10px", borderRadius:10, border:`1px solid ${c.border}`, background:"transparent", color:c.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                            ✓ Mark Done
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

/* ─── NEW TASK MODAL ─────────────────────────────────────────────────────── */
const NewTaskModal = ({ onClose, onAdd, dark }) => {
    const c = dark ? DC : C
    const [form, setForm] = useState({ title:"", category:"food", priority:"medium", zone:"", due:"", volunteer:MOCK_VOLUNTEERS[0], desc:"" })
    const set = k => e => setForm(p=>({...p,[k]:e.target.value}))
    const ib = { width:"100%", padding:"10px 13px", borderRadius:11, fontSize:12.5, border:`1.5px solid ${c.border}`, background:c.card, color:c.text, outline:"none", fontFamily:"inherit" }

    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
                    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(6px)" }}>
            <motion.div initial={{ scale:.9, y:24, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} exit={{ scale:.9, y:16, opacity:0 }}
                        transition={{ type:"spring", stiffness:360, damping:28 }} onClick={e=>e.stopPropagation()}
                        style={{ background:c.surface, border:`1px solid ${c.border}`, borderRadius:20, padding:26, maxWidth:500, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background: dark?DC.f400:C.f500, display:"flex", alignItems:"center", justifyContent:"center" }}><Plus size={16} color="#d0f0a0"/></div>
                        <div>
                            <p style={{ fontSize:16, fontWeight:900, color:c.text, margin:0 }}>New Task</p>
                            <p style={{ fontSize:10.5, color:c.muted, margin:0 }}>Add to board</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:28, height:28, borderRadius:9, border:"none", background:c.faint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={13} color={c.muted}/></button>
                </div>

                <div style={{ display:"grid", gap:13 }}>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color:c.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".5px" }}>Title</label>
                        <input value={form.title} onChange={set("title")} placeholder="Task title..." style={ib}/>
                    </div>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color:c.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>Category</label>
                        <LiquidRadio options={["food","medical","shelter","water","education"].map(c2=>({ value:c2, label:(CAT_EMOJI[c2]||"")+" "+c2[0].toUpperCase()+c2.slice(1) }))} value={form.category} onChange={v=>setForm(p=>({...p,category:v}))} dark={dark} small/>
                    </div>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color:c.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>Priority</label>
                        <LiquidRadio options={[{value:"urgent",label:"🔴 Urgent"},{value:"high",label:"🟠 High"},{value:"medium",label:"🔵 Medium"},{value:"low",label:"🟢 Low"}]} value={form.priority} onChange={v=>setForm(p=>({...p,priority:v}))} dark={dark} small/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        <div>
                            <label style={{ fontSize:10, fontWeight:700, color:c.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".5px" }}>Zone</label>
                            <input value={form.zone} onChange={set("zone")} placeholder="e.g. Dharavi" style={ib}/>
                        </div>
                        <div>
                            <label style={{ fontSize:10, fontWeight:700, color:c.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".5px" }}>Due Date</label>
                            <input value={form.due} onChange={set("due")} placeholder="e.g. Apr 20" style={ib}/>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color:c.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".5px" }}>Assign Volunteer</label>
                        <select value={form.volunteer} onChange={set("volunteer")} style={{ ...ib, appearance:"none" }}>
                            {MOCK_VOLUNTEERS.map(v=><option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize:10, fontWeight:700, color:c.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".5px" }}>Description</label>
                        <textarea value={form.desc} onChange={set("desc")} rows={3} placeholder="Task description..." style={{ ...ib, resize:"none" }}/>
                    </div>
                    <GradBtn full onClick={()=>{
                        if (!form.title.trim()) return
                        onAdd({ id:"t"+Date.now(), ...form, tags:[form.category], attachments:0, urgency:form.priority==="urgent"?5:form.priority==="high"?4:form.priority==="medium"?3:2 })
                        onClose()
                    }}>
                        <Plus size={13}/> Add Task to Board
                    </GradBtn>
                </div>
            </motion.div>
        </motion.div>
    )
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function TasksPage() {
    const [dark,          setDark]         = useState(false)
    const [collapsed,     setCollapsed]    = useState(false)
    const [tasks,         setTasks]        = useState(INIT_TASKS)
    const [search,        setSearch]       = useState("")
    const [micActive,     setMicActive]    = useState(false)
    const [catFilter,     setCatFilter]    = useState("all")
    const [prioFilter,    setPrioFilter]   = useState("all")
    const [viewMode,      setViewMode]     = useState("board")
    const [selected,      setSelected]     = useState(null)
    const [selectedCol,   setSelectedCol]  = useState(null)
    const [showNewTask,   setShowNewTask]  = useState(false)

    const c    = dark ? DC : C
    const sidW = collapsed ? 64 : 220

    const moveTask = (taskId, fromCol, toCol) => {
        setTasks(prev => {
            const task = prev[fromCol].find(t => t.id === taskId)
            return { ...prev, [fromCol]: prev[fromCol].filter(t=>t.id!==taskId), [toCol]: [...prev[toCol], task] }
        })
    }

    const addTask = (task) => setTasks(prev => ({ ...prev, unassigned: [task, ...prev.unassigned] }))

    const filteredTasks = (colId) => tasks[colId].filter(t =>
        (search==="" || t.title.toLowerCase().includes(search.toLowerCase()) || t.volunteer.toLowerCase().includes(search.toLowerCase()) || t.tags.some(g=>g.toLowerCase().includes(search.toLowerCase()))) &&
        (catFilter==="all" || t.category===catFilter || t.tags.includes(catFilter)) &&
        (prioFilter==="all" || t.priority===prioFilter)
    )

    const allFlat   = Object.values(tasks).flat()
    const totalTasks = allFlat.length
    const urgentCount = allFlat.filter(t=>t.priority==="urgent").length
    const doneCount  = tasks.completed.length
    const inProgCount = tasks.inprogress.length

    return (
        <div style={{ position:"fixed", inset:0, display:"flex", fontFamily:"'DM Sans',sans-serif", background:c.bg }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:rgba(90,120,99,0.3);border-radius:2px}input,select,textarea{font-family:'DM Sans',sans-serif}`}</style>

            <AppSidebar dark={dark} onToggleDark={()=>setDark(d=>!d)} collapsed={collapsed} onToggleCollapse={()=>setCollapsed(cc=>!cc)}/>

            <motion.div animate={{ marginLeft: sidW }} transition={{ type:"spring", stiffness:300, damping:30 }}
                        style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

                {/* TOPBAR */}
                <div style={{ flexShrink:0, padding:"14px 20px", background:c.surface, borderBottom:`1px solid ${c.border}` }}>
                    {/* Title row */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:10, background: dark?DC.f500+"22":C.f500+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <ClipboardList size={16} color={dark?DC.f400:C.f400}/>
                            </div>
                            <div>
                                <h1 style={{ fontSize:19, fontWeight:900, color:c.text, margin:0, letterSpacing:"-.3px" }}>Task Board</h1>
                                <p style={{ fontSize:10.5, color:c.muted, margin:"1px 0 0" }}>Drag cards between columns to update status</p>
                            </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <PillToggle options={[{value:"board",label:"⊞ Board"},{value:"list",label:"≡ List"}]} value={viewMode} onChange={setViewMode} dark={dark}/>
                            <GradBtn onClick={()=>setShowNewTask(true)}><Plus size={13}/> New Task</GradBtn>
                        </div>
                    </div>

                    {/* Stats + search row */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            <NotifChip icon={ClipboardList} value={totalTasks}  label="Total"      color="#5b5bf0" dark={dark}/>
                            <NotifChip icon={Flame}         value={urgentCount} label="Urgent"     color={dark?DC.red:C.red} dark={dark}/>
                            <NotifChip icon={Clock}         value={inProgCount} label="In Progress" color={dark?DC.cyan:C.cyan} dark={dark}/>
                            <NotifChip icon={CheckCircle}   value={doneCount}   label="Completed"   color={dark?DC.s300:C.s300} dark={dark}/>
                        </div>
                        <div style={{ flex:1, minWidth:220, display:"flex", alignItems:"center", gap:10, background:c.card, border:`1px solid ${c.border}`, borderRadius:12, padding:"0 13px",height:38 }}>
                            <Search size={12} color={c.muted}/>
                            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks, volunteers, tags..."
                                   style={{ flex:1, background:"transparent", border:"none", outline:"none", color:c.text, fontSize:12.5, padding:"8px 0" }}/>
                            {search && <button onClick={()=>setSearch("")} style={{ border:"none", background:"none", cursor:"pointer", display:"flex" }}><X size={11} color={c.muted}/></button>}
                            <MicBtn active={micActive} onToggle={()=>setMicActive(m=>!m)}/>
                        </div>
                        <LiquidRadio options={CATS_FILTER.map(cc=>({ value:cc, label:cc==="all"?"All":(cc[0].toUpperCase()+cc.slice(1)) }))} value={catFilter} onChange={setCatFilter} dark={dark} small/>
                        <PillToggle options={[{value:"all",label:"All"},{value:"urgent",label:"Urgent"},{value:"high",label:"High"},{value:"medium",label:"Med"}]} value={prioFilter} onChange={setPrioFilter} dark={dark}/>
                    </div>
                </div>

                {/* KANBAN BOARD */}
                <div style={{ flex:1, overflow:"auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", minHeight:0 }}>
                    {COLUMNS.map((col,ci)=>{
                        const colTasks = filteredTasks(col.id)
                        return (
                            <div key={col.id} style={{ borderRight: ci < COLUMNS.length - 1
                                    ? `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`
                                    : "none", display:"flex", flexDirection:"column", minHeight:0, background: dark
                                    ? "linear-gradient(180deg, rgba(20,30,18,0.9), rgba(10,15,8,0.95))"
                                    : "linear-gradient(180deg, #f6f8f4, #eef2eb)"}}>
                                {/* Column header */}
                                <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${c.border}`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", background: dark?"rgba(0,0,0,0.2)":c.surface }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                        <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:2, repeat:Infinity, delay:ci*.5 }}
                                                    style={{ width:8, height:8, borderRadius:"50%", background:col.dot, boxShadow:`0 0 6px ${col.dot}88` }}/>
                                        <span style={{ fontSize:12, fontWeight:800, color:col.color, letterSpacing:".3px" }}>{col.label}</span>
                                    </div>
                                    <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20, background:col.dot+"18", color:col.color, border:`1px solid ${col.dot}22` }}>
                    {colTasks.length}
                  </span>
                                </div>

                                {/* Cards */}
                                <Reorder.Group axis="y" values={colTasks} onReorder={(reordered)=>{
                                    setTasks(prev=>{ const unchanged = prev[col.id].filter(t=>!colTasks.find(ct=>ct.id===t.id)); return { ...prev, [col.id]:[...reordered,...unchanged] } })
                                }} style={{ flex:1, overflowY:"auto", padding:"10px 10px", display:"flex", flexDirection:"column", gap:8 }}>
                                    <AnimatePresence>
                                        {colTasks.map((task,i)=>(
                                            <Reorder.Item key={task.id} value={task} style={{ listStyle:"none", cursor:"grab" }}
                                                          whileDrag={{ scale:1.05 }}>
                                                <TaskCard task={task} colId={col.id} onClick={()=>{ setSelected(task); setSelectedCol(col.id) }} delay={i*.04} dark={dark}/>
                                            </Reorder.Item>
                                        ))}
                                    </AnimatePresence>
                                    {colTasks.length===0 && (
                                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                                                    style={{ padding:"28px 0", textAlign:"center", border:`1.5px dashed ${c.faint}`, borderRadius:12, color:c.faint }}>
                                            <p style={{ fontSize:12, fontWeight:700 }}>🎉 Nothing here yet</p>
                                            <p style={{ fontSize:10, opacity:0.6 }}>
                                                Drag tasks or create a new one
                                            </p>
                                        </motion.div>
                                    )}
                                </Reorder.Group>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Task Modal */}
            <AnimatePresence>
                {selected && <TaskModal task={selected} colId={selectedCol} onClose={()=>{ setSelected(null); setSelectedCol(null) }} onMove={moveTask} dark={dark}/>}
            </AnimatePresence>

            {/* New Task Modal */}
            <AnimatePresence>
                {showNewTask && <NewTaskModal onClose={()=>setShowNewTask(false)} onAdd={addTask} dark={dark}/>}
            </AnimatePresence>
        </div>
    )
}