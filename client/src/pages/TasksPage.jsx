import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus, Search, Zap, Clock, CheckCircle, User,
    X, MapPin, Calendar, Flame, Paperclip, Filter, ChevronDown
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
    s300:    "#7ab870",
    amber:   "#c07a0a",
    red:     "#b84c2e",
    cyan:    "#1a6b7a",
    purple:  "#5a3a8a",
}

const COLUMNS = [
    { id: "todo",       label: "To Do",       color: C.muted,  dot: C.faint   },
    { id: "inprogress", label: "In Progress",  color: C.cyan,   dot: C.cyan    },
    { id: "review",     label: "In Review",   color: C.amber,  dot: C.amber   },
    { id: "done",       label: "Done",        color: C.s300,   dot: C.s300    },
]

const PRIORITY = {
    urgent: { bg: "rgba(184,85,71,0.12)", text: C.red,    label: "Urgent"  },
    high:   { bg: "rgba(192,122,10,0.12)", text: C.amber, label: "High"    },
    medium: { bg: "rgba(26,107,122,0.12)", text: C.cyan,  label: "Medium"  },
    low:    { bg: "rgba(45,90,45,0.12)",   text: C.f400,  label: "Low"     },
}

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

const urgencyColor = (u) => {
    if (u >= 5) return C.red
    if (u >= 4) return C.amber
    if (u >= 3) return C.cyan
    return C.f500
}

// Clean task card — no inline move buttons, open modal on click
const TaskCard = ({ task, colId, onClick, delay = 0 }) => {
    const p = PRIORITY[task.priority]
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: .96 }}
            transition={{ delay, duration: 0.25 }}
            whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(45,90,45,0.08)", transition: { duration: 0.15 } }}
            onClick={onClick}
            style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "14px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
            }}>

            {/* Urgency left strip */}
            <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                background: urgencyColor(task.urgency),
                borderRadius: "12px 0 0 12px",
            }} />

            {/* Category + priority pill */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingLeft: 8 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".6px" }}>
                    {task.category}
                </span>
                <span style={{
                    fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                    background: p.bg, color: p.text,
                }}>{p.label}</span>
            </div>

            {/* Title */}
            <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: "0 0 5px", paddingLeft: 8, lineHeight: 1.4 }}>
                {task.title}
            </p>

            {/* Desc */}
            <p style={{
                fontSize: 11.5, color: C.muted, margin: "0 0 10px", paddingLeft: 8, lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{task.desc}</p>

            {/* Tags */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10, paddingLeft: 8, flexWrap: "wrap" }}>
                {task.tags.map(t => (
                    <span key={t} style={{
                        fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                        background: `${C.f500}12`, color: C.f400,
                    }}>#{t}</span>
                ))}
            </div>

            {/* Progress bar — only for in-progress */}
            {task.progress !== undefined && (
                <div style={{ marginBottom: 10, paddingLeft: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: C.muted }}>Progress</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.cyan }}>{task.progress}%</span>
                    </div>
                    <div style={{ height: 3, background: C.faint, borderRadius: 3, overflow: "hidden" }}>
                        <motion.div
                            initial={{ width: 0 }} animate={{ width: `${task.progress}%` }}
                            transition={{ delay: delay + 0.2, duration: 0.5, ease: "easeOut" }}
                            style={{ height: "100%", background: C.cyan, borderRadius: 3 }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: 10, paddingLeft: 8, borderTop: `1px solid ${C.border}`,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: `${C.f500}25`, border: `1px solid ${C.f500}35`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, fontWeight: 800, color: C.f300,
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
        </motion.div>
    )
}

