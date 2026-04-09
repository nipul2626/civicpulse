import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
    BarChart3, TrendingUp, Brain, Zap, MapPin, Clock, Users,
    Activity, Target, AlertTriangle, CheckCircle, RefreshCw,
    ChevronRight, Eye, Filter, Calendar, Star, Globe,
    ArrowUpRight, Layers, Cpu, Radio, Wifi, Database,
    Heart, Home, Droplets, BookOpen, Utensils, Shield
} from "lucide-react"

/* ── THEME ── */
const T={
    bg:"#050810",surface:"#0A1020",card:"#0F1829",border:"rgba(139,92,246,0.15)",
    text:"#F0F0FF",muted:"#6B7A9E",accent:"#8B5CF6",green:"#10B981",
    amber:"#F59E0B",red:"#EF4444",blue:"#3B82F6",cyan:"#06B6D4",pink:"#EC4899",
}

/* ── DATA ── */
const AI_INSIGHTS=[
    {
        id:1,type:"prediction",icon:Brain,color:T.accent,
        title:"Peak demand expected Thursday",
        desc:"AI predicts 34% surge in medical needs based on weather patterns and historical data.",
        confidence:92, impact:"high",action:"Pre-position 8 medical volunteers",
    },
    {
        id:2,type:"anomaly",icon:AlertTriangle,color:T.amber,
        title:"Unusual water scarcity in Zone B",
        desc:"3x normal water need reports in Ghatkopar — possible infrastructure failure.",
        confidence:87,impact:"critical",action:"Alert water authority + deploy tankers",
    },
    {
        id:3,type:"optimization",icon:Target,color:T.green,
        title:"Volunteer routing optimized",
        desc:"AI re-routed 6 volunteers saving avg 47 min per assignment today.",
        confidence:95,impact:"medium",action:"Applied automatically",
    },
    {
        id:4,type:"trend",icon:TrendingUp,color:T.cyan,
        title:"Education need rising 22%",
        desc:"School season driving education need growth. Recommend pre-stocking supplies.",
        confidence:89,impact:"medium",action:"Stock 200 education kits",
    },
]

const HEATMAP_ZONES=[
    {zone:"Dharavi",    x:35, y:30, intensity:0.95, needs:47, cat:"medical" },
    {zone:"Bandra",     x:60, y:20, intensity:0.6,  needs:23, cat:"food"    },
    {zone:"Kurla",      x:55, y:45, intensity:0.75, needs:38, cat:"water"   },
    {zone:"Sion",       x:30, y:52, intensity:0.55, needs:19, cat:"shelter" },
    {zone:"Andheri",    x:70, y:58, intensity:0.5,  needs:31, cat:"food"    },
    {zone:"Chembur",    x:45, y:70, intensity:0.65, needs:29, cat:"medical" },
    {zone:"Ghatkopar",  x:75, y:40, intensity:0.85, needs:43, cat:"water"   },
    {zone:"Mankhurd",   x:80, y:65, intensity:0.4,  needs:22, cat:"education"},
    {zone:"Goregaon",   x:25, y:38, intensity:0.45, needs:18, cat:"food"    },
]

const REAL_TIME=[
    {time:"14:32",event:"AI scored need #1847 — Medical · Dharavi · Urgency 5",type:"score",zone:"Dharavi"},
    {time:"14:30",event:"Volunteer Priya M. matched to need #1845 in 2.3 sec",type:"match",zone:"Kurla"},
    {time:"14:28",event:"Duplicate detected: #1844 merged with #1831",type:"dedup",zone:"Andheri"},
    {time:"14:25",event:"Critical alert: 3 simultaneous medical needs in Zone A",type:"alert",zone:"Zone A"},
    {time:"14:22",event:"Batch of 5 needs scored — avg urgency 3.6",type:"batch",zone:"Multiple"},
    {time:"14:18",event:"Volunteer Rahul S. completed task — 99% satisfaction",type:"complete",zone:"Dharavi"},
    {time:"14:15",event:"AI predicted surge — 4 extra volunteers pre-positioned",type:"predict",zone:"Kurla"},
    {time:"14:10",event:"Zone Chembur water alert escalated to Level 3",type:"alert",zone:"Chembur"},
]

