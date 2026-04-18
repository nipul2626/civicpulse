import { useState, useEffect, useRef, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
    Zap, Bell, Search, Settings, LogOut, ChevronRight,
    AlertTriangle, Users, CheckCircle, Heart, TrendingUp,
    MapPin, Clock, Filter, Plus, ArrowRight, X, Check,
    BarChart3, Activity, Eye, RefreshCw, Download,
    User, Building2, Menu, ChevronDown, Star, Send,
    FileText, Map, Clipboard, Home, PieChart, MessageSquare,
    Shield, Phone, Mail, Globe, Calendar, Flame
} from "lucide-react"

/* ─── THEME CONTEXT ──────────────────────────────────────────────────────── */
const ThemeCtx = createContext({ dark: false, toggle: () => {} })
const useTheme = () => useContext(ThemeCtx)

const LIGHT = {
    bg: "#eef2eb", surface: "#e2e8de", card: "#ffffff",
    border: "rgba(45,90,45,0.12)", text: "#1a2e1a", muted: "#5a7a5a", accent: "#2d5a2d",
    sidebar: "#ffffff", topbar: "#eef2eb",
}
const DARK = {
    bg: "#0a0f08", surface: "#111a0e", card: "#1c2a18",
    border: "rgba(120,180,80,0.12)", text: "#edf5e0", muted: "#7a9b6a", accent: "#78b450",
    sidebar: "#111a0e", topbar: "#0a0f08",
}

/* ─── MOCK DATA ──────────────────────────────────────────────────────────── */
const COORDINATOR = { name: "Riya Sharma", org: "Green Horizon Foundation", city: "Mumbai", avatar: "RS" }

const MAP_DOTS = [
    { x: 38, y: 28, r: 18, color: "#E05A3A", label: "Dharavi – 4 medical" },
    { x: 62, y: 22, r: 12, color: "#E0445A", label: "Bandra – 2 urgent" },
    { x: 55, y: 48, r: 8,  color: "#E8A838", label: "Kurla – shelter" },
    { x: 30, y: 55, r: 10, color: "#E8A838", label: "Sion – food" },
    { x: 70, y: 60, r: 6,  color: "#3B9E7E", label: "Andheri – resolved" },
    { x: 45, y: 72, r: 7,  color: "#4A9FD4", label: "Chembur – water" },
    { x: 80, y: 35, r: 5,  color: "#3B9E7E", label: "Goregaon – done" },
]

const CATEGORIES = [
    { name: "Food",      count: 5, color: "#bf55be", pct: 35 },
    { name: "Medical",   count: 8, color: "#E0445A", pct: 55 },
    { name: "Shelter",   count: 3, color: "#7B68D6", pct: 20 },
    { name: "Water",     count: 6, color: "#4A9FD4", pct: 42 },
    { name: "Education", count: 2, color: "#68e18d", pct: 14 },
]

const WEEKLY = [
    { day: "Mon", reported: 12, resolved: 8  },
    { day: "Tue", reported: 18, resolved: 14 },
    { day: "Wed", reported: 15, resolved: 13 },
    { day: "Thu", reported: 22, resolved: 17 },
    { day: "Fri", reported: 19, resolved: 18 },
    { day: "Sat", reported: 16, resolved: 14 },
    { day: "Sun", reported: 11, resolved: 10 },
]

const FEED = [
    { id: 1, icon: "🤖", text: "AI assigned 3 medical tasks to Zone D volunteers",  time: "2 min ago",  type: "ai"     },
    { id: 2, icon: "✅", text: "Volunteer Priya M. completed food delivery #142",    time: "5 min ago",  type: "done"   },
    { id: 3, icon: "🚨", text: "New shelter need submitted — Dharavi North",         time: "8 min ago",  type: "urgent" },
    { id: 4, icon: "👨‍⚕️", text: "Dr. Sharma assigned to medical emergency #87",   time: "12 min ago", type: "assign" },
    { id: 5, icon: "⚠️", text: "AI flagged 2 critical water needs in Zone A",        time: "18 min ago", type: "ai"     },
    { id: 6, icon: "✅", text: "Shelter setup complete — Zone C",                    time: "25 min ago", type: "done"   },
]

const VOLUNTEERS = [
    { rank: 1, name: "Priya Mehta",  init: "PM", skills: "Medical · First Aid", score: 97, status: "Free", color: "#5A7863" },
    { rank: 2, name: "Rahul Singh",  init: "RS", skills: "Logistics · Food",    score: 93, status: "Free", color: "#3B7D6E" },
    { rank: 3, name: "Divya Nair",   init: "DN", skills: "Education · Shelter", score: 89, status: "Busy", color: "#7B68D6" },
    { rank: 4, name: "Arjun Patil",  init: "AP", skills: "Water · Medical",     score: 95, status: "Free", color: "#4A9FD4" },
    { rank: 5, name: "Sneha Joshi",  init: "SJ", skills: "Food · Logistics",    score: 88, status: "Busy", color: "#E8A838" },
]

const RECENT_NEEDS = [
    { id: "N-201", type: "Medical",   loc: "Dharavi North", reported: "10 min ago", urgency: 95, status: "Unassigned"  },
    { id: "N-202", type: "Food",      loc: "Bandra East",   reported: "22 min ago", urgency: 72, status: "Assigned"    },
    { id: "N-203", type: "Shelter",   loc: "Zone C",        reported: "1h ago",     urgency: 60, status: "In Progress" },
    { id: "N-204", type: "Water",     loc: "Zone A",        reported: "2h ago",     urgency: 88, status: "Unassigned"  },
    { id: "N-205", type: "Education", loc: "Kurla West",    reported: "3h ago",     urgency: 40, status: "Completed"   },
]

const INIT_TASKS = [
    { id: 1, col: "Unassigned",  title: "Food distribution", loc: "Dharavi", ago: "2h ago",  vol: "RS", volName: "Rahul S.",  priority: "high",   icon: "🍱", cat: "Food"     },
    { id: 2, col: "Unassigned",  title: "Emergency aid",     loc: "Zone D",  ago: "45m ago", vol: "SJ", volName: "Sneha J.",  priority: "urgent", icon: "🚨", cat: "Medical"  },
    { id: 3, col: "Assigned",    title: "Medical checkup",   loc: "Zone A",  ago: "1h ago",  vol: "PM", volName: "Priya M.",  priority: "urgent", icon: "❤️", cat: "Medical"  },
    { id: 4, col: "Assigned",    title: "Water supply",      loc: "Bandra",  ago: "30m ago", vol: "AP", volName: "Arjun P.",  priority: "high",   icon: "💧", cat: "Water"    },
    { id: 5, col: "In Progress", title: "Shelter setup",     loc: "Zone C",  ago: "3h ago",  vol: "DN", volName: "Divya N.",  priority: "medium", icon: "🏠", cat: "Shelter"  },
    { id: 6, col: "In Progress", title: "Book distribution", loc: "Zone B",  ago: "5h ago",  vol: "RS", volName: "Rahul S.",  priority: "low",    icon: "📚", cat: "Education"},
    { id: 7, col: "Completed",   title: "Meal prep",         loc: "Kurla",   ago: "2h ago",  vol: "PM", volName: "Priya M.",  priority: "medium", icon: "🍽️", cat: "Food"     },
    { id: 8, col: "Completed",   title: "Water testing",     loc: "Zone A",  ago: "1h ago",  vol: "AP", volName: "Arjun P.",  priority: "high",   icon: "💧", cat: "Water"    },
]

