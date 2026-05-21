import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
    LayoutDashboard, Map, CheckSquare, Users, Heart,
    ClipboardList, BarChart2, Settings,
    Zap, ChevronLeft, Brain, RefreshCw, Award
} from "lucide-react";

// ─── Theme ─────────────────────────────────────────────────────────────────────
const ThemeCtx = React.createContext({ dark: false, toggle: () => {} });

const TK = {
    light: {
        bg: "#eef2eb", card: "#ffffff",
        border: "rgba(45,90,45,0.12)", text: "#1a2e1a", muted: "#5a7a5a", accent: "#2d5a2d",
        amber: "#c07a0a", green: "#1a6b4a", blue: "#1a4a8a", purple: "#5a3a8a", cyan: "#1a6b7a",
    },
    dark: {
        bg: "#0a0f08", card: "#1c2a18",
        border: "rgba(120,180,80,0.12)", text: "#edf5e0", muted: "#7a9b6a", accent: "#78b450",
        amber: "#e8a020", green: "#2dc9a0", blue: "#4a9fce", purple: "#9b7cf8", cyan: "#3ec9b0",
    }
};

// ─── EXACT Dashboard Sidebar ───────────────────────────────────────────────────
const NAV = [
    { icon: LayoutDashboard, label: "Dashboard",  path: "/dashboard",  ic: "#e8734a" },
    { icon: Map,             label: "Heatmap",     path: "/heatmap",    ic: "#4a9fce" },
    { icon: CheckSquare,     label: "Task Board",  path: "/tasks",      ic: "#2dc9a0" },
    { icon: Users,           label: "Volunteers",  path: "/volunteers", ic: "#9b7cf8" },
    { icon: Heart,           label: "Survey",      path: "/survey",     ic: "#e05a7a" },
    { icon: ClipboardList,   label: "Reports",     path: "/reports",    ic: "#c07a0a" },
    { icon: BarChart2,       label: "Analytics",   path: "/analytics",  ic: "#4a9fce", active: true },
    { icon: Settings,        label: "Settings",    path: "/settings",   ic: "#7a9b6a" },
];

