import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
    { icon: "✅", text: "Water tanker reached 80 families in Kurla", time: "2 hours ago", urgent: false },
    { icon: "✅", text: "Medical kit delivered to Dharavi clinic", time: "Yesterday", urgent: false },
    { icon: "🔴", text: "URGENT: Food needed for 34 families in Sion", time: "Right now", urgent: true },
    { icon: "✅", text: "Blankets distributed to 52 people in Govandi", time: "3 hours ago", urgent: false },
    { icon: "🔴", text: "URGENT: Clean water crisis in Mankhurd East", time: "45 min ago", urgent: true },
    { icon: "✅", text: "School supplies reached 120 kids in Chembur", time: "This morning", urgent: false },
    { icon: "🟡", text: "Shelter needed for 18 displaced families in Bandra", time: "2 hours ago", urgent: false },
];

const NEEDS = [
    { id: 1, category: "Medical", emoji: "🏥", title: "Emergency Medical Supplies", location: "Dharavi North, Mumbai", families: 28, urgency: "Critical", funded: 72, volunteers: 3, description: "28 families in Dharavi North urgently need basic medical supplies including bandages, antiseptics, and ORS packets. The nearest clinic is 4km away.", ngoPartner: "Apnalaya Foundation", target: 15000, raised: 10800 },
    { id: 2, category: "Food", emoji: "🍱", title: "Food Rations for Displaced Families", location: "Sion West, Mumbai", families: 34, urgency: "Critical", funded: 38, volunteers: 5, description: "34 families displaced after a building collapse are in immediate need of food rations. NGO partner can deploy within 2 hours of funding.", ngoPartner: "Robin Hood Army", target: 20000, raised: 7600 },
    { id: 3, category: "Water", emoji: "💧", title: "Clean Water Tanker", location: "Mankhurd East, Mumbai", families: 80, urgency: "High", funded: 55, volunteers: 2, description: "Pipeline burst has left 80 families without clean water for 3 days. A tanker deployment costs ₹8,000 and can reach them by evening.", ngoPartner: "Pani Haq Samiti", target: 8000, raised: 4400 },
    { id: 4, category: "Shelter", emoji: "🏠", title: "Temporary Shelter Materials", location: "Govandi, Mumbai", families: 18, urgency: "High", funded: 81, volunteers: 7, description: "18 families need tarpaulins and basic shelter materials after pre-monsoon roof damage. Almost funded — just ₹3,800 more needed.", ngoPartner: "SPARC India", target: 20000, raised: 16200 },
    { id: 5, category: "Education", emoji: "📚", title: "School Supplies for 120 Children", location: "Chembur Colony, Mumbai", families: 120, urgency: "Medium", funded: 45, volunteers: 4, description: "120 children in Chembur Colony need notebooks, pens, and bags to continue schooling after their community school was damaged by flooding.", ngoPartner: "Pratham NGO", target: 30000, raised: 13500 },
    { id: 6, category: "Medical", emoji: "💊", title: "Diabetes & BP Medicines", location: "Kurla East, Mumbai", families: 45, urgency: "Medium", funded: 29, volunteers: 1, description: "45 elderly residents in Kurla East have run out of chronic disease medications. A local health worker has compiled the list and is ready to purchase.", ngoPartner: "iCall Foundation", target: 12000, raised: 3480 },
];

