const colors = {
    green:  "bg-moss-500/15 text-moss-500 border-moss-500/30",
    forest: "bg-forest-800/10 text-forest-800 border-forest-800/20",
    sage:   "bg-sage-50 text-forest-600 border-moss-300/40",
    red:    "bg-red-50 text-red-700 border-red-200",
    amber:  "bg-amber-50 text-amber-700 border-amber-200",
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
}

const Badge = ({ label, color = "green", className = "" }) => (
    <span className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full
    text-xs font-medium border ${colors[color]} ${className}
  `}>
    {label}
  </span>
)
export default Badge