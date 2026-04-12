import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
    BarChart3, TrendingUp, Download, MapPin, Users, Heart,
    Home, Droplets, BookOpen, Utensils, CheckCircle, Clock,
    Share2, FileText, PieChart, Activity, Zap, ChevronDown,
    Star, Target, Award, RefreshCw, ArrowUpRight, ArrowDownRight,
    Layers, Globe
} from "lucide-react"

const T = {
    bg:      "#eef2eb",
    surface: "#e2e8de",
    card:    "#ffffff",
    border:  "rgba(45,90,45,0.12)",
    text:    "#1a2e1a",
    muted:   "#5a7a5a",
    faint:   "#c8d8c4",
    accent:  "#2d5a2d",
    f300:    "#4a7a44",
    green:   "#1a6b4a",
    amber:   "#c07a0a",
    red:     "#b84c2e",
    purple:  "#5a3a8a",
    cyan:    "#1a6b7a",
    pink:    "#8a3a5a",
    s300:    "#7ab870",
}

const MONTHLY = [
    {m:"Jan",needs:45,resolved:38},{m:"Feb",needs:62,resolved:54},{m:"Mar",needs:78,resolved:71},
    {m:"Apr",needs:55,resolved:50},{m:"May",needs:89,resolved:82},{m:"Jun",needs:102,resolved:95},
    {m:"Jul",needs:88,resolved:84},{m:"Aug",needs:115,resolved:109},{m:"Sep",needs:94,resolved:91},
    {m:"Oct",needs:127,resolved:120},{m:"Nov",needs:108,resolved:103},{m:"Dec",needs:143,resolved:138},
]

const ZONE_DATA = [
    { zone: "Dharavi",   needs: 47, resolved: 41, color: T.red    },
    { zone: "Kurla",     needs: 38, resolved: 35, color: T.amber  },
    { zone: "Chembur",   needs: 29, resolved: 27, color: T.purple },
    { zone: "Ghatkopar", needs: 34, resolved: 32, color: T.cyan   },
    { zone: "Mankhurd",  needs: 22, resolved: 21, color: T.s300   },
    { zone: "Andheri",   needs: 31, resolved: 29, color: T.pink   },
]

const CAT_DATA = [
    { cat: "Medical",   count: 89, pct: 32, color: T.red,    icon: Heart    },
    { cat: "Food",      count: 74, pct: 27, color: T.amber,  icon: Utensils },
    { cat: "Water",     count: 52, pct: 19, color: T.cyan,   icon: Droplets },
    { cat: "Shelter",   count: 38, pct: 14, color: T.purple, icon: Home     },
    { cat: "Education", count: 22, pct: 8,  color: T.s300,   icon: BookOpen },
]

// KPI — 3+3 layout (two rows of 3) instead of broken 6-col
const KPI_ROW1 = [
    { label: "Total Needs",       value: "1,243", delta: "+18%", up: true,  icon: FileText, color: T.accent  },
    { label: "Resolution Rate",   value: "94.2%", delta: "+2.1%",up: true,  icon: Target,   color: T.green   },
    { label: "Avg Response",      value: "4.2h",  delta: "-0.8h",up: true,  icon: Clock,    color: T.amber   },
]
const KPI_ROW2 = [
    { label: "People Helped",     value: "8,432", delta: "+23%", up: true,  icon: Users,    color: T.purple  },
    { label: "Active Volunteers", value: "38",    delta: "+5",   up: true,  icon: Star,     color: T.cyan    },
    { label: "AI Accuracy",       value: "96.8%", delta: "+1.2%",up: true,  icon: Zap,      color: T.pink    },
]

const VOLUNTEERS_TOP = [
    { name: "Priya Mehta",  init: "PM", tasks: 47, score: 98, zone: "Dharavi",   color: T.s300   },
    { name: "Rahul Singh",  init: "RS", tasks: 43, score: 95, zone: "Kurla",     color: T.cyan   },
    { name: "Arjun Patil",  init: "AP", tasks: 39, score: 94, zone: "Andheri",   color: T.purple },
    { name: "Divya Nair",   init: "DN", tasks: 36, score: 91, zone: "Chembur",   color: T.amber  },
    { name: "Sneha Joshi",  init: "SJ", tasks: 31, score: 88, zone: "Ghatkopar", color: T.pink   },
]

