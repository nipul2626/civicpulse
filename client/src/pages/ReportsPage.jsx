import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
    LayoutDashboard, Map, CheckSquare, Users, Heart,
    ClipboardList, BarChart2, Settings,
    Zap, ChevronLeft, FileText, RefreshCw, ChevronUp,
    ChevronDown, ChevronsUpDown, AlertCircle, CheckCircle2,
    TrendingUp, Award, Download, X, Check
} from "lucide-react";

// ─── Theme ─────────────────────────────────────────────────────────────────────
const ThemeCtx = React.createContext({ dark: false, toggle: () => {} });
const TK = {
    light: {
        bg: "#eef2eb", card: "#ffffff",
        border: "rgba(45,90,45,0.12)", text: "#1a2e1a", muted: "#5a7a5a", accent: "#2d5a2d",
        red: "#b84c2e", amber: "#c07a0a", green: "#1a6b4a", blue: "#1a4a8a", purple: "#5a3a8a", cyan: "#1a6b7a",
    },
    dark: {
        bg: "#0a0f08", card: "#1c2a18",
        border: "rgba(120,180,80,0.12)", text: "#edf5e0", muted: "#7a9b6a", accent: "#78b450",
        red: "#e05a3a", amber: "#e8a020", green: "#2dc9a0", blue: "#4a9fce", purple: "#9b7cf8", cyan: "#3ec9b0",
    }
};

// ─── Dashboard-Exact Sidebar ───────────────────────────────────────────────────
const NAV = [
    { icon: LayoutDashboard, label: "Dashboard",  path: "/dashboard",  ic: "#e8734a" },
    { icon: Map,             label: "Heatmap",     path: "/heatmap",    ic: "#4a9fce" },
    { icon: CheckSquare,     label: "Task Board",  path: "/tasks",      ic: "#2dc9a0" },
    { icon: Users,           label: "Volunteers",  path: "/volunteers", ic: "#9b7cf8" },
    { icon: Heart,           label: "Survey",      path: "/survey",     ic: "#e05a7a" },
    { icon: ClipboardList,   label: "Reports",     path: "/reports",    ic: "#c07a0a", active: true },
    { icon: BarChart2,       label: "Analytics",   path: "/analytics",  ic: "#4a9fce" },
    { icon: Settings,        label: "Settings",    path: "/settings",   ic: "#7a9b6a" },
];

