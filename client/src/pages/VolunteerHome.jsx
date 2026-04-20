import { useState, useEffect, useContext, createContext, useRef } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue, animate } from "framer-motion";
import {
    Sun, Moon, Bell, Home, CheckSquare, Map, Trophy, MessageCircle, User,
    LogOut, ChevronRight, ChevronLeft, Search, Filter, MoreHorizontal,
    TrendingUp, TrendingDown, Star, Flame, Clock, Award, Send, Smile,
    AlertCircle, Droplets, ShoppingBag, HeartPulse, BookOpen, Menu, X,
    Check, Circle, Zap, ArrowUp, ArrowDown
} from "lucide-react";

// ─── Theme Context ─────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);
const useTheme = () => useContext(ThemeContext);

const LIGHT = {
    bg:        "#F0F4ED",
    surface:   "#FFFFFF",
    card:      "#FFFFFF",
    text:      "#1a2e10",
    textSub:   "#5a7a4a",
    green:     "#3D8A25",
    greenSoft: "#e8f5e0",
    border:    "rgba(61,138,37,0.15)",
    sidebar:   "#FFFFFF",
    topbar:    "#FFFFFF",
    input:     "#F0F4ED",
    shimmer:   "rgba(255,255,255,0.6)",
};

const DARK = {
    bg:        "#0a0f08",
    surface:   "#111a0e",
    card:      "#1c2a18",
    text:      "#edf5e0",
    textSub:   "#8ab870",
    green:     "#78b450",
    greenSoft: "rgba(120,180,80,0.12)",
    border:    "rgba(120,180,80,0.12)",
    sidebar:   "#0d150a",
    topbar:    "#111a0e",
    input:     "#0d150a",
    shimmer:   "rgba(120,180,80,0.08)",
};

// ─── Utility: Animated Counter ────────────────────────────────────────────────
function AnimatedCounter({ to, duration = 1.2, suffix = "" }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        const controls = animate(0, to, {
            duration,
            onUpdate: (v) => setVal(Math.round(v)),
            ease: "easeOut",
        });
        return controls.stop;
    }, [to]);
    return <span>{val}{suffix}</span>;
}

