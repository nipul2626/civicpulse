import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, Bell, Shield, Zap, Globe, Phone, Mail,
    CheckCircle, AlertTriangle, Camera,
    Palette, Database, Trash2, Download, Save,
    Smartphone, Monitor, Moon, Sun, LogOut, Edit3,
    Link, Calendar, Lock, ChevronRight
} from "lucide-react"

/* ─── PALETTE ─── */
const C = {
    bg:      "#0D1F19",
    surface: "#060707",
    card:    "#122018",
    panel:   "#0f1d14",
    border:  "rgba(144,171,139,0.15)",
    borderHover: "rgba(144,171,139,0.3)",
    text:    "#e8f0e4",
    muted:   "#7a9b83",
    faint:   "#3d6050",
    f300:    "#a3c09a",
    f400:    "#7aa375",
    f500:    "#5A7863",
    f600:    "#476053",
    f700:    "#3B4953",
    f800:    "#2D3D35",
    f900:    "#1C352D",
    s300:    "#A8CE78",
    s400:    "#90AB8B",
    amber:   "#c9923a",
    red:     "#b85547",
    cyan:    "#4f9191",
    purple:  "#7a6bb5",
}

/* ─── HELPERS ─── */
const Toggle = ({ on, onToggle, color = C.f500 }) => (
    <motion.button
        onClick={onToggle}
        animate={{ background: on ? color : "rgba(255,255,255,0.07)" }}
        transition={{ duration: 0.2 }}
        style={{
            width: 40, height: 22, borderRadius: 11, border: "none",
            cursor: "pointer", position: "relative", flexShrink: 0,
            outline: "none",
        }}>
        <motion.div
            animate={{ x: on ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 600, damping: 32 }}
            style={{
                position: "absolute", top: 3, width: 16, height: 16,
                borderRadius: "50%", background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }} />
    </motion.button>
)

const FieldLabel = ({ children }) => (
    <label style={{
        fontSize: 10, fontWeight: 700, color: C.muted,
        textTransform: "uppercase", letterSpacing: ".8px",
        display: "block", marginBottom: 5,
    }}>{children}</label>
)

const Input = ({ value, onChange, placeholder, type = "text" }) => {
    const [f, setF] = useState(false)
    return (
        <input
            value={value} onChange={onChange} placeholder={placeholder} type={type}
            onFocus={() => setF(true)} onBlur={() => setF(false)}
            style={{
                width: "100%", padding: "9px 12px", borderRadius: 9,
                border: `1px solid ${f ? C.f500 : C.border}`,
                background: "rgba(255,255,255,0.03)",
                color: C.text, fontSize: 12.5,
                fontFamily: "'DM Sans', sans-serif", outline: "none",
                transition: "border-color .18s",
            }} />
    )
}

const Row = ({ label, desc, children, danger }) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 0", borderBottom: `1px solid ${C.border}`, gap: 12,
    }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: danger ? C.red : C.text, margin: 0 }}>{label}</p>
            {desc && <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0", lineHeight: 1.4 }}>{desc}</p>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
)

const SubLabel = ({ children }) => (
    <p style={{
        fontSize: 10, fontWeight: 700, color: C.muted,
        textTransform: "uppercase", letterSpacing: ".8px",
        margin: "14px 0 10px",
    }}>{children}</p>
)

const GhostBtn = ({ children, onClick, style = {} }) => (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                   onClick={onClick}
                   style={{
                       padding: "6px 14px", borderRadius: 8,
                       border: `1px solid ${C.border}`, background: "transparent",
                       color: C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer",
                       fontFamily: "'DM Sans',sans-serif", transition: "border-color .15s, color .15s",
                       ...style,
                   }}
                   onMouseEnter={e => { e.currentTarget.style.borderColor = C.f500; e.currentTarget.style.color = C.f300 }}
                   onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>
        {children}
    </motion.button>
)

const DangerBtn = ({ children, onClick }) => (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                   onClick={onClick}
                   style={{
                       display: "flex", alignItems: "center", gap: 5,
                       padding: "6px 12px", borderRadius: 8,
                       border: `1px solid rgba(184,85,71,0.35)`,
                       background: "rgba(184,85,71,0.1)",
                       color: C.red, fontSize: 11, fontWeight: 700,
                       cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                   }}>
        {children}
    </motion.button>
)

