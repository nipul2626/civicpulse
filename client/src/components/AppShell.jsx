import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"

const AppShell = ({ children, role = "coordinator" }) => {
    return (
        <div className="min-h-screen bg-dark-900">

            {/* Ambient background orbs — purely decorative */}
            <div className="orb w-96 h-96 bg-primary-600 top-0 left-1/4 fixed" />
            <div className="orb w-80 h-80 bg-accent-600 bottom-1/4 right-1/4 fixed" />

            {/* Desktop sidebar */}
            <Sidebar role={role} />

            {/* Main content — offset by sidebar width on desktop */}
            <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile bottom nav */}
            <BottomNav role={role} />
        </div>
    )
}

export default AppShell