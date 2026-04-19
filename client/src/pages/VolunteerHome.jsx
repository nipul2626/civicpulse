import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Zap, MapPin, Clock, CheckCircle, Star,
    ChevronRight, Bell, LogOut, User, Activity,
    Heart, Home, Droplets, BookOpen, Utensils,
    Award, Filter, Phone, Navigation,
    RefreshCw, X, Check, Menu, MessageSquare,
    Flame, Target, BarChart3,
} from "lucide-react"

/* ── THEME ── */
const C = {
    bg:       "#F0F4ED",
    surface:  "#FFFFFF",
    card:     "#F7F9F5",
    border:   "rgba(80,140,50,0.12)",
    borderMd: "rgba(80,140,50,0.25)",
    borderHi: "rgba(80,140,50,0.45)",
    text:     "#1A2515",
    muted:    "#6B8060",
    faint:    "#9BAD90",
    green:    "#3D8A25",
    greenLt:  "rgba(61,138,37,0.12)",
    amber:    "#C47D0E",
    amberLt:  "rgba(196,125,14,0.12)",
    red:      "#C93B22",
    redLt:    "rgba(201,59,34,0.1)",
    teal:     "#0F8A7C",
    tealLt:   "rgba(15,138,124,0.12)",
    purple:   "#6A42D4",
    purpleLt: "rgba(106,66,212,0.1)",
    blue:     "#1A6FBF",
    blueLt:   "rgba(26,111,191,0.1)",
}

/* ── DATA ── */
const VOLUNTEER = {
    name: "Arjun Patil", init: "AP", badge: "Field Hero",
    zone: "Dharavi, Mumbai", skills: ["Medical Aid", "Water", "Logistics"],
    tasksCompleted: 47, hoursLogged: 183, impactScore: 94, streak: 12, rank: 4, joined: "Mar 2023",
    email: "arjun.patil@civicpulse.in", phone: "+91 98200 55133",
}

const TASKS = [
    { id:"T-201", title:"Emergency medical kit delivery", cat:"medical", loc:"Dharavi North · Block 7", urgency:5, due:"Today, 3:00 PM", status:"active", people:34, distance:"1.2 km", desc:"Deliver 2 emergency medical kits to the primary care centre. Contact Dr. Meena on arrival.", contact:"+91 98765 11111", coords:{x:33,y:30} },
    { id:"T-202", title:"Water distribution assist", cat:"water", loc:"Kurla West · Sector B", urgency:4, due:"Today, 5:30 PM", status:"active", people:80, distance:"3.4 km", desc:"Assist NGO coordinator with water tanker distribution. 80 families expected.", contact:"+91 98765 22222", coords:{x:58,y:44} },
    { id:"T-203", title:"Food packet distribution", cat:"food", loc:"Sion · Camp Area", urgency:3, due:"Tomorrow, 10:00 AM", status:"upcoming", people:120, distance:"4.1 km", desc:"Help distribute 120 food packets at the community camp. Sorting begins at 9:30 AM.", contact:"+91 98765 33333", coords:{x:28,y:52} },
    { id:"T-204", title:"Shelter assessment survey", cat:"shelter", loc:"Chembur · Zone C", urgency:2, due:"Thu, 11:00 AM", status:"upcoming", people:18, distance:"6.7 km", desc:"Survey 18 families for shelter quality. Fill digital form on arrival.", contact:"+91 98765 44444", coords:{x:48,y:68} },
    { id:"T-205", title:"Education supply drop", cat:"education", loc:"Mankhurd · School 3", urgency:2, due:"Fri, 9:00 AM", status:"upcoming", people:60, distance:"9.2 km", desc:"Deliver school stationery kits to 3 classrooms. Coordinate with principal.", contact:"+91 98765 55555", coords:{x:82,y:65} },
]

const COMPLETED = [
    { id:"T-190", title:"Medical checkup assist", cat:"medical", loc:"Andheri", date:"Yesterday", rating:5, people:22, hours:3 },
    { id:"T-188", title:"Food delivery – Dharavi", cat:"food", loc:"Dharavi", date:"Mon", rating:5, people:60, hours:4 },
    { id:"T-185", title:"Water purification assist", cat:"water", loc:"Kurla", date:"Sun", rating:4, people:45, hours:2 },
    { id:"T-182", title:"Shelter camp setup", cat:"shelter", loc:"Sion", date:"Last week", rating:5, people:30, hours:6 },
    { id:"T-178", title:"Education books drive", cat:"education", loc:"Chembur", date:"Last week", rating:4, people:80, hours:3 },
]

const LEADERBOARD = [
    { rank:1, name:"Priya Mehta", init:"PM", score:98, tasks:52, hours:210, zone:"Andheri" },
    { rank:2, name:"Rahul Singh", init:"RS", score:95, tasks:49, hours:196, zone:"Bandra" },
    { rank:3, name:"Sneha Joshi", init:"SJ", score:92, tasks:45, hours:178, zone:"Kurla" },
    { rank:4, name:"Arjun Patil", init:"AP", score:94, tasks:47, hours:183, zone:"Dharavi", isMe:true },
    { rank:5, name:"Divya Nair", init:"DN", score:89, tasks:41, hours:160, zone:"Chembur" },
    { rank:6, name:"Kiran Desai", init:"KD", score:85, tasks:38, hours:150, zone:"Sion" },
    { rank:7, name:"Meera Iyer", init:"MI", score:81, tasks:34, hours:135, zone:"Ghatkopar" },
]

const MESSAGES_DATA = [
    { id:1, from:"Coordinator Meena", init:"CM", color:C.red, time:"2m", preview:"Can you confirm you're on the way for T-201?", unread:2, messages:[
            {from:"them",text:"Hi Arjun, are you available for the medical kit delivery today?",time:"10:12 AM"},
            {from:"them",text:"Can you confirm you're on the way for T-201?",time:"10:45 AM"},
            {from:"me",text:"Yes, leaving in 10 minutes!",time:"10:46 AM"},
        ]},
    { id:2, from:"NGO Coordinator – Kurla", init:"NK", color:C.blue, time:"15m", preview:"Water tanker arriving at 5 PM sharp", unread:1, messages:[
            {from:"them",text:"Water tanker arriving at 5 PM sharp",time:"9:30 AM"},
        ]},
    { id:3, from:"Zone Lead – Dharavi", init:"ZD", color:C.teal, time:"1h", preview:"Great work on yesterday's task! ⭐", unread:0, messages:[
            {from:"them",text:"Great work on yesterday's task! ⭐",time:"Yesterday"},
        ]},
    { id:4, from:"CivicPulse Bot", init:"CP", color:C.green, time:"2h", preview:"You've been matched to 2 new tasks based on your skills", unread:0, messages:[
            {from:"them",text:"You've been matched to 2 new tasks based on your skills",time:"Yesterday"},
        ]},
]

const NOTIFS = [
    { id:1, type:"urgent", text:"New URGENT task near you — Medical · Dharavi", time:"2m ago", unread:true },
    { id:2, type:"match",  text:"AI matched you to 2 new tasks based on your skills", time:"15m ago", unread:true },
    { id:3, type:"badge",  text:"You earned the 'Field Hero' badge!", time:"1h ago", unread:false },
    { id:4, type:"done",   text:"Task T-188 marked complete by coordinator", time:"Yesterday", unread:false },
    { id:5, type:"streak", text:"12-day streak! You're on fire!", time:"Yesterday", unread:false },
]

const HEATMAP = [
    { zone:"Dharavi",   x:33, y:30, intensity:.92, needs:47, cat:"medical",   active:true  },
    { zone:"Kurla",     x:58, y:44, intensity:.73, needs:32, cat:"water",     active:false },
    { zone:"Sion",      x:28, y:52, intensity:.58, needs:19, cat:"food",      active:false },
    { zone:"Chembur",   x:48, y:68, intensity:.64, needs:26, cat:"shelter",   active:false },
    { zone:"Andheri",   x:72, y:58, intensity:.48, needs:18, cat:"food",      active:false },
    { zone:"Ghatkopar", x:76, y:38, intensity:.82, needs:41, cat:"water",     active:false },
    { zone:"Mankhurd",  x:82, y:65, intensity:.38, needs:14, cat:"education", active:false },
]

const CAT = {
    medical:   { color:C.red,    bg:C.redLt,    label:"Medical",   icon:"+" },
    food:      { color:C.amber,  bg:C.amberLt,  label:"Food",      icon:"◆" },
    water:     { color:C.blue,   bg:C.blueLt,   label:"Water",     icon:"~" },
    shelter:   { color:C.purple, bg:C.purpleLt, label:"Shelter",   icon:"⌂" },
    education: { color:C.green,  bg:C.greenLt,  label:"Education", icon:"●" },
}

const CAT_CFG = {
    medical:   { color:"#E05A3A", icon:Heart,    label:"Medical"   },
    food:      { color:"#E8A020", icon:Utensils, label:"Food"      },
    water:     { color:"#06B6D4", icon:Droplets, label:"Water"     },
    shelter:   { color:"#9B7CF8", icon:Home,     label:"Shelter"   },
    education: { color:C.green,   icon:BookOpen, label:"Education" },
}

const URGENCY_COLOR = u => u >= 5 ? C.red : u === 4 ? C.amber : u === 3 ? C.green : C.faint

/* ── PARTICLES (memoised to avoid flicker) ── */
const PARTICLE_DATA = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    dur: Math.random() * 5 + 4,
    delay: Math.random() * 3,
}))

