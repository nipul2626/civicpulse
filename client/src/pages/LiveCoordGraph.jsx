
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

const NODES = [
    { id: 0, x: 15, y: 30, label: "Field Report", icon: "📋", color: "#5A7863", size: 11 },
    { id: 1, x: 42, y: 14, label: "AI Scoring",   icon: "⚡", color: "#3B7D6E", size: 13 },
    { id: 2, x: 78, y: 20, label: "Heatmap",       icon: "🗺️", color: "#4A6741", size: 10 },
    { id: 3, x: 22, y: 62, label: "Volunteer",     icon: "👤", color: "#6B8F71", size: 12 },
    { id: 4, x: 55, y: 52, label: "Match",         icon: "🎯", color: "#2D5E4E", size: 13 },
    { id: 5, x: 82, y: 62, label: "Task Done",     icon: "✅", color: "#5A7863", size: 10 },
    { id: 6, x: 42, y: 82, label: "Impact",        icon: "❤️", color: "#3B5C38", size: 11 },
]

const EDGES = [
    [0, 1], [1, 2], [1, 4], [3, 4], [4, 5], [4, 6], [2, 5],
]

// Animated signal dot travelling along an edge
const SignalDot = ({ x1, y1, x2, y2, delay, color }) => {
    return (
        <motion.circle
            r="2.5"
            fill={color}
            filter={`drop-shadow(0 0 3px ${color})`}
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            style={{
                offsetPath: `path("M ${x1}% ${y1}% L ${x2}% ${y2}%")`,
                offsetRotate: "0deg",
            }}
            transition={{
                duration: 1.4,
                delay,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
            }}
        />
    )
}

