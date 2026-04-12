import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, Bell, Shield, Zap, Globe, CheckCircle, AlertTriangle,
    Camera, Palette, Database, Trash2, Download, Save,
    Moon, Sun, Monitor, LogOut, Edit3, Link, Lock,
    ChevronRight
} from "lucide-react"

const C = {
    bg:      "#eef2eb",
    surface: "#e2e8de",
    card:    "#ffffff",
    border:  "rgba(45,90,45,0.12)",
    text:    "#1a2e1a",
    muted:   "#5a7a5a",
    faint:   "#c8d8c4",
    f300:    "#4a7a44",
    f400:    "#3a6a34",
    f500:    "#2d5a2d",
    f600:    "#245024",
    s300:    "#7ab870",
    amber:   "#c07a0a",
    red:     "#b84c2e",
    cyan:    "#1a6b7a",
    purple:  "#5a3a8a",
}

// Reusable components
const Toggle = ({ on, onToggle, color = C.f500 }) => (
    <motion.button onClick={onToggle}
                   animate={{ background: on ? color : C.faint }}
                   transition={{ duration: 0.18 }}
                   style={{
                       width: 38, height: 21, borderRadius: 11, border: "none",
                       cursor: "pointer", position: "relative", flexShrink: 0, outline: "none",
                   }}>
        <motion.div
            animate={{ x: on ? 19 : 2 }}
            transition={{ type: "spring", stiffness: 600, damping: 32 }}
            style={{
                position: "absolute", top: 2.5, width: 16, height: 16,
                borderRadius: "50%", background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }} />
    </motion.button>
)

const FieldLabel = ({ children }) => (
    <label style={{
        fontSize: 10, fontWeight: 700, color: C.muted,
        textTransform: "uppercase", letterSpacing: ".7px",
        display: "block", marginBottom: 5,
    }}>{children}</label>
)

const TextInput = ({ value, onChange, placeholder, type = "text" }) => {
    const [focused, setFocused] = useState(false)
    return (
        <input value={value} onChange={onChange} placeholder={placeholder} type={type}
               onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
               style={{
                   width: "100%", padding: "9px 11px", borderRadius: 8,
                   border: `1px solid ${focused ? C.f500 : C.border}`,
                   background: C.bg, color: C.text, fontSize: 12.5,
                   fontFamily: "'DM Sans', sans-serif", outline: "none",
                   transition: "border-color .15s",
               }} />
    )
}

const SettingRow = ({ label, desc, children, danger }) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 0", borderBottom: `1px solid ${C.border}`, gap: 12,
    }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: danger ? C.red : C.text, margin: 0 }}>{label}</p>
            {desc && <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0", lineHeight: 1.4 }}>{desc}</p>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
)

const PillGroup = ({ options, active, onSelect, color = C.f500 }) => (
    <div style={{ display: "flex", gap: 4 }}>
        {options.map(o => (
            <button key={o.id} onClick={() => onSelect(o.id)}
                    style={{
                        padding: "5px 11px", borderRadius: 7,
                        border: `1px solid ${active === o.id ? color : C.border}`,
                        background: active === o.id ? `${color}14` : "transparent",
                        color: active === o.id ? C.f300 : C.muted,
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        display: "flex", alignItems: "center", gap: 4,
                        transition: "all .13s",
                    }}>
                {o.icon && <o.icon size={10} />} {o.label}
            </button>
        ))}
    </div>
)

const Panel = ({ id, title, icon: Icon, color = C.f500, children }) => (
    <motion.div id={id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 14, overflow: "hidden", marginBottom: 12,
                }}>
        <div style={{
            padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 9,
        }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} style={{ color }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{title}</span>
        </div>
        <div style={{ padding: "16px 20px" }}>{children}</div>
    </motion.div>
)