// ─── Tiny Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
    const max = Math.max(...data, 1);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24 }}>
            {data.map((v, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / max) * 100}%` }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                    style={{ width: 5, background: color, borderRadius: 2, minHeight: 2 }}
                />
            ))}
        </div>
    );
}

// ─── Mini Heatmap (28 days) ───────────────────────────────────────────────────
function MiniHeatmap({ C }) {
    const data = Array.from({ length: 28 }, (_, i) =>
        Math.floor(Math.random() * 4)
    );
    const colors = ["#e8f5e0", "#a8d878", "#68b840", "#3D8A25"];
    const darkColors = ["#1c2a18", "#2d4a20", "#4a7a30", "#78b450"];
    return (
        <div>
            <p style={{ fontSize: 11, color: C.textSub, marginBottom: 8, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Activity — last 28 days
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {data.map((v, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02, type: "spring" }}
                        title={`${v} tasks`}
                        style={{
                            width: "100%",
                            paddingTop: "100%",
                            borderRadius: 3,
                            background: C === DARK ? darkColors[v] : colors[v],
                            cursor: "default",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "tasks",     label: "Tasks",     icon: CheckSquare },
    { id: "map",       label: "Zone Map",  icon: Map },
    { id: "leaderboard", label: "Leaders", icon: Trophy },
    { id: "messages",  label: "Messages",  icon: MessageCircle },
    { id: "profile",   label: "Profile",   icon: User },
];

const todaySparkline = [1, 0, 2, 1, 3, 2, 2];

function Sidebar({ page, setPage, C, dark }) {
    const [collapsed, setCollapsed] = useState(false);
    const [hoveredNav, setHoveredNav] = useState(null);

    return (
        <motion.div
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
                background: C.sidebar,
                borderRight: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
            }}
        >
            {/* Animated gradient edge line */}
            <motion.div
                animate={{ backgroundPosition: ["0% 0%", "0% 100%", "0% 0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{
                    position: "absolute",
                    left: 0, top: 0, bottom: 0, width: 3,
                    background: dark
                        ? "linear-gradient(180deg, transparent, #78b450, #3D8A25, #78b450, transparent)"
                        : "linear-gradient(180deg, transparent, #3D8A25, #78b450, #3D8A25, transparent)",
                    backgroundSize: "100% 200%",
                    zIndex: 10,
                }}
            />

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    position: "absolute", right: -12, top: 24, zIndex: 20,
                    width: 24, height: 24, borderRadius: "50%",
                    background: C.green, color: "#fff", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 2px 8px ${C.green}40`,
                }}
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* Logo */}
            <div style={{ padding: "20px 16px 12px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `linear-gradient(135deg, ${C.green}, #5ab030)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <Zap size={18} color="#fff" fill="#fff" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={{ fontWeight: 800, fontSize: 16, color: C.text, letterSpacing: "-0.02em" }}
                            >
                                CivicPulse
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Avatar with spinning ring */}
            <div style={{ padding: "16px 0", display: "flex", justifyContent: "center", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ position: "relative", width: collapsed ? 40 : 64, transition: "width 0.3s" }}>
                    {/* Spinning ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: "absolute", inset: -3,
                            borderRadius: "50%",
                            background: `conic-gradient(${C.green} 75%, transparent 75%)`,
                            padding: 2,
                        }}
                    />
                    <div style={{
                        width: collapsed ? 40 : 64, height: collapsed ? 40 : 64,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${C.green}, #a8d878)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: collapsed ? 14 : 22,
                        position: "relative", zIndex: 1,
                        border: `3px solid ${C.sidebar}`,
                        transition: "all 0.3s",
                    }}>
                        AK
                    </div>
                    {/* Impact score arc label */}
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                                    background: C.green, color: "#fff", fontSize: 9, fontWeight: 700,
                                    padding: "1px 6px", borderRadius: 8, whiteSpace: "nowrap",
                                }}
                            >
                                ⚡ 847 pts
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = page === item.id;
                    const hovered = hoveredNav === item.id;
                    return (
                        <div
                            key={item.id}
                            onClick={() => setPage(item.id)}
                            onMouseEnter={() => setHoveredNav(item.id)}
                            onMouseLeave={() => setHoveredNav(null)}
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: collapsed ? "12px 0" : "10px 12px",
                                justifyContent: collapsed ? "center" : "flex-start",
                                borderRadius: 10,
                                marginBottom: 2,
                                cursor: "pointer",
                                background: active ? C.greenSoft : "transparent",
                                color: active ? C.green : C.textSub,
                                fontWeight: active ? 700 : 500,
                                fontSize: 14,
                                transition: "all 0.15s",
                                overflow: "hidden",
                            }}
                        >
                            {/* Hover slide-in accent */}
                            <motion.div
                                animate={{ scaleY: hovered || active ? 1 : 0 }}
                                style={{
                                    position: "absolute", left: 0, top: "20%", bottom: "20%",
                                    width: 3, background: C.green, borderRadius: "0 3px 3px 0",
                                    transformOrigin: "top",
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* Today's Impact widget */}
            <div style={{ borderTop: `1px solid ${C.border}`, padding: collapsed ? "12px 0" : "12px 16px" }}>
                <AnimatePresence mode="wait">
                    {collapsed ? (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: "center", fontSize: 18 }}
                        >
                            ✅
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <p style={{ fontSize: 11, color: C.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                Today's Impact
                            </p>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: C.text }}>✅ 2 done</span>
                                <span style={{ fontSize: 12, color: C.text }}>⏱ 3.5h</span>
                            </div>
                            <Sparkline data={todaySparkline} color={C.green} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logout */}
            <div
                style={{
                    padding: collapsed ? "12px 0" : "12px 16px",
                    borderTop: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", gap: 10,
                    justifyContent: collapsed ? "center" : "flex-start",
                    cursor: "pointer", color: C.textSub, fontSize: 14,
                }}
            >
                <LogOut size={18} />
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            Logout
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ page, dark, setDark, C }) {
    const pageLabels = {
        dashboard: "Dashboard", tasks: "My Tasks", map: "Zone Map",
        leaderboard: "Leaderboard", messages: "Messages", profile: "Profile",
    };
    return (
        <div style={{
            height: 60, background: C.topbar, borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px", flexShrink: 0,
        }}>
            <div>
                <p style={{ fontSize: 11, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    CivicPulse Volunteer
                </p>
                <h1 style={{ fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                    {pageLabels[page]}
                </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Notifications */}
                <div style={{ position: "relative", cursor: "pointer" }}>
                    <Bell size={20} color={C.textSub} />
                    <div style={{
                        position: "absolute", top: -3, right: -3, width: 8, height: 8,
                        background: "#ff4444", borderRadius: "50%",
                    }} />
                </div>
                {/* Dark/Light toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDark(!dark)}
                    style={{
                        width: 40, height: 22, borderRadius: 11,
                        background: dark ? C.green : C.border,
                        border: "none", cursor: "pointer", position: "relative",
                        display: "flex", alignItems: "center",
                        padding: "0 3px",
                    }}
                >
                    <motion.div
                        animate={{ x: dark ? 18 : 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{
                            width: 16, height: 16, borderRadius: "50%",
                            background: dark ? "#fff" : C.green,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        {dark ? <Moon size={9} color={C.green} /> : <Sun size={9} color="#fff" />}
                    </motion.div>
                </motion.button>
            </div>
        </div>
    );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const STATS = [
    { label: "Tasks Done", value: 24, icon: CheckSquare, suffix: "", trend: "up", delta: "+3" },
    { label: "Hours Logged", value: 48, icon: Clock, suffix: "h", trend: "up", delta: "+2h" },
    { label: "Impact Score", value: 847, icon: Star, suffix: "", trend: "up", delta: "+12" },
    { label: "Day Streak", value: 7, icon: Flame, suffix: "d", trend: "up", delta: "🔥" },
];

const ACTIVE_TASKS = [
    { id: 1, title: "Distribute food packets in Dharavi North", cat: "Food", color: "#f59e0b", dueIn: "2h", progress: 60 },
    { id: 2, title: "Medical camp setup — Block C", cat: "Medical", color: "#ef4444", dueIn: "4h", progress: 30 },
    { id: 3, title: "Water filter installation — Ward 7", cat: "Water", color: "#3b82f6", dueIn: "Tomorrow", progress: 0 },
];

function StatCard({ stat, C, index }) {
    const Icon = stat.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "20px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <p style={{ fontSize: 12, color: C.textSub, fontWeight: 600, marginBottom: 4 }}>{stat.label}</p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                        <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                    </p>
                </div>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={18} color={C.green} />
                </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {stat.trend === "up" ? <ArrowUp size={12} color="#22c55e" /> : <ArrowDown size={12} color="#ef4444" />}
                </motion.div>
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>{stat.delta} this week</span>
            </div>
        </motion.div>
    );
}

function DashboardPage({ C, dark }) {
    return (
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            {/* Animated mesh welcome banner */}
            <motion.div
                style={{
                    borderRadius: 20,
                    padding: "28px 32px",
                    marginBottom: 24,
                    position: "relative",
                    overflow: "hidden",
                    background: dark
                        ? "linear-gradient(135deg, #1c2a18, #0d1f0a)"
                        : "linear-gradient(135deg, #e8f5e0, #d0ecc0)",
                }}
            >
                {/* Animated mesh radials */}
                {[
                    { color: dark ? "#78b45030" : "#3D8A2520", x: "10%", y: "20%" },
                    { color: dark ? "#5ab03020" : "#78b45030", x: "60%", y: "70%" },
                    { color: dark ? "#3D8A2515" : "#a8d87820", x: "80%", y: "10%" },
                ].map((r, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            x: [0, 20, -10, 0],
                            y: [0, -15, 10, 0],
                        }}
                        transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i }}
                        style={{
                            position: "absolute",
                            width: 300, height: 300,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${r.color} 0%, transparent 70%)`,
                            left: r.x, top: r.y,
                            transform: "translate(-50%, -50%)",
                            pointerEvents: "none",
                        }}
                    />
                ))}
                <div style={{ position: "relative" }}>
                    <p style={{ fontSize: 13, color: C.textSub, fontWeight: 600, marginBottom: 4 }}>
                        Good morning 🌿
                    </p>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                        Hey, Aryan! Ready to help?
                    </h2>
                    <p style={{ fontSize: 14, color: C.textSub }}>
                        You've impacted <strong style={{ color: C.green }}>3 zones</strong> this week. Keep it up!
                    </p>
                </div>
            </motion.div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {STATS.map((s, i) => <StatCard key={s.label} stat={s} C={C} index={i} />)}
            </div>

            {/* Mini Activity Heatmap */}
            <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 20, marginBottom: 24,
            }}>
                <MiniHeatmap C={C} dark={dark} />
            </div>

            {/* Active Tasks */}
            <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 20,
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>Active Tasks</h3>
                    <span style={{ fontSize: 12, color: C.green, fontWeight: 600, cursor: "pointer" }}>View all →</span>
                </div>
                {ACTIVE_TASKS.map((t, i) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                        style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "12px 0",
                            borderBottom: i < ACTIVE_TASKS.length - 1 ? `1px solid ${C.border}` : "none",
                            position: "relative",
                        }}
                    >
                        {/* Pulsing left border */}
                        <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                position: "absolute", left: -20, top: 8, bottom: 8,
                                width: 3, background: t.color, borderRadius: "0 3px 3px 0",
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{t.title}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: t.color + "22", color: t.color,
                }}>
                  {t.cat}
                </span>
                                <span style={{ fontSize: 11, color: C.textSub }}>Due in {t.dueIn}</span>
                            </div>
                        </div>
                        <div style={{ width: 60 }}>
                            <div style={{
                                height: 4, background: C.greenSoft, borderRadius: 4, overflow: "hidden",
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${t.progress}%` }}
                                    transition={{ delay: i * 0.1 + 0.5, duration: 0.8 }}
                                    style={{ height: "100%", background: t.color, borderRadius: 4 }}
                                />
                            </div>
                            <p style={{ fontSize: 10, color: C.textSub, marginTop: 3, textAlign: "right" }}>{t.progress}%</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── Tasks Page ───────────────────────────────────────────────────────────────
const ALL_TASKS = [
    { id: 1, title: "Distribute food packets — Dharavi North", cat: "Food",    color: "#f59e0b", priority: "High",   dueIn: "2h",      done: false },
    { id: 2, title: "Medical camp setup — Block C",           cat: "Medical",  color: "#ef4444", priority: "High",   dueIn: "4h",      done: false },
    { id: 3, title: "Water filter installation — Ward 7",     cat: "Water",    color: "#3b82f6", priority: "Medium", dueIn: "Tomorrow",done: false },
    { id: 4, title: "Education kit delivery — School 4",      cat: "Education",color: "#8b5cf6", priority: "Low",    dueIn: "2 days",  done: false },
    { id: 5, title: "Shelter survey — Zone B",                cat: "Shelter",  color: "#10b981", priority: "Medium", dueIn: "Today",   done: true  },
    { id: 6, title: "Food audit — Community Kitchen",         cat: "Food",     color: "#f59e0b", priority: "Low",    dueIn: "3 days",  done: true  },
];

const PLACEHOLDERS = ["Search medical tasks...", "Search water tasks...", "Search food tasks...", "Search shelter tasks..."];
const FILTERS = ["All", "Food", "Medical", "Water", "Education", "Shelter"];

function TasksPage({ C }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [tasks, setTasks] = useState(ALL_TASKS);
    const [phIdx, setPhIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 2000);
        return () => clearInterval(t);
    }, []);

    const toggleDone = (id) => {
        setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const filtered = tasks.filter(t =>
        (filter === "All" || t.cat === filter) &&
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            {/* Search bar */}
            <div style={{ position: "relative", marginBottom: 16 }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.textSub }} />
                <AnimatePresence mode="wait">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={PLACEHOLDERS[phIdx]}
                        style={{
                            width: "100%", boxSizing: "border-box",
                            padding: "12px 16px 12px 40px",
                            borderRadius: 12, border: `1px solid ${C.border}`,
                            background: C.input, color: C.text, fontSize: 14,
                            outline: "none", fontFamily: "Outfit, sans-serif",
                        }}
                    />
                </AnimatePresence>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {FILTERS.map(f => (
                    <div
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            position: "relative",
                            padding: "6px 16px",
                            borderRadius: 20,
                            cursor: "pointer",
                            fontSize: 13, fontWeight: filter === f ? 700 : 500,
                            color: filter === f ? C.green : C.textSub,
                            background: filter === f ? C.greenSoft : "transparent",
                            border: `1px solid ${filter === f ? C.green : C.border}`,
                            transition: "all 0.2s",
                            overflow: "hidden",
                        }}
                    >
                        {f}
                    </div>
                ))}
            </div>

            {/* Task rows with staggered entrance */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((task, i) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
                        style={{
                            background: C.card, border: `1px solid ${C.border}`,
                            borderRadius: 12, padding: "14px 16px",
                            display: "flex", alignItems: "center", gap: 14,
                            borderLeft: `4px solid ${task.color}`,
                            opacity: task.done ? 0.6 : 1,
                        }}
                    >
                        <motion.div
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleDone(task.id)}
                            style={{
                                width: 22, height: 22, borderRadius: "50%",
                                border: `2px solid ${task.done ? C.green : C.border}`,
                                background: task.done ? C.green : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                            }}
                        >
                            {task.done && <Check size={12} color="#fff" />}
                        </motion.div>

                        <div style={{ flex: 1 }}>
                            <motion.p
                                animate={{ opacity: task.done ? 0.5 : 1 }}
                                style={{
                                    fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4,
                                    textDecoration: task.done ? "line-through" : "none",
                                    transition: "text-decoration 0.3s",
                                }}
                            >
                                {task.title}
                            </motion.p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: task.color + "22", color: task.color }}>
                  {task.cat}
                </span>
                                <span style={{ fontSize: 11, color: C.textSub }}>Due: {task.dueIn}</span>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                                    background: task.priority === "High" ? "#ef444422" : task.priority === "Medium" ? "#f59e0b22" : "#6b728022",
                                    color: task.priority === "High" ? "#ef4444" : task.priority === "Medium" ? "#f59e0b" : "#6b7280",
                                }}>
                  {task.priority}
                </span>
                            </div>
                        </div>

                        <ChevronRight size={16} color={C.textSub} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── Heatmap / Map Page ───────────────────────────────────────────────────────