function Sidebar({ exp, onToggle }) {
    const { dark, toggle } = useContext(ThemeCtx);
    return (
        <motion.aside
            animate={{ width: exp ? 220 : 68 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            style={{
                background: "#eef2eb",
                borderRight: "1px solid rgba(45,90,45,0.10)",
                height: "100vh", position: "fixed", left: 0, top: 0,
                overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 100,
            }}
        >
            {/* Logo */}
            <div style={{ padding: "18px 14px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(45,90,45,0.08)", flexShrink: 0 }}>
                <div style={{ width: 34, height: 34, background: "#1a2e1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Zap size={18} color="#fff" fill="#fff" />
                </div>
                {exp && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#1a2e1a", fontFamily: "DM Sans, sans-serif", lineHeight: 1.1 }}>CivicPulse</div>
                        <div style={{ fontSize: 10, color: "#5a7a5a", fontFamily: "DM Sans, sans-serif", marginTop: 1 }}>NGO Dashboard</div>
                    </motion.div>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
                {NAV.map(item => {
                    const Icon = item.icon;
                    return (
                        <motion.a key={item.path} href={item.path}
                                  whileHover={{ backgroundColor: "rgba(45,90,45,0.06)" }}
                                  style={{
                                      display: "flex", alignItems: "center",
                                      gap: 11, padding: exp ? "9px 10px" : "9px 0",
                                      justifyContent: exp ? "flex-start" : "center",
                                      borderRadius: 8, textDecoration: "none", marginBottom: 2,
                                      position: "relative",
                                      background: item.active ? "rgba(45,90,45,0.08)" : "transparent",
                                      transition: "background 0.15s",
                                  }}
                        >
                            {item.active && <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, background: "#2d5a2d", borderRadius: "0 3px 3px 0" }} />}
                            <div style={{
                                width: 28, height: 28, borderRadius: 7,
                                background: item.active ? `${item.ic}22` : "rgba(45,90,45,0.07)",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <Icon size={15} color={item.active ? item.ic : "#5a7a5a"} />
                            </div>
                            {exp && <span style={{ fontSize: 13.5, fontWeight: item.active ? 700 : 500, color: item.active ? "#1a2e1a" : "#4a6a4a", fontFamily: "DM Sans, sans-serif", whiteSpace: "nowrap" }}>{item.label}</span>}
                        </motion.a>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div style={{ padding: "10px 10px 14px", borderTop: "1px solid rgba(45,90,45,0.08)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", marginBottom: 8 }}>
                    <motion.button onClick={toggle} style={{
                        width: 44, height: 24, borderRadius: 999,
                        background: dark ? "linear-gradient(90deg,#1a1a3a,#0a0a1a)" : "linear-gradient(90deg,#f0c040,#87ceeb)",
                        border: "none", cursor: "pointer", position: "relative", padding: 0, flexShrink: 0,
                    }}>
                        <motion.div animate={{ x: dark ? 22 : 2 }} transition={{ type: "spring", stiffness: 450, damping: 28 }}
                                    style={{ width: 20, height: 20, borderRadius: "50%", background: dark ? "#c8c8d8" : "#fff", position: "absolute", top: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                    </motion.button>
                    {exp && <span style={{ fontSize: 12.5, fontWeight: 500, color: "#4a6a4a", fontFamily: "DM Sans, sans-serif", whiteSpace: "nowrap" }}>{dark ? "Dark Mode" : "Light Mode"}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 8px", background: "rgba(45,90,45,0.06)", borderRadius: 10, marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#2d5a2d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>RS</div>
                    {exp && <div><div style={{ fontSize: 12.5, fontWeight: 700, color: "#1a2e1a", fontFamily: "DM Sans, sans-serif" }}>Riya Sharma</div><div style={{ fontSize: 10.5, color: "#5a7a5a", fontFamily: "DM Sans, sans-serif" }}>Coordinator</div></div>}
                </div>
                <motion.button onClick={onToggle} whileHover={{ backgroundColor: "rgba(45,90,45,0.08)" }}
                               style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", width: "100%" }}>
                    <motion.div animate={{ rotate: exp ? 0 : 180 }} transition={{ duration: 0.3 }}>
                        <ChevronLeft size={15} color="#5a7a5a" />
                    </motion.div>
                    {exp && <span style={{ fontSize: 12.5, fontWeight: 500, color: "#4a6a4a", fontFamily: "DM Sans, sans-serif" }}>Collapse</span>}
                </motion.button>
            </div>
        </motion.aside>
    );
}

// ─── UI Components ─────────────────────────────────────────────────────────────
function PillToggle({ options, value, onChange }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const idx = options.indexOf(value);
    return (
        <div style={{ position: "relative", background: dark ? "#1c2a18" : "#e2e8de", borderRadius: 999, padding: 4, display: "flex", border: `1px solid ${t.border}` }}>
            <motion.div animate={{ x: `${idx * 100}%` }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ position: "absolute", top: 4, left: 4, width: `calc(${100 / options.length}% - ${8 / options.length}px)`, height: "calc(100% - 8px)", background: "#2d5a2d", borderRadius: 999 }} />
            {options.map(opt => (
                <button key={opt} onClick={() => onChange(opt)} style={{
                    position: "relative", zIndex: 1, background: "transparent", border: "none",
                    borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 600,
                    fontFamily: "DM Sans, sans-serif", cursor: "pointer",
                    color: value === opt ? "#fff" : t.muted, transition: "color 0.3s", flex: 1, whiteSpace: "nowrap",
                }}>{opt}</button>
            ))}
        </div>
    );
}

function NotifCard({ color = "#4a9fce", title, children, tag }) {
    const { dark } = useContext(ThemeCtx);
    const tagC = { critical: "#e05a3a", warning: "#e8a020", info: "#4a9fce", trend: "#9b7cf8" };
    return (
        <motion.div whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${color}25` }}
                    style={{ background: dark ? "#18181b" : "#fff", borderRadius: 11, overflow: "hidden", border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(45,90,45,0.12)", display: "flex", height: "100%" }}>
            <div style={{ width: 4, flexShrink: 0, background: `linear-gradient(180deg,${color},${color}55)` }} />
            <div style={{ padding: "12px 14px", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <div style={{ color, fontSize: 12, fontWeight: 700, fontFamily: "DM Sans, sans-serif" }}>{title}</div>
                    {tag && <span style={{ background: `${tagC[tag]}20`, color: tagC[tag], fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, marginLeft: 6 }}>{tag}</span>}
                </div>
                <div style={{ color: dark ? "#99999d" : "#5a7a5a", fontSize: 11.5, lineHeight: 1.5, fontFamily: "DM Sans, sans-serif" }}>{children}</div>
                <div style={{ marginTop: 8 }}>
                    <span style={{ color, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Take action →</span>
                </div>
            </div>
        </motion.div>
    );
}

function useCountUp(n, dur = 1100) {
    const [v, setV] = useState(0);
    useEffect(() => {
        const s = Date.now();
        const id = setInterval(() => {
            const p = Math.min((Date.now() - s) / dur, 1);
            setV(Math.round((1 - Math.pow(1 - p, 3)) * n));
            if (p >= 1) clearInterval(id);
        }, 16);
        return () => clearInterval(id);
    }, [n]);
    return v;
}

function Ring({ value, color, label, size = 88 }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const r = size / 2 - 7;
    const c = 2 * Math.PI * r;
    const counted = useCountUp(value);
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ position: "relative", width: size, height: size }}>
                <svg width={size} height={size}>
                    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dark ? "#2a3a28" : "#e0e8dc"} strokeWidth={5} />
                    <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
                                   strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }}
                                   transition={{ duration: 1.1, ease: "easeOut" }} style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{counted}%</div>
            </div>
            <div style={{ fontSize: 11, color: t.muted, textAlign: "center", fontFamily: "DM Sans, sans-serif" }}>{label}</div>
        </div>
    );
}

function ScanLine() {
    return (
        <motion.div animate={{ y: ["0%", "100%"] }} transition={{ repeat: Infinity, duration: 4, ease: "linear", repeatDelay: 2 }}
                    style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(45,201,160,0.10),transparent)", pointerEvents: "none", zIndex: 10 }} />
    );
}

function DkTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#18181b", borderRadius: 9, overflow: "hidden", display: "flex", minWidth: 140, boxShadow: "0 8px 28px rgba(0,0,0,0.4)" }}>
            <div style={{ width: 3, background: "linear-gradient(180deg,#2dc9a0,#4a9fce)", flexShrink: 0 }} />
            <div style={{ padding: "9px 12px" }}>
                <div style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ fontSize: 11, marginBottom: 2 }}>
                        <span style={{ color: p.color || p.stroke }}>{p.name}: </span>
                        <span style={{ color: "#edf5e0", fontWeight: 700 }}>{p.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const weekData = [
    { day: "Mon", reported: 18, resolved: 14 }, { day: "Tue", reported: 24, resolved: 20 },
    { day: "Wed", reported: 31, resolved: 26 }, { day: "Thu", reported: 22, resolved: 19 },
    { day: "Fri", reported: 28, resolved: 25 }, { day: "Sat", reported: 15, resolved: 13 },
    { day: "Sun", reported: 12, resolved: 10 },
];

const hourData = Array.from({ length: 24 }, (_, h) => ({
    label: h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h-12}p`,
    vol: [2,1,1,0,1,2,4,8,11,14,16,18,14,12,18,22,20,14,10,8,6,5,4,3][h],
    peak: h >= 14 && h <= 16,
}));

const CATS = ["Food Aid","Medical","Education","Shelter","Livelihood"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const hmGrid = CATS.map(c => ({ c, vals: DAYS.map(() => Math.floor(Math.random() * 18 + 3)) }));

const volunteers = [
    { r: 1, name: "Priya Sharma", tasks: 94, hrs: 186, rel: 98, zone: "Dharavi", av: "PS" },
    { r: 2, name: "Arjun Mehta",  tasks: 87, hrs: 162, rel: 95, zone: "Kurla",   av: "AM" },
    { r: 3, name: "Meera Nair",   tasks: 81, hrs: 154, rel: 92, zone: "Govandi", av: "MN" },
    { r: 4, name: "Rajan Kumar",  tasks: 74, hrs: 138, rel: 89, zone: "Mankhurd",av: "RK" },
    { r: 5, name: "Sita Rao",     tasks: 68, hrs: 127, rel: 87, zone: "Chembur", av: "SR" },
];

const insights = [
    { color: "#e05a3a", tag: "critical", title: "High Need Cluster — Govandi East", text: "Needs up 40% this week. 3 medical requests unassigned >6 hrs." },
    { color: "#e8a020", tag: "warning",  title: "Volunteer Availability Drop",       text: "Weekend pool 28% smaller. Activate standby list for Saturday." },
    { color: "#4a9fce", tag: "info",     title: "Resolution Rate Improving",         text: "7-day rate hit 84%, up from 76%. AI matching +12% efficiency." },
    { color: "#9b7cf8", tag: "trend",    title: "Predictive: Food Aid Spike",        text: "Model forecasts 35% increase in food aid requests next week." },
];

const liveEvents = [
    { color: "#4a9fce", text: "New need reported in Dharavi — Food Aid", time: "2m ago" },
    { color: "#e8a020", text: "Priya matched to Medical request #482", time: "5m ago" },
    { color: "#2dc9a0", text: "Task #319 resolved by Arjun in 1.8h", time: "8m ago" },
    { color: "#9b7cf8", text: "AI flagged cluster risk in Govandi: High", time: "12m ago" },
    { color: "#4a9fce", text: "Daily digest sent to 24 coordinators", time: "15m ago" },
];

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const [dark, setDark] = useState(false); // DEFAULT LIGHT
    const [exp, setExp] = useState(true);
    const [period, setPeriod] = useState("Week");
    const [spin, setSpin] = useState(false);
    const t = dark ? TK.dark : TK.light;
    const sw = exp ? 220 : 68;

    return (
        <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
            <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "DM Sans, sans-serif", color: t.text, display: "flex" }}>
                <Sidebar exp={exp} onToggle={() => setExp(v => !v)} />

                <motion.main animate={{ marginLeft: sw }} transition={{ type: "spring", stiffness: 320, damping: 32 }}
                             style={{ flex: 1, minHeight: "100vh" }}>

                    {/* Topbar */}
                    <div style={{
                        background: dark ? "#111a0e" : "#eef2eb",
                        borderBottom: `1px solid ${t.border}`,
                        padding: "0 24px", height: 62,
                        display: "flex", alignItems: "center", gap: 14,
                        position: "sticky", top: 0, zIndex: 50,
                    }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Analytics & AI Insights</div>
                        <div style={{ flex: 1 }} />
                        <PillToggle options={["Today","Week","Month","All Time"]} value={period} onChange={setPeriod} />
                        <div style={{ display: "flex", alignItems: "center", gap: 7, background: dark ? "rgba(155,124,248,0.14)" : "rgba(90,58,138,0.07)", border: "1px solid rgba(155,124,248,0.22)", borderRadius: 999, padding: "5px 13px" }}>
                            <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9b7cf8" }} />
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#9b7cf8", fontFamily: "DM Sans, sans-serif" }}>AI Analysis</span>
                        </div>
                        <motion.button onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 900); }}
                                       animate={{ rotate: spin ? 360 : 0 }} transition={{ duration: 0.7, ease: "linear" }}
                                       style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, padding: 5, borderRadius: 7, display: "flex", alignItems: "center" }}>
                            <RefreshCw size={16} />
                        </motion.button>
                    </div>

                    {/* Page Content */}
                    <div style={{ padding: "18px 22px" }}>

                        {/* AI Insights */}
                        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ marginBottom: 16, background: dark ? "#1c2a18" : "#fff", borderRadius: 14, padding: "16px 18px", border: `1px solid ${t.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                                <Brain size={17} color={t.purple} />
                                <span style={{ fontSize: 14, fontWeight: 800, color: t.text, fontFamily: "DM Sans, sans-serif" }}>AI-Generated Insights</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                                {insights.map((ins, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={{ height: "100%" }}>
                                        <NotifCard color={ins.color} title={ins.title} tag={ins.tag}>{ins.text}</NotifCard>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Charts */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                                        style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 14, padding: "16px 18px", border: `1px solid ${t.border}`, position: "relative", overflow: "hidden" }}>
                                <ScanLine />
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: t.text, marginBottom: 14, fontFamily: "DM Sans, sans-serif" }}>Weekly Trend</div>
                                <ResponsiveContainer width="100%" height={185}>
                                    <AreaChart data={weekData}>
                                        <defs>
                                            <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2d5a2d" stopOpacity={0.3} /><stop offset="95%" stopColor="#2d5a2d" stopOpacity={0} /></linearGradient>
                                            <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2dc9a0" stopOpacity={0.3} /><stop offset="95%" stopColor="#2dc9a0" stopOpacity={0} /></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} />
                                        <XAxis dataKey="day" tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<DkTooltip />} />
                                        <Area type="monotone" dataKey="reported" name="Reported" stroke="#2d5a2d" strokeWidth={2} fill="url(#gA)" dot={{ fill: "#2d5a2d", r: 3 }} />
                                        <Area type="monotone" dataKey="resolved"  name="Resolved"  stroke="#2dc9a0" strokeWidth={2} fill="url(#gB)" dot={{ fill: "#2dc9a0", r: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}
                                        style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 14, padding: "16px 18px", border: `1px solid ${t.border}`, position: "relative", overflow: "hidden" }}>
                                <ScanLine />
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Hourly Distribution</div>
                                    <span style={{ background: `${t.amber}20`, color: t.amber, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>⚡ Peak: 2pm–4pm</span>
                                </div>
                                <ResponsiveContainer width="100%" height={185}>
                                    <BarChart data={hourData} barCategoryGap="20%">
                                        <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} />
                                        <XAxis dataKey="label" tick={{ fill: t.muted, fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                                        <YAxis tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<DkTooltip />} />
                                        <Bar dataKey="vol" name="Volume" radius={[3,3,0,0]}>
                                            {hourData.map((d, i) => <Cell key={i} fill={d.peak ? t.amber : (dark ? "#2d5a2d" : "#4ade80")} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        {/* 3-col secondary */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 14, marginBottom: 14 }}>
                            {/* Rings */}
                            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                                        style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 14, padding: "16px 18px", border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: t.text, marginBottom: 14, fontFamily: "DM Sans, sans-serif" }}>Model Performance</div>
                                <div style={{ display: "flex", justifyContent: "space-around", gap: 8 }}>
                                    <Ring value={94} color={t.green} label="Match Accuracy" />
                                    <Ring value={87} color={t.blue}  label="Response Rate" />
                                    <Ring value={84} color={t.cyan}  label="Resolution" />
                                </div>
                            </motion.div>

                            {/* Live Feed */}
                            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
                                        style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 14, padding: "16px 18px", border: `1px solid ${t.border}`, overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                    <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 7, height: 7, borderRadius: "50%", background: t.green }} />
                                    <span style={{ fontSize: 13.5, fontWeight: 700, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Live Activity</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                    {liveEvents.map((ev, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 + i * 0.06 }}
                                                    style={{ background: dark ? "#18181b" : "#f4f7f2", borderRadius: 7, overflow: "hidden", display: "flex", border: dark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(45,90,45,0.07)" }}>
                                            <div style={{ width: 3, background: `linear-gradient(180deg,${ev.color},${ev.color}77)`, flexShrink: 0 }} />
                                            <div style={{ padding: "6px 10px" }}>
                                                <div style={{ fontSize: 11, color: dark ? "#99999d" : "#5a7a5a", lineHeight: 1.4, fontFamily: "DM Sans, sans-serif" }}>{ev.text}</div>
                                                <div style={{ fontSize: 10, color: t.muted, marginTop: 2 }}>{ev.time}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Heatmap */}
                            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
                                        style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 14, padding: "16px 18px", border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: t.text, marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>Category Heatmap</div>
                                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                                    <div style={{ width: 68 }} />
                                    {DAYS.map(d => <div key={d} style={{ flex: 1, textAlign: "center", fontSize: 9, color: t.muted, fontWeight: 700 }}>{d}</div>)}
                                </div>
                                {hmGrid.map((row, ri) => (
                                    <div key={row.c} style={{ display: "flex", gap: 4, marginBottom: 5, alignItems: "center" }}>
                                        <div style={{ width: 68, fontSize: 9, color: t.muted, fontWeight: 600, fontFamily: "DM Sans, sans-serif" }}>{row.c}</div>
                                        {row.vals.map((v, ci) => (
                                            <motion.div key={ci} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: ri * 0.04 + ci * 0.015 }}
                                                        style={{ flex: 1, height: 19, borderRadius: 3, background: `rgba(45,90,45,${v / 21})`, border: `1px solid rgba(45,90,45,${v / 28})` }} />
                                        ))}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Volunteer Table */}
                        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
                                    style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 14, overflow: "hidden", border: `1px solid ${t.border}`, position: "relative" }}>
                            <ScanLine />
                            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                                <Award size={16} color={t.accent} />
                                <span style={{ fontSize: 13.5, fontWeight: 700, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Volunteer Performance — Top 5</span>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                                    {["Rank","Volunteer","Tasks","Hours","Reliability","Zone"].map(h => (
                                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {volunteers.map((v, i) => (
                                    <motion.tr key={v.r} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.46 + i * 0.06 }}
                                               whileHover={{ background: dark ? "rgba(120,180,80,0.04)" : "rgba(45,90,45,0.03)" }}
                                               style={{ borderBottom: `1px solid ${t.border}` }}>
                                        <td style={{ padding: "11px 16px", fontSize: 15 }}>{v.r <= 3 ? ["🥇","🥈","🥉"][v.r-1] : v.r}</td>
                                        <td style={{ padding: "11px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <div style={{ width: 29, height: 29, borderRadius: "50%", background: `linear-gradient(135deg,${t.accent}38,${t.accent}78)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 800, color: t.accent }}>{v.av}</div>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{v.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: t.text }}>{v.tasks}</td>
                                        <td style={{ padding: "11px 16px", fontSize: 13, color: t.muted }}>{v.hrs}h</td>
                                        <td style={{ padding: "11px 16px", minWidth: 130 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ flex: 1, height: 4, borderRadius: 999, background: dark ? "#2a3a28" : "#e0e8dc", overflow: "hidden" }}>
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${v.rel}%` }} transition={{ delay: 0.5 + i * 0.06, duration: 0.8 }}
                                                                style={{ height: "100%", background: `linear-gradient(90deg,${t.accent},#4ade80)`, borderRadius: 999 }} />
                                                </div>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: t.accent, minWidth: 32 }}>{v.rel}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "11px 16px" }}>
                                            <span style={{ background: `${t.blue}18`, color: t.blue, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>{v.zone}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                                </tbody>
                            </table>
                        </motion.div>
                    </div>
                </motion.main>
            </div>
        </ThemeCtx.Provider>
    );
}