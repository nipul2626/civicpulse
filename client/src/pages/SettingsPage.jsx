import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Settings, User, Bell, Shield, Zap, Globe, Phone, Mail,
    Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Camera,
    ChevronRight, ToggleLeft, ToggleRight, Palette, Database,
    Wifi, Key, Trash2, Download, Upload, RefreshCw, Save,
    Building2, Users, MapPin, Clock, Star, X, Plus,
    Sliders, MessageSquare, Smartphone, Monitor, Moon, Sun
} from "lucide-react"

/* ── THEME ── */
const T={
    bg:"#070B12",surface:"#0D1525",card:"#111827",border:"rgba(99,179,237,0.12)",
    text:"#F0F6FF",muted:"#6B8CAE",accent:"#3B82F6",green:"#10B981",
    amber:"#F59E0B",red:"#EF4444",purple:"#8B5CF6",cyan:"#06B6D4",
}

/* ── TOGGLE ── */
const Toggle = ({value,onChange,color=T.accent}) => (
    <motion.div
        onClick={()=>onChange(!value)}
        animate={{background: value ? color : "rgba(255,255,255,0.08)"}}
        style={{
            width:40,height:22,borderRadius:11,cursor:"pointer",
            position:"relative",flexShrink:0,
            border:`1px solid ${value ? color+"60" : "rgba(255,255,255,0.1)"}`,
            transition:"border-color .2s",
        }}>
        <motion.div
            animate={{x: value ? 20 : 2}}
            transition={{type:"spring",stiffness:500,damping:30}}
            style={{
                position:"absolute",top:2,width:16,height:16,
                borderRadius:"50%",background:"#fff",
                boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
            }}
        />
    </motion.div>
)

/* ── SECTION ── */
const Section = ({id,label,icon:Icon,color=T.accent,children}) => (
    <motion.div
        initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        id={id}
        style={{
            background:T.card,border:`1px solid ${T.border}`,
            borderRadius:18,overflow:"hidden",marginBottom:14,
        }}>
        {/* Section header */}
        <div style={{
            padding:"16px 22px",
            borderBottom:`1px solid ${T.border}`,
            display:"flex",alignItems:"center",gap:10,
        }}>
            <div style={{
                width:32,height:32,borderRadius:9,
                background:`${color}20`,
                display:"flex",alignItems:"center",justifyContent:"center",
            }}>
                <Icon size={15} style={{color}}/>
            </div>
            <div>
                <p style={{fontSize:14,fontWeight:800,color:T.text,margin:0}}>{label}</p>
            </div>
        </div>
        <div style={{padding:"20px 22px"}}>{children}</div>
    </motion.div>
)

/* ── ROW ── */
const Row = ({label,desc,children,dangerous=false}) => (
    <div style={{
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"12px 0",
        borderBottom:`1px solid ${T.border}`,
        gap:12,
    }}>
        <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:700,color: dangerous?T.red:T.text,margin:0}}>{label}</p>
            {desc&&<p style={{fontSize:11,color:T.muted,margin:"2px 0 0",lineHeight:1.4}}>{desc}</p>}
        </div>
        <div style={{flexShrink:0}}>{children}</div>
    </div>
)

/* ── INPUT ── */
const Inp = ({value,onChange,placeholder,type="text",disabled=false}) => {
    const [focused,setFocused]=useState(false)
    return (
        <input
            value={value} onChange={onChange}
            placeholder={placeholder} type={type}
            disabled={disabled}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
            style={{
                padding:"9px 12px",borderRadius:9,
                border:`1px solid ${focused ? T.accent : "rgba(99,179,237,0.15)"}`,
                background: disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",
                color: disabled?T.muted:T.text,
                fontSize:12,fontFamily:"'DM Sans',sans-serif",
                outline:"none",width:"100%",
                transition:"border-color .2s",
                cursor: disabled?"not-allowed":"text",
            }}
        />
    )
}

/* ── SAVE TOAST ── */
const SaveToast = ({visible}) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{opacity:0,y:20,scale:.9}}
                animate={{opacity:1,y:0,scale:1}}
                exit={{opacity:0,y:20,scale:.9}}
                style={{
                    position:"fixed",bottom:24,right:24,zIndex:500,
                    padding:"12px 18px",borderRadius:12,
                    background:"rgba(16,185,129,0.15)",
                    border:`1px solid ${T.green}40`,
                    display:"flex",alignItems:"center",gap:8,
                    backdropFilter:"blur(12px)",
                }}>
                <CheckCircle size={16} style={{color:T.green}}/>
                <span style={{fontSize:13,fontWeight:700,color:T.green}}>Settings saved!</span>
            </motion.div>
        )}
    </AnimatePresence>
)

