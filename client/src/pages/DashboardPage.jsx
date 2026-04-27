import { useState, useEffect, useRef, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import toast, { Toaster } from "react-hot-toast"
import {
    Zap, Bell, Search, Settings, LogOut, ChevronRight,
    AlertTriangle, Users, CheckCircle, Heart, TrendingUp,
    MapPin, Clock, Filter, Plus, ArrowRight, X, Check,
    BarChart3, Activity, Eye, RefreshCw, Download,
    User, Building2, Menu, ChevronDown, Star, Send,
    FileText, Map, Clipboard, Home, PieChart, MessageSquare,
    Shield, Phone, Mail, Globe, Calendar, Flame
} from "lucide-react"
import {
    submitNeed,
    getCoordinatorAnalytics,
    matchVolunteers,
    assignVolunteer,
    getTasks,
    getVolunteers,
} from "../lib/api"
import { useAuthContext } from "../context/AuthContext"
import { useSSE } from "../hooks/useSSE"
import useAppStore from "../store/useAppStore"

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

/* ─── MOCK FALLBACK DATA (shown while loading or on error) ───────────────── */
const MOCK_MAP_DOTS = [
    { x:38, y:28, r:18, color:"#E05A3A", label:"Dharavi – 4 medical" },
    { x:62, y:22, r:12, color:"#E0445A", label:"Bandra – 2 urgent"   },
    { x:55, y:48, r:8,  color:"#E8A838", label:"Kurla – shelter"     },
    { x:30, y:55, r:10, color:"#E8A838", label:"Sion – food"         },
    { x:70, y:60, r:6,  color:"#3B9E7E", label:"Andheri – resolved"  },
    { x:45, y:72, r:7,  color:"#4A9FD4", label:"Chembur – water"     },
    { x:80, y:35, r:5,  color:"#3B9E7E", label:"Goregaon – done"     },
]

const COORDINATOR = { name: "Coordinator", org: "NGO Dashboard", city: "", avatar: "CO" }

const FEED_FALLBACK = [
    { id:1, icon:"🤖", text:"AI assigned 3 medical tasks to Zone D volunteers",  time:"2 min ago",  type:"ai"     },
    { id:2, icon:"✅", text:"Volunteer completed food delivery #142",             time:"5 min ago",  type:"done"   },
    { id:3, icon:"🚨", text:"New shelter need submitted — Dharavi North",          time:"8 min ago",  type:"urgent" },
    { id:4, icon:"⚠️", text:"AI flagged 2 critical water needs in Zone A",        time:"18 min ago", type:"ai"     },
]

const COLUMNS = ["Unassigned","Assigned","In Progress","Completed"]
const COL_COLORS = { "Unassigned":"#c0392b", "Assigned":"#d4860a", "In Progress":"#1a6b9a", "Completed":"#1a6b4a" }
const PRIORITY_BARS = { urgent:"#c0392b", high:"#d4860a", medium:"#1a6b9a", low:"#2d5a2d" }
const CATEGORIES = [
    { name:"Food",      count:0, color:"#bf55be", pct:35 },
    { name:"Medical",   count:0, color:"#E0445A", pct:55 },
    { name:"Shelter",   count:0, color:"#7B68D6", pct:20 },
    { name:"Water",     count:0, color:"#4A9FD4", pct:42 },
    { name:"Education", count:0, color:"#68e18d", pct:14 },
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

/* ─── TOGGLE ─────────────────────────────────────────────────────────────── */
const DayNightToggle = ({ dark, onToggle }) => (
    <motion.button onClick={onToggle} whileTap={{ scale:0.92 }}
                   style={{ width:52, height:28, borderRadius:14, border:"none", cursor:"pointer", position:"relative", overflow:"hidden", flexShrink:0,
                       background: dark?"linear-gradient(135deg,#0d1b2a,#1a2744)":"linear-gradient(135deg,#74b9ff,#0984e3)", transition:"background 0.5s cubic-bezier(0,-0.02,0.4,1.25)" }}>
        {dark && [{x:8,y:5,s:1.5},{x:28,y:8,s:1},{x:40,y:12,s:1.5},{x:14,y:18,s:1}].map((star,i) => (
            <div key={i} style={{ position:"absolute", left:star.x, top:star.y, width:star.s, height:star.s, borderRadius:"50%", background:"#fff" }}/>
        ))}
        {!dark && (
            <div style={{ position:"absolute", bottom:5, left:7, display:"flex", gap:2 }}>
                {[8,5,7].map((s,i) => <div key={i} style={{ width:s, height:s, borderRadius:"50%", background:"rgba(255,255,255,0.85)" }}/>)}
            </div>
        )}
        <motion.div animate={{ x: dark?26:4 }} transition={{ duration:0.5, ease:[0,-0.02,0.4,1.25] }}
                    style={{ position:"absolute", top:4, width:20, height:20, borderRadius:"50%",
                        background: dark?"radial-gradient(circle at 35% 35%,#e8e8e8,#b0b0b0)":"radial-gradient(circle at 35% 35%,#ffeaa7,#fdcb6e)",
                        boxShadow: dark?"none":"0 0 8px rgba(253,203,110,0.8)" }}>
            {dark && [{x:5,y:4,s:3},{x:9,y:9,s:2},{x:4,y:12,s:2.5}].map((spot,i) => (
                <div key={i} style={{ position:"absolute", left:spot.x, top:spot.y, width:spot.s, height:spot.s, borderRadius:"50%", background:"rgba(0,0,0,0.15)"}}/>
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
                        filter: hov&&!disabled?"drop-shadow(0 0 10px rgba(224,90,58,0.55))":"none", transition:"filter 0.3s",
                        cursor: disabled?"not-allowed":"pointer", opacity: disabled?0.5:1, ...style }}>
            <button disabled={disabled} style={{ padding: small?"4px 10px":"7px 14px", borderRadius:"0.6em",
                background:"#0d1810", color:"#fff", fontWeight:700, fontSize:small?10:12, border:"none",
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
            borderRadius:10, padding:"10px 12px", display:"flex", gap:10, alignItems:"flex-start", marginBottom:4 }}>
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

const Sidebar = ({ active, setActive, collapsed, setCollapsed, coordinator }) => {
    const navigate = useNavigate()
    const { dark, toggle } = useTheme()
    const c = dark ? DARK : LIGHT
    const ROUTES = { heatmap:"/heatmap", survey:"/survey", analytics:"/analytics", settings:"/settings", reports:"/reports", tasks:"/tasks", volunteers:"/volunteers" }
    const initials = coordinator.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()
    return (
        <motion.aside animate={{ width: collapsed?64:220 }} transition={{ duration:0.25, ease:"easeInOut" }}
                      style={{ background:c.sidebar, borderRight:`1px solid ${c.border}`, height:"100vh",
                          position:"fixed", top:0, left:0, zIndex:100, display:"flex", flexDirection:"column",
                          overflow:"hidden", transition:"background 0.3s" }}>
            <div style={{ padding:"18px 14px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${c.border}` }}>
                <div style={{ width:34, height:34, borderRadius:10, background:dark?"#2d5a2d":"#1a2e1a",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Zap size={16} color="#EBF4DD"/>
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-10 }} transition={{ duration:0.15 }}>
                            <p style={{ color:c.text, fontWeight:800, fontSize:19, margin:0, letterSpacing:"-0.5px" }}>CivicPulse</p>
                            <p style={{ color:c.muted, fontSize:9, margin:0 }}>NGO Dashboard</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
                {NAV.map(item => (
                    <motion.button key={item.key} whileTap={{ scale:0.97 }}
                                   onClick={() => { setActive(item.key); if (ROUTES[item.key]) navigate(ROUTES[item.key]) }}
                                   style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10,
                                       border:"none", cursor:"pointer", width:"100%", position:"relative",
                                       background: active===item.key?(dark?"rgba(120,180,80,0.18)":"rgba(45,90,45,0.12)"):"transparent",
                                       color: active===item.key?c.text:c.muted, transition:"all 0.15s" }}>
                        <span style={{ flexShrink:0, color:active===item.key?c.accent:c.muted }}>{item.icon}</span>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                             style={{ fontSize:13, fontWeight:active===item.key?700:500, whiteSpace:"nowrap" }}>
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {active===item.key && (
                            <motion.div layoutId="sidebar-pill"
                                        style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
                                            width:4, height:20, borderRadius:2, background:c.accent }}/>
                        )}
                    </motion.button>
                ))}
            </nav>
            <div style={{ padding:"12px 8px", borderTop:`1px solid ${c.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", marginBottom:6,
                    justifyContent:collapsed?"center":"flex-start" }}>
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
                    background:dark?"rgba(120,180,80,0.07)":"rgba(90,120,99,0.09)", marginBottom:8 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"#5A7863", display:"flex",
                        alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#EBF4DD", flexShrink:0 }}>
                        {initials}
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                                <p style={{ color:c.text, fontSize:11, fontWeight:700, margin:0 }}>{coordinator.name}</p>
                                <p style={{ color:c.muted, fontSize:9, margin:0 }}>Coordinator</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button onClick={() => setCollapsed(p=>!p)}
                        style={{ display:"flex", alignItems:"center", justifyContent:collapsed?"center":"flex-start",
                            gap:8, padding:"7px 10px", borderRadius:8, border:"none", background:"transparent",
                            color:c.muted, cursor:"pointer", width:"100%", fontSize:12, fontWeight:600 }}>
                    <motion.span animate={{ rotate:collapsed?0:180 }}><ChevronRight size={14} color={c.muted}/></motion.span>
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
    const activityFeed = useAppStore(s => s.activityFeed)
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
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:10, background:c.card, border:`1px solid ${c.border}` }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"#3B9E7E", boxShadow:"0 0 8px #3B9E7E", display:"inline-block" }}/>
                    <span style={{ color:c.text, fontSize:13, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{timeStr}</span>
                </div>
                <div style={{ position:"relative" }}>
                    <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:c.muted }}/>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search needs, volunteers..."
                           style={{ borderRadius:10, background:c.card, border:`1px solid ${c.border}`,
                               padding:"7px 14px 7px 30px", color:c.text, fontSize:12, outline:"none", width:200,
                               fontFamily:"'DM Sans',sans-serif" }}/>
                </div>
                <GradBtn onClick={onNewNeed} gradient="linear-gradient(90deg,#e05a3a,#e8a020)">
                    <Plus size={12}/> Report Need
                </GradBtn>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => navigate("/heatmap")}
                               style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10,
                                   background:c.card, border:`1px solid ${c.border}`, color:c.text, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                    <MapPin size={12}/> Open Heatmap
                </motion.button>
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
                                {(activityFeed.length > 0 ? activityFeed.slice(0,4) : FEED_FALLBACK).map(f => <NotifCard key={f.id} item={f} c={c}/>)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

/* ─── STAT CARDS ─────────────────────────────────────────────────────────── */
const StatCards = ({ stats }) => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const cards = stats ? [
        { label:"Critical Needs",    value: stats.summary?.criticalNeeds ?? stats.criticalNeeds ?? 0,   delta:"+2",       urgent:true,  iconName:"Flame",       color:"#b84c2e", bg:"rgba(184,76,46,0.12)" },
        { label:"Volunteers Active", value: stats.activeVolunteers ?? stats.volunteersActive ?? 0,       delta:"+3 today",               iconName:"Users",       color:"#2d5a2d", bg:"rgba(45,90,45,0.12)"   },
        { label:"Resolved Today",    value: stats.needsResolved ?? stats.resolvedToday ?? 0,             delta:"↑12%",                   iconName:"CheckCircle", color:"#1a6b4a", bg:"rgba(26,107,74,0.12)"  },
        { label:"People Helped",     value: stats.peopleHelped ?? 0,                                     delta:"This week",              iconName:"Heart",       color:"#5a3a8a", bg:"rgba(90,58,138,0.12)"  },
    ] : [
        { label:"Critical Needs",    value:0, delta:"—", urgent:true, iconName:"Flame",       color:"#b84c2e", bg:"rgba(184,76,46,0.12)"  },
        { label:"Volunteers Active", value:0, delta:"—",              iconName:"Users",       color:"#2d5a2d", bg:"rgba(45,90,45,0.12)"   },
        { label:"Resolved Today",    value:0, delta:"—",              iconName:"CheckCircle", color:"#1a6b4a", bg:"rgba(26,107,74,0.12)"  },
        { label:"People Helped",     value:0, delta:"—",              iconName:"Heart",       color:"#5a3a8a", bg:"rgba(90,58,138,0.12)"  },
    ]
    return (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {cards.map((s,i) => {
                const Icon = ICON_MAP[s.iconName]
                return (
                    <motion.div key={s.label} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
                                transition={{ delay:i*0.07 }} whileHover={{ y:-3, transition:{ duration:0.15 } }}
                                style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"18px 20px",
                                    position:"relative", overflow:"hidden", transition:"background 0.3s" }}>
                        {s.urgent && (
                            <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity }}
                                        style={{ position:"absolute", top:10, right:10, display:"flex", alignItems:"center", gap:4,
                                            padding:"2px 8px", borderRadius:6, background:"rgba(224,90,58,0.18)", border:"1px solid rgba(224,90,58,0.3)" }}>
                                <AlertTriangle size={9} color="#E05A3A"/><span style={{ color:"#E05A3A", fontSize:9, fontWeight:700 }}>Urgent</span>
                            </motion.div>
                        )}
                        {!s.urgent && (
                            <div style={{ position:"absolute", top:10, right:10, padding:"2px 8px", borderRadius:6,
                                background:dark?"rgba(120,180,80,0.1)":"rgba(90,120,99,0.12)", color:c.muted, fontSize:9, fontWeight:700 }}>
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

/* ─── WEEKLY CHART (static SVG — data from analytics) ───────────────────── */
const WeeklyChart = ({ trend }) => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const WEEKLY = trend?.length > 0 ? trend.slice(-7) : [
        { day:"Mon", reported:12, resolved:8 }, { day:"Tue", reported:18, resolved:14 },
        { day:"Wed", reported:15, resolved:13 }, { day:"Thu", reported:22, resolved:17 },
        { day:"Fri", reported:19, resolved:18 }, { day:"Sat", reported:16, resolved:14 },
        { day:"Sun", reported:11, resolved:10 },
    ]
    const max = Math.max(...WEEKLY.map(w=>w.reported||w.count||1)), H=100
    const pts = key => WEEKLY.map((w,i) => `${(i/(WEEKLY.length-1))*100},${H-((w[key]||0)/max)*H}`).join(" ")
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
                            <div style={{ width:7, height:7, borderRadius:"50%", background:l.color }}/><span style={{ color:c.muted, fontSize:11 }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ position:"relative", height:130 }}>
                <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" style={{ width:"100%", height:"100%", overflow:"visible" }}>
                    <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5A7863" stopOpacity="0.4"/><stop offset="100%" stopColor="#5A7863" stopOpacity="0"/></linearGradient>
                        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B9E7E" stopOpacity="0.3"/><stop offset="100%" stopColor="#3B9E7E" stopOpacity="0"/></linearGradient>
                    </defs>
                    <polygon points={`0,${H} ${pts("reported")} 100,${H}`} fill="url(#g1)"/>
                    <polygon points={`0,${H} ${pts("resolved")} 100,${H}`} fill="url(#g2)"/>
                    <polyline points={pts("reported")} fill="none" stroke="#5A7863" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points={pts("resolved")} fill="none" stroke="#3B9E7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2"/>
                    {WEEKLY.map((w,i) => {
                        const x=(i/(WEEKLY.length-1))*100
                        return (<g key={i}><circle cx={x} cy={H-((w.reported||0)/max)*H} r="1.8" fill="#5A7863"/><circle cx={x} cy={H-((w.resolved||0)/max)*H} r="1.8" fill="#3B9E7E"/></g>)
                    })}
                </svg>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                {WEEKLY.map((w,i)=><span key={i} style={{ color:c.muted, fontSize:10 }}>{w.day||w.date?.slice(-2)||i}</span>)}
            </div>
        </div>
    )
}

/* ─── LIVE MAP ───────────────────────────────────────────────────────────── */
const LiveMap = () => {
    const [hovered, setHovered] = useState(null)
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const navigate = useNavigate()
    const heatmapNeeds = useAppStore(s => s.heatmapNeeds)
    // Map heatmap needs to dot positions (rough Mumbai bounding box)
    const mapDots = heatmapNeeds.length > 0 ? heatmapNeeds.slice(0,7).map((n,i) => ({
        x: Math.max(5, Math.min(95, ((n.lng - 72.8) / 0.15) * 100)),
        y: Math.max(5, Math.min(95, 100 - ((n.lat - 19.0) / 0.15) * 100)),
        r: Math.min(20, Math.max(6, (n.urgencyScore || 50) / 5)),
        color: n.urgencyScore > 70 ? "#E05A3A" : n.urgencyScore > 40 ? "#E8A838" : "#3B9E7E",
        label: `${n.category} · ${n.status}`,
    })) : MOCK_MAP_DOTS
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
                    {[20,40,60,80].map(p=>(<g key={p}><line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#5A7863" strokeWidth="0.5"/><line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#5A7863" strokeWidth="0.5"/></g>))}
                </svg>
                {mapDots.map((dot,i) => (
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
const ByCategory = ({ analytics }) => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const cats = analytics?.summary?.byCategory
        ? Object.entries(analytics.summary.byCategory).map(([name,count],i) => ({
            name, count, color: CATEGORIES[i%CATEGORIES.length].color, pct: Math.min(100, count*2)
        }))
        : CATEGORIES
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:16, transition:"background 0.3s" }}>
            <p style={{ color:c.muted, fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>By Category</p>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {cats.slice(0,5).map(cat => (
                    <div key={cat.name}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:cat.color, display:"inline-block" }}/>
                <span style={{ color:c.text, fontSize:12, fontWeight:600 }}>{cat.name}</span>
              </span>
                            <span style={{ color:c.muted, fontSize:12 }}>{cat.count}</span>
                        </div>
                        <div style={{ height:4, borderRadius:2, background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", overflow:"hidden" }}>
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
    const activityFeed = useAppStore(s => s.activityFeed)
    const feed = activityFeed.length > 0 ? activityFeed : FEED_FALLBACK
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:20, transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:dark?"rgba(120,180,80,0.12)":"rgba(90,120,99,0.18)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Zap size={14} color={c.accent}/>
                    </div>
                    <div>
                        <p style={{ color:c.text, fontWeight:800, fontSize:13, margin:0 }}>AI Activity Feed</p>
                        <p style={{ color:c.muted, fontSize:10, margin:0 }}>Live system events</p>
                    </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:6, background:"rgba(26,107,74,0.1)", border:"1px solid rgba(26,107,74,0.2)" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#3B9E7E", display:"inline-block" }}/>
                    <span style={{ color:"#3B9E7E", fontSize:10, fontWeight:700 }}>Live</span>
                </div>
            </div>
            {feed.slice(0,6).map(item => <NotifCard key={item.id} item={item} c={c}/>)}
        </div>
    )
}

/* ─── TOP VOLUNTEERS ─────────────────────────────────────────────────────── */
const TopVolunteers = ({ volunteers, onViewAll }) => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const list = volunteers?.length > 0 ? volunteers.slice(0,5) : []
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:20, transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:dark?"rgba(120,180,80,0.12)":"rgba(90,120,99,0.18)", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
            {list.length === 0 && <p style={{ color:c.muted, fontSize:12, textAlign:"center", padding:"20px 0" }}>No volunteers loaded yet</p>}
            {list.map((v,i) => {
                const init = (v.name||v.displayName||"??").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()
                return (
                    <motion.div key={v.id||i} initial={{ opacity:0,x:10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.07 }}
                                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 8px", borderRadius:8,
                                    borderBottom: i<list.length-1?`1px solid ${c.border}`:"none", cursor:"pointer" }}>
                        <span style={{ color:c.muted, fontSize:11, fontWeight:700, width:18 }}>#{i+1}</span>
                        <div style={{ width:32, height:32, borderRadius:9, background:"#5A7863", display:"flex",
                            alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#EBF4DD", flexShrink:0 }}>
                            {init}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ color:c.text, fontSize:12, fontWeight:700, margin:0 }}>{v.name||v.displayName||"Volunteer"}</p>
                            <p style={{ color:c.muted, fontSize:10, margin:0 }}>{(v.skills||[]).slice(0,2).join(" · ") || v.role || "Volunteer"}</p>
                        </div>
                        <div style={{ textAlign:"right" }}>
                            <p style={{ color:c.text, fontSize:12, fontWeight:800, margin:0 }}>{v.reliabilityScore || v.reliability || "—"}{v.reliabilityScore ? "%" : ""}</p>
                            <span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:4,
                                background: v.available?"rgba(59,158,126,0.18)":"rgba(224,90,58,0.18)",
                                color: v.available?"#3B9E7E":"#E05A3A" }}>{v.available?"Free":"Busy"}</span>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

/* ─── RECENT NEEDS ───────────────────────────────────────────────────────── */
const RecentNeeds = ({ onAssign }) => {
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const heatmapNeeds = useAppStore(s => s.heatmapNeeds)
    const needs = heatmapNeeds.slice(0,5).map(n => ({
        id: n.id,
        type: n.category,
        loc: n.address || "Mumbai",
        reported: "Recently",
        urgency: n.urgencyScore || 50,
        status: n.status === "active" ? "Unassigned" : n.status === "assigned" ? "Assigned" : n.status === "resolved" ? "Completed" : "Unassigned",
    }))
    if (needs.length === 0) return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:20 }}>
            <p style={{ color:c.text, fontWeight:800, fontSize:14, margin:"0 0 8px" }}>Recent Field Reports</p>
            <p style={{ color:c.muted, fontSize:12 }}>Loading needs from heatmap...</p>
        </div>
    )
    return (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:20, transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <p style={{ color:c.text, fontWeight:800, fontSize:14, margin:0 }}>Recent Field Reports</p>
                <div style={{ display:"flex", gap:8 }}>
                    <motion.button whileTap={{ scale:0.97 }} style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8, border:`1px solid ${c.border}`, background:"transparent", color:c.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}><Filter size={11}/> Filter</motion.button>
                    <motion.button whileTap={{ scale:0.97 }} style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8, border:`1px solid ${c.border}`, background:"transparent", color:c.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}><Download size={11}/> Export</motion.button>
                </div>
            </div>
            <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                    <tr style={{ borderBottom:`1px solid ${c.border}` }}>
                        {["ID","Type","Location","Reported","AI Score","Status","Action"].map(h=>(
                            <th key={h} style={{ color:c.muted, fontSize:10, fontWeight:700, textAlign:"left", padding:"6px 10px", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {needs.map((n,i)=>(
                        <motion.tr key={n.id} initial={{ opacity:0,y:5 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
                                   style={{ borderBottom:`1px solid ${c.border}`, cursor:"pointer" }}>
                            <td style={{ padding:"10px 10px", color:c.muted, fontSize:11 }}>{String(n.id).slice(0,8)}</td>
                            <td style={{ padding:"10px 10px" }}><span style={{ padding:"2px 8px", borderRadius:5, background:dark?"rgba(120,180,80,0.1)":"rgba(90,120,99,0.12)", color:c.text, fontSize:11, fontWeight:600 }}>{n.type}</span></td>
                            <td style={{ padding:"10px 10px", color:c.text, fontSize:12 }}>{n.loc}</td>
                            <td style={{ padding:"10px 10px", color:c.muted, fontSize:11 }}>{n.reported}</td>
                            <td style={{ padding:"10px 10px" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <div style={{ flex:1, height:4, borderRadius:2, background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", maxWidth:50, overflow:"hidden" }}>
                                        <motion.div initial={{ width:0 }} animate={{ width:`${n.urgency}%` }} transition={{ duration:0.6, delay:i*0.1 }} style={{ height:"100%", borderRadius:2, background: n.urgency>80?"#E05A3A":n.urgency>60?"#E8A838":"#3B9E7E" }}/>
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
                                <GradBtn onClick={() => onAssign(n)} gradient={n.status==="Unassigned"?"linear-gradient(90deg,#e05a3a,#e8a020)":"linear-gradient(90deg,#2d5a2d,#3B9E7E)"} small>
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
    const [form, setForm] = useState({ type:"", location:"", description:"", affectedCount:10 })
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const { dark } = useTheme(); const c = dark?DARK:LIGHT
    const s = k => e => setForm(p=>({...p,[k]:e.target.value}))
    const inputS = { width:"100%", borderRadius:10, padding:"9px 12px", fontSize:12, outline:"none", boxSizing:"border-box",
        background:c.surface, border:`1px solid ${c.border}`, color:c.text, fontFamily:"'DM Sans',sans-serif" }

    const handleSubmit = async () => {
        if (!form.type || !form.location) return
        setLoading(true)
        try {
            const res = await submitNeed({
                title: form.description || `${form.type} need`,
                description: form.description,
                category: form.type.toLowerCase(),
                location: { lat: 19.076, lng: 72.877, address: form.location },
                affectedCount: parseInt(form.affectedCount) || 10,
            })
            setResult(res.data || res)
            setDone(true)
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to submit need")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(10px)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                    onClick={onClose}>
            <motion.div initial={{ scale:0.9,y:24 }} animate={{ scale:1,y:0 }} exit={{ scale:0.9,y:24 }}
                        onClick={e=>e.stopPropagation()}
                        style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:20, width:"100%", maxWidth:420, overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.5)" }}>
                <div style={{ background:"linear-gradient(135deg,#E05A3A,#E8A020)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
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
                                        style={{ width:56, height:56, borderRadius:16, background:"#3B9E7E", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                                <Check size={24} color="#fff"/>
                            </motion.div>
                            <p style={{ color:c.text, fontWeight:800, fontSize:16, marginBottom:6 }}>Need Reported!</p>
                            <p style={{ color:c.muted, fontSize:12, marginBottom:16 }}>AI is scoring urgency now. Volunteers will be matched within minutes.</p>
                            {result && (
                                <div style={{ padding:"10px 14px", borderRadius:10, background:c.surface, border:`1px solid ${c.border}`, marginBottom:16 }}>
                                    <p style={{ color:c.muted, fontSize:10, margin:"0 0 4px" }}>Queue Position</p>
                                    <p style={{ color:c.text, fontWeight:800, fontSize:16, margin:0 }}>#{result.queuePosition || "—"}</p>
                                </div>
                            )}
                            <button onClick={onClose} style={{ padding:"10px 28px", borderRadius:12, background:c.accent, color:"#EBF4DD", fontWeight:800, fontSize:13, border:"none", cursor:"pointer" }}>Done</button>
                        </motion.div>
                    ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                            <div>
                                <label style={{ color:c.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Need Type *</label>
                                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                                    {["Food","Medical","Shelter","Water","Education","Other"].map(t=>(
                                        <motion.button key={t} whileTap={{ scale:0.95 }} onClick={() => setForm(p=>({...p,type:t}))}
                                                       style={{ padding:"8px 4px", borderRadius:8, border:"1px solid", borderColor:form.type===t?c.accent:c.border,
                                                           background:form.type===t?(dark?"rgba(120,180,80,0.12)":"rgba(90,120,99,0.12)"):"transparent",
                                                           color:form.type===t?c.text:c.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                                            {t}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            {[{label:"Location / Area *",key:"location",placeholder:"e.g. Dharavi, Zone B"},{label:"Description",key:"description",placeholder:"What is needed and for how many people?"},{label:"Affected Count",key:"affectedCount",placeholder:"Number of people affected"}].map(f=>(
                                <div key={f.key}>
                                    <label style={{ color:c.muted, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{f.label}</label>
                                    {f.key==="description"
                                        ? <textarea value={form[f.key]} onChange={s(f.key)} placeholder={f.placeholder} rows={3} style={{ ...inputS, resize:"none" }}/>
                                        : <input value={form[f.key]} onChange={s(f.key)} placeholder={f.placeholder} style={inputS}/>
                                    }
                                </div>
                            ))}
                            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                           onClick={handleSubmit} disabled={loading||!form.type||!form.location}
                                           style={{ padding:"11px", borderRadius:12, background:"linear-gradient(90deg,#E05A3A,#E8A020)", color:"#fff", fontWeight:800, fontSize:13, border:"none",
                                               cursor:!form.type||!form.location?"not-allowed":"pointer", opacity:!form.type||!form.location?0.5:1,
                                               display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                                {loading ? "Submitting..." : <><Send size={13}/> Submit to AI Scoring</>}
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
    const [matches, setMatches] = useState([])
    const [selected, setSelected] = useState(null)
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const { dark } = useTheme(); const c = dark?DARK:LIGHT

    useEffect(() => {
        if (!need?.id) return
        setLoading(true)
        matchVolunteers(need.id)
            .then(res => setMatches(res.data?.matches || res.matches || []))
            .catch(() => setMatches([]))
            .finally(() => setLoading(false))
    }, [need?.id])

    const handleAssign = async () => {
        if (!selected) return
        setAssigning(true)
        try {
            await assignVolunteer({ needId: need.id, volunteerId: selected, scheduledTime: new Date().toISOString() })
            setDone(true)
            toast.success("Volunteer assigned successfully!")
        } catch (err) {
            toast.error(err?.response?.data?.error || "Assignment failed")
        } finally {
            setAssigning(false)
        }
    }

    const selectedVolunteer = matches.find(m => m.volunteerId === selected)

    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
                    onClick={onClose}>
            <motion.div initial={{ scale:0.9,y:20 }} animate={{ scale:1,y:0 }} onClick={e=>e.stopPropagation()}
                        style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:20, padding:24, width:"100%", maxWidth:440, boxShadow:"0 40px 100px rgba(0,0,0,0.5)", maxHeight:"80vh", overflowY:"auto" }}>
                {done ? (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:"center", padding:"16px 0" }}>
                        <div style={{ width:52, height:52, borderRadius:14, background:"#3B9E7E", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}><Check size={22} color="#fff"/></div>
                        <p style={{ color:c.text, fontWeight:800, fontSize:15, margin:"0 0 6px" }}>Volunteer Assigned!</p>
                        <p style={{ color:c.muted, fontSize:12, marginBottom:16 }}>{selectedVolunteer?.name || "Volunteer"} has been notified for {need?.type} at {need?.loc}</p>
                        <button onClick={onClose} style={{ padding:"9px 24px", borderRadius:10, background:c.accent, color:"#EBF4DD", fontWeight:800, border:"none", cursor:"pointer" }}>Close</button>
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
                        {loading ? (
                            <p style={{ color:c.muted, fontSize:12, textAlign:"center", padding:"20px 0" }}>Finding best matches with AI...</p>
                        ) : matches.length === 0 ? (
                            <p style={{ color:c.muted, fontSize:12, textAlign:"center", padding:"20px 0" }}>No volunteer matches found. Try again or check volunteer availability.</p>
                        ) : (
                            <>
                                <p style={{ color:c.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>AI Recommended</p>
                                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                                    {matches.map((v,i) => (
                                        <motion.div key={v.volunteerId} whileHover={{ background:dark?"rgba(120,180,80,0.07)":"rgba(90,120,99,0.07)" }}
                                                    onClick={() => setSelected(v.volunteerId)}
                                                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10,
                                                        border:`1px solid ${selected===v.volunteerId?c.accent:c.border}`,
                                                        background: selected===v.volunteerId?(dark?"rgba(120,180,80,0.1)":"rgba(90,120,99,0.1)"):"transparent",
                                                        cursor:"pointer", transition:"all 0.15s" }}>
                                            <div style={{ width:32, height:32, borderRadius:8, background:"#5A7863", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#EBF4DD" }}>
                                                {(v.name||"V").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                                            </div>
                                            <div style={{ flex:1 }}>
                                                <p style={{ color:c.text, fontSize:12, fontWeight:700, margin:0 }}>{v.name}</p>
                                                <p style={{ color:c.muted, fontSize:10, margin:0 }}>{(v.skills||[]).join(" · ")}</p>
                                                {v.reason && <p style={{ color:c.muted, fontSize:9, margin:0, fontStyle:"italic" }}>{v.reason}</p>}
                                            </div>
                                            <div style={{ textAlign:"right" }}>
                                                <p style={{ color:"#3B9E7E", fontSize:12, fontWeight:800, margin:0 }}>{Math.round((v.score||0)*100)}%</p>
                                                <p style={{ color:"#3B9E7E", fontSize:9, margin:0 }}>{v.matchLevel || "match"}</p>
                                            </div>
                                            {selected===v.volunteerId && <Check size={14} color={c.accent}/>}
                                        </motion.div>
                                    ))}
                                </div>
                                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                               disabled={!selected||assigning} onClick={handleAssign}
                                               style={{ width:"100%", padding:"10px", borderRadius:12,
                                                   background: selected?"linear-gradient(90deg,#2d5a2d,#3B9E7E)":(dark?"rgba(120,180,80,0.2)":"rgba(90,120,99,0.2)"),
                                                   color:"#EBF4DD", fontWeight:800, fontSize:13, border:"none",
                                                   cursor:selected?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                                    <Send size={13}/> {assigning ? "Assigning..." : "Assign & Notify"}
                                </motion.button>
                            </>
                        )}
                    </>
                )}
            </motion.div>
        </motion.div>
    )
}

/* ─── DONOR ACTIVITY WIDGET ──────────────────────────────────────────────── */
import { Link } from "react-router-dom"
function DonorActivityWidget({ dark }) {
    const cardBg = dark?"#111f0d":"#ffffff"
    const border = dark?"#1e3318":"#e5f0df"
    const textPrimary = dark?"#e8f5e2":"#1a2e13"
    const textSecondary = dark?"#7eb85a":"#4a7c35"
    const green = dark?"#78b450":"#3D8A25"
    return (
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:"14px", padding:"16px", fontFamily:"'DM Sans', sans-serif" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                    <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }}
                                style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e" }}/>
                    <span style={{ fontSize:"14px", fontWeight:800, color:textPrimary }}>Donor Activity</span>
                </div>
                <Link to="/donor" style={{ fontSize:"11px", fontWeight:600, color:green, textDecoration:"none" }}>Public page →</Link>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"12px" }}>
                {[{val:"Live",label:"Tracking active"},{val:"Public",label:"Donor portal"}].map(stat => (
                    <div key={stat.label} style={{ background:dark?"#0d1a09":"#f5faf2", border:`1px solid ${border}`, borderRadius:"8px", padding:"8px 10px", textAlign:"center" }}>
                        <div style={{ fontSize:"16px", fontWeight:800, color:green }}>{stat.val}</div>
                        <div style={{ fontSize:"10px", color:textSecondary }}>{stat.label}</div>
                    </div>
                ))}
            </div>
            <Link to="/donor" style={{ display:"block", textAlign:"center", background:`linear-gradient(135deg, ${green}, ${dark?"#5a9e3a":"#2d6b1c"})`, color:"#fff", textDecoration:"none", borderRadius:"8px", padding:"9px", fontWeight:700, fontSize:"13px" }}>
                View Donor Page →
            </Link>
        </div>
    )
}

/* ─── DASHBOARD INNER ────────────────────────────────────────────────────── */
const DashboardInner = () => {
    const [activeNav,   setActiveNav]   = useState("dashboard")
    const [collapsed,   setCollapsed]   = useState(false)
    const [showReport,  setShowReport]  = useState(false)
    const [assignNeed,  setAssignNeed]  = useState(null)
    const [analytics,   setAnalytics]   = useState(null)
    const [volunteers,  setVolunteers]  = useState([])
    const { dark } = useTheme()
    const c = dark ? DARK : LIGHT
    const navigate = useNavigate()
    const { orgId, displayName, loading: authLoading } = useAuthContext()

    const coordinator = { name: displayName || "Coordinator", org: "NGO Dashboard", avatar: (displayName||"CO").slice(0,2).toUpperCase() }

    const setHeatmapNeeds = useAppStore(s => s.setHeatmapNeeds)
    const setDashboardStats = useAppStore(s => s.setDashboardStats)
    const addActivityEvent = useAppStore(s => s.addActivityEvent)

    // Load analytics & volunteers
    useEffect(() => {
        if (authLoading || !orgId) return
        getCoordinatorAnalytics(orgId)
            .then(res => { setAnalytics(res.data || res); setDashboardStats(res.data || res) })
            .catch(err => console.warn("[Dashboard] analytics error:", err))
        getVolunteers({ orgId, limit:20 })
            .then(res => setVolunteers(res.data?.items || res.data || res || []))
            .catch(err => console.warn("[Dashboard] volunteers error:", err))
    }, [orgId, authLoading])

    // Wire SSE for live updates
    useSSE(orgId || "", {
        "need:scored": (data) => {
            addActivityEvent({ id: Date.now(), icon:"🤖", type:"ai", text:`AI scored need ${data.needId}: urgency ${data.urgencyScore}`, time:"just now" })
        },
        "heatmap:new-need": (data) => {
            addActivityEvent({ id: Date.now(), icon:"🚨", type:"urgent", text:`New ${data.category} need added to heatmap`, time:"just now" })
        },
        "task:updated": (data) => {
            addActivityEvent({ id: Date.now(), icon:"✅", type:"done", text:`Task ${data.taskId} → ${data.status}`, time:"just now" })
        },
    }, ["needs","tasks","queue","heatmap"], !!orgId)

    return (
        <div style={{ display:"flex", background:c.bg, minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", transition:"background 0.3s" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(90,120,99,0.3); border-radius:2px; }
        input::placeholder,textarea::placeholder { color:rgba(90,120,99,0.6); }
      `}</style>

            <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} coordinator={coordinator}/>

            <div style={{ marginLeft:collapsed?64:220, flex:1, transition:"margin-left 0.25s ease", display:"flex", flexDirection:"column", minHeight:"100vh" }}>
                <Topbar onNewNeed={() => setShowReport(true)}/>
                <main style={{ flex:1, padding:"24px", display:"flex", flexDirection:"column", gap:20 }}>
                    <StatCards stats={analytics}/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <WeeklyChart trend={analytics?.weeklyTrend}/>
                        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                            <LiveMap/>
                            <ByCategory analytics={analytics}/>
                            <DonorActivityWidget dark={dark}/>
                        </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <ActivityFeed/>
                        <TopVolunteers volunteers={volunteers} onViewAll={() => { setActiveNav("volunteers"); navigate("/volunteers") }}/>
                    </div>
                    <RecentNeeds onAssign={need => setAssignNeed(need)}/>
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
            <Toaster position="top-right"/>
            <DashboardInner/>
        </ThemeCtx.Provider>
    )
}

export default DashboardPage