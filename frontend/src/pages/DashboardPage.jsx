import { useEffect, useState } from 'react'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { ClipboardList, CheckCircle2, Clock, Flame } from 'lucide-react'

const COLORS = {
    todo: '#8892b0',
    'in-progress': '#818cf8',
    done: '#10b981',
    high: '#f43f5e',
    medium: '#f59e0b',
    low: '#10b981',
}

const STAT_ICONS = {
    total: ClipboardList,
    completed: CheckCircle2,
    pending: Clock,
    overdue: Flame,
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/tasks/analytics')
            .then((res) => setStats(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="loading-center">
                <div className="spinner spinner-lg" />
                <p>Loading your dashboard...</p>
            </div>
        )
    }

    const pieData = stats ? [
        { name: 'Todo', value: stats.todo, key: 'todo' },
        { name: 'In Progress', value: stats.inProgress, key: 'in-progress' },
        { name: 'Done', value: stats.completed, key: 'done' },
    ].filter(d => d.value > 0) : []

    const barData = stats ? [
        { name: 'High', count: stats.priorityBreakdown?.high || 0 },
        { name: 'Medium', count: stats.priorityBreakdown?.medium || 0 },
        { name: 'Low', count: stats.priorityBreakdown?.low || 0 },
    ] : []

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const firstName = user?.name?.split(' ')[0] || 'there'

    const statCards = [
        { key: 'total', label: 'Total Tasks', value: stats?.total ?? 0 },
        { key: 'completed', label: 'Completed', value: stats?.completed ?? 0 },
        { key: 'pending', label: 'Pending', value: stats?.pending ?? 0 },
        { key: 'overdue', label: 'Overdue', value: stats?.overdue ?? 0 },
    ]

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">{greeting}, {firstName} 👋</h2>
                    <p className="page-subtitle">Here's a quick look at your task progress</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-grid">
                {statCards.map(({ key, label, value }) => {
                    const Icon = STAT_ICONS[key]
                    return (
                        <div key={key} className={`stat-card ${key}`}>
                            <div className="stat-icon"><Icon size={24} strokeWidth={1.8} /></div>
                            <div className="stat-value">{value}</div>
                            <div className="stat-label">{label}</div>
                        </div>
                    )
                })}
            </div>

            {/* Completion Progress */}
            {stats && stats.total > 0 && (
                <div className="completion-card">
                    <div className="completion-header">
                        <span className="completion-label">Overall Completion</span>
                        <span className="completion-value">{stats.completionRate}%</span>
                    </div>
                    <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${stats.completionRate}%` }} />
                    </div>
                    <p className="completion-info">
                        {stats.completed} of {stats.total} tasks completed
                    </p>
                </div>
            )}

            {/* Charts */}
            {stats && stats.total > 0 ? (
                <div className="charts-row">
                    {/* Donut chart */}
                    <div className="chart-card">
                        <div className="chart-title">Task Status Breakdown</div>
                        <div className="chart-subtitle">Distribution across all statuses</div>
                        <ResponsiveContainer width="100%" height={230}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {pieData.map((entry) => (
                                        <Cell key={entry.key} fill={COLORS[entry.key]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 12,
                                        fontSize: 13,
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: 'var(--shadow-md)'
                                    }}
                                    formatter={(val, name) => [val, name]}
                                />
                                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar chart - priority */}
                    <div className="chart-card">
                        <div className="chart-title">Tasks by Priority</div>
                        <div className="chart-subtitle">How your workload is distributed</div>
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart data={barData} barSize={40} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 12,
                                        fontSize: 13,
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: 'var(--shadow-md)'
                                    }}
                                />
                                <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                                    {barData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={entry.name === 'High' ? '#f43f5e' : entry.name === 'Medium' ? '#f59e0b' : '#10b981'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No tasks yet</h3>
                        <p>Head over to <strong>My Tasks</strong> to create your first task</p>
                    </div>
                </div>
            )}
        </div>
    )
}