const ZONES = [
    { id: 1, name: "Dharavi",  x: 38, y: 55, needs: 12, active: true,  color: "#ef4444" },
    { id: 2, name: "Kurla",    x: 62, y: 40, needs: 7,  active: false, color: "#f59e0b" },
    { id: 3, name: "Sion",     x: 50, y: 65, needs: 5,  active: false, color: "#f59e0b" },
    { id: 4, name: "Mahim",    x: 28, y: 48, needs: 9,  active: false, color: "#ef4444" },
    { id: 5, name: "Bandra",   x: 20, y: 38, needs: 3,  active: false, color: "#22c55e" },
    { id: 6, name: "Andheri",  x: 45, y: 22, needs: 6,  active: false, color: "#f59e0b" },
];

function MapPage({ C, dark }) {
    const [hovered, setHovered] = useState(null);
    const [scanY, setScanY] = useState(0);
    const [scanY2, setScanY2] = useState(100);

    useEffect(() => {
        let frame;
        let t = 0;
        const loop = () => {
            t += 0.5;
            setScanY((t % 100));
            setScanY2((100 - (t % 100)));
            frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                {[
                    { color: "#ef4444", label: "Critical (10+)" },
                    { color: "#f59e0b", label: "Moderate (5–9)" },
                    { color: "#22c55e", label: "Stable (<5)" },
                ].map((l, i) => (
                    <motion.div
                        key={l.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
                        <span style={{ fontSize: 12, color: C.textSub }}>{l.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Map area */}
            <div style={{
                position: "relative",
                background: dark ? "#0a1208" : "#d4e8c8",
                borderRadius: 20,
                height: 420,
                overflow: "hidden",
                border: `1px solid ${C.border}`,
            }}>
                {/* Grid lines */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1 }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <g key={i}>
                            <line x1={`${i * 10}%`} y1="0%" x2={`${i * 10}%`} y2="100%" stroke={C.green} strokeWidth={0.5} />
                            <line x1="0%" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke={C.green} strokeWidth={0.5} />
                        </g>
                    ))}
                </svg>

                {/* Dual scan lines */}
                <div style={{
                    position: "absolute", left: 0, right: 0,
                    top: `${scanY}%`, height: 2,
                    background: `linear-gradient(90deg, transparent, ${C.green}80, ${C.green}, ${C.green}80, transparent)`,
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", left: 0, right: 0,
                    top: `${scanY2}%`, height: 2,
                    background: `linear-gradient(90deg, transparent, #78b45040, #78b450, #78b45040, transparent)`,
                    pointerEvents: "none",
                }} />

                {/* Zones */}
                {ZONES.map(z => (
                    <div
                        key={z.id}
                        onMouseEnter={() => setHovered(z.id)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            position: "absolute",
                            left: `${z.x}%`,
                            top: `${z.y}%`,
                            transform: "translate(-50%, -50%)",
                            cursor: "pointer",
                        }}
                    >
                        {/* Pulse ring(s) */}
                        {z.active ? (
                            <>
                                {[1, 2, 3].map(ring => (
                                    <motion.div
                                        key={ring}
                                        animate={{ scale: [1, 2.5 + ring * 0.5], opacity: [0.6, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: ring * 0.4, ease: "easeOut" }}
                                        style={{
                                            position: "absolute",
                                            width: 18, height: 18, borderRadius: "50%",
                                            border: `2px solid ${z.color}`,
                                            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                                        }}
                                    />
                                ))}
                            </>
                        ) : (
                            <motion.div
                                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                style={{
                                    position: "absolute",
                                    width: 14, height: 14, borderRadius: "50%",
                                    border: `2px solid ${z.color}`,
                                    top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                                }}
                            />
                        )}

                        {/* Dot */}
                        <div style={{
                            width: z.active ? 18 : 14, height: z.active ? 18 : 14,
                            borderRadius: "50%", background: z.color,
                            border: "2px solid #fff",
                            boxShadow: `0 0 ${z.active ? 12 : 6}px ${z.color}80`,
                            position: "relative", zIndex: 2,
                        }} />

                        {/* Tooltip */}
                        <AnimatePresence>
                            {hovered === z.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    style={{
                                        position: "absolute",
                                        bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                                        background: C.card,
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 10, padding: "8px 12px",
                                        whiteSpace: "nowrap", zIndex: 10,
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                    }}
                                >
                                    <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{z.name}</p>
                                    <p style={{ fontSize: 11, color: C.textSub }}>{z.needs} active needs</p>
                                    {z.active && <p style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>🎯 Your Zone</p>}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Leaderboard Page ─────────────────────────────────────────────────────────
const LEADERS = [
    { rank: 1, name: "Priya S.",    score: 1240, avatar: "PS", you: false },
    { rank: 2, name: "Aryan K.",    score: 847,  avatar: "AK", you: true  },
    { rank: 3, name: "Meera R.",    score: 790,  avatar: "MR", you: false },
    { rank: 4, name: "Dev P.",      score: 680,  avatar: "DP", you: false },
    { rank: 5, name: "Sunita B.",   score: 620,  avatar: "SB", you: false },
    { rank: 6, name: "Rahul M.",    score: 580,  avatar: "RM", you: false },
];

const PODIUM = [
    { rank: 2, name: "Aryan K.", score: 847, color: "#C0C0C0", height: 120 },
    { rank: 1, name: "Priya S.", score: 1240, color: "#FFD700", height: 160 },
    { rank: 3, name: "Meera R.", score: 790, color: "#CD7F32", height: 100 },
];

function LeaderboardPage({ C, dark }) {
    const myScore = 847;
    const nextScore = 1240;
    const progress = (myScore / nextScore) * 100;

    return (
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            {/* Points to next rank */}
            <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 20, marginBottom: 24,
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Points to Rank #1</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{nextScore - myScore} pts to go</span>
                </div>
                <div style={{ height: 8, background: C.greenSoft, borderRadius: 8, overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        style={{
                            height: "100%",
                            background: `linear-gradient(90deg, ${C.green}, #a8d878)`,
                            borderRadius: 8,
                        }}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: C.textSub }}>You: {myScore}</span>
                    <span style={{ fontSize: 11, color: C.textSub }}>Priya: {nextScore}</span>
                </div>
            </div>

            {/* Podium */}
            <div style={{
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                gap: 12, marginBottom: 32, padding: "0 20px",
            }}>
                {PODIUM.map((p, i) => (
                    <div key={p.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: C.textSub }}>{p.score} pts</p>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: p.height }}
                            transition={{ type: "spring", stiffness: 150, damping: 18, delay: i * 0.1 + 0.3 }}
                            style={{
                                width: 80,
                                background: `linear-gradient(180deg, ${p.color}60, ${p.color}30)`,
                                border: `2px solid ${p.color}`,
                                borderRadius: "8px 8px 0 0",
                                display: "flex", alignItems: "flex-start", justifyContent: "center",
                                paddingTop: 10,
                                fontSize: 22,
                            }}
                        >
                            {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : "🥉"}
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {LEADERS.map((l, i) => (
                    <motion.div
                        key={l.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 + 0.5 }}
                        style={{
                            background: l.you
                                ? (dark ? "rgba(120,180,80,0.12)" : "rgba(61,138,37,0.07)")
                                : C.card,
                            border: `1px solid ${l.you ? C.green : C.border}`,
                            borderRadius: 12, padding: "12px 16px",
                            display: "flex", alignItems: "center", gap: 14,
                            position: "relative", overflow: "hidden",
                        }}
                    >
                        {/* Shimmer on "you" row */}
                        {l.you && (
                            <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                                style={{
                                    position: "absolute", inset: 0,
                                    background: "linear-gradient(90deg, transparent, rgba(120,180,80,0.15), transparent)",
                                    pointerEvents: "none",
                                }}
                            />
                        )}
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.textSub, width: 24 }}>
              {l.rank === 1 ? "🥇" : l.rank === 2 ? "🥈" : l.rank === 3 ? "🥉" : `#${l.rank}`}
            </span>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${C.green}, #a8d878)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: 12,
                        }}>
                            {l.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: l.you ? 700 : 500, color: C.text }}>
                                {l.name} {l.you && <span style={{ fontSize: 11, color: C.green }}>(you)</span>}
                            </p>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: C.green }}>{l.score}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── Messages Page ────────────────────────────────────────────────────────────
const CONTACTS = [
    { id: 1, name: "Coordinator Meena", online: true,  last: "Task updated ✅" },
    { id: 2, name: "Volunteer Priya",   online: true,  last: "On my way!" },
    { id: 3, name: "NGO Helpdesk",      online: false, last: "Thank you for your help" },
];

const CONVO = [
    { id: 1, from: "them", text: "Hey Aryan! Block C needs support ASAP.", time: "10:02" },
    { id: 2, from: "me",   text: "On it! Heading there in 20 mins.", time: "10:04" },
    { id: 3, from: "them", text: "Thank you! Bring the medical kit.", time: "10:05" },
    { id: 4, from: "me",   text: "Got it. Will update once I reach.", time: "10:06" },
];

const EMOJIS = ["👍", "❤️", "😄", "🎉", "🙏"];

function MessagesPage({ C }) {
    const [active, setActive] = useState(1);
    const [inputFocused, setInputFocused] = useState(false);
    const [msg, setMsg] = useState("");
    const [messages, setMessages] = useState(CONVO);
    const [reactionMsg, setReactionMsg] = useState(null);

    const sendMsg = () => {
        if (!msg.trim()) return;
        setMessages(m => [...m, { id: Date.now(), from: "me", text: msg, time: "Now" }]);
        setMsg("");
    };

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* Contact list */}
            <div style={{
                width: 220, borderRight: `1px solid ${C.border}`,
                background: C.surface, padding: 16, overflowY: "auto",
            }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    Conversations
                </p>
                {CONTACTS.map(c => (
                    <div
                        key={c.id}
                        onClick={() => setActive(c.id)}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                            background: active === c.id ? C.greenSoft : "transparent",
                            marginBottom: 4,
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: `linear-gradient(135deg, ${C.green}, #a8d878)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontWeight: 700, fontSize: 11,
                            }}>
                                {c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                            </div>
                            {c.online && (
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{
                                        position: "absolute", bottom: 0, right: 0,
                                        width: 9, height: 9, borderRadius: "50%",
                                        background: "#22c55e",
                                        border: "2px solid " + C.surface,
                                        boxShadow: "0 0 6px #22c55e",
                                    }}
                                />
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {c.name}
                            </p>
                            <p style={{ fontSize: 11, color: C.textSub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {c.last}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat panel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Header */}
                <div style={{
                    height: 56, borderBottom: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", padding: "0 20px", gap: 10,
                    background: C.surface,
                }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.green}, #a8d878)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>
                        CM
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>Coordinator Meena</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <motion.div
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                            />
                            <p style={{ fontSize: 11, color: "#22c55e" }}>Online</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    {messages.map((m, i) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            onMouseEnter={() => setReactionMsg(m.id)}
                            onMouseLeave={() => setReactionMsg(null)}
                            style={{
                                display: "flex",
                                flexDirection: m.from === "me" ? "row-reverse" : "row",
                                alignItems: "flex-end", gap: 8,
                                position: "relative",
                            }}
                        >
                            <div style={{
                                maxWidth: "65%",
                                padding: "10px 14px", borderRadius: m.from === "me" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                                background: m.from === "me" ? C.green : C.card,
                                color: m.from === "me" ? "#fff" : C.text,
                                fontSize: 14,
                                border: m.from === "me" ? "none" : `1px solid ${C.border}`,
                            }}>
                                {m.text}
                                <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{m.time}</p>
                            </div>

                            {/* Emoji reaction picker */}
                            <AnimatePresence>
                                {reactionMsg === m.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 4 }}
                                        style={{
                                            display: "flex", gap: 4,
                                            background: C.card, border: `1px solid ${C.border}`,
                                            borderRadius: 20, padding: "4px 8px",
                                            position: "absolute",
                                            bottom: "100%",
                                            [m.from === "me" ? "right" : "left"]: 0,
                                            zIndex: 10, marginBottom: 4,
                                        }}
                                    >
                                        {EMOJIS.map(e => (
                                            <motion.span
                                                key={e}
                                                whileHover={{ scale: 1.4 }}
                                                style={{ cursor: "pointer", fontSize: 16 }}
                                            >
                                                {e}
                                            </motion.span>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Input */}
                <div style={{
                    padding: "12px 20px", borderTop: `1px solid ${C.border}`,
                    display: "flex", gap: 10, background: C.surface,
                }}>
                    <input
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        onKeyDown={e => e.key === "Enter" && sendMsg()}
                        placeholder="Type a message..."
                        style={{
                            flex: 1, padding: "10px 16px",
                            borderRadius: 24,
                            border: `1.5px solid ${inputFocused ? C.green : C.border}`,
                            background: C.input, color: C.text,
                            fontSize: 14, outline: "none",
                            fontFamily: "Outfit, sans-serif",
                            boxShadow: inputFocused ? `0 0 0 3px ${C.green}22` : "none",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={sendMsg}
                        style={{
                            width: 44, height: 44, borderRadius: "50%",
                            background: C.green, border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <Send size={18} color="#fff" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
const BADGES = [
    { icon: "🌿", label: "Green Start",  unlocked: true },
    { icon: "🔥", label: "7-Day Streak", unlocked: true },
    { icon: "⚡", label: "Speed Helper", unlocked: true },
    { icon: "💧", label: "Water Hero",   unlocked: false },
    { icon: "🏥", label: "Med Support",  unlocked: false },
    { icon: "🎓", label: "Edu Guide",    unlocked: false },
];

const SKILLS = [
    { name: "Medical Aid",   level: 80 },
    { name: "Food Distrib.", level: 65 },
    { name: "Navigation",   level: 90 },
    { name: "Reporting",    level: 55 },
];

const ACTIVITY_BARS = [2, 5, 3, 7, 4, 6, 4];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ProfilePage({ C, dark }) {
    return (
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            {/* Avatar + info */}
            <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 20, padding: 28, marginBottom: 20,
                display: "flex", gap: 24, alignItems: "center",
            }}>
                {/* Rotating gradient ring avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: "absolute", inset: -4,
                            borderRadius: "50%",
                            background: `conic-gradient(${C.green}, #a8d878, #f59e0b, ${C.green})`,
                        }}
                    />
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${C.green}, #5ab030)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: 28,
                        position: "relative", zIndex: 1,
                        border: `4px solid ${C.card}`,
                    }}>
                        AK
                    </div>
                </div>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Aryan Kumar</h2>
                    <p style={{ fontSize: 13, color: C.textSub, marginBottom: 8 }}>Zone: Dharavi · Joined: Jan 2024</p>
                    <div style={{ display: "flex", gap: 16 }}>
                        {[{ l: "Tasks Done", v: 24 }, { l: "Hours", v: "48h" }, { l: "Score", v: 847 }].map(s => (
                            <div key={s.l}>
                                <p style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{s.v}</p>
                                <p style={{ fontSize: 11, color: C.textSub }}>{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Activity chart */}
            <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 20, marginBottom: 20,
            }}>
                <p style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 16 }}>Weekly Activity</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 80 }}>
                    {ACTIVITY_BARS.map((v, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(v / 7) * 100}%` }}
                                transition={{ type: "spring", stiffness: 150, delay: i * 0.08 + 0.3 }}
                                style={{
                                    width: "100%",
                                    background: `linear-gradient(180deg, ${C.green}, #a8d878)`,
                                    borderRadius: 6,
                                    minHeight: 4,
                                }}
                            />
                            <p style={{ fontSize: 10, color: C.textSub }}>{DAYS[i]}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges */}
            <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 20, marginBottom: 20,
            }}>
                <p style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 16 }}>Achievements</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {BADGES.map((b, i) => (
                        <motion.div
                            key={b.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.07 + 0.3, type: "spring" }}
                            style={{
                                textAlign: "center",
                                padding: "16px 8px",
                                borderRadius: 12,
                                border: `1px solid ${b.unlocked ? C.green : C.border}`,
                                background: b.unlocked ? C.greenSoft : "transparent",
                                opacity: b.unlocked ? 1 : 0.4,
                                position: "relative",
                                overflow: "hidden",
                                cursor: b.unlocked ? "default" : "not-allowed",
                            }}
                        >
                            {/* Shimmer on unlocked */}
                            {b.unlocked && (
                                <motion.div
                                    animate={{ x: ["-120%", "220%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1.5, delay: i * 0.5 }}
                                    style={{
                                        position: "absolute", inset: 0,
                                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                                        pointerEvents: "none",
                                    }}
                                />
                            )}
                            <div style={{ fontSize: 28, marginBottom: 6 }}>{b.icon}</div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{b.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: 20,
            }}>
                <p style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 16 }}>Skills</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {SKILLS.map((s, i) => (
                        <div key={s.name}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.name}</span>
                                <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>{s.level}%</span>
                            </div>
                            <div style={{ height: 6, background: C.greenSoft, borderRadius: 6, overflow: "hidden" }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${s.level}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 + 0.4, ease: "easeOut" }}
                                    style={{
                                        height: "100%",
                                        background: `linear-gradient(90deg, ${C.green}, #a8d878)`,
                                        borderRadius: 6,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function VolunteerHome() {
    const [dark, setDark] = useState(false);
    const [page, setPage] = useState("dashboard");
    const C = dark ? DARK : LIGHT;

    const renderPage = () => {
        switch (page) {
            case "dashboard":   return <DashboardPage C={C} dark={dark} />;
            case "tasks":       return <TasksPage C={C} />;
            case "map":         return <MapPage C={C} dark={dark} />;
            case "leaderboard": return <LeaderboardPage C={C} dark={dark} />;
            case "messages":    return <MessagesPage C={C} />;
            case "profile":     return <ProfilePage C={C} dark={dark} />;
            default:            return <DashboardPage C={C} dark={dark} />;
        }
    };

    return (
        <ThemeContext.Provider value={{ C, dark }}>
            <div style={{
                display: "flex",
                height: "100vh",
                background: C.bg,
                fontFamily: "'Outfit', sans-serif",
                color: C.text,
                transition: "background 0.3s, color 0.3s",
                overflow: "hidden",
            }}>
                <Sidebar page={page} setPage={setPage} C={C} dark={dark} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <Topbar page={page} dark={dark} setDark={setDark} C={C} />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={page}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.2 }}
                            style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
                        >
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </ThemeContext.Provider>
    );
}