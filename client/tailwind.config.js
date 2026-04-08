/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                sage:   { 50: "#EBF4DD", 100: "#d6e9bb", 200: "#c2de99" },
                moss:   { 300: "#90AB8B", 400: "#7a9875", 500: "#5A7863" },
                forest: { 600: "#3B4953", 700: "#2e3d47", 800: "#1C352D", 900: "#162a23" },
            },
            fontFamily: {
                sans:    ["Inter", "sans-serif"],
                display: ["Syne", "sans-serif"],
            },
            animation: {
                "float":      "float 6s ease-in-out infinite",
                "fade-in":    "fadeIn 0.5s ease-out",
                "slide-up":   "slideUp 0.4s ease-out",
            },
            keyframes: {
                float:   { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-16px)" } },
                fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
                slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
            },
        },
    },
    plugins: [],
}