const COLUMNS = ["Unassigned", "Assigned", "In Progress", "Completed"]
const COL_COLORS = { "Unassigned": "#c0392b", "Assigned": "#d4860a", "In Progress": "#1a6b9a", "Completed": "#1a6b4a" }
const PRIORITY_BARS = { urgent: "#c0392b", high: "#d4860a", medium: "#1a6b9a", low: "#2d5a2d" }
const STATS = [
    { label: "Critical Needs",    value: 14,  delta: "+2",       urgent: true,  iconName: "Flame",       color: "#b84c2e", bg: "rgba(184,76,46,0.12)"  },
    { label: "Volunteers Active", value: 38,  delta: "+3 today",               iconName: "Users",       color: "#2d5a2d", bg: "rgba(45,90,45,0.12)"    },
    { label: "Resolved Today",    value: 62,  delta: "↑12%",                   iconName: "CheckCircle", color: "#1a6b4a", bg: "rgba(26,107,74,0.12)"   },
    { label: "People Helped",     value: 847, delta: "This week",              iconName: "Heart",       color: "#5a3a8a", bg: "rgba(90,58,138,0.12)"   },
]
const ICON_MAP = { Flame, Users, CheckCircle, Heart }

/* ─── COUNT-UP ───────────────────────────────────────────────────────────── */
const CountUp = ({ value }) => {
    const [display, setDisplay] = useState(0)
    useEffect(() => {
        let cur = 0; const dur = 1200, step = 16
        const inc = value / (dur / step)
        const t = setInterval(() => {
            cur = Math.min(cur + inc, value); setDisplay(Math.round(cur))
            if (cur >= value) clearInterval(t)
        }, step)
        return () => clearInterval(t)
    }, [value])
    return <>{display.toLocaleString()}</>
}

/* ─── SUN/MOON TOGGLE ────────────────────────────────────────────────────── */
const DayNightToggle = ({ dark, onToggle }) => (
    <motion.button onClick={onToggle} whileTap={{ scale: 0.92 }} title={dark ? "Light mode" : "Dark mode"}
                   style={{ width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
                       position: "relative", overflow: "hidden", flexShrink: 0,
                       background: dark ? "linear-gradient(135deg,#0d1b2a,#1a2744)" : "linear-gradient(135deg,#74b9ff,#0984e3)",
                       transition: "background 0.5s cubic-bezier(0,-0.02,0.4,1.25)" }}>
        {dark && [{ x:8,y:5,s:1.5 },{ x:28,y:8,s:1 },{ x:40,y:12,s:1.5 },{ x:14,y:18,s:1 }].map((star,i) => (
            <div key={i} style={{ position:"absolute", left:star.x, top:star.y, width:star.s, height:star.s, borderRadius:"50%", background:"#fff" }} />
        ))}
        {!dark && (
            <div style={{ position:"absolute", bottom:5, left:7, display:"flex", gap:2 }}>
                {[8,5,7].map((s,i) => <div key={i} style={{ width:s, height:s, borderRadius:"50%", background:"rgba(255,255,255,0.85)" }} />)}
            </div>
        )}
        <motion.div animate={{ x: dark ? 26 : 4 }} transition={{ duration:0.5, ease:[0,-0.02,0.4,1.25] }}
                    style={{ position:"absolute", top:4, width:20, height:20, borderRadius:"50%",
                        background: dark ? "radial-gradient(circle at 35% 35%,#e8e8e8,#b0b0b0)" : "radial-gradient(circle at 35% 35%,#ffeaa7,#fdcb6e)",
                        boxShadow: dark ? "none" : "0 0 8px rgba(253,203,110,0.8)" }}>
            {dark && [{ x:5,y:4,s:3 },{ x:9,y:9,s:2 },{ x:4,y:12,s:2.5 }].map((spot,i) => (
                <div key={i} style={{ position:"absolute", left:spot.x, top:spot.y, width:spot.s, height:spot.s, borderRadius:"50%", background:"rgba(0,0,0,0.15)" }} />
            ))}
        </motion.div>
    </motion.button>
)

/* ─── GRADIENT BORDER BUTTON ─────────────────────────────────────────────── */
const GradBtn = ({ children, onClick, gradient="linear-gradient(90deg,#e05a3a,#e8a020)", style={}, small=false, disabled=false }) => {
    const [hov, setHov] = useState(false)
    return (
        <motion.div onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)} whileTap={{ scale:0.97 }}
                    onClick={!disabled ? onClick : undefined}
                    style={{ padding:2, background:gradient, borderRadius:"0.9em", display:"inline-flex",
                        filter: hov && !disabled ? "drop-shadow(0 0 10px rgba(224,90,58,0.55))" : "none",
                        transition:"filter 0.3s", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled?0.5:1, ...style }}>
            <button disabled={disabled} style={{ padding: small ? "4px 10px" : "7px 14px", borderRadius:"0.6em",
                background:"#0d1810", color:"#fff", fontWeight:700, fontSize: small?10:12, border:"none",
                cursor: disabled?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:5,
                whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" }}>
                {children}
            </button>
        </motion.div>
    )
}

/* ─── NOTIF CARD ─────────────────────────────────────────────────────────── */
const NotifCard = ({ item, c }) => {
    const strip = item.type==="urgent"?"#e05a3a":item.type==="ai"?"#4a9fce":item.type==="done"?"#3B9E7E":"#7B68D6"
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderLeft:`3px solid ${strip}`,
            borderRadius:10, padding:"10px 12px", display:"flex", gap:10, alignItems:"flex-start", marginBottom:4, transition:"background 0.3s" }}>
            <span style={{ fontSize:15, flexShrink:0 }}>{item.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:c.text, fontSize:11, fontWeight:600, margin:"0 0 2px", lineHeight:1.4 }}>{item.text}</p>
                <p style={{ color:c.muted, fontSize:10, margin:0 }}>{item.time}</p>
            </div>
            <button style={{ flexShrink:0, padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600,
                border:`1px solid ${c.border}`, background:"transparent", color:c.muted, cursor:"pointer" }}>View</button>
        </div>
    )
}

