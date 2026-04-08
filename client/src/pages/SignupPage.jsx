import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, Mail, Lock, Building2, Zap,
    ArrowRight, ArrowLeft, Check,
    MapPin, Phone, Globe
} from "lucide-react"
import Input from "../components/Input"

const STEPS = [
    { id: 0, label: "Choose role",  desc: "Who are you?"            },
    { id: 1, label: "Your details", desc: "Basic information"       },
    { id: 2, label: "Skills",       desc: "What can you do?"        },
    { id: 3, label: "Confirm",      desc: "Review and finish"       },
]

const SKILLS = [
    "Medical Aid","Logistics","Teaching","Construction",
    "Counseling","Driving","Cooking","IT Support",
    "Translation","Photography","Legal Aid","Finance",
]

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

const StepBar = ({ current }) => (
    <div className="w-full flex items-center justify-center gap-0 mb-10">
        {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
                <motion.div
                    className="flex flex-col items-center gap-1.5 relative"
                    style={{ minWidth: 80 }}
                >
                    <motion.div
                        animate={{
                            background:   i < current ? "#1C352D" : i === current ? "#5A7863" : "#e8f0e0",
                            borderColor:  i <= current ? "#5A7863" : "#d4e4cc",
                            scale:        i === current ? 1.15 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-9 h-9 rounded-full border-2 flex items-center
              justify-center font-black text-sm z-10"
                        style={{ color: i <= current ? "#EBF4DD" : "#90AB8B" }}
                    >
                        {i < current ? <Check size={15} /> : i + 1}
                    </motion.div>
                    <span className="text-[11px] font-semibold whitespace-nowrap"
                          style={{ color: i <= current ? "#1C352D" : "#90AB8B" }}>
            {s.label}
          </span>
                </motion.div>
                {i < STEPS.length - 1 && (
                    <motion.div
                        className="h-0.5 w-12 mb-5 -mx-2"
                        animate={{ background: i < current ? "#5A7863" : "#e8f0e0" }}
                        transition={{ duration: 0.4 }}
                    />
                )}
            </div>
        ))}
    </div>
)

