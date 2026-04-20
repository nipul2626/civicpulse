import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Map, CheckSquare, Users, Heart,
    ClipboardList, BarChart2, Settings,
    Zap, ChevronLeft, User, Bell, Palette, Shield,
    Lock, Database, Plug, Camera, Save, Download,
    AlertTriangle, X, Check
} from "lucide-react";

// ─── Theme ─────────────────────────────────────────────────────────────────────
const ThemeCtx = React.createContext({ dark: false, toggle: () => {} });

const TK = {
    light: {
        bg: "#eef2eb", card: "#ffffff", surface: "#f4f7f2",
        border: "rgba(45,90,45,0.12)", text: "#1a2e1a", muted: "#5a7a5a", accent: "#2d5a2d",
        red: "#b84c2e", amber: "#c07a0a", green: "#1a6b4a", blue: "#1a4a8a",
    },
    dark: {
        bg: "#0a0f08", card: "#1c2a18", surface: "#111a0e",
        border: "rgba(120,180,80,0.12)", text: "#edf5e0", muted: "#7a9b6a", accent: "#78b450",
        red: "#e05a3a", amber: "#e8a020", green: "#2dc9a0", blue: "#4a9fce",
    }
};

// ─── Dashboard-Exact Sidebar ───────────────────────────────────────────────────
const NAV = [
    { icon: LayoutDashboard, label: "Dashboard",  path: "/dashboard",  ic: "#e8734a" },
    { icon: Map,             label: "Heatmap",     path: "/heatmap",    ic: "#4a9fce" },
    { icon: CheckSquare,     label: "Task Board",  path: "/tasks",      ic: "#2dc9a0" },
    { icon: Users,           label: "Volunteers",  path: "/volunteers", ic: "#9b7cf8" },
    { icon: Heart,           label: "Survey",      path: "/survey",     ic: "#e05a7a" },
    { icon: ClipboardList,   label: "Reports",     path: "/reports",    ic: "#c07a0a" },
    { icon: BarChart2,       label: "Analytics",   path: "/analytics",  ic: "#4a9fce" },
    { icon: Settings,        label: "Settings",    path: "/settings",   ic: "#7a9b6a", active: true },
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
                    <motion.div animate={{ rotate: exp ? 0 : 180 }} transition={{ duration: 0.3 }}><ChevronLeft size={15} color="#5a7a5a" /></motion.div>
                    {exp && <span style={{ fontSize: 12.5, fontWeight: 500, color: "#4a6a4a", fontFamily: "DM Sans, sans-serif" }}>Collapse</span>}
                </motion.button>
            </div>
        </motion.aside>
    );
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────
function GradientBtn({ children, onClick, danger, small }) {
    const { dark } = useContext(ThemeCtx);
    const grad = danger ? "linear-gradient(90deg,#b84c2e,#e05a3a)" : "linear-gradient(90deg,#1a8a3a,#4ade80)";
    return (
        <motion.div whileHover={{ scale: 1.04 }} style={{ padding: "2px", background: grad, borderRadius: "0.85em", display: "inline-block", cursor: "pointer", position: "relative" }} onClick={onClick}>
            <motion.div whileHover={{ opacity: 0.7 }} style={{ position: "absolute", inset: 0, background: grad, borderRadius: "0.85em", opacity: 0, filter: "blur(1em)", zIndex: -1, transition: "opacity 0.3s" }} />
            <button style={{ background: dark ? (danger ? "#2a0f0f" : "#0f1f0f") : (danger ? "#3a1010" : "#1a2e1a"), color: "#fff", border: "none", borderRadius: "0.5em", padding: small ? "6px 14px" : "8px 20px", fontSize: small ? 12.5 : 13.5, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                {children}
            </button>
        </motion.div>
    );
}

function CosmicToggle({ checked, onChange }) {
    return (
        <motion.button onClick={() => onChange(!checked)}
                       animate={{ background: checked ? "linear-gradient(135deg,#1a8a3a,#4ade80)" : "linear-gradient(135deg,#2a2a2a,#3a3a3a)" }}
                       transition={{ duration: 0.3 }}
                       style={{ width: 48, height: 26, borderRadius: 999, border: "none", cursor: "pointer", position: "relative", padding: 0, flexShrink: 0 }}>
            <motion.div animate={{ x: checked ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, boxShadow: checked ? "0 0 8px rgba(74,222,128,0.5)" : "none" }} />
        </motion.button>
    );
}

function DownloadBtn({ label }) {
    const [state, setState] = useState("idle");
    const go = () => { setState("loading"); setTimeout(() => setState("done"), 1600); setTimeout(() => setState("idle"), 3800); };
    return (
        <motion.button onClick={go} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                       style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: "2px solid rgb(91,91,240)", borderRadius: 9, background: state === "done" ? "rgb(91,91,240)" : "transparent", cursor: "pointer", color: state === "done" ? "#fff" : "rgb(91,91,240)", fontSize: 12.5, fontWeight: 600, fontFamily: "DM Sans, sans-serif", transition: "all 0.3s" }}>
            {state === "idle" && <Download size={14} />}
            {state === "loading" && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ width: 13, height: 13, border: "2px solid rgb(91,91,240)", borderTopColor: "transparent", borderRadius: "50%" }} />}
            {state === "done" && <Check size={14} />}
            {state === "done" ? "Done!" : label || "Download"}
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