// Animated number counter
const AnimNum = ({ value }) => {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    const [display, setDisplay] = useState("0")

    useEffect(() => {
        if (!inView) return
        const raw = value.replace(/[^0-9.]/g, "")
        const prefix = value.match(/[₹£$€]/)?.[0] || ""
        const suffix = value.match(/[%h]/)?.[0] || ""
        const num = parseFloat(raw)
        let cur = 0
        const dur = 1000, step = 14
        const inc = (num - cur) / (dur / step)
        const t = setInterval(() => {
            cur = Math.min(cur + inc, num)
            const rounded = cur >= 1000 ? Math.round(cur).toLocaleString() : cur.toFixed(cur < 10 ? 1 : 0)
            setDisplay(`${prefix}${rounded}${suffix}`)
            if (cur >= num) clearInterval(t)
        }, step)
        return () => clearInterval(t)
    }, [inView, value])

    return <span ref={ref}>{inView ? display : "0"}</span>
}

const Card = ({ children, style = {} }) => (
    <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: "18px 20px", ...style,
    }}>{children}</div>
)

const SectionHeader = ({ title, subtitle, icon: Icon, color = T.accent }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={13} style={{ color }} />
        </div>
        <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>{title}</p>
            {subtitle && <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{subtitle}</p>}
        </div>
    </div>
)

