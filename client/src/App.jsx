import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

// Pages — we'll create these one by one, placeholders for now
import LoginPage      from "./pages/LoginPage"
import SignupPage     from "./pages/SignupPage"
import DashboardPage  from "./pages/DashboardPage"
import HeatmapPage    from "./pages/HeatmapPage"
import TasksPage      from "./pages/TasksPage"
import VolunteersPage from "./pages/VolunteersPage"
import ImpactPage     from "./pages/ImpactPage"
import VolunteerHome  from "./pages/VolunteerHome"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/"       element={<Navigate to="/login" replace />} />
                <Route path="/login"  element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Coordinator routes */}
                <Route path="/dashboard"  element={<DashboardPage />} />
                <Route path="/heatmap"    element={<HeatmapPage />} />
                <Route path="/tasks"      element={<TasksPage />} />
                <Route path="/volunteers" element={<VolunteersPage />} />
                <Route path="/impact"     element={<ImpactPage />} />

                {/* Volunteer routes */}
                <Route path="/home" element={<VolunteerHome />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App