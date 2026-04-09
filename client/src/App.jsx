import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LandingPage    from "./pages/LandingPage"
import LoginPage      from "./pages/LoginPage"
import SignupPage     from "./pages/SignupPage"
import DashboardPage  from "./pages/DashboardPage"
import HeatmapPage    from "./pages/HeatmapPage"
import TasksPage      from "./pages/TasksPage"
import VolunteersPage from "./pages/VolunteersPage"
import ImpactPage     from "./pages/ImpactPage"
import VolunteerHome  from "./pages/VolunteerHome"
import ReportNeedPage from "./pages/ReportNeedPage"

const App = () => (
    <BrowserRouter>
        <Routes>
            {/* Public */}
            <Route path="/"       element={<LandingPage />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Coordinator */}
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/heatmap"    element={<HeatmapPage />} />
            <Route path="/tasks"      element={<TasksPage />} />
            <Route path="/volunteers" element={<VolunteersPage />} />
            <Route path="/impact"     element={<ImpactPage />} />
            <Route path="/report"    element={<ReportNeedPage />} />

            {/* Volunteer */}
            <Route path="/home" element={<VolunteerHome />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
)

export default App