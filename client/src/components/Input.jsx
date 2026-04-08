const Input = ({ label, placeholder, value, onChange, type = "text", icon, error, className = "" }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && <label className="text-sm font-medium text-forest-800">{label}</label>}
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-moss-500">
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`
          w-full rounded-xl px-4 py-3 text-forest-800 text-sm
          bg-white border border-moss-500/25
          placeholder-moss-300
          focus:outline-none focus:border-moss-500 focus:ring-2
          focus:ring-moss-500/20 transition-all duration-200
          ${icon ? "pl-10" : ""}
          ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}
        `}
            />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
)
export default Input