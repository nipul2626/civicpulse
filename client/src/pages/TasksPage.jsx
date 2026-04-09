import { useState } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import styled from "styled-components"
import {
    Plus, Search, Filter, Zap, Clock, AlertTriangle,
    CheckCircle, User, Flag, MoreHorizontal, X,
    MapPin, Calendar, ChevronRight, Flame, Star,
    TrendingUp, ArrowUpRight, Tag, Paperclip
} from "lucide-react"

/* ─── PALETTE ─── */
const C = {
    bg:      "#0D1F19",
    surface: "#0e1c15",
    card:    "#122018",
    card2:   "#0f1d14",
    border:  "rgba(144,171,139,0.13)",
    borderHov: "rgba(144,171,139,0.3)",
    text:    "#e8f0e4",
    muted:   "#7a9b83",
    faint:   "#2d4a38",
    f300:    "#a3c09a",
    f400:    "#7aa375",
    f500:    "#5A7863",
    f600:    "#476053",
    f700:    "#3B4953",
    s300:    "#A8CE78",
    amber:   "#c9923a",
    red:     "#b85547",
    cyan:    "#4f9191",
    purple:  "#7a6bb5",
    pink:    "#b56b8a",
}

/* ─── VOID TOOLTIP (adapted from user's provided component) ─── */
const VoidWrapper = styled.div`
  .void-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: url("#goo");
  }
  .singularity {
    position: absolute;
    bottom: 44px;
    width: 50px; height: 50px;
    background: ${C.f700};
    border-radius: 50%;
    opacity: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.5s cubic-bezier(0.34,1.56,0.64,1);
    transform: translateY(30px) scale(0.1);
    pointer-events: none;
  }
  .s-content {
    opacity: 0; transition: 0.25s; color: ${C.f300};
    font-size: 0.55rem; font-weight: 800; letter-spacing: 2px;
    white-space: nowrap;
  }
  .event-horizon {
    position: relative; z-index: 2;
    padding: 9px 16px;
    background: ${C.f600};
    color: ${C.f300};
    border: none; border-radius: 10px; cursor: pointer;
    font-weight: 800; letter-spacing: 1px; font-size: 12px;
    transition: 0.25s; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 7px;
  }
  .void-wrap:hover .singularity {
    opacity: 1;
    width: 140px; height: 60px;
    border-radius: 14px;
    transform: translateY(-52px) scale(1);
  }
  .void-wrap:hover .s-content { opacity: 1; transition-delay: 0.3s; }
  .void-wrap:hover .event-horizon {
    transform: scale(0.96); letter-spacing: 3px;
    background: ${C.f500};
  }
  .singularity::before {
    content: "";
    position: absolute; inset: -4px;
    border-radius: inherit;
    background: linear-gradient(45deg, ${C.s300}, ${C.f300}, ${C.s300});
    z-index: -1; filter: blur(8px);
    animation: rotGlow 2s linear infinite;
    opacity: 0; transition: 0.4s;
  }
  .void-wrap:hover .singularity::before { opacity: 0.5; }
  @keyframes rotGlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`

const VoidButton = ({ label, icon: Icon, onClick }) => (
    <VoidWrapper>
        <div className="void-wrap" onClick={onClick}>
            <div className="singularity">
                <span className="s-content">+ TASK</span>
            </div>
            <button className="event-horizon">
                <Icon size={13} /> {label}
            </button>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: 0, height: 0 }}>
            <defs>
                <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={8} result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" result="goo" />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
            </defs>
        </svg>
    </VoidWrapper>
)