/* ─── SECTION PANEL ─── */
const Panel = ({ id, title, icon: Icon, color = C.f500, children }) => (
    <motion.div
        id={id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, overflow: "hidden", marginBottom: 14,
        }}>
        <div style={{
            padding: "14px 22px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 10,
        }}>
            <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <Icon size={14} style={{ color }} />
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>{title}</span>
        </div>
        <div style={{ padding: "18px 22px" }}>{children}</div>
    </motion.div>
)

/* ─── DANGER MODAL ─── */
const DangerModal = ({ title, desc, onConfirm, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)",
                    zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                }} onClick={onClose}>
        <motion.div initial={{ scale: .9, y: 16 }} animate={{ scale: 1, y: 0 }}
                    exit={{ scale: .9, y: 16 }} onClick={e => e.stopPropagation()}
                    style={{
                        background: C.card, border: `1px solid rgba(184,85,71,0.25)`,
                        borderRadius: 18, padding: 26, maxWidth: 380, width: "100%",
                    }}>
            <div style={{
                width: 46, height: 46, borderRadius: 13, background: "rgba(184,85,71,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
            }}>
                <AlertTriangle size={20} style={{ color: C.red }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>{title}</p>
            <p style={{ fontSize: 12, color: C.muted, margin: "0 0 20px", lineHeight: 1.6 }}>{desc}</p>
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onClose} style={{
                    flex: 1, padding: 10, borderRadius: 10,
                    border: `1px solid ${C.border}`, background: "transparent",
                    color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                }}>Cancel</button>
                <button onClick={onConfirm} style={{
                    flex: 1, padding: 10, borderRadius: 10,
                    border: "none", background: C.red,
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                }}>Confirm Delete</button>
            </div>
        </motion.div>
    </motion.div>
)

/* ─── TOAST ─── */
const Toast = ({ visible }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, y: 16, scale: .92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: .92 }}
                style={{
                    position: "fixed", bottom: 24, right: 24, zIndex: 800,
                    padding: "11px 18px", borderRadius: 12,
                    background: "rgba(90,120,99,0.2)", border: `1px solid rgba(90,120,99,0.4)`,
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                <CheckCircle size={15} style={{ color: C.f300 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.f300 }}>Settings saved!</span>
            </motion.div>
        )}
    </AnimatePresence>
)

