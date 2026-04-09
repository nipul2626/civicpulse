import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet"
import { motion, AnimatePresence } from "framer-motion"
import L from "leaflet"
import {
    Search, Plus, X, Filter, ChevronRight,
    Users, AlertTriangle, CheckCircle, Clock,
    MapPin, Zap, Activity, DropletIcon,
    BookOpen, Home, Utensils, Heart,
    ArrowRight, RefreshCw
} from "lucide-react"
import "leaflet/dist/leaflet.css"
import { MOCK_NEEDS, MOCK_VOLUNTEERS, MOCK_STATS } from "../utils/mockData"

// ── helpers ───────────────────────────────────────────────────────
const U_COLOR  = { 5:"#dc2626", 4:"#ea580c", 3:"#d97706", 2:"#65a30d", 1:"#16a34a" }
const U_LABEL  = { 5:"Critical", 4:"High", 3:"Medium", 2:"Low", 1:"Minimal" }
const CAT_ICON = {
    food:      <Utensils   size={11}/>,
    medical:   <Heart      size={11}/>,
    shelter:   <Home       size={11}/>,
    water:     <DropletIcon size={11}/>,
    education: <BookOpen   size={11}/>,
}
const CAT_COLOR = {
    food:"#d97706", medical:"#dc2626",
    shelter:"#7c3aed", water:"#2563eb", education:"#059669",
}
const STATUS_CFG = {
    unassigned: { label:"Unassigned",  bg:"#fef2f2", text:"#dc2626", dot:"#dc2626" },
    assigned:   { label:"Assigned",    bg:"#fffbeb", text:"#d97706", dot:"#d97706" },
    inprogress: { label:"In Progress", bg:"#eff6ff", text:"#2563eb", dot:"#2563eb" },
    completed:  { label:"Completed",   bg:"#f0fdf4", text:"#16a34a", dot:"#16a34a" },
}

// ── custom map pin using divIcon ───────────────────────────────────
const makePinIcon = (need) => {
    const color   = U_COLOR[need.urgency]
    const pulse   = need.urgency === 5
    const size    = need.urgency === 5 ? 36 : need.urgency === 4 ? 30 : 24
    const catColor = CAT_COLOR[need.category]

    const html = `
    <div style="position:relative;width:${size}px;height:${size}px">
      ${pulse ? `
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.25;
          animation:civicPulse 1.8s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:4px;border-radius:50%;
          background:${color};opacity:0.15;
          animation:civicPulse 1.8s ease-out infinite 0.4s;
        "></div>
      ` : ""}
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:white;
        border:3px solid ${color};
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 12px ${color}55;
        font-size:11px;
      ">
        <div style="
          width:${size * 0.42}px;height:${size * 0.42}px;
          border-radius:50%;background:${catColor};
          display:flex;align-items:center;justify-content:center;
        ">
        </div>
      </div>
    </div>
  `
    return L.divIcon({
        html,
        className: "",
        iconSize:  [size, size],
        iconAnchor:[size/2, size/2],
    })
}

// ── inject pulse keyframes once ───────────────────────────────────
const injectStyles = () => {
    if (document.getElementById("civic-map-styles")) return
    const s = document.createElement("style")
    s.id = "civic-map-styles"
    s.textContent = `
    @keyframes civicPulse {
      0%   { transform:scale(1);   opacity:.35 }
      70%  { transform:scale(2.2); opacity:0   }
      100% { transform:scale(2.2); opacity:0   }
    }
    .leaflet-popup-content-wrapper {
      border-radius:16px!important;
      padding:0!important;
      border:1.5px solid rgba(90,120,99,.2)!important;
      box-shadow:0 20px 60px rgba(28,53,45,.15)!important;
      overflow:hidden!important;
    }
    .leaflet-popup-content { margin:0!important; }
    .leaflet-popup-tip-container { display:none!important; }
    .leaflet-container { font-family:'Inter',sans-serif!important; }
  `
    document.head.appendChild(s)
}

// ── FlyTo helper ──────────────────────────────────────────────────
const FlyTo = ({ coords }) => {
    const map = useMap()
    useEffect(() => {
        if (coords) map.flyTo(coords, 14, { duration: 1.4, easeLinearity: 0.25 })
    }, [coords])
    return null
}

// ── Floating glass card wrapper ───────────────────────────────────
const Glass = ({ children, className = "", style = {} }) => (
    <div
        className={className}
        style={{
            background:    "rgba(255,255,255,0.92)",
            backdropFilter:"blur(24px)",
            WebkitBackdropFilter:"blur(24px)",
            border:        "1.5px solid rgba(90,120,99,0.18)",
            borderRadius:  20,
            boxShadow:     "0 8px 32px rgba(28,53,45,0.12)",
            ...style,
        }}
    >
        {children}
    </div>
)

// ── Stat pill ─────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, value, label, color, delay }) => (
    <motion.div
        initial={{ opacity:0, y:-12 }}
        animate={{ opacity:1, y:0   }}
        transition={{ delay, duration:.4 }}
        style={{
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,0.92)",
            backdropFilter:"blur(20px)",
            border:"1.5px solid rgba(90,120,99,0.15)",
            borderRadius:14,
            padding:"8px 14px",
            boxShadow:"0 4px 16px rgba(28,53,45,0.08)",
        }}
    >
        <div style={{
            width:28,height:28,borderRadius:8,
            background:color+"18",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
        }}>
            <Icon size={13} style={{ color }} />
        </div>
        <div>
            <p style={{ fontSize:15, fontWeight:900, color:"#1C352D",
                lineHeight:1, margin:0 }}>{value}</p>
            <p style={{ fontSize:10, color:"#90AB8B", margin:0,
                fontWeight:600, marginTop:1 }}>{label}</p>
        </div>
    </motion.div>
)

