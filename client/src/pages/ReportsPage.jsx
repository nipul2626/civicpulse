import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
    BarChart3, TrendingUp, TrendingDown, Download, Filter,
    Calendar, MapPin, Users, Heart, Home, Droplets, BookOpen,
    Utensils, CheckCircle, AlertTriangle, Clock, Eye, Share2,
    FileText, PieChart, Activity, Zap, ChevronDown, ChevronRight,
    Star, Target, Award, RefreshCw, ArrowUpRight, ArrowDownRight,
    Layers, Globe, Phone, Mail, Printer, ExternalLink
} from "lucide-react"

/* ── THEME ── */
const T={
    bg:"#000000",surface:"#bdf4c5",card:"#182019",border:"rgba(99,179,237,0.12)",
    text:"#F0F6FF",muted:"#6B8CAE",accent:"#3B82F6",green:"#10B981",
    amber:"#F59E0B",red:"#EF4444",purple:"#8B5CF6",cyan:"#06B6D4",
    pink:"#EC4899",
}

/* ── MOCK DATA ── */
const MONTHLY=[
    {m:"Jan",needs:45,resolved:38,volunteers:12},
    {m:"Feb",needs:62,resolved:54,volunteers:15},
    {m:"Mar",needs:78,resolved:71,volunteers:19},
    {m:"Apr",needs:55,resolved:50,volunteers:17},
    {m:"May",needs:89,resolved:82,volunteers:23},
    {m:"Jun",needs:102,resolved:95,volunteers:28},
    {m:"Jul",needs:88,resolved:84,volunteers:26},
    {m:"Aug",needs:115,resolved:109,volunteers:31},
    {m:"Sep",needs:94,resolved:91,volunteers:29},
    {m:"Oct",needs:127,resolved:120,volunteers:35},
    {m:"Nov",needs:108,resolved:103,volunteers:33},
    {m:"Dec",needs:143,resolved:138,volunteers:38},
]

const ZONE_DATA=[
    {zone:"Dharavi",    needs:47,resolved:41,volunteers:12,urgency:4.2,color:"#EF4444"},
    {zone:"Kurla",      needs:38,resolved:35,volunteers:9, urgency:3.8,color:"#F59E0B"},
    {zone:"Chembur",    needs:29,resolved:27,volunteers:8, urgency:3.5,color:"#8B5CF6"},
    {zone:"Ghatkopar",  needs:34,resolved:32,volunteers:10,urgency:3.1,color:"#06B6D4"},
    {zone:"Mankhurd",   needs:22,resolved:21,volunteers:7, urgency:2.8,color:"#10B981"},
    {zone:"Andheri",    needs:31,resolved:29,volunteers:9, urgency:3.3,color:"#EC4899"},
]

const CAT_DATA=[
    {cat:"Medical",   count:89, pct:32, color:"#EF4444", icon:Heart    },
    {cat:"Food",      count:74, pct:27, color:"#F59E0B", icon:Utensils },
    {cat:"Water",     count:52, pct:19, color:"#06B6D4", icon:Droplets },
    {cat:"Shelter",   count:38, pct:14, color:"#8B5CF6", icon:Home     },
    {cat:"Education", count:22, pct:8,  color:"#10B981", icon:BookOpen },
]

const VOLUNTEERS=[
    {name:"Priya Mehta",  init:"PM",tasks:47,score:98,zone:"Dharavi",  color:"#10B981"},
    {name:"Rahul Singh",  init:"RS",tasks:43,score:95,zone:"Kurla",    color:"#3B82F6"},
    {name:"Arjun Patil",  init:"AP",tasks:39,score:94,zone:"Andheri",  color:"#8B5CF6"},
    {name:"Divya Nair",   init:"DN",tasks:36,score:91,zone:"Chembur",  color:"#F59E0B"},
    {name:"Sneha Joshi",  init:"SJ",tasks:31,score:88,zone:"Ghatkopar",color:"#EC4899"},
]

const KPI=[
    {label:"Total Needs",      value:"1,243", delta:"+18%", up:true,  icon:FileText,  color:T.accent},
    {label:"Resolution Rate",  value:"94.2%", delta:"+2.1%",up:true,  icon:Target,    color:T.green },
    {label:"Avg Response",     value:"4.2h",  delta:"-0.8h",up:true,  icon:Clock,     color:T.amber },
    {label:"People Helped",    value:"8,432", delta:"+23%", up:true,  icon:Users,     color:T.purple},
    {label:"Active Volunteers",value:"38",    delta:"+5",   up:true,  icon:Star,      color:T.cyan  },
    {label:"AI Accuracy",      value:"96.8%", delta:"+1.2%",up:true,  icon:Zap,       color:T.pink  },
]