/* ─── PILL GROUP ─── */
const PillGroup = ({ options, active, onSelect, color = C.f500 }) => (
    <div style={{ display: "flex", gap: 5 }}>
        {options.map(o => (
            <motion.button key={o.id} whileTap={{ scale: .95 }} onClick={() => onSelect(o.id)}
                           style={{
                               padding: "5px 12px", borderRadius: 8, border: `1px solid`,
                               borderColor: active === o.id ? color : C.border,
                               background: active === o.id ? `${color}1a` : "transparent",
                               color: active === o.id ? C.f300 : C.muted,
                               fontSize: 11, fontWeight: 700, cursor: "pointer",
                               fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 5,
                               transition: "all .15s",
                           }}>
                {o.icon && <o.icon size={10} />} {o.label}
            </motion.button>
        ))}
    </div>
)

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function SettingsPage() {
    /* profile */
    const [name, setName] = useState("Riya Sharma")
    const [email, setEmail] = useState("riya.sharma@greenhorizon.org")
    const [phone, setPhone] = useState("+91 98765 43210")
    const [org, setOrg] = useState("Green Horizon Foundation")
    const [city, setCity] = useState("Mumbai, Maharashtra")
    const [bio, setBio] = useState("NGO coordinator focused on community welfare and rapid response.")

    /* appearance */
    const [theme, setTheme] = useState("dark")
    const [fontSize, setFontSize] = useState("medium")
    const [density, setDensity] = useState("comfortable")

    /* notifs */
    const [notifs, setNotifs] = useState({
        critical: true, assignments: true, aiAlerts: true,
        weeklyReport: true, volunteerUpdates: false,
        push: true, email: true, sms: false,
    })

    /* ai */
    const [ai, setAi] = useState({
        autoScore: true, autoDuplicate: true, autoMatch: true,
        predictions: true, smartRouting: true,
        minConf: 75, urgency: 4,
    })

    /* security */
    const [twoFA, setTwoFA] = useState(true)
    const [sessions, setSessions] = useState([
        { device: "Chrome · Mumbai", active: true, time: "Now" },
        { device: "Mobile · iOS", active: false, time: "2h ago" },
        { device: "Firefox · Laptop", active: false, time: "Yesterday" },
    ])

    /* integrations */
    const [integ, setInteg] = useState({
        slack: true, whatsapp: false, googleSheets: true, zapier: false, sms: true,
    })

    /* UI */
    const [saved, setSaved] = useState(false)
    const [danger, setDanger] = useState(null)
    const [activeNav, setActiveNav] = useState("profile")
    const mainRef = useRef(null)

    const save = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2400)
    }

    const NAV = [
        { id: "profile", label: "Edit Profile", icon: Edit3 },
        { id: "appearance", label: "Account Settings", icon: Monitor },
        { id: "integrations", label: "Edit Social Media Links", icon: Link },
        { id: "ai", label: "Calendar", icon: Calendar },
        { id: "security", label: "Privacy Settings", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "data", label: "Data & Privacy", icon: Database },
    ]

    /* sync active nav on scroll */
    useEffect(() => {
        const el = mainRef.current
        if (!el) return
        const handler = () => {
            const ids = ["profile", "appearance", "integrations", "ai", "security", "notifications", "data"]
            for (const id of ids) {
                const sec = document.getElementById(id)
                if (sec && sec.offsetTop - 100 <= el.scrollTop) setActiveNav(id)
            }
        }
        el.addEventListener("scroll", handler)
        return () => el.removeEventListener("scroll", handler)
    }, [])

    const scrollTo = (id) => {
        setActiveNav(id)
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    return (
        <div style={{
            minHeight: "100vh", background: C.bg, color: C.text,
            fontFamily: "'DM Sans', sans-serif", display: "flex",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(90,120,99,0.3); border-radius: 2px; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        input[type=range] { accent-color: ${C.f500}; }
        textarea { resize: none; }
      `}</style>

            {/* ── LEFT SIDEBAR ── */}
            <div style={{
                width: 260, flexShrink: 0, background: C.surface,
                borderRight: `1px solid ${C.border}`,
                display: "flex", flexDirection: "column",
                position: "sticky", top: 0, height: "100vh",
                overflow: "hidden",
            }}>
                {/* decorative top arc */}
                <div style={{
                    position: "absolute", top: -60, right: -60,
                    width: 200, height: 200, borderRadius: "50%",
                    background: `${C.f500}18`, pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", top: 20, right: -80,
                    width: 180, height: 180, borderRadius: "50%",
                    border: `1px solid ${C.f500}20`, pointerEvents: "none",
                }} />

                {/* Profile card */}
                <div style={{ padding: "36px 28px 24px", position: "relative", zIndex: 1 }}>
                    {/* Avatar */}
                    <div style={{ position: "relative", display: "inline-block", marginBottom: 14 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${C.f500}, ${C.f800})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 900, color: "#c9dbc3",
                            border: `3px solid ${C.f700}`,
                        }}>RS</div>
                        <div style={{
                            position: "absolute", bottom: 0, right: 0,
                            width: 22, height: 22, borderRadius: "50%",
                            background: C.f500, border: `2px solid ${C.surface}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                        }}>
                            <Camera size={10} color="#c9dbc3" />
                        </div>
                    </div>

                    <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: "0 0 2px" }}>{name}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: "0 0 10px" }}>Edit here</p>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        background: "rgba(90,120,99,0.2)", color: C.f300,
                    }}>✓ Verified</span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: C.border, margin: "0 28px" }} />

                {/* Nav links */}
                <nav style={{ padding: "12px 14px", flex: 1 }}>
                    {NAV.map((item) => {
                        const isActive = activeNav === item.id
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: .97 }}
                                onClick={() => scrollTo(item.id)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    width: "100%", padding: "10px 12px", borderRadius: 10, border: "none",
                                    borderLeft: `2px solid ${isActive ? C.f500 : "transparent"}`,
                                    background: isActive ? `${C.f500}18` : "transparent",
                                    color: isActive ? C.f300 : C.muted,
                                    fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                    transition: "all .15s", marginBottom: 2, textAlign: "left",
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <item.icon size={14} style={{ color: isActive ? C.f400 : C.faint }} />
                                    {item.label}
                                </div>
                                <ChevronRight size={13} style={{ opacity: isActive ? 0.6 : 0.25 }} />
                            </motion.button>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: "0 14px 28px" }}>
                    <div style={{ height: 1, background: C.border, margin: "0 0 14px" }} />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                   style={{
                                       width: "100%", padding: "9px", borderRadius: 10, border: "none",
                                       background: "rgba(184,85,71,0.12)", color: C.red,
                                       fontSize: 12, fontWeight: 700, cursor: "pointer",
                                       fontFamily: "'DM Sans',sans-serif",
                                       display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                   }}>
                        <LogOut size={13} /> Log out
                    </motion.button>
                </div>
            </div>

            {/* ── RIGHT CONTENT ── */}
            <div ref={mainRef} style={{ flex: 1, padding: "32px 40px", overflowY: "auto", maxHeight: "100vh" }}>
                <div style={{ maxWidth: 680, margin: "0 auto" }}>

                    {/* Page header */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-.3px" }}>
                                Account Settings
                            </h1>
                            <p style={{ fontSize: 12, color: C.muted, margin: "3px 0 0" }}>
                                Manage your profile, preferences and integrations
                            </p>
                        </div>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                                       onClick={save}
                                       style={{
                                           display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                                           borderRadius: 11, border: "none", background: C.f500,
                                           color: "#dcebd6", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                           fontFamily: "'DM Sans',sans-serif", transition: "background .15s",
                                       }}>
                            <Save size={13} /> Save Changes
                        </motion.button>
                    </motion.div>

                    {/* ── PROFILE ── */}
                    <Panel id="profile" title="Profile & Organisation" icon={User} color={C.f500}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <FieldLabel>User Name</FieldLabel>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                            </div>
                            <div>
                                <FieldLabel>Password</FieldLabel>
                                <Input value="••••••••" type="password" onChange={() => {}} />
                            </div>
                            <div>
                                <FieldLabel>Email</FieldLabel>
                                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
                            </div>
                            <div>
                                <FieldLabel>Phone Number</FieldLabel>
                                <Input value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                            <div style={{ gridColumn: "1/-1" }}>
                                <FieldLabel>Organisation</FieldLabel>
                                <Input value={org} onChange={e => setOrg(e.target.value)} />
                            </div>
                            <div>
                                <FieldLabel>City</FieldLabel>
                                <Input value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                            <div>
                                <FieldLabel>Bio</FieldLabel>
                                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                                          onFocus={e => e.target.style.borderColor = C.f500}
                                          onBlur={e => e.target.style.borderColor = C.border}
                                          style={{
                                              width: "100%", padding: "9px 12px", borderRadius: 9,
                                              border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)",
                                              color: C.text, fontSize: 12, outline: "none",
                                              transition: "border-color .18s",
                                          }} />
                            </div>
                        </div>
                    </Panel>

                    {/* ── APPEARANCE / ACCOUNT SETTINGS ── */}
                    <Panel id="appearance" title="Appearance" icon={Palette} color={C.purple}>
                        <Row label="App Theme" desc="Choose your preferred color scheme">
                            <PillGroup color={C.purple}
                                       options={[
                                           { id: "dark", label: "Dark", icon: Moon },
                                           { id: "light", label: "Light", icon: Sun },
                                           { id: "system", label: "System", icon: Monitor },
                                       ]}
                                       active={theme} onSelect={setTheme} />
                        </Row>
                        <Row label="Font size" desc="Adjust text size across the dashboard">
                            <PillGroup color={C.purple}
                                       options={[
                                           { id: "small", label: "Small" },
                                           { id: "medium", label: "Medium" },
                                           { id: "large", label: "Large" },
                                       ]}
                                       active={fontSize} onSelect={setFontSize} />
                        </Row>
                        <Row label="Layout Density" desc="Control spacing and compactness">
                            <PillGroup color={C.purple}
                                       options={[
                                           { id: "compact", label: "Compact" },
                                           { id: "comfortable", label: "Comfortable" },
                                           { id: "spacious", label: "Spacious" },
                                       ]}
                                       active={density} onSelect={setDensity} />
                        </Row>
                        {/* Online Status toggle (from reference image) */}
                        <Row label="Online status" desc="Show others when you're active">
                            <Toggle on={true} onToggle={() => {}} color={C.f500} />
                        </Row>
                    </Panel>

                    {/* ── INTEGRATIONS / SOCIAL LINKS ── */}
                    <Panel id="integrations" title="Integrations & Social Links" icon={Globe} color={C.f400}>
                        {[
                            { key: "slack", label: "Slack", desc: "Get alerts in your Slack workspace" },
                            { key: "whatsapp", label: "WhatsApp", desc: "Send field updates via WhatsApp Business" },
                            { key: "googleSheets", label: "Google Sheets", desc: "Sync reports to a connected spreadsheet" },
                            { key: "zapier", label: "Zapier", desc: "Connect to 3000+ apps via Zapier" },
                            { key: "sms", label: "SMS Gateway", desc: "Bulk SMS to volunteers for urgent tasks" },
                        ].map(item => (
                            <Row key={item.key} label={item.label} desc={item.desc}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                      fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                      background: integ[item.key] ? "rgba(90,120,99,0.2)" : "rgba(255,255,255,0.05)",
                      color: integ[item.key] ? C.f300 : C.muted,
                  }}>{integ[item.key] ? "Connected" : "Off"}</span>
                                    <Toggle on={integ[item.key]} onToggle={() => setInteg(p => ({ ...p, [item.key]: !p[item.key] }))} color={C.f500} />
                                </div>
                            </Row>
                        ))}
                    </Panel>

                    {/* ── AI / CALENDAR ── */}
                    <Panel id="ai" title="AI Engine Settings" icon={Zap} color={C.cyan}>
                        <div style={{
                            padding: "10px 14px", borderRadius: 9, marginBottom: 14,
                            background: "rgba(79,145,145,0.08)", border: `1px solid rgba(79,145,145,0.22)`,
                            display: "flex", alignItems: "center", gap: 8, fontSize: 11,
                            color: `${C.cyan}cc`,
                        }}>
                            <Zap size={12} style={{ color: C.cyan }} />
                            CivicPulse AI v2.4 · All models running · Last retrained 3 days ago
                        </div>
                        {[
                            { key: "autoScore", label: "Auto-score incoming needs", desc: "AI scores urgency (1–5) on submission" },
                            { key: "autoDuplicate", label: "Duplicate detection", desc: "Merge similar reports automatically" },
                            { key: "autoMatch", label: "Smart volunteer matching", desc: "AI assigns best-fit volunteer instantly" },
                            { key: "predictions", label: "Predictive alerts", desc: "Forecast demand spikes 24–48h ahead" },
                            { key: "smartRouting", label: "Smart route optimization", desc: "Minimize travel time for volunteers" },
                        ].map(s => (
                            <Row key={s.key} label={s.label} desc={s.desc}>
                                <Toggle on={ai[s.key]} onToggle={() => setAi(p => ({ ...p, [s.key]: !p[s.key] }))} color={C.cyan} />
                            </Row>
                        ))}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Min AI confidence threshold</span>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: C.cyan }}>{ai.minConf}%</span>
                                </div>
                                <input type="range" min={60} max={99} step={1} value={ai.minConf}
                                       onChange={e => setAi(p => ({ ...p, minConf: +e.target.value }))}
                                       style={{ width: "100%", accentColor: C.cyan }} />
                                <p style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>AI only auto-acts above this threshold</p>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Auto-escalation urgency level</span>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: C.amber }}>{ai.urgency}+</span>
                                </div>
                                <input type="range" min={1} max={5} step={1} value={ai.urgency}
                                       onChange={e => setAi(p => ({ ...p, urgency: +e.target.value }))}
                                       style={{ width: "100%", accentColor: C.amber }} />
                                <p style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>Needs at or above this urgency are auto-escalated</p>
                            </div>
                        </div>
                    </Panel>

                    {/* ── SECURITY / PRIVACY ── */}
                    <Panel id="security" title="Security & Privacy" icon={Shield} color={C.f400}>
                        <Row label="Two-factor authentication" desc="Adds a layer of security to your login">
                            <Toggle on={twoFA} onToggle={() => setTwoFA(p => !p)} color={C.f500} />
                        </Row>
                        <Row label="Change password" desc="Last changed 32 days ago">
                            <GhostBtn>Change</GhostBtn>
                        </Row>
                        <Row label="Delete account" desc="Permanently delete your account and all data." danger>
                            <DangerBtn onClick={() => setDanger({
                                title: "Delete your account?",
                                desc: "This will permanently delete your account, organisation data, and all submissions.",
                                onConfirm: () => setDanger(null),
                            })}>
                                <Trash2 size={11} /> Delete Account
                            </DangerBtn>
                        </Row>

                        <SubLabel>Active Sessions</SubLabel>
                        {sessions.map((s, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 0", borderBottom: i < sessions.length - 1 ? `1px solid ${C.border}` : "none",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: "50%",
                                        background: s.active ? C.f400 : "rgba(255,255,255,0.15)",
                                        boxShadow: s.active ? `0 0 5px ${C.f400}` : "none",
                                    }} />
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{s.device}</p>
                                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{s.time}</p>
                                    </div>
                                </div>
                                {s.active
                                    ? <span style={{ fontSize: 10, fontWeight: 700, color: C.f400 }}>Current</span>
                                    : <motion.button whileTap={{ scale: .95 }}
                                                     onClick={() => setSessions(p => p.filter((_, j) => j !== i))}
                                                     style={{
                                                         padding: "4px 10px", borderRadius: 7,
                                                         border: "1px solid rgba(184,85,71,0.3)",
                                                         background: "rgba(184,85,71,0.08)",
                                                         color: C.red, fontSize: 10, fontWeight: 700,
                                                         cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                                     }}>Revoke</motion.button>}
                            </div>
                        ))}
                    </Panel>

                    {/* ── NOTIFICATIONS ── */}
                    <Panel id="notifications" title="Notifications" icon={Bell} color={C.amber}>
                        {[
                            { key: "critical", label: "Critical alerts", desc: "Immediate notification for urgency 5 needs" },
                            { key: "assignments", label: "Assignment updates", desc: "When tasks are assigned or completed" },
                            { key: "aiAlerts", label: "AI insights", desc: "Predictions and anomalies from AI engine" },
                            { key: "weeklyReport", label: "Weekly summary report", desc: "Sent every Monday at 9am" },
                            { key: "volunteerUpdates", label: "Volunteer activity", desc: "Status updates from volunteers in your zones" },
                        ].map(n => (
                            <Row key={n.key} label={n.label} desc={n.desc}>
                                <Toggle on={notifs[n.key]} onToggle={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} color={C.amber} />
                            </Row>
                        ))}
                        <SubLabel>Delivery Channels</SubLabel>
                        {[
                            { key: "push", label: "Push notifications", icon: "📱" },
                            { key: "email", label: "Email", icon: "✉️" },
                            { key: "sms", label: "SMS alerts", icon: "📞" },
                        ].map(c => (
                            <Row key={c.key} label={`${c.icon}  ${c.label}`}>
                                <Toggle on={notifs[c.key]} onToggle={() => setNotifs(p => ({ ...p, [c.key]: !p[c.key] }))} color={C.amber} />
                            </Row>
                        ))}
                    </Panel>

                    {/* ── DATA & PRIVACY ── */}
                    <Panel id="data" title="Data & Privacy" icon={Database} color={C.red}>
                        <Row label="Export all data" desc="Download complete archive as JSON or CSV">
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                                           style={{
                                               display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                                               borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent",
                                               color: C.f400, fontSize: 11, fontWeight: 700, cursor: "pointer",
                                               fontFamily: "'DM Sans',sans-serif",
                                           }}>
                                <Download size={11} /> Export
                            </motion.button>
                        </Row>
                        <Row label="Data retention" desc="How long we store submitted needs data">
                            <select style={{
                                padding: "6px 10px", borderRadius: 8,
                                border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)",
                                color: C.text, fontSize: 11, cursor: "pointer", outline: "none",
                            }}>
                                <option>1 year</option>
                                <option>2 years</option>
                                <option>Forever</option>
                            </select>
                        </Row>
                        <Row label="Delete all submissions"
                             desc="Permanently delete all 1,243 need submissions. Cannot be undone." danger>
                            <DangerBtn onClick={() => setDanger({
                                title: "Delete all submissions?",
                                desc: "This will permanently delete all 1,243 need submissions. This action cannot be undone.",
                                onConfirm: () => setDanger(null),
                            })}>
                                <Trash2 size={11} /> Delete
                            </DangerBtn>
                        </Row>
                    </Panel>

                    {/* Bottom save */}
                    <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: .97 }}
                                   onClick={save}
                                   style={{
                                       width: "100%", padding: 14, borderRadius: 13, border: "none",
                                       background: C.f500, color: "#dcebd6",
                                       fontSize: 13, fontWeight: 800, cursor: "pointer",
                                       fontFamily: "'DM Sans',sans-serif",
                                       display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                       marginBottom: 40, transition: "background .15s",
                                   }}>
                        <Save size={14} /> Save All Settings
                    </motion.button>

                </div>
            </div>

            <Toast visible={saved} />
            <AnimatePresence>
                {danger && <DangerModal {...danger} onClose={() => setDanger(null)} />}
            </AnimatePresence>
        </div>
    )
}