/* ─── DATA ─── */
const INIT_TASKS = {
    todo: [
        {
            id: "t1", title: "Survey flood-hit Zone B households",
            desc: "Complete 50 household surveys in Govandi sector 4 before Thursday.",
            priority: "urgent", tags: ["survey", "field"],
            volunteer: "Rohan Das", zone: "Govandi", due: "Apr 15",
            attachments: 2, urgency: 5, category: "Field Work",
        },
        {
            id: "t2", title: "Restock medical supply cache at Andheri hub",
            desc: "Coordinate with Dr. Arjun for inventory list and procure essentials.",
            priority: "high", tags: ["medical", "logistics"],
            volunteer: "Priya Nair", zone: "Andheri", due: "Apr 13",
            attachments: 0, urgency: 4, category: "Logistics",
        },
        {
            id: "t3", title: "Set up digital reporting terminals",
            desc: "Install 3 tablets with CivicPulse app in Kurla relief center.",
            priority: "medium", tags: ["tech", "setup"],
            volunteer: "Vikram Joshi", zone: "Kurla", due: "Apr 18",
            attachments: 1, urgency: 3, category: "Technology",
        },
    ],
    inprogress: [
        {
            id: "t4", title: "Water distribution drive — Malad West",
            desc: "Coordinating 3 volunteer teams for daily water tanker distribution.",
            priority: "urgent", tags: ["water", "community"],
            volunteer: "Kavita Sharma", zone: "Malad", due: "Apr 12",
            attachments: 1, urgency: 5, category: "Distribution", progress: 65,
        },
        {
            id: "t5", title: "Child welfare assessment — Dharavi",
            desc: "Document children's conditions and connect families to support programs.",
            priority: "high", tags: ["children", "welfare"],
            volunteer: "Sunita Patil", zone: "Dharavi", due: "Apr 14",
            attachments: 3, urgency: 4, category: "Welfare", progress: 40,
        },
        {
            id: "t6", title: "Legal documentation for displaced families",
            desc: "Help 25 families with emergency legal paperwork and ID replacement.",
            priority: "high", tags: ["legal", "documentation"],
            volunteer: "Ananya Singh", zone: "Colaba", due: "Apr 16",
            attachments: 5, urgency: 4, category: "Legal Aid", progress: 30,
        },
    ],
    review: [
        {
            id: "t7", title: "Zone A rescue operation debrief",
            desc: "Compile incident report and lessons learned from Bandra rescue mission.",
            priority: "medium", tags: ["report", "rescue"],
            volunteer: "Deepak Kumar", zone: "Bandra", due: "Apr 11",
            attachments: 4, urgency: 3, category: "Rescue Ops",
        },
    ],
    done: [
        {
            id: "t8", title: "Emergency food pack distribution — Round 1",
            desc: "1,200 food packs distributed across 5 zones successfully.",
            priority: "low", tags: ["food", "distribution"],
            volunteer: "Kavita Sharma", zone: "Multiple", due: "Apr 9",
            attachments: 2, urgency: 2, category: "Distribution",
        },
        {
            id: "t9", title: "Volunteer onboarding — April batch",
            desc: "8 new volunteers briefed and assigned to their respective zones.",
            priority: "low", tags: ["onboarding", "training"],
            volunteer: "Priya Nair", zone: "HQ", due: "Apr 8",
            attachments: 1, urgency: 1, category: "Admin",
        },
    ],
}

const COLUMNS = [
    { id: "todo",       label: "To Do",      color: C.faint,    textColor: C.muted },
    { id: "inprogress", label: "In Progress", color: C.cyan,     textColor: C.cyan  },
    { id: "review",     label: "In Review",  color: C.amber,    textColor: C.amber },
    { id: "done",       label: "Done",       color: C.s300,     textColor: C.s300  },
]

const PRIORITY_COLORS = {
    urgent: { bg: "rgba(184,85,71,0.15)", text: C.red,    border: "rgba(184,85,71,0.3)", label: "🔴 Urgent" },
    high:   { bg: "rgba(201,146,58,0.15)", text: C.amber, border: "rgba(201,146,58,0.3)", label: "🟠 High"   },
    medium: { bg: "rgba(79,145,145,0.15)", text: C.cyan,  border: "rgba(79,145,145,0.3)", label: "🔵 Medium" },
    low:    { bg: "rgba(90,120,99,0.15)", text: C.f400,   border: "rgba(90,120,99,0.3)",  label: "🟢 Low"    },
}

