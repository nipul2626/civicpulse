import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
    Utensils, Heart, Home, Droplets, BookOpen, Zap, MapPin, Mic,
    Upload, CheckCircle, AlertTriangle, Plus, X, FileText, Camera,
    Send, RefreshCw, ChevronRight, Users, Activity, Shield, Clock,
    TrendingUp, Star, Filter, BarChart3, Wifi, WifiOff, Eye, Layers
} from "lucide-react"

/* ── THEME ── */
const T = {
    bg:         "#eef2eb",
    surface:    "#e2e8de",
    card:       "#ffffff",
    cardHov:    "#f5f8f3",
    border:     "rgba(45,90,45,0.12)",
    borderHi:   "rgba(45,90,45,0.45)",
    text:       "#1a2e1a",
    muted:      "#5a7a5a",
    accent:     "#2d5a2d",
    accentGlow: "rgba(45,90,45,0.15)",
    green:      "#1a6b4a",
    amber:      "#c07a0a",
    red:        "#b84c2e",
    purple:     "#5a3a8a",
    cyan:       "#1a6b7a",
}

const CATS = [
    { key:"food",      label:"Food Security", icon:Utensils, color:"#c07a0a", glow:"rgba(192,122,10,0.12)"  },
    { key:"medical",   label:"Medical Aid",   icon:Heart,    color:"#b84c2e", glow:"rgba(184,76,46,0.12)"   },
    { key:"shelter",   label:"Shelter",       icon:Home,     color:"#5a3a8a", glow:"rgba(90,58,138,0.12)"   },
    { key:"water",     label:"Clean Water",   icon:Droplets, color:"#1a6b7a", glow:"rgba(26,107,122,0.12)"  },
    { key:"education", label:"Education",     icon:BookOpen, color:"#1a6b4a", glow:"rgba(26,107,74,0.12)"   },
]

const URGENCY_CFG = [
    { level:1, label:"Minimal",  color:"#1a6b4a", desc:"Not time sensitive" },
    { level:2, label:"Low",      color:"#4a8a1a", desc:"Within a week"      },
    { level:3, label:"Medium",   color:"#c07a0a", desc:"Within 48 hours"    },
    { level:4, label:"High",     color:"#c05a1a", desc:"Within 24 hours"    },
    { level:5, label:"Critical", color:"#b84c2e", desc:"Immediate!"         },
]
const LIVE_FEED = [
    { id:1, cat:"medical",   zone:"Dharavi",   time:"just now", urgency:5, people:47,  status:"scoring"  },
    { id:2, cat:"food",      zone:"Kurla",     time:"2m ago",   urgency:4, people:120, status:"matched"  },
    { id:3, cat:"shelter",   zone:"Chembur",   time:"5m ago",   urgency:5, people:33,  status:"assigned" },
    { id:4, cat:"water",     zone:"Ghatkopar", time:"9m ago",   urgency:3, people:80,  status:"scored"   },
    { id:5, cat:"education", zone:"Mankhurd",  time:"14m ago",  urgency:2, people:60,  status:"assigned" },
    { id:6, cat:"medical",   zone:"Andheri",   time:"21m ago",  urgency:4, people:18,  status:"matched"  },
]

const STATUS_STYLE = {
    scoring:  { label:"AI Scoring",  bg:"rgba(245,158,11,0.15)",  text:"#F59E0B"  },
    scored:   { label:"Scored",      bg:"rgba(59,130,246,0.15)",  text:"#3B82F6"  },
    matched:  { label:"Matched",     bg:"rgba(139,92,246,0.15)",  text:"#8B5CF6"  },
    assigned: { label:"Assigned",    bg:"rgba(16,185,129,0.15)",  text:"#10B981"  },
}

const CAT_COLOR = { food:"#F59E0B", medical:"#EF4444", shelter:"#8B5CF6", water:"#06B6D4", education:"#10B981" }

/* ── SHARED STYLES ── */
const inp = {
    width:"100%", padding:"11px 14px", borderRadius:10,
    border:`1px solid rgba(99,179,237,0.15)`,
    background:"rgba(255,255,255,0.04)", color:T.text,
    fontSize:13, fontFamily:"'DM Sans',sans-serif",
    outline:"none", boxSizing:"border-box", transition:"border-color .2s",
}

const lbl = {
    fontSize:10, fontWeight:700, color:T.muted, display:"block",
    marginBottom:6, textTransform:"uppercase", letterSpacing:".8px",
}

const primaryBtn = (color=T.accent) => ({
    width:"100%", padding:"13px",
    borderRadius:12, border:"none",
    background:`linear-gradient(135deg, ${color}, ${color}cc)`,
    color:"#fff", fontSize:13, fontWeight:700,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    boxShadow:`0 4px 20px ${color}40`,
    transition:"transform .15s, box-shadow .15s",
})

