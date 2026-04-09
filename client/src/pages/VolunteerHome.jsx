import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
    Zap, MapPin, Clock, CheckCircle, AlertTriangle, Star,
    ChevronRight, Bell, Search, LogOut, User, Activity,
    Heart, Home, Droplets, BookOpen, Utensils, Shield,
    TrendingUp, Award, Calendar, Filter, Phone, Navigation,
    RefreshCw, ArrowRight, X, Check, Menu, MessageSquare,
    Flame, Target, BarChart3, Eye, Layers, Radio
} from "lucide-react"

/* ── THEME: Earthy-dark, warm tones — distinct from coordinator's cold blue ── */
const T = {
    bg:       "#0A0F08",
    surface:  "#111A0E",
    card:     "#313c2c",
    cardHi:   "#e8efe6",
    border:   "rgba(120,180,80,0.12)",
    borderHi: "rgba(120,180,80,0.35)",
    text:     "#EDF5E0",
    muted:    "#7A9B6A",
    accent:   "#78B450",  // fresh green
    accentDim:"rgba(120,180,80,0.18)",
    amber:    "#E8A020",
    red:      "#E05A3A",
    teal:     "#2DC9A0",
    purple:   "#9B7CF8",
}

/* ── MOCK VOLUNTEER DATA ── */
const VOLUNTEER = {
    name: "Arjun Patil",
    init: "AP",
    badge: "Field Hero",
    zone: "Dharavi, Mumbai",
    skills: ["Medical Aid","Water","Logistics"],
    tasksCompleted: 47,
    hoursLogged: 183,
    impactScore: 94,
    streak: 12,
    rank: 4,
    joined: "Mar 2023",
}

const MY_TASKS = [
    {
        id:"T-201", title:"Emergency medical kit delivery",
        cat:"medical", loc:"Dharavi North · Block 7",
        urgency:5, due:"Today, 3:00 PM",
        status:"active", people:34, distance:"1.2 km",
        desc:"Deliver 2 emergency medical kits to the primary care centre. Contact Dr. Meena on arrival.",
        contact:"+91 98765 11111",
    },
    {
        id:"T-202", title:"Water distribution assist",
        cat:"water", loc:"Kurla West · Sector B",
        urgency:4, due:"Today, 5:30 PM",
        status:"active", people:80, distance:"3.4 km",
        desc:"Assist NGO coordinator with water tanker distribution. 80 families expected.",
        contact:"+91 98765 22222",
    },
    {
        id:"T-203", title:"Food packet distribution",
        cat:"food", loc:"Sion · Camp Area",
        urgency:3, due:"Tomorrow, 10:00 AM",
        status:"upcoming", people:120, distance:"4.1 km",
        desc:"Help distribute 120 food packets at the community camp. Sorting begins at 9:30 AM.",
        contact:"+91 98765 33333",
    },
    {
        id:"T-204", title:"Shelter assessment survey",
        cat:"shelter", loc:"Chembur · Zone C",
        urgency:2, due:"Thu, 11:00 AM",
        status:"upcoming", people:18, distance:"6.7 km",
        desc:"Survey 18 families for shelter quality. Fill digital form on arrival.",
        contact:"+91 98765 44444",
    },
]

const COMPLETED_TASKS = [
    { id:"T-190", title:"Medical checkup assist", cat:"medical", loc:"Andheri", date:"Yesterday", rating:5 },
    { id:"T-188", title:"Food delivery – Dharavi",cat:"food",    loc:"Dharavi", date:"Mon",      rating:5 },
    { id:"T-185", title:"Water purification",     cat:"water",   loc:"Kurla",   date:"Sun",      rating:4 },
]

const LEADERBOARD = [
    { rank:1, name:"Priya Mehta",  init:"PM", score:98, tasks:52, badge:"🏆", color:"#E8A020" },
    { rank:2, name:"Rahul Singh",  init:"RS", score:95, tasks:49, badge:"🥈", color:"#9CA3AF" },
    { rank:3, name:"Sneha Joshi",  init:"SJ", score:92, tasks:45, badge:"🥉", color:"#CD7F32" },
    { rank:4, name:"Arjun Patil",  init:"AP", score:94, tasks:47, badge:"⭐", color:T.accent, isMe:true },
    { rank:5, name:"Divya Nair",   init:"DN", score:89, tasks:41, badge:"",   color:T.purple },
]

const HEATMAP_ZONES = [
    { zone:"Dharavi",   x:33, y:30, intensity:.92, needs:47, cat:"medical", active:true  },
    { zone:"Kurla",     x:58, y:44, intensity:.73, needs:32, cat:"water",   active:false },
    { zone:"Sion",      x:28, y:52, intensity:.58, needs:19, cat:"food",    active:false },
    { zone:"Chembur",   x:48, y:68, intensity:.64, needs:26, cat:"shelter", active:false },
    { zone:"Andheri",   x:72, y:58, intensity:.48, needs:18, cat:"food",    active:false },
    { zone:"Ghatkopar", x:76, y:38, intensity:.82, needs:41, cat:"water",   active:false },
    { zone:"Mankhurd",  x:82, y:65, intensity:.38, needs:14, cat:"education",active:false},
]

const NOTIFS = [
    { id:1, icon:"🚨", text:"New URGENT task near you — Medical · Dharavi", time:"2m ago", unread:true  },
    { id:2, icon:"🤖", text:"AI matched you to 2 new tasks based on your skills", time:"15m ago",unread:true },
    { id:3, icon:"🏅", text:"You earned the 'Field Hero' badge!", time:"1h ago", unread:false },
    { id:4, icon:"✅", text:"Task T-188 marked complete by coordinator", time:"Yesterday", unread:false },
]

