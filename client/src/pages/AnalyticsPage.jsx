import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Brain, Zap, MapPin, Clock, Users, Activity,
    Target, AlertTriangle, CheckCircle, RefreshCw,
    ChevronRight, Layers, Cpu, Radio, Database,
    TrendingUp, Globe
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
    f400:    "#3a6a34",
    green:   "#1a6b4a",
    amber:   "#c07a0a",
    red:     "#b84c2e",
    cyan:    "#1a6b7a",
    purple:  "#5a3a8a",
    pink:    "#8a3a5a",
    s300:    "#7ab870",
}

const AI_INSIGHTS = [
    {
        id: 1, icon: Brain, color: T.accent,
        title: "Peak demand expected Thursday",
        desc: "AI predicts 34% surge in medical needs based on weather patterns and historical data.",
        confidence: 92, impact: "high", action: "Pre-position 8 medical volunteers",
    },
    {
        id: 2, icon: AlertTriangle, color: T.amber,
        title: "Unusual water scarcity in Zone B",
        desc: "3x normal water need reports in Ghatkopar — possible infrastructure failure.",
        confidence: 87, impact: "critical", action: "Alert water authority + deploy tankers",
    },
    {
        id: 3, icon: Target, color: T.green,
        title: "Volunteer routing optimized",
        desc: "AI re-routed 6 volunteers saving avg 47 min per assignment today.",
        confidence: 95, impact: "medium", action: "Applied automatically",
    },
    {
        id: 4, icon: TrendingUp, color: T.cyan,
        title: "Education need rising 22%",
        desc: "School season driving education need growth. Recommend pre-stocking supplies.",
        confidence: 89, impact: "medium", action: "Stock 200 education kits",
    },
]

// Heatmap zones — now uses card-friendly palette, no dark bg
const HEATMAP_ZONES = [
    { zone: "Dharavi",   x: 35, y: 30, intensity: 0.95, needs: 47, cat: "medical"   },
    { zone: "Bandra",    x: 60, y: 20, intensity: 0.6,  needs: 23, cat: "food"      },
    { zone: "Kurla",     x: 55, y: 45, intensity: 0.75, needs: 38, cat: "water"     },
    { zone: "Sion",      x: 30, y: 52, intensity: 0.55, needs: 19, cat: "shelter"   },
    { zone: "Andheri",   x: 70, y: 58, intensity: 0.5,  needs: 31, cat: "food"      },
    { zone: "Chembur",   x: 45, y: 70, intensity: 0.65, needs: 29, cat: "medical"   },
    { zone: "Ghatkopar", x: 75, y: 40, intensity: 0.85, needs: 43, cat: "water"     },
    { zone: "Mankhurd",  x: 80, y: 65, intensity: 0.4,  needs: 22, cat: "education" },
    { zone: "Goregaon",  x: 25, y: 38, intensity: 0.45, needs: 18, cat: "food"      },
]

const REAL_TIME = [
    { time: "14:32", event: "AI scored need #1847 — Medical · Dharavi · Urgency 5",         type: "score",    zone: "Dharavi"  },
    { time: "14:30", event: "Volunteer Priya M. matched to need #1845 in 2.3 sec",           type: "match",    zone: "Kurla"    },
    { time: "14:28", event: "Duplicate detected: #1844 merged with #1831",                   type: "dedup",    zone: "Andheri"  },
    { time: "14:25", event: "Critical alert: 3 simultaneous medical needs in Zone A",        type: "alert",    zone: "Zone A"   },
    { time: "14:22", event: "Batch of 5 needs scored — avg urgency 3.6",                    type: "batch",    zone: "Multiple" },
    { time: "14:18", event: "Volunteer Rahul S. completed task — 99% satisfaction",          type: "complete", zone: "Dharavi"  },
    { time: "14:15", event: "AI predicted surge — 4 extra volunteers pre-positioned",        type: "predict",  zone: "Kurla"    },
    { time: "14:10", event: "Zone Chembur water alert escalated to Level 3",                 type: "alert",    zone: "Chembur"  },
]

const MODEL_METRICS = [
    { label: "Urgency Prediction",   score: 96.8, color: T.accent  },
    { label: "Volunteer Matching",   score: 94.2, color: T.green   },
    { label: "Duplicate Detection",  score: 98.1, color: T.cyan    },
    { label: "Category Auto-tag",    score: 92.7, color: T.amber   },
    { label: "Zone Classification",  score: 95.5, color: T.pink    },
    { label: "ETA Prediction",       score: 89.3, color: T.purple  },
]