const DangerModal = ({ title, desc, onConfirm, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
                    zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                }} onClick={onClose}>
        <motion.div initial={{ scale: .92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .92 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: C.card, border: `1px solid rgba(184,85,71,0.22)`,
                        borderRadius: 16, padding: 24, maxWidth: 360, width: "100%",
                    }}>
            <div style={{
                width: 42, height: 42, borderRadius: 11, background: "rgba(184,85,71,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
            }}>
                <AlertTriangle size={18} style={{ color: C.red }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: "0 0 7px" }}>{title}</p>
            <p style={{ fontSize: 12, color: C.muted, margin: "0 0 18px", lineHeight: 1.6 }}>{desc}</p>
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onClose} style={{
                    flex: 1, padding: 10, borderRadius: 9, border: `1px solid ${C.border}`,
                    background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                }}>Cancel</button>
                <button onClick={onConfirm} style={{
                    flex: 1, padding: 10, borderRadius: 9, border: "none", background: C.red,
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                }}>Confirm Delete</button>
            </div>
        </motion.div>
    </motion.div>
)

const Toast = ({ visible }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, y: 12, scale: .94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12 }}
                style={{
                    position: "fixed", bottom: 22, right: 22, zIndex: 800,
                    padding: "10px 16px", borderRadius: 10,
                    background: `${C.f500}18`, border: `1px solid ${C.f500}40`,
                    display: "flex", alignItems: "center", gap: 7,
                }}>
                <CheckCircle size={13} style={{ color: C.f300 }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.f300 }}>Settings saved!</span>
            </motion.div>
        )}
    </AnimatePresence>
)

// Navigation items — labels now match panel titles
const NAV = [
    { id: "profile",       label: "Profile & Organisation", icon: User    },
    { id: "appearance",    label: "Appearance",             icon: Palette },
    { id: "integrations",  label: "Integrations",           icon: Globe   },
    { id: "ai",            label: "AI Engine Settings",     icon: Zap     },
    { id: "security",      label: "Security & Privacy",     icon: Shield  },
    { id: "notifications", label: "Notifications",          icon: Bell    },
    { id: "data",          label: "Data & Privacy",         icon: Database},
]