const CATEGORIES = ["All", "Medical", "Food", "Water", "Shelter", "Education"];
const SORT_OPTIONS = ["Urgency", "Newest", "Most Needed"];
const URGENCY_STYLES = {
    Critical: { light: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" }, dark: { bg: "#450a0a", text: "#f87171", border: "#7f1d1d" } },
    High: { light: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, dark: { bg: "#451a03", text: "#fbbf24", border: "#78350f" } },
    Medium: { light: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" }, dark: { bg: "#052e16", text: "#34d399", border: "#065f46" } },
};

const IMPACT_STATS = [
    { val: "₹2.4L", label: "Raised this week", icon: "💰" },
    { val: "847", label: "People helped", icon: "👨‍👩‍👧" },
    { val: "47", label: "Active needs", icon: "🔴" },
    { val: "38", label: "Volunteers deployed", icon: "🙋" },
];

const MAP_ZONES = [
    { label: "Dharavi", top: "38%", left: "32%", size: 18, active: true, count: 3 },
    { label: "Sion", top: "30%", left: "55%", size: 14, active: true, count: 2 },
    { label: "Kurla", top: "20%", left: "65%", size: 12, active: true, count: 1 },
    { label: "Govandi", top: "15%", left: "78%", size: 10, active: true, count: 1 },
    { label: "Mankhurd", top: "52%", left: "72%", size: 14, active: true, count: 2 },
    { label: "Chembur", top: "42%", left: "80%", size: 10, active: false, count: 1 },
    { label: "Bandra", top: "55%", left: "22%", size: 12, active: true, count: 2 },
];

// ─── TICKER ───────────────────────────────────────────────────────────────────
function ImpactTicker({ dark }) {
    const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
    return (
        <div style={{ background: dark ? "#0f1a0c" : "#1a2e13", borderTop: `2px solid ${dark ? "#78b450" : "#3D8A25"}`, borderBottom: `2px solid ${dark ? "#78b450" : "#3D8A25"}`, overflow: "hidden", padding: "10px 0" }}>
            <motion.div style={{ display: "flex", gap: "60px", whiteSpace: "nowrap", width: "max-content" }} animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
                {items.map((item, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontFamily: "'Outfit', sans-serif" }}>
            <span>{item.icon}</span>
            <span style={{ color: item.urgent ? "#f87171" : "#a7f3d0", fontWeight: item.urgent ? 700 : 400 }}>{item.text}</span>
            <span style={{ color: "#6b7280", fontSize: "11px" }}>· {item.time}</span>
            <span style={{ color: dark ? "#3D8A25" : "#78b450", margin: "0 10px" }}>•</span>
          </span>
                ))}
            </motion.div>
        </div>
    );
}