/* ── PARTICLE BG ── */
const Particles = () => {
    const dots = Array.from({length:20},(_,i)=>({
        id:i,
        x:Math.random()*100, y:Math.random()*100,
        size:Math.random()*3+1,
        dur:Math.random()*4+3,
        delay:Math.random()*3,
    }))
    return (
        <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
            {dots.map(d=>(
                <motion.div key={d.id}
                            animate={{y:[0,-20,0],opacity:[0.15,0.4,0.15]}}
                            transition={{duration:d.dur,delay:d.delay,repeat:Infinity,ease:"easeInOut"}}
                            style={{
                                position:"absolute",left:`${d.x}%`,top:`${d.y}%`,
                                width:d.size,height:d.size,borderRadius:"50%",
                                background:T.accent,
                            }}
                />
            ))}
            {/* Grid lines */}
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.04}}>
                {[10,20,30,40,50,60,70,80,90].map(p=>(
                    <g key={p}>
                        <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={T.accent} strokeWidth="1"/>
                        <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke={T.accent} strokeWidth="1"/>
                    </g>
                ))}
            </svg>
        </div>
    )
}

/* ── QUICK SUBMIT ── */
const QuickSubmit = ({ onSuccess }) => {
    const [cat,setCat]=useState(null)
    const [urgency,setUrgency]=useState(null)
    const [zone,setZone]=useState("")
    const [people,setPeople]=useState("")
    const [gps,setGps]=useState(null)
    const [gpsLoading,setGpsLoading]=useState(false)
    const [loading,setLoading]=useState(false)

    const getGPS=()=>{
        setGpsLoading(true)
        navigator.geolocation?.getCurrentPosition(
            pos=>{setGps(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);setGpsLoading(false)},
            ()=>{setGps("19.0760, 72.8777");setGpsLoading(false)}
        )
    }

    const handleSubmit=()=>{
        if(!cat||!urgency||!zone)return
        setLoading(true)
        setTimeout(()=>{setLoading(false);onSuccess()},1800)
    }

    const ready=cat&&urgency&&zone

    return (
        <div style={{display:"flex",flexDirection:"column",gap:22}}>
            {/* Category */}
            <div>
                <label style={lbl}>Select Category</label>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                    {CATS.map(c=>(
                        <motion.button key={c.key}
                                       whileHover={{scale:1.05,y:-3}}
                                       whileTap={{scale:.95}}
                                       onClick={()=>setCat(c.key)}
                                       style={{
                                           padding:"18px 8px", borderRadius:14, cursor:"pointer",
                                           fontFamily:"'DM Sans',sans-serif",
                                           display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                                           background: cat===c.key ? c.glow : "rgba(255,255,255,0.03)",
                                           border: cat===c.key ? `1.5px solid ${c.color}` : `1px solid ${T.border}`,
                                           boxShadow: cat===c.key ? `0 0 20px ${c.glow}` : "none",
                                           transition:"all .2s",
                                       }}>
                            <c.icon size={20} style={{color: cat===c.key ? c.color : T.muted}}/>
                            <span style={{fontSize:9,fontWeight:700,color: cat===c.key ? c.color : T.muted,
                                textAlign:"center",lineHeight:1.3}}>
                {c.label}
              </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Urgency */}
            <div>
                <label style={lbl}>Urgency Level</label>
                <div style={{display:"flex",gap:8}}>
                    {URGENCY_CFG.map(u=>(
                        <motion.button key={u.level}
                                       whileTap={{scale:.95}}
                                       onClick={()=>setUrgency(u.level)}
                                       style={{
                                           flex:1, padding:"12px 4px", borderRadius:12, cursor:"pointer",
                                           fontFamily:"'DM Sans',sans-serif",
                                           display:"flex",flexDirection:"column",alignItems:"center",gap:5,
                                           background: urgency===u.level ? `${u.color}18` : "rgba(255,255,255,0.03)",
                                           border: urgency===u.level ? `1.5px solid ${u.color}` : `1px solid ${T.border}`,
                                           boxShadow: urgency===u.level ? `0 0 16px ${u.color}30` : "none",
                                           transition:"all .2s",
                                       }}>
                            <div style={{display:"flex",gap:2,alignItems:"flex-end"}}>
                                {[1,2,3,4,5].map(i=>(
                                    <motion.div key={i}
                                                animate={{height: i<=u.level ? 14-(5-i)*2 : 4}}
                                                style={{
                                                    width:3,borderRadius:2,
                                                    background: i<=u.level ? u.color : "rgba(255,255,255,0.1)",
                                                }}/>
                                ))}
                            </div>
                            <span style={{fontSize:9,fontWeight:700,
                                color: urgency===u.level ? u.color : T.muted}}>
                {u.label}
              </span>
                        </motion.button>
                    ))}
                </div>
                <AnimatePresence>
                    {urgency && (
                        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                                    exit={{opacity:0,height:0}}
                                    style={{
                                        marginTop:8,padding:"7px 12px",borderRadius:8,
                                        background:`${URGENCY_CFG[urgency-1].color}18`,
                                        border:`1px solid ${URGENCY_CFG[urgency-1].color}40`,
                                        display:"flex",alignItems:"center",gap:6,
                                    }}>
                            <AlertTriangle size={11} style={{color:URGENCY_CFG[urgency-1].color}}/>
                            <span style={{fontSize:11,fontWeight:700,color:URGENCY_CFG[urgency-1].color}}>
                {URGENCY_CFG[urgency-1].desc}
              </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Zone + People */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                    <label style={lbl}>Zone / Area *</label>
                    <input value={zone} onChange={e=>setZone(e.target.value)}
                           placeholder="e.g. Dharavi North"
                           style={inp}
                           onFocus={e=>e.target.style.borderColor=T.accent}
                           onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                    />
                </div>
                <div>
                    <label style={lbl}>People Affected</label>
                    <input value={people} onChange={e=>setPeople(e.target.value)}
                           placeholder="Estimated count" type="number"
                           style={inp}
                           onFocus={e=>e.target.style.borderColor=T.accent}
                           onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                    />
                </div>
            </div>

            {/* GPS */}
            <div>
                <label style={lbl}>GPS Location</label>
                <div style={{display:"flex",gap:8}}>
                    <div style={{
                        ...inp,flex:1,display:"flex",alignItems:"center",gap:8,
                        color: gps ? T.text : T.muted,
                    }}>
                        <MapPin size={13} style={{color:T.muted,flexShrink:0}}/>
                        <span style={{fontSize:12}}>{gps||"Tap detect to get coordinates"}</span>
                    </div>
                    <motion.button whileHover={{scale:1.04}} whileTap={{scale:.96}}
                                   onClick={getGPS}
                                   style={{
                                       padding:"11px 16px",borderRadius:10,border:`1px solid ${T.accent}40`,
                                       background:`${T.accent}20`,color:T.accent,
                                       fontSize:12,fontWeight:700,cursor:"pointer",
                                       fontFamily:"'DM Sans',sans-serif",
                                       display:"flex",alignItems:"center",gap:6,flexShrink:0,
                                   }}>
                        {gpsLoading
                            ? <RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/>
                            : <MapPin size={13}/>
                        }
                        {gps?"Refresh":"Detect"}
                    </motion.button>
                </div>
            </div>

            {/* Submit */}
            <motion.button
                whileHover={ready?{scale:1.02,boxShadow:`0 8px 30px ${T.accentGlow}`}:{}}
                whileTap={ready?{scale:.97}:{}}
                onClick={handleSubmit}
                disabled={!ready||loading}
                style={{
                    ...primaryBtn(ready?T.accent:"#374151"),
                    opacity: ready?1:0.5,
                }}>
                {loading
                    ? <><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/> Sending to AI engine...</>
                    : <><Zap size={14}/> Submit for AI Scoring</>
                }
            </motion.button>
        </div>
    )
}

/* ── DETAILED REPORT ── */
const DetailedReport = ({ onSuccess }) => {
    const [form,setForm]=useState({title:"",category:"food",urgency:3,people:"",zone:"",desc:"",vulnerability:"",resources:""})
    const [photos,setPhotos]=useState([])
    const [recording,setRecording]=useState(false)
    const [voiceNote,setVoiceNote]=useState(null)
    const [loading,setLoading]=useState(false)
    const [aiSuggestions,setAiSuggestions]=useState(false)
    const fileRef=useRef()

    const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}))

    const handlePhoto=e=>{
        const files=Array.from(e.target.files)
        setPhotos(p=>[...p,...files.map(f=>URL.createObjectURL(f))])
    }

    const handleVoice=()=>{
        if(recording){setRecording(false);setVoiceNote("voice_note.mp3")}
        else{setRecording(true);setTimeout(()=>{setRecording(false);setVoiceNote("voice_note.mp3")},4000)}
    }

    const runAI=()=>{
        setAiSuggestions(true)
        setTimeout(()=>{
            setForm(p=>({...p,urgency:4,resources:"Food packets (×50), Water bottles (×100)"}))
        },1500)
    }

    const handleSubmit=()=>{setLoading(true);setTimeout(()=>{setLoading(false);onSuccess()},2000)}

    return (
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {/* AI Assist Banner */}
            <motion.div
                whileHover={{scale:1.01}}
                onClick={runAI}
                style={{
                    padding:"12px 16px",borderRadius:12,cursor:"pointer",
                    background:"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(59,130,246,0.15))",
                    border:`1px solid rgba(139,92,246,0.3)`,
                    display:"flex",alignItems:"center",gap:10,
                }}>
                <div style={{
                    width:32,height:32,borderRadius:9,
                    background:"linear-gradient(135deg,#8B5CF6,#3B82F6)",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                }}>
                    <Zap size={14} color="#fff"/>
                </div>
                <div style={{flex:1}}>
                    <p style={{fontSize:12,fontWeight:700,color:T.text,margin:0}}>AI Auto-fill Assistant</p>
                    <p style={{fontSize:10,color:T.muted,margin:0}}>Click to let AI suggest urgency & resources based on description</p>
                </div>
                {aiSuggestions && <CheckCircle size={16} style={{color:T.green}}/>}
                <ChevronRight size={14} style={{color:T.muted}}/>
            </motion.div>

            {/* Title */}
            <div>
                <label style={lbl}>Need Title *</label>
                <input value={form.title} onChange={set("title")}
                       placeholder="Brief description..."
                       style={inp}
                       onFocus={e=>e.target.style.borderColor=T.accent}
                       onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                />
            </div>

            {/* Category + Urgency */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                    <label style={lbl}>Category *</label>
                    <select value={form.category} onChange={set("category")}
                            style={{...inp,appearance:"none",cursor:"pointer"}}>
                        {CATS.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                </div>
                <div>
                    <label style={lbl}>Urgency Level</label>
                    <div style={{display:"flex",gap:6}}>
                        {[1,2,3,4,5].map(u=>(
                            <motion.button key={u} whileTap={{scale:.9}}
                                           onClick={()=>setForm(p=>({...p,urgency:u}))}
                                           style={{
                                               flex:1,height:42,borderRadius:9,cursor:"pointer",
                                               fontFamily:"'DM Sans',sans-serif",fontWeight:900,fontSize:13,
                                               border:`1.5px solid`,
                                               background: form.urgency===u ? URGENCY_CFG[u-1].color : "rgba(255,255,255,0.03)",
                                               borderColor: form.urgency===u ? URGENCY_CFG[u-1].color : T.border,
                                               color: form.urgency===u ? "#fff" : T.muted,
                                               boxShadow: form.urgency===u ? `0 0 12px ${URGENCY_CFG[u-1].color}50` : "none",
                                               transition:"all .2s",
                                           }}>
                                {u}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Zone + People */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                    <label style={lbl}>Zone / Area *</label>
                    <input value={form.zone} onChange={set("zone")}
                           placeholder="e.g. Dharavi North"
                           style={inp}
                           onFocus={e=>e.target.style.borderColor=T.accent}
                           onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                    />
                </div>
                <div>
                    <label style={lbl}>People Affected</label>
                    <input value={form.people} onChange={set("people")}
                           type="number" placeholder="Estimated count"
                           style={inp}
                           onFocus={e=>e.target.style.borderColor=T.accent}
                           onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label style={lbl}>Detailed Description</label>
                <textarea value={form.desc} onChange={set("desc")}
                          rows={4}
                          placeholder="Full context — situation details, special circumstances, access constraints..."
                          style={{...inp,resize:"none",lineHeight:1.6}}
                          onFocus={e=>e.target.style.borderColor=T.accent}
                          onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                />
            </div>

            {/* Vulnerability + Resources */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                    <label style={lbl}>Vulnerable Groups</label>
                    <input value={form.vulnerability} onChange={set("vulnerability")}
                           placeholder="e.g. elderly, children"
                           style={inp}
                           onFocus={e=>e.target.style.borderColor=T.accent}
                           onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                    />
                </div>
                <div>
                    <label style={lbl}>Resources Needed</label>
                    <input value={form.resources} onChange={set("resources")}
                           placeholder="e.g. food packets, medicine"
                           style={inp}
                           onFocus={e=>e.target.style.borderColor=T.accent}
                           onBlur={e=>e.target.style.borderColor="rgba(99,179,237,0.15)"}
                    />
                </div>
            </div>

            {/* Media */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                    <label style={lbl}>Attach Photos</label>
                    <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhoto}/>
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}}
                                   onClick={()=>fileRef.current?.click()}
                                   style={{
                                       ...inp,cursor:"pointer",
                                       display:"flex",alignItems:"center",gap:8,
                                       color:T.accent,fontWeight:700,justifyContent:"center",
                                   }}>
                        <Camera size={15}/> Photos ({photos.length})
                    </motion.button>
                    {photos.length>0 && (
                        <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                            {photos.map((p,i)=>(
                                <div key={i} style={{
                                    width:42,height:42,borderRadius:8,
                                    backgroundImage:`url(${p})`,backgroundSize:"cover",
                                    border:`1px solid ${T.border}`,position:"relative",
                                }}>
                                    <button onClick={()=>setPhotos(pp=>pp.filter((_,j)=>j!==i))}
                                            style={{
                                                position:"absolute",top:-5,right:-5,width:16,height:16,
                                                borderRadius:"50%",background:T.red,border:"none",
                                                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                                            }}>
                                        <X size={8} color="#fff"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <label style={lbl}>Voice Note</label>
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}}
                                   animate={recording?{boxShadow:["0 0 0px #EF444400","0 0 16px #EF444450","0 0 0px #EF444400"]}:{}}
                                   transition={{duration:1,repeat:Infinity}}
                                   onClick={handleVoice}
                                   style={{
                                       ...inp,cursor:"pointer",
                                       display:"flex",alignItems:"center",gap:8,
                                       color: recording ? T.red : T.accent,
                                       fontWeight:700,justifyContent:"center",
                                       borderColor: recording ? T.red : "rgba(99,179,237,0.15)",
                                       background: recording ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                                   }}>
                        <Mic size={15}/>
                        {recording?"Recording... tap to stop":voiceNote?"Re-record":"Record Voice"}
                    </motion.button>
                    {voiceNote && !recording && (
                        <div style={{
                            marginTop:6,padding:"6px 10px",borderRadius:8,
                            background:"rgba(16,185,129,0.12)",border:`1px solid ${T.green}40`,
                            display:"flex",alignItems:"center",gap:6,
                        }}>
                            <CheckCircle size={11} style={{color:T.green}}/>
                            <span style={{fontSize:11,fontWeight:700,color:T.green}}>Voice note saved</span>
                        </div>
                    )}
                </div>
            </div>

            <motion.button whileHover={{scale:1.02,boxShadow:`0 8px 30px ${T.accentGlow}`}}
                           whileTap={{scale:.97}} onClick={handleSubmit} style={primaryBtn(T.accent)}>
                {loading
                    ? <><RefreshCw size={14} style={{animation:"spin 1s linear infinite"}}/> Processing...</>
                    : <><Send size={14}/> Submit Detailed Report</>
                }
            </motion.button>
        </div>
    )
}

/* ── BULK IMPORT ── */
const BulkImport = ({ onSuccess }) => {
    const [dragging,setDragging]=useState(false)
    const [file,setFile]=useState(null)
    const [preview,setPreview]=useState(null)
    const [loading,setLoading]=useState(false)
    const [processed,setProcessed]=useState(false)
    const [progress,setProgress]=useState(0)
    const fileRef=useRef()

    const SAMPLE=[
        {title:"Food shortage",       category:"food",      urgency:5,people:120,zone:"Dharavi"},
        {title:"Medical supplies low",category:"medical",   urgency:4,people:45, zone:"Kurla West"},
        {title:"Shelter repair",      category:"shelter",   urgency:5,people:200,zone:"Chembur"},
        {title:"Water access issue",  category:"water",     urgency:3,people:80, zone:"Ghatkopar"},
        {title:"School supplies",     category:"education", urgency:2,people:60, zone:"Mankhurd"},
    ]

    const handleDrop=e=>{
        e.preventDefault();setDragging(false)
        const f=e.dataTransfer.files[0]
        if(f){setFile(f);setPreview(SAMPLE)}
    }

    const handleFile=e=>{
        const f=e.target.files[0]
        if(f){setFile(f);setPreview(SAMPLE)}
    }

    const handleProcess=()=>{
        setLoading(true);setProgress(0)
        const interval=setInterval(()=>{
            setProgress(p=>{
                if(p>=100){clearInterval(interval);setLoading(false);setProcessed(true);onSuccess();return 100}
                return p+4
            })
        },80)
    }

    return (
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {/* Drop zone */}
            <motion.div
                animate={{borderColor: dragging ? T.accent : "rgba(99,179,237,0.2)"}}
                onDragOver={e=>{e.preventDefault();setDragging(true)}}
                onDragLeave={()=>setDragging(false)}
                onDrop={handleDrop}
                onClick={()=>fileRef.current?.click()}
                style={{
                    border:`2px dashed ${dragging?T.accent:"rgba(99,179,237,0.2)"}`,
                    borderRadius:16, padding:"40px 24px", textAlign:"center",
                    cursor:"pointer",
                    background: dragging ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
                    transition:"all .2s",
                }}>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
                       style={{display:"none"}} onChange={handleFile}/>
                <motion.div
                    animate={dragging?{scale:1.1,rotate:5}:{scale:1,rotate:0}}
                    style={{
                        width:56,height:56,borderRadius:16,
                        background: dragging ? `${T.accent}30` : "rgba(255,255,255,0.05)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        margin:"0 auto 14px",
                    }}>
                    <Upload size={24} style={{color: dragging ? T.accent : T.muted}}/>
                </motion.div>
                {file ? (
                    <>
                        <p style={{fontSize:14,fontWeight:700,color:T.text,margin:"0 0 4px"}}>{file.name}</p>
                        <p style={{fontSize:12,color:T.muted,margin:0}}>{preview?.length} rows detected</p>
                    </>
                ) : (
                    <>
                        <p style={{fontSize:14,fontWeight:700,color:T.text,margin:"0 0 4px"}}>Drop CSV or Excel here</p>
                        <p style={{fontSize:12,color:T.muted,margin:"0 0 12px"}}>or click to browse</p>
                        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
                            {[".csv",".xlsx",".xls"].map(ext=>(
                                <span key={ext} style={{
                                    fontSize:10,fontWeight:700,padding:"3px 10px",
                                    borderRadius:20,background:`${T.accent}20`,color:T.accent,
                                    border:`1px solid ${T.accent}30`,
                                }}>{ext}</span>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>

            {!file && (
                <div style={{
                    padding:"14px 16px",borderRadius:12,
                    background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,
                }}>
                    <p style={{fontSize:11,fontWeight:700,color:T.muted,margin:"0 0 8px",
                        textTransform:"uppercase",letterSpacing:".5px"}}>Expected Columns</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {["title","category","urgency","people_affected","zone","description"].map(col=>(
                            <span key={col} style={{
                                fontSize:11,fontWeight:700,padding:"3px 10px",
                                borderRadius:20,background:`${T.accent}15`,color:T.accent,
                            }}>{col}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview Table */}
            {preview && (
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} style={{overflowX:"auto"}}>
                    <p style={{fontSize:11,fontWeight:700,color:T.muted,margin:"0 0 8px",
                        textTransform:"uppercase",letterSpacing:".5px"}}>Preview — {preview.length} rows</p>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
                        <thead>
                        <tr style={{background:"rgba(255,255,255,0.04)"}}>
                            {["Title","Category","Urgency","People","Zone"].map(h=>(
                                <th key={h} style={{
                                    padding:"8px 12px",textAlign:"left",
                                    fontWeight:700,color:T.muted,fontSize:10,
                                    textTransform:"uppercase",letterSpacing:".4px",
                                    borderBottom:`1px solid ${T.border}`,
                                }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {preview.map((row,i)=>(
                            <motion.tr key={i}
                                       initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                                       transition={{delay:i*.05}}
                                       style={{borderBottom:`1px solid ${T.border}`}}>
                                <td style={{padding:"9px 12px",fontWeight:700,color:T.text}}>{row.title}</td>
                                <td style={{padding:"9px 12px"}}>
                    <span style={{
                        fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,
                        background:`${CAT_COLOR[row.category]}20`,
                        color:CAT_COLOR[row.category],
                    }}>{row.category}</span>
                                </td>
                                <td style={{padding:"9px 12px"}}>
                                    <div style={{display:"flex",gap:2,alignItems:"flex-end"}}>
                                        {[1,2,3,4,5].map(b=>(
                                            <div key={b} style={{
                                                width:3,height:b<=row.urgency?12:6,borderRadius:2,
                                                background: b<=row.urgency
                                                    ? (row.urgency>=4?"#EF4444":row.urgency===3?"#F59E0B":"#10B981")
                                                    : "rgba(255,255,255,0.1)",
                                            }}/>
                                        ))}
                                    </div>
                                </td>
                                <td style={{padding:"9px 12px",color:T.accent,fontWeight:700}}>{row.people}</td>
                                <td style={{padding:"9px 12px",color:T.muted}}>{row.zone}</td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Progress */}
            {loading && (
                <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:11,color:T.muted,fontWeight:700}}>AI Processing...</span>
                        <span style={{fontSize:11,color:T.accent,fontWeight:700}}>{progress}%</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                        <motion.div
                            animate={{width:`${progress}%`}}
                            style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${T.accent},${T.purple})`}}
                        />
                    </div>
                </div>
            )}

            {preview && !processed && !loading && (
                <motion.button initial={{opacity:0}} animate={{opacity:1}}
                               whileHover={{scale:1.02}} whileTap={{scale:.97}}
                               onClick={handleProcess} style={primaryBtn(T.accent)}>
                    <Zap size={14}/> Process {preview.length} needs with AI
                </motion.button>
            )}

            {processed && (
                <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}}
                            style={{
                                padding:"16px",borderRadius:14,
                                background:"rgba(16,185,129,0.12)",border:`1px solid ${T.green}40`,
                                display:"flex",alignItems:"center",gap:10,
                            }}>
                    <CheckCircle size={20} style={{color:T.green,flexShrink:0}}/>
                    <div>
                        <p style={{fontSize:13,fontWeight:700,color:T.green,margin:0}}>
                            {preview.length} needs processed!
                        </p>
                        <p style={{fontSize:11,color:`${T.green}cc`,margin:"2px 0 0"}}>
                            All scored by AI and queued for volunteer matching
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

/* ── LIVE FEED SIDEBAR ── */
const LiveFeed = () => {
    const [feed,setFeed]=useState(LIVE_FEED)
    const [pulse,setPulse]=useState(false)

    useEffect(()=>{
        const t=setInterval(()=>{
            setPulse(true)
            setTimeout(()=>setPulse(false),500)
        },3000)
        return ()=>clearInterval(t)
    },[])

    const totals = { submissions:feed.length+17, aiScored:feed.length+17, critical:3, avgUrgency:"3.8" }

    return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Stats strip */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                    {label:"Today",    value:totals.submissions, color:T.accent},
                    {label:"AI Scored",value:totals.aiScored,    color:T.purple},
                    {label:"Critical", value:totals.critical,    color:T.red},
                    {label:"Avg Score",value:totals.avgUrgency,  color:T.amber},
                ].map(s=>(
                    <div key={s.label} style={{
                        padding:"12px",borderRadius:12,
                        background:`${s.color}0f`,
                        border:`1px solid ${s.color}25`,
                    }}>
                        <p style={{fontSize:20,fontWeight:800,color:s.color,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{s.value}</p>
                        <p style={{fontSize:10,color:T.muted,margin:"2px 0 0",fontWeight:600}}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Feed header */}
            <div style={{
                padding:"14px 16px",borderRadius:14,
                background:T.card,border:`1px solid ${T.border}`,
            }}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{
                            width:28,height:28,borderRadius:8,
                            background:`${T.accent}20`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                        }}>
                            <Activity size={13} style={{color:T.accent}}/>
                        </div>
                        <div>
                            <p style={{fontSize:12,fontWeight:700,color:T.text,margin:0}}>Live Feed</p>
                            <p style={{fontSize:9,color:T.muted,margin:0}}>AI processed · real-time</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{opacity: pulse ? [1,.2,1] : 1, scale: pulse ? [1,1.5,1] : 1}}
                        style={{width:7,height:7,borderRadius:"50%",background:T.green,
                            boxShadow:`0 0 8px ${T.green}`}}
                    />
                </div>

                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {feed.map((item,i)=>{
                        const catCfg=CATS.find(c=>c.key===item.cat)||CATS[0]
                        const st=STATUS_STYLE[item.status]
                        return (
                            <motion.div key={item.id}
                                        initial={{opacity:0,x:12}} animate={{opacity:1,x:0}}
                                        transition={{delay:i*.06}}
                                        whileHover={{background:"rgba(255,255,255,0.04)",x:2}}
                                        style={{
                                            padding:"10px 12px",borderRadius:10,
                                            background:"rgba(255,255,255,0.02)",
                                            border:`1px solid ${T.border}`,
                                            cursor:"pointer",transition:"all .15s",
                                        }}>
                                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:6,marginBottom:5}}>
                                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                                        <div style={{
                                            width:22,height:22,borderRadius:6,
                                            background:`${catCfg.color}20`,flexShrink:0,
                                            display:"flex",alignItems:"center",justifyContent:"center",
                                        }}>
                                            <catCfg.icon size={11} style={{color:catCfg.color}}/>
                                        </div>
                                        <span style={{fontSize:11,fontWeight:700,color:T.text,lineHeight:1.3}}>
                      {catCfg.label}
                    </span>
                                    </div>
                                    <span style={{
                                        fontSize:9,fontWeight:700,padding:"2px 7px",
                                        borderRadius:20,flexShrink:0,
                                        background:st.bg,color:st.text,
                                    }}>{st.label}</span>
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:10,color:T.muted,display:"flex",alignItems:"center",gap:3}}>
                    <MapPin size={8}/> {item.zone}
                  </span>
                                    <span style={{fontSize:10,color:T.muted}}>
                    {item.people} people
                  </span>
                                    <div style={{display:"flex",gap:1.5,alignItems:"flex-end"}}>
                                        {[1,2,3,4,5].map(b=>(
                                            <div key={b} style={{
                                                width:3,height:b<=item.urgency?10:4,borderRadius:2,
                                                background: b<=item.urgency
                                                    ? (item.urgency>=4?"#EF4444":"#F59E0B")
                                                    : "rgba(255,255,255,0.08)",
                                            }}/>
                                        ))}
                                    </div>
                                    <span style={{fontSize:9,color:T.muted,marginLeft:"auto"}}>{item.time}</span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

/* ── TABS ── */
const TABS=[
    {key:"quick",    label:"Quick Submit",    icon:Zap,      desc:"One-tap field report"},
    {key:"detailed", label:"Full Report",     icon:FileText,  desc:"Rich form + media"},
    {key:"bulk",     label:"Bulk Import",     icon:Upload,    desc:"CSV / Excel upload"},
]

/* ── MAIN ── */
export default function SurveyPage() {
    const [tab,setTab]=useState("quick")
    const [success,setSuccess]=useState(false)
    const [onlineStatus,setOnlineStatus]=useState(true)

    const handleSuccess=()=>{
        setSuccess(true)
        setTimeout(()=>setSuccess(false),4000)
    }

    return (
        <div style={{
            minHeight:"100vh",background:T.bg,color:T.text,
            fontFamily:"'DM Sans',sans-serif",position:"relative",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px}
        input,textarea,select{font-family:'DM Sans',sans-serif !important}
        option{background:#111827}
      `}</style>

            <Particles/>

            <div style={{position:"relative",zIndex:1,padding:"28px 32px",maxWidth:1300,margin:"0 auto"}}>

                {/* Header */}
                <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
                            style={{
                                display:"flex",alignItems:"center",justifyContent:"space-between",
                                marginBottom:28,flexWrap:"wrap",gap:12,
                            }}>
                    <div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                            <div style={{
                                width:36,height:36,borderRadius:10,
                                background:`linear-gradient(135deg,${T.accent},${T.purple})`,
                                display:"flex",alignItems:"center",justifyContent:"center",
                            }}>
                                <Shield size={18} color="#fff"/>
                            </div>
                            <h1 style={{fontSize:24,fontWeight:900,color:T.text,letterSpacing:"-.5px"}}>
                                Need Submission
                            </h1>
                        </div>
                        <p style={{fontSize:13,color:T.muted,fontWeight:500,paddingLeft:46}}>
                            Report community needs — AI scores & routes to volunteers instantly
                        </p>
                    </div>

                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {/* Online status */}
                        <motion.div
                            animate={{opacity:[1,.7,1]}} transition={{duration:2,repeat:Infinity}}
                            style={{
                                display:"flex",alignItems:"center",gap:6,
                                padding:"7px 14px",borderRadius:10,
                                background:"rgba(16,185,129,0.1)",border:`1px solid ${T.green}30`,
                            }}>
                            <Wifi size={12} style={{color:T.green}}/>
                            <span style={{fontSize:11,fontWeight:700,color:T.green}}>AI Engine Live</span>
                        </motion.div>

                        {/* Clock */}
                        <div style={{
                            padding:"7px 14px",borderRadius:10,
                            background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,
                        }}>
              <span style={{fontSize:11,fontWeight:700,color:T.muted}}>
                {new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
              </span>
                        </div>
                    </div>
                </motion.div>

                {/* Success Toast */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{opacity:0,y:-16,scale:.95}}
                            animate={{opacity:1,y:0,scale:1}}
                            exit={{opacity:0,y:-16,scale:.95}}
                            style={{
                                marginBottom:20,padding:"14px 18px",borderRadius:14,
                                background:"rgba(16,185,129,0.12)",border:`1px solid ${T.green}40`,
                                display:"flex",alignItems:"center",gap:12,position:"relative",overflow:"hidden",
                            }}>
                            <CheckCircle size={20} style={{color:T.green,flexShrink:0}}/>
                            <div>
                                <p style={{fontSize:13,fontWeight:700,color:T.green,margin:0}}>
                                    Need submitted successfully!
                                </p>
                                <p style={{fontSize:11,color:`${T.green}cc`,margin:"2px 0 0"}}>
                                    AI scoring urgency and matching volunteers now...
                                </p>
                            </div>
                            <motion.div
                                initial={{width:"100%"}} animate={{width:"0%"}}
                                transition={{duration:4,ease:"linear"}}
                                style={{
                                    position:"absolute",bottom:0,left:0,height:3,
                                    background:T.green,borderRadius:"0 0 14px 14px",
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main layout */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:18}}>

                    {/* Left — form */}
                    <div>
                        {/* Tab switcher */}
                        <div style={{
                            display:"flex",gap:8,marginBottom:16,
                            background:"rgba(255,255,255,0.03)",
                            border:`1px solid ${T.border}`,
                            borderRadius:16,padding:6,
                        }}>
                            {TABS.map(t=>(
                                <motion.button key={t.key}
                                               whileHover={{scale:1.01}} whileTap={{scale:.98}}
                                               onClick={()=>setTab(t.key)}
                                               style={{
                                                   flex:1,padding:"11px 12px",borderRadius:12,
                                                   cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                                                   background: tab===t.key
                                                       ? `linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))`
                                                       : "transparent",
                                                   boxShadow: tab===t.key ? `inset 0 0 0 1px ${T.accent}40` : "none",
                                                   border:"none",
                                                   display:"flex",flexDirection:"column",alignItems:"center",gap:5,
                                                   transition:"all .2s",
                                               }}>
                                    <t.icon size={15} style={{color: tab===t.key ? T.accent : T.muted}}/>
                                    <span style={{fontSize:12,fontWeight:700,color: tab===t.key ? T.text : T.muted}}>
                    {t.label}
                  </span>
                                    <span style={{fontSize:9,color: tab===t.key ? T.muted : "#96bbda",fontWeight:500}}>
                    {t.desc}
                  </span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Form card */}
                        <motion.div
                            layout
                            style={{
                                background:T.card,border:`1px solid ${T.border}`,
                                borderRadius:18,padding:"24px",
                                boxShadow:"0 8px 40px rgba(0,0,0,0.3)",
                            }}>
                            <AnimatePresence mode="wait">
                                <motion.div key={tab}
                                            initial={{opacity:0,x:16}} animate={{opacity:1,x:0}}
                                            exit={{opacity:0,x:-16}} transition={{duration:.22}}>
                                    {tab==="quick"    && <QuickSubmit   onSuccess={handleSuccess}/>}
                                    {tab==="detailed" && <DetailedReport onSuccess={handleSuccess}/>}
                                    {tab==="bulk"     && <BulkImport    onSuccess={handleSuccess}/>}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Right — live feed */}
                    <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:.2}}>
                        <LiveFeed/>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}