/* ── DANGER MODAL ── */
const DangerModal = ({title,desc,onConfirm,onClose}) => (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{
                    position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",
                    backdropFilter:"blur(10px)",zIndex:500,
                    display:"flex",alignItems:"center",justifyContent:"center",padding:20,
                }}
                onClick={onClose}>
        <motion.div initial={{scale:.9,y:20}} animate={{scale:1,y:0}}
                    exit={{scale:.9,y:20}} onClick={e=>e.stopPropagation()}
                    style={{
                        background:T.card,border:`1px solid ${T.red}30`,
                        borderRadius:18,padding:24,maxWidth:380,width:"100%",
                        boxShadow:"0 40px 100px rgba(0,0,0,0.5)",
                    }}>
            <div style={{
                width:48,height:48,borderRadius:14,background:"rgba(239,68,68,0.15)",
                display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,
            }}>
                <AlertTriangle size={22} style={{color:T.red}}/>
            </div>
            <p style={{fontSize:15,fontWeight:800,color:T.text,margin:"0 0 8px"}}>{title}</p>
            <p style={{fontSize:12,color:T.muted,margin:"0 0 20px",lineHeight:1.6}}>{desc}</p>
            <div style={{display:"flex",gap:8}}>
                <button onClick={onClose}
                        style={{
                            flex:1,padding:"10px",borderRadius:10,
                            border:`1px solid ${T.border}`,background:"transparent",
                            color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",
                            fontFamily:"'DM Sans',sans-serif",
                        }}>Cancel</button>
                <button onClick={onConfirm}
                        style={{
                            flex:1,padding:"10px",borderRadius:10,
                            border:"none",background:T.red,
                            color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",
                            fontFamily:"'DM Sans',sans-serif",
                        }}>Confirm Delete</button>
            </div>
        </motion.div>
    </motion.div>
)