// ─── NEED CARD ────────────────────────────────────────────────────────────────
function NeedCard({ need, dark, onSupport }) {
    const urgencyStyle = URGENCY_STYLES[need.urgency][dark ? "dark" : "light"];
    const cardBg = dark ? "#111f0d" : "#ffffff";
    const borderColor = dark ? "#1e3318" : "#e5f0df";
    const textPrimary = dark ? "#e8f5e2" : "#1a2e13";
    const textSecondary = dark ? "#7eb85a" : "#4a7c35";
    const progressBg = dark ? "#1e3318" : "#e5f0df";
    const progressFill = dark ? "#78b450" : "#3D8A25";
    const [hov, setHov] = useState(false);

    return (
        <motion.div
            onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
            whileHover={{ y: -6, boxShadow: dark ? "0 20px 50px rgba(120,180,80,0.18)" : "0 20px 50px rgba(61,138,37,0.14)" }}
            transition={{ duration: 0.2 }}
            style={{ background: cardBg, border: `1px solid ${hov ? (dark ? "#3D8A25" : "#5cb82e") : borderColor}`, borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}
        >
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: urgencyStyle.text, opacity: 0.8, transformOrigin: "left" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <motion.span animate={{ rotate: hov ? [0, -12, 12, 0] : 0 }} transition={{ duration: 0.45 }} style={{ fontSize: "22px", display: "inline-block" }}>{need.emoji}</motion.span>
                    <div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{need.category}</div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: textPrimary, lineHeight: 1.3 }}>{need.title}</div>
                    </div>
                </div>
                <span style={{ background: urgencyStyle.bg, color: urgencyStyle.text, border: `1px solid ${urgencyStyle.border}`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
          {need.urgency === "Critical" ? "🔴 " : need.urgency === "High" ? "🟡 " : "🟢 "}{need.urgency}
        </span>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: textSecondary }}>📍 {need.location}</span>
                <span style={{ fontSize: "12px", color: textSecondary }}>👨‍👩‍👧 {need.families} families</span>
            </div>

            <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", color: textSecondary }}>Funding progress</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: progressFill }}>{need.funded}%</span>
                </div>
                <div style={{ background: progressBg, borderRadius: "99px", height: "7px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${need.funded}%` }} transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                                style={{ height: "100%", background: `linear-gradient(90deg, ${progressFill}, ${dark ? "#a3d977" : "#5cb82e"})`, borderRadius: "99px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", color: dark ? "#4a7c35" : "#6a9e52" }}>₹{need.raised.toLocaleString()} raised</span>
                    <span style={{ fontSize: "11px", color: dark ? "#4a7c35" : "#6a9e52" }}>of ₹{need.target.toLocaleString()}</span>
                </div>
            </div>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onSupport(need)}
                           style={{ background: `linear-gradient(135deg, ${dark ? "#78b450" : "#3D8A25"}, ${dark ? "#5a9e3a" : "#2d6b1c"})`, color: "#fff", border: "none", borderRadius: "10px", padding: "11px 16px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <motion.span animate={{ x: hov ? 4 : 0 }} transition={{ duration: 0.2 }}>Support This Need →</motion.span>
            </motion.button>

            <div style={{ display: "flex", justifyContent: "center" }}>
        <span style={{ background: dark ? "#1e3318" : "#f0f9eb", color: textSecondary, borderRadius: "99px", padding: "3px 12px", fontSize: "11px", fontWeight: 500 }}>
          👤 {need.volunteers} volunteer{need.volunteers !== 1 ? "s" : ""} assigned
        </span>
            </div>
        </motion.div>
    );
}

// ─── SUPPORT MODAL ────────────────────────────────────────────────────────────
function SupportModal({ need, dark, onClose }) {
    const [amount, setAmount] = useState(500);
    const [customAmount, setCustomAmount] = useState("");
    const [isCustom, setIsCustom] = useState(false);
    const [wantsUpdates, setWantsUpdates] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const bg = dark ? "#0d1a09" : "#ffffff";
    const textPrimary = dark ? "#e8f5e2" : "#1a2e13";
    const textSecondary = dark ? "#7eb85a" : "#4a7c35";
    const border = dark ? "#1e3318" : "#e5f0df";
    const inputBg = dark ? "#111f0d" : "#f9fef6";
    const green = dark ? "#78b450" : "#3D8A25";
    const finalAmount = isCustom ? (parseInt(customAmount) || 0) : amount;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <motion.div initial={{ opacity: 0, scale: 0.88, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", damping: 24, stiffness: 300 }} onClick={e => e.stopPropagation()}
                        style={{ background: bg, borderRadius: "22px", border: `1px solid ${border}`, width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "28px", fontFamily: "'Outfit', sans-serif", boxShadow: dark ? "0 32px 100px rgba(0,0,0,0.7)" : "0 32px 100px rgba(0,0,0,0.18)" }}>

                {!submitted ? (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                            <div>
                                <div style={{ fontSize: "24px", marginBottom: "4px" }}>{need.emoji}</div>
                                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: textPrimary }}>{need.title}</h2>
                                <div style={{ fontSize: "13px", color: textSecondary, marginTop: "4px" }}>📍 {need.location} · {need.families} families</div>
                            </div>
                            <motion.button whileHover={{ rotate: 90 }} onClick={onClose}
                                           style={{ background: dark ? "#1e3318" : "#f0f9eb", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", color: textSecondary, fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</motion.button>
                        </div>

                        <p style={{ fontSize: "14px", color: textSecondary, lineHeight: 1.65, margin: "0 0 20px" }}>{need.description}</p>

                        <div style={{ background: dark ? "#111f0d" : "#f0f9eb", borderRadius: "12px", padding: "14px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontSize: "13px", color: textSecondary }}>₹{need.raised.toLocaleString()} raised of ₹{need.target.toLocaleString()}</span>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: green }}>{need.funded}%</span>
                            </div>
                            <div style={{ background: dark ? "#1e3318" : "#d4edcc", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${need.funded}%` }} transition={{ duration: 1, ease: "easeOut" }}
                                            style={{ height: "100%", background: green, borderRadius: "99px" }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: textPrimary, marginBottom: "10px" }}>Choose an amount</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                                {[100, 500, 1000].map(v => (
                                    <motion.button key={v} whileTap={{ scale: 0.92 }} onClick={() => { setAmount(v); setIsCustom(false); setCustomAmount(""); }}
                                                   style={{ padding: "10px", borderRadius: "10px", border: `2px solid ${(!isCustom && amount === v) ? green : border}`, background: (!isCustom && amount === v) ? (dark ? "#1e3318" : "#f0f9eb") : "transparent", color: (!isCustom && amount === v) ? green : textSecondary, fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "15px", cursor: "pointer", transition: "all 0.15s" }}>
                                        ₹{v}
                                    </motion.button>
                                ))}
                                <motion.button whileTap={{ scale: 0.92 }} onClick={() => setIsCustom(true)}
                                               style={{ padding: "10px", borderRadius: "10px", border: `2px solid ${isCustom ? green : border}`, background: isCustom ? (dark ? "#1e3318" : "#f0f9eb") : "transparent", color: isCustom ? green : textSecondary, fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                                    Custom
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {isCustom && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                                        <input type="number" placeholder="Enter amount in ₹" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                                               style={{ marginTop: "10px", width: "100%", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${border}`, background: inputBg, color: textPrimary, fontFamily: "'Outfit', sans-serif", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                                <input type="checkbox" checked={wantsUpdates} onChange={e => setWantsUpdates(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: green }} />
                                <span style={{ fontSize: "14px", color: textPrimary }}>Notify me when this need is met</span>
                            </label>
                            <AnimatePresence>
                                {wantsUpdates && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                                        <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                                               style={{ marginTop: "10px", width: "100%", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${border}`, background: inputBg, color: textPrimary, fontFamily: "'Outfit', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div style={{ background: dark ? "#0a1a07" : "#f0f9eb", border: `1px solid ${dark ? "#1e4018" : "#b8dba8"}`, borderRadius: "12px", padding: "14px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "20px", flexShrink: 0 }}>📸</span>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: green, marginBottom: "2px" }}>Track Impact Promise</div>
                                <div style={{ fontSize: "12px", color: textSecondary, lineHeight: 1.5 }}>You'll receive a photo + impact report within 48 hours of the need being met, via {need.ngoPartner}.</div>
                            </div>
                        </div>

                        <div style={{ fontSize: "12px", color: dark ? "#4a7c35" : "#6a9e52", marginBottom: "20px", lineHeight: 1.5 }}>
                            🔒 Payments handled by <strong>{need.ngoPartner}</strong>. CivicPulse does not hold any funds.
                        </div>

                        <motion.button whileHover={{ scale: finalAmount > 0 ? 1.02 : 1 }} whileTap={{ scale: finalAmount > 0 ? 0.97 : 1 }} disabled={finalAmount <= 0} onClick={() => setSubmitted(true)}
                                       style={{ width: "100%", padding: "15px", background: finalAmount > 0 ? `linear-gradient(135deg, ${green}, ${dark ? "#5a9e3a" : "#2d6b1c"})` : (dark ? "#1e3318" : "#e5f0df"), color: finalAmount > 0 ? "#fff" : textSecondary, border: "none", borderRadius: "12px", fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "16px", cursor: finalAmount > 0 ? "pointer" : "not-allowed" }}>
                            {finalAmount > 0 ? `Contribute ₹${finalAmount.toLocaleString()} →` : "Select an amount"}
                        </motion.button>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 18 }} style={{ textAlign: "center", padding: "24px 0" }}>
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} style={{ fontSize: "64px", marginBottom: "16px" }}>🌱</motion.div>
                        <h2 style={{ fontSize: "26px", fontWeight: 900, color: green, margin: "0 0 10px" }}>Thank you!</h2>
                        <p style={{ fontSize: "15px", color: textSecondary, lineHeight: 1.6, margin: "0 0 20px" }}>
                            You're making a real difference for {need.families} families in {need.location}.{wantsUpdates && email ? ` Updates will arrive at ${email}.` : ""}
                        </p>
                        <div style={{ background: dark ? "#111f0d" : "#f0f9eb", borderRadius: "14px", padding: "18px", marginBottom: "20px" }}>
                            <div style={{ fontSize: "13px", color: textSecondary, marginBottom: "6px" }}>Your contribution</div>
                            <div style={{ fontSize: "32px", fontWeight: 900, color: green }}>₹{finalAmount.toLocaleString()}</div>
                            <div style={{ fontSize: "12px", color: dark ? "#4a7c35" : "#6a9e52", marginTop: "4px" }}>→ {need.ngoPartner} receives this within 24 hours</div>
                        </div>
                        <motion.button whileHover={{ scale: 1.03 }} onClick={onClose}
                                       style={{ background: "none", border: `1px solid ${border}`, color: textSecondary, borderRadius: "10px", padding: "10px 28px", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
                            Browse more needs
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

// ─── MAP PREVIEW (public only — no coordinator links) ─────────────────────────
function MapPreview({ dark }) {
    const textSecondary = dark ? "#7eb85a" : "#4a7c35";
    const gridColor = dark ? "#1a2e13" : "#c8e6b8";

    return (
        <div style={{ background: dark ? "#0d1a09" : "#e8f5e0", borderRadius: "16px", border: `1px solid ${dark ? "#1e3318" : "#c8e6b8"}`, padding: "20px", position: "relative", overflow: "hidden", minHeight: "220px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
                {[...Array(8)].map((_, i) => <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke={gridColor} strokeWidth="1" />)}
                {[...Array(10)].map((_, i) => <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke={gridColor} strokeWidth="1" />)}
            </svg>
            {MAP_ZONES.map((zone, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}
                            style={{ position: "absolute", top: zone.top, left: zone.left, transform: "translate(-50%, -50%)" }}>
                    {zone.active && (
                        <motion.div animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
                                    style={{ position: "absolute", width: zone.size + 14, height: zone.size + 14, borderRadius: "50%", background: zone.count > 2 ? "#ef4444" : "#f97316", opacity: 0.3, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
                    )}
                    <div style={{ width: zone.size, height: zone.size, borderRadius: "50%", background: zone.count > 2 ? "#ef4444" : zone.count > 1 ? "#f97316" : "#78b450", border: "2px solid rgba(255,255,255,0.6)", position: "relative" }} />
                    <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "3px", fontSize: "9px", fontWeight: 700, color: textSecondary, whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif" }}>{zone.label}</div>
                </motion.div>
            ))}
            <div style={{ position: "absolute", bottom: "14px", left: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {[{ color: "#ef4444", label: "3+ needs" }, { color: "#f97316", label: "2 needs" }, { color: "#78b450", label: "1 need" }].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: textSecondary, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.color }} />{l.label}
                    </div>
                ))}
            </div>
            <div style={{ position: "absolute", top: "14px", right: "14px", background: dark ? "#1e3318" : "#ffffff", border: `1px solid ${dark ? "#3D8A25" : "#c8e6b8"}`, borderRadius: "99px", padding: "4px 12px", fontSize: "12px", fontWeight: 700, color: dark ? "#78b450" : "#3D8A25", fontFamily: "'Outfit', sans-serif" }}>
                7 active zones
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DonorsPage() {
    const [dark, setDark] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortBy, setSortBy] = useState("Urgency");
    const [selectedNeed, setSelectedNeed] = useState(null);

    const bg = dark ? "#080f06" : "#f5faf2";
    const cardBg = dark ? "#0d1a09" : "#ffffff";
    const textPrimary = dark ? "#e8f5e2" : "#1a2e13";
    const textSecondary = dark ? "#7eb85a" : "#4a7c35";
    const border = dark ? "#1e3318" : "#ddeedd";
    const green = dark ? "#78b450" : "#3D8A25";
    const pillBg = dark ? "#111f0d" : "#e8f5e0";
    const pillActive = dark ? "#78b450" : "#3D8A25";

    const filteredNeeds = NEEDS
        .filter(n => activeCategory === "All" || n.category === activeCategory)
        .sort((a, b) => {
            if (sortBy === "Urgency") { const o = { Critical: 0, High: 1, Medium: 2 }; return o[a.urgency] - o[b.urgency]; }
            if (sortBy === "Most Needed") return a.funded - b.funded;
            return b.id - a.id;
        });

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif", background: bg, minHeight: "100vh", color: textPrimary, transition: "background 0.3s, color 0.3s" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${dark ? "#1e3318" : "#c8e6b8"}; border-radius: 3px; }
      `}</style>

            {/* ── NAVBAR ──
          SECURITY: Only public routes here.
          NO /dashboard link — coordinators have their own login.
          Donors should NEVER see or access the coordinator dashboard. */}
            <nav style={{ position: "sticky", top: 0, zIndex: 100, background: dark ? "rgba(8,15,6,0.93)" : "rgba(245,250,242,0.93)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "62px" }}>
                <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                    <motion.div whileHover={{ rotate: 12, scale: 1.08 }} style={{ width: "32px", height: "32px", borderRadius: "9px", background: `linear-gradient(135deg, ${green}, ${dark ? "#5a9e3a" : "#2d6b1c"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>🌿</motion.div>
                    <span style={{ fontWeight: 800, fontSize: "18px", color: textPrimary }}>CivicPulse</span>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <Link to="/" style={{ textDecoration: "none", fontSize: "14px", fontWeight: 500, color: textSecondary }}>Home</Link>
                    <Link to="/report" style={{ textDecoration: "none", fontSize: "14px", fontWeight: 500, color: textSecondary }}>Report a Need</Link>
                    {/* NO /dashboard here — that is a coordinator-only private route */}
                    <motion.button whileTap={{ scale: 0.92 }} onClick={() => setDark(d => !d)}
                                   style={{ background: dark ? "#182913" : "#e8f5e0", border: `1px solid ${border}`, borderRadius: "99px", padding: "6px 14px", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", color: textSecondary, display: "flex", alignItems: "center", gap: "6px" }}>
                        {dark ? "☀️ Light" : "🌙 Dark"}
                    </motion.button>
                </div>
            </nav>

            {/* ── TICKER ── */}
            <ImpactTicker dark={dark} />

            {/* ── HERO ── */}
            <section style={{ padding: "70px 24px 52px", textAlign: "center", maxWidth: "880px", margin: "0 auto" }}>
                <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
                    <motion.div animate={{ opacity: [1, 0.45, 1] }} transition={{ duration: 2.2, repeat: Infinity }}
                                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: dark ? "#0d1a09" : "#e8f5e0", border: `1px solid ${dark ? "#1e3318" : "#b8dba8"}`, borderRadius: "99px", padding: "6px 18px", marginBottom: "28px" }}>
                        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: green }}>47 active needs right now</span>
                    </motion.div>

                    <h1 style={{ fontSize: "clamp(34px, 6vw, 60px)", fontWeight: 900, lineHeight: 1.08, color: textPrimary, marginBottom: "22px", letterSpacing: "-0.03em" }}>
                        Your support reaches people{" "}
                        <span style={{ color: green, position: "relative" }}>
              in hours
              <svg style={{ position: "absolute", bottom: "-5px", left: 0, width: "100%", height: "7px" }} viewBox="0 0 100 7" preserveAspectRatio="none">
                <motion.path d="M0,6 Q50,0 100,6" stroke={green} strokeWidth="2.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.6 }} />
              </svg>
            </span>
                        {" "}— not months
                    </h1>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                              style={{ fontSize: "18px", color: textSecondary, lineHeight: 1.65, maxWidth: "600px", margin: "0 auto 36px" }}>
                        Browse verified community needs. Every rupee is tracked publicly in real time.
                    </motion.p>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <motion.a href="#needs" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                                  style={{ background: `linear-gradient(135deg, ${green}, ${dark ? "#5a9e3a" : "#2d6b1c"})`, color: "#fff", textDecoration: "none", borderRadius: "13px", padding: "15px 30px", fontWeight: 800, fontSize: "16px", boxShadow: `0 6px 24px ${green}44` }}>
                            Browse Active Needs ↓
                        </motion.a>
                        {/* Donors can report a need — that IS a public action */}
                        <Link to="/report" style={{ background: "transparent", color: textSecondary, textDecoration: "none", borderRadius: "13px", padding: "15px 28px", fontWeight: 600, fontSize: "15px", border: `1px solid ${border}` }}>
                            Report a Need
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── LIVE IMPACT STATS ── */}
            <section style={{ maxWidth: "1100px", margin: "0 auto 16px", padding: "0 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                    {IMPACT_STATS.map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    whileHover={{ y: -4, boxShadow: dark ? "0 10px 28px rgba(120,180,80,0.12)" : "0 10px 28px rgba(61,138,37,0.1)" }}
                                    style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "14px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} style={{ fontSize: "28px" }}>{stat.icon}</motion.div>
                            <div>
                                <div style={{ fontSize: "22px", fontWeight: 900, color: green }}>{stat.val}</div>
                                <div style={{ fontSize: "12px", color: textSecondary, fontWeight: 500 }}>{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── NEEDS GRID ── */}
            <section id="needs" style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 64px" }}>
                <motion.h2 initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                           style={{ fontSize: "26px", fontWeight: 800, color: textPrimary, marginBottom: "20px" }}>Active Needs</motion.h2>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {CATEGORIES.map(cat => (
                            <motion.button key={cat} whileTap={{ scale: 0.93 }} onClick={() => setActiveCategory(cat)}
                                           style={{ padding: "7px 16px", borderRadius: "99px", border: `1px solid ${activeCategory === cat ? pillActive : border}`, background: activeCategory === cat ? pillActive : pillBg, color: activeCategory === cat ? "#fff" : textSecondary, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.15s" }}>
                                {cat}
                            </motion.button>
                        ))}
                    </div>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            style={{ padding: "7px 14px", borderRadius: "10px", border: `1px solid ${border}`, background: cardBg, color: textSecondary, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", outline: "none" }}>
                        {SORT_OPTIONS.map(o => <option key={o} value={o}>Sort: {o}</option>)}
                    </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                    <AnimatePresence mode="popLayout">
                        {filteredNeeds.map((need, i) => (
                            <motion.div key={need.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.06 }}>
                                <NeedCard need={need} dark={dark} onSupport={setSelectedNeed} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* ── IMPACT TRANSPARENCY ── */}
            <section style={{ background: dark ? "#0d1a09" : "#e8f5e0", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: "64px 24px" }}>
                <div style={{ maxWidth: "960px", margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "48px" }}>
                        <h2 style={{ fontSize: "34px", fontWeight: 900, color: textPrimary, marginBottom: "10px" }}>How your donation flows</h2>
                        <p style={{ fontSize: "16px", color: textSecondary }}>100% of donations go to verified needs. This platform is grant-funded.</p>
                    </motion.div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
                        {[{ icon: "💳", label: "You", sub: "Contribute any amount" }, { icon: "🤝", label: "NGO Partner", sub: "Receives & deploys funds" }, { icon: "👨‍👩‍👧", label: "Beneficiary", sub: "Gets help within hours" }].map((step, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center" }}>
                                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.18 }} whileHover={{ y: -5 }}
                                            style={{ textAlign: "center", background: cardBg, border: `1px solid ${border}`, borderRadius: "18px", padding: "26px 30px", minWidth: "150px" }}>
                                    <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }} style={{ fontSize: "40px", marginBottom: "10px" }}>{step.icon}</motion.div>
                                    <div style={{ fontSize: "16px", fontWeight: 800, color: textPrimary, marginBottom: "4px" }}>{step.label}</div>
                                    <div style={{ fontSize: "12px", color: textSecondary }}>{step.sub}</div>
                                </motion.div>
                                {i < 2 && <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ fontSize: "28px", color: green, margin: "0 6px" }}>→</motion.div>}
                            </div>
                        ))}
                    </div>

                    {/* Sample impact report */}
                    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", textAlign: "center" }}>Sample Impact Report (what you'll receive)</div>
                        <motion.div whileHover={{ y: -3 }} style={{ background: cardBg, border: `1px solid ${dark ? "#2a4a20" : "#b8dba8"}`, borderRadius: "16px", overflow: "hidden" }}>
                            <div style={{ background: `linear-gradient(135deg, ${green}, ${dark ? "#5a9e3a" : "#2d6b1c"})`, padding: "16px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "22px" }}>📸</span>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>Impact Report — Need #1042</div>
                                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>Delivered by Robin Hood Army · 14 Apr 2025</div>
                                </div>
                                <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", borderRadius: "99px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, color: "#fff" }}>✅ Completed</div>
                            </div>
                            <div style={{ padding: "16px 20px" }}>
                                <div style={{ fontSize: "14px", color: textPrimary, lineHeight: 1.6, marginBottom: "14px" }}>34 families in Sion West received food rations today. Distribution completed by 3:00 PM, 6 hours after funding was reached.</div>
                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    {[{ label: "Families reached", val: "34" }, { label: "Hours to deploy", val: "6" }, { label: "Your contribution", val: "₹500" }].map(stat => (
                                        <div key={stat.label} style={{ background: dark ? "#111f0d" : "#f0f9eb", borderRadius: "10px", padding: "8px 14px", flex: 1, minWidth: "80px" }}>
                                            <div style={{ fontSize: "18px", fontWeight: 800, color: green }}>{stat.val}</div>
                                            <div style={{ fontSize: "11px", color: textSecondary }}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── MAP SECTION — no dashboard link ── */}
            <section style={{ maxWidth: "960px", margin: "0 auto", padding: "64px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "center" }}>
                    <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <h2 style={{ fontSize: "28px", fontWeight: 800, color: textPrimary, marginBottom: "12px", lineHeight: 1.2 }}>Needs are concentrated. Help is mapped.</h2>
                        <p style={{ fontSize: "15px", color: textSecondary, lineHeight: 1.7, marginBottom: "20px" }}>
                            Every verified need is geo-tagged across Mumbai. Donations are deployed to the highest-urgency zones first. 7 zones are currently active.
                        </p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <motion.a href="#needs" whileHover={{ scale: 1.03 }}
                                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#fff", fontWeight: 700, fontSize: "14px", borderRadius: "10px", padding: "10px 18px", background: `linear-gradient(135deg, ${green}, ${dark ? "#5a9e3a" : "#2d6b1c"})` }}>
                                Browse needs →
                            </motion.a>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <MapPreview dark={dark} />
                    </motion.div>
                </div>
            </section>

            {/* ── VERIFIED NGO PARTNERS (replaces coordinator widget) ──
          This is what a donor actually cares about: WHO handles their money.
          Coordinators have their own private dashboard login — donors don't go there. */}
            <section style={{ maxWidth: "960px", margin: "0 auto 64px", padding: "0 24px" }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ background: dark ? "#0d1a09" : "#f0f9eb", border: `1px solid ${dark ? "#2a4a20" : "#b8dba8"}`, borderRadius: "20px", padding: "28px", overflow: "hidden", position: "relative" }}>
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 3.5, repeat: Infinity }}
                                style={{ position: "absolute", right: "-50px", top: "-50px", width: "180px", height: "180px", borderRadius: "50%", background: green }} />
                    <div style={{ position: "relative" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                            <div style={{ fontSize: "32px" }}>🤝</div>
                            <div>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: textPrimary }}>Verified NGO Partners</div>
                                <div style={{ fontSize: "13px", color: textSecondary }}>Every rupee flows through these verified, accountable organisations</div>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                            {[
                                { name: "Apnalaya Foundation", focus: "Medical · Mumbai", since: "2006" },
                                { name: "Robin Hood Army", focus: "Food · Pan India", since: "2014" },
                                { name: "SPARC India", focus: "Shelter · Mumbai", since: "1984" },
                                { name: "Pratham NGO", focus: "Education · Pan India", since: "1994" },
                            ].map((ngo, i) => (
                                <motion.div key={ngo.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                            whileHover={{ y: -3 }}
                                            style={{ background: dark ? "#1e3318" : "#e8f5e0", border: `1px solid ${dark ? "#2a4a20" : "#c8ddb8"}`, borderRadius: "12px", padding: "14px 16px" }}>
                                    <div style={{ fontSize: "13px", fontWeight: 800, color: textPrimary, marginBottom: "3px" }}>✓ {ngo.name}</div>
                                    <div style={{ fontSize: "11px", color: textSecondary }}>{ngo.focus}</div>
                                    <div style={{ fontSize: "10px", color: dark ? "#3D8A25" : "#8ab870", marginTop: "4px" }}>Est. {ngo.since}</div>
                                </motion.div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                            {[{ icon: "🔒", text: "Funds never pass through CivicPulse" }, { icon: "📸", text: "Photo proof within 48 hours" }, { icon: "📊", text: "100% donation transparency" }].map(item => (
                                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: textSecondary, fontWeight: 500 }}>
                                    <span style={{ fontSize: "15px" }}>{item.icon}</span>{item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ── FOOTER — public routes only ── */}
            <footer style={{ borderTop: `1px solid ${border}`, background: dark ? "#0a1208" : "#e8f5e0", padding: "40px 24px" }}>
                <div style={{ maxWidth: "960px", margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px", marginBottom: "24px" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🌿</div>
                                <span style={{ fontWeight: 800, fontSize: "16px", color: textPrimary }}>CivicPulse</span>
                            </div>
                            <p style={{ fontSize: "13px", color: textSecondary, maxWidth: "220px", lineHeight: 1.6 }}>Open-source. Built for impact, not profit.</p>
                        </div>
                        {/* Only public pages in footer — no /dashboard */}
                        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                            {[{ label: "Home", to: "/" }, { label: "Report a Need", to: "/report" }, { label: "For Volunteers", to: "/volunteers" }, { label: "For NGOs", to: "/ngos" }].map(link => (
                                <Link key={link.label} to={link.to} style={{ textDecoration: "none", fontSize: "14px", fontWeight: 500, color: textSecondary }}>{link.label}</Link>
                            ))}
                        </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${border}`, paddingTop: "16px", fontSize: "12px", color: dark ? "#3D8A25" : "#6a9e52", textAlign: "center" }}>
                        © 2025 CivicPulse · All donations flow through verified NGO partners · Platform is grant-funded
                    </div>
                </div>
            </footer>

            <AnimatePresence>
                {selectedNeed && <SupportModal need={selectedNeed} dark={dark} onClose={() => setSelectedNeed(null)} />}
            </AnimatePresence>
        </div>
    );
}