import { NavLink } from "react-router-dom"
import { LayoutDashboard, MapPin, ClipboardList, Users, BarChart3 } from "lucide-react"

const navItems = {
    coordinator: [
        { to: "/dashboard",  icon: LayoutDashboard, label: "Home"      },
        { to: "/heatmap",    icon: MapPin,          label: "Map"       },
        { to: "/tasks",      icon: ClipboardList,   label: "Tasks"     },
        { to: "/volunteers", icon: Users,           label: "Team"      },
        { to: "/impact",     icon: BarChart3,       label: "Impact"    },
    ],
    volunteer: [
        { to: "/home",       icon: LayoutDashboard, label: "Home"      },
        { to: "/heatmap",    icon: MapPin,          label: "Map"       },
        { to: "/tasks",      icon: ClipboardList,   label: "Tasks"     },
        { to: "/impact",     icon: BarChart3,       label: "Impact"    },
    ],
}

const BottomNav = ({ role = "coordinator" }) => {
    const items = navItems[role] || navItems.coordinator

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
      glass-strong border-t border-white/10">
            <div className="flex items-center justify-around px-2 py-2">
                {items.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl
              text-[10px] font-medium transition-all duration-200 min-w-[56px]
              ${isActive
                            ? "text-primary-400 bg-primary-500/10"
                            : "text-white/40 hover:text-white/70"
                        }
            `}
                    >
                        <Icon size={20} />
                        {label}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}

export default BottomNav