/* ─── SIDEBAR ────────────────────────────────────────────────────────────── */
const NAV = [
    { icon:<Home size={17}/>,         label:"Dashboard",  key:"dashboard"  },
    { icon:<Map size={17}/>,          label:"Heatmap",    key:"heatmap"    },
    { icon:<Clipboard size={17}/>,    label:"Task Board", key:"tasks"      },
    { icon:<Users size={17}/>,        label:"Volunteers", key:"volunteers" },
    { icon:<FileText size={17}/>,     label:"Reports",    key:"reports"    },
    { icon:<MessageSquare size={17}/>,label:"Survey",     key:"survey"     },
    { icon:<BarChart3 size={17}/>,    label:"Analytics",  key:"analytics"  },
    { icon:<Settings size={17}/>,     label:"Settings",   key:"settings"   },
]

const Sidebar = ({ active, setActive, collapsed, setCollapsed }) => {
    const navigate = useNavigate()
    const { dark, toggle } = useTheme()
    const c = dark ? DARK : LIGHT
    const ROUTES = { heatmap:"/heatmap", survey:"/survey", analytics:"/analytics", settings:"/settings", reports:"/reports", tasks:"/tasks", volunteers:"/volunteers" }

    return (
        <motion.aside animate={{ width: collapsed?64:220 }} transition={{ duration:0.25, ease:"easeInOut" }}
                      style={{ background:c.sidebar, borderRight:`1px solid ${c.border}`, height:"100vh",
                          position:"fixed", top:0, left:0, zIndex:100, display:"flex", flexDirection:"column",
                          overflow:"hidden", transition:"background 0.3s" }}>

            {/* Logo */}
            <div style={{ padding:"18px 14px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${c.border}` }}>
                <div style={{ width:34, height:34, borderRadius:10, background: dark?"#2d5a2d":"#1a2e1a",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Zap size={16} color="#EBF4DD"/>
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-10 }} transition={{ duration:0.15 }}>
                            <p style={{ color:c.text, fontWeight:800, fontSize:19, margin:0, whiteSpace:"nowrap", letterSpacing:"-0.5px" }}>CivicPulse</p>
                            <p style={{ color:c.muted, fontSize:9, margin:0, whiteSpace:"nowrap" }}>NGO Dashboard</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav */}
            <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
                {NAV.map(item => (
                    <motion.button key={item.key} whileTap={{ scale:0.97 }}
                                   onClick={() => { setActive(item.key); if (ROUTES[item.key]) navigate(ROUTES[item.key]) }}
                                   style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10,
                                       border:"none", cursor:"pointer", width:"100%", position:"relative",
                                       background: active===item.key ? (dark?"rgba(120,180,80,0.18)":"rgba(45,90,45,0.12)") : "transparent",
                                       color: active===item.key ? c.text : c.muted, transition:"all 0.15s" }}>
                        <span style={{ flexShrink:0, color: active===item.key?c.accent:c.muted }}>{item.icon}</span>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                             style={{ fontSize:13, fontWeight: active===item.key?700:500, whiteSpace:"nowrap" }}>
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {active===item.key && (
                            <motion.div layoutId="sidebar-pill"
                                        style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                                            width:4, height:20, borderRadius:2, background:c.accent }} />
                        )}
                    </motion.button>
                ))}
            </nav>

            {/* Toggle + User + Collapse */}
            <div style={{ padding:"12px 8px", borderTop:`1px solid ${c.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", marginBottom:6,
                    justifyContent: collapsed?"center":"flex-start" }}>
                    <DayNightToggle dark={dark} onToggle={toggle}/>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                         style={{ color:c.muted, fontSize:11, fontWeight:600 }}>
                                {dark?"Dark Mode":"Light Mode"}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:10,
                    background: dark?"rgba(120,180,80,0.07)":"rgba(90,120,99,0.09)", marginBottom:8 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"#5A7863", display:"flex",
                        alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#EBF4DD", flexShrink:0 }}>
                        {COORDINATOR.avatar}
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                                <p style={{ color:c.text, fontSize:11, fontWeight:700, margin:0 }}>{COORDINATOR.name}</p>
                                <p style={{ color:c.muted, fontSize:9, margin:0 }}>Coordinator</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button onClick={() => setCollapsed(p=>!p)}
                        style={{ display:"flex", alignItems:"center", justifyContent: collapsed?"center":"flex-start",
                            gap:8, padding:"7px 10px", borderRadius:8, border:"none", background:"transparent",
                            color:c.muted, cursor:"pointer", width:"100%", fontSize:12, fontWeight:600 }}>
                    <motion.span animate={{ rotate: collapsed?0:180 }}><ChevronRight size={14} color={c.muted}/></motion.span>
                    {!collapsed && <span style={{ color:c.muted }}>Collapse</span>}
                </button>
            </div>
        </motion.aside>
    )
}

/* ─── TOPBAR ─────────────────────────────────────────────────────────────── */
const Topbar = ({ onNewNeed }) => {
    const [time, setTime] = useState(new Date())
    const [notifs, setNotifs] = useState(3)
    const [showNotifs, setShowNotifs] = useState(false)
    const [search, setSearch] = useState("")
    const navigate = useNavigate()
    const { dark } = useTheme()
    const c = dark ? DARK : LIGHT

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    const timeStr = time.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })
    const greeting = time.getHours()<12?"Good morning":time.getHours()<17?"Good afternoon":"Good evening"
    const dateStr = time.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })

    return (
        <div style={{ position:"sticky", top:0, zIndex:50, background:c.topbar, borderBottom:`1px solid ${c.border}`,
            padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"background 0.3s" }}>
            <div>
                <h1 style={{ color:c.text, fontSize:18, fontWeight:800, margin:0 }}>
                    {greeting}, Coordinator {time.getHours()<12?"🌅":time.getHours()<17?"👋":"🌙"}
                </h1>
                <p style={{ color:c.muted, fontSize:12, margin:0 }}>{dateStr}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {/* Clock */}
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:10,
                    background:c.card, border:`1px solid ${c.border}` }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#3B9E7E",
              boxShadow:"0 0 8px #3B9E7E", display:"inline-block", animation:"pulse 2s infinite" }}/>
                    <span style={{ color:c.text, fontSize:13, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{timeStr}</span>
                </div>
                {/* Search */}
                <div style={{ position:"relative" }}>
                    <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:c.muted }}/>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search needs, volunteers..."
                           style={{ borderRadius:10, background:c.card, border:`1px solid ${c.border}`,
                               padding:"7px 14px 7px 30px", color:c.text, fontSize:12, outline:"none", width:200,
                               fontFamily:"'DM Sans',sans-serif" }}
                           onFocus={e=>e.target.style.borderColor=c.accent} onBlur={e=>e.target.style.borderColor=c.border}/>
                </div>
                <GradBtn onClick={onNewNeed} gradient="linear-gradient(90deg,#e05a3a,#e8a020)">
                    <Plus size={12}/> Report Need
                </GradBtn>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => navigate("/heatmap")}
                               style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10,
                                   background:c.card, border:`1px solid ${c.border}`, color:c.text, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                    <MapPin size={12}/> Open Heatmap
                </motion.button>
                {/* Bell */}
                <div style={{ position:"relative" }}>
                    <motion.button whileTap={{ scale:0.95 }}
                                   onClick={() => { setShowNotifs(p=>!p); setNotifs(0) }}
                                   style={{ position:"relative", width:36, height:36, borderRadius:10, background:c.card,
                                       border:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                        <Bell size={15} color={c.muted}/>
                        {notifs>0 && (
                            <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%",
                                background:"#e05a3a", color:"#fff", fontSize:9, fontWeight:800,
                                display:"flex", alignItems:"center", justifyContent:"center" }}>{notifs}</span>
                        )}
                    </motion.button>
                    <AnimatePresence>
                        {showNotifs && (
                            <motion.div initial={{ opacity:0,y:8,scale:0.95 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:8,scale:0.95 }}
                                        style={{ position:"absolute", right:0, top:44, width:320, background:c.card,
                                            border:`1px solid ${c.border}`, borderRadius:14, padding:12, zIndex:200,
                                            boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
                                <p style={{ color:c.text, fontSize:12, fontWeight:800, marginBottom:8 }}>Notifications</p>
                                {FEED.slice(0,4).map(f => <NotifCard key={f.id} item={f} c={c}/>)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

/* ─── STAT CARDS ─────────────────────────────────────────────────────────── */
const StatCards = () => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    return (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {STATS.map((s,i) => {
                const Icon = ICON_MAP[s.iconName]
                return (
                    <motion.div key={s.label} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
                                transition={{ delay:i*0.07 }} whileHover={{ y:-3, transition:{ duration:0.15 } }}
                                style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"18px 20px",
                                    cursor:"default", position:"relative", overflow:"hidden", transition:"background 0.3s" }}>
                        {s.urgent && (
                            <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity }}
                                        style={{ position:"absolute", top:10, right:10, display:"flex", alignItems:"center", gap:4,
                                            padding:"2px 8px", borderRadius:6, background:"rgba(224,90,58,0.18)", border:"1px solid rgba(224,90,58,0.3)" }}>
                                <AlertTriangle size={9} color="#E05A3A"/>
                                <span style={{ color:"#E05A3A", fontSize:9, fontWeight:700 }}>Urgent</span>
                            </motion.div>
                        )}
                        {!s.urgent && (
                            <div style={{ position:"absolute", top:10, right:10, padding:"2px 8px", borderRadius:6,
                                background: dark?"rgba(120,180,80,0.1)":"rgba(90,120,99,0.12)", color:c.muted, fontSize:9, fontWeight:700 }}>
                                {s.delta}
                            </div>
                        )}
                        <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:"flex",
                            alignItems:"center", justifyContent:"center", color:s.color, marginBottom:12 }}>
                            <Icon size={18}/>
                        </div>
                        <p style={{ color:c.text, fontSize:28, fontWeight:800, margin:"0 0 2px", fontFamily:"'JetBrains Mono',monospace" }}>
                            <CountUp value={s.value}/>
                        </p>
                        <p style={{ color:c.muted, fontSize:12, margin:0 }}>{s.label}</p>
                    </motion.div>
                )
            })}
        </div>
    )
}

/* ─── WEEKLY CHART ───────────────────────────────────────────────────────── */
const WeeklyChart = () => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const max = Math.max(...WEEKLY.map(w=>w.reported)), H=100
    const pts = key => WEEKLY.map((w,i) => `${(i/(WEEKLY.length-1))*100},${H-(w[key]/max)*H}`).join(" ")
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:20, height:"100%", transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div>
                    <p style={{ color:c.text, fontWeight:800, fontSize:14, margin:0 }}>Weekly Overview</p>
                    <p style={{ color:c.muted, fontSize:11, margin:0 }}>Needs reported vs resolved</p>
                </div>
                <div style={{ display:"flex", gap:14 }}>
                    {[{label:"Reported",color:"#5A7863"},{label:"Resolved",color:"#3B9E7E"}].map(l=>(
                        <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <div style={{ width:7, height:7, borderRadius:"50%", background:l.color }}/>
                            <span style={{ color:c.muted, fontSize:11 }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ position:"relative", height:130 }}>
                <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" style={{ width:"100%", height:"100%", overflow:"visible" }}>
                    <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5A7863" stopOpacity="0.4"/>
                            <stop offset="100%" stopColor="#5A7863" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B9E7E" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#3B9E7E" stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                    <polygon points={`0,${H} ${pts("reported")} 100,${H}`} fill="url(#g1)"/>
                    <polygon points={`0,${H} ${pts("resolved")} 100,${H}`} fill="url(#g2)"/>
                    <polyline points={pts("reported")} fill="none" stroke="#5A7863" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points={pts("resolved")} fill="none" stroke="#3B9E7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2"/>
                    {WEEKLY.map((w,i) => {
                        const x=(i/(WEEKLY.length-1))*100
                        return (<g key={i}><circle cx={x} cy={H-(w.reported/max)*H} r="1.8" fill="#5A7863"/><circle cx={x} cy={H-(w.resolved/max)*H} r="1.8" fill="#3B9E7E"/></g>)
                    })}
                </svg>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                {WEEKLY.map(w=><span key={w.day} style={{ color:c.muted, fontSize:10 }}>{w.day}</span>)}
            </div>
        </div>
    )
}

/* ─── LIVE MAP ───────────────────────────────────────────────────────────── */
const LiveMap = () => {
    const [hovered, setHovered] = useState(null)
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const navigate = useNavigate()
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:16, transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <p style={{ color:c.text, fontWeight:800, fontSize:13, margin:0 }}>Mumbai Live Map</p>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => navigate("/heatmap")}
                               style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8,
                                   border:`1px solid ${c.border}`, background:"transparent", color:c.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    Open full map <ArrowRight size={10}/>
                </motion.button>
            </div>
            <div style={{ position:"relative", height:185, borderRadius:10, overflow:"hidden",
                background: dark?"linear-gradient(135deg,#0a1a10,#122212,#0a1610)":"linear-gradient(135deg,#0f2318,#152b22,#0d1f18)" }}>
                <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.15 }}>
                    {[20,40,60,80].map(p=>(
                        <g key={p}>
                            <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#5A7863" strokeWidth="0.5"/>
                            <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#5A7863" strokeWidth="0.5"/>
                        </g>
                    ))}
                </svg>
                {MAP_DOTS.map((dot,i) => (
                    <motion.div key={i}
                                style={{ position:"absolute", left:`${dot.x}%`, top:`${dot.y}%`, transform:"translate(-50%,-50%)", cursor:"pointer" }}
                                onHoverStart={() => setHovered(i)} onHoverEnd={() => setHovered(null)}>
                        <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration:2+i*0.3, repeat:Infinity, ease:"easeInOut" }}
                                    style={{ width:dot.r, height:dot.r, borderRadius:"50%", background:dot.color, opacity:0.85, boxShadow:`0 0 ${dot.r*1.5}px ${dot.color}60` }}/>
                        <AnimatePresence>
                            {hovered===i && (
                                <motion.div initial={{ opacity:0,y:4,scale:0.9 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0 }}
                                            style={{ position:"absolute", left:"50%", bottom:"calc(100% + 6px)", transform:"translateX(-50%)",
                                                whiteSpace:"nowrap", background:"rgba(10,25,16,0.96)", border:"1px solid rgba(90,120,99,0.3)",
                                                borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:600, color:"#edf5e0", pointerEvents:"none", zIndex:10 }}>
                                    {dot.label}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
                <p style={{ position:"absolute", bottom:8, left:10, color:"rgba(90,120,99,0.55)", fontSize:9, fontWeight:600, letterSpacing:"0.1em" }}>MUMBAI CITY</p>
            </div>
        </div>
    )
}

/* ─── BY CATEGORY ────────────────────────────────────────────────────────── */
const ByCategory = () => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:16, transition:"background 0.3s" }}>
            <p style={{ color:c.muted, fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>By Category</p>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {CATEGORIES.map(cat => (
                    <div key={cat.name}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:cat.color, display:"inline-block" }}/>
                <span style={{ color:c.text, fontSize:12, fontWeight:600 }}>{cat.name}</span>
              </span>
                            <span style={{ color:c.muted, fontSize:12 }}>{cat.count}</span>
                        </div>
                        <div style={{ height:4, borderRadius:2, background: dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", overflow:"hidden" }}>
                            <motion.div initial={{ width:0 }} animate={{ width:`${cat.pct}%` }} transition={{ duration:0.8, delay:0.2, ease:"easeOut" }}
                                        style={{ height:"100%", borderRadius:2, background:cat.color }}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─── ACTIVITY FEED ──────────────────────────────────────────────────────── */
const ActivityFeed = () => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:20, transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background: dark?"rgba(120,180,80,0.12)":"rgba(90,120,99,0.18)",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Zap size={14} color={c.accent}/>
                    </div>
                    <div>
                        <p style={{ color:c.text, fontWeight:800, fontSize:13, margin:0 }}>AI Activity Feed</p>
                        <p style={{ color:c.muted, fontSize:10, margin:0 }}>Live system events</p>
                    </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:6,
                    background:"rgba(26,107,74,0.1)", border:"1px solid rgba(26,107,74,0.2)" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#3B9E7E", display:"inline-block", animation:"pulse 1.5s infinite" }}/>
                    <span style={{ color:"#3B9E7E", fontSize:10, fontWeight:700 }}>Live</span>
                </div>
            </div>
            {FEED.map(item => <NotifCard key={item.id} item={item} c={c}/>)}
        </div>
    )
}

/* ─── TOP VOLUNTEERS ─────────────────────────────────────────────────────── */
const TopVolunteers = ({ onViewAll }) => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:20, transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background: dark?"rgba(120,180,80,0.12)":"rgba(90,120,99,0.18)",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Users size={14} color={c.accent}/>
                    </div>
                    <p style={{ color:c.text, fontWeight:800, fontSize:13, margin:0 }}>Top Volunteers</p>
                </div>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={onViewAll}
                               style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:8,
                                   border:`1px solid ${c.border}`, background:"transparent", color:c.text, fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    View all <ArrowRight size={11}/>
                </motion.button>
            </div>
            {VOLUNTEERS.map((v,i) => (
                <motion.div key={v.name} initial={{ opacity:0,x:10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.07 }}
                            whileHover={{ background: dark?"rgba(120,180,80,0.04)":"rgba(90,120,99,0.05)" }}
                            style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 8px", borderRadius:8,
                                borderBottom: i<VOLUNTEERS.length-1?`1px solid ${c.border}`:"none", cursor:"pointer", transition:"background 0.15s" }}>
                    <span style={{ color:c.muted, fontSize:11, fontWeight:700, width:18 }}>#{v.rank}</span>
                    <div style={{ width:32, height:32, borderRadius:9, background:v.color, display:"flex",
                        alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#EBF4DD", flexShrink:0 }}>
                        {v.init}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:c.text, fontSize:12, fontWeight:700, margin:0 }}>{v.name}</p>
                        <p style={{ color:c.muted, fontSize:10, margin:0 }}>{v.skills}</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                        <p style={{ color:c.text, fontSize:12, fontWeight:800, margin:0 }}>{v.score}%</p>
                        <span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:4,
                            background: v.status==="Free"?"rgba(59,158,126,0.18)":"rgba(224,90,58,0.18)",
                            color: v.status==="Free"?"#3B9E7E":"#E05A3A" }}>{v.status}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

/* ─── TASK BOARD ─────────────────────────────────────────────────────────── */
const TaskBoard = () => {
    const [tasks, setTasks] = useState(INIT_TASKS)
    const [dragging, setDragging] = useState(null)
    const [dragOver, setDragOver] = useState(null)
    const [selectedTask, setSelectedTask] = useState(null)
    const { dark } = useTheme(); const c = dark?DARK:LIGHT

    return (
        <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background: dark?"rgba(120,180,80,0.12)":"rgba(90,120,99,0.18)",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Clipboard size={14} color={c.accent}/>
                    </div>
                    <div>
                        <p style={{ color:c.text, fontWeight:800, fontSize:14, margin:0 }}>Task Board</p>
                        <p style={{ color:c.muted, fontSize:10, margin:0 }}>Drag cards to update status</p>
                    </div>
                </div>
                <span style={{ padding:"4px 10px", borderRadius:8, background: dark?"rgba(120,180,80,0.1)":"rgba(90,120,99,0.12)",
                    color:c.muted, fontSize:11, fontWeight:700 }}>{tasks.length} total</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {COLUMNS.map(col => (
                    <div key={col}
                         onDragOver={e => { e.preventDefault(); setDragOver(col) }}
                         onDrop={() => { if (dragging!==null) { setTasks(prev=>prev.map(t=>t.id===dragging?{...t,col}:t)); setDragging(null); setDragOver(null) } }}
                         style={{ borderRadius:14, padding:12, minHeight:200, transition:"all 0.15s",
                             background: dragOver===col ? (dark?"rgba(120,180,80,0.08)":"rgba(90,120,99,0.08)") : dark?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.01)",
                             border:`1.5px solid ${dragOver===col?c.accent:c.border}` }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <div style={{ width:8, height:8, borderRadius:"50%", background:COL_COLORS[col] }}/>
                                <span style={{ color:c.text, fontSize:12, fontWeight:700 }}>{col}</span>
                            </div>
                            <span style={{ width:20, height:20, borderRadius:6,
                                background: dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",
                                display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:c.muted }}>
                {tasks.filter(t=>t.col===col).length}
              </span>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {tasks.filter(t=>t.col===col).map(task => (
                                <motion.div key={task.id} draggable
                                            onDragStart={() => setDragging(task.id)}
                                            onDragEnd={() => { setDragging(null); setDragOver(null) }}
                                            whileHover={{ y:-2 }} onClick={() => setSelectedTask(task)}
                                            style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:10,
                                                padding:10, cursor:"grab", userSelect:"none", transition:"background 0.3s",
                                                boxShadow: dragging===task.id?"0 8px 24px rgba(0,0,0,0.4)":"none",
                                                opacity: dragging===task.id?0.5:1 }}>
                                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                                        <div style={{ display:"flex", gap:3 }}>
                                            {[...Array(4)].map((_,i) => (
                                                <div key={i} style={{ width:3, height:12, borderRadius:1.5,
                                                    background: i<(task.priority==="urgent"?4:task.priority==="high"?3:task.priority==="medium"?2:1)
                                                        ? PRIORITY_BARS[task.priority] : dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)" }}/>
                                            ))}
                                        </div>
                                        <span style={{ fontSize:14 }}>{task.icon}</span>
                                    </div>
                                    <p style={{ color:c.text, fontSize:12, fontWeight:700, margin:"0 0 4px" }}>{task.title}</p>
                                    <p style={{ color:c.muted, fontSize:10, margin:"0 0 8px", display:"flex", alignItems:"center", gap:3 }}>
                                        <MapPin size={9}/> {task.loc} · {task.ago}
                                    </p>
                                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                            <div style={{ width:20, height:20, borderRadius:6, background:"#5A7863", display:"flex",
                                                alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:800, color:"#EBF4DD" }}>{task.vol}</div>
                                            <span style={{ color:c.muted, fontSize:10 }}>{task.volName}</span>
                                        </div>
                                        <ChevronRight size={11} color={c.muted}/>
                                    </div>
                                </motion.div>
                            ))}
                            <motion.button whileHover={{ borderColor:c.accent }}
                                           style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${c.border}`,
                                               background:"transparent", color:c.muted, fontSize:11, fontWeight:600,
                                               cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                                <Plus size={11}/> Add task
                            </motion.button>
                        </div>
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {selectedTask && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)",
                                    zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                                onClick={() => setSelectedTask(null)}>
                        <motion.div initial={{ scale:0.9,y:20 }} animate={{ scale:1,y:0 }} exit={{ scale:0.9,y:20 }}
                                    onClick={e=>e.stopPropagation()}
                                    style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:20,
                                        padding:24, width:"100%", maxWidth:400, boxShadow:"0 40px 100px rgba(0,0,0,0.5)" }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <span style={{ fontSize:24 }}>{selectedTask.icon}</span>
                                    <div>
                                        <p style={{ color:c.text, fontWeight:800, fontSize:15, margin:0 }}>{selectedTask.title}</p>
                                        <p style={{ color:c.muted, fontSize:11, margin:0 }}>{selectedTask.cat}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTask(null)} style={{ background:"transparent", border:"none", color:c.muted, cursor:"pointer" }}>
                                    <X size={16}/>
                                </button>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                                {[["Location",selectedTask.loc],["Reported",selectedTask.ago],["Priority",selectedTask.priority],["Status",selectedTask.col]].map(([k,v])=>(
                                    <div key={k} style={{ background:c.surface, borderRadius:10, padding:"10px 12px" }}>
                                        <p style={{ color:c.muted, fontSize:10, fontWeight:700, margin:"0 0 2px" }}>{k}</p>
                                        <p style={{ color:c.text, fontSize:13, fontWeight:700, margin:0, textTransform:"capitalize" }}>{v}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display:"flex", gap:8 }}>
                                {["Mark Done","Reassign","View Details"].map((btn,i)=>(
                                    <motion.button key={btn} whileTap={{ scale:0.97 }}
                                                   style={{ flex:1, padding:"9px 6px", borderRadius:10, border:`1px solid ${c.border}`,
                                                       background: i===0?"#3B9E7E":"transparent", color: i===0?"#fff":c.muted,
                                                       fontSize:11, fontWeight:700, cursor:"pointer" }}>{btn}</motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─── RECENT NEEDS ───────────────────────────────────────────────────────── */
const RecentNeeds = ({ onAssign }) => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:20, transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <p style={{ color:c.text, fontWeight:800, fontSize:14, margin:0 }}>Recent Field Reports</p>
                <div style={{ display:"flex", gap:8 }}>
                    <motion.button whileTap={{ scale:0.97 }}
                                   style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8,
                                       border:`1px solid ${c.border}`, background:"transparent", color:c.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                        <Filter size={11}/> Filter
                    </motion.button>
                    <motion.button whileTap={{ scale:0.97 }}
                                   style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8,
                                       border:`1px solid ${c.border}`, background:"transparent", color:c.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                        <Download size={11}/> Export
                    </motion.button>
                </div>
            </div>
            <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                    <tr style={{ borderBottom:`1px solid ${c.border}` }}>
                        {["ID","Type","Location","Reported","AI Score","Status","Action"].map(h=>(
                            <th key={h} style={{ color:c.muted, fontSize:10, fontWeight:700, textAlign:"left",
                                padding:"6px 10px", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {RECENT_NEEDS.map((n,i)=>(
                        <motion.tr key={n.id} initial={{ opacity:0,y:5 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
                                   whileHover={{ background: dark?"rgba(120,180,80,0.04)":"rgba(90,120,99,0.06)" }}
                                   style={{ borderBottom:`1px solid ${c.border}`, cursor:"pointer" }}>
                            <td style={{ padding:"10px 10px", color:c.muted, fontSize:11 }}>{n.id}</td>
                            <td style={{ padding:"10px 10px" }}>
                                <span style={{ padding:"2px 8px", borderRadius:5, background: dark?"rgba(120,180,80,0.1)":"rgba(90,120,99,0.12)", color:c.text, fontSize:11, fontWeight:600 }}>{n.type}</span>
                            </td>
                            <td style={{ padding:"10px 10px", color:c.text, fontSize:12 }}>{n.loc}</td>
                            <td style={{ padding:"10px 10px", color:c.muted, fontSize:11 }}>{n.reported}</td>
                            <td style={{ padding:"10px 10px" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <div style={{ flex:1, height:4, borderRadius:2, background: dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", maxWidth:50, overflow:"hidden" }}>
                                        <motion.div initial={{ width:0 }} animate={{ width:`${n.urgency}%` }} transition={{ duration:0.6, delay:i*0.1 }}
                                                    style={{ height:"100%", borderRadius:2, background: n.urgency>80?"#E05A3A":n.urgency>60?"#E8A838":"#3B9E7E" }}/>
                                    </div>
                                    <span style={{ color:c.text, fontSize:11, fontWeight:700 }}>{n.urgency}</span>
                                </div>
                            </td>
                            <td style={{ padding:"10px 10px" }}>
                  <span style={{ padding:"2px 8px", borderRadius:5, fontSize:10, fontWeight:700,
                      background: n.status==="Unassigned"?"rgba(224,90,58,0.18)":n.status==="Assigned"?"rgba(232,168,56,0.18)":n.status==="In Progress"?"rgba(74,159,212,0.18)":"rgba(59,158,126,0.18)",
                      color: n.status==="Unassigned"?"#E05A3A":n.status==="Assigned"?"#E8A838":n.status==="In Progress"?"#4A9FD4":"#3B9E7E" }}>
                    {n.status}
                  </span>
                            </td>
                            <td style={{ padding:"10px 10px" }}>
                                <GradBtn onClick={() => onAssign(n)}
                                         gradient={n.status==="Unassigned"?"linear-gradient(90deg,#e05a3a,#e8a020)":"linear-gradient(90deg,#2d5a2d,#3B9E7E)"}
                                         small>
                                    {n.status==="Unassigned"?"Assign":"View"}
                                </GradBtn>
                            </td>
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

/* ─── REPORT NEED MODAL ──────────────────────────────────────────────────── */
const ReportNeedModal = ({ onClose }) => {
    const [form, setForm] = useState({ type:"", location:"", description:"", contact:"" })
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const s = k => e => setForm(p=>({...p,[k]:e.target.value}))
    const inputS = { width:"100%", borderRadius:10, padding:"9px 12px", fontSize:12, outline:"none",
        boxSizing:"border-box", background:c.surface, border:`1px solid ${c.border}`,
        color:c.text, transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }

    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(10px)",
                        zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                    onClick={onClose}>
            <motion.div initial={{ scale:0.9,y:24 }} animate={{ scale:1,y:0 }} exit={{ scale:0.9,y:24 }}
                        onClick={e=>e.stopPropagation()}
                        style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:20,
                            width:"100%", maxWidth:420, overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.5)" }}>
                <div style={{ background:"linear-gradient(135deg,#E05A3A,#E8A020)", padding:"16px 20px",
                    display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <AlertTriangle size={18} color="#fff"/>
                        <div>
                            <p style={{ color:"#fff", fontWeight:800, fontSize:14, margin:0 }}>Report a Need</p>
                            <p style={{ color:"rgba(255,255,255,0.75)", fontSize:10, margin:0 }}>AI will score urgency automatically</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer" }}><X size={16}/></button>
                </div>
                <div style={{ padding:20 }}>
                    {done ? (
                        <motion.div initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} style={{ textAlign:"center", padding:"20px 0" }}>
                            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:200 }}
                                        style={{ width:56, height:56, borderRadius:16, background:"#3B9E7E",
                                            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                                <Check size={24} color="#fff"/>
                            </motion.div>
                            <p style={{ color:c.text, fontWeight:800, fontSize:16, marginBottom:6 }}>Need Reported!</p>
                            <p style={{ color:c.muted, fontSize:12, marginBottom:16 }}>AI is scoring urgency now. Volunteers will be matched within minutes.</p>
                            <div style={{ padding:"10px 14px", borderRadius:10, background:c.surface, border:`1px solid ${c.border}`, marginBottom:16 }}>
                                <p style={{ color:c.muted, fontSize:10, margin:"0 0 4px" }}>AI Urgency Score</p>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                    <div style={{ flex:1, height:6, borderRadius:3, background: dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)" }}>
                                        <motion.div initial={{ width:0 }} animate={{ width:"82%" }} transition={{ duration:1, delay:0.3 }}
                                                    style={{ height:"100%", borderRadius:3, background:"#E05A3A" }}/>
                                    </div>
                                    <span style={{ color:c.text, fontWeight:800, fontSize:14 }}>82</span>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ padding:"10px 28px", borderRadius:12, background:c.accent,
                                color:"#EBF4DD", fontWeight:800, fontSize:13, border:"none", cursor:"pointer" }}>Done</button>
                        </motion.div>
                    ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                            <div>
                                <label style={{ color:c.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Need Type *</label>
                                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                                    {["Food","Medical","Shelter","Water","Education","Other"].map(t=>(
                                        <motion.button key={t} whileTap={{ scale:0.95 }} onClick={() => setForm(p=>({...p,type:t}))}
                                                       style={{ padding:"8px 4px", borderRadius:8, border:"1px solid",
                                                           borderColor: form.type===t?c.accent:c.border,
                                                           background: form.type===t?(dark?"rgba(120,180,80,0.12)":"rgba(90,120,99,0.12)"):"transparent",
                                                           color: form.type===t?c.text:c.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                                            {t}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            {[{label:"Location / Area *",key:"location",placeholder:"e.g. Dharavi, Zone B"},
                                {label:"Description",key:"description",placeholder:"What is needed and for how many people?"},
                                {label:"Contact (optional)",key:"contact",placeholder:"Phone number"}].map(f=>(
                                <div key={f.key}>
                                    <label style={{ color:c.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{f.label}</label>
                                    {f.key==="description"
                                        ? <textarea value={form[f.key]} onChange={s(f.key)} placeholder={f.placeholder} rows={3} style={{ ...inputS, resize:"none" }}
                                                    onFocus={e=>e.target.style.borderColor=c.accent} onBlur={e=>e.target.style.borderColor=c.border}/>
                                        : <input value={form[f.key]} onChange={s(f.key)} placeholder={f.placeholder} style={inputS}
                                                 onFocus={e=>e.target.style.borderColor=c.accent} onBlur={e=>e.target.style.borderColor=c.border}/>
                                    }
                                </div>
                            ))}
                            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                           onClick={() => { setLoading(true); setTimeout(()=>{ setLoading(false); setDone(true) },1800) }}
                                           disabled={loading||!form.type||!form.location}
                                           style={{ padding:"11px", borderRadius:12, background:"linear-gradient(90deg,#E05A3A,#E8A020)",
                                               color:"#fff", fontWeight:800, fontSize:13, border:"none",
                                               cursor:!form.type||!form.location?"not-allowed":"pointer",
                                               opacity:!form.type||!form.location?0.5:1,
                                               display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                                {loading?"Submitting...":<><Send size={13}/> Submit to AI Scoring</>}
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

/* ─── ASSIGN MODAL ───────────────────────────────────────────────────────── */
const AssignModal = ({ need, onClose }) => {
    const [selected, setSelected] = useState(null)
    const [done, setDone] = useState(false)
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)",
                        zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                    onClick={onClose}>
            <motion.div initial={{ scale:0.9,y:20 }} animate={{ scale:1,y:0 }} onClick={e=>e.stopPropagation()}
                        style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:20, padding:24, width:"100%", maxWidth:400, boxShadow:"0 40px 100px rgba(0,0,0,0.5)" }}>
                {done ? (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:"center", padding:"16px 0" }}>
                        <div style={{ width:52, height:52, borderRadius:14, background:"#3B9E7E",
                            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                            <Check size={22} color="#fff"/>
                        </div>
                        <p style={{ color:c.text, fontWeight:800, fontSize:15, margin:"0 0 6px" }}>Volunteer Assigned!</p>
                        <p style={{ color:c.muted, fontSize:12, marginBottom:16 }}>
                            {VOLUNTEERS.find(v=>v.rank===selected)?.name} notified for {need?.type} at {need?.loc}
                        </p>
                        <button onClick={onClose} style={{ padding:"9px 24px", borderRadius:10, background:c.accent,
                            color:"#EBF4DD", fontWeight:800, border:"none", cursor:"pointer" }}>Close</button>
                    </motion.div>
                ) : (
                    <>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                            <div>
                                <p style={{ color:c.text, fontWeight:800, fontSize:14, margin:0 }}>Assign Volunteer</p>
                                <p style={{ color:c.muted, fontSize:11, margin:0 }}>{need?.type} · {need?.loc} · Score: {need?.urgency}</p>
                            </div>
                            <button onClick={onClose} style={{ background:"none", border:"none", color:c.muted, cursor:"pointer" }}><X size={16}/></button>
                        </div>
                        <p style={{ color:c.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>AI Recommended</p>
                        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                            {VOLUNTEERS.filter(v=>v.status==="Free").map(v=>(
                                <motion.div key={v.rank} whileHover={{ background: dark?"rgba(120,180,80,0.07)":"rgba(90,120,99,0.07)" }}
                                            onClick={() => setSelected(v.rank)}
                                            style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10,
                                                border:`1px solid ${selected===v.rank?c.accent:c.border}`,
                                                background: selected===v.rank?(dark?"rgba(120,180,80,0.1)":"rgba(90,120,99,0.1)"):"transparent",
                                                cursor:"pointer", transition:"all 0.15s" }}>
                                    <div style={{ width:32, height:32, borderRadius:8, background:v.color, display:"flex",
                                        alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#EBF4DD" }}>{v.init}</div>
                                    <div style={{ flex:1 }}>
                                        <p style={{ color:c.text, fontSize:12, fontWeight:700, margin:0 }}>{v.name}</p>
                                        <p style={{ color:c.muted, fontSize:10, margin:0 }}>{v.skills}</p>
                                    </div>
                                    <div style={{ textAlign:"right" }}>
                                        <p style={{ color:"#3B9E7E", fontSize:12, fontWeight:800, margin:0 }}>{v.score}%</p>
                                        <p style={{ color:"#3B9E7E", fontSize:9, margin:0 }}>Free</p>
                                    </div>
                                    {selected===v.rank && <Check size={14} color={c.accent}/>}
                                </motion.div>
                            ))}
                        </div>
                        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                       disabled={!selected} onClick={() => selected && setDone(true)}
                                       style={{ width:"100%", padding:"10px", borderRadius:12,
                                           background: selected?"linear-gradient(90deg,#2d5a2d,#3B9E7E)":dark?"rgba(120,180,80,0.2)":"rgba(90,120,99,0.2)",
                                           color:"#EBF4DD", fontWeight:800, fontSize:13, border:"none",
                                           cursor: selected?"pointer":"not-allowed",
                                           display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                            <Send size={13}/> Assign & Notify
                        </motion.button>
                    </>
                )}
            </motion.div>
        </motion.div>
    )
}

/* ─── DASHBOARD PAGE ─────────────────────────────────────────────────────── */
const DashboardInner = () => {
    const [activeNav, setActiveNav] = useState("dashboard")
    const [collapsed, setCollapsed] = useState(false)
    const [showReport, setShowReport] = useState(false)
    const [assignNeed, setAssignNeed] = useState(null)
    const { dark } = useTheme()
    const c = dark ? DARK : LIGHT
    const navigate = useNavigate()

    return (
        <div style={{ display:"flex", background:c.bg, minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", transition:"background 0.3s" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(90,120,99,0.3); border-radius:2px; }
        input::placeholder,textarea::placeholder { color:rgba(90,120,99,0.6); }
      `}</style>

            <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed}/>

            <div style={{ marginLeft: collapsed?64:220, flex:1, transition:"margin-left 0.25s ease", display:"flex", flexDirection:"column", minHeight:"100vh" }}>
                <Topbar onNewNeed={() => setShowReport(true)}/>
                <main style={{ flex:1, padding:"24px", display:"flex", flexDirection:"column", gap:20 }}>
                    <StatCards/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <WeeklyChart/>
                        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                            <LiveMap/>
                            <ByCategory/>
                        </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <ActivityFeed/>
                        <TopVolunteers onViewAll={() => { setActiveNav("volunteers"); navigate("/volunteers") }}/>
                    </div>
                    <RecentNeeds onAssign={need => setAssignNeed(need)}/>
                    <TaskBoard/>
                </main>
            </div>

            <AnimatePresence>
                {showReport && <ReportNeedModal onClose={() => setShowReport(false)}/>}
            </AnimatePresence>
            <AnimatePresence>
                {assignNeed && <AssignModal need={assignNeed} onClose={() => setAssignNeed(null)}/>}
            </AnimatePresence>
        </div>
    )
}

const DashboardPage = () => {
    const [dark, setDark] = useState(false)
    return (
        <ThemeCtx.Provider value={{ dark, toggle: () => setDark(p=>!p) }}>
            <DashboardInner/>
        </ThemeCtx.Provider>
    )
}

export default DashboardPage