function PillToggle({ options, value, onChange }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const idx = options.indexOf(value);
    return (
        <div style={{ position: "relative", background: dark ? "#1c2a18" : "#e8ede6", borderRadius: 999, padding: 3, display: "flex", border: `1px solid ${t.border}`, width: "fit-content" }}>
            <motion.div animate={{ x: `${idx * 100}%` }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ position: "absolute", top: 3, left: 3, width: `calc(${100/options.length}% - ${6/options.length}px)`, height: "calc(100% - 6px)", background: "#2d5a2d", borderRadius: 999 }} />
            {options.map(opt => (
                <button key={opt} onClick={() => onChange(opt)} style={{ position: "relative", zIndex: 1, background: "transparent", border: "none", borderRadius: 999, padding: "5px 13px", fontSize: 12.5, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer", color: value === opt ? "#fff" : t.muted, transition: "color 0.3s", whiteSpace: "nowrap" }}>{opt}</button>
            ))}
        </div>
    );
}

function InputField({ label, value, onChange, type = "text", disabled }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: t.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "DM Sans, sans-serif" }}>{label}</label>
            <input type={type} value={value} onChange={e => onChange && onChange(e.target.value)} disabled={disabled}
                   style={{ width: "100%", background: dark ? "#0a0f08" : "#f0f4ee", border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 13px", fontSize: 13.5, color: disabled ? t.muted : t.text, fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box", opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "text", transition: "border-color 0.2s" }} />
        </div>
    );
}

function Toast({ msg, color, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3400); return () => clearTimeout(t); }, []);
    return (
        <motion.div initial={{ opacity: 0, x: 70 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 70 }}
                    style={{ position: "fixed", top: 78, right: 22, background: "#18181b", borderRadius: 11, overflow: "hidden", display: "flex", zIndex: 2000, boxShadow: "0 8px 28px rgba(0,0,0,0.4)", minWidth: 270 }}>
            <div style={{ width: 4, background: `linear-gradient(180deg,${color},${color}66)`, flexShrink: 0 }} />
            <div style={{ padding: "13px 14px", flex: 1 }}>
                <div style={{ color, fontSize: 12.5, fontWeight: 700, marginBottom: 2, fontFamily: "DM Sans, sans-serif" }}>Success</div>
                <div style={{ color: "#99999d", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>{msg}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: "0 11px" }}><X size={13} /></button>
        </motion.div>
    );
}

// ─── Settings Tabs ─────────────────────────────────────────────────────────────
const TABS = [
    { id: "profile",       Icon: User,     label: "Profile" },
    { id: "notifications", Icon: Bell,     label: "Notifications" },
    { id: "appearance",    Icon: Palette,  label: "Appearance" },
    { id: "privacy",       Icon: Shield,   label: "Privacy" },
    { id: "security",      Icon: Lock,     label: "Security" },
    { id: "data",          Icon: Database, label: "Data" },
    { id: "integrations",  Icon: Plug,     label: "Integrations" },
];

const integrations = [
    { icon: "💬", name: "WhatsApp",      desc: "Alerts and updates via WhatsApp",    connected: true },
    { icon: "📊", name: "Google Sheets", desc: "Sync volunteer and report data",      connected: false },
    { icon: "✈️", name: "Telegram",      desc: "Bot notifications for coordinators", connected: false },
    { icon: "📧", name: "Gmail",          desc: "Email digest and summaries",         connected: true },
];

