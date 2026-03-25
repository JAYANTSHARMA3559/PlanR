import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, CheckSquare, Sun, Moon, LogOut } from 'lucide-react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
]

export default function Sidebar({ theme, onThemeToggle }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : '?'

    return (
        <>
            {/* Mobile topbar */}
            <div className="topbar">
                <button className="btn-icon" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
                <span className="topbar-logo">PlanR</span>
                <button className="theme-toggle" onClick={onThemeToggle} title="Toggle theme">
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
                />
            )}

            <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
                <div className="sidebar-logo">
                    <h1>PlanR</h1>
                    <span>Task Management System</span>
                </div>

                <nav className="sidebar-nav">
                    <p className="nav-section-label">Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="nav-icon"><item.icon size={18} strokeWidth={2} /></span>
                            {item.label}
                        </NavLink>
                    ))}

                    <p className="nav-section-label" style={{ marginTop: 16 }}>Settings</p>
                    <button className="nav-item" onClick={onThemeToggle}>
                        <span className="nav-icon">
                            {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
                        </span>
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button className="nav-item" onClick={handleLogout}>
                        <span className="nav-icon"><LogOut size={18} strokeWidth={2} /></span>
                        Sign Out
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-info">
                            <div className="user-name">{user?.name || 'User'}</div>
                            <div className="user-email">{user?.email || ''}</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