const CAT_CFG = {
    medical:   { color:"#E05A3A", icon:Heart,    label:"Medical"   },
    food:      { color:"#E8A020", icon:Utensils, label:"Food"      },
    water:     { color:"#06B6D4", icon:Droplets, label:"Water"     },
    shelter:   { color:"#9B7CF8", icon:Home,     label:"Shelter"   },
    education: { color:T.accent,  icon:BookOpen, label:"Education" },
}

const URGENCY_COLOR = (u) =>
    u >= 5 ? "#E05A3A" : u === 4 ? "#E8A020" : u === 3 ? "#78B450" : T.muted

/* ── SHARED UI ── */
const Card = ({ children, style={}, onClick, hover=true }) => (
    <motion.div
        whileHover={hover ? { y:-2, borderColor:T.borderHi } : {}}
        onClick={onClick}
        style={{
            background:T.card, border:`1px solid ${T.border}`,
            borderRadius:16, transition:"border-color .2s",
            cursor: onClick ? "pointer" : "default",
            ...style,
        }}>
        {children}
    </motion.div>
)

/* ── PARTICLE BG ── */
const Particles = () => (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {Array.from({length:14},(_,i)=>({
            id:i, x:Math.random()*100, y:Math.random()*100,
            dur:Math.random()*5+4, delay:Math.random()*3,
        })).map(p=>(
            <motion.div key={p.id}
                        animate={{y:[0,-24,0],opacity:[0.06,0.22,0.06]}}
                        transition={{duration:p.dur,delay:p.delay,repeat:Infinity,ease:"easeInOut"}}
                        style={{
                            position:"absolute",left:`${p.x}%`,top:`${p.y}%`,
                            width:3,height:3,borderRadius:"50%",background:T.accent,
                        }}
            />
        ))}
        {/* Warm glow top-right */}
        <div style={{
            position:"absolute",top:-100,right:-100,
            width:500,height:500,borderRadius:"50%",
            background:`radial-gradient(circle,${T.accent}18 0%,transparent 70%)`,
            filter:"blur(40px)",
        }}/>
    </div>
)