function Sidebar({ exp, onToggle }) {
    const { dark, toggle } = useContext(ThemeCtx);
    return (
        <motion.aside
            animate={{ width: exp ? 220 : 68 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            style={{ background: "#eef2eb", borderRight: "1px solid rgba(45,90,45,0.10)", height: "100vh", position: "fixed", left: 0, top: 0, overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 100 }}
        >
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

            <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
                {NAV.map(item => {
                    const Icon = item.icon;
                    return (
                        <motion.a key={item.path} href={item.path} whileHover={{ backgroundColor: "rgba(45,90,45,0.06)" }}
                                  style={{ display: "flex", alignItems: "center", gap: 11, padding: exp ? "9px 10px" : "9px 0", justifyContent: exp ? "flex-start" : "center", borderRadius: 8, textDecoration: "none", marginBottom: 2, position: "relative", background: item.active ? "rgba(45,90,45,0.08)" : "transparent", transition: "background 0.15s" }}>
                            {item.active && <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, background: "#2d5a2d", borderRadius: "0 3px 3px 0" }} />}
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: item.active ? `${item.ic}22` : "rgba(45,90,45,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon size={15} color={item.active ? item.ic : "#5a7a5a"} />
                            </div>
                            {exp && <span style={{ fontSize: 13.5, fontWeight: item.active ? 700 : 500, color: item.active ? "#1a2e1a" : "#4a6a4a", fontFamily: "DM Sans, sans-serif", whiteSpace: "nowrap" }}>{item.label}</span>}
                        </motion.a>
                    );
                })}
            </nav>

            <div style={{ padding: "10px 10px 14px", borderTop: "1px solid rgba(45,90,45,0.08)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", marginBottom: 8 }}>
                    <motion.button onClick={toggle} style={{ width: 44, height: 24, borderRadius: 999, background: dark ? "linear-gradient(90deg,#1a1a3a,#0a0a1a)" : "linear-gradient(90deg,#f0c040,#87ceeb)", border: "none", cursor: "pointer", position: "relative", padding: 0, flexShrink: 0 }}>
                        <motion.div animate={{ x: dark ? 22 : 2 }} transition={{ type: "spring", stiffness: 450, damping: 28 }} style={{ width: 20, height: 20, borderRadius: "50%", background: dark ? "#c8c8d8" : "#fff", position: "absolute", top: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                    </motion.button>
                    {exp && <span style={{ fontSize: 12.5, fontWeight: 500, color: "#4a6a4a", fontFamily: "DM Sans, sans-serif", whiteSpace: "nowrap" }}>{dark ? "Dark Mode" : "Light Mode"}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 8px", background: "rgba(45,90,45,0.06)", borderRadius: 10, marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#2d5a2d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>RS</div>
                    {exp && <div><div style={{ fontSize: 12.5, fontWeight: 700, color: "#1a2e1a", fontFamily: "DM Sans, sans-serif" }}>Riya Sharma</div><div style={{ fontSize: 10.5, color: "#5a7a5a", fontFamily: "DM Sans, sans-serif" }}>Coordinator</div></div>}
                </div>
                <motion.button onClick={onToggle} whileHover={{ backgroundColor: "rgba(45,90,45,0.08)" }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", width: "100%" }}>
                    <motion.div animate={{ rotate: exp ? 0 : 180 }} transition={{ duration: 0.3 }}><ChevronLeft size={15} color="#5a7a5a" /></motion.div>
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
                        style={{ position: "absolute", top: 4, left: 4, width: `calc(${100/options.length}% - ${8/options.length}px)`, height: "calc(100% - 8px)", background: "#2d5a2d", borderRadius: 999 }} />
            {options.map(opt => (
                <button key={opt} onClick={() => onChange(opt)} style={{ position: "relative", zIndex: 1, background: "transparent", border: "none", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer", color: value === opt ? "#fff" : t.muted, transition: "color 0.3s", flex: 1, whiteSpace: "nowrap" }}>{opt}</button>
            ))}
        </div>
    );
}

function GradientBtn({ children, onClick, small }) {
    const { dark } = useContext(ThemeCtx);
    return (
        <motion.div whileHover={{ scale: 1.04 }} style={{ padding: "2px", background: "linear-gradient(90deg,#1a8a3a,#4ade80)", borderRadius: "0.85em", display: "inline-block", cursor: "pointer", position: "relative" }} onClick={onClick}>
            <motion.div whileHover={{ opacity: 0.7 }} style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#1a8a3a,#4ade80)", borderRadius: "0.85em", opacity: 0, filter: "blur(1em)", zIndex: -1, transition: "opacity 0.3s" }} />
            <button style={{ background: dark ? "#0f1f0f" : "#1a2e1a", color: "#fff", border: "none", borderRadius: "0.5em", padding: small ? "6px 14px" : "8px 20px", fontSize: small ? 12.5 : 13.5, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>{children}</button>
        </motion.div>
    );
}

function DownloadBtn({ onClick }) {
    const [s, setS] = useState("idle");
    const go = () => { setS("loading"); setTimeout(() => { setS("done"); onClick && onClick(); }, 1600); setTimeout(() => setS("idle"), 4000); };
    return (
        <motion.button onClick={go} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                       style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgb(91,91,240)", background: s === "done" ? "rgb(91,91,240)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s" }}>
            {s === "idle" && <Download size={15} color="rgb(91,91,240)" />}
            {s === "loading" && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 14, height: 14, border: "2px solid rgb(91,91,240)", borderTopColor: "transparent", borderRadius: "50%" }} />}
            {s === "done" && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</motion.span>}
        </motion.button>
    );
}

function LiquidRadio({ options, value, onChange }) {
    const idx = options.indexOf(value);
    return (
        <div style={{ position: "relative", background: "#111", borderRadius: 7, padding: 3, display: "grid", gridTemplateColumns: `repeat(${options.length},1fr)`, width: "fit-content" }}>
            <motion.div animate={{ x: `${idx * 100}%` }} transition={{ ease: [0.22,0.9,0.25,1], duration: 0.5 }}
                        style={{ position: "absolute", top: 3, left: 3, width: `calc(${100/options.length}% - ${6/options.length}px)`, height: "calc(100% - 6px)", background: "#fff", borderRadius: 5 }} />
            {options.map(opt => (
                <button key={opt} onClick={() => onChange(opt)} style={{ position: "relative", zIndex: 1, background: "transparent", border: "none", padding: "7px 16px", fontSize: 12.5, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer", color: value === opt ? "#000" : "#666", transition: "color 0.3s", whiteSpace: "nowrap" }}>{opt}</button>
            ))}
        </div>
    );
}

function CosmicToggle({ checked, onChange, label }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.button onClick={() => onChange(!checked)}
                           animate={{ background: checked ? "linear-gradient(135deg,#1a8a3a,#4ade80)" : "linear-gradient(135deg,#2a2a2a,#3a3a3a)" }}
                           transition={{ duration: 0.3 }}
                           style={{ width: 48, height: 26, borderRadius: 999, border: "none", cursor: "pointer", position: "relative", padding: 0, flexShrink: 0 }}>
                <motion.div animate={{ x: checked ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 2 }} />
            </motion.button>
            {label && <span style={{ fontSize: 13.5, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{label}</span>}
        </div>
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

// ─── Data ──────────────────────────────────────────────────────────────────────
const monthlyData = [
    { month: "Jan", reported: 42, resolved: 35 }, { month: "Feb", reported: 58, resolved: 47 },
    { month: "Mar", reported: 73, resolved: 62 }, { month: "Apr", reported: 65, resolved: 58 },
    { month: "May", reported: 89, resolved: 74 }, { month: "Jun", reported: 94, resolved: 81 },
    { month: "Jul", reported: 78, resolved: 70 },
];

const categoryData = [
    { name: "Food Aid",   value: 32, color: "#1a6b4a" },
    { name: "Medical",    value: 24, color: "#1a4a8a" },
    { name: "Education",  value: 18, color: "#5a3a8a" },
    { name: "Shelter",    value: 15, color: "#c07a0a" },
    { name: "Livelihood", value: 11, color: "#1a6b7a" },
];

const zoneData = [
    { zone: "Dharavi",  reported: 48, resolved: 41, pending: 7, avgTime: "2.4h", volunteer: "Meera S." },
    { zone: "Kurla",    reported: 35, resolved: 28, pending: 7, avgTime: "3.1h", volunteer: "Rajan K." },
    { zone: "Govandi",  reported: 62, resolved: 55, pending: 7, avgTime: "1.8h", volunteer: "Priya T." },
    { zone: "Mankhurd", reported: 29, resolved: 22, pending: 7, avgTime: "4.2h", volunteer: "Arjun M." },
    { zone: "Chembur",  reported: 44, resolved: 38, pending: 6, avgTime: "2.9h", volunteer: "Sita R." },
];

const leaderData = [
    { rank: 1, name: "Priya Sharma", tasks: 94, hours: 186, reliability: 98, av: "PS" },
    { rank: 2, name: "Arjun Mehta",  tasks: 87, hours: 162, reliability: 95, av: "AM" },
    { rank: 3, name: "Meera Nair",   tasks: 81, hours: 154, reliability: 92, av: "MN" },
    { rank: 4, name: "Rajan Kumar",  tasks: 74, hours: 138, reliability: 89, av: "RK" },
    { rank: 5, name: "Sita Rao",     tasks: 68, hours: 127, reliability: 87, av: "SR" },
    { rank: 6, name: "Vijay Patel",  tasks: 63, hours: 119, reliability: 84, av: "VP" },
    { rank: 7, name: "Anita Singh",  tasks: 59, hours: 108, reliability: 82, av: "AS" },
    { rank: 8, name: "Deepak Jha",   tasks: 54, hours: 98,  reliability: 80, av: "DJ" },
    { rank: 9, name: "Kavya Reddy",  tasks: 48, hours: 89,  reliability: 78, av: "KR" },
    { rank: 10,name: "Sunil Das",    tasks: 43, hours: 82,  reliability: 75, av: "SD" },
];

function CTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#18181b", borderRadius: 9, overflow: "hidden", display: "flex", minWidth: 150, boxShadow: "0 8px 28px rgba(0,0,0,0.4)" }}>
            <div style={{ width: 3, background: "linear-gradient(180deg,#1a6b4a,#4ade80)", flexShrink: 0 }} />
            <div style={{ padding: "9px 12px" }}>
                <div style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ fontSize: 11, marginBottom: 2 }}>
                        <span style={{ color: p.fill || p.stroke }}>{p.name}: </span>
                        <span style={{ color: "#edf5e0", fontWeight: 700 }}>{p.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function KpiCard({ label, value, suffix = "", color, icon: Icon, trend }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const counted = useCountUp(value);
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}
                    style={{ background: dark ? "#18181b" : "#fff", borderRadius: 13, overflow: "hidden", display: "flex", boxShadow: dark ? "0 2px 18px rgba(0,0,0,0.28)" : "0 2px 14px rgba(45,90,45,0.07)", border: dark ? "1px solid rgba(255,255,255,0.04)" : `1px solid ${t.border}` }}>
            <div style={{ width: 4, flexShrink: 0, background: `linear-gradient(180deg,${color},${color}55)` }} />
            <div style={{ padding: "16px 18px", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                    <div style={{ color: t.muted, fontSize: 12.5, fontWeight: 500, fontFamily: "DM Sans, sans-serif" }}>{label}</div>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} color={color} />
                    </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: t.text, fontFamily: "DM Sans, sans-serif", lineHeight: 1 }}>{counted.toLocaleString()}{suffix}</div>
                {trend && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 7, color: "#1a6b4a", fontSize: 11, fontWeight: 600 }}>
                        <ChevronUp size={12} />{trend}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Export Modal
function ExportModal({ onClose }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const [fmt, setFmt] = useState("PDF");
    const [sections, setSections] = useState({ kpis: true, charts: true, zones: true, leaderboard: false });
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                        style={{ background: dark ? "#111a0e" : "#fff", borderRadius: 18, padding: 28, width: 440, border: `1px solid ${t.border}`, boxShadow: "0 32px 70px rgba(0,0,0,0.4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Export Report</div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, padding: 4 }}><X size={16} /></button>
                </div>
                <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, marginBottom: 9, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "DM Sans, sans-serif" }}>Format</div>
                    <LiquidRadio options={["PDF","CSV","Excel"]} value={fmt} onChange={setFmt} />
                </div>
                <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, marginBottom: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "DM Sans, sans-serif" }}>Sections to Include</div>
                    {Object.entries(sections).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
              <span style={{ color: t.text, fontSize: 13.5, fontFamily: "DM Sans, sans-serif" }}>
                {k === "kpis" ? "KPI Cards" : k === "leaderboard" ? "Volunteer Leaderboard" : k.charAt(0).toUpperCase() + k.slice(1)}
              </span>
                            <CosmicToggle checked={v} onChange={nv => setSections(s => ({...s, [k]: nv}))} />
                        </div>
                    ))}
                </div>
                <GradientBtn><Download size={13} /> Download {fmt}</GradientBtn>
            </motion.div>
        </motion.div>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
    const [dark, setDark] = useState(false);
    const [exp, setExp] = useState(true);
    const [period, setPeriod] = useState("Month");
    const [sortCol, setSortCol] = useState("reported");
    const [sortDir, setSortDir] = useState("desc");
    const [showExport, setShowExport] = useState(false);
    const [spin, setSpin] = useState(false);
    const t = dark ? TK.dark : TK.light;
    const sw = exp ? 220 : 68;
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    const sorted = [...zoneData].sort((a, b) => {
        const av = isNaN(a[sortCol]) ? a[sortCol] : Number(a[sortCol]);
        const bv = isNaN(b[sortCol]) ? b[sortCol] : Number(b[sortCol]);
        return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    const doSort = col => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("desc"); } };
    const SIcon = ({ col }) => sortCol !== col ? <ChevronsUpDown size={11} opacity={0.4} /> : sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />;

    return (
        <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
            <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "DM Sans, sans-serif", color: t.text, display: "flex" }}>
                <Sidebar exp={exp} onToggle={() => setExp(v => !v)} />

                <motion.main animate={{ marginLeft: sw }} transition={{ type: "spring", stiffness: 320, damping: 32 }} style={{ flex: 1, minHeight: "100vh" }}>

                    {/* Topbar */}
                    <div style={{ background: dark ? "#111a0e" : "#eef2eb", borderBottom: `1px solid ${t.border}`, padding: "0 24px", height: 62, display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 800, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Impact Reports</div>
                            <div style={{ fontSize: 11, color: t.muted, marginTop: 1, fontFamily: "DM Sans, sans-serif" }}>Data as of {today}</div>
                        </div>
                        <div style={{ flex: 1 }} />
                        <PillToggle options={["Week","Month","Quarter","Year"]} value={period} onChange={setPeriod} />
                        <GradientBtn small><FileText size={13} /> Generate Report</GradientBtn>
                        <DownloadBtn onClick={() => setShowExport(true)} />
                        <motion.button onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 900); }}
                                       animate={{ rotate: spin ? 360 : 0 }} transition={{ duration: 0.7, ease: "linear" }}
                                       style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, padding: 5, borderRadius: 7, display: "flex", alignItems: "center" }}>
                            <RefreshCw size={16} />
                        </motion.button>
                    </div>

                    <div style={{ padding: "20px 24px" }}>
                        {/* KPIs */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
                            {[
                                { label: "Total Needs Reported", value: 499, color: t.blue,   icon: AlertCircle,  trend: "+12% vs last month" },
                                { label: "Resolved (84%)",        value: 418, color: t.green,  icon: CheckCircle2, trend: "+8% resolution rate" },
                                { label: "Volunteers Deployed",   value: 127, color: t.purple, icon: Users,        trend: "+15 this period" },
                                { label: "People Impacted",       value: 8240,color: t.cyan,   icon: TrendingUp,   trend: "Est. reach" },
                            ].map((k, i) => (
                                <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                    <KpiCard {...k} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                                        style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 13, padding: "18px 20px", border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 18, fontFamily: "DM Sans, sans-serif" }}>Monthly Overview</div>
                                <ResponsiveContainer width="100%" height={210}>
                                    <BarChart data={monthlyData} barCategoryGap="30%">
                                        <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} />
                                        <XAxis dataKey="month" tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CTooltip />} />
                                        <Bar dataKey="reported" name="Reported" stackId="a" fill="#2d5a2d" />
                                        <Bar dataKey="resolved"  name="Resolved"  stackId="a" fill="#4ade80" radius={[5,5,0,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                                    {[["#2d5a2d","Needs Reported"],["#4ade80","Resolved"]].map(([c,l]) => (
                                        <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.muted }}>
                                            <div style={{ width: 9, height: 9, borderRadius: 3, background: c }} />{l}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
                                        style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 13, padding: "18px 20px", border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>Category Breakdown</div>
                                <ResponsiveContainer width="100%" height={170}>
                                    <PieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value">
                                            {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip content={({ active, payload }) => {
                                            if (!active || !payload?.length) return null;
                                            const d = payload[0].payload;
                                            return <div style={{ background: "#18181b", borderRadius: 7, padding: "8px 12px" }}><div style={{ color: d.color, fontWeight: 700, fontSize: 11 }}>{d.name}</div><div style={{ color: "#edf5e0", fontSize: 13, fontWeight: 700 }}>{d.value}%</div></div>;
                                        }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {categoryData.map(c => (
                                    <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} />
                                            <span style={{ color: t.muted }}>{c.name}</span>
                                        </div>
                                        <span style={{ color: t.text, fontWeight: 700 }}>{c.value}%</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Zone Table */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
                                    style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 13, overflow: "hidden", border: `1px solid ${t.border}`, marginBottom: 16 }}>
                            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Zone Performance</div>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                                    {[["zone","Zone"],["reported","Reported"],["resolved","Resolved"],["pending","Pending"],["avgTime","Avg Time"],["volunteer","Top Volunteer"]].map(([col,lbl]) => (
                                        <th key={col} onClick={() => doSort(col)}
                                            style={{ padding: "10px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", userSelect: "none" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>{lbl} <SIcon col={col} /></span>
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {sorted.map((row, i) => (
                                    <motion.tr key={row.zone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                               whileHover={{ background: dark ? "rgba(120,180,80,0.04)" : "rgba(45,90,45,0.03)" }}
                                               style={{ borderBottom: `1px solid ${t.border}` }}>
                                        <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 700, color: t.text }}>{row.zone}</td>
                                        <td style={{ padding: "12px 18px", fontSize: 13, color: t.text }}>{row.reported}</td>
                                        <td style={{ padding: "12px 18px" }}><span style={{ background: `${t.green}18`, color: t.green, padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{row.resolved}</span></td>
                                        <td style={{ padding: "12px 18px" }}><span style={{ background: `${t.amber}18`, color: t.amber, padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{row.pending}</span></td>
                                        <td style={{ padding: "12px 18px", fontSize: 12.5, color: t.muted }}>{row.avgTime}</td>
                                        <td style={{ padding: "12px 18px", fontSize: 12.5, color: t.text }}>{row.volunteer}</td>
                                    </motion.tr>
                                ))}
                                </tbody>
                            </table>
                        </motion.div>

                        {/* Leaderboard */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
                                    style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 13, overflow: "hidden", border: `1px solid ${t.border}` }}>
                            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                                <Award size={16} color={t.accent} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Volunteer Leaderboard — {period}</span>
                            </div>
                            <div style={{ padding: "4px 0" }}>
                                {leaderData.map((v, i) => (
                                    <motion.div key={v.rank} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.48 + i * 0.05 }}
                                                whileHover={{ background: dark ? "rgba(120,180,80,0.04)" : "rgba(45,90,45,0.03)" }}
                                                style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", borderBottom: i < 9 ? `1px solid ${t.border}` : "none" }}>
                                        <div style={{ width: 26, textAlign: "center", fontSize: v.rank <= 3 ? 16 : 13, fontWeight: 800, color: v.rank <= 3 ? ["#d4af37","#c0c0c0","#cd7f32"][v.rank-1] : t.muted }}>
                                            {v.rank <= 3 ? ["🥇","🥈","🥉"][v.rank-1] : v.rank}
                                        </div>
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${t.accent}35,${t.accent}75)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: t.accent, flexShrink: 0 }}>{v.av}</div>
                                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{v.name}</div>
                                        <div style={{ textAlign: "center", minWidth: 52 }}>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{v.tasks}</div>
                                            <div style={{ fontSize: 9.5, color: t.muted }}>Tasks</div>
                                        </div>
                                        <div style={{ textAlign: "center", minWidth: 52 }}>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{v.hours}</div>
                                            <div style={{ fontSize: 9.5, color: t.muted }}>Hours</div>
                                        </div>
                                        <div style={{ minWidth: 110 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: t.muted, marginBottom: 3 }}>
                                                <span>Reliability</span><span style={{ color: t.accent, fontWeight: 700 }}>{v.reliability}%</span>
                                            </div>
                                            <div style={{ height: 4, borderRadius: 999, background: dark ? "#2a3a28" : "#e0e8dc", overflow: "hidden" }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${v.reliability}%` }} transition={{ delay: 0.52 + i * 0.04, duration: 0.7 }}
                                                            style={{ height: "100%", background: `linear-gradient(90deg,${t.accent},#4ade80)`, borderRadius: 999 }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.main>

                <AnimatePresence>
                    {showExport && <ExportModal onClose={() => setShowExport(false)} />}
                </AnimatePresence>
            </div>
        </ThemeCtx.Provider>
    );
}