const HOURLY = [
    {h:"6am",v:5},{h:"8am",v:18},{h:"10am",v:32},{h:"12pm",v:41},
    {h:"2pm",v:38},{h:"4pm",v:45},{h:"6pm",v:52},{h:"8pm",v:29},
    {h:"10pm",v:14},{h:"12am",v:7},
]

const intensityToColor = (v) => {
    if (v > 0.85) return { fill: T.red,    alpha: "30" }
    if (v > 0.7)  return { fill: T.amber,  alpha: "35" }
    if (v > 0.55) return { fill: T.cyan,   alpha: "35" }
    return              { fill: T.s300,    alpha: "40" }
}

// Reusable card wrapper
const Card = ({ children, style = {} }) => (
    <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: "18px 20px", ...style,
    }}>{children}</div>
)

// Section header inside a card
const SH = ({ title, sub, icon: Icon, color = T.accent }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `${color}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <Icon size={13} style={{ color }} />
        </div>
        <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0 }}>{title}</p>
            {sub && <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{sub}</p>}
        </div>
    </div>
)

// Heatmap — light themed, no dark background
const LiveHeatmap = () => {
    const [hovered, setHovered] = useState(null)

    return (
        <Card>
            <SH title="Need Density Heatmap" sub="Real-time by zone" icon={Globe} color={T.cyan} />

            {/* Map area — light surface, no dark background */}
            <div style={{
                position: "relative", height: 220, borderRadius: 10, overflow: "hidden",
                background: T.surface, border: `1px solid ${T.border}`,
            }}>
                {/* SVG grid lines */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .3 }}>
                    {[20, 40, 60, 80].map(p => (
                        <g key={p}>
                            <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={T.faint} strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke={T.faint} strokeWidth="1" strokeDasharray="4 4" />
                        </g>
                    ))}
                </svg>

                {/* City label */}
                <p style={{
                    position: "absolute", bottom: 8, left: 10, color: T.muted,
                    fontSize: 9, fontWeight: 700, letterSpacing: ".12em",
                }}>MUMBAI</p>

                {/* Zone dots */}
                {HEATMAP_ZONES.map((dot, i) => {
                    const c = intensityToColor(dot.intensity)
                    const sz = dot.intensity * 50 + 16
                    return (
                        <div key={dot.zone} style={{
                            position: "absolute",
                            left: `${dot.x}%`, top: `${dot.y}%`,
                            transform: "translate(-50%,-50%)", zIndex: 2,
                        }}>
                            {/* Glow ring */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.6, 0.35] }}
                                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity }}
                                style={{
                                    position: "absolute",
                                    width: sz, height: sz, borderRadius: "50%",
                                    background: `${c.fill}${c.alpha}`,
                                    transform: "translate(-50%,-50%)",
                                    left: "50%", top: "50%",
                                }}
                            />
                            {/* Dot */}
                            <motion.div
                                whileHover={{ scale: 1.5 }}
                                onHoverStart={() => setHovered(i)}
                                onHoverEnd={() => setHovered(null)}
                                style={{
                                    width: 10, height: 10, borderRadius: "50%",
                                    background: c.fill, cursor: "pointer",
                                    border: `2px solid ${T.card}`,
                                    position: "relative", zIndex: 3,
                                }}
                            />
                            {/* Tooltip */}
                            <AnimatePresence>
                                {hovered === i && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        style={{
                                            position: "absolute", bottom: "calc(100% + 7px)",
                                            left: "50%", transform: "translateX(-50%)",
                                            whiteSpace: "nowrap",
                                            background: T.text, borderRadius: 8, padding: "6px 10px",
                                            fontSize: 10, color: "#fff", zIndex: 10, pointerEvents: "none",
                                        }}>
                                        <p style={{ fontWeight: 700, margin: "0 0 1px" }}>{dot.zone}</p>
                                        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>{dot.needs} needs · {dot.cat}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}

                {/* Legend */}
                <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 8 }}>
                    {[
                        { label: "Critical", color: T.red    },
                        { label: "High",     color: T.amber  },
                        { label: "Low",      color: T.s300   },
                    ].map(l => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.color }} />
                            <span style={{ fontSize: 8.5, color: T.muted, fontWeight: 600 }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

// AI Insights
const AIInsights = () => {
    const [expanded, setExpanded] = useState(null)
    const IMPACT_COLOR = { high: T.amber, critical: T.red, medium: T.cyan }

    return (
        <Card>
            <SH title="AI Predictions & Alerts" sub="Live intelligence" icon={Brain} color={T.accent} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {AI_INSIGHTS.map((ins, i) => (
                    <motion.div key={ins.id}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                onClick={() => setExpanded(expanded === ins.id ? null : ins.id)}
                                style={{
                                    borderRadius: 10, border: `1px solid ${ins.color}22`,
                                    background: `${ins.color}06`, cursor: "pointer", overflow: "hidden",
                                }}>
                        <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 7,
                                background: `${ins.color}18`, flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <ins.icon size={13} style={{ color: ins.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{ins.title}</p>
                                    <span style={{
                                        fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20,
                                        background: `${IMPACT_COLOR[ins.impact] || T.muted}18`,
                                        color: IMPACT_COLOR[ins.impact] || T.muted, flexShrink: 0,
                                    }}>{ins.impact}</span>
                                </div>
                                {/* Confidence bar */}
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <div style={{ flex: 1, height: 2, borderRadius: 1, background: T.faint, overflow: "hidden" }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${ins.confidence}%` }}
                                                    transition={{ delay: .2 + i * .07, duration: .5 }}
                                                    style={{ height: "100%", background: ins.color, borderRadius: 1 }} />
                                    </div>
                                    <span style={{ fontSize: 9.5, color: ins.color, fontWeight: 700, flexShrink: 0 }}>
                                        {ins.confidence}%
                                    </span>
                                </div>
                            </div>
                            <motion.div animate={{ rotate: expanded === ins.id ? 90 : 0 }}>
                                <ChevronRight size={13} style={{ color: T.muted, flexShrink: 0 }} />
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {expanded === ins.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} transition={{ duration: .18 }}>
                                    <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${ins.color}18`, paddingTop: 9 }}>
                                        <p style={{ fontSize: 11.5, color: T.muted, margin: "0 0 9px", lineHeight: 1.6 }}>{ins.desc}</p>
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: 7, padding: "7px 10px",
                                            borderRadius: 7, background: `${ins.color}10`, border: `1px solid ${ins.color}25`,
                                        }}>
                                            <Zap size={11} style={{ color: ins.color }} />
                                            <span style={{ fontSize: 11, fontWeight: 700, color: ins.color }}>
                                                Action: {ins.action}
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

// Real-time log
const RealTimeLog = () => {
    const [paused, setPaused] = useState(false)
    const TYPE_ICON = { score: "🤖", match: "🔗", dedup: "🔄", alert: "🚨", batch: "📦", complete: "✅", predict: "🧠" }
    const TYPE_COLOR = { score: T.accent, match: T.green, dedup: T.cyan, alert: T.red, batch: T.amber, complete: T.green, predict: T.accent }

    return (
        <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <SH title="AI Activity Log" sub="Live system events" icon={Radio} color={T.green} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <motion.div
                        animate={{ opacity: [1, .3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: T.s300 }}
                    />
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.s300 }}>Live</span>
                    <button onClick={() => setPaused(p => !p)}
                            style={{
                                marginLeft: 4, padding: "3px 8px", borderRadius: 6,
                                border: `1px solid ${T.border}`, background: "transparent",
                                color: T.muted, fontSize: 10, fontWeight: 600, cursor: "pointer",
                                fontFamily: "'DM Sans',sans-serif",
                            }}>{paused ? "Resume" : "Pause"}</button>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", maxHeight: 280, overflowY: "auto" }}>
                {REAL_TIME.map((item, i) => {
                    const icon = TYPE_ICON[item.type] || "🤖"
                    const color = TYPE_COLOR[item.type] || T.accent
                    return (
                        <div key={i} style={{
                            display: "flex", gap: 9, padding: "8px 0",
                            borderBottom: i < REAL_TIME.length - 1 ? `1px solid ${T.border}` : "none",
                        }}>
                            <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 11.5, color: T.text, fontWeight: 600, margin: "0 0 2px", lineHeight: 1.4 }}>
                                    {item.event}
                                </p>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <span style={{ fontSize: 9.5, color: T.muted, fontFamily: "monospace" }}>{item.time}</span>
                                    <span style={{ fontSize: 9.5, color, fontWeight: 700 }}>{item.zone}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

// Model performance
const ModelPerf = () => (
    <Card>
        <SH title="AI Model Performance" sub="Accuracy across all tasks" icon={Cpu} color={T.purple} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MODEL_METRICS.map((m, i) => (
                <motion.div key={m.label}
                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * .06 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{m.label}</span>
                        <span style={{ fontSize: 12, color: m.color, fontWeight: 800 }}>{m.score}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: T.faint, overflow: "hidden" }}>
                        <motion.div
                            initial={{ width: 0 }} animate={{ width: `${m.score}%` }}
                            transition={{ delay: .2 + i * .06, duration: .6, ease: "easeOut" }}
                            style={{ height: "100%", borderRadius: 3, background: m.color }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
        <div style={{
            marginTop: 14, padding: "10px 12px", borderRadius: 9,
            background: `${T.accent}10`, border: `1px solid ${T.accent}22`,
            display: "flex", alignItems: "center", gap: 8,
        }}>
            <Database size={12} style={{ color: T.accent, flexShrink: 0 }} />
            <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.text, margin: 0 }}>CivicPulse-v2.4</p>
                <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>Trained on 24,847 historical needs</p>
            </div>
        </div>
    </Card>
)

// Hourly bar chart
const HourlyChart = () => {
    const max = Math.max(...HOURLY.map(h => h.v))
    return (
        <Card>
            <SH title="Hourly Submission Pattern" sub="Today's activity by hour" icon={Clock} color={T.amber} />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
                {HOURLY.map((h, i) => (
                    <div key={h.h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <motion.div
                            initial={{ height: 0 }} animate={{ height: `${(h.v / max) * 100}%` }}
                            transition={{ delay: i * .04, duration: .5, ease: "easeOut" }}
                            style={{
                                width: "100%", borderRadius: "3px 3px 0 0",
                                background: `linear-gradient(180deg,${T.amber},${T.amber}70)`,
                                minHeight: 3,
                            }}
                        />
                        <span style={{ fontSize: 8.5, color: T.muted }}>{h.h}</span>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default function AnalyticsPage() {
    const [lastUpdate, setLastUpdate] = useState(new Date())

    useEffect(() => {
        const t = setInterval(() => setLastUpdate(new Date()), 30000)
        return () => clearInterval(t)
    }, [])

    return (
        <div style={{
            minHeight: "100vh", background: T.bg, color: T.text,
            fontFamily: "'DM Sans',sans-serif", padding: "28px 30px",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(90,120,99,0.3); border-radius: 2px; }
            `}</style>

            <div style={{ maxWidth: 1280, margin: "0 auto" }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                marginBottom: 24, flexWrap: "wrap", gap: 10,
                            }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 9,
                                background: `${T.accent}18`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Brain size={16} style={{ color: T.accent }} />
                            </div>
                            <h1 style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: "-.4px" }}>
                                AI Analytics
                            </h1>
                        </div>
                        <p style={{ fontSize: 12, color: T.muted, paddingLeft: 44 }}>
                            Last updated {lastUpdate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
                            borderRadius: 9, background: `${T.accent}12`, border: `1px solid ${T.accent}25`,
                        }}>
                            <motion.div animate={{ opacity: [1, .4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{ width: 6, height: 6, borderRadius: "50%", background: T.s300 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>AI Engine Active</span>
                        </div>
                        <button onClick={() => setLastUpdate(new Date())}
                                style={{
                                    display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                                    borderRadius: 9, border: `1px solid ${T.border}`, background: T.card,
                                    color: T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                    fontFamily: "'DM Sans',sans-serif",
                                }}>
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>
                </motion.div>

                {/* Top strip — 4 stats (not 5, avoids overflow) */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                    {[
                        { label: "Needs Today",    value: "127",  color: T.accent,  icon: Activity  },
                        { label: "Avg Match Time", value: "2.3s", color: T.cyan,    icon: Clock     },
                        { label: "Duplicates Cut", value: "23",   color: T.amber,   icon: Layers    },
                        { label: "AI Predictions", value: "8",    color: T.purple,  icon: Brain     },
                    ].map((s, i) => (
                        <motion.div key={s.label}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * .06 }}
                                    style={{
                                        background: T.card, border: `1px solid ${T.border}`,
                                        borderRadius: 12, padding: "14px 16px",
                                        display: "flex", alignItems: "center", gap: 10,
                                    }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: `${s.color}14`,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <s.icon size={14} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 20, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
                                <p style={{ fontSize: 10, color: T.muted, margin: "2px 0 0" }}>{s.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Row 2: Heatmap + Insights */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <LiveHeatmap />
                    <AIInsights />
                </div>

                {/* Row 3: Log + Model perf */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <RealTimeLog />
                    <ModelPerf />
                </div>

                {/* Row 4: Hourly */}
                <HourlyChart />
            </div>
        </div>
    )
}