// Bar chart — stacked
const BarMini = ({ data, height = 110 }) => {
    const max = Math.max(...data.map(d => d.needs))
    return (
        <div style={{ height, display: "flex", alignItems: "flex-end", gap: 5, padding: "0 4px" }}>
            {data.map((d, i) => (
                <div key={d.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <motion.div
                        initial={{ height: 0 }} animate={{ height: `${(d.resolved / max) * 100}%` }}
                        transition={{ delay: i * .04, duration: .5, ease: "easeOut" }}
                        style={{ width: "100%", borderRadius: "3px 3px 0 0", background: T.green, minHeight: 2 }}
                    />
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${((d.needs - d.resolved) / max) * 100}%` }}
                        transition={{ delay: i * .04 + .1, duration: .5, ease: "easeOut" }}
                        style={{ width: "100%", borderRadius: "3px 3px 0 0", background: T.accent, minHeight: 1, marginTop: -3 }}
                    />
                    <span style={{ fontSize: 8.5, color: T.muted }}>{d.m}</span>
                </div>
            ))}
        </div>
    )
}

// Donut — fixed offset calculation
const DonutChart = ({ data, size = 130 }) => {
    const total = data.reduce((s, d) => s + d.count, 0)
    const r = 44, cx = 65, cy = 65, circ = 2 * Math.PI * r
    let cumPct = 0

    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <svg viewBox="0 0 130 130" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                {data.map((d, i) => {
                    const pct = d.count / total
                    const dashArr = `${pct * circ} ${circ}`
                    const dashOffset = -(cumPct * circ)
                    cumPct += pct
                    return (
                        <motion.circle key={d.cat}
                                       cx={cx} cy={cy} r={r}
                                       fill="none" stroke={d.color} strokeWidth={16}
                                       strokeDasharray={dashArr} strokeDashoffset={dashOffset}
                                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                       transition={{ delay: i * .08, duration: .4 }}
                        />
                    )
                })}
                <circle cx={cx} cy={cy} r={28} fill={T.card} />
            </svg>
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>{total}</p>
                <p style={{ fontSize: 9, color: T.muted, margin: 0, fontWeight: 700 }}>TOTAL</p>
            </div>
        </div>
    )
}

// Line chart
const LineChart = ({ data, height = 160 }) => {
    const w = 100, h = 100
    const max = Math.max(...data.map(d => d.needs))
    const needsPts  = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.needs    / max) * h}`).join(" ")
    const resolvedPts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.resolved / max) * h}`).join(" ")

    return (
        <div style={{ height, position: "relative" }}>
            <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                <polyline points={needsPts} fill="none" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={resolvedPts} fill="none" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * w
                    return (
                        <g key={i}>
                            <circle cx={x} cy={h - (d.needs    / max) * h} r="1.5" fill={T.accent} />
                            <circle cx={x} cy={h - (d.resolved / max) * h} r="1.5" fill={T.green} />
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}

// Export modal
const ExportModal = ({ onClose }) => {
    const [format, setFormat] = useState("pdf")
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const doExport = () => {
        setLoading(true)
        setTimeout(() => { setLoading(false); setDone(true) }, 2000)
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
                        zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                    }} onClick={onClose}>
            <motion.div initial={{ scale: .93, y: 16 }} animate={{ scale: 1, y: 0 }}
                        exit={{ scale: .93 }} onClick={e => e.stopPropagation()}
                        style={{
                            background: T.card, border: `1px solid ${T.border}`,
                            borderRadius: 18, padding: 22, width: "100%", maxWidth: 360,
                        }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>Export Report</p>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
                {done ? (
                    <div style={{ textAlign: "center", padding: "14px 0" }}>
                        <CheckCircle size={38} style={{ color: T.green, marginBottom: 10 }} />
                        <p style={{ fontSize: 14, fontWeight: 700, color: T.green, margin: "0 0 5px" }}>Exported successfully!</p>
                        <button onClick={onClose} style={{
                            marginTop: 12, padding: "9px 22px", borderRadius: 9, background: T.accent,
                            color: "#fff", fontWeight: 700, border: "none", cursor: "pointer",
                        }}>Done</button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
                            {[
                                { key: "pdf",   label: "PDF Report",      icon: FileText, desc: "Stakeholder-ready"    },
                                { key: "csv",   label: "CSV Data Export",  icon: BarChart3,desc: "Raw data for analysis" },
                                { key: "excel", label: "Excel Workbook",   icon: Layers,   desc: "Multi-sheet report"   },
                            ].map(f => (
                                <div key={f.key} onClick={() => setFormat(f.key)}
                                     style={{
                                         padding: "11px 13px", borderRadius: 9, cursor: "pointer",
                                         display: "flex", alignItems: "center", gap: 9,
                                         background: format === f.key ? `${T.accent}10` : "transparent",
                                         border: `1px solid ${format === f.key ? T.accent + "40" : T.border}`,
                                         transition: "all .15s",
                                     }}>
                                    <f.icon size={14} style={{ color: format === f.key ? T.accent : T.muted }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{f.label}</p>
                                        <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{f.desc}</p>
                                    </div>
                                    {format === f.key && <CheckCircle size={13} style={{ color: T.accent }} />}
                                </div>
                            ))}
                        </div>
                        <button onClick={doExport}
                                style={{
                                    width: "100%", padding: "11px", borderRadius: 10, border: "none",
                                    background: T.accent, color: "#dcebd6",
                                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    fontFamily: "'DM Sans',sans-serif",
                                }}>
                            {loading ? <><RefreshCw size={13} style={{ animation: "spin .8s linear infinite" }} /> Exporting...</>
                                : <><Download size={13} /> Export {format.toUpperCase()}</>}
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    )
}

// KPI card used in a 3-col grid
const KPICard = ({ k, i }) => (
    <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * .05 }}
        whileHover={{ y: -2, transition: { duration: .15 } }}
        style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 13, padding: "14px 16px",
        }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.icon size={13} style={{ color: k.color }} />
            </div>
            <span style={{
                fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 6,
                background: k.up ? "rgba(26,107,74,0.12)" : "rgba(184,85,71,0.12)",
                color: k.up ? T.green : T.red,
                display: "flex", alignItems: "center", gap: 2,
            }}>
                {k.up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />} {k.delta}
            </span>
        </div>
        <p style={{ fontSize: 22, fontWeight: 900, color: k.color, margin: "0 0 2px" }}>
            <AnimNum value={k.value} />
        </p>
        <p style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{k.label}</p>
    </motion.div>
)

export default function ReportsPage() {
    const [period, setPeriod] = useState("monthly")
    const [showExport, setShowExport] = useState(false)
    const [activeZone, setActiveZone] = useState(null)

    return (
        <div style={{
            minHeight: "100vh", background: T.bg, color: T.text,
            fontFamily: "'DM Sans',sans-serif", padding: "26px 30px",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(90,120,99,0.3); border-radius: 2px; }
            `}</style>

            <div style={{ maxWidth: 1280, margin: "0 auto" }}>

                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 24, flexWrap: "wrap", gap: 10,
                }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: "0 0 3px", letterSpacing: "-.4px" }}>
                            Impact Reports
                        </h1>
                        <p style={{ fontSize: 12, color: T.muted }}>Comprehensive analytics for stakeholders · Updated live</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {/* Period selector */}
                        <div style={{ display: "flex", gap: 3, padding: 3, borderRadius: 9, background: T.card, border: `1px solid ${T.border}` }}>
                            {["weekly", "monthly", "quarterly", "yearly"].map(p => (
                                <button key={p} onClick={() => setPeriod(p)}
                                        style={{
                                            padding: "6px 11px", borderRadius: 7, border: "none", cursor: "pointer",
                                            fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700,
                                            background: period === p ? T.accent : "transparent",
                                            color: period === p ? "#fff" : T.muted,
                                            transition: "all .15s", textTransform: "capitalize",
                                        }}>{p}</button>
                            ))}
                        </div>
                        <button onClick={() => setShowExport(true)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                                    borderRadius: 9, border: `1px solid ${T.accent}35`,
                                    background: `${T.accent}14`, color: T.accent,
                                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                }}>
                            <Download size={12} /> Export
                        </button>
                    </div>
                </div>

                {/* KPI — two rows of 3 instead of broken 6-col */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
                    {KPI_ROW1.map((k, i) => <KPICard key={k.label} k={k} i={i} />)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                    {KPI_ROW2.map((k, i) => <KPICard key={k.label} k={k} i={i + 3} />)}
                </div>

                {/* Row 3: Line chart + Donut */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
                    <Card>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <SectionHeader title="12-Month Trend" subtitle="Needs vs resolved" icon={TrendingUp} color={T.accent} />
                            <div style={{ display: "flex", gap: 12 }}>
                                {[{ label: "Needs", color: T.accent }, { label: "Resolved", color: T.green }].map(l => (
                                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <div style={{ width: 14, height: 2, borderRadius: 1, background: l.color }} />
                                        <span style={{ fontSize: 10.5, color: T.muted }}>{l.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <LineChart data={MONTHLY} height={160} />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                            {MONTHLY.map(d => <span key={d.m} style={{ fontSize: 8.5, color: T.muted }}>{d.m}</span>)}
                        </div>
                    </Card>

                    <Card>
                        <SectionHeader title="By Category" subtitle="Current period" icon={PieChart} color={T.purple} />
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <DonutChart data={CAT_DATA} />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                                {CAT_DATA.map(d => (
                                    <div key={d.cat}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: 11, color: T.text, fontWeight: 600 }}>{d.cat}</span>
                                            </div>
                                            <span style={{ fontSize: 11, color: T.muted }}>{d.pct}%</span>
                                        </div>
                                        <div style={{ height: 3, borderRadius: 2, background: T.faint, overflow: "hidden" }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${d.pct}%` }}
                                                        transition={{ duration: .7, delay: .2 }}
                                                        style={{ height: "100%", borderRadius: 2, background: d.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Row 4: Zone performance + Bar chart */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <Card>
                        <SectionHeader title="Zone Performance" subtitle="By geographic area" icon={MapPin} color={T.cyan} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {ZONE_DATA.map((z, i) => (
                                <motion.div key={z.zone}
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * .06 }}
                                            onClick={() => setActiveZone(activeZone === z.zone ? null : z.zone)}
                                            style={{
                                                padding: "9px 11px", borderRadius: 9, cursor: "pointer",
                                                background: activeZone === z.zone ? `${T.cyan}08` : "transparent",
                                                border: `1px solid ${activeZone === z.zone ? T.cyan + "35" : T.border}`,
                                                transition: "all .15s",
                                            }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                        <div style={{ width: 7, height: 7, borderRadius: 2, background: z.color, flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: T.text }}>{z.zone}</span>
                                        <span style={{ fontSize: 11, color: T.muted }}>{z.needs} needs</span>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                                            background: "rgba(26,107,74,0.12)", color: T.green,
                                        }}>{Math.round((z.resolved / z.needs) * 100)}%</span>
                                    </div>
                                    <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: T.faint, overflow: "hidden" }}>
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${(z.resolved / z.needs) * 100}%` }}
                                            transition={{ duration: .7, delay: i * .07 }}
                                            style={{ height: "100%", borderRadius: 2, background: z.color }} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <SectionHeader title="Monthly Volume" subtitle="Needs per month" icon={BarChart3} color={T.amber} />
                        <BarMini data={MONTHLY} height={150} />
                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                            {[{ label: "Resolved", color: T.green }, { label: "Pending", color: T.accent }].map(l => (
                                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: 2, background: l.color }} />
                                    <span style={{ fontSize: 10.5, color: T.muted }}>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Row 5: Leaderboard + Stakeholder summary */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Card>
                        <SectionHeader title="Volunteer Leaderboard" subtitle="Top performers" icon={Award} color={T.amber} />
                        {VOLUNTEERS_TOP.map((v, i) => (
                            <div key={v.name} style={{
                                display: "flex", alignItems: "center", gap: 9, padding: "9px 6px",
                                borderBottom: i < VOLUNTEERS_TOP.length - 1 ? `1px solid ${T.border}` : "none",
                            }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, width: 18,
                                    color: i === 0 ? T.amber : i === 1 ? "#9CA3AF" : i === 2 ? "#CD7F32" : T.muted,
                                }}>#{i + 1}</span>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 9, background: v.color,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10.5, fontWeight: 800, color: "#fff", flexShrink: 0,
                                }}>{v.init}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{v.name}</p>
                                    <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{v.zone}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>{v.tasks}</p>
                                    <p style={{ fontSize: 9, color: T.muted, margin: 0 }}>tasks</p>
                                </div>
                                <div style={{
                                    padding: "3px 8px", borderRadius: 6,
                                    background: `${v.color}20`, color: v.color,
                                    fontSize: 10, fontWeight: 700,
                                }}>{v.score}%</div>
                            </div>
                        ))}
                    </Card>

                    <Card>
                        <SectionHeader title="Stakeholder Summary" subtitle="Key metrics for reporting" icon={Globe} color={T.green} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            {[
                                { label: "Total beneficiaries reached",   value: "8,432",  color: T.green  },
                                { label: "Needs resolved within 24h",     value: "67.3%",  color: T.cyan   },
                                { label: "Volunteer hours contributed",   value: "2,847h", color: T.accent },
                                { label: "Cost saved vs manual ops",      value: "₹4.2L",  color: T.amber  },
                                { label: "AI matching accuracy",          value: "96.8%",  color: T.purple },
                                { label: "Duplicate needs prevented",     value: "142",    color: T.pink   },
                            ].map((row, i, arr) => (
                                <div key={row.label} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "9px 0",
                                    borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                                }}>
                                    <span style={{ fontSize: 12, color: T.muted }}>{row.label}</span>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: row.color }}>
                                        <AnimNum value={row.value} />
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowExport(true)}
                                style={{
                                    marginTop: 14, width: "100%", padding: "10px", borderRadius: 10, border: "none",
                                    background: T.green, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    fontFamily: "'DM Sans',sans-serif",
                                }}>
                            <Share2 size={12} /> Share Stakeholder Report
                        </button>
                    </Card>
                </div>
            </div>

            <AnimatePresence>
                {showExport && <ExportModal onClose={() => setShowExport(false)} />}
            </AnimatePresence>
        </div>
    )
}