// ── Need card ─────────────────────────────────────────────────────
const NeedCard = ({ need, active, onClick }) => {
    const s = STATUS_CFG[need.status]
    return (
        <motion.div
            whileHover={{ x:2 }}
            whileTap={{ scale:.98 }}
            onClick={onClick}
            style={{
                borderRadius:14,
                padding:"12px 14px",
                cursor:"pointer",
                border: active
                    ? "2px solid #5A7863"
                    : "1.5px solid rgba(90,120,99,0.12)",
                background: active ? "#EBF4DD" : "rgba(255,255,255,0.9)",
                boxShadow: active ? "0 4px 16px rgba(90,120,99,0.2)" : "none",
                marginBottom:8,
                transition:"all .2s",
            }}
        >
            {/* top row */}
            <div style={{ display:"flex", alignItems:"flex-start",
                justifyContent:"space-between", gap:8, marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
                    <div style={{
                        width:22,height:22,borderRadius:7,flexShrink:0,
                        background: CAT_COLOR[need.category]+"18",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        color: CAT_COLOR[need.category],
                    }}>
                        {CAT_ICON[need.category]}
                    </div>
                    <p style={{ fontSize:12, fontWeight:800, color:"#1C352D",
                        lineHeight:1.3, margin:0 }}>
                        {need.title}
                    </p>
                </div>
                {/* urgency bar */}
                <div style={{ display:"flex", gap:2, flexShrink:0 }}>
                    {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                            width:4,height:14,borderRadius:2,
                            background: i <= need.urgency
                                ? U_COLOR[need.urgency]
                                : "rgba(0,0,0,0.07)",
                        }}/>
                    ))}
                </div>
            </div>

            {/* meta row */}
            <div style={{ display:"flex", alignItems:"center",
                gap:8, flexWrap:"wrap" }}>
        <span style={{ fontSize:10, color:"#90AB8B",
            fontWeight:600, display:"flex",
            alignItems:"center", gap:3 }}>
          <MapPin size={9}/> {need.zone}
        </span>
                <span style={{ fontSize:10, color:"#90AB8B",
                    fontWeight:600, display:"flex",
                    alignItems:"center", gap:3 }}>
          <Users size={9}/> {need.people}
        </span>
                <span style={{
                    fontSize:10, fontWeight:700,
                    padding:"2px 7px", borderRadius:20,
                    background:s.bg, color:s.text,
                    display:"flex", alignItems:"center", gap:3,
                }}>
          <span style={{ width:5,height:5,borderRadius:"50%",
              background:s.dot, display:"inline-block"}}/>
                    {s.label}
        </span>
                <span style={{ fontSize:10, color:"#b0c4b8",
                    fontWeight:500, marginLeft:"auto" }}>
          {need.time}
        </span>
            </div>
        </motion.div>
    )
}

// ── Volunteer mini card ───────────────────────────────────────────
const VolCard = ({ vol, onAssign }) => (
    <motion.div
        whileHover={{ y:-1 }}
        style={{
            borderRadius:12,
            padding:"10px 12px",
            background:"rgba(255,255,255,0.9)",
            border:"1.5px solid rgba(90,120,99,0.12)",
            marginBottom:6,
            display:"flex",
            alignItems:"center",
            gap:10,
        }}
    >
        {/* avatar */}
        <div style={{
            width:34,height:34,borderRadius:10,flexShrink:0,
            background: vol.available ? "#EBF4DD" : "#f1f0ee",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:900,fontSize:11,
            color: vol.available ? "#3B4953" : "#90AB8B",
            border: vol.available
                ? "2px solid #5A7863"
                : "2px solid rgba(90,120,99,0.15)",
        }}>
            {vol.name.split(" ").map(n=>n[0]).join("")}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12,fontWeight:800,color:"#1C352D",
                margin:0,lineHeight:1.2,
                overflow:"hidden",textOverflow:"ellipsis",
                whiteSpace:"nowrap" }}>
                {vol.name}
            </p>
            <p style={{ fontSize:10,color:"#90AB8B",margin:0,marginTop:1 }}>
                {vol.skills.slice(0,2).join(" · ")}
            </p>
        </div>
        <div style={{ display:"flex",flexDirection:"column",
            alignItems:"flex-end",gap:3 }}>
      <span style={{
          fontSize:10,fontWeight:700,
          padding:"1px 7px",borderRadius:20,
          background: vol.available ? "#f0fdf4" : "#f9fafb",
          color: vol.available ? "#16a34a" : "#90AB8B",
      }}>
        {vol.available ? "Free" : "Busy"}
      </span>
            <span style={{ fontSize:10,color:"#b0c4b8" }}>
        {vol.reliability}% reliable
      </span>
        </div>
        {onAssign && (
            <motion.button
                whileHover={{ scale:1.05 }}
                whileTap={{ scale:.95 }}
                onClick={() => onAssign(vol)}
                style={{
                    width:28,height:28,borderRadius:9,flexShrink:0,
                    background:"#1C352D",border:"none",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                }}
            >
                <ArrowRight size={12} color="#EBF4DD"/>
            </motion.button>
        )}
    </motion.div>
)

// ── Submit modal ──────────────────────────────────────────────────
const CATEGORIES_LIST = ["food","medical","shelter","water","education"]