const Particles = () => (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        {PARTICLE_DATA.map(p => (
            <motion.div key={p.id}
                        animate={{ y:[0,-24,0], opacity:[0.06,0.22,0.06] }}
                        transition={{ duration:p.dur, delay:p.delay, repeat:Infinity, ease:"easeInOut" }}
                        style={{
                            position:"absolute", left:`${p.x}%`, top:`${p.y}%`,
                            width:3, height:3, borderRadius:"50%", background:C.green,
                        }}
            />
        ))}
        <div style={{
            position:"absolute", top:-100, right:-100,
            width:500, height:500, borderRadius:"50%",
            background:`radial-gradient(circle,${C.green}18 0%,transparent 70%)`,
            filter:"blur(40px)",
        }}/>
    </div>
)

/* ── INLINE SVG ICON ── */
const Icon = ({ name, size=16, color="currentColor", style={} }) => {
    const paths = {
        home:     "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9",
        tasks:    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4",
        map:      "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
        trophy:   "M8 21h8m-4-4v4M6 3H4v3a4 4 0 004 4h8a4 4 0 004-4V3h-2M6 3h12",
        chat:     "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
        bell:     "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
        menu:     "M4 6h16M4 12h16M4 18h16",
        x:        "M18 6L6 18M6 6l12 12",
        check:    "M5 13l4 4L19 7",
        chevron:  "M9 18l6-6-6-6",
        pin:      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
        clock:    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        fire:     "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.974 7.974 0 01-2.343 5.657z",
        nav:      "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
        phone:    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
        send:     "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
        star:     "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
        refresh:  "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
        zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        target:   "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6a6 6 0 100 12A6 6 0 0012 6zM12 10a2 2 0 100 4 2 2 0 000-4z",
        edit:     "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
        logout:   "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    }
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
             style={{ flexShrink:0, ...style }}>
            <path d={paths[name] || ""}/>
        </svg>
    )
}

/* ── SHARED COMPONENTS ── */
const Badge = ({ children, color=C.green, bg }) => (
    <span style={{
        fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
        background: bg || `${color}18`, color, border:`1px solid ${color}25`,
        letterSpacing:".3px", display:"inline-flex", alignItems:"center",
    }}>{children}</span>
)

const Pill = ({ children, active, color=C.green, onClick }) => (
    <motion.button whileTap={{ scale:.96 }} onClick={onClick} style={{
        padding:"6px 14px", borderRadius:20, border:`1px solid ${active ? color : C.border}`,
        background: active ? `${color}15` : "transparent", color: active ? color : C.muted,
        fontSize:12, fontWeight: active ? 700 : 500, cursor:"pointer",
        fontFamily:"'Outfit',sans-serif", transition:"all .18s",
    }}>{children}</motion.button>
)

const StatCard = ({ label, value, color=C.green, icon, change }) => (
    <motion.div whileHover={{ y:-2 }} style={{
        background:C.surface, border:`1px solid ${C.border}`, borderRadius:16,
        padding:"18px 20px", display:"flex", flexDirection:"column", gap:12,
    }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{
                width:36, height:36, borderRadius:10, background:`${color}15`,
                display:"flex", alignItems:"center", justifyContent:"center",
            }}>
                <Icon name={icon} size={16} color={color}/>
            </div>
            {change && <span style={{ fontSize:11, color:C.green, fontWeight:700 }}>+{change}</span>}
        </div>
        <div>
            <p style={{ fontSize:26, fontWeight:800, color, margin:0, letterSpacing:"-1px", fontFamily:"'Outfit',sans-serif" }}>{value}</p>
            <p style={{ fontSize:11, color:C.muted, margin:"2px 0 0", fontWeight:600, textTransform:"uppercase", letterSpacing:".6px" }}>{label}</p>
        </div>
    </motion.div>
)

/* ── TASK MODAL ── */
const TaskModal = ({ task, onClose }) => {
    const cfg = CAT[task.cat]
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)

    const markDone = () => {
        setLoading(true)
        setTimeout(() => { setLoading(false); setDone(true) }, 1600)
    }

    return (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{
                        position:"fixed", inset:0, background:"rgba(10,20,8,0.7)",
                        backdropFilter:"blur(8px)", zIndex:1000,
                        display:"flex", alignItems:"center", justifyContent:"center", padding:20,
                    }}
                    onClick={onClose}>
            <motion.div initial={{ scale:.93, y:20 }} animate={{ scale:1, y:0 }}
                        exit={{ scale:.93, y:20 }} transition={{ type:"spring", stiffness:300, damping:28 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            background:C.surface, borderRadius:22, width:"100%", maxWidth:460,
                            overflow:"hidden", border:`1px solid ${cfg.color}30`,
                            boxShadow:"0 30px 80px rgba(0,0,0,0.25)",
                        }}>
                {/* Header */}
                <div style={{
                    background:`${cfg.color}0D`, borderBottom:`1px solid ${cfg.color}20`,
                    padding:"20px 22px", display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{
                            width:42, height:42, borderRadius:12, background:`${cfg.color}18`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:20, fontWeight:700, color:cfg.color,
                        }}>{cfg.icon}</div>
                        <div>
                            <p style={{ fontSize:15, fontWeight:800, color:C.text, margin:0, fontFamily:"'Outfit',sans-serif" }}>{task.title}</p>
                            <p style={{ fontSize:11, color:C.muted, margin:0 }}>{task.id} · {cfg.label}</p>
                        </div>
                    </div>
                    <motion.button whileTap={{ scale:.9 }} onClick={onClose}
                                   style={{
                                       width:32, height:32, borderRadius:8, border:`1px solid ${C.border}`,
                                       background:"transparent", cursor:"pointer", display:"flex",
                                       alignItems:"center", justifyContent:"center", color:C.muted,
                                   }}>
                        <Icon name="x" size={14} color={C.muted}/>
                    </motion.button>
                </div>

                <div style={{ padding:22 }}>
                    {done ? (
                        <motion.div initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
                                    style={{ textAlign:"center", padding:"24px 0" }}>
                            <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                                        transition={{ type:"spring", stiffness:200, delay:.1 }}
                                        style={{
                                            width:64, height:64, borderRadius:18, background:C.green,
                                            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px",
                                        }}>
                                <Icon name="check" size={26} color="#fff"/>
                            </motion.div>
                            <p style={{ fontSize:17, fontWeight:800, color:C.green, margin:"0 0 8px", fontFamily:"'Outfit',sans-serif" }}>Task Complete!</p>
                            <p style={{ fontSize:13, color:C.muted, margin:"0 0 20px", lineHeight:1.6 }}>
                                Your coordinator has been notified.<br/>+5 impact points added to your profile!
                            </p>
                            <motion.button whileTap={{ scale:.97 }} onClick={onClose}
                                           style={{
                                               padding:"10px 28px", borderRadius:12, background:C.green,
                                               color:"#fff", fontWeight:700, border:"none", cursor:"pointer",
                                               fontFamily:"'Outfit',sans-serif", fontSize:13,
                                           }}>Close</motion.button>
                        </motion.div>
                    ) : (
                        <>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                                {[["Location", task.loc], ["Due", task.due], ["People", `${task.people} affected`], ["Distance", task.distance]].map(([k, v]) => (
                                    <div key={k} style={{ background:C.card, borderRadius:10, padding:"10px 13px", border:`1px solid ${C.border}` }}>
                                        <p style={{ fontSize:9, color:C.muted, fontWeight:700, margin:"0 0 3px", textTransform:"uppercase", letterSpacing:".5px" }}>{k}</p>
                                        <p style={{ fontSize:12, color:C.text, fontWeight:700, margin:0 }}>{v}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background:C.card, borderRadius:12, padding:"13px 15px", marginBottom:12, border:`1px solid ${C.border}` }}>
                                <p style={{ fontSize:10, fontWeight:700, color:C.muted, margin:"0 0 6px", textTransform:"uppercase", letterSpafcing:".5px" }}>Instructions</p>
                                <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.7 }}>{task.desc}</p>
                            </div>

                            <div style={{
                                display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:10,
                                marginBottom:16, background:C.greenLt, border:`1px solid ${C.green}30`,
                            }}>
                                <Icon name="phone" size={14} color={C.green}/>
                                <span style={{ fontSize:12, fontWeight:700, color:C.green }}>Contact: {task.contact}</span>
                            </div>

                            <div style={{ display:"flex", gap:8 }}>
                                <motion.button whileHover={{ borderColor:C.borderHi }} whileTap={{ scale:.97 }}
                                               style={{
                                                   flex:1, padding:"11px", borderRadius:12, border:`1px solid ${C.border}`,
                                                   background:"transparent", color:C.muted, fontSize:12, fontWeight:700, cursor:"pointer",
                                                   fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                                               }}>
                                    <Icon name="nav" size={13} color={C.muted}/> Navigate
                                </motion.button>
                                <motion.button whileHover={{ filter:"brightness(1.05)" }} whileTap={{ scale:.97 }}
                                               onClick={markDone}
                                               style={{
                                                   flex:2, padding:"11px", borderRadius:12, border:"none",
                                                   background:C.green, color:"#fff", fontSize:12, fontWeight:800, cursor:"pointer",
                                                   fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                                               }}>
                                    {loading ? (
                                        <motion.span animate={{ rotate:360 }} transition={{ duration:.8, repeat:Infinity, ease:"linear" }}>
                                            <Icon name="refresh" size={14} color="#fff"/>
                                        </motion.span>
                                    ) : <><Icon name="check" size={14} color="#fff"/> Mark Complete</>}
                                </motion.button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

/* ── TASK ROW (used in Dashboard & Tasks page) ── */
const TaskRow = ({ task, onOpen, delay=0 }) => {
    const cfg = CAT[task.cat]
    const uc = URGENCY_COLOR(task.urgency)
    const isActive = task.status === "active"

    return (
        <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay }}
                    whileHover={{ x:3, borderColor:cfg.color + "60" }}
                    onClick={() => onOpen(task)}
                    style={{
                        background:C.surface, border:`1px solid ${isActive ? cfg.color + "30" : C.border}`,
                        borderRadius:14, padding:"14px 16px", cursor:"pointer", display:"flex",
                        alignItems:"center", gap:12, transition:"all .18s", position:"relative", overflow:"hidden",
                    }}>
            {isActive && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:cfg.color, borderRadius:"3px 0 0 3px" }}/>}
            <div style={{
                width:38, height:38, borderRadius:11, background:cfg.bg, flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, fontWeight:700, color:cfg.color,
            }}>{cfg.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <p style={{
                        fontSize:13, fontWeight:800, color:C.text, margin:0,
                        fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    }}>{task.title}</p>
                    {isActive && (
                        <motion.span animate={{ opacity:[1,.4,1] }} transition={{ duration:1.4, repeat:Infinity }}
                                     style={{ fontSize:9, fontWeight:700, padding:"1px 7px", borderRadius:20, background:C.redLt, color:C.red, flexShrink:0 }}>LIVE</motion.span>
                    )}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, color:C.muted, display:"flex", alignItems:"center", gap:3 }}>
                        <Icon name="pin" size={10} color={C.faint}/>{task.loc}
                    </span>
                    <span style={{ fontSize:10, color:C.muted, display:"flex", alignItems:"center", gap:3 }}>
                        <Icon name="clock" size={10} color={C.faint}/>{task.due}
                    </span>
                    <span style={{ fontSize:10, color:C.green, fontWeight:700 }}>{task.distance}</span>
                </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
                <div style={{ display:"flex", gap:2, alignItems:"flex-end" }}>
                    {[1,2,3,4,5].map(b => (
                        <div key={b} style={{ width:3, height:b <= task.urgency ? 12 : 5, borderRadius:2, background:b <= task.urgency ? uc : "rgba(0,0,0,0.06)" }}/>
                    ))}
                </div>
                <span style={{ fontSize:10, color:C.muted }}>{task.people} people</span>
            </div>
            <Icon name="chevron" size={14} color={C.faint}/>
        </motion.div>
    )
}