const sessions = [
    { device: "Chrome — MacBook Pro", location: "Mumbai, IN", time: "Active now", current: true },
    { device: "Firefox — iPhone 15",  location: "Pune, IN",   time: "2 hours ago",  current: false },
    { device: "Safari — iPad",        location: "Mumbai, IN", time: "Yesterday",    current: false },
];

// ─── Section Card wrapper ──────────────────────────────────────────────────────
function SCard({ icon: Icon, title, subtitle, children }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    return (
        <div style={{ background: dark ? TK.dark.card : "#fff", borderRadius: 14, overflow: "hidden", border: `1px solid ${t.border}` }}>
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${t.accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={16} color={t.accent} />
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{title}</div>
                    {subtitle && <div style={{ fontSize: 11, color: t.muted, marginTop: 1, fontFamily: "DM Sans, sans-serif" }}>{subtitle}</div>}
                </div>
            </div>
            <div style={{ padding: "20px 22px" }}>{children}</div>
        </div>
    );
}

function Divider() {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    return <div style={{ height: 1, background: t.border, margin: "16px 0" }} />;
}

// ─── Tab Content Panels ────────────────────────────────────────────────────────
function ProfilePanel({ showToast }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const [p, setP] = useState({ name: "Coordinator Admin", email: "admin@civicpulse.in", phone: "+91 98765 43210", city: "Mumbai", org: "CivicPulse NGO" });

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 18 }}>
            {/* Left — basic info */}
            <SCard icon={User} title="Profile" subtitle="Manage your personal information">
                {/* Avatar row */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <div style={{ position: "relative", cursor: "pointer" }}
                         onMouseEnter={e => e.currentTarget.querySelector(".overlay").style.opacity = 1}
                         onMouseLeave={e => e.currentTarget.querySelector(".overlay").style.opacity = 0}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${t.accent}55,${t.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>CA</div>
                        <div className="overlay" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                            <Camera size={18} color="#fff" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{p.name}</div>
                        <div style={{ display: "inline-block", background: `${t.accent}18`, color: t.accent, fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 999, marginTop: 3 }}>NGO Coordinator</div>
                        <div style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: "DM Sans, sans-serif" }}>Member since Jan 2023</div>
                    </div>
                </div>
                <InputField label="Full Name" value={p.name} onChange={v => setP(x => ({...x, name: v}))} />
                <InputField label="Email" value={p.email} onChange={v => setP(x => ({...x, email: v}))} type="email" />
                <InputField label="Phone" value={p.phone} onChange={v => setP(x => ({...x, phone: v}))} />
                <InputField label="City" value={p.city} onChange={v => setP(x => ({...x, city: v}))} />
                <InputField label="Organization" value={p.org} onChange={v => setP(x => ({...x, org: v}))} />
                <InputField label="Role" value="NGO Coordinator" disabled />
                <div style={{ marginTop: 4 }}>
                    <GradientBtn onClick={() => showToast("Profile updated successfully", "#2dc9a0")}>
                        <Save size={13} /> Save Changes
                    </GradientBtn>
                </div>
            </SCard>

            {/* Right — activity / stats preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SCard icon={BarChart2} title="Activity Summary" subtitle="Your impact this month">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[
                            { label: "Needs Assigned", val: "48", color: t.accent },
                            { label: "Resolved",       val: "41", color: t.green },
                            { label: "Volunteers Led", val: "12", color: "#9b7cf8" },
                            { label: "Hours Logged",   val: "96", color: "#4a9fce" },
                        ].map(item => (
                            <motion.div key={item.label} whileHover={{ scale: 1.03 }}
                                        style={{ background: dark ? "#0a0f08" : "#f4f7f2", borderRadius: 10, padding: "12px 14px", border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: 22, fontWeight: 900, color: item.color, fontFamily: "DM Sans, sans-serif" }}>{item.val}</div>
                                <div style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: "DM Sans, sans-serif" }}>{item.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </SCard>

                <SCard icon={Bell} title="Quick Alerts" subtitle="Recent notifications">
                    {[
                        { color: "#4a9fce", text: "3 new needs assigned to your zone", time: "2h ago" },
                        { color: "#e8a020", text: "Volunteer availability drop this weekend", time: "5h ago" },
                        { color: "#2dc9a0", text: "Monthly report generated successfully", time: "1d ago" },
                    ].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 12 : 0 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, marginTop: 4, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12.5, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{item.text}</div>
                                <div style={{ fontSize: 10.5, color: t.muted, marginTop: 2 }}>{item.time}</div>
                            </div>
                        </div>
                    ))}
                </SCard>
            </div>
        </div>
    );
}

function NotificationsPanel() {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const [notifs, setNotifs] = useState({ email: true, sms: false, assignments: true, digest: true, ai: true, volunteers: false });

    const rows = [
        { key: "email", label: "Email Alerts", desc: "Important updates via email", group: 1 },
        { key: "sms", label: "SMS Notifications", desc: "Critical alerts via SMS", group: 1 },
        { key: "assignments", label: "New Need Assignments", desc: "When new needs match your zone", group: 2 },
        { key: "digest", label: "Daily Digest", desc: "Morning summary of all activity", group: 2 },
        { key: "ai", label: "AI Scoring Alerts", desc: "When AI flags critical needs", group: 2 },
        { key: "volunteers", label: "Volunteer Updates", desc: "Join & completion notifications", group: 2 },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <SCard icon={Bell} title="Notification Channels" subtitle="How you receive alerts">
                {rows.filter(r => r.group === 1).map((item, i) => (
                    <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: i === 0 ? 16 : 0 }}>
                        <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "DM Sans, sans-serif" }}>{item.desc}</div>
                        </div>
                        <CosmicToggle checked={notifs[item.key]} onChange={v => setNotifs(n => ({...n, [item.key]: v}))} />
                    </div>
                ))}
                <Divider />
                <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontFamily: "DM Sans, sans-serif" }}>In-App Notifications</div>
                {rows.filter(r => r.group === 2).map((item, i) => (
                    <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: i < 3 ? 16 : 0 }}>
                        <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "DM Sans, sans-serif" }}>{item.desc}</div>
                        </div>
                        <CosmicToggle checked={notifs[item.key]} onChange={v => setNotifs(n => ({...n, [item.key]: v}))} />
                    </div>
                ))}
            </SCard>

            {/* Preview panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SCard icon={Bell} title="Preview" subtitle="How notifications will appear">
                    {[
                        { color: "#4a9fce", title: "New Assignment", text: "Medical need reported in Govandi. 2 volunteers available.", active: notifs.assignments },
                        { color: "#e8a020", title: "AI Alert",       text: "Cluster risk detected in Dharavi East zone.", active: notifs.ai },
                        { color: "#2dc9a0", title: "Daily Digest",   text: "8 needs resolved, 3 pending. 14 active volunteers.", active: notifs.digest },
                    ].map((n, i) => (
                        <motion.div key={i} animate={{ opacity: n.active ? 1 : 0.35 }} transition={{ duration: 0.3 }}
                                    style={{ background: dark ? "#18181b" : "#f4f7f2", borderRadius: 9, overflow: "hidden", display: "flex", marginBottom: i < 2 ? 10 : 0, border: dark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(45,90,45,0.08)" }}>
                            <div style={{ width: 3, background: `linear-gradient(180deg,${n.color},${n.color}66)`, flexShrink: 0 }} />
                            <div style={{ padding: "9px 12px" }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: n.color, fontFamily: "DM Sans, sans-serif", marginBottom: 2 }}>{n.title}</div>
                                <div style={{ fontSize: 11, color: dark ? "#99999d" : t.muted, fontFamily: "DM Sans, sans-serif" }}>{n.text}</div>
                            </div>
                        </motion.div>
                    ))}
                </SCard>
                <SCard icon={Bell} title="Frequency" subtitle="How often to receive updates">
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>Digest Timing</div>
                        <LiquidRadio options={["Morning","Evening","Both"]} value="Morning" onChange={() => {}} />
                    </div>
                    <Divider />
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>Alert Priority</div>
                        <PillToggle options={["All","High Only","Critical"]} value="All" onChange={() => {}} />
                    </div>
                </SCard>
            </div>
        </div>
    );
}

function AppearancePanel() {
    const { dark, toggle } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const [fontSize, setFontSize] = useState("Medium");
    const [density, setDensity] = useState("Comfortable");
    const [accent, setAccent] = useState("#2d5a2d");

    const accents = [
        { color: "#2d5a2d", name: "Forest" }, { color: "#1a4a8a", name: "Ocean" },
        { color: "#5a3a8a", name: "Dusk" },   { color: "#8a3a1a", name: "Ember" },
        { color: "#1a6b7a", name: "Teal" },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SCard icon={Palette} title="Theme" subtitle="Light or dark mode">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{dark ? "Dark Mode" : "Light Mode"}</div>
                            <div style={{ fontSize: 11, color: t.muted, fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>Toggle between themes</div>
                        </div>
                        <motion.button onClick={toggle} style={{
                            width: 56, height: 30, borderRadius: 999,
                            background: dark ? "linear-gradient(180deg,#1a1a3a,#0a0a1a)" : "linear-gradient(180deg,#87ceeb,#b0e0f0)",
                            border: "none", cursor: "pointer", position: "relative", padding: 0,
                        }}>
                            <motion.div animate={{ x: dark ? 28 : 3 }} transition={{ type: "spring", stiffness: 420, damping: 26 }}
                                        style={{ width: 24, height: 24, borderRadius: "50%", background: dark ? "linear-gradient(135deg,#ccc,#eee)" : "linear-gradient(135deg,#ffd700,#ffaa00)", position: "absolute", top: 3, boxShadow: dark ? "none" : "0 0 8px rgba(255,200,0,0.5)" }} />
                        </motion.button>
                    </div>
                    <Divider />
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>Font Size</div>
                    <LiquidRadio options={["Small","Medium","Large"]} value={fontSize} onChange={setFontSize} />
                    <Divider />
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>Layout Density</div>
                    <PillToggle options={["Compact","Comfortable","Spacious"]} value={density} onChange={setDensity} />
                </SCard>

                <SCard icon={Palette} title="Accent Color" subtitle="Choose your brand color">
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {accents.map(a => (
                            <div key={a.color} style={{ textAlign: "center" }}>
                                <motion.div onClick={() => setAccent(a.color)} whileHover={{ scale: 1.14 }} whileTap={{ scale: 0.9 }}
                                            style={{ width: 36, height: 36, borderRadius: "50%", background: a.color, cursor: "pointer", border: accent === a.color ? "3px solid #fff" : "3px solid transparent", boxShadow: accent === a.color ? `0 0 0 2px ${a.color}` : "none", transition: "box-shadow 0.2s" }} />
                                <div style={{ fontSize: 10, color: t.muted, marginTop: 4, fontFamily: "DM Sans, sans-serif" }}>{a.name}</div>
                            </div>
                        ))}
                    </div>
                </SCard>
            </div>

            {/* Live Preview */}
            <SCard icon={Palette} title="Live Preview" subtitle="See your settings in action">
                <div style={{ background: dark ? "#0a0f08" : "#f4f7f2", borderRadius: 11, padding: 16, border: `1px solid ${t.border}`, marginBottom: 14 }}>
                    <div style={{ fontSize: fontSize === "Small" ? 11 : fontSize === "Large" ? 16 : 13.5, fontWeight: 800, color: t.text, marginBottom: 6, fontFamily: "DM Sans, sans-serif" }}>Sample Dashboard Card</div>
                    <div style={{ fontSize: fontSize === "Small" ? 10 : fontSize === "Large" ? 13 : 12, color: t.muted, lineHeight: 1.5, fontFamily: "DM Sans, sans-serif" }}>This preview updates in real-time as you adjust settings. Try changing font size, density, and accent color.</div>
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <div style={{ background: `${accent}20`, color: accent, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>Active</div>
                        <div style={{ background: "#e8a02018", color: "#c07a0a", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>Pending</div>
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[["24", "Active Needs"], ["8", "Volunteers"], ["91%", "Resolution"], ["3", "Zones"]].map(([v, l]) => (
                        <div key={l} style={{ background: dark ? "#0a0f08" : "#f4f7f2", borderRadius: 9, padding: "10px 12px", border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: 20, fontWeight: 900, color: accent, fontFamily: "DM Sans, sans-serif" }}>{v}</div>
                            <div style={{ fontSize: 10.5, color: t.muted, fontFamily: "DM Sans, sans-serif", marginTop: 2 }}>{l}</div>
                        </div>
                    ))}
                </div>
                <div style={{ background: dark ? "#0a0f08" : "#f4f7f2", borderRadius: 9, padding: "10px 14px", border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Density: {density}</span>
                    <motion.div style={{ width: 40, height: 22, borderRadius: 999, background: `linear-gradient(135deg,${accent},${accent}88)`, border: "none", cursor: "pointer", position: "relative" }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 2 }} />
                    </motion.div>
                </div>
            </SCard>
        </div>
    );
}

function PrivacyPanel() {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const [prv, setPrv] = useState({ share: true, loc: false, analytics: true });
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <SCard icon={Shield} title="Data Privacy" subtitle="Control your data sharing preferences">
                {[
                    { k: "share", label: "Data Sharing", desc: "Share anonymised usage data to improve the platform" },
                    { k: "loc",   label: "Location Sharing", desc: "Allow location for zone auto-assignment" },
                    { k: "analytics", label: "Analytics Opt-in", desc: "Participate in feature improvement analytics" },
                ].map((item, i) => (
                    <div key={item.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: i < 2 ? 20 : 0 }}>
                        <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: "DM Sans, sans-serif", maxWidth: 240 }}>{item.desc}</div>
                        </div>
                        <CosmicToggle checked={prv[item.k]} onChange={v => setPrv(p => ({...p, [item.k]: v}))} />
                    </div>
                ))}
                <Divider />
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <DownloadBtn label="Download My Data" />
                    <span style={{ fontSize: 11, color: t.muted, fontFamily: "DM Sans, sans-serif" }}>Export your data as JSON</span>
                </div>
            </SCard>

            <SCard icon={Shield} title="Privacy Status" subtitle="Current settings overview">
                {[
                    { label: "Data shared with partners", status: prv.share ? "Enabled" : "Disabled", color: prv.share ? t.green : t.muted },
                    { label: "Location services", status: prv.loc ? "Enabled" : "Disabled", color: prv.loc ? t.green : t.muted },
                    { label: "Analytics tracking", status: prv.analytics ? "Active" : "Inactive", color: prv.analytics ? t.green : t.muted },
                    { label: "Account visibility", status: "Private", color: t.accent },
                    { label: "Data retention", status: "90 days", color: t.blue },
                ].map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${t.border}` : "none" }}>
                        <span style={{ fontSize: 13, color: t.muted, fontFamily: "DM Sans, sans-serif" }}>{row.label}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: row.color, fontFamily: "DM Sans, sans-serif" }}>{row.status}</span>
                    </div>
                ))}
            </SCard>
        </div>
    );
}

function SecurityPanel({ showToast }) {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const [pw, setPw] = useState({ cur: "", nw: "", conf: "" });
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SCard icon={Lock} title="Change Password" subtitle="Keep your account secure">
                    <InputField label="Current Password" value={pw.cur} onChange={v => setPw(p => ({...p, cur: v}))} type="password" />
                    <InputField label="New Password" value={pw.nw} onChange={v => setPw(p => ({...p, nw: v}))} type="password" />
                    <InputField label="Confirm New Password" value={pw.conf} onChange={v => setPw(p => ({...p, conf: v}))} type="password" />
                    <div style={{ marginTop: 4 }}>
                        <GradientBtn onClick={() => showToast("Password changed successfully", "#2dc9a0")}>
                            <Lock size={13} /> Change Password
                        </GradientBtn>
                    </div>
                </SCard>
                <SCard icon={Lock} title="Two-Factor Auth" subtitle="Add an extra layer of security">
                    <div style={{ background: dark ? "#0a0f08" : "#f4f7f2", borderRadius: 10, padding: "14px 16px", border: `1px solid ${t.border}`, marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.muted, fontFamily: "DM Sans, sans-serif", marginBottom: 4 }}>2FA Status</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: t.amber, fontFamily: "DM Sans, sans-serif" }}>Not Enabled</div>
                    </div>
                    <GradientBtn small><Lock size={12} /> Set Up 2FA</GradientBtn>
                </SCard>
            </div>

            <SCard icon={Lock} title="Active Sessions" subtitle="Devices with access to your account">
                {sessions.map((s, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.01 }}
                                style={{ background: dark ? "#18181b" : "#f4f7f2", borderRadius: 9, overflow: "hidden", display: "flex", marginBottom: i < 2 ? 10 : 0, border: dark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(45,90,45,0.08)" }}>
                        <div style={{ width: 3, background: s.current ? `linear-gradient(180deg,#2dc9a0,#2dc9a077)` : `linear-gradient(180deg,#55555577,#33333344)`, flexShrink: 0 }} />
                        <div style={{ padding: "11px 14px", flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{s.device}</div>
                                <div style={{ fontSize: 10.5, color: t.muted, marginTop: 2, fontFamily: "DM Sans, sans-serif" }}>{s.location} · {s.time}</div>
                            </div>
                            {s.current
                                ? <span style={{ fontSize: 9.5, fontWeight: 700, color: "#2dc9a0", background: "rgba(45,201,160,0.14)", padding: "3px 8px", borderRadius: 999 }}>Current</span>
                                : <button style={{ fontSize: 11, color: t.red, background: "none", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Sign out</button>}
                        </div>
                    </motion.div>
                ))}
            </SCard>
        </div>
    );
}

function DataPanel() {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const [showDel, setShowDel] = useState(false);
    const [confirm, setConfirm] = useState("");

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SCard icon={Database} title="Export Data" subtitle="Download your account data">
                    {[
                        { label: "All Reports", desc: "Full impact and zone reports", fmt: "Export Reports" },
                        { label: "Volunteer Data", desc: "Assignments, hours, reliability", fmt: "Export Volunteers" },
                        { label: "All Data", desc: "Complete account export as JSON", fmt: "Export All" },
                    ].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? `1px solid ${t.border}` : "none" }}>
                            <div>
                                <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, fontFamily: "DM Sans, sans-serif" }}>{item.label}</div>
                                <div style={{ fontSize: 11, color: t.muted, marginTop: 1, fontFamily: "DM Sans, sans-serif" }}>{item.desc}</div>
                            </div>
                            <DownloadBtn label={item.fmt} />
                        </div>
                    ))}
                </SCard>
            </div>

            <SCard icon={AlertTriangle} title="Danger Zone" subtitle="Irreversible account actions">
                <div style={{ border: "1px solid rgba(224,90,58,0.3)", borderRadius: 11, padding: "18px", background: "rgba(224,90,58,0.04)", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <AlertTriangle size={15} color={t.red} />
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: t.red, fontFamily: "DM Sans, sans-serif" }}>Delete Account</div>
                    </div>
                    <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.6, fontFamily: "DM Sans, sans-serif", marginBottom: 14 }}>
                        Permanently removes all your data including reports, assignments, and volunteer records. This cannot be undone.
                    </div>
                    {!showDel
                        ? <GradientBtn danger small onClick={() => setShowDel(true)}><AlertTriangle size={12} /> Delete Account</GradientBtn>
                        : (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                <div style={{ fontSize: 11.5, color: t.red, marginBottom: 8, fontFamily: "DM Sans, sans-serif" }}>Type <strong>DELETE</strong> to confirm:</div>
                                <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE"
                                       style={{ width: "100%", background: dark ? "#0a0f08" : "#fff8f7", border: `1px solid ${confirm === "DELETE" ? t.red : t.border}`, borderRadius: 7, padding: "8px 12px", fontSize: 13, color: t.text, fontFamily: "DM Sans, sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 10, transition: "border-color 0.3s" }} />
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => { setShowDel(false); setConfirm(""); }} style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "6px 14px", color: t.muted, cursor: "pointer", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>Cancel</button>
                                    {confirm === "DELETE" && <GradientBtn danger small><AlertTriangle size={12} /> Confirm Delete</GradientBtn>}
                                </div>
                            </motion.div>
                        )
                    }
                </div>
            </SCard>
        </div>
    );
}