const SubmitModal = ({ onClose, onSubmit }) => {
    const [form, setForm] = useState({
        title:"", category:"food", urgency:3, people:"", zone:"", desc:""
    })
    const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

    return (
        <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            style={{
                position:"absolute",inset:0,zIndex:2000,
                background:"rgba(28,53,45,0.55)",
                backdropFilter:"blur(6px)",
                display:"flex",alignItems:"center",justifyContent:"center",
                padding:20,
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale:.9, y:30, opacity:0 }}
                animate={{ scale:1,  y:0,  opacity:1 }}
                exit={{    scale:.9, y:30, opacity:0 }}
                transition={{ type:"spring",stiffness:350,damping:28 }}
                onClick={e=>e.stopPropagation()}
                style={{
                    width:"100%",maxWidth:520,
                    background:"#fff",
                    borderRadius:24,
                    padding:28,
                    boxShadow:"0 32px 80px rgba(28,53,45,0.25)",
                    border:"1.5px solid rgba(90,120,99,0.2)",
                }}
            >
                {/* header */}
                <div style={{ display:"flex",alignItems:"center",
                    justifyContent:"space-between",marginBottom:20 }}>
                    <div>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <div style={{
                                width:32,height:32,borderRadius:10,
                                background:"#1C352D",
                                display:"flex",alignItems:"center",justifyContent:"center",
                            }}>
                                <Plus size={16} color="#EBF4DD"/>
                            </div>
                            <p style={{ fontSize:17,fontWeight:900,
                                color:"#1C352D",margin:0 }}>
                                Report a need
                            </p>
                        </div>
                        <p style={{ fontSize:12,color:"#90AB8B",
                            margin:"4px 0 0 40px" }}>
                            AI will score and categorize automatically
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        width:32,height:32,borderRadius:10,border:"none",
                        background:"#f8faf6",cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                        <X size={15} color="#90AB8B"/>
                    </button>
                </div>

                {/* fields */}
                <div style={{ display:"grid",gap:14 }}>
                    {/* title */}
                    <div>
                        <label style={{ fontSize:11,fontWeight:700,
                            color:"#3B4953",display:"block",
                            marginBottom:5,textTransform:"uppercase",
                            letterSpacing:".5px" }}>
                            Title
                        </label>
                        <input
                            value={form.title}
                            onChange={set("title")}
                            placeholder="Describe the need in one line..."
                            style={{
                                width:"100%",padding:"10px 14px",
                                borderRadius:12,fontSize:13,
                                border:"1.5px solid #e8f0e0",
                                background:"#f8faf6",color:"#1C352D",
                                outline:"none",fontFamily:"inherit",
                            }}
                        />
                    </div>

                    {/* category + urgency row */}
                    <div style={{ display:"grid",
                        gridTemplateColumns:"1fr 1fr",gap:12 }}>
                        <div>
                            <label style={{ fontSize:11,fontWeight:700,
                                color:"#3B4953",display:"block",
                                marginBottom:5,textTransform:"uppercase",
                                letterSpacing:".5px" }}>
                                Category
                            </label>
                            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                                {CATEGORIES_LIST.map(c=>(
                                    <button key={c} onClick={()=>setForm(p=>({...p,category:c}))}
                                            style={{
                                                padding:"5px 10px",borderRadius:9,fontSize:11,
                                                fontWeight:700,cursor:"pointer",border:"1.5px solid",
                                                background: form.category===c
                                                    ? CAT_COLOR[c] : "#f8faf6",
                                                borderColor: form.category===c
                                                    ? CAT_COLOR[c] : "#e8f0e0",
                                                color: form.category===c ? "#fff" : "#5A7863",
                                                fontFamily:"inherit",
                                            }}
                                    >{c}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize:11,fontWeight:700,
                                color:"#3B4953",display:"block",
                                marginBottom:5,textTransform:"uppercase",
                                letterSpacing:".5px" }}>
                                Urgency — {U_LABEL[form.urgency]}
                            </label>
                            <div style={{ display:"flex",gap:5,alignItems:"center" }}>
                                {[1,2,3,4,5].map(u=>(
                                    <button key={u}
                                            onClick={()=>setForm(p=>({...p,urgency:u}))}
                                            style={{
                                                width:32,height:32,borderRadius:9,
                                                border:"1.5px solid",cursor:"pointer",
                                                fontWeight:900,fontSize:12,
                                                fontFamily:"inherit",
                                                background: form.urgency===u
                                                    ? U_COLOR[u] : "#f8faf6",
                                                borderColor: form.urgency===u
                                                    ? U_COLOR[u] : "#e8f0e0",
                                                color: form.urgency===u ? "#fff" : "#90AB8B",
                                            }}
                                    >{u}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* people + zone */}
                    <div style={{ display:"grid",
                        gridTemplateColumns:"1fr 1fr",gap:12 }}>
                        {[
                            ["people","People affected","e.g. 80"],
                            ["zone",  "Zone / area",    "e.g. Dharavi"],
                        ].map(([k,lbl,ph])=>(
                            <div key={k}>
                                <label style={{ fontSize:11,fontWeight:700,
                                    color:"#3B4953",display:"block",
                                    marginBottom:5,textTransform:"uppercase",
                                    letterSpacing:".5px" }}>
                                    {lbl}
                                </label>
                                <input value={form[k]} onChange={set(k)}
                                       placeholder={ph}
                                       style={{
                                           width:"100%",padding:"10px 14px",
                                           borderRadius:12,fontSize:13,
                                           border:"1.5px solid #e8f0e0",
                                           background:"#f8faf6",color:"#1C352D",
                                           outline:"none",fontFamily:"inherit",
                                       }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* description */}
                    <div>
                        <label style={{ fontSize:11,fontWeight:700,
                            color:"#3B4953",display:"block",
                            marginBottom:5,textTransform:"uppercase",
                            letterSpacing:".5px" }}>
                            Description
                        </label>
                        <textarea
                            value={form.desc}
                            onChange={set("desc")}
                            rows={3}
                            placeholder="Additional context for the AI scoring engine..."
                            style={{
                                width:"100%",padding:"10px 14px",
                                borderRadius:12,fontSize:13,resize:"none",
                                border:"1.5px solid #e8f0e0",
                                background:"#f8faf6",color:"#1C352D",
                                outline:"none",fontFamily:"inherit",
                            }}
                        />
                    </div>

                    {/* submit */}
                    <motion.button
                        whileHover={{ scale:1.02 }}
                        whileTap={{ scale:.97 }}
                        onClick={()=>{ onSubmit(form); onClose() }}
                        style={{
                            width:"100%",padding:"13px",
                            borderRadius:14,border:"none",
                            background:"#1C352D",color:"#EBF4DD",
                            fontSize:14,fontWeight:900,cursor:"pointer",
                            display:"flex",alignItems:"center",
                            justifyContent:"center",gap:8,
                            fontFamily:"inherit",
                            boxShadow:"0 4px 20px rgba(28,53,45,0.3)",
                        }}
                    >
                        <Zap size={15}/> Submit to AI scoring engine
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
const HeatmapPage = () => {
    const [needs,         setNeeds]         = useState(MOCK_NEEDS)
    const [search,        setSearch]        = useState("")
    const [catFilter,     setCatFilter]     = useState("all")
    const [statusFilter,  setStatusFilter]  = useState("all")
    const [selectedNeed,  setSelectedNeed]  = useState(null)
    const [showSidebar,   setShowSidebar]   = useState(true)
    const [showFilters,   setShowFilters]   = useState(false)
    const [showModal,     setShowModal]     = useState(false)
    const [showVolPanel,  setShowVolPanel]  = useState(false)
    const [flyCoords,     setFlyCoords]     = useState(null)
    const [assignedMsg,   setAssignedMsg]   = useState("")

    useEffect(() => { injectStyles() }, [])

    const filtered = needs.filter(n => {
        const q = search.toLowerCase()
        const matchSearch = !q ||
            n.title.toLowerCase().includes(q) ||
            n.zone.toLowerCase().includes(q)
        const matchCat    = catFilter    === "all" || n.category === catFilter
        const matchStatus = statusFilter === "all" || n.status   === statusFilter
        return matchSearch && matchCat && matchStatus
    })

    const critical = needs.filter(n => n.urgency === 5).length

    const handleNeedClick = (need) => {
        setSelectedNeed(need)
        setFlyCoords([need.lat, need.lng])
        setShowVolPanel(false)
    }

    const handleAssign = (vol) => {
        setAssignedMsg(`${vol.name} assigned to "${selectedNeed?.title}"`)
        setShowVolPanel(false)
        setTimeout(() => setAssignedMsg(""), 3000)
    }

    const handleSubmitNeed = (form) => {
        const newNeed = {
            ...form,
            id:       needs.length + 1,
            lat:      19.076 + (Math.random() - 0.5) * 0.04,
            lng:      72.877 + (Math.random() - 0.5) * 0.04,
            people:   parseInt(form.people) || 50,
            status:   "unassigned",
            reporter: "You",
            time:     "just now",
        }
        setNeeds(p => [newNeed, ...p])
    }

    return (
        <div style={{ position:"fixed", inset:0, zIndex:0 }}>

            {/* ── MAP ───────────────────────────────────────────────── */}
            <MapContainer
                center={[19.076, 72.877]}
                zoom={12}
                style={{ width:"100%", height:"100%", zIndex:1 }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                    attribution="© OpenStreetMap © CartoDB"
                />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                    attribution=""
                    pane="shadowPane"
                />

                {flyCoords && <FlyTo coords={flyCoords} />}

                {filtered.map(need => (
                    <Marker
                        key={need.id}
                        position={[need.lat, need.lng]}
                        icon={makePinIcon(need)}
                        eventHandlers={{ click: () => handleNeedClick(need) }}
                    >
                        <Popup maxWidth={220} minWidth={200}>
                            <div style={{ padding:"14px 16px", fontFamily:"Inter,sans-serif" }}>
                                <div style={{ display:"flex",alignItems:"center",
                                    gap:6,marginBottom:8 }}>
                                    <div style={{
                                        width:22,height:22,borderRadius:7,
                                        background:CAT_COLOR[need.category]+"18",
                                        display:"flex",alignItems:"center",
                                        justifyContent:"center",
                                        color:CAT_COLOR[need.category],
                                    }}>
                                        {CAT_ICON[need.category]}
                                    </div>
                                    <p style={{ fontSize:13,fontWeight:900,
                                        color:"#1C352D",margin:0 }}>
                                        {need.title}
                                    </p>
                                </div>
                                <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:10 }}>
                  <span style={{
                      fontSize:10,fontWeight:700,padding:"2px 8px",
                      borderRadius:20,
                      background:U_COLOR[need.urgency]+"18",
                      color:U_COLOR[need.urgency],
                  }}>
                    {U_LABEL[need.urgency]} urgency
                  </span>
                                    <span style={{
                                        fontSize:10,fontWeight:700,padding:"2px 8px",
                                        borderRadius:20,
                                        background:STATUS_CFG[need.status].bg,
                                        color:STATUS_CFG[need.status].text,
                                    }}>
                    {STATUS_CFG[need.status].label}
                  </span>
                                </div>
                                <div style={{ fontSize:11,color:"#90AB8B",
                                    marginBottom:10,lineHeight:1.5 }}>
                                    📍 {need.zone} &nbsp;·&nbsp; 👥 {need.people} affected
                                </div>
                                <button
                                    onClick={() => handleNeedClick(need)}
                                    style={{
                                        width:"100%",padding:"8px 12px",
                                        borderRadius:10,border:"none",
                                        background:"#1C352D",color:"#EBF4DD",
                                        fontSize:12,fontWeight:800,cursor:"pointer",
                                        fontFamily:"inherit",display:"flex",
                                        alignItems:"center",justifyContent:"center",gap:6,
                                    }}
                                >
                                    <Users size={11}/> Find volunteers
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* ── FLOATING UI LAYER ────────────────────────────────── */}
            <div style={{ position:"absolute",inset:0,
                zIndex:1000,pointerEvents:"none" }}>

                {/* ── TOP BAR ─────────────────────────────────────────── */}
                <div style={{
                    position:"absolute",top:16,left:16,right:16,
                    display:"flex",alignItems:"flex-start",
                    justifyContent:"space-between",gap:12,
                    pointerEvents:"auto",
                }}>
                    {/* Left — logo + stats */}
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                        {/* Logo pill */}
                        <motion.div
                            initial={{ opacity:0,x:-20 }}
                            animate={{ opacity:1,x:0 }}
                            style={{
                                display:"flex",alignItems:"center",gap:8,
                                background:"#1C352D",
                                borderRadius:14,padding:"8px 14px",
                                boxShadow:"0 4px 20px rgba(28,53,45,0.3)",
                            }}
                        >
                            <div style={{
                                width:24,height:24,borderRadius:7,
                                background:"#5A7863",
                                display:"flex",alignItems:"center",justifyContent:"center",
                            }}>
                                <Zap size={13} color="#EBF4DD"/>
                            </div>
                            <span style={{ fontSize:13,fontWeight:900,color:"#EBF4DD" }}>
                CivicPulse
              </span>
                            <div style={{
                                width:6,height:6,borderRadius:"50%",
                                background:"#4ade80",
                                boxShadow:"0 0 8px #4ade8099",
                                animation:"civicPulse 2s ease-out infinite",
                            }}/>
                        </motion.div>

                        {/* Stats row */}
                        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                            {[
                                { icon:AlertTriangle, value:critical,
                                    label:"Critical",         color:"#dc2626", delay:.1 },
                                { icon:Activity,      value:filtered.length,
                                    label:"Showing",          color:"#5A7863", delay:.15 },
                                { icon:Users,         value:MOCK_STATS.volunteersActive,
                                    label:"Volunteers active",color:"#2563eb", delay:.2 },
                                { icon:CheckCircle,   value:MOCK_STATS.resolvedToday,
                                    label:"Resolved today",   color:"#16a34a", delay:.25 },
                            ].map((s,i) => <StatPill key={i} {...s}/>)}
                        </div>
                    </div>

                    {/* Right — search + controls */}
                    <div style={{ display:"flex",flexDirection:"column",
                        gap:8,alignItems:"flex-end" }}>
                        {/* Search */}
                        <Glass style={{ display:"flex",alignItems:"center",
                            gap:8,padding:"8px 14px",
                            borderRadius:14,minWidth:240 }}>
                            <Search size={14} style={{ color:"#90AB8B",flexShrink:0 }}/>
                            <input
                                value={search}
                                onChange={e=>setSearch(e.target.value)}
                                placeholder="Search zone or need..."
                                style={{
                                    border:"none",outline:"none",background:"transparent",
                                    fontSize:12,color:"#1C352D",fontFamily:"inherit",
                                    width:"100%","::placeholder":{ color:"#90AB8B" },
                                }}
                            />
                            {search && (
                                <button onClick={()=>setSearch("")}
                                        style={{ border:"none",background:"none",cursor:"pointer",
                                            padding:0,display:"flex" }}>
                                    <X size={12} style={{ color:"#90AB8B" }}/>
                                </button>
                            )}
                        </Glass>

                        {/* Buttons row */}
                        <div style={{ display:"flex",gap:6 }}>
                            {/* Filter */}
                            <motion.button
                                whileHover={{ scale:1.04 }}
                                whileTap={{ scale:.96 }}
                                onClick={()=>setShowFilters(p=>!p)}
                                style={{
                                    display:"flex",alignItems:"center",gap:6,
                                    padding:"8px 14px",borderRadius:12,
                                    border:"1.5px solid",cursor:"pointer",
                                    fontFamily:"inherit",fontSize:12,fontWeight:700,
                                    background: showFilters ? "#1C352D" : "rgba(255,255,255,0.92)",
                                    borderColor: showFilters ? "#1C352D" : "rgba(90,120,99,0.2)",
                                    color: showFilters ? "#EBF4DD" : "#3B4953",
                                    backdropFilter:"blur(20px)",
                                    boxShadow:"0 4px 16px rgba(28,53,45,0.1)",
                                }}
                            >
                                <Filter size={12}/> Filters
                                {(catFilter!=="all"||statusFilter!=="all") && (
                                    <span style={{
                                        width:16,height:16,borderRadius:"50%",
                                        background:"#dc2626",color:"#fff",
                                        fontSize:9,fontWeight:900,
                                        display:"flex",alignItems:"center",justifyContent:"center",
                                    }}>
                    {(catFilter!=="all"?1:0)+(statusFilter!=="all"?1:0)}
                  </span>
                                )}
                            </motion.button>

                            {/* Toggle list */}
                            <motion.button
                                whileHover={{ scale:1.04 }}
                                whileTap={{ scale:.96 }}
                                onClick={()=>setShowSidebar(p=>!p)}
                                style={{
                                    display:"flex",alignItems:"center",gap:6,
                                    padding:"8px 14px",borderRadius:12,
                                    border:"1.5px solid rgba(90,120,99,0.2)",
                                    cursor:"pointer",fontFamily:"inherit",
                                    fontSize:12,fontWeight:700,
                                    background:"rgba(255,255,255,0.92)",
                                    color:"#3B4953",backdropFilter:"blur(20px)",
                                    boxShadow:"0 4px 16px rgba(28,53,45,0.1)",
                                }}
                            >
                                {showSidebar ? "Hide list" : "Show list"}
                            </motion.button>

                            {/* Submit need */}
                            <motion.button
                                whileHover={{ scale:1.04 }}
                                whileTap={{ scale:.96 }}
                                onClick={()=>setShowModal(true)}
                                style={{
                                    display:"flex",alignItems:"center",gap:6,
                                    padding:"8px 16px",borderRadius:12,
                                    border:"none",cursor:"pointer",
                                    fontFamily:"inherit",fontSize:12,fontWeight:900,
                                    background:"#5A7863",color:"#EBF4DD",
                                    boxShadow:"0 4px 16px rgba(90,120,99,0.35)",
                                }}
                            >
                                <Plus size={13}/> Report need
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* ── FILTER DROPDOWN ─────────────────────────────────── */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity:0,y:-8,scale:.97 }}
                            animate={{ opacity:1,y:0, scale:1   }}
                            exit={{    opacity:0,y:-8,scale:.97  }}
                            style={{
                                position:"absolute",top:130,right:16,
                                width:280,zIndex:100,pointerEvents:"auto",
                                background:"rgba(255,255,255,0.97)",
                                backdropFilter:"blur(24px)",
                                borderRadius:18,
                                border:"1.5px solid rgba(90,120,99,0.18)",
                                boxShadow:"0 16px 48px rgba(28,53,45,0.15)",
                                padding:16,
                            }}
                        >
                            <div style={{ display:"flex",alignItems:"center",
                                justifyContent:"space-between",marginBottom:12 }}>
                                <p style={{ fontSize:13,fontWeight:900,
                                    color:"#1C352D",margin:0 }}>
                                    Filter needs
                                </p>
                                <button onClick={()=>setShowFilters(false)}
                                        style={{ border:"none",background:"none",cursor:"pointer" }}>
                                    <X size={14} style={{ color:"#90AB8B" }}/>
                                </button>
                            </div>

                            {/* Category */}
                            <p style={{ fontSize:10,fontWeight:700,color:"#90AB8B",
                                textTransform:"uppercase",letterSpacing:".5px",
                                marginBottom:6,margin:"0 0 6px" }}>
                                Category
                            </p>
                            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:14 }}>
                                {["all","food","medical","shelter","water","education"].map(c=>(
                                    <button key={c} onClick={()=>setCatFilter(c)}
                                            style={{
                                                padding:"5px 10px",borderRadius:9,
                                                fontSize:11,fontWeight:700,cursor:"pointer",
                                                border:"1.5px solid",fontFamily:"inherit",
                                                background: catFilter===c
                                                    ? (c==="all" ? "#1C352D" : CAT_COLOR[c])
                                                    : "#f8faf6",
                                                borderColor: catFilter===c
                                                    ? (c==="all" ? "#1C352D" : CAT_COLOR[c])
                                                    : "#e8f0e0",
                                                color: catFilter===c ? "#fff" : "#5A7863",
                                            }}
                                    >{c==="all"?"All":c}</button>
                                ))}
                            </div>

                            {/* Status */}
                            <p style={{ fontSize:10,fontWeight:700,color:"#90AB8B",
                                textTransform:"uppercase",letterSpacing:".5px",
                                margin:"0 0 6px" }}>
                                Status
                            </p>
                            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:14 }}>
                                {["all",...Object.keys(STATUS_CFG)].map(s=>(
                                    <button key={s} onClick={()=>setStatusFilter(s)}
                                            style={{
                                                padding:"5px 10px",borderRadius:9,
                                                fontSize:11,fontWeight:700,cursor:"pointer",
                                                border:"1.5px solid",fontFamily:"inherit",
                                                background: statusFilter===s ? "#1C352D" : "#f8faf6",
                                                borderColor:statusFilter===s ? "#1C352D" : "#e8f0e0",
                                                color: statusFilter===s ? "#EBF4DD" : "#5A7863",
                                            }}
                                    >{s==="all"?"All":STATUS_CFG[s].label}</button>
                                ))}
                            </div>

                            {/* Urgency legend */}
                            <p style={{ fontSize:10,fontWeight:700,color:"#90AB8B",
                                textTransform:"uppercase",letterSpacing:".5px",
                                margin:"0 0 6px" }}>
                                Urgency scale
                            </p>
                            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                                {[1,2,3,4,5].map(u=>(
                                    <div key={u} style={{
                                        display:"flex",flexDirection:"column",
                                        alignItems:"center",gap:3
                                    }}>
                                        <div style={{
                                            width:18,height:18,borderRadius:"50%",
                                            background:U_COLOR[u],
                                            border:`3px solid ${U_COLOR[u]}44`,
                                        }}/>
                                        <span style={{ fontSize:9,fontWeight:700,
                                            color:"#90AB8B" }}>
                      {u===1?"Low":u===3?"Med":u===5?"Crit":u}
                    </span>
                                    </div>
                                ))}
                            </div>

                            {/* Reset */}
                            {(catFilter!=="all"||statusFilter!=="all") && (
                                <button
                                    onClick={()=>{setCatFilter("all");setStatusFilter("all")}}
                                    style={{
                                        marginTop:12,width:"100%",padding:"8px",
                                        borderRadius:10,border:"1.5px solid #e8f0e0",
                                        background:"#f8faf6",color:"#dc2626",
                                        fontSize:11,fontWeight:700,cursor:"pointer",
                                        fontFamily:"inherit",
                                    }}
                                >
                                    Clear all filters
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── RIGHT SIDEBAR ────────────────────────────────────── */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            initial={{ opacity:0,x:340  }}
                            animate={{ opacity:1,x:0   }}
                            exit={{    opacity:0,x:340  }}
                            transition={{ type:"spring",stiffness:320,damping:32 }}
                            style={{
                                position:"absolute",top:0,right:0,bottom:0,
                                width:320,pointerEvents:"auto",
                                display:"flex",flexDirection:"column",
                                background:"rgba(245,247,242,0.97)",
                                backdropFilter:"blur(24px)",
                                borderLeft:"1.5px solid rgba(90,120,99,0.15)",
                            }}
                        >
                            {/* Sidebar header */}
                            <div style={{
                                padding:"16px 16px 12px",
                                borderBottom:"1.5px solid rgba(90,120,99,0.1)",
                                background:"rgba(255,255,255,0.7)",
                            }}>
                                <div style={{ display:"flex",alignItems:"center",
                                    justifyContent:"space-between",marginBottom:10 }}>
                                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                        <div style={{
                                            width:28,height:28,borderRadius:9,
                                            background:"#1C352D",
                                            display:"flex",alignItems:"center",justifyContent:"center",
                                        }}>
                                            <MapPin size={13} color="#EBF4DD"/>
                                        </div>
                                        <div>
                                            <p style={{ fontSize:13,fontWeight:900,
                                                color:"#1C352D",margin:0 }}>
                                                Live Needs
                                            </p>
                                            <p style={{ fontSize:10,color:"#90AB8B",margin:0 }}>
                                                {filtered.length} active · {critical} critical
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={()=>setShowSidebar(false)}
                                            style={{ border:"none",background:"#f0f4ec",
                                                width:26,height:26,borderRadius:8,
                                                cursor:"pointer",display:"flex",
                                                alignItems:"center",justifyContent:"center" }}>
                                        <X size={12} style={{ color:"#90AB8B" }}/>
                                    </button>
                                </div>

                                {/* tab switcher */}
                                <div style={{ display:"flex",gap:4 }}>
                                    {[
                                        { id:"needs", label:"Needs", count:filtered.length },
                                        { id:"vols",  label:"Volunteers",
                                            count:MOCK_VOLUNTEERS.filter(v=>v.available).length },
                                    ].map(t=>(
                                        <button
                                            key={t.id}
                                            onClick={()=>setShowVolPanel(t.id==="vols")}
                                            style={{
                                                flex:1,padding:"7px 8px",
                                                borderRadius:10,border:"1.5px solid",
                                                cursor:"pointer",fontFamily:"inherit",
                                                fontSize:11,fontWeight:700,
                                                background: (t.id==="vols")===showVolPanel
                                                    ? "#1C352D" : "#f8faf6",
                                                borderColor:(t.id==="vols")===showVolPanel
                                                    ? "#1C352D" : "#e8f0e0",
                                                color:(t.id==="vols")===showVolPanel
                                                    ? "#EBF4DD" : "#5A7863",
                                                display:"flex",alignItems:"center",
                                                justifyContent:"center",gap:5,
                                            }}
                                        >
                                            {t.label}
                                            <span style={{
                                                padding:"1px 6px",borderRadius:20,fontSize:9,
                                                fontWeight:900,
                                                background:(t.id==="vols")===showVolPanel
                                                    ? "rgba(255,255,255,0.2)" : "#EBF4DD",
                                                color:(t.id==="vols")===showVolPanel
                                                    ? "#EBF4DD" : "#3B4953",
                                            }}>
                        {t.count}
                      </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scrollable content */}
                            <div style={{ flex:1,overflowY:"auto",padding:10 }}>
                                {!showVolPanel ? (
                                    filtered
                                        .sort((a,b)=>b.urgency-a.urgency)
                                        .map(need=>(
                                            <NeedCard
                                                key={need.id}
                                                need={need}
                                                active={selectedNeed?.id===need.id}
                                                onClick={()=>handleNeedClick(need)}
                                            />
                                        ))
                                ) : (
                                    MOCK_VOLUNTEERS.map(vol=>(
                                        <VolCard
                                            key={vol.id}
                                            vol={vol}
                                            onAssign={selectedNeed ? handleAssign : null}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Selected need detail */}
                            <AnimatePresence>
                                {selectedNeed && !showVolPanel && (
                                    <motion.div
                                        initial={{ y:180,opacity:0 }}
                                        animate={{ y:0,  opacity:1 }}
                                        exit={{    y:180,opacity:0 }}
                                        transition={{ type:"spring",stiffness:380,damping:32 }}
                                        style={{
                                            borderTop:"1.5px solid rgba(90,120,99,0.12)",
                                            background:"rgba(255,255,255,0.98)",
                                            padding:14,
                                        }}
                                    >
                                        <div style={{ display:"flex",alignItems:"center",
                                            justifyContent:"space-between",
                                            marginBottom:10 }}>
                                            <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                                                <div style={{
                                                    width:28,height:28,borderRadius:9,
                                                    background:CAT_COLOR[selectedNeed.category]+"18",
                                                    display:"flex",alignItems:"center",
                                                    justifyContent:"center",
                                                    color:CAT_COLOR[selectedNeed.category],
                                                }}>
                                                    {CAT_ICON[selectedNeed.category]}
                                                </div>
                                                <p style={{ fontSize:12,fontWeight:900,
                                                    color:"#1C352D",margin:0 }}>
                                                    {selectedNeed.title}
                                                </p>
                                            </div>
                                            <button onClick={()=>setSelectedNeed(null)}
                                                    style={{ border:"none",background:"none",cursor:"pointer" }}>
                                                <X size={12} style={{ color:"#90AB8B" }}/>
                                            </button>
                                        </div>

                                        {/* detail grid */}
                                        <div style={{ display:"grid",
                                            gridTemplateColumns:"1fr 1fr",
                                            gap:6,marginBottom:10 }}>
                                            {[
                                                ["Zone",    selectedNeed.zone                      ],
                                                ["People",  `${selectedNeed.people} affected`      ],
                                                ["Urgency", `${U_LABEL[selectedNeed.urgency]}`     ],
                                                ["Status",  STATUS_CFG[selectedNeed.status].label  ],
                                            ].map(([k,v])=>(
                                                <div key={k} style={{
                                                    padding:"8px 10px",borderRadius:10,
                                                    background:"#f8faf6",
                                                    border:"1px solid #e8f0e0",
                                                }}>
                                                    <p style={{ fontSize:9,fontWeight:700,color:"#90AB8B",
                                                        margin:0,textTransform:"uppercase",
                                                        letterSpacing:".4px" }}>{k}</p>
                                                    <p style={{ fontSize:11,fontWeight:900,
                                                        color:"#1C352D",margin:"2px 0 0" }}>{v}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* assign button */}
                                        <motion.button
                                            whileHover={{ scale:1.02 }}
                                            whileTap={{ scale:.97 }}
                                            onClick={()=>setShowVolPanel(true)}
                                            style={{
                                                width:"100%",padding:"10px",
                                                borderRadius:12,border:"none",
                                                background:"#1C352D",color:"#EBF4DD",
                                                fontSize:12,fontWeight:900,cursor:"pointer",
                                                display:"flex",alignItems:"center",
                                                justifyContent:"center",gap:6,
                                                fontFamily:"inherit",
                                                boxShadow:"0 4px 16px rgba(28,53,45,0.2)",
                                            }}
                                        >
                                            <Users size={12}/> Find & assign volunteer
                                            <ChevronRight size={12}/>
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── BOTTOM LEGEND ───────────────────────────────────── */}
                <motion.div
                    initial={{ opacity:0,y:20 }}
                    animate={{ opacity:1,y:0 }}
                    transition={{ delay:.6 }}
                    style={{
                        position:"absolute",
                        bottom:20,
                        left:"50%",
                        transform:"translateX(-50%)",
                        pointerEvents:"auto",
                        display:"flex",alignItems:"center",gap:14,
                        padding:"10px 20px",
                        background:"rgba(255,255,255,0.92)",
                        backdropFilter:"blur(20px)",
                        borderRadius:16,
                        border:"1.5px solid rgba(90,120,99,0.15)",
                        boxShadow:"0 8px 32px rgba(28,53,45,0.12)",
                        whiteSpace:"nowrap",
                    }}
                >
          <span style={{ fontSize:10,fontWeight:700,color:"#90AB8B",
              textTransform:"uppercase",letterSpacing:".5px" }}>
            Urgency
          </span>
                    {[1,2,3,4,5].map(u=>(
                        <div key={u} style={{ display:"flex",alignItems:"center",gap:5 }}>
                            <div style={{
                                width:12,height:12,borderRadius:"50%",
                                background:U_COLOR[u],
                                border:`2px solid ${U_COLOR[u]}44`,
                            }}/>
                            <span style={{ fontSize:11,fontWeight:700,color:"#3B4953" }}>
                {u===1?"Low":u===3?"Med":u===5?"Critical":u}
              </span>
                        </div>
                    ))}
                    <div style={{ width:1,height:16,background:"#e8f0e0" }}/>
                    <span style={{ fontSize:11,fontWeight:700,color:"#5A7863" }}>
            {filtered.length} visible
          </span>
                    {critical > 0 && (
                        <>
                            <div style={{ width:1,height:16,background:"#e8f0e0" }}/>
                            <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                                <motion.div
                                    animate={{ scale:[1,1.3,1] }}
                                    transition={{ duration:1.5,repeat:Infinity }}
                                    style={{
                                        width:8,height:8,borderRadius:"50%",
                                        background:"#dc2626",
                                    }}
                                />
                                <span style={{ fontSize:11,fontWeight:900,color:"#dc2626" }}>
                  {critical} critical
                </span>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* ── SUCCESS TOAST ───────────────────────────────────── */}
                <AnimatePresence>
                    {assignedMsg && (
                        <motion.div
                            initial={{ opacity:0,y:20,scale:.95 }}
                            animate={{ opacity:1,y:0, scale:1  }}
                            exit={{    opacity:0,y:20,scale:.95 }}
                            style={{
                                position:"absolute",bottom:70,
                                left:"50%",transform:"translateX(-50%)",
                                padding:"10px 18px",borderRadius:14,
                                background:"#1C352D",color:"#EBF4DD",
                                fontSize:12,fontWeight:700,
                                boxShadow:"0 8px 24px rgba(28,53,45,0.3)",
                                display:"flex",alignItems:"center",gap:7,
                                pointerEvents:"none",whiteSpace:"nowrap",
                            }}
                        >
                            <CheckCircle size={14} style={{ color:"#4ade80" }}/>
                            {assignedMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* ── SUBMIT MODAL ────────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <div style={{ position:"absolute",inset:0,zIndex:3000 }}>
                        <SubmitModal
                            onClose={()=>setShowModal(false)}
                            onSubmit={handleSubmitNeed}
                        />
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default HeatmapPage