/* ── PAGE: DASHBOARD ── */
const Dashboard = ({ onTaskOpen }) => {
    const active = TASKS.filter(t => t.status === "active")
    const upcoming = TASKS.filter(t => t.status === "upcoming")

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Welcome banner */}
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                        style={{
                            background:`linear-gradient(120deg,${C.green}18,${C.teal}10)`,
                            borderRadius:20, padding:"24px 28px",
                            border:`1px solid ${C.green}20`,
                            display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16,
                        }}>
                <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <motion.div animate={{ rotate:[0,10,0] }} transition={{ duration:2, repeat:Infinity }}
                                    style={{ fontSize:22 }}>👋</motion.div>
                        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0, fontFamily:"'Outfit',sans-serif", letterSpacing:"-0.5px" }}>
                            Good afternoon, Arjun
                        </h1>
                    </div>
                    <p style={{ fontSize:13, color:C.muted, margin:0 }}>
                        You have <strong style={{ color:C.red }}>{active.length} active</strong> and{" "}
                        <strong style={{ color:C.amber }}>{upcoming.length} upcoming</strong> tasks today
                    </p>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <motion.div animate={{ opacity:[1,.5,1] }} transition={{ duration:2, repeat:Infinity }}
                                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:12, background:C.surface, border:`1px solid ${C.border}` }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}` }}/>
                        <span style={{ fontSize:12, fontWeight:700, color:C.green }}>2 Active Now</span>
                    </motion.div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:12, background:C.surface, border:`1px solid ${C.border}` }}>
                        <Icon name="fire" size={14} color={C.amber}/>
                        <span style={{ fontSize:12, fontWeight:700, color:C.amber }}>{VOLUNTEER.streak}-day streak</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {[
                    { label:"Tasks Done",   value:VOLUNTEER.tasksCompleted,    icon:"check",  color:C.green, change:"5"   },
                    { label:"Hours Logged", value:`${VOLUNTEER.hoursLogged}h`, icon:"clock",  color:C.amber, change:"12h" },
                    { label:"Impact Score", value:`${VOLUNTEER.impactScore}%`, icon:"target", color:C.teal,  change:"2%"  },
                    { label:"Day Streak",   value:VOLUNTEER.streak,            icon:"fire",   color:C.red,   change:""    },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }}>
                        <StatCard {...s}/>
                    </motion.div>
                ))}
            </div>

            {/* Tasks + Side panel */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
                            <motion.div animate={{ scale:[1,1.3,1] }} transition={{ duration:1.5, repeat:Infinity }}
                                        style={{ width:8, height:8, borderRadius:"50%", background:C.red, boxShadow:`0 0 10px ${C.red}` }}/>
                            <span style={{ fontSize:11, fontWeight:800, color:C.red, textTransform:"uppercase", letterSpacing:".8px" }}>Active Now</span>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {active.map((t, i) => <TaskRow key={t.id} task={t} onOpen={onTaskOpen} delay={i*.05}/>)}
                        </div>
                    </div>
                    <div>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12, marginTop:8 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:C.amber }}/>
                            <span style={{ fontSize:11, fontWeight:800, color:C.amber, textTransform:"uppercase", letterSpacing:".8px" }}>Upcoming</span>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {upcoming.map((t, i) => <TaskRow key={t.id} task={t} onOpen={onTaskOpen} delay={i*.05+.1}/>)}
                        </div>
                    </div>
                </div>

                {/* Right panel */}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px" }}>
                        <p style={{ fontSize:12, fontWeight:800, color:C.text, margin:"0 0 14px", fontFamily:"'Outfit',sans-serif" }}>Quick Summary</p>
                        {[
                            { label:"Your zone rank", value:`#${VOLUNTEER.rank}`, color:C.purple },
                            { label:"People helped",  value:"239",                color:C.teal   },
                            { label:"Tasks this month",value:"12",               color:C.green  },
                            { label:"Avg rating",     value:"4.8 ★",             color:C.amber  },
                        ].map(s => (
                            <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                                <span style={{ fontSize:12, color:C.muted }}>{s.label}</span>
                                <span style={{ fontSize:13, fontWeight:800, color:s.color, fontFamily:"'Outfit',sans-serif" }}>{s.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px" }}>
                        <p style={{ fontSize:12, fontWeight:800, color:C.text, margin:"0 0 14px", fontFamily:"'Outfit',sans-serif" }}>Leaderboard Top 3</p>
                        {LEADERBOARD.slice(0, 3).map((v, i) => (
                            <div key={v.rank} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:i < 2 ? 10 : 0 }}>
                                <span style={{ fontSize:16, width:20 }}>{["🥇","🥈","🥉"][i]}</span>
                                <div style={{ width:30, height:30, borderRadius:9, background:`${[C.amber,C.muted,C.red][i]}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:[C.amber,C.muted,C.red][i] }}>{v.init}</div>
                                <div style={{ flex:1 }}>
                                    <p style={{ fontSize:12, fontWeight:700, color:C.text, margin:0 }}>{v.name}</p>
                                    <p style={{ fontSize:10, color:C.muted, margin:0 }}>{v.tasks} tasks</p>
                                </div>
                                <span style={{ fontSize:12, fontWeight:800, color:[C.amber,C.muted,C.red][i] }}>{v.score}%</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px" }}>
                        <p style={{ fontSize:12, fontWeight:800, color:C.text, margin:"0 0 14px", fontFamily:"'Outfit',sans-serif" }}>Recent Alerts</p>
                        {NOTIFS.slice(0, 3).map((n, i) => (
                            <div key={n.id} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i < 2 ? `1px solid ${C.border}` : "none", opacity:n.unread ? 1 : .6 }}>
                                <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:n.unread ? C.redLt : C.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{n.unread ? "🔔" : "✓"}</div>
                                <div>
                                    <p style={{ fontSize:11, color:C.text, margin:0, lineHeight:1.4, fontWeight:n.unread ? 700 : 400 }}>{n.text}</p>
                                    <p style={{ fontSize:9, color:C.muted, margin:"2px 0 0" }}>{n.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── PAGE: TASKS ── */
const CompletedRow = ({ task }) => {
    const cfg = CAT[task.cat]
    return (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, opacity:.75 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:C.greenLt, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="check" size={16} color={C.green}/>
            </div>
            <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:"0 0 3px", fontFamily:"'Outfit',sans-serif" }}>{task.title}</p>
                <p style={{ fontSize:11, color:C.muted, margin:0 }}>{task.loc} · {task.date}</p>
            </div>
            <div style={{ display:"flex", gap:2 }}>
                {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color:i < task.rating ? C.amber : "#ddd", fontSize:12 }}>★</span>
                ))}
            </div>
            <Badge color={C.teal} bg={C.tealLt}>Done</Badge>
        </div>
    )
}

const Tasks = ({ onTaskOpen }) => {
    const [filter, setFilter] = useState("all")
    const [catFilter, setCatFilter] = useState("all")
    const [search, setSearch] = useState("")

    const allTasks = [...TASKS, ...COMPLETED.map(t => ({ ...t, status:"done" }))]
    const filtered = allTasks.filter(t => {
        if (filter === "active" && t.status !== "active") return false
        if (filter === "upcoming" && t.status !== "upcoming") return false
        if (filter === "done" && t.status !== "done") return false
        if (catFilter !== "all" && t.cat !== catFilter) return false
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>My Tasks</h2>
                <p style={{ fontSize:13, color:C.muted, margin:0 }}>{filtered.length} tasks shown</p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ position:"relative" }}>
                    <Icon name="tasks" size={15} color={C.faint} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
                           style={{ width:"100%", padding:"10px 14px 10px 40px", borderRadius:12, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}/>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {["all","active","upcoming","done"].map(f => (
                        <Pill key={f} active={filter === f} onClick={() => setFilter(f)}
                              color={f === "active" ? C.red : f === "upcoming" ? C.amber : f === "done" ? C.teal : C.green}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Pill>
                    ))}
                    <div style={{ width:1, background:C.border, margin:"0 4px" }}/>
                    {["all","medical","food","water","shelter","education"].map(c => (
                        <Pill key={c} active={catFilter === c} onClick={() => setCatFilter(c)} color={c === "all" ? C.green : CAT[c]?.color || C.green}>
                            {c === "all" ? "All Cats" : CAT[c]?.label || c}
                        </Pill>
                    ))}
                </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <AnimatePresence>
                    {filtered.map((t, i) => (
                        <motion.div key={t.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ delay:i*.04 }}>
                            {t.status === "done" ? <CompletedRow task={t}/> : <TaskRow task={t} onOpen={onTaskOpen}/>}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                    <div style={{ textAlign:"center", padding:"40px 0", color:C.muted }}>
                        <p style={{ fontSize:32, marginBottom:8 }}>🔍</p>
                        <p style={{ fontSize:14, fontWeight:600 }}>No tasks found</p>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── PAGE: HEATMAP ── */
const MapPage = () => {
    const [hovered, setHovered] = useState(null)
    const [selected, setSelected] = useState(null)
    const [view, setView] = useState("heatmap")

    const intensityColor = v => v > .85 ? C.red : v > .7 ? C.amber : v > .55 ? C.green : C.teal

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div>
                    <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>Need Heatmap</h2>
                    <p style={{ fontSize:13, color:C.muted, margin:0 }}>Mumbai · Live density data</p>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                    {["heatmap","list"].map(v => (
                        <Pill key={v} active={view === v} onClick={() => setView(v)}>
                            {v === "heatmap" ? "Map View" : "List View"}
                        </Pill>
                    ))}
                </div>
            </div>

            {view === "heatmap" ? (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14 }}>
                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
                        <div style={{ position:"relative", height:420, background:"linear-gradient(135deg,#0d1f0a 0%,#0a1807 60%,#0d1f0a 100%)" }}>
                            <motion.div animate={{ top:["0%","100%"] }} transition={{ duration:5, repeat:Infinity, ease:"linear" }}
                                        style={{ position:"absolute", left:0, right:0, height:1, zIndex:5, pointerEvents:"none", background:`linear-gradient(90deg,transparent,${C.green}60,transparent)` }}/>
                            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.06 }}>
                                {[15,30,45,60,75,90].map(p => (
                                    <g key={p}>
                                        <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={C.green} strokeWidth=".5"/>
                                        <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke={C.green} strokeWidth=".5"/>
                                    </g>
                                ))}
                            </svg>
                            {HEATMAP.map((dot, i) => {
                                const col = intensityColor(dot.intensity)
                                const sz = dot.intensity * 60 + 20
                                return (
                                    <div key={dot.zone} style={{ position:"absolute", left:`${dot.x}%`, top:`${dot.y}%`, transform:"translate(-50%,-50%)", zIndex:2 }}>
                                        <motion.div animate={{ scale:[1,1.3,1], opacity:[.3,.55,.3] }} transition={{ duration:2.5+i*.4, repeat:Infinity }}
                                                    style={{ position:"absolute", width:sz, height:sz, borderRadius:"50%", background:`radial-gradient(circle,${col}55,transparent)`, transform:"translate(-50%,-50%)", left:"50%", top:"50%" }}/>
                                        <motion.div whileHover={{ scale:1.6 }} onClick={() => setSelected(dot)}
                                                    onHoverStart={() => setHovered(i)} onHoverEnd={() => setHovered(null)}
                                                    style={{ width:dot.active?16:12, height:dot.active?16:12, borderRadius:"50%", background:col, cursor:"pointer", position:"relative", zIndex:3, boxShadow:`0 0 ${dot.active?18:10}px ${col}80`, border:dot.active?"2px solid rgba(255,255,255,0.3)":"none" }}/>
                                        {dot.active && (
                                            <div style={{ position:"absolute", top:-22, left:"50%", transform:"translateX(-50%)", fontSize:9, fontWeight:800, color:C.green, background:"rgba(10,20,8,.9)", padding:"2px 6px", borderRadius:5, whiteSpace:"nowrap", border:`1px solid ${C.green}40` }}>📍 You</div>
                                        )}
                                        <AnimatePresence>
                                            {hovered === i && (
                                                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                                                            style={{ position:"absolute", bottom:"calc(100%+8px)", left:"50%", transform:"translateX(-50%)", whiteSpace:"nowrap", background:"rgba(8,15,6,0.96)", border:`1px solid ${col}40`, borderRadius:8, padding:"6px 10px", zIndex:10, pointerEvents:"none" }}>
                                                    <p style={{ fontWeight:800, margin:"0 0 2px", color:"#fff", fontSize:11 }}>{dot.zone}</p>
                                                    <p style={{ color:"rgba(255,255,255,.5)", margin:0, fontSize:9 }}>{dot.needs} needs · {dot.cat}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}
                            <div style={{ position:"absolute", bottom:12, left:12, display:"flex", gap:10 }}>
                                {[{l:"Critical",c:C.red},{l:"High",c:C.amber},{l:"Moderate",c:C.green},{l:"Low",c:C.teal}].map(x => (
                                    <div key={x.l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                                        <div style={{ width:7, height:7, borderRadius:"50%", background:x.c }}/>
                                        <span style={{ fontSize:9, color:"rgba(255,255,255,.5)" }}>{x.l}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ position:"absolute", top:12, left:12 }}>
                                <motion.div animate={{ opacity:[1,.5,1] }} transition={{ duration:2, repeat:Infinity }}
                                            style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:7, background:"rgba(8,15,6,0.8)", border:`1px solid ${C.green}30` }}>
                                    <div style={{ width:6, height:6, borderRadius:"50%", background:C.green }}/>
                                    <span style={{ fontSize:10, fontWeight:700, color:C.green }}>Live</span>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {selected ? (
                            <motion.div initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}
                                        style={{ background:C.surface, border:`1px solid ${intensityColor(selected.intensity)}30`, borderRadius:16, padding:"18px 20px" }}>
                                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                                    <p style={{ fontSize:15, fontWeight:800, color:C.text, margin:0, fontFamily:"'Outfit',sans-serif" }}>{selected.zone}</p>
                                    <motion.button whileTap={{ scale:.9 }} onClick={() => setSelected(null)}
                                                   style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}>
                                        <Icon name="x" size={14} color={C.muted}/>
                                    </motion.button>
                                </div>
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                                    {[["Needs",selected.needs],["Category",selected.cat],["Intensity",`${Math.round(selected.intensity*100)}%`],["Status",selected.active?"Your zone":"Active"]].map(([k,v]) => (
                                        <div key={k} style={{ background:C.card, borderRadius:9, padding:"9px 11px", border:`1px solid ${C.border}` }}>
                                            <p style={{ fontSize:9, color:C.muted, fontWeight:700, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:".4px" }}>{k}</p>
                                            <p style={{ fontSize:12, color:C.text, fontWeight:700, margin:0, textTransform:"capitalize" }}>{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ height:4, borderRadius:2, background:C.card, marginBottom:12 }}>
                                    <motion.div initial={{ width:0 }} animate={{ width:`${selected.intensity*100}%` }}
                                                style={{ height:"100%", borderRadius:2, background:intensityColor(selected.intensity) }}/>
                                </div>
                                <motion.button whileTap={{ scale:.97 }}
                                               style={{ width:"100%", padding:"10px", borderRadius:11, background:C.green, color:"#fff", fontWeight:700, border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:12 }}>
                                    View Tasks in This Zone
                                </motion.button>
                            </motion.div>
                        ) : (
                            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px" }}>
                                <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 4px" }}>Click a zone dot</p>
                                <p style={{ fontSize:11, color:C.faint, margin:0 }}>to see details</p>
                            </div>
                        )}
                        {[...HEATMAP].sort((a, b) => b.intensity - a.intensity).map((z, i) => (
                            <motion.div key={z.zone} whileHover={{ x:2 }} onClick={() => setSelected(z)}
                                        style={{ background:selected?.zone === z.zone ? `${intensityColor(z.intensity)}08` : C.surface, border:`1px solid ${selected?.zone === z.zone ? intensityColor(z.intensity)+"40" : C.border}`, borderRadius:12, padding:"11px 14px", cursor:"pointer", transition:"all .15s" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                    <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:intensityColor(z.intensity) }}/>
                                    <span style={{ flex:1, fontSize:12, fontWeight:700, color:C.text }}>{z.zone}</span>
                                    <span style={{ fontSize:11, color:C.muted }}>{z.needs} needs</span>
                                    <div style={{ width:50, height:3, borderRadius:2, background:C.card }}>
                                        <div style={{ height:"100%", borderRadius:2, width:`${z.intensity*100}%`, background:intensityColor(z.intensity) }}/>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {[...HEATMAP].sort((a, b) => b.intensity - a.intensity).map((z, i) => (
                        <motion.div key={z.zone} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.05 }} whileHover={{ x:3 }}
                                    style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
                            <div style={{ width:44, height:44, borderRadius:12, background:`${intensityColor(z.intensity)}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                <div style={{ width:16, height:16, borderRadius:"50%", background:intensityColor(z.intensity) }}/>
                            </div>
                            <div style={{ flex:1 }}>
                                <p style={{ fontSize:14, fontWeight:800, color:C.text, margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>{z.zone}</p>
                                <p style={{ fontSize:11, color:C.muted, margin:0, textTransform:"capitalize" }}>{z.cat} · {z.needs} needs</p>
                            </div>
                            <div style={{ width:80, height:5, borderRadius:3, background:C.card }}>
                                <motion.div initial={{ width:0 }} animate={{ width:`${z.intensity*100}%` }} transition={{ delay:i*.05+.2 }}
                                            style={{ height:"100%", borderRadius:3, background:intensityColor(z.intensity) }}/>
                            </div>
                            <span style={{ fontSize:13, fontWeight:800, color:intensityColor(z.intensity), minWidth:36, textAlign:"right", fontFamily:"'Outfit',sans-serif" }}>
                                {Math.round(z.intensity * 100)}%
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ── PAGE: LEADERBOARD ── */
const LeaderboardPage = () => {
    const [period, setPeriod] = useState("month")
    const me = LEADERBOARD.find(v => v.isMe)

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div>
                    <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>Leaderboard</h2>
                    <p style={{ fontSize:13, color:C.muted, margin:0 }}>Your zone · Dharavi, Mumbai</p>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                    {["week","month","all"].map(p => (
                        <Pill key={p} active={period === p} onClick={() => setPeriod(p)}>
                            {p === "all" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
                        </Pill>
                    ))}
                </div>
            </div>

            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:"24px 20px" }}>
                <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:12, marginBottom:4 }}>
                    {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((v, i) => {
                        const heights = [110, 130, 95]
                        const ranks = [2, 1, 3]
                        const colors = [C.muted, C.amber, "#CD7F32"]
                        const emojis = ["🥈","🥇","🥉"]
                        return (
                            <motion.div key={v.rank} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.1 }}
                                        style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, width:80 }}>
                                <span style={{ fontSize:20 }}>{emojis[i]}</span>
                                <div style={{ width:48, height:48, borderRadius:14, background:`${colors[i]}25`, border:`2px solid ${colors[i]}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:colors[i] }}>{v.init}</div>
                                <p style={{ fontSize:11, fontWeight:800, color:C.text, margin:0, textAlign:"center", fontFamily:"'Outfit',sans-serif" }}>{v.name.split(" ")[0]}</p>
                                <p style={{ fontSize:11, fontWeight:800, color:colors[i], margin:0 }}>{v.score}%</p>
                                <div style={{ height:heights[i], width:"100%", borderRadius:"10px 10px 0 0", background:`${colors[i]}18`, border:`1px solid ${colors[i]}30`, borderBottom:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    <p style={{ fontSize:20, fontWeight:900, color:colors[i], margin:0, fontFamily:"'Outfit',sans-serif" }}>#{ranks[i]}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.3 }}
                        style={{ background:`${C.green}10`, border:`1px solid ${C.green}30`, borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:C.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff" }}>AP</div>
                <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:800, color:C.green, margin:0, fontFamily:"'Outfit',sans-serif" }}>You're #{me.rank} in your zone!</p>
                    <p style={{ fontSize:11, color:C.muted, margin:"2px 0 0" }}>{LEADERBOARD[me.rank-2].score - me.score} points behind #{me.rank-1}</p>
                </div>
                <Badge color={C.green} bg={C.greenLt}>Top 5</Badge>
            </motion.div>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {LEADERBOARD.map((v, i) => (
                    <motion.div key={v.rank} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} transition={{ delay:.35+i*.05 }} whileHover={{ x:2 }}
                                style={{ background:v.isMe ? `${C.green}08` : C.surface, border:`1px solid ${v.isMe ? C.green+"30" : C.border}`, borderRadius:13, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, transition:"all .15s" }}>
                        <div style={{ width:28, textAlign:"center" }}>
                            {i < 3 ? <span style={{ fontSize:18 }}>{["🥇","🥈","🥉"][i]}</span> : <span style={{ fontSize:13, fontWeight:700, color:C.muted }}>#{v.rank}</span>}
                        </div>
                        <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, background:v.isMe ? C.green : `${C.muted}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:v.isMe ? "#fff" : C.muted }}>{v.init}</div>
                        <div style={{ flex:1 }}>
                            <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:0, fontFamily:"'Outfit',sans-serif" }}>
                                {v.name} {v.isMe && <span style={{ fontSize:10, color:C.green, fontWeight:700 }}>(you)</span>}
                            </p>
                            <p style={{ fontSize:10, color:C.muted, margin:"1px 0 0" }}>{v.zone} · {v.tasks} tasks · {v.hours}h</p>
                        </div>
                        <div style={{ padding:"4px 12px", borderRadius:20, fontWeight:800, fontSize:12, background:v.isMe ? C.greenLt : `${C.muted}12`, color:v.isMe ? C.green : C.muted, fontFamily:"'Outfit',sans-serif" }}>{v.score}%</div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

/* ── PAGE: MESSAGES ── */


const CHAT_COLORS = [
    { bg: '#e6f1fb', tx: '#185fa5' },
    { bg: '#e1f5ee', tx: '#0f6e56' },
    { bg: '#faeeda', tx: '#854f0b' },
    { bg: '#fbeaf0', tx: '#993556' },
    { bg: '#eeedfe', tx: '#534ab7' },
]

const VOLUNTEERS_LIST = [
    { id: 'v1', name: 'Priya Sharma',  role: 'Event Coordinator', online: true,  color: CHAT_COLORS[0] },
    { id: 'v2', name: 'Rahul Mehta',   role: 'Food Drive Lead',   online: true,  color: CHAT_COLORS[1] },
    { id: 'v3', name: 'Sara Khan',     role: 'Community Outreach',online: false, color: CHAT_COLORS[2] },
    { id: 'v4', name: 'Amit Desai',    role: 'Transport Manager', online: true,  color: CHAT_COLORS[3] },
]

const AUTO_REPLIES = [
    "Got it, thanks!", "Sure, I'll look into that.", "Sounds good 👍",
    "On it! Will update you soon.", "Let me check and get back to you.", "Great, noted!",
]

const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
const nowTime  = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/* ─── sub-components ─── */

const Avatar = ({ name, color, size = 36, online = false, unread = 0 }) => (
    <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: color.bg, color: color.tx,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.3, fontWeight: 500,
        }}>
            {initials(name)}
        </div>
        {online && (
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 8, height: 8, borderRadius: '50%', background: '#1d9e75', border: `2px solid ${C.surface}` }} />
        )}
        {unread > 0 && (
            <div style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: C.red, color: '#fff', fontSize: 9, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.surface}` }}>
                {unread}
            </div>
        )}
    </div>
)

const NewChatModal = ({ existingNames, sentNames, onClose, onSend }) => {
    const [selected, setSelected] = useState(null)
    const available = VOLUNTEERS_LIST.filter(v => !existingNames.includes(v.name) && !sentNames.includes(v.name))

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()}
             style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, borderRadius: 16 }}>
            <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ width: 340, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>

                <div style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0, fontFamily: "'Outfit',sans-serif" }}>Send chat request</p>
                    <button onClick={onClose} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: C.muted }}>✕</button>
                </div>

                <div style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: 12, color: C.muted, margin: '0 0 12px' }}>
                        Select a volunteer to send a request to. They must accept before you can chat.
                    </p>

                    {available.length === 0 ? (
                        <p style={{ fontSize: 12, color: C.faint, textAlign: 'center', padding: '16px 0' }}>All volunteers already added</p>
                    ) : available.map(v => (
                        <div key={v.id} onClick={() => setSelected(v.id)}
                             style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10,
                                 border: `1px solid ${selected === v.id ? C.green : C.border}`,
                                 background: selected === v.id ? `${C.green}12` : 'transparent',
                                 cursor: 'pointer', marginBottom: 8, transition: 'all .15s' }}>
                            <Avatar name={v.name} color={v.color} size={34} online={v.online} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{v.name}</p>
                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{v.role}</p>
                            </div>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10,
                                background: v.online ? '#e1f5ee' : '#faeeda',
                                color: v.online ? '#0f6e56' : '#854f0b' }}>
                {v.online ? 'Online' : 'Away'}
              </span>
                        </div>
                    ))}

                    <button disabled={!selected || available.length === 0} onClick={() => onSend(VOLUNTEERS_LIST.find(v => v.id === selected))}
                            style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                                background: selected ? C.green : C.surface, color: selected ? '#fff' : C.faint,
                                cursor: selected ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600,
                                fontFamily: "'Outfit',sans-serif", transition: 'background .15s', marginTop: 4 }}>
                        Send request
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

/* ─── main page of message─── */

const MessagesPage = () => {
    const [activeId,    setActiveId]    = useState(null)
    const [tab,         setTab]         = useState('chats')    // 'chats' | 'requests'
    const [chats,       setChats]       = useState(MESSAGES_DATA)
    const [requests,    setRequests]    = useState([])          // incoming requests
    const [sentReqs,    setSentReqs]    = useState([])          // requests I sent, pending
    const [input,       setInput]       = useState("")
    const [search,      setSearch]      = useState("")
    const [isTyping,    setIsTyping]    = useState(false)
    const [showModal,   setShowModal]   = useState(false)
    const [toast,       setToast]       = useState(null)
    const typingTimer = useRef(null)
    const bottomRef   = useRef(null)
    const inputRef    = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeId, chats, isTyping])

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(null), 2500)
    }

    /* ── send a chat request ── */
    const handleSendRequest = (volunteer) => {
        setShowModal(false)
        setSentReqs(prev => [...prev, { id: 'sr' + Date.now(), ...volunteer, time: 'Now' }])
        showToast(`Request sent to ${volunteer.name}`)
        setTab('requests')

        /* Simulate: volunteer gets notified and accepts after ~4 seconds */
        setTimeout(() => {
            setSentReqs(prev => prev.filter(r => r.name !== volunteer.name))
            /* Create the new chat conversation */
            const newChat = {
                id: 'c' + Date.now(),
                from: volunteer.name,
                role: volunteer.role,
                color: volunteer.color,
                online: volunteer.online,
                time: 'Now',
                unread: 1,
                messages: [{ from: 'them', text: `Hey! Thanks for connecting 👋`, time: nowTime(), reactions: [] }],
            }
            setChats(prev => [newChat, ...prev])
            showToast(`${volunteer.name} accepted your request!`)
            setTab('chats')
            setActiveId(newChat.id)
        }, 4000)
    }

    /* ── accept incoming request ── */
    const acceptRequest = (req) => {
        setRequests(prev => prev.filter(r => r.id !== req.id))
        const newChat = {
            id: 'c' + Date.now(),
            from: req.from, role: req.role, color: req.color,
            online: true, time: 'Now', unread: 1,
            messages: [{ from: 'them', text: `Hey! Thanks for accepting 👋`, time: nowTime(), reactions: [] }],
        }
        setChats(prev => [newChat, ...prev])
        showToast(`${req.from} added to conversations`)
        setTab('chats')
        setActiveId(newChat.id)
    }

    const declineRequest = (id) => {
        setRequests(prev => prev.filter(r => r.id !== id))
        showToast('Request declined')
    }

    /* ── send message ── */
    const sendMsg = () => {
        const txt = input.trim()
        if (!txt || !activeId) return
        const t = nowTime()
        setChats(prev => prev.map(c => c.id === activeId
            ? { ...c, time: 'Now', messages: [...c.messages, { from: 'me', text: txt, time: t, reactions: [] }] }
            : c))
        setInput("")
        clearTimeout(typingTimer.current)
        setIsTyping(true)
        typingTimer.current = setTimeout(() => {
            setIsTyping(false)
            const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
            setChats(prev => prev.map(c => c.id === activeId
                ? { ...c, time: 'Now', messages: [...c.messages, { from: 'them', text: reply, time: nowTime(), reactions: [] }] }
                : c))
        }, 1300)
    }

    const openChat = (id) => {
        setActiveId(id)
        setTab('chats')
        setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
        setTimeout(() => inputRef.current?.focus(), 80)
    }

    const toggleReaction = (chatId, msgIdx, emoji) => {
        setChats(prev => prev.map(c => {
            if (c.id !== chatId) return c
            const msgs = c.messages.map((m, i) => i !== msgIdx ? m : {
                ...m,
                reactions: m.reactions?.includes(emoji)
                    ? m.reactions.filter(r => r !== emoji)
                    : [...(m.reactions || []), emoji],
            })
            return { ...c, messages: msgs }
        }))
    }

    const conv = chats.find(c => c.id === activeId)
    const filteredChats = chats.filter(c => !search || c.from.toLowerCase().includes(search.toLowerCase()))
    const incomingCount = requests.length

    const panelH = 'calc(100vh - 148px)'   // adjust to match your dashboard content area

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: panelH, minHeight: 0, position: 'relative' }}>

            {/* Header */}
            <div style={{ marginBottom: 12, flexShrink: 0 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 2px', fontFamily: "'Outfit',sans-serif" }}>Messages</h2>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                    {chats.filter(c => c.unread).length} unread · {chats.length} conversations
                </p>
            </div>

            {/* Body — fixed height, no page scroll */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>

                {/* ── SIDEBAR ── */}
                <div style={{ display: 'flex', flexDirection: 'column', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', minHeight: 0 }}>

                    {/* Search */}
                    <div style={{ padding: '12px 12px 8px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 11px' }}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ opacity: .4, flexShrink: 0 }}>
                                <circle cx="6.5" cy="6.5" r="5.5" stroke={C.text} strokeWidth="1.5"/>
                                <path d="M10.5 10.5l4 4" stroke={C.text} strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                                   style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: C.text, fontFamily: "'Outfit',sans-serif" }}/>
                            {search && <span onClick={() => setSearch("")} style={{ cursor: 'pointer', fontSize: 11, color: C.muted }}>✕</span>}
                        </div>
                    </div>

                    {/* Tabs: Chats / Requests */}
                    <div style={{ display: 'flex', gap: 6, padding: '0 10px 8px', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
                        {['chats', 'requests'].map(t => (
                            <button key={t} onClick={() => { setTab(t); if (t !== 'chats') setActiveId(null) }}
                                    style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 600, borderRadius: 7,
                                        border: `1px solid ${tab === t ? C.border : 'transparent'}`,
                                        background: tab === t ? C.bg : 'transparent',
                                        color: tab === t ? C.text : C.muted, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
                                        position: 'relative' }}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                {t === 'requests' && incomingCount > 0 && (
                                    <span style={{ position: 'absolute', top: -4, right: 4, width: 15, height: 15, borderRadius: '50%', background: C.red, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {incomingCount}
                  </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* List area — scrollable independently */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>

                        {tab === 'chats' && (
                            filteredChats.length === 0
                                ? <p style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: C.faint }}>No conversations</p>
                                : filteredChats.map((c, i) => (
                                    <motion.div key={c.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .04 }}
                                                onClick={() => openChat(c.id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 8px', borderRadius: 10, cursor: 'pointer',
                                                    background: activeId === c.id ? `${C.green}10` : 'transparent',
                                                    outline: activeId === c.id ? `1px solid ${C.green}30` : 'none',
                                                    marginBottom: 2, transition: 'all .15s' }}>
                                        <Avatar name={c.from} color={c.color} size={36} online={c.online} unread={c.unread} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{c.from}</span>
                                                <span style={{ fontSize: 10, color: C.faint }}>{c.time}</span>
                                            </div>
                                            <p style={{ fontSize: 11, color: c.unread ? C.text : C.muted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: c.unread ? 700 : 400 }}>
                                                {c.messages.at(-1)?.text || 'Say hello!'}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                        )}

                        {tab === 'requests' && (
                            <>
                                {requests.length > 0 && (
                                    <>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: C.faint, padding: '2px 4px 6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Incoming</p>
                                        {requests.map(r => (
                                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 8, background: C.bg }}>
                                                <Avatar name={r.from} color={r.color} size={34} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{r.from}</p>
                                                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{r.role} · wants to chat</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: 5 }}>
                                                    <button onClick={() => declineRequest(r.id)}
                                                            style={{ padding: '4px 9px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: C.muted, fontFamily: "'Outfit',sans-serif" }}>
                                                        Decline
                                                    </button>
                                                    <button onClick={() => acceptRequest(r)}
                                                            style={{ padding: '4px 9px', borderRadius: 7, border: 'none', background: C.green, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>
                                                        Accept
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {sentReqs.length > 0 && (
                                    <>
                                        <p style={{ fontSize: 10, fontWeight: 600, color: C.faint, padding: '6px 4px 6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Sent</p>
                                        {sentReqs.map(r => (
                                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 8, background: C.bg }}>
                                                <Avatar name={r.name} color={r.color} size={34} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{r.name}</p>
                                                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{r.role}</p>
                                                </div>
                                                <span style={{ fontSize: 10, background: '#faeeda', color: '#854f0b', padding: '2px 8px', borderRadius: 10 }}>Pending…</span>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {requests.length === 0 && sentReqs.length === 0 && (
                                    <p style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: C.faint }}>No pending requests</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* New conversation */}
                    <div style={{ padding: '10px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
                        <button onClick={() => setShowModal(true)}
                                style={{ width: '100%', padding: '8px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Outfit',sans-serif", transition: 'background .15s' }}>
                            <svg width="11" height="11" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke={C.muted} strokeWidth="1.7" strokeLinecap="round"/></svg>
                            New conversation
                        </button>
                    </div>
                </div>

                {/* ── CHAT PANEL ── */}
                {conv ? (
                    <div style={{ display: 'flex', flexDirection: 'column', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', minHeight: 0 }}>

                        {/* Topbar */}
                        <div style={{ padding: '11px 15px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <Avatar name={conv.from} color={conv.color} size={36} online={conv.online} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0, fontFamily: "'Outfit',sans-serif" }}>{conv.from}</p>
                                <p style={{ fontSize: 11, color: C.green, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }}/>
                                    {conv.online ? 'Online' : 'Away'}
                                </p>
                            </div>
                            <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.muted} strokeWidth="1.5"/><path d="M12 8h.01M11 12h1v4h1" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                        </div>

                        {/* Messages — independently scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
                            <div style={{ textAlign: 'center', fontSize: 10, color: C.faint, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                <div style={{ flex: 1, height: '0.5px', background: C.border }}/> Today <div style={{ flex: 1, height: '0.5px', background: C.border }}/>
                            </div>

                            {conv.messages.map((m, i) => {
                                const isMe = m.from === 'me'
                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 7 }}>
                                        {!isMe && <Avatar name={conv.from} color={conv.color} size={26} />}
                                        <div>
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                                        style={{ maxWidth: '66%', padding: '8px 12px', fontSize: 13, lineHeight: 1.55, wordBreak: 'break-word',
                                                            borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                                            background: isMe ? C.green : C.card,
                                                            color: isMe ? '#fff' : C.text,
                                                            border: isMe ? 'none' : `1px solid ${C.border}` }}>
                                                <p style={{ margin: '0 0 3px' }}>{m.text}</p>
                                                <p style={{ fontSize: 9, margin: 0, opacity: .6, textAlign: isMe ? 'right' : 'left' }}>{m.time}{isMe ? ' ✓✓' : ''}</p>
                                            </motion.div>
                                            {m.reactions?.length > 0 && (
                                                <div style={{ display: 'flex', gap: 3, marginTop: 3, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                    {m.reactions.map((r, ri) => (
                                                        <span key={ri} onClick={() => toggleReaction(conv.id, i, r)}
                                                              style={{ fontSize: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '2px 6px', cursor: 'pointer' }}>
                              {r}
                            </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 33 }}>
                                    {[0, .2, .4].map((d, i) => (
                                        <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ delay: d, repeat: Infinity, duration: .9 }}
                                                    style={{ width: 5, height: 5, borderRadius: '50%', background: C.faint }}/>
                                    ))}
                                    <span style={{ fontSize: 10, color: C.faint, marginLeft: 3 }}>typing…</span>
                                </motion.div>
                            )}
                            <div ref={bottomRef}/>
                        </div>

                        {/* Input */}
                        <div style={{ padding: '10px 13px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '7px 13px' }}>
                                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                       placeholder="Type a message…"
                                       style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: C.text, fontFamily: "'Outfit',sans-serif" }}/>
                            </div>
                            <motion.button whileTap={{ scale: .9 }} onClick={sendMsg}
                                           style={{ width: 34, height: 34, borderRadius: '50%', background: C.green, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon name="send" size={14} color="#fff"/>
                            </motion.button>
                        </div>
                    </div>

                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="chat" size={22} color={C.faint}/>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.faint }}>No conversation selected</p>
                        <p style={{ fontSize: 12, color: C.faint }}>Pick one or send a new request</p>
                    </div>
                )}
            </div>

            {/* New chat modal */}
            {showModal && (
                <NewChatModal
                    existingNames={chats.map(c => c.from)}
                    sentNames={sentReqs.map(r => r.name)}
                    onClose={() => setShowModal(false)}
                    onSend={handleSendRequest}
                />
            )}

            {/* Toast */}
            {toast && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', zIndex: 60 }}>
                    {toast}
                </motion.div>
            )}
        </div>
    )
}

/* ── PAGE: PROFILE ── */
const Profile = () => {
    const [editMode, setEditMode] = useState(false)
    const [form, setForm] = useState({ name:VOLUNTEER.name, email:VOLUNTEER.email, phone:VOLUNTEER.phone, zone:VOLUNTEER.zone })
    const [saved, setSaved] = useState(false)

    const save = () => { setSaved(true); setEditMode(false); setTimeout(() => setSaved(false), 2500) }

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const activityData = useRef(MONTHS.map(m => ({ month:m, tasks:Math.floor(Math.random()*8)+2 }))).current

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:0, fontFamily:"'Outfit',sans-serif" }}>My Profile</h2>
                <div style={{ display:"flex", gap:8 }}>
                    {saved && (
                        <motion.div initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
                                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:11, background:C.greenLt, color:C.green, fontSize:12, fontWeight:700 }}>
                            <Icon name="check" size={13} color={C.green}/> Saved!
                        </motion.div>
                    )}
                    <motion.button whileTap={{ scale:.97 }} onClick={() => editMode ? save() : setEditMode(true)}
                                   style={{ padding:"8px 18px", borderRadius:11, background:editMode ? C.green : "transparent", border:`1px solid ${editMode ? C.green : C.border}`, color:editMode ? "#fff" : C.muted, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                        <Icon name={editMode ? "check" : "edit"} size={13} color={editMode ? "#fff" : C.muted}/>
                        {editMode ? "Save Changes" : "Edit Profile"}
                    </motion.button>
                </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:"24px 20px", textAlign:"center" }}>
                        <div style={{ width:72, height:72, borderRadius:20, background:`linear-gradient(135deg,${C.green},#2A6B10)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:900, color:"#fff", margin:"0 auto 14px", boxShadow:`0 6px 24px ${C.green}35` }}>{VOLUNTEER.init}</div>
                        {editMode ? (
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))}
                                   style={{ fontSize:16, fontWeight:800, color:C.text, border:`1px solid ${C.border}`, borderRadius:9, padding:"6px 10px", background:C.card, fontFamily:"'Outfit',sans-serif", textAlign:"center", outline:"none", width:"100%", boxSizing:"border-box", marginBottom:4 }}/>
                        ) : (
                            <p style={{ fontSize:16, fontWeight:800, color:C.text, margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>{VOLUNTEER.name}</p>
                        )}
                        <p style={{ fontSize:12, color:C.muted, margin:"0 0 10px" }}>{VOLUNTEER.zone}</p>
                        <Badge color={C.amber} bg={C.amberLt}>🏅 {VOLUNTEER.badge}</Badge>
                        <div style={{ marginTop:16, padding:"12px 14px", borderRadius:12, background:C.greenLt, border:`1px solid ${C.green}25` }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <Icon name="fire" size={14} color={C.green}/>
                                <p style={{ fontSize:13, fontWeight:800, color:C.green, margin:0, fontFamily:"'Outfit',sans-serif" }}>{VOLUNTEER.streak}-day streak 🔥</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px" }}>
                        <p style={{ fontSize:11, fontWeight:700, color:C.muted, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:".6px" }}>Skills</p>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {VOLUNTEER.skills.map(s => <Badge key={s} color={C.green} bg={C.greenLt}>{s}</Badge>)}
                            <Badge color={C.blue} bg={C.blueLt}>+ Add Skill</Badge>
                        </div>
                    </div>

                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px" }}>
                        <p style={{ fontSize:11, fontWeight:700, color:C.muted, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:".6px" }}>Stats</p>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                            {[
                                { l:"Tasks", v:VOLUNTEER.tasksCompleted, c:C.green },
                                { l:"Hours", v:`${VOLUNTEER.hoursLogged}h`, c:C.amber },
                                { l:"Impact", v:`${VOLUNTEER.impactScore}%`, c:C.teal },
                                { l:"Rank", v:`#${VOLUNTEER.rank}`, c:C.purple },
                            ].map(s => (
                                <div key={s.l} style={{ background:C.card, borderRadius:10, padding:"10px", textAlign:"center", border:`1px solid ${C.border}` }}>
                                    <p style={{ fontSize:18, fontWeight:900, color:s.c, margin:0, fontFamily:"'Outfit',sans-serif" }}>{s.v}</p>
                                    <p style={{ fontSize:9, color:C.muted, margin:"2px 0 0", fontWeight:600 }}>{s.l}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px" }}>
                        <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 14px", textTransform:"uppercase", letterSpacing:".6px" }}>Contact Information</p>
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            {[["Email",form.email,"phone"],["Phone",form.phone,"phone"],["Zone",form.zone,"pin"]].map(([label, val, ic]) => (
                                <div key={label} style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <div style={{ width:34, height:34, borderRadius:10, background:C.card, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.border}` }}>
                                        <Icon name={ic} size={14} color={C.muted}/>
                                    </div>
                                    <div style={{ flex:1 }}>
                                        <p style={{ fontSize:10, color:C.faint, margin:0, fontWeight:600, textTransform:"uppercase", letterSpacing:".4px" }}>{label}</p>
                                        {editMode ? (
                                            <input value={val} onChange={e => setForm(p => ({ ...p, [label.toLowerCase()]:e.target.value }))}
                                                   style={{ fontSize:13, fontWeight:600, color:C.text, border:`1px solid ${C.border}`, borderRadius:7, padding:"4px 8px", background:C.card, fontFamily:"'Outfit',sans-serif", outline:"none", width:"100%", boxSizing:"border-box", marginTop:2 }}/>
                                        ) : (
                                            <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:0 }}>{val}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px" }}>
                        <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 16px", textTransform:"uppercase", letterSpacing:".6px" }}>Activity — 2024</p>
                        <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:80 }}>
                            {activityData.map((d, i) => (
                                <motion.div key={d.month} initial={{ height:0 }} animate={{ height:`${(d.tasks/10)*100}%` }}
                                            transition={{ delay:.3+i*.04, type:"spring", stiffness:200, damping:20 }}
                                            style={{ flex:1, borderRadius:4, background:i === 6 ? C.green : `${C.green}30`, minHeight:4, cursor:"pointer" }}
                                            title={`${d.month}: ${d.tasks} tasks`}/>
                            ))}
                        </div>
                        <div style={{ display:"flex", gap:4, marginTop:6 }}>
                            {activityData.map(d => <span key={d.month} style={{ flex:1, textAlign:"center", fontSize:8, color:C.faint }}>{d.month}</span>)}
                        </div>
                    </div>

                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"18px 20px" }}>
                        <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 14px", textTransform:"uppercase", letterSpacing:".6px" }}>Achievements</p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                            {[
                                { emoji:"🏅", label:"Field Hero",     unlocked:true  },
                                { emoji:"🔥", label:"Hot Streak",     unlocked:true  },
                                { emoji:"💧", label:"Water Hero",     unlocked:true  },
                                { emoji:"🏆", label:"Top Ranker",     unlocked:false },
                                { emoji:"⚡", label:"Speed Demon",    unlocked:false },
                                { emoji:"🌟", label:"Star Volunteer", unlocked:true  },
                                { emoji:"🤝", label:"Team Player",    unlocked:true  },
                                { emoji:"📦", label:"Supply Chain",   unlocked:false },
                            ].map(b => (
                                <div key={b.label} style={{ textAlign:"center", padding:"12px 8px", borderRadius:12, background:b.unlocked ? C.amberLt : C.card, border:`1px solid ${b.unlocked ? C.amber+"30" : C.border}`, opacity:b.unlocked ? 1 : .45 }}>
                                    <p style={{ fontSize:22, margin:"0 0 4px" }}>{b.emoji}</p>
                                    <p style={{ fontSize:9, fontWeight:700, color:b.unlocked ? C.amber : C.muted, margin:0, textAlign:"center", lineHeight:1.3 }}>{b.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── SIDEBAR ── */
const NAV = [
    { key:"dashboard",   icon:"home",   label:"Dashboard"   },
    { key:"tasks",       icon:"tasks",  label:"Tasks"       },
    { key:"map",         icon:"map",    label:"Heatmap"     },
    { key:"leaderboard", icon:"trophy", label:"Leaderboard" },
    { key:"messages",    icon:"chat",   label:"Messages"    },
    { key:"profile",     icon:"user",   label:"Profile"     },
]

const Sidebar = ({ active, onNav, collapsed }) => (
    <motion.div animate={{ width:collapsed ? 64 : 220 }} transition={{ type:"spring", stiffness:300, damping:30 }}
                style={{ background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0, overflow:"hidden" }}>
        <div style={{ padding:"20px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:`linear-gradient(135deg,${C.green},#2A6B10)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="zap" size={16} color="#fff"/>
            </div>
            <AnimatePresence>
                {!collapsed && (
                    <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
                        <p style={{ fontSize:14, fontWeight:900, color:C.text, margin:0, fontFamily:"'Outfit',sans-serif", letterSpacing:"-.3px" }}>CivicPulse</p>
                        <p style={{ fontSize:9, color:C.faint, margin:0, fontWeight:600, letterSpacing:".5px" }}>VOLUNTEER</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:3 }}>
            {NAV.map(item => {
                const isActive = active === item.key
                return (
                    <motion.button key={item.key} whileTap={{ scale:.96 }} onClick={() => onNav(item.key)}
                                   style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:11, border:"none", background:isActive ? `${C.green}15` : "transparent", cursor:"pointer", fontFamily:"'Outfit',sans-serif", transition:"background .15s", width:"100%", borderLeft:`3px solid ${isActive ? C.green : "transparent"}` }}>
                        <Icon name={item.icon} size={17} color={isActive ? C.green : C.faint} style={{ flexShrink:0 }}/>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                             style={{ fontSize:13, fontWeight:isActive ? 700 : 500, color:isActive ? C.text : C.muted, whiteSpace:"nowrap" }}>
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                )
            })}
        </div>

        <div style={{ padding:"12px 10px", borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:11, background:C.greenLt, marginBottom:6 }}>
                <div style={{ width:30, height:30, borderRadius:9, background:C.green, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#fff" }}>{VOLUNTEER.init}</div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                            <p style={{ fontSize:11, fontWeight:700, color:C.text, margin:0 }}>{VOLUNTEER.name}</p>
                            <p style={{ fontSize:9, color:C.muted, margin:0 }}>Field Hero</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <motion.button whileTap={{ scale:.96 }} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, border:"none", background:"transparent", color:C.red, cursor:"pointer", fontFamily:"'Outfit',sans-serif", width:"100%" }}>
                <Icon name="logout" size={15} color={C.red} style={{ flexShrink:0 }}/>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                     style={{ fontSize:12, fontWeight:600 }}>Log out</motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    </motion.div>
)

/* ── TOPBAR ── */
const Topbar = ({ page, onToggle, notifOpen, setNotifOpen }) => {
    const unread = NOTIFS.filter(n => n.unread).length
    const titles = { dashboard:"Dashboard", tasks:"My Tasks", map:"Heatmap", leaderboard:"Leaderboard", messages:"Messages", profile:"Profile" }

    return (
        <div style={{ height:60, borderBottom:`1px solid ${C.border}`, background:C.surface, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", flexShrink:0, position:"sticky", top:0, zIndex:50 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <motion.button whileTap={{ scale:.9 }} onClick={onToggle}
                               style={{ width:34, height:34, borderRadius:9, border:`1px solid ${C.border}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>
                    <Icon name="menu" size={15} color={C.muted}/>
                </motion.button>
                <h2 style={{ fontSize:16, fontWeight:800, color:C.text, margin:0, fontFamily:"'Outfit',sans-serif" }}>{titles[page] || page}</h2>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <motion.div animate={{ opacity:[1,.5,1] }} transition={{ duration:2, repeat:Infinity }}
                            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:20, background:C.greenLt, border:`1px solid ${C.green}25` }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, boxShadow:`0 0 7px ${C.green}` }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:C.green }}>2 Active</span>
                </motion.div>

                <div style={{ position:"relative" }}>
                    <motion.button whileTap={{ scale:.9 }} onClick={() => setNotifOpen(p => !p)}
                                   style={{ width:36, height:36, borderRadius:10, border:`1px solid ${C.border}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                        <Icon name="bell" size={16} color={C.muted}/>
                        {unread > 0 && (
                            <div style={{ position:"absolute", top:-4, right:-4, width:17, height:17, borderRadius:"50%", background:C.red, color:"#fff", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${C.bg}` }}>{unread}</div>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div initial={{ opacity:0, y:8, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.95 }}
                                        style={{ position:"absolute", right:0, top:44, width:320, background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"14px 16px", zIndex:200, boxShadow:"0 20px 60px rgba(0,0,0,.18)" }}>
                                <p style={{ fontSize:12, fontWeight:800, color:C.text, margin:"0 0 12px", fontFamily:"'Outfit',sans-serif" }}>Notifications</p>
                                {NOTIFS.map((n, i) => (
                                    <div key={n.id} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:i < NOTIFS.length-1 ? `1px solid ${C.border}` : "none", opacity:n.unread ? 1 : .55 }}>
                                        <div style={{ width:30, height:30, borderRadius:9, flexShrink:0, background:n.unread ? C.redLt : C.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                                            {n.type==="urgent"?"🚨":n.type==="match"?"🤖":n.type==="badge"?"🏅":n.type==="streak"?"🔥":"✅"}
                                        </div>
                                        <div>
                                            <p style={{ fontSize:11, color:C.text, margin:0, lineHeight:1.45, fontWeight:n.unread ? 700 : 400 }}>{n.text}</p>
                                            <p style={{ fontSize:9, color:C.muted, margin:"2px 0 0" }}>{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

/* ── MOBILE DRAWER ── */
const MobileDrawer = ({ open, onClose, onNav, currentPage }) => (
    <AnimatePresence>
        {open && (
            <>
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            onClick={onClose}
                            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", zIndex:300 }}/>
                <motion.div initial={{ x:"-100%" }} animate={{ x:0 }} exit={{ x:"-100%" }}
                            transition={{ type:"spring", stiffness:300, damping:30 }}
                            style={{ position:"fixed", left:0, top:0, bottom:0, width:280, background:C.surface, borderRight:`1px solid ${C.border}`, zIndex:400, padding:20, display:"flex", flexDirection:"column", gap:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, paddingTop:10 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${C.green},#2A6B10)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#fff" }}>{VOLUNTEER.init}</div>
                        <div>
                            <p style={{ fontSize:13, fontWeight:800, color:C.text, margin:0 }}>{VOLUNTEER.name}</p>
                            <p style={{ fontSize:9, color:C.muted, margin:0 }}>Volunteer · {VOLUNTEER.zone}</p>
                        </div>
                    </div>
                    {NAV.map(item => (
                        <motion.button key={item.key} whileHover={{ background:`${C.green}12` }} whileTap={{ scale:.97 }}
                                       onClick={() => { onNav(item.key); onClose() }}
                                       style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:"none", background:currentPage === item.key ? `${C.green}15` : "transparent", borderLeft:currentPage === item.key ? `2px solid ${C.green}` : "2px solid transparent", color:currentPage === item.key ? C.text : C.muted, cursor:"pointer", fontFamily:"'Outfit',sans-serif", transition:"all .15s" }}>
                            <Icon name={item.icon} size={15} color={currentPage === item.key ? C.green : C.muted}/>
                            <span style={{ fontSize:13, fontWeight:currentPage === item.key ? 700 : 500 }}>{item.label}</span>
                        </motion.button>
                    ))}
                    <div style={{ marginTop:"auto" }}>
                        <motion.button whileTap={{ scale:.97 }}
                                       style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:10, border:"none", background:"transparent", color:C.red, cursor:"pointer", fontFamily:"'Outfit',sans-serif", width:"100%" }}>
                            <Icon name="logout" size={14} color={C.red}/>
                            <span style={{ fontSize:13, fontWeight:600 }}>Log out</span>
                        </motion.button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
)

/* ── ROOT EXPORT ── */
export default function VolunteerHome() {
    const [page, setPage] = useState("dashboard")
    const [collapsed, setCollapsed] = useState(false)
    const [activeTask, setActiveTask] = useState(null)
    const [notifOpen, setNotifOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const PAGES = {
        dashboard:   <Dashboard onTaskOpen={setActiveTask}/>,
        tasks:       <Tasks onTaskOpen={setActiveTask}/>,
        map:         <MapPage/>,
        leaderboard: <LeaderboardPage/>,
        messages:    <MessagesPage/>,
        profile:     <Profile/>,
    }

    const navigate = (p) => { setPage(p); setNotifOpen(false); setMenuOpen(false) }

    return (
        <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Outfit',sans-serif", display:"flex" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
                *{box-sizing:border-box;margin:0;padding:0}
                ::-webkit-scrollbar{width:4px;height:4px}
                ::-webkit-scrollbar-thumb{background:rgba(61,138,37,.25);border-radius:2px}
                input{outline:none;}
                input::placeholder{color:#9BAD90}
                button{outline:none;}
            `}</style>

            <Particles/>

            {/* Desktop sidebar */}
            <div style={{ position:"relative", zIndex:10 }}>
                <Sidebar active={page} onNav={navigate} collapsed={collapsed}/>
            </div>

            <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, position:"relative", zIndex:1 }}>
                <Topbar page={page} onToggle={() => setCollapsed(p => !p)} notifOpen={notifOpen} setNotifOpen={setNotifOpen}/>

                <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onNav={navigate} currentPage={page}/>

                <main style={{ flex:1, overflowY:"auto" }}>
                    <div style={{ padding:"24px 28px", maxWidth:1100, margin:"0 auto" }}>
                        <AnimatePresence mode="wait">
                            <motion.div key={page}
                                        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                                        exit={{ opacity:0, y:-8 }} transition={{ duration:.2 }}>
                                {PAGES[page]}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {activeTask && <TaskModal task={activeTask} onClose={() => setActiveTask(null)}/>}
            </AnimatePresence>

            {notifOpen && (
                <div style={{ position:"fixed", inset:0, zIndex:100 }} onClick={() => setNotifOpen(false)}/>
            )}
        </div>
    )
}