function IntegrationsPanel() {
    const { dark } = useContext(ThemeCtx);
    const t = dark ? TK.dark : TK.light;
    const [connected, setConnected] = useState({ WhatsApp: true, "Google Sheets": false, Telegram: false, Gmail: true });
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            {integrations.map((intg, i) => (
                <motion.div key={intg.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            whileHover={{ y: -3, boxShadow: dark ? "0 8px 28px rgba(0,0,0,0.35)" : "0 8px 22px rgba(45,90,45,0.10)" }}
                            style={{ background: dark ? "#1c2a18" : "#fff", borderRadius: 13, padding: "20px 20px", border: connected[intg.name] ? `1px solid rgba(45,201,160,0.28)` : `1px solid ${t.border}`, cursor: "pointer", position: "relative", overflow: "hidden" }}>
                    {connected[intg.name] && (
                        <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 36px 36px 0", borderColor: `transparent #2dc9a0 transparent transparent` }}>
                            <Check size={10} color="#fff" style={{ position: "absolute", top: 4, right: -30 }} />
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ fontSize: 30 }}>{intg.icon}</div>
                        {connected[intg.name]
                            ? <span style={{ background: "rgba(45,201,160,0.14)", color: "#2dc9a0", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>Connected</span>
                            : <span style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(45,90,45,0.06)", color: t.muted, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>Not Connected</span>
                        }
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: t.text, marginBottom: 5, fontFamily: "DM Sans, sans-serif" }}>{intg.name}</div>
                    <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginBottom: 14, fontFamily: "DM Sans, sans-serif" }}>{intg.desc}</div>
                    {connected[intg.name]
                        ? <button onClick={() => setConnected(c => ({...c, [intg.name]: false}))} style={{ background: "none", border: `1px solid rgba(224,90,58,0.3)`, borderRadius: 7, padding: "6px 13px", fontSize: 11.5, color: t.red, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Disconnect</button>
                        : <button onClick={() => setConnected(c => ({...c, [intg.name]: true}))} style={{ background: `${t.accent}15`, border: `1px solid ${t.border}`, borderRadius: 7, padding: "6px 13px", fontSize: 11.5, color: t.accent, cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Connect</button>
                    }
                </motion.div>
            ))}
        </div>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const [dark, setDark] = useState(false);
    const [exp, setExp] = useState(true);
    const [tab, setTab] = useState("profile");
    const [toast, setToast] = useState(null);
    const t = dark ? TK.dark : TK.light;
    const sw = exp ? 220 : 68;
    const showToast = (msg, color = "#2dc9a0") => setToast({ msg, color });

    const activeIdx = TABS.findIndex(t => t.id === tab);

    const renderContent = () => {
        switch (tab) {
            case "profile":       return <ProfilePanel showToast={showToast} />;
            case "notifications": return <NotificationsPanel />;
            case "appearance":    return <AppearancePanel />;
            case "privacy":       return <PrivacyPanel />;
            case "security":      return <SecurityPanel showToast={showToast} />;
            case "data":          return <DataPanel />;
            case "integrations":  return <IntegrationsPanel />;
            default: return null;
        }
    };

    return (
        <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
            <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "DM Sans, sans-serif", color: t.text, display: "flex" }}>
                <Sidebar exp={exp} onToggle={() => setExp(v => !v)} />

                <motion.main animate={{ marginLeft: sw }} transition={{ type: "spring", stiffness: 320, damping: 32 }}
                             style={{ flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

                    {/* Topbar */}
                    <div style={{ background: dark ? "#111a0e" : "#eef2eb", borderBottom: `1px solid ${t.border}`, padding: "0 24px", height: 62, display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: t.text, fontFamily: "DM Sans, sans-serif" }}>Settings</div>
                    </div>

                    {/* Horizontal Tabs — exactly like screenshot */}
                    <div style={{ background: dark ? "#111a0e" : "#eef2eb", borderBottom: `1px solid ${t.border}`, padding: "0 24px", flexShrink: 0, position: "relative" }}>
                        <div style={{ display: "flex", gap: 0, position: "relative" }}>
                            {TABS.map(({ id, Icon, label }) => {
                                const isActive = tab === id;
                                return (
                                    <button key={id} onClick={() => setTab(id)} style={{
                                        display: "flex", alignItems: "center", gap: 7,
                                        padding: "12px 16px",
                                        background: "transparent", border: "none",
                                        cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                                        color: isActive ? t.accent : t.muted,
                                        position: "relative", whiteSpace: "nowrap",
                                        transition: "color 0.2s",
                                    }}>
                                        <Icon size={13} />
                                        {label}
                                        {isActive && (
                                            <motion.div layoutId="tab-underline"
                                                        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: t.accent, borderRadius: "2px 2px 0 0" }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content — fills remaining height, no scroll */}
                    <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
                        <AnimatePresence mode="wait">
                            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }}>
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.main>

                <AnimatePresence>
                    {toast && <Toast key="t" msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
                </AnimatePresence>
            </div>
        </ThemeCtx.Provider>
    );
}