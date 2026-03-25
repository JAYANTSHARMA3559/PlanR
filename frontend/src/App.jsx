import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'

// Protected route wrapper
function ProtectedLayout({ theme, onThemeToggle }) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return (
        <div className="app-layout">
            <Sidebar theme={theme} onThemeToggle={onThemeToggle} />
            <main className="main-content">
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
        </div>
    )
}

function AppInner() {
    const { isAuthenticated } = useAuth()

    // persist theme preference
    const [theme, setTheme] = useState(() => localStorage.getItem('planr_theme') || 'dark')

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('planr_theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
                />
                <Route
                    path="/signup"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
                />
                <Route
                    path="/*"
                    element={<ProtectedLayout theme={theme} onThemeToggle={toggleTheme} />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <AppInner />
            </ToastProvider>
        </AuthProvider>
    )
}