export default function SettingsPage() {
    // Profile
    const [name,  setName]  = useState("Riya Sharma")
    const [email, setEmail] = useState("riya.sharma@greenhorizon.org")
    const [phone, setPhone] = useState("+91 98765 43210")
    const [org,   setOrg]   = useState("Green Horizon Foundation")
    const [city,  setCity]  = useState("Mumbai, Maharashtra")
    const [bio,   setBio]   = useState("NGO coordinator focused on community welfare and rapid response.")

    // Appearance
    const [theme,   setTheme]   = useState("dark")
    const [fontSize, setFontSize] = useState("medium")
    const [density, setDensity] = useState("comfortable")
    const [online, setOnline] = useState(true)

    // Notifications
    const [notifs, setNotifs] = useState({
        critical: true, assignments: true, aiAlerts: true,
        weeklyReport: true, volunteerUpdates: false,
        push: true, email: true, sms: false,
    })

    // AI
    const [ai, setAi] = useState({
        autoScore: true, autoDuplicate: true, autoMatch: true,
        predictions: true, smartRouting: true, minConf: 75, urgency: 4,
    })

    // Security
    const [twoFA, setTwoFA] = useState(true)
    const [sessions, setSessions] = useState([
        { device: "Chrome · Mumbai", active: true,  time: "Now"       },
        { device: "Mobile · iOS",    active: false, time: "2h ago"    },
        { device: "Firefox · Laptop",active: false, time: "Yesterday" },
    ])

    // Integrations
    const [integ, setInteg] = useState({
        slack: true, whatsapp: false, googleSheets: true, zapier: false, sms: true,
    })

    // UI state
    const [saved,    setSaved]    = useState(false)
    const [danger,   setDanger]   = useState(null)
    const [activeNav, setActiveNav] = useState("profile")
    const mainRef = useRef(null)

    const save = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2200)
    }

    // Sync nav with scroll
    useEffect(() => {
        const el = mainRef.current
        if (!el) return
        const handler = () => {
            const ids = NAV.map(n => n.id)
            for (const id of ids) {
                const sec = document.getElementById(id)
                if (sec && sec.offsetTop - 120 <= el.scrollTop) setActiveNav(id)
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
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(90,120,99,0.3); border-radius: 2px; }
                input, textarea, select { font-family: 'DM Sans', sans-serif; }
                input[type=range] { accent-color: ${C.f500}; }
                textarea { resize: none; }
            `}</style>

            {/* ── SIDEBAR ── */}
            <div style={{
                width: 248, flexShrink: 0, background: C.surface,
                borderRight: `1px solid ${C.border}`,
                display: "flex", flexDirection: "column",
                position: "sticky", top: 0, height: "100vh",
                overflow: "hidden",
            }}>
                {/* Profile card */}
                <div style={{ padding: "30px 22px 20px" }}>
                    <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${C.f500}, ${C.f600})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, fontWeight: 900, color: "#c9dbc3",
                            border: `2px solid ${C.f600}`,
                        }}>RS</div>
                        <div style={{
                            position: "absolute", bottom: 0, right: 0,
                            width: 20, height: 20, borderRadius: "50%",
                            background: C.f500, border: `2px solid ${C.surface}`,
                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        }}>
                            <Camera size={9} color="#c9dbc3" />
                        </div>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 1px" }}>{name}</p>
                    <p style={{ fontSize: 10.5, color: C.muted, margin: "0 0 8px" }}>{org}</p>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                        background: `${C.s300}20`, color: C.f300,
                    }}>✓ Verified</span>
                </div>

                <div style={{ height: 1, background: C.border, margin: "0 22px" }} />

                {/* Nav */}
                <nav style={{ padding: "10px 12px", flex: 1, overflowY: "auto" }}>
                    {NAV.map(item => {
                        const isActive = activeNav === item.id
                        return (
                            <button key={item.id} onClick={() => scrollTo(item.id)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        width: "100%", padding: "9px 11px", borderRadius: 9, border: "none",
                                        borderLeft: `2px solid ${isActive ? C.f500 : "transparent"}`,
                                        background: isActive ? `${C.f500}14` : "transparent",
                                        color: isActive ? C.f300 : C.muted,
                                        fontSize: 12, fontWeight: isActive ? 700 : 500,
                                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                        transition: "all .13s", marginBottom: 2, textAlign: "left",
                                    }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <item.icon size={13} style={{ color: isActive ? C.f400 : C.faint }} />
                                    {item.label}
                                </div>
                                <ChevronRight size={11} style={{ opacity: isActive ? .5 : .2 }} />
                            </button>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: "0 12px 24px" }}>
                    <div style={{ height: 1, background: C.border, margin: "0 0 12px" }} />
                    <button style={{
                        width: "100%", padding: "9px", borderRadius: 9, border: "none",
                        background: "rgba(184,85,71,0.1)", color: C.red,
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                        <LogOut size={12} /> Log out
                    </button>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div ref={mainRef} style={{ flex: 1, padding: "28px 36px", overflowY: "auto", maxHeight: "100vh" }}>
                <div style={{ maxWidth: 660, margin: "0 auto" }}>

                    {/* Page header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-.3px" }}>
                                Account Settings
                            </h1>
                            <p style={{ fontSize: 11.5, color: C.muted, margin: "3px 0 0" }}>
                                Manage your profile, preferences and integrations
                            </p>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                       onClick={save}
                                       style={{
                                           display: "flex", alignItems: "center", gap: 5, padding: "9px 16px",
                                           borderRadius: 9, border: "none", background: C.f500,
                                           color: "#dcebd6", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                           fontFamily: "'DM Sans',sans-serif",
                                       }}>
                            <Save size={12} /> Save Changes
                        </motion.button>
                    </div>

                    {/* Profile panel */}
                    <Panel id="profile" title="Profile & Organisation" icon={User} color={C.f500}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                            <div><FieldLabel>Full Name</FieldLabel><TextInput value={name} onChange={e => setName(e.target.value)} /></div>
                            <div><FieldLabel>Password</FieldLabel><TextInput value="••••••••" type="password" onChange={() => {}} /></div>
                            <div><FieldLabel>Email</FieldLabel><TextInput value={email} onChange={e => setEmail(e.target.value)} type="email" /></div>
                            <div><FieldLabel>Phone</FieldLabel><TextInput value={phone} onChange={e => setPhone(e.target.value)} /></div>
                            <div style={{ gridColumn: "1/-1" }}><FieldLabel>Organisation</FieldLabel><TextInput value={org} onChange={e => setOrg(e.target.value)} /></div>
                            <div><FieldLabel>City</FieldLabel><TextInput value={city} onChange={e => setCity(e.target.value)} /></div>
                            <div>
                                <FieldLabel>Bio</FieldLabel>
                                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                                          style={{
                                              width: "100%", padding: "9px 11px", borderRadius: 8,
                                              border: `1px solid ${C.border}`, background: C.bg,
                                              color: C.text, fontSize: 12, outline: "none",
                                          }} />
                            </div>
                        </div>
                    </Panel>

                    {/* Appearance panel */}
                    <Panel id="appearance" title="Appearance" icon={Palette} color={C.purple}>
                        <SettingRow label="App Theme" desc="Choose your preferred color scheme">
                            <PillGroup color={C.purple}
                                       options={[{ id: "dark", label: "Dark", icon: Moon }, { id: "light", label: "Light", icon: Sun }, { id: "system", label: "System", icon: Monitor }]}
                                       active={theme} onSelect={setTheme} />
                        </SettingRow>
                        <SettingRow label="Font size" desc="Adjust text size across the dashboard">
                            <PillGroup color={C.purple}
                                       options={[{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }, { id: "large", label: "Large" }]}
                                       active={fontSize} onSelect={setFontSize} />
                        </SettingRow>
                        <SettingRow label="Layout Density" desc="Control spacing and compactness">
                            <PillGroup color={C.purple}
                                       options={[{ id: "compact", label: "Compact" }, { id: "comfortable", label: "Comfortable" }, { id: "spacious", label: "Spacious" }]}
                                       active={density} onSelect={setDensity} />
                        </SettingRow>
                        <SettingRow label="Show online status" desc="Let others see when you're active">
                            <Toggle on={online} onToggle={() => setOnline(p => !p)} />
                        </SettingRow>
                    </Panel>

                    {/* Integrations panel */}
                    <Panel id="integrations" title="Integrations" icon={Globe} color={C.f400}>
                        {[
                            { key: "slack",        label: "Slack",         desc: "Get alerts in your Slack workspace"        },
                            { key: "whatsapp",     label: "WhatsApp",      desc: "Send field updates via WhatsApp Business"  },
                            { key: "googleSheets", label: "Google Sheets", desc: "Sync reports to a connected spreadsheet"   },
                            { key: "zapier",       label: "Zapier",        desc: "Connect to 3000+ apps via Zapier"          },
                            { key: "sms",          label: "SMS Gateway",   desc: "Bulk SMS to volunteers for urgent tasks"   },
                        ].map(item => (
                            <SettingRow key={item.key} label={item.label} desc={item.desc}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{
                                        fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                                        background: integ[item.key] ? `${C.s300}20` : C.faint + "60",
                                        color: integ[item.key] ? C.f300 : C.muted,
                                    }}>{integ[item.key] ? "Connected" : "Off"}</span>
                                    <Toggle on={integ[item.key]} onToggle={() => setInteg(p => ({ ...p, [item.key]: !p[item.key] }))} />
                                </div>
                            </SettingRow>
                        ))}
                    </Panel>

                    {/* AI Engine panel */}
                    <Panel id="ai" title="AI Engine Settings" icon={Zap} color={C.cyan}>
                        <div style={{
                            padding: "9px 12px", borderRadius: 8, marginBottom: 12,
                            background: `${C.cyan}08`, border: `1px solid ${C.cyan}20`,
                            display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: C.cyan,
                        }}>
                            <Zap size={11} style={{ color: C.cyan }} />
                            CivicPulse AI v2.4 · All models running · Last retrained 3 days ago
                        </div>
                        {[
                            { key: "autoScore",     label: "Auto-score incoming needs",   desc: "AI scores urgency (1–5) on submission"      },
                            { key: "autoDuplicate", label: "Duplicate detection",          desc: "Merge similar reports automatically"         },
                            { key: "autoMatch",     label: "Smart volunteer matching",    desc: "AI assigns best-fit volunteer instantly"     },
                            { key: "predictions",   label: "Predictive alerts",            desc: "Forecast demand spikes 24–48h ahead"        },
                            { key: "smartRouting",  label: "Smart route optimization",    desc: "Minimize travel time for volunteers"         },
                        ].map(s => (
                            <SettingRow key={s.key} label={s.label} desc={s.desc}>
                                <Toggle on={ai[s.key]} onToggle={() => setAi(p => ({ ...p, [s.key]: !p[s.key] }))} color={C.cyan} />
                            </SettingRow>
                        ))}
                        <div style={{ marginTop: 14 }}>
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Min confidence threshold</span>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: C.cyan }}>{ai.minConf}%</span>
                                </div>
                                <input type="range" min={60} max={99} step={1} value={ai.minConf}
                                       onChange={e => setAi(p => ({ ...p, minConf: +e.target.value }))}
                                       style={{ width: "100%" }} />
                                <p style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>AI only auto-acts above this threshold</p>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
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

                    {/* Security panel */}
                    <Panel id="security" title="Security & Privacy" icon={Shield} color={C.f400}>
                        <SettingRow label="Two-factor authentication" desc="Adds a layer of security to your login">
                            <Toggle on={twoFA} onToggle={() => setTwoFA(p => !p)} />
                        </SettingRow>
                        <SettingRow label="Change password" desc="Last changed 32 days ago">
                            <button style={{
                                padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.border}`,
                                background: "transparent", color: C.muted, fontSize: 11, fontWeight: 700,
                                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                            }}>Change</button>
                        </SettingRow>
                        <SettingRow label="Delete account" desc="Permanently delete your account and all data." danger>
                            <button onClick={() => setDanger({
                                title: "Delete your account?",
                                desc: "This will permanently delete your account, organisation data, and all submissions.",
                                onConfirm: () => setDanger(null),
                            })} style={{
                                display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7,
                                border: `1px solid rgba(184,85,71,0.28)`, background: "rgba(184,85,71,0.08)",
                                color: C.red, fontSize: 11, fontWeight: 700, cursor: "pointer",
                                fontFamily: "'DM Sans',sans-serif",
                            }}><Trash2 size={11} /> Delete Account</button>
                        </SettingRow>

                        <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".7px", margin: "14px 0 9px" }}>Active Sessions</p>
                        {sessions.map((s, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "9px 0",
                                borderBottom: i < sessions.length - 1 ? `1px solid ${C.border}` : "none",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <div style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        background: s.active ? C.s300 : C.faint,
                                        boxShadow: s.active ? `0 0 5px ${C.s300}` : "none",
                                    }} />
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{s.device}</p>
                                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{s.time}</p>
                                    </div>
                                </div>
                                {s.active
                                    ? <span style={{ fontSize: 10, fontWeight: 700, color: C.f400 }}>Current</span>
                                    : <button onClick={() => setSessions(p => p.filter((_, j) => j !== i))}
                                              style={{
                                                  padding: "3px 9px", borderRadius: 6,
                                                  border: "1px solid rgba(184,85,71,0.25)", background: "rgba(184,85,71,0.07)",
                                                  color: C.red, fontSize: 10, fontWeight: 700, cursor: "pointer",
                                                  fontFamily: "'DM Sans',sans-serif",
                                              }}>Revoke</button>}
                            </div>
                        ))}
                    </Panel>

                    {/* Notifications panel */}
                    <Panel id="notifications" title="Notifications" icon={Bell} color={C.amber}>
                        {[
                            { key: "critical",         label: "Critical alerts",        desc: "Immediate notification for urgency 5 needs"     },
                            { key: "assignments",      label: "Assignment updates",      desc: "When tasks are assigned or completed"           },
                            { key: "aiAlerts",         label: "AI insights",             desc: "Predictions and anomalies from AI engine"       },
                            { key: "weeklyReport",     label: "Weekly summary report",  desc: "Sent every Monday at 9am"                       },
                            { key: "volunteerUpdates", label: "Volunteer activity",      desc: "Status updates from volunteers in your zones"   },
                        ].map(n => (
                            <SettingRow key={n.key} label={n.label} desc={n.desc}>
                                <Toggle on={notifs[n.key]} onToggle={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} color={C.amber} />
                            </SettingRow>
                        ))}
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".7px", margin: "14px 0 9px" }}>Delivery Channels</p>
                        {[
                            { key: "push",  label: "Push notifications" },
                            { key: "email", label: "Email"              },
                            { key: "sms",   label: "SMS alerts"         },
                        ].map(c => (
                            <SettingRow key={c.key} label={c.label}>
                                <Toggle on={notifs[c.key]} onToggle={() => setNotifs(p => ({ ...p, [c.key]: !p[c.key] }))} color={C.amber} />
                            </SettingRow>
                        ))}
                    </Panel>

                    {/* Data & Privacy panel */}
                    <Panel id="data" title="Data & Privacy" icon={Database} color={C.red}>
                        <SettingRow label="Export all data" desc="Download complete archive as JSON or CSV">
                            <button style={{
                                display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7,
                                border: `1px solid ${C.border}`, background: "transparent", color: C.f400,
                                fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                            }}><Download size={11} /> Export</button>
                        </SettingRow>
                        <SettingRow label="Data retention" desc="How long we store submitted needs data">
                            <select style={{
                                padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.border}`,
                                background: C.bg, color: C.text, fontSize: 11, cursor: "pointer", outline: "none",
                            }}>
                                <option>1 year</option>
                                <option>2 years</option>
                                <option>Forever</option>
                            </select>
                        </SettingRow>
                        <SettingRow label="Delete all submissions" desc="Permanently delete all 1,243 need submissions. Cannot be undone." danger>
                            <button onClick={() => setDanger({
                                title: "Delete all submissions?",
                                desc: "This will permanently delete all 1,243 need submissions. This action cannot be undone.",
                                onConfirm: () => setDanger(null),
                            })} style={{
                                display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7,
                                border: `1px solid rgba(184,85,71,0.28)`, background: "rgba(184,85,71,0.08)",
                                color: C.red, fontSize: 11, fontWeight: 700, cursor: "pointer",
                                fontFamily: "'DM Sans',sans-serif",
                            }}><Trash2 size={11} /> Delete</button>
                        </SettingRow>
                    </Panel>

                    {/* Bottom save button */}
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }}
                                   onClick={save}
                                   style={{
                                       width: "100%", padding: 13, borderRadius: 12, border: "none",
                                       background: C.f500, color: "#dcebd6",
                                       fontSize: 13, fontWeight: 800, cursor: "pointer",
                                       fontFamily: "'DM Sans',sans-serif",
                                       display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                       marginBottom: 36,
                                   }}>
                        <Save size={13} /> Save All Settings
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