const SignupPage = () => {
    const navigate  = useNavigate()
    const [step,    setStep]    = useState(0)
    const [role,    setRole]    = useState(null)
    const [loading, setLoading] = useState(false)
    const [form,    setForm]    = useState({
        name: "", email: "", password: "",
        org: "", phone: "", city: "",
        skills: [], days: [],
    })
    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
    const toggleSkill = s => setForm(p => ({
        ...p, skills: p.skills.includes(s)
            ? p.skills.filter(x => x !== s)
            : [...p.skills, s]
    }))
    const toggleDay = d => setForm(p => ({
        ...p, days: p.days.includes(d)
            ? p.days.filter(x => x !== d)
            : [...p.days, d]
    }))

    const next = () => {
        if (step === 0 && !role) return
        if (step < STEPS.length - 1) { setStep(s => s + 1); return }
        setLoading(true)
        setTimeout(() => { setLoading(false); navigate("/dashboard") }, 1800)
    }

    const slideVar = {
        enter:  (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:   (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
    }

    return (
        <div className="min-h-screen relative overflow-hidden"
             style={{ background: "linear-gradient(135deg, #EBF4DD 0%, #f5f7f2 50%, #e8f0e0 100%)" }}>

            {/* Floating particles background */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: Math.random() * 6 + 2,
                        height: Math.random() * 6 + 2,
                        background: "#5A7863",
                        opacity: 0.12,
                    }}
                    animate={{ y: [0, -40, 0], opacity: [0.05, 0.2, 0.05] }}
                    transition={{
                        duration: Math.random() * 6 + 5,
                        delay: Math.random() * 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Large morphing orbs */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{ width: 500, height: 500, background: "#5A7863",
                    opacity: 0.07, filter: "blur(80px)", top: -150, right: -150 }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{ width: 400, height: 400, background: "#1C352D",
                    opacity: 0.06, filter: "blur(80px)", bottom: -100, left: -100 }}
                animate={{ scale: [1, 1.15, 1], rotate: [0, -90, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center
        justify-start pt-12 pb-20 px-4">

                {/* Top logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-10"
                >
                    <motion.div
                        animate={{ boxShadow: ["0 0 0px #5A786300","0 0 20px #5A786355","0 0 0px #5A786300"] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center"
                        style={{ background: "#1C352D" }}
                    >
                        <Zap size={22} color="#EBF4DD" />
                    </motion.div>
                    <div>
                        <p className="font-display font-black text-2xl" style={{ color: "#1C352D" }}>
                            CivicPulse
                        </p>
                        <p className="text-[10px] font-semibold tracking-widest uppercase"
                           style={{ color: "#90AB8B" }}>
                            Join the platform
                        </p>
                    </div>
                </motion.div>

                {/* Step bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl"
                >
                    <StepBar current={step} />
                </motion.div>

                {/* Main card — full width below stepper */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-2xl rounded-3xl p-8 lg:p-10"
                    style={{
                        background: "rgba(255,255,255,0.88)",
                        backdropFilter: "blur(24px)",
                        border: "1.5px solid rgba(90,120,99,0.2)",
                        boxShadow: "0 24px 80px rgba(28,53,45,0.1)",
                        minHeight: 400,
                    }}
                >
                    <AnimatePresence mode="wait" custom={1}>
                        <motion.div
                            key={step}
                            custom={1}
                            variants={slideVar}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.28, ease: "easeOut" }}
                        >

                            {/* ── STEP 0: Role picker ── */}
                            {step === 0 && (
                                <div>
                                    <h2 className="font-display font-black text-3xl mb-2"
                                        style={{ color: "#1C352D" }}>
                                        How will you use CivicPulse?
                                    </h2>
                                    <p className="text-sm mb-8" style={{ color: "#90AB8B" }}>
                                        Pick your role to get a tailored experience
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            {
                                                key: "ngo",
                                                icon: <Building2 size={28} />,
                                                title: "NGO Coordinator",
                                                desc: "Manage community needs, assign volunteers, track impact and generate reports for donors.",
                                                tags: ["Dashboard","Heatmap","Reports"],
                                            },
                                            {
                                                key: "volunteer",
                                                icon: <User size={28} />,
                                                title: "Volunteer",
                                                desc: "Get matched to tasks that fit your skills, location, and availability. Make real impact.",
                                                tags: ["Task feed","Skills","Impact"],
                                            },
                                        ].map(r => (
                                            <motion.button
                                                key={r.key}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setRole(r.key)}
                                                className="text-left rounded-2xl p-6 border-2 transition-all duration-200"
                                                style={{
                                                    background: role === r.key ? "#EBF4DD" : "#f8faf6",
                                                    borderColor: role === r.key ? "#5A7863" : "#d4e4cc",
                                                    boxShadow: role === r.key
                                                        ? "0 8px 30px rgba(90,120,99,0.2)"
                                                        : "none",
                                                }}
                                            >
                                                <div className="w-12 h-12 rounded-2xl flex items-center
                          justify-center mb-4"
                                                     style={{
                                                         background: role === r.key ? "#5A7863" : "#e8f0e0",
                                                         color: role === r.key ? "#EBF4DD" : "#5A7863",
                                                     }}>
                                                    {r.icon}
                                                </div>
                                                <p className="font-black text-lg mb-2"
                                                   style={{ color: "#1C352D" }}>{r.title}</p>
                                                <p className="text-sm mb-4 leading-relaxed"
                                                   style={{ color: "#5A7863" }}>{r.desc}</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {r.tags.map(t => (
                                                        <span key={t} className="text-[11px] font-bold px-2.5 py-1
                              rounded-full" style={{
                                                            background: role === r.key ? "#5A7863" : "#e8f0e0",
                                                            color: role === r.key ? "#EBF4DD" : "#3B4953"
                                                        }}>{t}</span>
                                                    ))}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 1: Details ── */}
                            {step === 1 && (
                                <div>
                                    <h2 className="font-display font-black text-3xl mb-2"
                                        style={{ color: "#1C352D" }}>
                                        {role === "ngo" ? "Tell us about your NGO" : "Your basic info"}
                                    </h2>
                                    <p className="text-sm mb-8" style={{ color: "#90AB8B" }}>
                                        This is how you'll appear on the platform
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Input
                                            label={role === "ngo" ? "Organization name" : "Full name"}
                                            placeholder={role === "ngo" ? "Green Future NGO" : "Alex Johnson"}
                                            value={form.name}
                                            onChange={set("name")}
                                            icon={role === "ngo" ? <Building2 size={15} /> : <User size={15} />}
                                        />
                                        <Input
                                            label="Email address"
                                            type="email"
                                            placeholder="you@organization.org"
                                            value={form.email}
                                            onChange={set("email")}
                                            icon={<Mail size={15} />}
                                        />
                                        <Input
                                            label="Password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={set("password")}
                                            icon={<Lock size={15} />}
                                        />
                                        <Input
                                            label="Phone number"
                                            placeholder="+91 98765 43210"
                                            value={form.phone}
                                            onChange={set("phone")}
                                            icon={<Phone size={15} />}
                                        />
                                        <Input
                                            label="City"
                                            placeholder="Mumbai"
                                            value={form.city}
                                            onChange={set("city")}
                                            icon={<MapPin size={15} />}
                                        />
                                        {role === "ngo" && (
                                            <Input
                                                label="Website (optional)"
                                                placeholder="https://yourngo.org"
                                                value={form.org}
                                                onChange={set("org")}
                                                icon={<Globe size={15} />}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: Skills + availability ── */}
                            {step === 2 && (
                                <div>
                                    <h2 className="font-display font-black text-3xl mb-2"
                                        style={{ color: "#1C352D" }}>
                                        {role === "ngo" ? "Areas you serve" : "Your skills"}
                                    </h2>
                                    <p className="text-sm mb-6" style={{ color: "#90AB8B" }}>
                                        Select everything that applies — the AI uses this for matching
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {SKILLS.map(s => (
                                            <motion.button
                                                key={s}
                                                whileTap={{ scale: 0.94 }}
                                                onClick={() => toggleSkill(s)}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold
                          border-2 transition-all duration-200"
                                                style={{
                                                    background:   form.skills.includes(s) ? "#1C352D" : "#f8faf6",
                                                    borderColor:  form.skills.includes(s) ? "#1C352D" : "#d4e4cc",
                                                    color:        form.skills.includes(s) ? "#EBF4DD" : "#5A7863",
                                                    boxShadow:    form.skills.includes(s)
                                                        ? "0 4px 12px rgba(28,53,45,0.2)" : "none",
                                                }}
                                            >
                                                {s}
                                            </motion.button>
                                        ))}
                                    </div>

                                    <p className="text-sm font-bold mb-3" style={{ color: "#1C352D" }}>
                                        Available days
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        {DAYS.map(d => (
                                            <motion.button
                                                key={d}
                                                whileTap={{ scale: 0.94 }}
                                                onClick={() => toggleDay(d)}
                                                className="w-14 py-2.5 rounded-xl text-sm font-bold
                          border-2 transition-all duration-200"
                                                style={{
                                                    background:  form.days.includes(d) ? "#5A7863" : "#f8faf6",
                                                    borderColor: form.days.includes(d) ? "#5A7863" : "#d4e4cc",
                                                    color:       form.days.includes(d) ? "#EBF4DD" : "#90AB8B",
                                                }}
                                            >
                                                {d}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 3: Confirm ── */}
                            {step === 3 && (
                                <div className="text-center py-4">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center
                      mx-auto mb-6"
                                        style={{ background: "#1C352D",
                                            boxShadow: "0 8px 32px rgba(28,53,45,0.3)" }}
                                    >
                                        <Check size={36} color="#EBF4DD" />
                                    </motion.div>
                                    <h2 className="font-display font-black text-3xl mb-3"
                                        style={{ color: "#1C352D" }}>
                                        You're all set!
                                    </h2>
                                    <p className="text-sm mb-8" style={{ color: "#90AB8B" }}>
                                        Review your details below, then create your account
                                    </p>
                                    <div className="rounded-2xl p-5 text-left space-y-3"
                                         style={{ background: "#f8faf6", border: "1.5px solid #e8f0e0" }}>
                                        {[
                                            ["Role",  role === "ngo" ? "NGO Coordinator" : "Volunteer"],
                                            ["Name",  form.name  || "—"],
                                            ["Email", form.email || "—"],
                                            ["City",  form.city  || "—"],
                                            ["Skills", form.skills.length ? form.skills.join(", ") : "—"],
                                        ].map(([k, v]) => (
                                            <div key={k} className="flex justify-between text-sm">
                                                <span className="font-semibold" style={{ color: "#90AB8B" }}>{k}</span>
                                                <span className="font-bold text-right max-w-[60%]"
                                                      style={{ color: "#1C352D" }}>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Navigation buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-2xl flex gap-3 mt-5"
                >
                    {step > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl
                text-sm font-black transition-all duration-200"
                            style={{ background: "rgba(255,255,255,0.8)",
                                border: "1.5px solid #d4e4cc", color: "#3B4953" }}
                        >
                            <ArrowLeft size={15} /> Back
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={next}
                        disabled={step === 0 && !role}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5
              rounded-2xl text-sm font-black transition-all duration-200
              disabled:opacity-40"
                        style={{ background: "#1C352D", color: "#EBF4DD",
                            boxShadow: "0 4px 20px rgba(28,53,45,0.25)" }}
                    >
                        {loading ? (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                        stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                        ) : step === STEPS.length - 1 ? (
                            <>Create my account <Check size={15} /></>
                        ) : (
                            <>Continue <ArrowRight size={15} /></>
                        )}
                    </motion.button>
                </motion.div>

                <p className="mt-5 text-sm" style={{ color: "#90AB8B" }}>
                    Already have an account?{" "}
                    <Link to="/login" className="font-black" style={{ color: "#1C352D" }}>
                        Sign in →
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default SignupPage