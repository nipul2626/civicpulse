import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from "lucide-react"
import Input from "../components/Input"
import Button from "../components/Button"

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
}))

const NODES = [
    { x: 18, y: 22, label: "Field Report" },
    { x: 50, y: 15, label: "AI Scoring"   },
    { x: 82, y: 28, label: "Heatmap"      },
    { x: 25, y: 58, label: "Volunteer"    },
    { x: 58, y: 52, label: "Match"        },
    { x: 80, y: 65, label: "Task Done"    },
    { x: 40, y: 80, label: "Impact"       },
]

const EDGES = [
    [0,1],[1,2],[1,4],[3,4],[4,5],[4,6],[2,5]
]

const AnimatedSVGGraph = () => {
    const [active, setActive] = useState(0)

    useEffect(() => {
        const t = setInterval(() => setActive(p => (p + 1) % NODES.length), 1200)
        return () => clearInterval(t)
    }, [])

    return (
        <div className="relative w-full h-56">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {EDGES.map(([a, b], i) => (
                    <motion.line
                        key={i}
                        x1={`${NODES[a].x}%`} y1={`${NODES[a].y}%`}
                        x2={`${NODES[b].x}%`} y2={`${NODES[b].y}%`}
                        stroke="#5A7863" strokeWidth="0.4" strokeOpacity="0.5"
                        strokeDasharray="2 2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: i * 0.2, duration: 1 }}
                    />
                ))}
                {NODES.map((node, i) => (
                    <g key={i}>
                        <motion.circle
                            cx={`${node.x}%`} cy={`${node.y}%`} r="1.8"
                            fill={i === active ? "#90AB8B" : "#3B4953"}
                            stroke={i === active ? "#EBF4DD" : "#5A7863"}
                            strokeWidth="0.5"
                            animate={{ r: i === active ? 2.8 : 1.8, opacity: i === active ? 1 : 0.6 }}
                            transition={{ duration: 0.4 }}
                        />
                        {i === active && (
                            <motion.circle
                                cx={`${node.x}%`} cy={`${node.y}%`}
                                r="4" fill="none" stroke="#90AB8B" strokeWidth="0.3"
                                initial={{ r: 2, opacity: 1 }}
                                animate={{ r: 7, opacity: 0 }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        )}
                    </g>
                ))}
            </svg>
            {NODES.map((node, i) => (
                <motion.div
                    key={i}
                    className="absolute text-[9px] font-semibold pointer-events-none"
                    style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%,-220%)" }}
                    animate={{ opacity: i === active ? 1 : 0.35, scale: i === active ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                >
          <span className={`px-1.5 py-0.5 rounded-md whitespace-nowrap
            ${i === active
              ? "bg-moss-500 text-sage-50"
              : "bg-white/10 text-moss-300"}`}>
            {node.label}
          </span>
                </motion.div>
            ))}
        </div>
    )
}

const FeatureRow = ({ icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="flex items-start gap-3 bg-white/5 border border-white/10
    rounded-xl p-3 hover:bg-white/10 transition-all duration-300"
    >
        <div className="w-8 h-8 rounded-lg bg-green-600/20 border border-green-500/30
    flex items-center justify-center shrink-0 text-green-400">
            {icon}
        </div>

        <div>
            <p className="text-white text-sm font-semibold">{title}</p>
            <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
        </div>
    </motion.div>
)

const LoginPage = () => {
    const navigate = useNavigate()
    const [email,    setEmail]    = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading,  setLoading]  = useState(false)
    const [error,    setError]    = useState("")
    const containerRef = useRef(null)
    const mouseX = useMotionValue(0.5)
    const mouseY = useMotionValue(0.5)

    const orb1X = useTransform(mouseX, [0,1], ["-5%","5%"])
    const orb1Y = useTransform(mouseY, [0,1], ["-5%","5%"])
    const orb2X = useTransform(mouseX, [0,1], ["5%","-5%"])
    const orb2Y = useTransform(mouseY, [0,1], ["5%","-5%"])

    const handleMouseMove = (e) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        mouseX.set((e.clientX - rect.left) / rect.width)
        mouseY.set((e.clientY - rect.top) / rect.height)
    }

    const handleLogin = () => {
        if (!email || !password) { setError("Please fill in all fields"); return }
        setLoading(true); setError("")
        setTimeout(() => { setLoading(false); navigate("/dashboard") }, 1600)
    }

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="min-h-screen flex overflow-hidden"
            style={{ background: "#f0f4ec" }}
        >
            {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
            <div className="hidden lg:flex w-[52%] flex-col relative overflow-hidden"
                 style={{ background: "#1C352D" }}>

                {/* Parallax orbs */}
                <motion.div style={{ x: orb1X, y: orb1Y }}
                            className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            css={{ background: "radial-gradient(circle, #5A7863 0%, transparent 70%)",
                                opacity: 0.25, top: "-150px", left: "-150px", filter: "blur(60px)" }}
                />
                <motion.div style={{ x: orb2X, y: orb2Y }}
                            className="absolute w-[350px] h-[350px] rounded-full pointer-events-none"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            css={{ background: "radial-gradient(circle, #90AB8B 0%, transparent 70%)",
                                opacity: 0.15, bottom: "0px", right: "-80px", filter: "blur(60px)" }}
                />

                {/* Floating particles */}
                {PARTICLES.map(p => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            left: `${p.x}%`, top: `${p.y}%`,
                            width: p.size, height: p.size,
                            background: "#92af9a", opacity: 0.25,
                        }}
                        animate={{ y: [0, -30, 0], opacity: [0.1, 0.35, 0.1] }}
                        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-12 gap-8">

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3"
                    >
                        <motion.div
                            animate={{ boxShadow: ["0 0 0px #5A786300","0 0 24px #5A786366","0 0 0px #5A786300"] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{ background: "#5f887f" }}
                        >
                            <Zap size={20} color="#EBF4DD" />
                        </motion.div>
                        <div>
              <span className="font-display font-black text-xl" style={{ color: "#EBF4DD" }}>
                CivicPulse
              </span>
                            <p className="text-[10px] font-medium tracking-widest uppercase mt-0.5"
                               style={{ color: "#e5e3e3" }}>
                                by CivicPlus
                            </p>
                        </div>
                    </motion.div>

                    {/* Animated network graph */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="rounded-3xl border p-4"
                        style={{ background: "rgb(236 243 237)", borderColor: "rgb(235 239 236)" }}
                    >
                        <p className="text-[10px] font-bold tracking-widest uppercase mb-3"
                           style={{ color: "#0b3511" }}>
                            Live coordination network
                        </p>
                        <AnimatedSVGGraph />
                    </motion.div>

                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >

                        <h2 className="font-display font-black text-3xl leading-tight mb-3"
                            style={{ color: "#EBF4DD" }}>
                            Turning scattered data<br />into community action
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color: "#90AB8B" }}>
                            The only platform that closes the full loop — from paper survey to
                            volunteer deployed to donor notified.
                        </p>
                    </motion.div>

                    {/* Feature rows */}
                    <div className="flex flex-col gap-2 mt-auto">
                        {[
                            {
                                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                                title: "AI Urgency Scoring",
                                desc: "Every need scored in real-time with Gemini",
                                delay: 0.5
                            },
                            {
                                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="7" r="4"/></svg>,
                                title: "Smart Volunteer Match",
                                desc: "6-factor algorithm, zero manual calls",
                                delay: 0.65
                            },
                            {
                                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/></svg>,
                                title: "Live Impact Dashboard",
                                desc: "Donors see their contribution in real-time",
                                delay: 0.8
                            }
                        ].map(f => (
                            <FeatureRow key={f.title} {...f} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ RIGHT PANEL ══════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 relative">

                {/* Subtle bg pattern */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle, #5A786315 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[420px] relative z-10"
                >
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-10 lg:hidden">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                             style={{ background: "#1C352D" }}>
                            <Zap size={18} color="#EBF4DD" />
                        </div>
                        <span className="font-display font-black text-xl" style={{ color: "#1C352D" }}>
              CivicPulse
            </span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                text-[11px] font-bold tracking-wider uppercase mb-4"
                            style={{ background: "#EBF4DD", color: "#3B4953" }}
                        >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#5A7863" }} />
                            Coordinator Access
                        </motion.div>
                        <h1 className="font-display font-black text-4xl leading-tight"
                            style={{ color: "#1C352D" }}>
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#90AB8B" }}>
                            Sign in to manage your community needs
                        </p>
                    </div>

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="rounded-3xl p-8 space-y-5"
                        style={{
                            background: "rgba(255,255,255,0.9)",
                            backdropFilter: "blur(20px)",
                            border: "1.5px solid rgba(90,120,99,0.2)",
                            boxShadow: "0 20px 60px rgba(28,53,45,0.08)",
                        }}
                    >
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="rounded-xl px-4 py-3 text-sm"
                                style={{ background: "#fef2f2", color: "#dc2626",
                                    border: "1px solid #fecaca" }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <Input
                            label="Email address"
                            type="email"
                            placeholder="you@organization.org"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            icon={<Mail size={15} />}
                        />

                        {/* Password field */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold" style={{ color: "#3B4953" }}>
                                    Password
                                </label>
                                <button className="text-xs font-semibold transition-colors"
                                        style={{ color: "#5A7863" }}>
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2"
                                     style={{ color: "#90AB8B" }}>
                                    <Lock size={15} />
                                </div>
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl px-4 py-3 pl-10 pr-10 text-sm
                    transition-all duration-200 outline-none"
                                    style={{
                                        background: "#f8faf6",
                                        border: "1.5px solid #d4e4cc",
                                        color: "#1C352D",
                                    }}
                                    onFocus={e => e.target.style.borderColor = "#5A7863"}
                                    onBlur={e => e.target.style.borderColor = "#d4e4cc"}
                                />
                                <button type="button" onClick={() => setShowPass(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: "#90AB8B" }}>
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Sign in button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full rounded-2xl py-3.5 text-sm font-black
                flex items-center justify-center gap-2 transition-all duration-200
                disabled:opacity-60"
                            style={{ background: "#1C352D", color: "#EBF4DD",
                                boxShadow: "0 4px 20px rgba(28,53,45,0.3)" }}
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                            stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                            ) : (
                                <>Sign in to CivicPulse <ArrowRight size={15} /></>
                            )}
                        </motion.button>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px" style={{ background: "#e8f0e0" }} />
                            <span className="text-xs" style={{ color: "#90AB8B" }}>or</span>
                            <div className="flex-1 h-px" style={{ background: "#e8f0e0" }} />
                        </div>

                        {/* Google button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full rounded-2xl py-3 text-sm font-semibold
                flex items-center justify-center gap-2 transition-all duration-200"
                            style={{ background: "#fff", border: "1.5px solid #d4e4cc",
                                color: "#3B4953" }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </motion.button>

                        <p className="text-center text-sm" style={{ color: "#90AB8B" }}>
                            New to CivicPulse?{" "}
                            <Link to="/signup"
                                  className="font-black transition-colors"
                                  style={{ color: "#1C352D" }}>
                                Create account →
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

export default LoginPage