const MODEL_METRICS=[
    {label:"Urgency Prediction",  score:96.8, color:T.accent},
    {label:"Volunteer Matching",  score:94.2, color:T.green },
    {label:"Duplicate Detection", score:98.1, color:T.cyan  },
    {label:"Category Auto-tag",   score:92.7, color:T.amber },
    {label:"Zone Classification", score:95.5, color:T.pink  },
    {label:"ETA Prediction",      score:89.3, color:T.blue  },
]

const HOURLY=[
    {h:"6am",v:5},{h:"8am",v:18},{h:"10am",v:32},{h:"12pm",v:41},
    {h:"2pm",v:38},{h:"4pm",v:45},{h:"6pm",v:52},{h:"8pm",v:29},
    {h:"10pm",v:14},{h:"12am",v:7},
]

const CAT_COLOR={medical:"#EF4444",food:"#F59E0B",water:"#06B6D4",shelter:"#8B5CF6",education:"#10B981"}

/* ── INTENSITY TO COLOR ── */
const intensityColor = (v) => {
    if(v>0.85) return "#EF4444"
    if(v>0.7)  return "#F97316"
    if(v>0.55) return "#F59E0B"
    if(v>0.4)  return "#10B981"
    return "#3B82F6"
}

/* ── PULSE DOT ── */
const PulseDot = ({color,size=8}) => (
    <div style={{position:"relative",width:size,height:size}}>
        <motion.div
            animate={{scale:[1,2.5,1],opacity:[0.8,0,0.8]}}
            transition={{duration:2,repeat:Infinity}}
            style={{
                position:"absolute",inset:0,borderRadius:"50%",
                background:color,opacity:0.4,
            }}
        />
        <div style={{
            position:"absolute",inset:0,borderRadius:"50%",
            background:color,
        }}/>
    </div>
)

/* ── CARD ── */
const Card = ({children,style={}}) => (
    <div style={{
        background:T.card,border:`1px solid ${T.border}`,
        borderRadius:16,padding:"20px",...style,
    }}>{children}</div>
)

/* ── SECTION HDR ── */
const SH = ({title,sub,icon:Icon,color=T.accent}) => (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:30,height:30,borderRadius:8,background:`${color}20`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon size={14} style={{color}}/>
        </div>
        <div>
            <p style={{fontSize:13,fontWeight:800,color:T.text,margin:0}}>{title}</p>
            {sub&&<p style={{fontSize:10,color:T.muted,margin:0}}>{sub}</p>}
        </div>
    </div>
)

/* ── SCAN LINE ANIMATION ── */
const ScanLine = () => (
    <motion.div
        animate={{top:["0%","100%"]}}
        transition={{duration:3,repeat:Infinity,ease:"linear"}}
        style={{
            position:"absolute",left:0,right:0,height:2,
            background:`linear-gradient(90deg,transparent,${T.accent}80,transparent)`,
            pointerEvents:"none",zIndex:5,
        }}
    />
)

