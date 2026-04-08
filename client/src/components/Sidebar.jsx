import { NavLink, useNavigate } from "react-router-dom"
import {
    LayoutDashboard, MapPin, ClipboardList, Users,
    BarChart3, Package, FileText, LogOut, Zap
} from "lucide-react"

const navItems = {
    coordinator: [
        { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"   },
        { to: "/heatmap",     icon: MapPin,           label: "Heatmap"     },
        { to: "/tasks",       icon: ClipboardList,    label: "Tasks"       },
        { to: "/volunteers",  icon: Users,            label: "Volunteers"  },
        { to: "/impact",      icon: BarChart3,        label: "Impact"      },
        { to: "/resources",   icon: Package,          label: "Resources"   },
        { to: "/sitrep",      icon: FileText,         label: "Sitrep"      },
    ],
    volunteer: [
        { to: "/home",        icon: LayoutDashboard,  label: "Home"        },
        { to: "/heatmap",     icon: MapPin,           label: "Map"         },
        { to: "/tasks",       icon: ClipboardList,    label: "My Tasks"    },
        { to: "/impact",      icon: BarChart3,        label: "Impact"      },
    ],
}

const Sidebar = ({ role = "coordinator" }) => {
    const navigate  = useNavigate()
    const items     = navItems[role] || navItems.coordinator

    return (
        <aside className="hidden lg:flex flex-col w-64 min-h-screen glass-strong
      border-r border-white/10 fixed left-0 top-0 z-40">

            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-600 glow-blue
            flex items-center justify-center">
                        <Zap size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-lg gradient-text">
                            CivicPulse
                        </h1>
                        <p className="text-[11px] text-white/40 capitalize">{role} view</p>
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                {items.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm
              font-medium transition-all duration-200
              ${isActive
                            ? "bg-primary-600/20 text-primary-400 border border-primary-500/30"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                        }
            `}
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom: user + logout */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl
            text-sm text-white/50 hover:text-danger-400 hover:bg-danger-500/10
            transition-all duration-200 w-full"
                >
                    <LogOut size={18} />
                    Sign out
                </button>
            </div>
        </aside>
    )
}

export default Sidebar