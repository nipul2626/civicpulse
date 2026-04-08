const Input = ({ label, type = "text", placeholder, value, onChange, icon, className = "" }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
            <label className="text-sm font-semibold" style={{ color: "#3B4953" }}>
                {label}
            </label>
        )}
        <div className="relative">
            {icon && (
                <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#90AB8B" }}
                >
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full rounded-xl py-3 text-sm outline-none transition-all duration-200 ${
                    icon ? "pl-10 pr-4" : "px-4"
                }`}
                style={{
                    background: "#f8faf6",
                    border: "1.5px solid #d4e4cc",
                    color: "#1C352D",
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = "#5A7863"
                    e.target.style.background = "#fff"
                    e.target.style.boxShadow = "0 0 0 3px rgba(90,120,99,0.12)"
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "#d4e4cc"
                    e.target.style.background = "#f8faf6"
                    e.target.style.boxShadow = "none"
                }}
            />
        </div>
    </div>
)

export default Input