/* ── LIVE HEATMAP ── */
const LiveHeatmap = () => {
    const [hovered,setHovered]=useState(null)
    const [catFilter,setCatFilter]=useState(null)

    const filtered=catFilter
        ? HEATMAP_ZONES.filter(z=>z.cat===catFilter)
        : HEATMAP_ZONES

    return (
        <Card style={{height:"100%"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <SH title="AI Heatmap" sub="Real-time need density" icon={Globe} color={T.cyan}/>
                <div style={{display:"flex",gap:4}}>
                    {["medical","food","water","shelter","education",null].map((cat,i)=>(
                        <motion.button key={i} whileTap={{scale:.95}}
                                       onClick={()=>setCatFilter(cat)}
                                       style={{
                                           width:20,height:20,borderRadius:6,border:"none",cursor:"pointer",
                                           background: catFilter===cat
                                               ? (cat?CAT_COLOR[cat]:T.accent)
                                               : "rgba(255,255,255,0.05)",
                                           title:cat||"All",
                                       }}
                        />
                    ))}
                </div>
            </div>

            {/* Map */}
            <div style={{
                position:"relative",height:240,borderRadius:12,overflow:"hidden",
                background:"linear-gradient(135deg,#05101A 0%,#0A1829 50%,#051015 100%)",
            }}>
                <ScanLine/>
                {/* Grid */}
                <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.12}}>
                    {[15,30,45,60,75,90].map(p=>(
                        <g key={p}>
                            <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={T.accent} strokeWidth=".5"/>
                            <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke={T.accent} strokeWidth=".5"/>
                        </g>
                    ))}
                </svg>

                {/* Blobs */}
                {filtered.map((dot,i)=>{
                    const col=intensityColor(dot.intensity)
                    const sz=dot.intensity*60+20
                    return (
                        <div key={dot.zone} style={{
                            position:"absolute",
                            left:`${dot.x}%`,top:`${dot.y}%`,
                            transform:"translate(-50%,-50%)",zIndex:2,
                        }}>
                            {/* Glow blob */}
                            <motion.div
                                animate={{scale:[1,1.15,1],opacity:[0.4,0.7,0.4]}}
                                transition={{duration:2.5+i*.3,repeat:Infinity,ease:"easeInOut"}}
                                style={{
                                    position:"absolute",
                                    width:sz,height:sz,borderRadius:"50%",
                                    background:`radial-gradient(circle,${col}60,${col}00)`,
                                    transform:"translate(-50%,-50%)",
                                    left:"50%",top:"50%",
                                }}
                            />
                            {/* Dot */}
                            <motion.div
                                whileHover={{scale:1.4}}
                                onHoverStart={()=>setHovered(i)}
                                onHoverEnd={()=>setHovered(null)}
                                style={{
                                    width:12,height:12,borderRadius:"50%",
                                    background:col,cursor:"pointer",
                                    boxShadow:`0 0 12px ${col}`,
                                    position:"relative",zIndex:3,
                                }}
                            />
                            {/* Tooltip */}
                            <AnimatePresence>
                                {hovered===i && (
                                    <motion.div initial={{opacity:0,y:6,scale:.9}}
                                                animate={{opacity:1,y:0,scale:1}} exit={{opacity:0}}
                                                style={{
                                                    position:"absolute",bottom:"calc(100% + 8px)",
                                                    left:"50%",transform:"translateX(-50%)",
                                                    whiteSpace:"nowrap",
                                                    background:"rgba(10,16,32,0.96)",
                                                    border:`1px solid ${col}50`,
                                                    borderRadius:8,padding:"6px 10px",
                                                    fontSize:10,color:T.text,zIndex:10,
                                                    pointerEvents:"none",
                                                }}>
                                        <p style={{fontWeight:700,margin:"0 0 2px"}}>{dot.zone}</p>
                                        <p style={{color:T.muted,margin:0}}>{dot.needs} needs · {dot.cat}</p>
                                        <p style={{color:col,margin:"2px 0 0",fontWeight:700}}>
                                            Intensity: {Math.round(dot.intensity*100)}%
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}

                {/* Legend */}
                <div style={{position:"absolute",bottom:8,right:8,display:"flex",gap:6,alignItems:"center"}}>
                    {[
                        {label:"Critical",color:"#EF4444"},
                        {label:"High",    color:"#F59E0B"},
                        {label:"Low",     color:"#10B981"},
                    ].map(l=>(
                        <div key={l.label} style={{display:"flex",alignItems:"center",gap:3}}>
                            <div style={{width:6,height:6,borderRadius:"50%",background:l.color}}/>
                            <span style={{fontSize:8,color:T.muted,fontWeight:600}}>{l.label}</span>
                        </div>
                    ))}
                </div>

                {/* City label */}
                <p style={{position:"absolute",bottom:8,left:10,color:T.muted,
                    fontSize:8,fontWeight:700,letterSpacing:".12em"}}>MUMBAI CITY</p>
            </div>
        </Card>
    )
}

/* ── AI INSIGHTS ── */
const AIInsights = () => {
    const [expanded,setExpanded]=useState(null)

    const IMPACT_COLOR = {high:T.amber, critical:T.red, medium:T.cyan}

    return (
        <Card>
            <SH title="AI Predictions & Alerts" sub="Live intelligence from your data" icon={Brain} color={T.accent}/>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {AI_INSIGHTS.map((ins,i)=>(
                    <motion.div key={ins.id}
                                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                                transition={{delay:i*.08}}
                                onClick={()=>setExpanded(expanded===ins.id?null:ins.id)}
                                style={{
                                    borderRadius:12,border:`1px solid ${ins.color}25`,
                                    background:`${ins.color}08`,cursor:"pointer",
                                    overflow:"hidden",
                                }}>
                        <div style={{
                            padding:"12px 14px",
                            display:"flex",alignItems:"center",gap:10,
                        }}>
                            <div style={{
                                width:30,height:30,borderRadius:8,
                                background:`${ins.color}20`,flexShrink:0,
                                display:"flex",alignItems:"center",justifyContent:"center",
                            }}>
                                <ins.icon size={14} style={{color:ins.color}}/>
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                                    <p style={{fontSize:12,fontWeight:700,color:T.text,margin:0}}>{ins.title}</p>
                                    <span style={{
                                        fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:20,
                                        background:`${IMPACT_COLOR[ins.impact]||T.muted}20`,
                                        color:IMPACT_COLOR[ins.impact]||T.muted,
                                        textTransform:"capitalize",flexShrink:0,
                                    }}>{ins.impact}</span>
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <div style={{flex:1,height:2,borderRadius:1,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                                        <motion.div initial={{width:0}} animate={{width:`${ins.confidence}%`}}
                                                    transition={{delay:.3+i*.08,duration:.6}}
                                                    style={{height:"100%",borderRadius:1,background:ins.color}}/>
                                    </div>
                                    <span style={{fontSize:10,color:ins.color,fontWeight:700,flexShrink:0}}>
                    {ins.confidence}% confidence
                  </span>
                                </div>
                            </div>
                            <motion.div animate={{rotate:expanded===ins.id?90:0}}>
                                <ChevronRight size={14} style={{color:T.muted,flexShrink:0}}/>
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {expanded===ins.id && (
                                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                                            exit={{height:0,opacity:0}} transition={{duration:.2}}>
                                    <div style={{
                                        padding:"0 14px 12px",
                                        borderTop:`1px solid ${ins.color}20`,
                                        paddingTop:10,
                                    }}>
                                        <p style={{fontSize:12,color:T.muted,margin:"0 0 10px",lineHeight:1.6}}>{ins.desc}</p>
                                        <div style={{
                                            display:"flex",alignItems:"center",gap:8,
                                            padding:"8px 12px",borderRadius:8,
                                            background:`${ins.color}12`,border:`1px solid ${ins.color}30`,
                                        }}>
                                            <Zap size={12} style={{color:ins.color}}/>
                                            <span style={{fontSize:11,fontWeight:700,color:ins.color}}>
                        Recommended: {ins.action}
                      </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </Card>
    )
}

/* ── REAL-TIME LOG ── */
const RealTimeLog = () => {
    const [log,setLog]=useState(REAL_TIME)
    const [paused,setPaused]=useState(false)
    const [count,setCount]=useState(0)

    useEffect(()=>{
        if(paused)return
        const t=setInterval(()=>{
            setCount(c=>c+1)
        },4000)
        return()=>clearInterval(t)
    },[paused])

    const TYPE_STYLE={
        score:  {icon:"🤖",color:T.accent},
        match:  {icon:"🔗",color:T.green},
        dedup:  {icon:"🔄",color:T.cyan},
        alert:  {icon:"🚨",color:T.red},
        batch:  {icon:"📦",color:T.amber},
        complete:{icon:"✅",color:T.green},
        predict:{icon:"🧠",color:T.accent},
    }

    return (
        <Card>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <SH title="AI Activity Log" sub="Live system events" icon={Radio} color={T.green}/>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <motion.div
                        animate={{opacity:[1,.3,1]}}
                        transition={{duration:1.5,repeat:Infinity}}
                        style={{width:6,height:6,borderRadius:"50%",
                            background:T.green,boxShadow:`0 0 8px ${T.green}`}}
                    />
                    <span style={{fontSize:10,fontWeight:700,color:T.green}}>Live</span>
                    <button onClick={()=>setPaused(p=>!p)}
                            style={{
                                marginLeft:6,padding:"3px 8px",borderRadius:6,
                                border:`1px solid ${T.border}`,background:"transparent",
                                color:T.muted,fontSize:10,fontWeight:600,cursor:"pointer",
                                fontFamily:"'DM Sans',sans-serif",
                            }}>{paused?"Resume":"Pause"}</button>
                </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:0,maxHeight:320,overflowY:"auto"}}>
                {log.map((item,i)=>{
                    const cfg=TYPE_STYLE[item.type]||TYPE_STYLE.score
                    return (
                        <motion.div key={`${item.time}-${i}`}
                                    initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
                                    transition={{delay:i*.04}}
                                    style={{
                                        display:"flex",gap:8,padding:"9px 0",
                                        borderBottom: i<log.length-1?`1px solid ${T.border}`:"none",
                                    }}>
                            <span style={{fontSize:14,flexShrink:0}}>{cfg.icon}</span>
                            <div style={{flex:1}}>
                                <p style={{fontSize:11,color:T.text,fontWeight:600,margin:"0 0 2px",lineHeight:1.4}}>
                                    {item.event}
                                </p>
                                <div style={{display:"flex",gap:8}}>
                                    <span style={{fontSize:9,color:T.muted,fontFamily:"monospace"}}>{item.time}</span>
                                    <span style={{fontSize:9,color:cfg.color,fontWeight:700}}>{item.zone}</span>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </Card>
    )
}

/* ── MODEL PERFORMANCE ── */
const ModelPerf = () => (
    <Card>
        <SH title="AI Model Performance" sub="Accuracy across all tasks" icon={Cpu} color={T.pink}/>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {MODEL_METRICS.map((m,i)=>(
                <motion.div key={m.label}
                            initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                            transition={{delay:i*.07}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:12,color:T.text,fontWeight:600}}>{m.label}</span>
                        <span style={{fontSize:12,color:m.color,fontWeight:800}}>{m.score}%</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                        <motion.div
                            initial={{width:0}} animate={{width:`${m.score}%`}}
                            transition={{delay:.2+i*.07,duration:.8,ease:"easeOut"}}
                            style={{
                                height:"100%",borderRadius:3,
                                background:`linear-gradient(90deg,${m.color}cc,${m.color})`,
                            }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
        <div style={{
            marginTop:16,padding:"12px",borderRadius:10,
            background:`${T.accent}10`,border:`1px solid ${T.accent}25`,
            display:"flex",alignItems:"center",gap:8,
        }}>
            <Database size={14} style={{color:T.accent,flexShrink:0}}/>
            <div>
                <p style={{fontSize:11,fontWeight:700,color:T.text,margin:0}}>Model: CivicPulse-v2.4</p>
                <p style={{fontSize:10,color:T.muted,margin:0}}>Trained on 24,847 historical needs · Updated daily</p>
            </div>
        </div>
    </Card>
)

/* ── HOURLY CHART ── */
const HourlyChart = () => {
    const max=Math.max(...HOURLY.map(h=>h.v))
    return (
        <Card>
            <SH title="Hourly Submission Pattern" sub="Today's activity by hour" icon={Clock} color={T.amber}/>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:100}}>
                {HOURLY.map((h,i)=>(
                    <div key={h.h} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <motion.div
                            initial={{height:0}} animate={{height:`${(h.v/max)*100}%`}}
                            transition={{delay:i*.05,duration:.6,ease:"easeOut"}}
                            style={{
                                width:"100%",borderRadius:"4px 4px 0 0",
                                background:`linear-gradient(180deg,${T.accent},${T.accent}60)`,
                                minHeight:4,
                            }}
                        />
                        <span style={{fontSize:8,color:T.muted}}>{h.h}</span>
                    </div>
                ))}
            </div>
        </Card>
    )
}

/* ── MAIN ── */
export default function AnalyticsPage() {
    const [aiActive,setAiActive]=useState(true)
    const [lastUpdate,setLastUpdate]=useState(new Date())

    useEffect(()=>{
        const t=setInterval(()=>setLastUpdate(new Date()),30000)
        return()=>clearInterval(t)
    },[])

    return (
        <div style={{
            minHeight:"100vh",background:T.bg,color:T.text,
            fontFamily:"'DM Sans',sans-serif",padding:"28px 32px",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#1E1B4B;border-radius:2px}
      `}</style>

            <div style={{maxWidth:1300,margin:"0 auto"}}>

                {/* Header */}
                <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}
                            style={{
                                display:"flex",alignItems:"center",justifyContent:"space-between",
                                marginBottom:28,flexWrap:"wrap",gap:12,
                            }}>
                    <div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                            <motion.div
                                animate={{boxShadow:[`0 0 0px ${T.accent}`,`0 0 20px ${T.accent}60`,`0 0 0px ${T.accent}`]}}
                                transition={{duration:2,repeat:Infinity}}
                                style={{
                                    width:36,height:36,borderRadius:10,
                                    background:`linear-gradient(135deg,${T.accent},${T.pink})`,
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                }}>
                                <Brain size={18} color="#fff"/>
                            </motion.div>
                            <h1 style={{fontSize:26,fontWeight:900,color:T.text,letterSpacing:"-.5px"}}>
                                AI Analytics
                            </h1>
                        </div>
                        <p style={{fontSize:13,color:T.muted,paddingLeft:46}}>
                            Deep intelligence powered by CivicPulse AI · Last updated {lastUpdate.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                        </p>
                    </div>

                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <motion.div
                            animate={{opacity:[1,.6,1]}} transition={{duration:2,repeat:Infinity}}
                            style={{
                                display:"flex",alignItems:"center",gap:6,padding:"7px 14px",
                                borderRadius:10,background:`${T.accent}15`,border:`1px solid ${T.accent}30`,
                            }}>
                            <PulseDot color={T.accent} size={7}/>
                            <span style={{fontSize:11,fontWeight:700,color:T.accent}}>AI Engine Active</span>
                        </motion.div>

                        <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                       onClick={()=>setLastUpdate(new Date())}
                                       style={{
                                           display:"flex",alignItems:"center",gap:6,padding:"8px 14px",
                                           borderRadius:10,border:`1px solid ${T.border}`,
                                           background:"rgba(255,255,255,0.03)",color:T.muted,
                                           fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                                       }}>
                            <RefreshCw size={13}/> Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {/* Top strip: quick stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
                    {[
                        {label:"Needs Today",    value:"127",  color:T.accent,  icon:Activity},
                        {label:"AI Scored",      value:"127",  color:T.green,   icon:Zap},
                        {label:"Avg Match Time", value:"2.3s", color:T.cyan,    icon:Clock},
                        {label:"Duplicates Cut", value:"23",   color:T.amber,   icon:Layers},
                        {label:"Predictions",    value:"8",    color:T.pink,    icon:Brain},
                    ].map((s,i)=>(
                        <motion.div key={s.label}
                                    initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
                                    transition={{delay:i*.06}}
                                    style={{
                                        background:T.card,border:`1px solid ${T.border}`,
                                        borderRadius:12,padding:"14px 16px",
                                    }}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                                <s.icon size={13} style={{color:s.color}}/>
                                <motion.div animate={{opacity:[1,.4,1]}} transition={{duration:2.5,repeat:Infinity,delay:i*.3}}
                                            style={{width:5,height:5,borderRadius:"50%",background:s.color}}/>
                            </div>
                            <p style={{fontSize:20,fontWeight:900,color:s.color,margin:0}}>{s.value}</p>
                            <p style={{fontSize:10,color:T.muted,margin:"2px 0 0",fontWeight:600}}>{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Row 2: Heatmap + Insights */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                    <LiveHeatmap/>
                    <AIInsights/>
                </div>

                {/* Row 3: Log + Model perf */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                    <RealTimeLog/>
                    <ModelPerf/>
                </div>

                {/* Row 4: Hourly pattern */}
                <HourlyChart/>
            </div>
        </div>
    )
}