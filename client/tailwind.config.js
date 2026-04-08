/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // CivicPulse brand palette
                forest: {
                    50:  "#f0f4ec",
                    100: "#e4ede0",
                    200: "#c9dbc3",
                    300: "#a3c09a",
                    400: "#7aa375",
                    500: "#5A7863",  // primary green
                    600: "#476053",
                    700: "#3B4953",
                    800: "#2D3D35",
                    900: "#1C352D",  // dark forest
                    950: "#0D1F19",  // near black
                },
                sage: {
                    50:  "#EBF4DD",
                    100: "#d9ebca",
                    200: "#c0dc9e",
                    300: "#A8CE78",
                    400: "#90AB8B",  // muted sage
                    500: "#7A9B83",
                    600: "#618070",
                    700: "#5A7863",
                    800: "#3B5C38",
                    900: "#2D4A2A",
                },
                moss: {
                    300: "#90AB8B",
                    500: "#5A7863",
                    700: "#3B4953",
                    900: "#1C352D",
                },
            },
            fontFamily: {
                sans:    ["'DM Sans'", "sans-serif"],
                display: ["'Syne'", "sans-serif"],
                mono:    ["'JetBrains Mono'", "monospace"],
            },
            animation: {
                "spin-slow":    "spin 3s linear infinite",
                "pulse-slow":   "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "bounce-slow":  "bounce 2s infinite",
                "fade-in":      "fadeIn 0.6s ease-out forwards",
                "slide-up":     "slideUp 0.5s ease-out forwards",
            },
            keyframes: {
                fadeIn: {
                    "0%":   { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%":   { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            borderRadius: {
                "4xl": "2rem",
                "5xl": "2.5rem",
            },
            backdropBlur: {
                xs: "2px",
            },
            backgroundImage: {
                "dot-forest": "radial-gradient(circle, #5A786315 1px, transparent 1px)",
                "dot-white":  "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            },
            backgroundSize: {
                "dot-sm": "20px 20px",
                "dot-md": "28px 28px",
                "dot-lg": "36px 36px",
            },
        },
    },
    plugins: [],
}