const GlassCard = ({ children, className = "", strong = false, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`${strong ? "glass-strong" : "glass"} p-6 ${
                onClick ? "cursor-pointer hover:border-primary-500/30 transition-all duration-300" : ""
            } ${className}`}
        >
            {children}
        </div>
    )
}

export default GlassCard