/* ─── TASK CARD ─── */
const TaskCard = ({ task, colId, onMove, onClick, delay = 0 }) => {
    const p = PRIORITY_COLORS[task.priority]
    const cols = COLUMNS.map(c => c.id)
    const colIdx = cols.indexOf(colId)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: .95, y: -8 }}
            transition={{ delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            onClick={onClick}
            style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "14px 14px 12px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "border-color .2s",
            }}
            className="task-card"
        >
            {/* urgency accent */}
            <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 3,
                background: task.urgency >= 5 ? C.red : task.urgency >= 4 ? C.amber : task.urgency >= 3 ? C.cyan : C.f500,
                borderRadius: "14px 0 0 14px",
            }} />

            {/* Category + priority */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingLeft: 6 }}>
        <span style={{
            fontSize: 9.5, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: ".7px",
        }}>{task.category}</span>
                <span style={{
                    fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                    background: p.bg, color: p.text, border: `1px solid ${p.border}`,
                }}>{task.priority}</span>
            </div>

            {/* Title */}
            <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: "0 0 6px", paddingLeft: 6, lineHeight: 1.4 }}>
                {task.title}
            </p>

            {/* Desc */}
            <p style={{
                fontSize: 11, color: C.muted, margin: "0 0 10px", paddingLeft: 6, lineHeight: 1.55,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{task.desc}</p>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10, paddingLeft: 6 }}>
                {task.tags.map(t => (
                    <span key={t} style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                        background: `${C.f700}60`, color: C.f300, letterSpacing: ".3px",
                    }}># {t}</span>
                ))}
            </div>

            {/* Progress bar (in-progress tasks) */}
            {task.progress !== undefined && (
                <div style={{ marginBottom: 10, paddingLeft: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: C.muted }}>Progress</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.cyan }}>{task.progress}%</span>
                    </div>
                    <div style={{ height: 4, background: C.faint, borderRadius: 4, overflow: "hidden" }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ delay: delay + 0.3, duration: 0.6, ease: "easeOut" }}
                            style={{ height: "100%", background: C.cyan, borderRadius: 4 }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: 10, paddingLeft: 6, borderTop: `1px solid ${C.border}`,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: `${C.f500}30`, border: `1px solid ${C.f500}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8.5, fontWeight: 900, color: C.f300, flexShrink: 0,
                    }}>
                        {task.volunteer.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 10.5, color: C.muted }}>{task.volunteer}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {task.attachments > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Paperclip size={10} style={{ color: C.faint }} />
                            <span style={{ fontSize: 10, color: C.faint }}>{task.attachments}</span>
                        </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Calendar size={10} style={{ color: C.faint }} />
                        <span style={{ fontSize: 10, color: C.faint }}>{task.due}</span>
                    </div>
                </div>
            </div>

            {/* Move buttons */}
            <div style={{ display: "flex", gap: 4, marginTop: 8, paddingLeft: 6 }}>
                {colIdx > 0 && (
                    <motion.button whileTap={{ scale: .93 }}
                                   onClick={e => { e.stopPropagation(); onMove(task.id, colId, COLUMNS[colIdx - 1].id) }}
                                   style={{
                                       fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                                       border: `1px solid ${C.border}`, background: "transparent",
                                       color: C.muted, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                       transition: "all .15s",
                                   }}>← Back</motion.button>
                )}
                {colIdx < COLUMNS.length - 1 && (
                    <motion.button whileTap={{ scale: .93 }}
                                   onClick={e => { e.stopPropagation(); onMove(task.id, colId, COLUMNS[colIdx + 1].id) }}
                                   style={{
                                       fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                                       border: `1px solid ${C.f500}50`, background: `${C.f500}15`,
                                       color: C.f300, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                                       transition: "all .15s",
                                   }}>Move → {COLUMNS[colIdx + 1].label}</motion.button>
                )}
            </div>
        </motion.div>
    )
}

/* ─── TASK DETAIL MODAL ─── */
const TaskModal = ({ task, onClose, onMove, colId }) => {
    if (!task) return null
    const p = PRIORITY_COLORS[task.priority]
    const cols = COLUMNS.map(c => c.id)
    const colIdx = cols.indexOf(colId)

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
                            zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                        }}>
                <motion.div
                    initial={{ scale: .9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: .92, y: 14, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 20, padding: "28px 28px 24px",
                        maxWidth: 500, width: "100%",
                        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
                        fontFamily: "'DM Sans', sans-serif",
                        position: "relative",
                    }}>
                    {/* top accent */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 3,
                        background: task.urgency >= 5 ? C.red : task.urgency >= 4 ? C.amber : C.cyan,
                        borderRadius: "20px 20px 0 0",
                    }} />

                    <motion.button whileTap={{ scale: .9 }} onClick={onClose}
                                   style={{
                                       position: "absolute", top: 18, right: 18,
                                       width: 30, height: 30, borderRadius: "50%",
                                       background: C.faint, border: "none", cursor: "pointer",
                                       display: "flex", alignItems: "center", justifyContent: "center",
                                   }}>
                        <X size={13} color={C.muted} />
                    </motion.button>

                    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{
                fontSize: 9.5, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                background: C.faint, color: C.muted, textTransform: "uppercase", letterSpacing: ".7px",
            }}>{task.category}</span>
                        <span style={{
                            fontSize: 9.5, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                            background: p.bg, color: p.text, border: `1px solid ${p.border}`,
                        }}>{p.label}</span>
                    </div>

                    <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: "0 0 10px", lineHeight: 1.3 }}>
                        {task.title}
                    </h2>
                    <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 20px", lineHeight: 1.65 }}>{task.desc}</p>

                    {task.progress !== undefined && (
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Progress</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: C.cyan }}>{task.progress}%</span>
                            </div>
                            <div style={{ height: 6, background: C.faint, borderRadius: 6, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${task.progress}%`, background: C.cyan, borderRadius: 6 }} />
                            </div>
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                        {[
                            { icon: User,     label: "Volunteer", value: task.volunteer },
                            { icon: MapPin,   label: "Zone",      value: task.zone },
                            { icon: Calendar, label: "Due",       value: task.due },
                            { icon: Flame,    label: "Urgency",   value: `Level ${task.urgency}/5` },
                        ].map(item => (
                            <div key={item.label} style={{
                                background: C.card, border: `1px solid ${C.border}`,
                                borderRadius: 10, padding: "10px 12px",
                                display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <item.icon size={13} style={{ color: C.f500, flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontSize: 9.5, color: C.muted, margin: 0, textTransform: "uppercase", letterSpacing: ".5px" }}>{item.label}</p>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: "2px 0 0" }}>{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
                        {task.tags.map(t => (
                            <span key={t} style={{
                                fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                                background: `${C.f500}18`, color: C.f300, border: `1px solid ${C.f500}25`,
                            }}># {t}</span>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {colIdx > 0 && (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                           onClick={() => { onMove(task.id, colId, COLUMNS[colIdx - 1].id); onClose() }}
                                           style={{
                                               flex: 1, padding: "9px 12px", borderRadius: 10,
                                               border: `1px solid ${C.border}`, background: "transparent",
                                               color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                               fontFamily: "'DM Sans',sans-serif",
                                           }}>← Move Back</motion.button>
                        )}
                        {colIdx < COLUMNS.length - 1 && (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                           onClick={() => { onMove(task.id, colId, COLUMNS[colIdx + 1].id); onClose() }}
                                           style={{
                                               flex: 2, padding: "9px 12px", borderRadius: 10,
                                               border: "none", background: C.f500,
                                               color: "#dcebd6", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                               fontFamily: "'DM Sans',sans-serif",
                                               display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                           }}>
                                Move to {COLUMNS[colIdx + 1].label} →
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function TaskPage() {
    const [tasks, setTasks] = useState(INIT_TASKS)
    const [search, setSearch] = useState("")
    const [filterPriority, setFilterPriority] = useState("all")
    const [selected, setSelected] = useState(null)
    const [selectedCol, setSelectedCol] = useState(null)

    const moveTask = (taskId, fromCol, toCol) => {
        setTasks(prev => {
            const task = prev[fromCol].find(t => t.id === taskId)
            return {
                ...prev,
                [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
                [toCol]:   [...prev[toCol], task],
            }
        })
    }

    const openTask = (task, colId) => {
        setSelected(task); setSelectedCol(colId)
    }

    const filteredTasks = colId => tasks[colId].filter(t =>
        (search === "" ||
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.volunteer.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some(g => g.toLowerCase().includes(search.toLowerCase()))) &&
        (filterPriority === "all" || t.priority === filterPriority)
    )

    const totalTasks = Object.values(tasks).flat().length
    const urgentCount = Object.values(tasks).flat().filter(t => t.priority === "urgent").length
    const doneCount = tasks.done.length
    const inProgressCount = tasks.inprogress.length

    return (
        <div style={{
            minHeight: "100vh", background: C.bg, color: C.text,
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", flexDirection: "column",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(90,120,99,0.3); border-radius: 2px; }
        input, select { font-family: 'DM Sans', sans-serif; }
        .task-card:hover { border-color: ${C.f500} !important; }
        .col-scroll { overflow-y: auto; max-height: calc(100vh - 240px); padding-right: 4px; }
      `}</style>

            {/* ── TOP BAR ── */}
            <div style={{
                padding: "24px 32px 20px",
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
                flexShrink: 0,
            }}>
                {/* Title row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `${C.f500}20`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Zap size={17} style={{ color: C.f400 }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-.4px", margin: 0 }}>
                                Task Board
                            </h1>
                            <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>
                                CivicPulse · Active operations
                            </p>
                        </div>
                    </div>

                    <VoidButton label="New Task" icon={Plus} onClick={() => {}} />
                </div>

                {/* Stats + Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    {/* Mini stats */}
                    <div style={{ display: "flex", gap: 10 }}>
                        {[
                            { label: "Total",      value: totalTasks,     color: C.muted },
                            { label: "Urgent",     value: urgentCount,    color: C.red   },
                            { label: "Active",     value: inProgressCount, color: C.cyan },
                            { label: "Done",       value: doneCount,      color: C.s300  },
                        ].map(s => (
                            <div key={s.label} style={{
                                padding: "6px 14px", borderRadius: 9,
                                background: C.card, border: `1px solid ${C.border}`,
                                textAlign: "center",
                            }}>
                                <p style={{ fontSize: 16, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
                                <p style={{ fontSize: 9.5, color: C.muted, margin: "1px 0 0", textTransform: "uppercase", letterSpacing: ".5px" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{
                        flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 9,
                        background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 9, padding: "0 12px",
                    }}>
                        <Search size={13} style={{ color: C.muted }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                               placeholder="Search tasks..."
                               style={{
                                   flex: 1, background: "transparent", border: "none", outline: "none",
                                   color: C.text, fontSize: 12.5, padding: "9px 0",
                               }} />
                    </div>

                    {/* Priority filter */}
                    <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                            style={{
                                padding: "7px 28px 7px 10px", borderRadius: 9, outline: "none",
                                border: `1px solid ${C.border}`, background: C.card,
                                color: C.text, fontSize: 11, fontWeight: 700, cursor: "pointer",
                                appearance: "none",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237a9b83'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                            }}>
                        <option value="all">All Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* ── KANBAN BOARD ── */}
            <div style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 0,
                overflow: "hidden",
                minHeight: 0,
            }}>
                {COLUMNS.map((col, ci) => {
                    const colTasks = filteredTasks(col.id)
                    return (
                        <div key={col.id} style={{
                            borderRight: ci < COLUMNS.length - 1 ? `1px solid ${C.border}` : "none",
                            display: "flex", flexDirection: "column",
                            minHeight: 0,
                        }}>
                            {/* Column header */}
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: ci * 0.05 }}
                                style={{
                                    padding: "16px 16px 12px",
                                    borderBottom: `1px solid ${C.border}`,
                                    flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: "50%",
                                        background: col.color,
                                        boxShadow: col.id === "inprogress" ? `0 0 6px ${col.color}` : "none",
                                    }} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: col.textColor, letterSpacing: ".3px" }}>
                    {col.label}
                  </span>
                                </div>
                                <span style={{
                                    fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                                    background: `${col.color}18`, color: col.textColor,
                                    border: `1px solid ${col.color}30`,
                                }}>{colTasks.length}</span>
                            </motion.div>

                            {/* Cards */}
                            <div className="col-scroll" style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                                <AnimatePresence>
                                    {colTasks.map((task, i) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            colId={col.id}
                                            onMove={moveTask}
                                            onClick={() => openTask(task, col.id)}
                                            delay={i * 0.04}
                                        />
                                    ))}
                                </AnimatePresence>

                                {colTasks.length === 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                style={{
                                                    padding: "28px 0", textAlign: "center",
                                                    border: `1.5px dashed ${C.faint}`,
                                                    borderRadius: 12, color: C.faint,
                                                }}>
                                        <p style={{ fontSize: 11, fontWeight: 700 }}>No tasks</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── TASK MODAL ── */}
            <AnimatePresence>
                {selected && (
                    <TaskModal
                        task={selected}
                        colId={selectedCol}
                        onClose={() => { setSelected(null); setSelectedCol(null) }}
                        onMove={moveTask}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}