/* ── MAIN ── */
export default function SettingsPage() {
    /* Profile */
    const [name,setName]=useState("Riya Sharma")
    const [email,setEmail]=useState("riya.sharma@greenhorizon.org")
    const [phone,setPhone]=useState("+91 98765 43210")
    const [org,setOrg]=useState("Green Horizon Foundation")
    const [city,setCity]=useState("Mumbai, Maharashtra")
    const [bio,setBio]=useState("NGO coordinator focused on community welfare and rapid response.")

    /* Appearance */
    const [theme,setTheme]=useState("dark")
    const [fontSize,setFontSize]=useState("medium")
    const [density,setDensity]=useState("comfortable")

    /* Notifications */
    const [notifs,setNotifs]=useState({
        critical:true, assignments:true, aiAlerts:true,
        weeklyReport:true, volunteerUpdates:false, email:true,
        sms:false, push:true,
    })

    /* AI Settings */
    const [ai,setAi]=useState({
        autoScore:true, autoDuplicate:true, autoMatch:true,
        predictions:true, smartRouting:true,
        minConfidence:75, urgencyThreshold:4,
    })

    /* Security */
    const [showPw,setShowPw]=useState(false)
    const [twoFA,setTwoFA]=useState(true)
    const [sessions,setSessions]=useState([
        {device:"Chrome · Mumbai",    active:true,  time:"Now"},
        {device:"Mobile · iOS",       active:false, time:"2h ago"},
        {device:"Firefox · Laptop",   active:false, time:"Yesterday"},
    ])

    /* Integrations */
    const [integrations,setIntegrations]=useState({
        slack:true,whatsapp:false,googleSheets:true,zapier:false,sms:true,
    })

    /* UI state */
    const [saved,setSaved]=useState(false)
    const [danger,setDanger]=useState(null)
    const [activeSection,setActiveSection]=useState("profile")

    const toggleNotif=k=>setNotifs(p=>({...p,[k]:!p[k]}))
    const toggleAI=k=>setAi(p=>({...p,[k]:!p[k]}))
    const toggleInteg=k=>setIntegrations(p=>({...p,[k]:!p[k]}))

    const save=()=>{
        setSaved(true)
        setTimeout(()=>setSaved(false),2500)
    }

    const NAV_ITEMS=[
        {id:"profile",     label:"Profile",        icon:User,     color:T.accent },
        {id:"appearance",  label:"Appearance",     icon:Palette,  color:T.purple },
        {id:"notifications",label:"Notifications", icon:Bell,     color:T.amber  },
        {id:"ai",          label:"AI Settings",    icon:Zap,      color:T.cyan   },
        {id:"security",    label:"Security",       icon:Shield,   color:T.green  },
        {id:"integrations",label:"Integrations",   icon:Globe,    color:T.pink   },
        {id:"data",        label:"Data & Privacy", icon:Database, color:T.red    },
    ]

    const PINK = "#EC4899"

    return (
        <div style={{
            minHeight:"100vh",background:T.bg,color:T.text,
            fontFamily:"'DM Sans',sans-serif",display:"flex",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px}
      `}</style>

            {/* Settings nav sidebar */}
            <div style={{
                width:220,flexShrink:0,background:T.surface,
                borderRight:`1px solid ${T.border}`,
                padding:"24px 12px",position:"sticky",top:0,height:"100vh",
            }}>
                <p style={{fontSize:11,fontWeight:700,color:T.muted,
                    textTransform:"uppercase",letterSpacing:".8px",
                    marginBottom:12,paddingLeft:10}}>Settings</p>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    {NAV_ITEMS.map(item=>(
                        <motion.button key={item.id}
                                       whileHover={{background:"rgba(255,255,255,0.05)"}}
                                       whileTap={{scale:.97}}
                                       onClick={()=>{
                                           setActiveSection(item.id)
                                           document.getElementById(item.id)?.scrollIntoView({behavior:"smooth"})
                                       }}
                                       style={{
                                           display:"flex",alignItems:"center",gap:8,
                                           padding:"9px 10px",borderRadius:10,
                                           border:"none",cursor:"pointer",width:"100%",
                                           background: activeSection===item.id ? "rgba(255,255,255,0.06)" : "transparent",
                                           borderLeft: activeSection===item.id ? `2px solid ${item.color}` : "2px solid transparent",
                                           color: activeSection===item.id ? T.text : T.muted,
                                           transition:"all .15s",fontFamily:"'DM Sans',sans-serif",
                                       }}>
                            <item.icon size={15} style={{color: activeSection===item.id ? item.color : T.muted}}/>
                            <span style={{fontSize:12,fontWeight: activeSection===item.id ? 700 : 500}}>
                {item.label}
              </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div style={{flex:1,padding:"28px 32px",overflowY:"auto",maxHeight:"100vh"}}>
                <div style={{maxWidth:720,margin:"0 auto"}}>

                    {/* Header */}
                    <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}}
                                style={{
                                    display:"flex",alignItems:"center",justifyContent:"space-between",
                                    marginBottom:24,
                                }}>
                        <div>
                            <h1 style={{fontSize:24,fontWeight:900,color:T.text,margin:0,letterSpacing:"-.4px"}}>
                                Settings
                            </h1>
                            <p style={{fontSize:12,color:T.muted,margin:"3px 0 0"}}>
                                Manage your profile, preferences and integrations
                            </p>
                        </div>
                        <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                       onClick={save}
                                       style={{
                                           display:"flex",alignItems:"center",gap:6,padding:"10px 20px",
                                           borderRadius:12,border:"none",
                                           background:`linear-gradient(135deg,${T.accent},${T.purple})`,
                                           color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",
                                           fontFamily:"'DM Sans',sans-serif",
                                           boxShadow:`0 4px 20px ${T.accent}40`,
                                       }}>
                            <Save size={13}/> Save Changes
                        </motion.button>
                    </motion.div>

                    {/* ── PROFILE ── */}
                    <Section id="profile" label="Profile & Organisation" icon={User} color={T.accent}>
                        {/* Avatar */}
                        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
                            <div style={{position:"relative"}}>
                                <div style={{
                                    width:64,height:64,borderRadius:18,
                                    background:`linear-gradient(135deg,${T.accent},${T.purple})`,
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                    fontSize:22,fontWeight:900,color:"#fff",
                                }}>RS</div>
                                <motion.button whileHover={{scale:1.1}} whileTap={{scale:.9}}
                                               style={{
                                                   position:"absolute",bottom:-4,right:-4,
                                                   width:22,height:22,borderRadius:7,
                                                   background:T.accent,border:"none",cursor:"pointer",
                                                   display:"flex",alignItems:"center",justifyContent:"center",
                                               }}>
                                    <Camera size={10} color="#fff"/>
                                </motion.button>
                            </div>
                            <div>
                                <p style={{fontSize:15,fontWeight:800,color:T.text,margin:0}}>{name}</p>
                                <p style={{fontSize:11,color:T.muted,margin:"2px 0"}}>Coordinator · {org}</p>
                                <span style={{
                                    fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,
                                    background:"rgba(16,185,129,0.15)",color:T.green,
                                }}>Verified Account</span>
                            </div>
                        </div>

                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                            <div>
                                <label style={{fontSize:10,fontWeight:700,color:T.muted,display:"block",
                                    marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Full Name</label>
                                <Inp value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
                            </div>
                            <div>
                                <label style={{fontSize:10,fontWeight:700,color:T.muted,display:"block",
                                    marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Email</label>
                                <Inp value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" type="email"/>
                            </div>
                            <div>
                                <label style={{fontSize:10,fontWeight:700,color:T.muted,display:"block",
                                    marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Phone</label>
                                <Inp value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91"/>
                            </div>
                            <div>
                                <label style={{fontSize:10,fontWeight:700,color:T.muted,display:"block",
                                    marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>City</label>
                                <Inp value={city} onChange={e=>setCity(e.target.value)} placeholder="City"/>
                            </div>
                            <div style={{gridColumn:"1/-1"}}>
                                <label style={{fontSize:10,fontWeight:700,color:T.muted,display:"block",
                                    marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Organisation</label>
                                <Inp value={org} onChange={e=>setOrg(e.target.value)} placeholder="Organisation name"/>
                            </div>
                            <div style={{gridColumn:"1/-1"}}>
                                <label style={{fontSize:10,fontWeight:700,color:T.muted,display:"block",
                                    marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Bio</label>
                                <textarea value={bio} onChange={e=>setBio(e.target.value)}
                                          rows={3} placeholder="Short bio..."
                                          style={{
                                              width:"100%",padding:"9px 12px",borderRadius:9,
                                              border:"1px solid rgba(99,179,237,0.15)",
                                              background:"rgba(255,255,255,0.04)",color:T.text,
                                              fontSize:12,fontFamily:"'DM Sans',sans-serif",
                                              outline:"none",resize:"none",transition:"border-color .2s",
                                              boxSizing:"border-box",
                                          }}
                                          onFocus={e=>e.target.style.borderColor=T.accent}
                                          onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* ── APPEARANCE ── */}
                    <Section id="appearance" label="Appearance" icon={Palette} color={T.purple}>
                        <Row label="Theme" desc="Choose your preferred color scheme">
                            <div style={{display:"flex",gap:6}}>
                                {[{id:"dark",icon:Moon},{id:"light",icon:Sun},{id:"system",icon:Monitor}].map(t=>(
                                    <motion.button key={t.id} whileTap={{scale:.95}}
                                                   onClick={()=>setTheme(t.id)}
                                                   style={{
                                                       padding:"6px 12px",borderRadius:8,border:`1px solid`,
                                                       borderColor: theme===t.id ? T.purple : T.border,
                                                       background: theme===t.id ? `${T.purple}20` : "transparent",
                                                       color: theme===t.id ? T.purple : T.muted,
                                                       fontSize:11,fontWeight:700,cursor:"pointer",
                                                       fontFamily:"'DM Sans',sans-serif",
                                                       display:"flex",alignItems:"center",gap:5,
                                                       transition:"all .15s",
                                                   }}>
                                        <t.icon size={11}/> {t.id}
                                    </motion.button>
                                ))}
                            </div>
                        </Row>
                        <Row label="Font size" desc="Adjust text size across the dashboard">
                            <div style={{display:"flex",gap:6}}>
                                {["small","medium","large"].map(s=>(
                                    <motion.button key={s} whileTap={{scale:.95}}
                                                   onClick={()=>setFontSize(s)}
                                                   style={{
                                                       padding:"5px 10px",borderRadius:7,border:`1px solid`,
                                                       borderColor: fontSize===s ? T.purple : T.border,
                                                       background: fontSize===s ? `${T.purple}20` : "transparent",
                                                       color: fontSize===s ? T.purple : T.muted,
                                                       fontSize:11,fontWeight:700,cursor:"pointer",
                                                       fontFamily:"'DM Sans',sans-serif",
                                                       textTransform:"capitalize",transition:"all .15s",
                                                   }}>{s}</motion.button>
                                ))}
                            </div>
                        </Row>
                        <Row label="Density" desc="Control spacing and layout compactness">
                            <div style={{display:"flex",gap:6}}>
                                {["compact","comfortable","spacious"].map(d=>(
                                    <motion.button key={d} whileTap={{scale:.95}}
                                                   onClick={()=>setDensity(d)}
                                                   style={{
                                                       padding:"5px 10px",borderRadius:7,border:`1px solid`,
                                                       borderColor: density===d ? T.purple : T.border,
                                                       background: density===d ? `${T.purple}20` : "transparent",
                                                       color: density===d ? T.purple : T.muted,
                                                       fontSize:11,fontWeight:700,cursor:"pointer",
                                                       fontFamily:"'DM Sans',sans-serif",
                                                       textTransform:"capitalize",transition:"all .15s",
                                                   }}>{d}</motion.button>
                                ))}
                            </div>
                        </Row>
                    </Section>

                    {/* ── NOTIFICATIONS ── */}
                    <Section id="notifications" label="Notifications" icon={Bell} color={T.amber}>
                        {[
                            {key:"critical",     label:"Critical alerts",       desc:"Immediate notification for urgency 5 needs"},
                            {key:"assignments",  label:"Assignment updates",    desc:"When tasks are assigned or completed"},
                            {key:"aiAlerts",     label:"AI insights",           desc:"Predictions and anomalies from AI engine"},
                            {key:"weeklyReport", label:"Weekly summary report", desc:"Sent every Monday at 9am"},
                            {key:"volunteerUpdates",label:"Volunteer activity", desc:"Status updates from volunteers in your zones"},
                        ].map(n=>(
                            <Row key={n.key} label={n.label} desc={n.desc}>
                                <Toggle value={notifs[n.key]} onChange={v=>setNotifs(p=>({...p,[n.key]:v}))} color={T.amber}/>
                            </Row>
                        ))}
                        <div style={{marginTop:14}}>
                            <p style={{fontSize:11,fontWeight:700,color:T.muted,
                                textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>
                                Delivery Channels
                            </p>
                            {[
                                {key:"push",  label:"Push notifications", icon:Smartphone},
                                {key:"email", label:"Email",              icon:Mail       },
                                {key:"sms",   label:"SMS alerts",         icon:Phone      },
                            ].map(c=>(
                                <Row key={c.key} label={c.label}>
                                    <Toggle value={notifs[c.key]} onChange={v=>toggleNotif(c.key)} color={T.amber}/>
                                </Row>
                            ))}
                        </div>
                    </Section>

                    {/* ── AI SETTINGS ── */}
                    <Section id="ai" label="AI Engine Settings" icon={Zap} color={T.cyan}>
                        <div style={{
                            padding:"12px 14px",borderRadius:10,marginBottom:16,
                            background:"rgba(6,182,212,0.08)",border:`1px solid ${T.cyan}30`,
                            display:"flex",alignItems:"center",gap:8,
                        }}>
                            <Zap size={13} style={{color:T.cyan}}/>
                            <p style={{fontSize:11,color:`${T.cyan}cc`,margin:0}}>
                                CivicPulse AI v2.4 · All models running · Last retrained 3 days ago
                            </p>
                        </div>

                        {[
                            {key:"autoScore",     label:"Auto-score incoming needs",    desc:"AI scores urgency (1-5) on submission"},
                            {key:"autoDuplicate", label:"Duplicate detection",          desc:"Merge similar reports automatically"},
                            {key:"autoMatch",     label:"Smart volunteer matching",     desc:"AI assigns best-fit volunteer instantly"},
                            {key:"predictions",   label:"Predictive alerts",            desc:"Forecast demand spikes 24-48h ahead"},
                            {key:"smartRouting",  label:"Smart route optimization",     desc:"Minimize travel time for volunteers"},
                        ].map(s=>(
                            <Row key={s.key} label={s.label} desc={s.desc}>
                                <Toggle value={ai[s.key]} onChange={v=>setAi(p=>({...p,[s.key]:v}))} color={T.cyan}/>
                            </Row>
                        ))}

                        <div style={{marginTop:16}}>
                            <div style={{marginBottom:14}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                                    <label style={{fontSize:12,fontWeight:700,color:T.text}}>
                                        Minimum AI confidence threshold
                                    </label>
                                    <span style={{fontSize:12,fontWeight:800,color:T.cyan}}>{ai.minConfidence}%</span>
                                </div>
                                <input type="range" min={60} max={99} value={ai.minConfidence}
                                       onChange={e=>setAi(p=>({...p,minConfidence:+e.target.value}))}
                                       style={{width:"100%",accentColor:T.cyan}}
                                />
                                <p style={{fontSize:10,color:T.muted,marginTop:4}}>
                                    AI only auto-acts when confidence exceeds this threshold
                                </p>
                            </div>
                            <div>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                                    <label style={{fontSize:12,fontWeight:700,color:T.text}}>
                                        Auto-escalation urgency level
                                    </label>
                                    <span style={{fontSize:12,fontWeight:800,color:T.amber}}>{ai.urgencyThreshold}+</span>
                                </div>
                                <input type="range" min={1} max={5} step={1} value={ai.urgencyThreshold}
                                       onChange={e=>setAi(p=>({...p,urgencyThreshold:+e.target.value}))}
                                       style={{width:"100%",accentColor:T.amber}}
                                />
                                <p style={{fontSize:10,color:T.muted,marginTop:4}}>
                                    Needs at or above this urgency are auto-escalated to coordinator
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* ── SECURITY ── */}
                    <Section id="security" label="Security" icon={Shield} color={T.green}>
                        <Row label="Two-factor authentication"
                             desc="Adds a layer of security to your account login">
                            <Toggle value={twoFA} onChange={setTwoFA} color={T.green}/>
                        </Row>
                        <Row label="Change password" desc="Last changed 32 days ago">
                            <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                           style={{
                                               padding:"6px 14px",borderRadius:8,
                                               border:`1px solid ${T.border}`,background:"transparent",
                                               color:T.muted,fontSize:11,fontWeight:700,cursor:"pointer",
                                               fontFamily:"'DM Sans',sans-serif",
                                           }}>Change</motion.button>
                        </Row>
                        <div style={{marginTop:14}}>
                            <p style={{fontSize:11,fontWeight:700,color:T.muted,
                                textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>
                                Active Sessions
                            </p>
                            {sessions.map((s,i)=>(
                                <div key={i} style={{
                                    display:"flex",alignItems:"center",justifyContent:"space-between",
                                    padding:"10px 0",
                                    borderBottom: i<sessions.length-1?`1px solid ${T.border}`:"none",
                                }}>
                                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                                        <div style={{
                                            width:8,height:8,borderRadius:"50%",
                                            background: s.active ? T.green : "rgba(255,255,255,0.15)",
                                            boxShadow: s.active ? `0 0 6px ${T.green}` : "none",
                                        }}/>
                                        <div>
                                            <p style={{fontSize:12,fontWeight:600,color:T.text,margin:0}}>{s.device}</p>
                                            <p style={{fontSize:10,color:T.muted,margin:0}}>{s.time}</p>
                                        </div>
                                    </div>
                                    {!s.active && (
                                        <motion.button whileTap={{scale:.95}}
                                                       onClick={()=>setSessions(p=>p.filter((_,j)=>j!==i))}
                                                       style={{
                                                           padding:"4px 10px",borderRadius:7,
                                                           border:`1px solid rgba(239,68,68,0.3)`,
                                                           background:"rgba(239,68,68,0.08)",
                                                           color:T.red,fontSize:10,fontWeight:700,cursor:"pointer",
                                                           fontFamily:"'DM Sans',sans-serif",
                                                       }}>Revoke</motion.button>
                                    )}
                                    {s.active && (
                                        <span style={{fontSize:10,fontWeight:700,color:T.green}}>Current</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ── INTEGRATIONS ── */}
                    <Section id="integrations" label="Integrations" icon={Globe} color={PINK}>
                        {[
                            {key:"slack",       label:"Slack",         desc:"Get alerts in your Slack workspace",         color:"#4A154B"},
                            {key:"whatsapp",    label:"WhatsApp",      desc:"Send field updates via WhatsApp Business",   color:"#25D366"},
                            {key:"googleSheets",label:"Google Sheets", desc:"Sync reports to a connected spreadsheet",    color:"#0F9D58"},
                            {key:"zapier",      label:"Zapier",        desc:"Connect to 3000+ apps via Zapier",           color:"#FF4A00"},
                            {key:"sms",         label:"SMS Gateway",   desc:"Bulk SMS to volunteers for urgent tasks",    color:"#3B82F6"},
                        ].map(integ=>(
                            <Row key={integ.key} label={integ.label} desc={integ.desc}>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{
                      fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20,
                      background: integrations[integ.key] ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                      color: integrations[integ.key] ? T.green : T.muted,
                  }}>{integrations[integ.key]?"Connected":"Disconnected"}</span>
                                    <Toggle value={integrations[integ.key]}
                                            onChange={()=>toggleInteg(integ.key)} color={integ.color}/>
                                </div>
                            </Row>
                        ))}
                    </Section>

                    {/* ── DATA & PRIVACY ── */}
                    <Section id="data" label="Data & Privacy" icon={Database} color={T.red}>
                        <Row label="Export all data" desc="Download complete data archive as JSON or CSV">
                            <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                           style={{
                                               display:"flex",alignItems:"center",gap:5,
                                               padding:"6px 12px",borderRadius:8,
                                               border:`1px solid ${T.border}`,background:"transparent",
                                               color:T.accent,fontSize:11,fontWeight:700,cursor:"pointer",
                                               fontFamily:"'DM Sans',sans-serif",
                                           }}>
                                <Download size={11}/> Export
                            </motion.button>
                        </Row>
                        <Row label="Data retention" desc="How long we store submitted needs data">
                            <select style={{
                                padding:"6px 10px",borderRadius:8,
                                border:`1px solid ${T.border}`,
                                background:"rgba(255,255,255,0.04)",color:T.text,
                                fontSize:11,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",
                                outline:"none",
                            }}>
                                <option value="1y">1 year</option>
                                <option value="2y">2 years</option>
                                <option value="forever">Forever</option>
                            </select>
                        </Row>
                        <Row label="Delete all submissions"
                             desc="Permanently delete all need submissions. This cannot be undone."
                             dangerous>
                            <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                           onClick={()=>setDanger({
                                               title:"Delete all submissions?",
                                               desc:"This will permanently delete all 1,243 need submissions. This action cannot be undone.",
                                               onConfirm:()=>setDanger(null),
                                           })}
                                           style={{
                                               display:"flex",alignItems:"center",gap:5,
                                               padding:"6px 12px",borderRadius:8,
                                               border:`1px solid rgba(239,68,68,0.4)`,
                                               background:"rgba(239,68,68,0.1)",
                                               color:T.red,fontSize:11,fontWeight:700,cursor:"pointer",
                                               fontFamily:"'DM Sans',sans-serif",
                                           }}>
                                <Trash2 size={11}/> Delete
                            </motion.button>
                        </Row>
                        <Row label="Delete account"
                             desc="Permanently delete your account and all associated data."
                             dangerous>
                            <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                           onClick={()=>setDanger({
                                               title:"Delete your account?",
                                               desc:"This will permanently delete your account, organisation data, and all submissions. No recovery is possible.",
                                               onConfirm:()=>setDanger(null),
                                           })}
                                           style={{
                                               display:"flex",alignItems:"center",gap:5,
                                               padding:"6px 12px",borderRadius:8,
                                               border:`1px solid rgba(239,68,68,0.4)`,
                                               background:"rgba(239,68,68,0.1)",
                                               color:T.red,fontSize:11,fontWeight:700,cursor:"pointer",
                                               fontFamily:"'DM Sans',sans-serif",
                                           }}>
                                <Trash2 size={11}/> Delete Account
                            </motion.button>
                        </Row>
                    </Section>

                    {/* Bottom save */}
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}}
                                   onClick={save}
                                   style={{
                                       width:"100%",padding:"13px",borderRadius:14,border:"none",
                                       background:`linear-gradient(135deg,${T.accent},${T.purple})`,
                                       color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",
                                       fontFamily:"'DM Sans',sans-serif",
                                       display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                                       boxShadow:`0 6px 24px ${T.accent}40`,marginBottom:40,
                                   }}>
                        <Save size={14}/> Save All Settings
                    </motion.button>
                </div>
            </div>

            <SaveToast visible={saved}/>
            <AnimatePresence>
                {danger && <DangerModal {...danger} onClose={()=>setDanger(null)}/>}
            </AnimatePresence>
        </div>
    )
}