/* ── ANIMATED NUMBER ── */
const AnimNum = ({value,suffix=""}) => {
    const ref=useRef(null)
    const inView=useInView(ref,{once:true})
    const [display,setDisplay]=useState("0")

    useEffect(()=>{
        if(!inView)return
        const num=parseFloat(value.replace(/[^0-9.]/g,""))
        const prefix=value.match(/[^0-9.]/)?.[0]||""
        let start=0,end=num,dur=1200,step=16
        const inc=(end-start)/(dur/step)
        let cur=start
        const t=setInterval(()=>{
            cur=Math.min(cur+inc,end)
            setDisplay(`${prefix}${cur>=1000?Math.round(cur).toLocaleString():cur.toFixed(cur<10?1:0)}${suffix}`)
            if(cur>=end)clearInterval(t)
        },step)
        return()=>clearInterval(t)
    },[inView,value])

    return <span ref={ref}>{inView?display:"0"}</span>
}

/* ── MINI BAR CHART ── */
const BarMini = ({data,height=120}) => {
    const max=Math.max(...data.map(d=>d.needs))
    return (
        <div style={{height,display:"flex",alignItems:"flex-end",gap:6,padding:"0 4px"}}>
            {data.map((d,i)=>(
                <div key={d.m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <motion.div
                        initial={{height:0}} animate={{height:`${(d.resolved/max)*100}%`}}
                        transition={{delay:i*.04,duration:.6,ease:"easeOut"}}
                        style={{
                            width:"100%",borderRadius:"3px 3px 0 0",
                            background:`linear-gradient(180deg,${T.green},${T.green}88)`,
                            minHeight:3,
                        }}
                    />
                    <motion.div
                        initial={{height:0}}
                        animate={{height:`${((d.needs-d.resolved)/max)*100}%`}}
                        transition={{delay:i*.04+.1,duration:.6,ease:"easeOut"}}
                        style={{
                            width:"100%",borderRadius:"3px 3px 0 0",
                            background:`linear-gradient(180deg,${T.accent},${T.accent}88)`,
                            minHeight:2,marginTop:-4,
                        }}
                    />
                    <span style={{fontSize:9,color:T.muted,fontWeight:600}}>{d.m}</span>
                </div>
            ))}
        </div>
    )
}

/* ── DONUT CHART ── */
const DonutChart = ({data,size=140}) => {
    const total=data.reduce((s,d)=>s+d.count,0)
    let offset=0
    const r=45,cx=70,cy=70,circumference=2*Math.PI*r

    return (
        <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
            <svg viewBox="0 0 140 140" style={{width:"100%",height:"100%",transform:"rotate(-90deg)"}}>
                {data.map((d,i)=>{
                    const pct=d.count/total
                    const dashArray=`${pct*circumference} ${circumference}`
                    const dashOffset=-offset*circumference
                    offset+=pct
                    return (
                        <motion.circle key={d.cat}
                                       cx={cx} cy={cy} r={r}
                                       fill="none" stroke={d.color}
                                       strokeWidth={18}
                                       strokeDasharray={dashArray}
                                       strokeDashoffset={dashOffset}
                                       initial={{opacity:0}} animate={{opacity:1}}
                                       transition={{delay:i*.1,duration:.5}}
                        />
                    )
                })}
                <circle cx={cx} cy={cy} r={32} fill={T.card}/>
            </svg>
            <div style={{
                position:"absolute",inset:0,
                display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",
            }}>
                <p style={{fontSize:20,fontWeight:900,color:T.text,margin:0}}>{total}</p>
                <p style={{fontSize:9,color:T.muted,margin:0,fontWeight:700}}>TOTAL</p>
            </div>
        </div>
    )
}

/* ── LINE CHART SVG ── */
const LineChart = ({data,height=160}) => {
    const w=100,h=100
    const max=Math.max(...data.map(d=>d.needs))
    const needsPts=data.map((d,i)=>`${(i/(data.length-1))*w},${h-(d.needs/max)*h}`).join(" ")
    const resolvedPts=data.map((d,i)=>`${(i/(data.length-1))*w},${h-(d.resolved/max)*h}`).join(" ")

    return (
        <div style={{height,position:"relative"}}>
            <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
                 style={{width:"100%",height:"100%",overflow:"visible"}}>
                <defs>
                    <linearGradient id="gNeeds" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.accent} stopOpacity=".3"/>
                        <stop offset="100%" stopColor={T.accent} stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.green} stopOpacity=".3"/>
                        <stop offset="100%" stopColor={T.green} stopOpacity="0"/>
                    </linearGradient>
                </defs>
                <polygon points={`0,${h} ${needsPts} ${w},${h}`} fill="url(#gNeeds)"/>
                <polygon points={`0,${h} ${resolvedPts} ${w},${h}`} fill="url(#gResolved)"/>
                <polyline points={needsPts} fill="none" stroke={T.accent} strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points={resolvedPts} fill="none" stroke={T.green} strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2"/>
                {data.map((d,i)=>{
                    const x=(i/(data.length-1))*w
                    const y1=h-(d.needs/max)*h
                    const y2=h-(d.resolved/max)*h
                    return (
                        <g key={i}>
                            <circle cx={x} cy={y1} r="1.5" fill={T.accent}/>
                            <circle cx={x} cy={y2} r="1.5" fill={T.green}/>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}

/* ── SECTION HEADER ── */
const SectionHeader = ({title,subtitle,icon:Icon,color=T.accent}) => (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{
            width:32,height:32,borderRadius:9,
            background:`${color}20`,
            display:"flex",alignItems:"center",justifyContent:"center",
        }}>
            <Icon size={15} style={{color}}/>
        </div>
        <div>
            <p style={{fontSize:14,fontWeight:800,color:T.text,margin:0}}>{title}</p>
            {subtitle && <p style={{fontSize:10,color:T.muted,margin:0}}>{subtitle}</p>}
        </div>
    </div>
)

/* ── CARD WRAPPER ── */
const Card = ({children,style={}}) => (
    <div style={{
        background:T.card,border:`1px solid ${T.border}`,
        borderRadius:16,padding:"20px",
        ...style,
    }}>{children}</div>
)

/* ── EXPORT MODAL ── */
const ExportModal = ({onClose}) => {
    const [format,setFormat]=useState("pdf")
    const [exporting,setExporting]=useState(false)
    const [done,setDone]=useState(false)

    const doExport=()=>{
        setExporting(true)
        setTimeout(()=>{setExporting(false);setDone(true)},2000)
    }

    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    style={{
                        position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",
                        backdropFilter:"blur(10px)",zIndex:500,
                        display:"flex",alignItems:"center",justifyContent:"center",padding:20,
                    }}
                    onClick={onClose}>
            <motion.div initial={{scale:.9,y:20}} animate={{scale:1,y:0}}
                        exit={{scale:.9,y:20}} onClick={e=>e.stopPropagation()}
                        style={{
                            background:T.card,border:`1px solid ${T.border}`,
                            borderRadius:20,padding:24,width:"100%",maxWidth:380,
                            boxShadow:"0 40px 100px rgba(0,0,0,0.5)",
                        }}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
                    <p style={{fontSize:15,fontWeight:800,color:T.text,margin:0}}>Export Report</p>
                    <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer"}}>✕</button>
                </div>
                {done ? (
                    <div style={{textAlign:"center",padding:"16px 0"}}>
                        <CheckCircle size={40} style={{color:T.green,marginBottom:12}}/>
                        <p style={{fontSize:14,fontWeight:700,color:T.green,margin:"0 0 6px"}}>Report exported!</p>
                        <p style={{fontSize:12,color:T.muted,margin:"0 0 16px"}}>Your report has been prepared for download.</p>
                        <button onClick={onClose} style={{
                            padding:"9px 24px",borderRadius:10,background:T.accent,
                            color:"#fff",fontWeight:700,border:"none",cursor:"pointer",
                        }}>Done</button>
                    </div>
                ) : (
                    <>
                        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                            {[
                                {key:"pdf",   label:"PDF Report",        icon:FileText, desc:"Stakeholder-ready document"},
                                {key:"csv",   label:"CSV Data Export",   icon:BarChart3,desc:"Raw data for analysis"},
                                {key:"excel", label:"Excel Workbook",    icon:Layers,   desc:"Multi-sheet detailed report"},
                            ].map(f=>(
                                <motion.div key={f.key} whileHover={{x:2}} onClick={()=>setFormat(f.key)}
                                            style={{
                                                padding:"12px 14px",borderRadius:10,cursor:"pointer",
                                                display:"flex",alignItems:"center",gap:10,
                                                background: format===f.key ? `${T.accent}15` : "rgba(255,255,255,0.03)",
                                                border:`1px solid ${format===f.key ? T.accent+"50" : T.border}`,
                                                transition:"all .15s",
                                            }}>
                                    <f.icon size={16} style={{color: format===f.key ? T.accent : T.muted}}/>
                                    <div>
                                        <p style={{fontSize:12,fontWeight:700,color:T.text,margin:0}}>{f.label}</p>
                                        <p style={{fontSize:10,color:T.muted,margin:0}}>{f.desc}</p>
                                    </div>
                                    {format===f.key && <CheckCircle size={14} style={{color:T.accent,marginLeft:"auto"}}/>}
                                </motion.div>
                            ))}
                        </div>
                        <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}}
                                       onClick={doExport}
                                       style={{
                                           width:"100%",padding:"11px",borderRadius:12,border:"none",
                                           background:`linear-gradient(135deg,${T.accent},${T.purple})`,
                                           color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",
                                           display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                                       }}>
                            {exporting
                                ? <><RefreshCw size={13} style={{animation:"spin 1s linear infinite"}}/> Exporting...</>
                                : <><Download size={13}/> Export {format.toUpperCase()}</>
                            }
                        </motion.button>
                    </>
                )}
            </motion.div>
        </motion.div>
    )
}

