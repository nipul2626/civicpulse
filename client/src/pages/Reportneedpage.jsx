import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Phone, AlertTriangle, Check, ChevronRight, Zap, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const NEED_TYPES = [
    { key:"Food",      emoji:"🍱", desc:"Food, meals, ration" },
    { key:"Medical",   emoji:"❤️", desc:"Doctor, medicine, first aid" },
    { key:"Shelter",   emoji:"🏠", desc:"Temporary housing, tarpaulin" },
    { key:"Water",     emoji:"💧", desc:"Drinking water, sanitation" },
    { key:"Education", emoji:"📚", desc:"Books, tuition, school supplies" },
    { key:"Other",     emoji:"🤝", desc:"Something else" },
]

const URGENCY = [
    { key:"Critical", label:"Critical – Life threatening", color:"#E05A3A" },
    { key:"High",     label:"High – Needed today",          color:"#E8A838" },
    { key:"Medium",   label:"Medium – Within 2-3 days",     color:"#4A9FD4" },
    { key:"Low",      label:"Low – Can wait a week",        color:"#5A7863" },
]

export default function ReportNeedPage() {
    const navigate = useNavigate()
    const [step, setStep]   = useState(0)
    const [form, setForm]   = useState({
        type:"", urgency:"", location:"", landmark:"",
        description:"", people:1, phone:"", name:"",
    })
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading]     = useState(false)
    const [refId, setRefId]         = useState("")

    const s = k => v => setForm(p => ({...p, [k]: v}))
    const ev = k => e => setForm(p => ({...p, [k]: e.target.value}))

    const canNext = () => {
        if (step === 0) return !!form.type
        if (step === 1) return !!form.urgency
        if (step === 2) return !!form.location
        return true
    }

    const submit = () => {
        setLoading(true)
        const id = "N-" + Math.floor(Math.random()*900+100)
        setTimeout(() => { setLoading(false); setRefId(id); setSubmitted(true) }, 2000)
    }

    const inputStyle = {
        width:"100%", padding:"12px 14px", borderRadius:12,
        border:"1.5px solid #d4e4cc", background:"#f8faf6",
        color:"#1C352D", fontSize:14, outline:"none",
        boxSizing:"border-box", fontFamily:"inherit",
    }

    const STEPS = ["Type","Urgency","Location","Details"]

    if (submitted) return (
        <div style={{ minHeight:"100vh", background:"#f0f4ec", display:"flex",
            alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                        style={{ background:"#fff", borderRadius:24, padding:36, maxWidth:420, width:"100%",
                            textAlign:"center", boxShadow:"0 20px 60px rgba(28,53,45,0.12)",
                            border:"1.5px solid rgba(90,120,99,0.2)" }}>
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                            transition={{ type:"spring", stiffness:200, delay:0.1 }}
                            style={{ width:72, height:72, borderRadius:22, background:"#1C352D",
                                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                    <Check size={32} color="#EBF4DD" />
                </motion.div>

                <h2 style={{ color:"#1C352D", fontWeight:800, fontSize:22, marginBottom:8 }}>
                    Need Reported! 🙏
                </h2>
                <p style={{ color:"#5A7863", fontSize:14, marginBottom:20, lineHeight:1.6 }}>
                    Your report has been received. Our AI is scoring urgency and matching a volunteer to you.
                </p>

                <div style={{ background:"#f8faf6", borderRadius:14, padding:16, marginBottom:20,
                    border:"1.5px solid #e8f0e0", textAlign:"left" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                        <span style={{ color:"#90AB8B", fontSize:12 }}>Reference ID</span>
                        <span style={{ color:"#1C352D", fontWeight:800, fontSize:14 }}>{refId}</span>
                    </div>
                    {[
                        ["Need Type",  form.type],
                        ["Urgency",    form.urgency],
                        ["Location",   form.location],
                        ["People",     `${form.people} person(s)`],
                    ].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between",
                            padding:"5px 0", borderTop:"1px solid #e8f0e0" }}>
                            <span style={{ color:"#90AB8B", fontSize:12 }}>{k}</span>
                            <span style={{ color:"#1C352D", fontWeight:600, fontSize:12 }}>{v}</span>
                        </div>
                    ))}
                </div>

                {/* AI score bar */}
                <div style={{ marginBottom:20, padding:"12px 14px", borderRadius:12,
                    background:"#fff3f0", border:"1px solid #fdd" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#E05A3A" }}>AI Urgency Score</span>
                        <span style={{ fontSize:14, fontWeight:800, color:"#E05A3A" }}>
              {form.urgency==="Critical"?94:form.urgency==="High"?76:form.urgency==="Medium"?55:35}
            </span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:"#fdd", overflow:"hidden" }}>
                        <motion.div initial={{ width:0 }}
                                    animate={{ width:`${form.urgency==="Critical"?94:form.urgency==="High"?76:form.urgency==="Medium"?55:35}%` }}
                                    transition={{ duration:1, delay:0.3 }}
                                    style={{ height:"100%", borderRadius:3, background:"#E05A3A" }} />
                    </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <div style={{ padding:"10px 14px", borderRadius:10, background:"#EBF4DD",
                        display:"flex", alignItems:"center", gap:8 }}>
                        <span>📱</span>
                        <p style={{ color:"#3B5C38", fontSize:12, fontWeight:600, margin:0 }}>
                            {form.phone ? `We'll SMS updates to ${form.phone}` : "Save your Reference ID: " + refId}
                        </p>
                    </div>
                    <button onClick={() => navigate("/")}
                            style={{ padding:"12px", borderRadius:12, background:"#1C352D",
                                color:"#EBF4DD", fontWeight:800, fontSize:13, border:"none", cursor:"pointer" }}>
                        Back to Home
                    </button>
                    <button onClick={() => { setSubmitted(false); setStep(0); setForm({type:"",urgency:"",location:"",landmark:"",description:"",people:1,phone:"",name:""}) }}
                            style={{ padding:"10px", borderRadius:12, background:"transparent",
                                color:"#90AB8B", fontWeight:600, fontSize:12, border:"1px solid #d4e4cc", cursor:"pointer" }}>
                        Report another need
                    </button>
                </div>
            </motion.div>
        </div>
    )

    return (
        <div style={{ minHeight:"100vh", background:"#f0f4ec", fontFamily:"'DM Sans',sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        input::placeholder, textarea::placeholder { color:#90AB8B; }
      `}</style>

            {/* Header */}
            <div style={{ background:"#1C352D", padding:"16px 20px",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                position:"sticky", top:0, zIndex:50 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:"#5A7863",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Zap size={14} color="#EBF4DD" />
                    </div>
                    <div>
                        <p style={{ color:"#EBF4DD", fontWeight:800, fontSize:14, margin:0 }}>CivicPulse</p>
                        <p style={{ color:"#90AB8B", fontSize:10, margin:0 }}>Report a Need</p>
                    </div>
                </div>
                <button onClick={() => navigate("/")}
                        style={{ background:"transparent", border:"none", color:"#90AB8B",
                            cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:12 }}>
                    <ArrowLeft size={14} /> Home
                </button>
            </div>

            <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px" }}>
                {/* Title */}
                <div style={{ marginBottom:24, textAlign:"center" }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px",
                        borderRadius:20, background:"#EBF4DD", marginBottom:10 }}>
                        <AlertTriangle size={11} color="#E05A3A" />
                        <span style={{ color:"#1C352D", fontSize:11, fontWeight:700 }}>No login needed · Takes 60 seconds</span>
                    </div>
                    <h1 style={{ color:"#1C352D", fontWeight:800, fontSize:24, marginBottom:6 }}>
                        What do you need help with?
                    </h1>
                    <p style={{ color:"#5A7863", fontSize:13, lineHeight:1.5 }}>
                        Tell us your situation. We'll match a volunteer to you as fast as possible.
                    </p>
                </div>

                {/* Progress */}
                <div style={{ display:"flex", gap:4, marginBottom:24 }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ flex:1 }}>
                            <div style={{ height:4, borderRadius:2,
                                background: i <= step ? "#1C352D" : "#d4e4cc",
                                transition:"background 0.3s" }} />
                            <p style={{ color: i<=step ? "#1C352D" : "#90AB8B", fontSize:9,
                                fontWeight:700, marginTop:4, textAlign:"center" }}>{s}</p>
                        </div>
                    ))}
                </div>

                {/* Form card */}
                <div style={{ background:"#fff", borderRadius:20, padding:24,
                    boxShadow:"0 8px 32px rgba(28,53,45,0.08)", border:"1.5px solid rgba(90,120,99,0.15)" }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={step}
                                    initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                                    exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>

                            {/* Step 0: Type */}
                            {step === 0 && (
                                <div>
                                    <p style={{ color:"#1C352D", fontWeight:800, fontSize:16, marginBottom:4 }}>
                                        What kind of help do you need?
                                    </p>
                                    <p style={{ color:"#90AB8B", fontSize:12, marginBottom:16 }}>Select one option</p>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                                        {NEED_TYPES.map(t => (
                                            <motion.button key={t.key} whileTap={{ scale:0.96 }}
                                                           onClick={() => s("type")(t.key)}
                                                           style={{ padding:"14px 10px", borderRadius:14, border:"1.5px solid",
                                                               borderColor: form.type===t.key ? "#1C352D" : "#d4e4cc",
                                                               background: form.type===t.key ? "#EBF4DD" : "#f8faf6",
                                                               cursor:"pointer", textAlign:"left",
                                                               boxShadow: form.type===t.key ? "0 4px 16px rgba(28,53,45,0.15)" : "none",
                                                               transition:"all 0.15s" }}>
                                                <span style={{ fontSize:24, display:"block", marginBottom:4 }}>{t.emoji}</span>
                                                <p style={{ color:"#1C352D", fontWeight:800, fontSize:13, margin:0 }}>{t.key}</p>
                                                <p style={{ color:"#90AB8B", fontSize:10, margin:0 }}>{t.desc}</p>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Urgency */}
                            {step === 1 && (
                                <div>
                                    <p style={{ color:"#1C352D", fontWeight:800, fontSize:16, marginBottom:4 }}>
                                        How urgent is this?
                                    </p>
                                    <p style={{ color:"#90AB8B", fontSize:12, marginBottom:16 }}>This helps us prioritize</p>
                                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                        {URGENCY.map(u => (
                                            <motion.button key={u.key} whileTap={{ scale:0.98 }}
                                                           onClick={() => s("urgency")(u.key)}
                                                           style={{ padding:"14px 16px", borderRadius:12, border:"1.5px solid",
                                                               borderColor: form.urgency===u.key ? u.color : "#d4e4cc",
                                                               background: form.urgency===u.key ? `${u.color}15` : "#f8faf6",
                                                               cursor:"pointer", display:"flex", alignItems:"center",
                                                               justifyContent:"space-between", transition:"all 0.15s" }}>
                                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                                    <div style={{ width:10, height:10, borderRadius:"50%", background:u.color, flexShrink:0 }} />
                                                    <span style={{ color:"#1C352D", fontWeight:700, fontSize:13 }}>{u.label}</span>
                                                </div>
                                                {form.urgency===u.key && <Check size={14} color={u.color} />}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Location */}
                            {step === 2 && (
                                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                    <p style={{ color:"#1C352D", fontWeight:800, fontSize:16, marginBottom:0 }}>
                                        Where are you?
                                    </p>
                                    <div>
                                        <label style={{ color:"#5A7863", fontSize:12, fontWeight:700,
                                            display:"block", marginBottom:6 }}>Area / Locality *</label>
                                        <div style={{ position:"relative" }}>
                                            <MapPin size={14} style={{ position:"absolute", left:12, top:"50%",
                                                transform:"translateY(-50%)", color:"#90AB8B" }} />
                                            <input value={form.location} onChange={ev("location")}
                                                   placeholder="e.g. Dharavi, Zone B, Bandra"
                                                   style={{ ...inputStyle, paddingLeft:34 }}
                                                   onFocus={e => e.target.style.borderColor="#1C352D"}
                                                   onBlur={e => e.target.style.borderColor="#d4e4cc"} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ color:"#5A7863", fontSize:12, fontWeight:700,
                                            display:"block", marginBottom:6 }}>Nearby landmark</label>
                                        <input value={form.landmark} onChange={ev("landmark")}
                                               placeholder="Near school, temple, bus stop..."
                                               style={inputStyle}
                                               onFocus={e => e.target.style.borderColor="#1C352D"}
                                               onBlur={e => e.target.style.borderColor="#d4e4cc"} />
                                    </div>
                                    <div>
                                        <label style={{ color:"#5A7863", fontSize:12, fontWeight:700,
                                            display:"block", marginBottom:6 }}>Number of people affected</label>
                                        <div style={{ display:"flex", gap:8 }}>
                                            {[1,2,5,10,"10+"].map(n => (
                                                <motion.button key={n} whileTap={{ scale:0.94 }}
                                                               onClick={() => s("people")(n)}
                                                               style={{ flex:1, padding:"10px 4px", borderRadius:10, border:"1.5px solid",
                                                                   borderColor: form.people===n ? "#1C352D" : "#d4e4cc",
                                                                   background: form.people===n ? "#EBF4DD" : "#f8faf6",
                                                                   color:"#1C352D", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                                                    {n}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Details */}
                            {step === 3 && (
                                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                    <p style={{ color:"#1C352D", fontWeight:800, fontSize:16, marginBottom:0 }}>
                                        A few more details
                                    </p>
                                    <div>
                                        <label style={{ color:"#5A7863", fontSize:12, fontWeight:700,
                                            display:"block", marginBottom:6 }}>Describe the situation</label>
                                        <textarea value={form.description} onChange={ev("description")}
                                                  placeholder="Tell us more about what's happening and what is specifically needed..."
                                                  rows={3} style={{ ...inputStyle, resize:"none", lineHeight:1.5 }}
                                                  onFocus={e => e.target.style.borderColor="#1C352D"}
                                                  onBlur={e => e.target.style.borderColor="#d4e4cc"} />
                                    </div>
                                    <div>
                                        <label style={{ color:"#5A7863", fontSize:12, fontWeight:700,
                                            display:"block", marginBottom:6 }}>Your name (optional)</label>
                                        <input value={form.name} onChange={ev("name")} placeholder="So volunteers can reach you"
                                               style={inputStyle}
                                               onFocus={e => e.target.style.borderColor="#1C352D"}
                                               onBlur={e => e.target.style.borderColor="#d4e4cc"} />
                                    </div>
                                    <div>
                                        <label style={{ color:"#5A7863", fontSize:12, fontWeight:700,
                                            display:"block", marginBottom:6 }}>Phone number (optional)</label>
                                        <div style={{ position:"relative" }}>
                                            <Phone size={14} style={{ position:"absolute", left:12, top:"50%",
                                                transform:"translateY(-50%)", color:"#90AB8B" }} />
                                            <input value={form.phone} onChange={ev("phone")} type="tel"
                                                   placeholder="+91 98765 XXXXX"
                                                   style={{ ...inputStyle, paddingLeft:34 }}
                                                   onFocus={e => e.target.style.borderColor="#1C352D"}
                                                   onBlur={e => e.target.style.borderColor="#d4e4cc"} />
                                        </div>
                                    </div>
                                    {/* Summary */}
                                    <div style={{ padding:"12px 14px", borderRadius:12, background:"#f0f4ec",
                                        border:"1px solid #d4e4cc" }}>
                                        <p style={{ color:"#5A7863", fontSize:11, fontWeight:700, margin:"0 0 6px" }}>Summary</p>
                                        {[
                                            ["Type", form.type], ["Urgency", form.urgency],
                                            ["Location", form.location], ["People", `${form.people}`],
                                        ].map(([k,v]) => (
                                            <div key={k} style={{ display:"flex", justifyContent:"space-between",
                                                fontSize:12, padding:"2px 0" }}>
                                                <span style={{ color:"#90AB8B" }}>{k}</span>
                                                <span style={{ color:"#1C352D", fontWeight:700 }}>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Nav buttons */}
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                    {step > 0 && (
                        <button onClick={() => setStep(s=>s-1)}
                                style={{ padding:"13px 20px", borderRadius:14, border:"1.5px solid #d4e4cc",
                                    background:"#fff", color:"#3B4953", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                            Back
                        </button>
                    )}
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                                   onClick={step < STEPS.length-1 ? () => setStep(s=>s+1) : submit}
                                   disabled={!canNext() || loading}
                                   style={{ flex:1, padding:"14px", borderRadius:14,
                                       background: canNext() ? "#1C352D" : "#d4e4cc",
                                       color: canNext() ? "#EBF4DD" : "#90AB8B",
                                       fontWeight:800, fontSize:14, border:"none",
                                       cursor: canNext() ? "pointer" : "not-allowed",
                                       display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                                       boxShadow: canNext() ? "0 4px 20px rgba(28,53,45,0.25)" : "none",
                                       transition:"all 0.2s" }}>
                        {loading
                            ? <svg style={{ animation:"spin 1s linear infinite" }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                                <path style={{ opacity:0.75 }} fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                            : step < STEPS.length-1
                                ? <>{STEPS[step+1]} <ChevronRight size={16}/></>
                                : <>Submit Report <Check size={15}/></>}
                    </motion.button>
                </div>

                <p style={{ textAlign:"center", color:"#90AB8B", fontSize:11, marginTop:12 }}>
                    🔒 Anonymous · No account needed · Your data stays private
                </p>
            </div>
        </div>
    )
}