/* ── TOPBAR ── */
const Topbar = ({ onMenuToggle, menuOpen }) => {
    const navigate = useNavigate()
    const [notifOpen, setNotifOpen] = useState(false)
    const unread = NOTIFS.filter(n=>n.unread).length

    return (
        <div style={{
            position:"sticky",top:0,zIndex:100,
            background:"rgba(10,15,8,0.95)",
            backdropFilter:"blur(16px)",
            borderBottom:`1px solid ${T.border}`,
            padding:"14px 24px",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            gap:12,
        }}>
            {/* Logo + greeting */}
            <div style={{display:"flex",alignItems:"center",gap:14}}>
                <motion.button
                    whileTap={{scale:.9}}
                    onClick={onMenuToggle}
                    style={{
                        width:36,height:36,borderRadius:10,border:`1px solid ${T.border}`,
                        background:"transparent",display:"flex",alignItems:"center",
                        justifyContent:"center",cursor:"pointer",color:T.muted,
                        flexShrink:0,
                    }}>
                    {menuOpen ? <X size={16}/> : <Menu size={16}/>}
                </motion.button>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{
                        width:32,height:32,borderRadius:9,
                        background:`linear-gradient(135deg,${T.accent},#5A9A30)`,
                        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                    }}>
                        <Zap size={15} color="#fff"/>
                    </div>
                    <div>
                        <p style={{fontSize:13,fontWeight:800,color:T.text,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
                            CivicPulse
                        </p>
                        <p style={{fontSize:9,color:T.muted,margin:0,fontWeight:600}}>VOLUNTEER PORTAL</p>
                    </div>
                </div>
            </div>

            {/* Right controls */}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
                {/* Live badge */}
                <motion.div animate={{opacity:[1,.5,1]}} transition={{duration:2,repeat:Infinity}}
                            style={{
                                display:"flex",alignItems:"center",gap:5,padding:"5px 10px",
                                borderRadius:8,background:`${T.accent}15`,border:`1px solid ${T.accent}30`,
                            }}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:T.accent,
                        boxShadow:`0 0 6px ${T.accent}`}}/>
                    <span style={{fontSize:10,fontWeight:700,color:T.accent}}>2 tasks active</span>
                </motion.div>

                {/* Notifications */}
                <div style={{position:"relative"}}>
                    <motion.button whileTap={{scale:.9}}
                                   onClick={()=>setNotifOpen(p=>!p)}
                                   style={{
                                       width:36,height:36,borderRadius:10,
                                       background:T.surface,border:`1px solid ${T.border}`,
                                       display:"flex",alignItems:"center",justifyContent:"center",
                                       cursor:"pointer",color:T.muted,position:"relative",
                                   }}>
                        <Bell size={15}/>
                        {unread>0 && (
                            <span style={{
                                position:"absolute",top:-4,right:-4,
                                width:16,height:16,borderRadius:"50%",
                                background:T.red,color:"#fff",fontSize:9,fontWeight:800,
                                display:"flex",alignItems:"center",justifyContent:"center",
                            }}>{unread}</span>
                        )}
                    </motion.button>
                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div initial={{opacity:0,y:8,scale:.95}}
                                        animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:.95}}
                                        style={{
                                            position:"absolute",right:0,top:44,width:300,
                                            background:T.card,border:`1px solid ${T.border}`,
                                            borderRadius:14,padding:14,zIndex:200,
                                            boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
                                        }}>
                                <p style={{fontSize:12,fontWeight:800,color:T.text,margin:"0 0 10px"}}>Notifications</p>
                                {NOTIFS.map(n=>(
                                    <div key={n.id} style={{
                                        display:"flex",gap:8,padding:"8px 0",
                                        borderBottom:`1px solid ${T.border}`,
                                        opacity: n.unread ? 1 : 0.6,
                                    }}>
                                        <span style={{fontSize:14,flexShrink:0}}>{n.icon}</span>
                                        <div>
                                            <p style={{fontSize:11,color:T.text,margin:0,lineHeight:1.4,fontWeight: n.unread?700:500}}>
                                                {n.text}
                                            </p>
                                            <p style={{fontSize:9,color:T.muted,margin:"2px 0 0"}}>{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Avatar */}
                <div style={{
                    width:36,height:36,borderRadius:10,
                    background:`linear-gradient(135deg,${T.accent},#5A9A30)`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:900,color:"#fff",cursor:"pointer",
                }}>
                    {VOLUNTEER.init}
                </div>
            </div>
        </div>
    )
}

/* ── STAT CARD ── */
const StatCard = ({ label, value, icon:Icon, color, delay=0 }) => (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay}}
                whileHover={{y:-3}}
                style={{
                    background:T.card,border:`1px solid ${T.border}`,
                    borderRadius:14,padding:"16px 18px",
                }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{
                width:32,height:32,borderRadius:9,
                background:`${color}20`,
                display:"flex",alignItems:"center",justifyContent:"center",
            }}>
                <Icon size={15} style={{color}}/>
            </div>
            <motion.div animate={{opacity:[1,.4,1]}} transition={{duration:3,repeat:Infinity,delay}}
                        style={{width:5,height:5,borderRadius:"50%",background:color}}/>
        </div>
        <p style={{fontSize:24,fontWeight:900,color,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{value}</p>
        <p style={{fontSize:10,color:T.muted,margin:"3px 0 0",fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>
            {label}
        </p>
    </motion.div>
)

/* ── TASK CARD ── */
const TaskCard = ({ task, onOpen, delay=0 }) => {
    const cfg = CAT_CFG[task.cat]
    const uc = URGENCY_COLOR(task.urgency)
    const isActive = task.status === "active"

    return (
        <motion.div
            initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}}
            transition={{delay}}
            whileHover={{y:-2,borderColor:isActive?cfg.color:T.borderHi}}
            onClick={()=>onOpen(task)}
            style={{
                background:T.card,
                border:`1px solid ${isActive ? cfg.color+"40" : T.border}`,
                borderRadius:14,padding:"14px 16px",cursor:"pointer",
                transition:"all .2s",
                position:"relative",overflow:"hidden",
            }}>
            {/* Active glow strip */}
            {isActive && (
                <div style={{
                    position:"absolute",top:0,left:0,right:0,height:2,
                    background:`linear-gradient(90deg,${cfg.color},${cfg.color}60)`,
                }}/>
            )}

            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                {/* Icon */}
                <div style={{
                    width:34,height:34,borderRadius:10,
                    background:`${cfg.color}20`,flexShrink:0,
                    display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                    <cfg.icon size={16} style={{color:cfg.color}}/>
                </div>

                <div style={{flex:1,minWidth:0}}>
                    {/* Title row */}
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <p style={{fontSize:13,fontWeight:800,color:T.text,margin:0}}>{task.title}</p>
                        {isActive && (
                            <motion.span animate={{opacity:[1,.4,1]}} transition={{duration:1.5,repeat:Infinity}}
                                         style={{
                                             fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:20,
                                             background:`${T.red}20`,color:T.red,flexShrink:0,
                                         }}>LIVE</motion.span>
                        )}
                    </div>

                    {/* Meta row */}
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:10,color:T.muted,display:"flex",alignItems:"center",gap:3}}>
              <MapPin size={9}/> {task.loc}
            </span>
                        <span style={{fontSize:10,color:T.muted,display:"flex",alignItems:"center",gap:3}}>
              <Clock size={9}/> {task.due}
            </span>
                        <span style={{fontSize:10,color:T.accent,fontWeight:700}}>
              {task.distance}
            </span>
                    </div>

                    {/* Bottom row */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                        <div style={{display:"flex",gap:3,alignItems:"flex-end"}}>
                            {[1,2,3,4,5].map(b=>(
                                <div key={b} style={{
                                    width:3,height:b<=task.urgency?12:5,borderRadius:2,
                                    background: b<=task.urgency ? uc : "rgba(255,255,255,0.08)",
                                }}/>
                            ))}
                            <span style={{fontSize:9,color:uc,fontWeight:700,marginLeft:3}}>
                U{task.urgency}
              </span>
                        </div>
                        <span style={{fontSize:10,color:T.muted,fontWeight:600}}>
              {task.people} people
            </span>
                        <ChevronRight size={13} style={{color:T.muted}}/>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

/* ── TASK DETAIL MODAL ── */
const TaskModal = ({ task, onClose }) => {
    const cfg = CAT_CFG[task.cat]
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)

    const markDone = () => {
        setLoading(true)
        setTimeout(()=>{setLoading(false);setDone(true)},1800)
    }

    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    style={{
                        position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",
                        backdropFilter:"blur(10px)",zIndex:500,
                        display:"flex",alignItems:"center",justifyContent:"center",padding:20,
                    }}
                    onClick={onClose}>
            <motion.div initial={{scale:.9,y:24}} animate={{scale:1,y:0}}
                        exit={{scale:.9,y:24}} onClick={e=>e.stopPropagation()}
                        style={{
                            background:T.card,border:`1px solid ${cfg.color}40`,
                            borderRadius:22,padding:0,width:"100%",maxWidth:420,
                            overflow:"hidden",boxShadow:"0 40px 100px rgba(0,0,0,0.6)",
                        }}>
                {/* Header */}
                <div style={{
                    background:`linear-gradient(135deg,${cfg.color}25,${cfg.color}08)`,
                    borderBottom:`1px solid ${cfg.color}30`,
                    padding:"18px 20px",
                    display:"flex",alignItems:"center",justifyContent:"space-between",
                }}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{
                            width:38,height:38,borderRadius:11,
                            background:`${cfg.color}25`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                        }}>
                            <cfg.icon size={18} style={{color:cfg.color}}/>
                        </div>
                        <div>
                            <p style={{fontSize:14,fontWeight:800,color:T.text,margin:0}}>{task.title}</p>
                            <p style={{fontSize:10,color:T.muted,margin:0}}>{task.id} · {cfg.label}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                            style={{background:"none",border:"none",color:T.muted,cursor:"pointer"}}>
                        <X size={16}/>
                    </button>
                </div>

                <div style={{padding:20}}>
                    {done ? (
                        <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}}
                                    style={{textAlign:"center",padding:"20px 0"}}>
                            <motion.div initial={{scale:0}} animate={{scale:1}}
                                        transition={{type:"spring",stiffness:200}}
                                        style={{
                                            width:56,height:56,borderRadius:16,background:T.accent,
                                            display:"flex",alignItems:"center",justifyContent:"center",
                                            margin:"0 auto 12px",
                                        }}>
                                <Check size={24} color="#fff"/>
                            </motion.div>
                            <p style={{fontSize:15,fontWeight:800,color:T.accent,margin:"0 0 6px"}}>Task Marked Done!</p>
                            <p style={{fontSize:12,color:T.muted,margin:"0 0 16px"}}>
                                Your coordinator has been notified. +5 impact points added!
                            </p>
                            <button onClick={onClose} style={{
                                padding:"9px 24px",borderRadius:10,background:T.accent,
                                color:"#fff",fontWeight:700,border:"none",cursor:"pointer",
                                fontFamily:"'DM Sans',sans-serif",
                            }}>Close</button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Info grid */}
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                                {[
                                    ["Location", task.loc],
                                    ["Due",      task.due],
                                    ["People",   `${task.people} affected`],
                                    ["Distance", task.distance],
                                ].map(([k,v])=>(
                                    <div key={k} style={{
                                        background:T.surface,borderRadius:10,padding:"9px 12px",
                                        border:`1px solid ${T.border}`,
                                    }}>
                                        <p style={{fontSize:9,color:T.muted,fontWeight:700,margin:"0 0 2px",
                                            textTransform:"uppercase",letterSpacing:".4px"}}>{k}</p>
                                        <p style={{fontSize:12,color:T.text,fontWeight:700,margin:0}}>{v}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div style={{
                                padding:"12px 14px",borderRadius:10,marginBottom:12,
                                background:T.surface,border:`1px solid ${T.border}`,
                            }}>
                                <p style={{fontSize:11,fontWeight:700,color:T.muted,margin:"0 0 5px",
                                    textTransform:"uppercase",letterSpacing:".5px"}}>Instructions</p>
                                <p style={{fontSize:12,color:T.text,margin:0,lineHeight:1.7}}>{task.desc}</p>
                            </div>

                            {/* Contact */}
                            <div style={{
                                display:"flex",alignItems:"center",gap:10,
                                padding:"10px 14px",borderRadius:10,marginBottom:14,
                                background:`${T.accent}10`,border:`1px solid ${T.accent}30`,
                            }}>
                                <Phone size={13} style={{color:T.accent,flexShrink:0}}/>
                                <span style={{fontSize:12,fontWeight:700,color:T.accent}}>Contact: {task.contact}</span>
                            </div>

                            {/* Actions */}
                            <div style={{display:"flex",gap:8}}>
                                <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                               style={{
                                                   flex:1,padding:"10px",borderRadius:11,
                                                   border:`1px solid ${T.border}`,background:"transparent",
                                                   color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",
                                                   fontFamily:"'DM Sans',sans-serif",
                                                   display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                                               }}>
                                    <Navigation size={12}/> Navigate
                                </motion.button>
                                <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                               onClick={markDone}
                                               style={{
                                                   flex:2,padding:"10px",borderRadius:11,
                                                   border:"none",
                                                   background:`linear-gradient(135deg,${T.accent},#5A9A30)`,
                                                   color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",
                                                   fontFamily:"'DM Sans',sans-serif",
                                                   display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                                                   boxShadow:`0 4px 16px ${T.accent}40`,
                                               }}>
                                    {loading
                                        ? <RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/>
                                        : <><CheckCircle size={13}/> Mark Complete</>
                                    }
                                </motion.button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

/* ── HEATMAP ── */
const LiveHeatmap = () => {
    const [hovered, setHovered] = useState(null)
    const [myZoneHighlight, setMyZoneHighlight] = useState(true)

    const intensityColor = (v) => {
        if(v>.85) return "#E05A3A"
        if(v>.7)  return "#E8A020"
        if(v>.55) return "#78B450"
        return "#06B6D4"
    }

    return (
        <Card style={{padding:18}} hover={false}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{
                        width:28,height:28,borderRadius:8,background:`${T.accent}20`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                        <BarChart3 size={13} style={{color:T.accent}}/>
                    </div>
                    <div>
                        <p style={{fontSize:13,fontWeight:800,color:T.text,margin:0}}>Need Heatmap</p>
                        <p style={{fontSize:9,color:T.muted,margin:0}}>Mumbai · Live density</p>
                    </div>
                </div>
                <motion.div animate={{opacity:[1,.4,1]}} transition={{duration:2,repeat:Infinity}}
                            style={{display:"flex",alignItems:"center",gap:4,
                                padding:"3px 8px",borderRadius:6,
                                background:`${T.accent}15`,border:`1px solid ${T.accent}30`}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:T.accent,
                        boxShadow:`0 0 6px ${T.accent}`}}/>
                    <span style={{fontSize:9,fontWeight:700,color:T.accent}}>Live</span>
                </motion.div>
            </div>

            {/* Map */}
            <div style={{
                position:"relative",height:200,borderRadius:12,overflow:"hidden",
                background:"linear-gradient(135deg,#050F08 0%,#0A1A0C 60%,#050F08 100%)",
            }}>
                {/* Scan line */}
                <motion.div
                    animate={{top:["0%","100%"]}}
                    transition={{duration:4,repeat:Infinity,ease:"linear"}}
                    style={{
                        position:"absolute",left:0,right:0,height:2,zIndex:5,
                        background:`linear-gradient(90deg,transparent,${T.accent}50,transparent)`,
                        pointerEvents:"none",
                    }}
                />

                {/* Grid */}
                <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.08}}>
                    {[15,30,45,60,75,90].map(p=>(
                        <g key={p}>
                            <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={T.accent} strokeWidth=".5"/>
                            <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke={T.accent} strokeWidth=".5"/>
                        </g>
                    ))}
                </svg>

                {/* Dots */}
                {HEATMAP_ZONES.map((dot,i)=>{
                    const col = intensityColor(dot.intensity)
                    const sz = dot.intensity*55+15
                    const isMe = dot.active
                    return (
                        <div key={dot.zone} style={{
                            position:"absolute",
                            left:`${dot.x}%`,top:`${dot.y}%`,
                            transform:"translate(-50%,-50%)",zIndex:2,
                        }}>
                            {/* Glow blob */}
                            <motion.div
                                animate={{scale:[1,1.2,1],opacity:[0.35,0.6,0.35]}}
                                transition={{duration:2.5+i*.3,repeat:Infinity}}
                                style={{
                                    position:"absolute",
                                    width:sz,height:sz,borderRadius:"50%",
                                    background:`radial-gradient(circle,${col}60,${col}00)`,
                                    transform:"translate(-50%,-50%)",left:"50%",top:"50%",
                                }}
                            />
                            {/* Dot */}
                            <motion.div
                                whileHover={{scale:1.5}}
                                onHoverStart={()=>setHovered(i)}
                                onHoverEnd={()=>setHovered(null)}
                                style={{
                                    width:isMe?14:10,height:isMe?14:10,borderRadius:"50%",
                                    background:col,cursor:"pointer",position:"relative",zIndex:3,
                                    boxShadow:`0 0 ${isMe?16:8}px ${col}`,
                                    border:isMe?`2px solid ${T.text}`:undefined,
                                }}
                            />
                            {/* "You" label */}
                            {isMe && (
                                <div style={{
                                    position:"absolute",top:-20,left:"50%",transform:"translateX(-50%)",
                                    fontSize:8,fontWeight:800,color:T.accent,
                                    background:T.card,padding:"1px 5px",borderRadius:4,
                                    whiteSpace:"nowrap",border:`1px solid ${T.accent}40`,
                                }}>📍 You're here</div>
                            )}
                            {/* Tooltip */}
                            <AnimatePresence>
                                {hovered===i && (
                                    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                                                style={{
                                                    position:"absolute",bottom:"calc(100%+8px)",
                                                    left:"50%",transform:"translateX(-50%)",
                                                    whiteSpace:"nowrap",
                                                    background:"rgba(10,15,8,0.97)",
                                                    border:`1px solid ${col}50`,borderRadius:7,
                                                    padding:"5px 8px",fontSize:9,color:T.text,
                                                    zIndex:10,pointerEvents:"none",
                                                }}>
                                        <p style={{fontWeight:700,margin:"0 0 1px"}}>{dot.zone}</p>
                                        <p style={{color:T.muted,margin:0}}>{dot.needs} needs · {dot.cat}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}

                {/* Legend */}
                <div style={{position:"absolute",bottom:8,right:8,display:"flex",gap:8}}>
                    {[{l:"Critical",c:"#E05A3A"},{l:"High",c:"#E8A020"},{l:"Low",c:T.accent}].map(x=>(
                        <div key={x.l} style={{display:"flex",alignItems:"center",gap:3}}>
                            <div style={{width:6,height:6,borderRadius:"50%",background:x.c}}/>
                            <span style={{fontSize:8,color:T.muted}}>{x.l}</span>
                        </div>
                    ))}
                </div>
                <p style={{
                    position:"absolute",bottom:8,left:8,
                    fontSize:8,color:T.muted,fontWeight:700,letterSpacing:".1em",
                }}>MUMBAI CITY</p>
            </div>
        </Card>
    )
}

/* ── LEADERBOARD ── */
const Leaderboard = () => (
    <Card style={{padding:18}} hover={false}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:28,height:28,borderRadius:8,background:`${T.amber}20`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Award size={13} style={{color:T.amber}}/>
            </div>
            <div>
                <p style={{fontSize:13,fontWeight:800,color:T.text,margin:0}}>Leaderboard</p>
                <p style={{fontSize:9,color:T.muted,margin:0}}>This month · Your zone</p>
            </div>
        </div>
        {LEADERBOARD.map((v,i)=>(
            <motion.div key={v.rank}
                        initial={{opacity:0,x:10}} animate={{opacity:1,x:0}}
                        transition={{delay:i*.06}}
                        whileHover={{background:`${T.accent}06`}}
                        style={{
                            display:"flex",alignItems:"center",gap:8,
                            padding:"9px 8px",borderRadius:9,
                            border:`1px solid ${v.isMe ? T.accent+"40":"transparent"}`,
                            background: v.isMe ? `${T.accent}08` : "transparent",
                            transition:"all .15s",marginBottom:4,
                        }}>
                <span style={{fontSize:14,width:20,textAlign:"center"}}>{v.badge||`#${v.rank}`}</span>
                <div style={{
                    width:30,height:30,borderRadius:9,background:v.color,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:10,fontWeight:900,color:"#fff",flexShrink:0,
                }}>{v.init}</div>
                <div style={{flex:1}}>
                    <p style={{fontSize:12,fontWeight:700,color:T.text,margin:0}}>
                        {v.name} {v.isMe&&<span style={{fontSize:9,color:T.accent,fontWeight:700}}>(you)</span>}
                    </p>
                    <p style={{fontSize:9,color:T.muted,margin:0}}>{v.tasks} tasks</p>
                </div>
                <div style={{
                    padding:"2px 8px",borderRadius:20,
                    background:`${v.color}20`,color:v.color,
                    fontSize:10,fontWeight:800,
                }}>{v.score}%</div>
            </motion.div>
        ))}
    </Card>
)

/* ── COMPLETED TASKS ── */
const CompletedTasks = () => (
    <Card style={{padding:18}} hover={false}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:28,height:28,borderRadius:8,background:`${T.teal}20`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <CheckCircle size={13} style={{color:T.teal}}/>
            </div>
            <p style={{fontSize:13,fontWeight:800,color:T.text,margin:0}}>Completed</p>
        </div>
        {COMPLETED_TASKS.map((t,i)=>{
            const cfg = CAT_CFG[t.cat]
            return (
                <motion.div key={t.id}
                            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*.06}}
                            style={{
                                display:"flex",alignItems:"center",gap:10,
                                padding:"9px 0",
                                borderBottom: i<COMPLETED_TASKS.length-1?`1px solid ${T.border}`:"none",
                            }}>
                    <div style={{
                        width:28,height:28,borderRadius:8,
                        background:`${cfg.color}18`,flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                        <cfg.icon size={12} style={{color:cfg.color}}/>
                    </div>
                    <div style={{flex:1}}>
                        <p style={{fontSize:12,fontWeight:700,color:T.text,margin:0}}>{t.title}</p>
                        <p style={{fontSize:10,color:T.muted,margin:0}}>{t.loc} · {t.date}</p>
                    </div>
                    <div style={{display:"flex",gap:1}}>
                        {[...Array(5)].map((_,si)=>(
                            <Star key={si} size={9}
                                  style={{color: si<t.rating ? T.amber : "rgba(255,255,255,0.1)"}}
                                  fill={si<t.rating ? T.amber : "none"}
                            />
                        ))}
                    </div>
                </motion.div>
            )
        })}
    </Card>
)

/* ── PROFILE SIDE ── */
const ProfileCard = () => (
    <Card style={{padding:20}} hover={false}>
        {/* Avatar + name */}
        <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{
                width:60,height:60,borderRadius:16,
                background:`linear-gradient(135deg,${T.accent},#5A9A30)`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:20,fontWeight:900,color:"#fff",
                margin:"0 auto 10px",
                boxShadow:`0 4px 20px ${T.accent}40`,
            }}>{VOLUNTEER.init}</div>
            <p style={{fontSize:15,fontWeight:800,color:T.text,margin:0}}>{VOLUNTEER.name}</p>
            <p style={{fontSize:10,color:T.muted,margin:"3px 0 8px"}}>{VOLUNTEER.zone}</p>
            <span style={{
                fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,
                background:`${T.amber}20`,color:T.amber,
                border:`1px solid ${T.amber}30`,
            }}>🏅 {VOLUNTEER.badge}</span>
        </div>

        {/* Streak */}
        <div style={{
            padding:"10px 14px",borderRadius:10,marginBottom:14,
            background:`${T.accent}10`,border:`1px solid ${T.accent}30`,
            display:"flex",alignItems:"center",gap:8,
        }}>
            <Flame size={14} style={{color:T.accent}}/>
            <div>
                <p style={{fontSize:12,fontWeight:800,color:T.accent,margin:0}}>
                    {VOLUNTEER.streak}-day streak! 🔥
                </p>
                <p style={{fontSize:9,color:T.muted,margin:0}}>Keep it going!</p>
            </div>
        </div>

        {/* Skills */}
        <div style={{marginBottom:14}}>
            <p style={{fontSize:9,fontWeight:700,color:T.muted,margin:"0 0 7px",
                textTransform:"uppercase",letterSpacing:".6px"}}>My Skills</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {VOLUNTEER.skills.map(s=>(
                    <span key={s} style={{
                        fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,
                        background:`${T.accent}15`,color:T.accent,
                        border:`1px solid ${T.accent}25`,
                    }}>{s}</span>
                ))}
            </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {[
                {label:"Tasks Done",   value:VOLUNTEER.tasksCompleted, color:T.accent},
                {label:"Hours Logged", value:VOLUNTEER.hoursLogged+"h",color:T.amber},
                {label:"Impact Score", value:VOLUNTEER.impactScore+"%",color:T.teal},
                {label:"Rank",         value:`#${VOLUNTEER.rank}`,     color:T.purple},
            ].map(s=>(
                <div key={s.label} style={{
                    padding:"9px",borderRadius:9,
                    background:T.surface,border:`1px solid ${T.border}`,
                    textAlign:"center",
                }}>
                    <p style={{fontSize:16,fontWeight:900,color:s.color,margin:0}}>{s.value}</p>
                    <p style={{fontSize:9,color:T.muted,margin:"2px 0 0",fontWeight:600}}>{s.label}</p>
                </div>
            ))}
        </div>
    </Card>
)

/* ── MOBILE DRAWER ── */
const MobileDrawer = ({ open, onClose }) => (
    <AnimatePresence>
        {open && (
            <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                            onClick={onClose}
                            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",
                                backdropFilter:"blur(6px)",zIndex:300}}
                />
                <motion.div initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}}
                            transition={{type:"spring",stiffness:300,damping:30}}
                            style={{
                                position:"fixed",left:0,top:0,bottom:0,width:280,
                                background:T.surface,borderRight:`1px solid ${T.border}`,
                                zIndex:400,padding:20,display:"flex",flexDirection:"column",gap:6,
                            }}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,paddingTop:10}}>
                        <div style={{
                            width:40,height:40,borderRadius:12,
                            background:`linear-gradient(135deg,${T.accent},#5A9A30)`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:13,fontWeight:900,color:"#fff",
                        }}>{VOLUNTEER.init}</div>
                        <div>
                            <p style={{fontSize:13,fontWeight:800,color:T.text,margin:0}}>{VOLUNTEER.name}</p>
                            <p style={{fontSize:9,color:T.muted,margin:0}}>Volunteer · {VOLUNTEER.zone}</p>
                        </div>
                    </div>
                    {[
                        {icon:Activity,  label:"My Tasks",    active:true },
                        {icon:BarChart3, label:"Heatmap",     active:false},
                        {icon:Award,     label:"Leaderboard", active:false},
                        {icon:User,      label:"Profile",     active:false},
                        {icon:MessageSquare,label:"Messages", active:false},
                    ].map(item=>(
                        <motion.button key={item.label}
                                       whileHover={{background:`${T.accent}12`}} whileTap={{scale:.97}}
                                       onClick={onClose}
                                       style={{
                                           display:"flex",alignItems:"center",gap:10,
                                           padding:"10px 12px",borderRadius:10,
                                           border:"none",background: item.active ? `${T.accent}15` : "transparent",
                                           borderLeft: item.active ? `2px solid ${T.accent}` : "2px solid transparent",
                                           color: item.active ? T.text : T.muted,cursor:"pointer",
                                           fontFamily:"'DM Sans',sans-serif",transition:"all .15s",
                                       }}>
                            <item.icon size={15} style={{color: item.active ? T.accent : T.muted}}/>
                            <span style={{fontSize:13,fontWeight: item.active ? 700 : 500}}>{item.label}</span>
                        </motion.button>
                    ))}
                    <div style={{marginTop:"auto"}}>
                        <motion.button whileTap={{scale:.97}}
                                       style={{
                                           display:"flex",alignItems:"center",gap:8,
                                           padding:"10px 12px",borderRadius:10,border:"none",
                                           background:"transparent",color:T.red,cursor:"pointer",
                                           fontFamily:"'DM Sans',sans-serif",width:"100%",
                                       }}>
                            <LogOut size={14}/> <span style={{fontSize:13,fontWeight:600}}>Log out</span>
                        </motion.button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
)

/* ── MAIN ── */
export default function VolunteerHome() {
    const [activeTask, setActiveTask] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [tab, setTab] = useState("tasks") // tasks | history | heatmap

    const activeTasks = MY_TASKS.filter(t=>t.status==="active")
    const upcomingTasks = MY_TASKS.filter(t=>t.status==="upcoming")

    return (
        <div style={{
            minHeight:"100vh",background:T.bg,color:T.text,
            fontFamily:"'DM Sans',sans-serif",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#1A2E10;border-radius:2px}
        input::placeholder{color:#7A9B6A}
        option{background:#161F12}
      `}</style>

            <Particles/>

            <div style={{position:"relative",zIndex:1}}>
                <Topbar onMenuToggle={()=>setMenuOpen(p=>!p)} menuOpen={menuOpen}/>
                <MobileDrawer open={menuOpen} onClose={()=>setMenuOpen(false)}/>

                <main style={{padding:"24px",maxWidth:1300,margin:"0 auto"}}>

                    {/* Welcome header */}
                    <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}}
                                style={{marginBottom:22}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                            flexWrap:"wrap",gap:10}}>
                            <div>
                                <h1 style={{fontSize:22,fontWeight:900,color:T.text,margin:"0 0 3px",letterSpacing:"-.4px"}}>
                                    Good afternoon, {VOLUNTEER.name.split(" ")[0]} 👋
                                </h1>
                                <p style={{fontSize:12,color:T.muted}}>
                                    You have <span style={{color:T.red,fontWeight:700}}>{activeTasks.length} active</span> and{" "}
                                    <span style={{color:T.amber,fontWeight:700}}>{upcomingTasks.length} upcoming</span> tasks today
                                </p>
                            </div>
                            <div style={{display:"flex",gap:6}}>
                                <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                               style={{
                                                   display:"flex",alignItems:"center",gap:5,padding:"8px 14px",
                                                   borderRadius:10,border:`1px solid ${T.border}`,
                                                   background:"transparent",color:T.muted,
                                                   fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                                               }}>
                                    <Filter size={12}/> Filter
                                </motion.button>
                                <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                               style={{
                                                   display:"flex",alignItems:"center",gap:5,padding:"8px 14px",
                                                   borderRadius:10,border:`1px solid ${T.accent}40`,
                                                   background:`${T.accent}20`,color:T.accent,
                                                   fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                                               }}>
                                    <Navigation size={12}/> My Zone
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* STAT STRIP */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                        <StatCard label="Tasks Completed" value={VOLUNTEER.tasksCompleted} icon={CheckCircle} color={T.accent} delay={0}/>
                        <StatCard label="Hours Logged"    value={`${VOLUNTEER.hoursLogged}h`} icon={Clock}    color={T.amber}  delay={.06}/>
                        <StatCard label="Impact Score"    value={`${VOLUNTEER.impactScore}%`} icon={Target}   color={T.teal}   delay={.12}/>
                        <StatCard label="Day Streak"      value={`${VOLUNTEER.streak}🔥`}    icon={Flame}    color={T.red}    delay={.18}/>
                    </div>

                    {/* MAIN GRID */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16}}>

                        {/* LEFT: Tasks + history + heatmap */}
                        <div style={{display:"flex",flexDirection:"column",gap:14}}>

                            {/* Tab switcher */}
                            <div style={{
                                display:"flex",gap:6,padding:5,borderRadius:14,
                                background:T.surface,border:`1px solid ${T.border}`,width:"fit-content",
                            }}>
                                {[
                                    {key:"tasks",   label:"My Tasks",   count:MY_TASKS.length},
                                    {key:"heatmap", label:"Heatmap",    count:null},
                                    {key:"history", label:"Completed",  count:COMPLETED_TASKS.length},
                                ].map(t=>(
                                    <motion.button key={t.key}
                                                   whileTap={{scale:.97}}
                                                   onClick={()=>setTab(t.key)}
                                                   style={{
                                                       padding:"7px 16px",borderRadius:10,border:"none",
                                                       cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                                                       background: tab===t.key
                                                           ? `linear-gradient(135deg,${T.accent}25,${T.accent}10)`
                                                           : "transparent",
                                                       boxShadow: tab===t.key ? `inset 0 0 0 1px ${T.accent}40` : "none",
                                                       color: tab===t.key ? T.accent : T.muted,
                                                       fontSize:12,fontWeight:700,
                                                       display:"flex",alignItems:"center",gap:5,
                                                       transition:"all .2s",
                                                   }}>
                                        {t.label}
                                        {t.count!==null && (
                                            <span style={{
                                                fontSize:9,padding:"1px 5px",borderRadius:20,
                                                background: tab===t.key ? T.accent : "rgba(255,255,255,0.08)",
                                                color: tab===t.key ? "#fff" : T.muted,
                                                fontWeight:800,
                                            }}>{t.count}</span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {tab === "tasks" && (
                                    <motion.div key="tasks"
                                                initial={{opacity:0,x:10}} animate={{opacity:1,x:0}}
                                                exit={{opacity:0,x:-10}} transition={{duration:.2}}
                                                style={{display:"flex",flexDirection:"column",gap:10}}>

                                        {/* Active section */}
                                        {activeTasks.length > 0 && (
                                            <div>
                                                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                                                    <motion.div animate={{opacity:[1,.3,1]}} transition={{duration:1.5,repeat:Infinity}}
                                                                style={{width:6,height:6,borderRadius:"50%",background:T.red,
                                                                    boxShadow:`0 0 8px ${T.red}`}}/>
                                                    <span style={{fontSize:10,fontWeight:700,color:T.red,
                                                        textTransform:"uppercase",letterSpacing:".6px"}}>Active Now</span>
                                                </div>
                                                {activeTasks.map((t,i)=>(
                                                    <TaskCard key={t.id} task={t} onOpen={setActiveTask} delay={i*.06}/>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upcoming section */}
                                        {upcomingTasks.length > 0 && (
                                            <div style={{marginTop:6}}>
                                                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                                                    <div style={{width:6,height:6,borderRadius:"50%",background:T.amber}}/>
                                                    <span style={{fontSize:10,fontWeight:700,color:T.amber,
                                                        textTransform:"uppercase",letterSpacing:".6px"}}>Upcoming</span>
                                                </div>
                                                {upcomingTasks.map((t,i)=>(
                                                    <TaskCard key={t.id} task={t} onOpen={setActiveTask} delay={i*.06+.1}/>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {tab === "heatmap" && (
                                    <motion.div key="heatmap"
                                                initial={{opacity:0,x:10}} animate={{opacity:1,x:0}}
                                                exit={{opacity:0,x:-10}}>
                                        <LiveHeatmap/>
                                        {/* Zone legend below */}
                                        <Card style={{padding:16,marginTop:10}} hover={false}>
                                            <p style={{fontSize:11,fontWeight:700,color:T.muted,margin:"0 0 10px",
                                                textTransform:"uppercase",letterSpacing:".5px"}}>Needs by Zone</p>
                                            {HEATMAP_ZONES.map((z,i)=>(
                                                <div key={z.zone} style={{
                                                    display:"flex",alignItems:"center",gap:10,
                                                    padding:"7px 0",
                                                    borderBottom: i<HEATMAP_ZONES.length-1?`1px solid ${T.border}`:"none",
                                                }}>
                                                    <div style={{
                                                        width:7,height:7,borderRadius:"50%",flexShrink:0,
                                                        background: z.intensity>.8?"#E05A3A":z.intensity>.65?"#E8A020":T.accent,
                                                    }}/>
                                                    <span style={{flex:1,fontSize:12,color:T.text,fontWeight:600}}>{z.zone}</span>
                                                    <span style={{fontSize:11,color:T.muted}}>{z.needs} needs</span>
                                                    <div style={{width:60,height:4,borderRadius:2,
                                                        background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                                                        <motion.div initial={{width:0}}
                                                                    animate={{width:`${z.intensity*100}%`}}
                                                                    transition={{delay:i*.06,duration:.6}}
                                                                    style={{
                                                                        height:"100%",borderRadius:2,
                                                                        background: z.intensity>.8?"#E05A3A":z.intensity>.65?"#E8A020":T.accent,
                                                                    }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </Card>
                                    </motion.div>
                                )}

                                {tab === "history" && (
                                    <motion.div key="history"
                                                initial={{opacity:0,x:10}} animate={{opacity:1,x:0}}
                                                exit={{opacity:0,x:-10}}>
                                        <CompletedTasks/>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* RIGHT: Profile + leaderboard + mini heatmap */}
                        <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}}
                                    transition={{delay:.15}}
                                    style={{display:"flex",flexDirection:"column",gap:14}}>
                            <ProfileCard/>
                            <Leaderboard/>
                            {tab !== "heatmap" && <LiveHeatmap/>}
                        </motion.div>
                    </div>
                </main>
            </div>

            {/* Task Detail Modal */}
            <AnimatePresence>
                {activeTask && (
                    <TaskModal task={activeTask} onClose={()=>setActiveTask(null)}/>
                )}
            </AnimatePresence>
        </div>
    )
}