/* ── MAIN ── */
export default function ReportsPage() {
    const [period,setPeriod]=useState("monthly")
    const [showExport,setShowExport]=useState(false)
    const [activeZone,setActiveZone]=useState(null)

    return (
        <div style={{
            minHeight:"100vh",background:T.bg,color:T.text,
            fontFamily:"'DM Sans',sans-serif",padding:"28px 32px",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px}
      `}</style>

            <div style={{maxWidth:1300,margin:"0 auto"}}>

                {/* Header */}
                <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}
                            style={{
                                display:"flex",alignItems:"center",justifyContent:"space-between",
                                marginBottom:28,flexWrap:"wrap",gap:12,
                            }}>
                    <div>
                        <h1 style={{fontSize:26,fontWeight:900,color:T.text,margin:"0 0 4px",letterSpacing:"-.5px"}}>
                            Impact Reports
                        </h1>
                        <p style={{fontSize:13,color:T.muted,fontWeight:500}}>
                            Comprehensive analytics for stakeholders · Updated live
                        </p>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                        {/* Period select */}
                        <div style={{display:"flex",gap:4,padding:4,borderRadius:10,
                            background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`}}>
                            {["weekly","monthly","quarterly","yearly"].map(p=>(
                                <motion.button key={p} whileTap={{scale:.95}}
                                               onClick={()=>setPeriod(p)}
                                               style={{
                                                   padding:"6px 12px",borderRadius:7,border:"none",cursor:"pointer",
                                                   fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,
                                                   background: period===p ? T.accent : "transparent",
                                                   color: period===p ? "#fff" : T.muted,
                                                   transition:"all .15s",
                                                   textTransform:"capitalize",
                                               }}>{p}</motion.button>
                            ))}
                        </div>
                        <motion.button whileHover={{scale:1.03}} whileTap={{scale:.97}}
                                       onClick={()=>setShowExport(true)}
                                       style={{
                                           display:"flex",alignItems:"center",gap:6,padding:"8px 16px",
                                           borderRadius:10,border:`1px solid ${T.accent}40`,
                                           background:`${T.accent}20`,color:T.accent,
                                           fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                                       }}>
                            <Download size={13}/> Export
                        </motion.button>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginBottom:20}}>
                    {KPI.map((k,i)=>(
                        <motion.div key={k.label}
                                    initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
                                    transition={{delay:i*.06}}
                                    whileHover={{y:-3,borderColor:`${k.color}40`}}
                                    style={{
                                        background:T.card,border:`1px solid ${T.border}`,
                                        borderRadius:14,padding:"16px",cursor:"default",
                                        transition:"border-color .2s",
                                    }}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                                <div style={{
                                    width:30,height:30,borderRadius:8,
                                    background:`${k.color}20`,
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                }}>
                                    <k.icon size={14} style={{color:k.color}}/>
                                </div>
                                <span style={{
                                    fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:6,
                                    background: k.up ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                                    color: k.up ? T.green : T.red,
                                    display:"flex",alignItems:"center",gap:2,
                                }}>
                  {k.up ? <ArrowUpRight size={9}/> : <ArrowDownRight size={9}/>}
                                    {k.delta}
                </span>
                            </div>
                            <p style={{fontSize:20,fontWeight:900,color:k.color,margin:"0 0 2px"}}>
                                <AnimNum value={k.value}/>
                            </p>
                            <p style={{fontSize:10,color:T.muted,fontWeight:600}}>{k.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Row 2: Line chart + Donut */}
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>

                    {/* Line chart */}
                    <Card>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                            <SectionHeader title="12-Month Trend" subtitle="Needs reported vs resolved" icon={TrendingUp} color={T.accent}/>
                            <div style={{display:"flex",gap:14}}>
                                {[{label:"Needs",color:T.accent},{label:"Resolved",color:T.green}].map(l=>(
                                    <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}>
                                        <div style={{width:16,height:2,borderRadius:1,background:l.color}}/>
                                        <span style={{fontSize:11,color:T.muted}}>{l.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <LineChart data={MONTHLY} height={180}/>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                            {MONTHLY.map(d=>(
                                <span key={d.m} style={{fontSize:9,color:T.muted}}>{d.m}</span>
                            ))}
                        </div>
                    </Card>

                    {/* Donut + breakdown */}
                    <Card>
                        <SectionHeader title="By Category" subtitle="Current period distribution" icon={PieChart} color={T.purple}/>
                        <div style={{display:"flex",alignItems:"center",gap:16}}>
                            <DonutChart data={CAT_DATA}/>
                            <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                                {CAT_DATA.map(d=>(
                                    <div key={d.cat}>
                                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                                                <div style={{width:6,height:6,borderRadius:2,background:d.color,flexShrink:0}}/>
                                                <span style={{fontSize:11,color:T.text,fontWeight:600}}>{d.cat}</span>
                                            </div>
                                            <span style={{fontSize:11,color:T.muted}}>{d.pct}%</span>
                                        </div>
                                        <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                                            <motion.div initial={{width:0}} animate={{width:`${d.pct}%`}}
                                                        transition={{duration:.8,delay:.2}}
                                                        style={{height:"100%",borderRadius:2,background:d.color}}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Row 3: Zone heatmap + Bar chart */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>

                    {/* Zone table */}
                    <Card>
                        <SectionHeader title="Zone Performance" subtitle="Needs by geographic area" icon={MapPin} color={T.cyan}/>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                            {ZONE_DATA.map((z,i)=>(
                                <motion.div key={z.zone}
                                            initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
                                            transition={{delay:i*.06}}
                                            whileHover={{background:"rgba(255,255,255,0.04)",x:2}}
                                            onClick={()=>setActiveZone(activeZone===z.zone?null:z.zone)}
                                            style={{
                                                padding:"10px 12px",borderRadius:10,cursor:"pointer",
                                                background: activeZone===z.zone ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.02)",
                                                border:`1px solid ${activeZone===z.zone ? T.cyan+"40" : T.border}`,
                                                transition:"all .15s",
                                            }}>
                                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                                        <div style={{width:8,height:8,borderRadius:2,background:z.color,flexShrink:0}}/>
                                        <span style={{flex:1,fontSize:12,fontWeight:700,color:T.text}}>{z.zone}</span>
                                        <div style={{display:"flex",gap:12,alignItems:"center"}}>
                                            <span style={{fontSize:11,color:T.muted}}>{z.needs} needs</span>
                                            <span style={{
                                                fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,
                                                background:"rgba(16,185,129,0.15)",color:T.green,
                                            }}>
                        {Math.round((z.resolved/z.needs)*100)}%
                      </span>
                                        </div>
                                    </div>
                                    <div style={{marginTop:7,height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                                        <motion.div
                                            initial={{width:0}} animate={{width:`${(z.resolved/z.needs)*100}%`}}
                                            transition={{duration:.8,delay:i*.08}}
                                            style={{height:"100%",borderRadius:2,background:z.color}}/>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>

                    {/* Monthly bar chart */}
                    <Card>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                            <SectionHeader title="Monthly Volume" subtitle="Needs reported per month" icon={BarChart3} color={T.amber}/>
                        </div>
                        <BarMini data={MONTHLY} height={160}/>
                        <div style={{display:"flex",gap:14,marginTop:10}}>
                            {[
                                {label:"Resolved",color:T.green},
                                {label:"Pending", color:T.accent},
                            ].map(l=>(
                                <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}>
                                    <div style={{width:8,height:8,borderRadius:2,background:l.color}}/>
                                    <span style={{fontSize:11,color:T.muted}}>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Row 4: Volunteer leaderboard + Impact summary */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

                    {/* Leaderboard */}
                    <Card>
                        <SectionHeader title="Volunteer Leaderboard" subtitle="Top performers this period" icon={Award} color={T.amber}/>
                        <div style={{display:"flex",flexDirection:"column",gap:0}}>
                            {VOLUNTEERS.map((v,i)=>(
                                <motion.div key={v.name}
                                            initial={{opacity:0,x:10}} animate={{opacity:1,x:0}}
                                            transition={{delay:i*.07}}
                                            whileHover={{background:"rgba(255,255,255,0.04)"}}
                                            style={{
                                                display:"flex",alignItems:"center",gap:10,
                                                padding:"10px 8px",borderRadius:9,
                                                borderBottom: i<VOLUNTEERS.length-1?`1px solid ${T.border}`:"none",
                                                cursor:"pointer",transition:"background .15s",
                                            }}>
                  <span style={{
                      fontSize:11,fontWeight:700,width:18,
                      color: i===0?T.amber:i===1?"#9CA3AF":i===2?"#CD7F32":T.muted,
                  }}>#{i+1}</span>
                                    <div style={{
                                        width:34,height:34,borderRadius:10,background:v.color,
                                        display:"flex",alignItems:"center",justifyContent:"center",
                                        fontSize:11,fontWeight:900,color:"#fff",flexShrink:0,
                                    }}>{v.init}</div>
                                    <div style={{flex:1,minWidth:0}}>
                                        <p style={{fontSize:12,fontWeight:700,color:T.text,margin:0}}>{v.name}</p>
                                        <p style={{fontSize:10,color:T.muted,margin:0}}>{v.zone}</p>
                                    </div>
                                    <div style={{textAlign:"right"}}>
                                        <p style={{fontSize:13,fontWeight:800,color:T.text,margin:0}}>{v.tasks}</p>
                                        <p style={{fontSize:9,color:T.muted,margin:0}}>tasks</p>
                                    </div>
                                    <div style={{
                                        padding:"3px 8px",borderRadius:6,
                                        background:`${v.color}20`,color:v.color,
                                        fontSize:10,fontWeight:700,
                                    }}>{v.score}%</div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>

                    {/* Stakeholder summary */}
                    <Card>
                        <SectionHeader title="Stakeholder Summary" subtitle="Key metrics for reporting" icon={Globe} color={T.green}/>
                        <div style={{display:"flex",flexDirection:"column",gap:10}}>
                            {[
                                {label:"Total beneficiaries reached",    value:"8,432",    color:T.green  },
                                {label:"Needs resolved within 24h",      value:"67.3%",    color:T.cyan   },
                                {label:"Volunteer hours contributed",    value:"2,847h",   color:T.accent },
                                {label:"Cost saved vs manual ops",       value:"₹4.2L",    color:T.amber  },
                                {label:"AI matching accuracy",           value:"96.8%",    color:T.purple },
                                {label:"Duplicate needs prevented",      value:"142",      color:T.pink   },
                            ].map((row,i)=>(
                                <motion.div key={row.label}
                                            initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
                                            transition={{delay:i*.05}}
                                            style={{
                                                display:"flex",alignItems:"center",justifyContent:"space-between",
                                                padding:"8px 0",
                                                borderBottom:`1px solid ${T.border}`,
                                            }}>
                                    <span style={{fontSize:12,color:T.muted,fontWeight:500}}>{row.label}</span>
                                    <span style={{
                                        fontSize:14,fontWeight:800,color:row.color,
                                        fontFamily:"'DM Mono',monospace",
                                    }}>
                    <AnimNum value={row.value}/>
                  </span>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}}
                                       onClick={()=>setShowExport(true)}
                                       style={{
                                           marginTop:16,width:"100%",padding:"11px",borderRadius:12,border:"none",
                                           background:`linear-gradient(135deg,${T.green}cc,${T.cyan}cc)`,
                                           color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",
                                           display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                                           fontFamily:"'DM Sans',sans-serif",
                                       }}>
                            <Share2 size={13}/> Share Stakeholder Report
                        </motion.button>
                    </Card>
                </div>
            </div>

            <AnimatePresence>
                {showExport && <ExportModal onClose={()=>setShowExport(false)}/>}
            </AnimatePresence>
        </div>
    )
}