const LiveCoordGraph = () => {
    const [activeNode, setActiveNode] = useState(1)
    const [pulseEdge, setPulseEdge]   = useState(0)
    const [hoveredNode, setHoveredNode] = useState(null)

    useEffect(() => {
        const t1 = setInterval(() => {
            setActiveNode(p => (p + 1) % NODES.length)
        }, 1600)
        const t2 = setInterval(() => {
            setPulseEdge(p => (p + 1) % EDGES.length)
        }, 900)
        return () => { clearInterval(t1); clearInterval(t2) }
    }, [])

    const active = hoveredNode !== null ? hoveredNode : activeNode

    return (
        <div style={{
            borderRadius: 20,
            border: "1.5px solid rgba(220,230,222,0.9)",
            background: "rgba(236,243,237,0.95)",
            padding: "14px 16px",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 12,
            }}>
                <p style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "#3B5C38", margin: 0,
                }}>
                    Live Coordination Network
                </p>
                <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "3px 9px", borderRadius: 20,
                    background: "rgba(59,125,110,0.12)",
                    border: "1px solid rgba(59,125,110,0.25)",
                }}>
          <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#3B7D6E",
              display: "inline-block",
              animation: "liveGlow 1.5s ease-in-out infinite",
          }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#3B7D6E" }}>Live</span>
                </div>
            </div>

            <style>{`
        @keyframes liveGlow {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(59,125,110,0.4); }
          50%       { opacity: 0.6; box-shadow: 0 0 0 4px rgba(59,125,110,0); }
        }
        @keyframes ringPulse {
          0%   { r: 14; opacity: 0.7; }
          100% { r: 24; opacity: 0; }
        }
      `}</style>

            {/* SVG graph */}
            <div style={{ position: "relative", height: 190 }}>
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{ width: "100%", height: "100%", overflow: "visible" }}
                >
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.2" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>

                    {/* Edges */}
                    {EDGES.map(([a, b], i) => {
                        const na = NODES[a], nb = NODES[b]
                        const isActive = (a === active || b === active)
                        const isPulsing = pulseEdge === i
                        return (
                            <g key={i}>
                                {/* Base line */}
                                <line
                                    x1={`${na.x}%`} y1={`${na.y}%`}
                                    x2={`${nb.x}%`} y2={`${nb.y}%`}
                                    stroke={isActive ? "#5A7863" : "rgba(90,120,99,0.25)"}
                                    strokeWidth={isActive ? "0.7" : "0.4"}
                                    strokeDasharray={isPulsing ? "none" : "2.5 2"}
                                    style={{ transition: "all 0.4s ease" }}
                                />
                                {/* Animated signal dot */}
                                {isActive && (
                                    <motion.circle
                                        r="1.8"
                                        fill="#90AB8B"
                                        filter="url(#glow)"
                                        initial={{ cx: `${na.x}%`, cy: `${na.y}%` }}
                                        animate={{ cx: `${nb.x}%`, cy: `${nb.y}%` }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "easeInOut",
                                            delay: i * 0.2,
                                        }}
                                    />
                                )}
                            </g>
                        )
                    })}

                    {/* Nodes */}
                    {NODES.map((node) => {
                        const isActive = node.id === active
                        return (
                            <g key={node.id}
                               style={{ cursor: "pointer" }}
                               onMouseEnter={() => setHoveredNode(node.id)}
                               onMouseLeave={() => setHoveredNode(null)}
                            >
                                {/* Pulse ring */}
                                {isActive && (
                                    <motion.circle
                                        cx={`${node.x}%`} cy={`${node.y}%`}
                                        fill="none"
                                        stroke={node.color}
                                        strokeWidth="0.5"
                                        initial={{ r: node.size * 0.7, opacity: 0.7 }}
                                        animate={{ r: node.size * 1.6, opacity: 0 }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                                    />
                                )}

                                {/* Node circle background */}
                                <motion.circle
                                    cx={`${node.x}%`} cy={`${node.y}%`}
                                    fill={isActive ? node.color : "rgba(235,244,221,0.8)"}
                                    stroke={isActive ? node.color : "rgba(90,120,99,0.3)"}
                                    strokeWidth={isActive ? "1" : "0.5"}
                                    animate={{
                                        r: isActive ? node.size * 0.82 : node.size * 0.58,
                                    }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    filter={isActive ? "url(#glow)" : undefined}
                                />
                            </g>
                        )
                    })}
                </svg>

                {/* Node labels (positioned absolutely) */}
                {NODES.map(node => {
                    const isActive = node.id === active
                    return (
                        <div
                            key={node.id}
                            style={{
                                position: "absolute",
                                left: `${node.x}%`,
                                top: `${node.y}%`,
                                transform: "translate(-50%, -260%)",
                                pointerEvents: "none",
                                zIndex: 10,
                            }}
                        >
                            <motion.div
                                animate={{
                                    opacity: isActive ? 1 : 0.35,
                                    y: isActive ? 0 : 3,
                                    scale: isActive ? 1 : 0.9,
                                }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 4,
                                    padding: "3px 8px", borderRadius: 8, whiteSpace: "nowrap",
                                    background: isActive ? node.color : "rgba(255,255,255,0.7)",
                                    border: isActive ? "none" : "1px solid rgba(90,120,99,0.2)",
                                    boxShadow: isActive ? `0 4px 12px ${node.color}40` : "none",
                                }}
                            >
                                <span style={{ fontSize: 9 }}>{node.icon}</span>
                                <span style={{
                                    fontSize: 8.5, fontWeight: 700,
                                    color: isActive ? "#EBF4DD" : "#5A7863",
                                }}>
                  {node.label}
                </span>
                            </motion.div>
                        </div>
                    )
                })}
            </div>

            {/* Active node description strip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(90,120,99,0.18)",
                        display: "flex", alignItems: "center", gap: 8,
                    }}
                >
                    <span style={{ fontSize: 14 }}>{NODES[active]?.icon}</span>
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 800, color: "#1C352D", margin: 0 }}>
                            {NODES[active]?.label}
                        </p>
                        <p style={{ fontSize: 9, color: "#90AB8B", margin: 0 }}>
                            {[
                                "Community member submits a need via mobile or paper form",
                                "Gemini AI scores urgency in real-time (1–100 scale)",
                                "Visual hotspot map updated for coordinators instantly",
                                "Best-matched volunteer notified via SMS/app",
                                "6-factor algorithm selects optimal match",
                                "Volunteer marks task complete — donor notified",
                                "Impact logged and reported to NGO and funders",
                            ][active]}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default LiveCoordGraph