// Task detail modal — move actions live here only
const TaskModal = ({ task, colId, onClose, onMove }) => {
    if (!task) return null
    const p = PRIORITY[task.priority]
    const cols = COLUMNS.map(c => c.id)
    const colIdx = cols.indexOf(colId)

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
                zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            }}>
            <motion.div
                initial={{ scale: .94, y: 16 }} animate={{ scale: 1, y: 0 }}
                exit={{ scale: .94, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 18, padding: "26px 24px 22px",
                    maxWidth: 480, width: "100%",
                    fontFamily: "'DM Sans', sans-serif",
                    position: "relative",
                    maxHeight: "90vh", overflowY: "auto",
                }}>

                {/* Accent bar */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: urgencyColor(task.urgency), borderRadius: "18px 18px 0 0",
                }} />

                {/* Close */}
                <button onClick={onClose} style={{
                    position: "absolute", top: 16, right: 16,
                    width: 28, height: 28, borderRadius: "50%",
                    background: C.faint, border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <X size={12} color={C.muted} />
                </button>

                {/* Badges */}
                <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        background: C.faint, color: C.muted, textTransform: "uppercase", letterSpacing: ".6px",
                    }}>{task.category}</span>
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        background: p.bg, color: p.text,
                    }}>{p.label}</span>
                </div>

                <h2 style={{ fontSize: 17, fontWeight: 900, color: C.text, margin: "0 0 9px", lineHeight: 1.35 }}>
                    {task.title}
                </h2>
                <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 18px", lineHeight: 1.65 }}>{task.desc}</p>

                {/* Progress */}
                {task.progress !== undefined && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Progress</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: C.cyan }}>{task.progress}%</span>
                        </div>
                        <div style={{ height: 5, background: C.faint, borderRadius: 5, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${task.progress}%`, background: C.cyan, borderRadius: 5 }} />
                        </div>
                    </div>
                )}

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {[
                        { icon: User,     label: "Volunteer", value: task.volunteer },
                        { icon: MapPin,   label: "Zone",      value: task.zone },
                        { icon: Calendar, label: "Due",       value: task.due },
                        { icon: Flame,    label: "Urgency",   value: `Level ${task.urgency}/5` },
                    ].map(item => (
                        <div key={item.label} style={{
                            background: C.card, border: `1px solid ${C.border}`,
                            borderRadius: 9, padding: "9px 11px",
                            display: "flex", alignItems: "center", gap: 7,
                        }}>
                            <item.icon size={12} style={{ color: C.f500, flexShrink: 0 }} />
                            <div>
                                <p style={{ fontSize: 9, color: C.muted, margin: 0, textTransform: "uppercase", letterSpacing: ".5px" }}>{item.label}</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: "2px 0 0" }}>{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
                    {task.tags.map(t => (
                        <span key={t} style={{
                            fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                            background: `${C.f500}14`, color: C.f300, border: `1px solid ${C.f500}22`,
                        }}>#{t}</span>
                    ))}
                </div>

                {/* Move actions — only in modal */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {colIdx > 0 && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                       onClick={() => { onMove(task.id, colId, COLUMNS[colIdx - 1].id); onClose() }}
                                       style={{
                                           flex: 1, padding: "9px", borderRadius: 9,
                                           border: `1px solid ${C.border}`, background: "transparent",
                                           color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                           fontFamily: "'DM Sans',sans-serif",
                                       }}>← Move Back</motion.button>
                    )}
                    {colIdx < COLUMNS.length - 1 && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
                                       onClick={() => { onMove(task.id, colId, COLUMNS[colIdx + 1].id); onClose() }}
                                       style={{
                                           flex: 2, padding: "9px", borderRadius: 9,
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
    )
}

export default function TasksPage() {
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

    const filteredTasks = (colId) => tasks[colId].filter(t =>
        (search === "" ||
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.volunteer.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some(g => g.toLowerCase().includes(search.toLowerCase()))) &&
        (filterPriority === "all" || t.priority === filterPriority)
    )

    const totalTasks    = Object.values(tasks).flat().length
    const urgentCount   = Object.values(tasks).flat().filter(t => t.priority === "urgent").length
    const doneCount     = tasks.done.length
    const inProgCount   = tasks.inprogress.length

    return (
        <div style={{
            minHeight: "100vh", background: C.bg, color: C.text,
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", flexDirection: "column",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(90,120,99,0.3); border-radius: 2px; }
                input, select { font-family: 'DM Sans', sans-serif; }
            `}</style>

            {/* Top bar */}
            <div style={{
                padding: "20px 28px",
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
                flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 9,
                            background: `${C.f500}18`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Zap size={15} style={{ color: C.f400 }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-.3px" }}>
                                Task Board
                            </h1>
                            <p style={{ fontSize: 10.5, color: C.muted, margin: "1px 0 0" }}>CivicPulse · Active operations</p>
                        </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
                                   style={{
                                       display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                                       borderRadius: 10, border: "none", background: C.f500,
                                       color: "#dcebd6", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                       fontFamily: "'DM Sans',sans-serif",
                                   }}>
                        <Plus size={13} /> New Task
                    </motion.button>
                </div>

                {/* Stats + search row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {/* Stats pills */}
                    <div style={{ display: "flex", gap: 8 }}>
                        {[
                            { label: "Total",  value: totalTasks,  color: C.muted },
                            { label: "Urgent", value: urgentCount, color: C.red   },
                            { label: "Active", value: inProgCount, color: C.cyan  },
                            { label: "Done",   value: doneCount,   color: C.s300  },
                        ].map(s => (
                            <div key={s.label} style={{
                                padding: "5px 12px", borderRadius: 8,
                                background: C.card, border: `1px solid ${C.border}`,
                                textAlign: "center",
                            }}>
                                <p style={{ fontSize: 15, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
                                <p style={{ fontSize: 9, color: C.muted, margin: "1px 0 0", textTransform: "uppercase", letterSpacing: ".5px" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{
                        flex: 1, minWidth: 160, display: "flex", alignItems: "center", gap: 8,
                        background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "0 11px",
                    }}>
                        <Search size={12} style={{ color: C.muted }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                               placeholder="Search tasks..."
                               style={{
                                   flex: 1, background: "transparent", border: "none", outline: "none",
                                   color: C.text, fontSize: 12.5, padding: "8px 0",
                               }} />
                    </div>

                    {/* Priority filter */}
                    <div style={{ position: "relative" }}>
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                                style={{
                                    padding: "7px 26px 7px 9px", borderRadius: 8, outline: "none",
                                    border: `1px solid ${C.border}`, background: C.card,
                                    color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                    appearance: "none",
                                }}>
                            <option value="all">All Priority</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <ChevronDown size={10} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
                    </div>
                </div>
            </div>

            {/* Kanban board */}
            <div style={{
                flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                overflow: "hidden", minHeight: 0,
            }}>
                {COLUMNS.map((col, ci) => {
                    const colTasks = filteredTasks(col.id)
                    return (
                        <div key={col.id} style={{
                            borderRight: ci < COLUMNS.length - 1 ? `1px solid ${C.border}` : "none",
                            display: "flex", flexDirection: "column", minHeight: 0,
                        }}>
                            {/* Column header */}
                            <div style={{
                                padding: "14px 14px 10px",
                                borderBottom: `1px solid ${C.border}`,
                                flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <div style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        background: col.dot,
                                        boxShadow: col.id === "inprogress" ? `0 0 5px ${col.dot}` : "none",
                                    }} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: col.color, letterSpacing: ".3px" }}>
                                        {col.label}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20,
                                    background: `${col.dot}18`, color: col.color,
                                    border: `1px solid ${col.dot}28`,
                                }}>{colTasks.length}</span>
                            </div>

                            {/* Cards — scrollable */}
                            <div style={{
                                flex: 1, overflowY: "auto", padding: "10px 10px",
                                display: "flex", flexDirection: "column", gap: 8,
                            }}>
                                <AnimatePresence>
                                    {colTasks.map((task, i) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            colId={col.id}
                                            onClick={() => { setSelected(task); setSelectedCol(col.id) }}
                                            delay={i * 0.04}
                                        />
                                    ))}
                                </AnimatePresence>

                                {colTasks.length === 0 && (
                                    <div style={{
                                        padding: "24px 0", textAlign: "center",
                                        border: `1.5px dashed ${C.faint}`,
                                        borderRadius: 10, color: C.faint,
                                    }}>
                                        <p style={{ fontSize: 11, fontWeight: 600 }}>No tasks here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Task modal */}
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