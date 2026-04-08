const variants = {
    primary:   "bg-forest-800 hover:bg-forest-900 text-sage-50 glow-green shadow-md",
    secondary: "bg-sage-50 hover:bg-sage-100 text-forest-800 border border-moss-500/30",
    accent:    "bg-moss-500 hover:bg-moss-400 text-white shadow-md",
    danger:    "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200",
    ghost:     "hover:bg-sage-50 text-forest-600 hover:text-forest-800",
}

const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
}

const Button = ({
                    children, variant = "primary", size = "md",
                    className = "", loading = false, disabled = false,
                    onClick, type = "button",
                }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
      ${variants[variant]} ${sizes[size]}
      rounded-xl font-semibold transition-all duration-200
      flex items-center gap-2 justify-center
      disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
      ${className}
    `}
    >
        {loading && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
        )}
        {children}
    </button>
)
export default Button