import { useEffect, useState } from 'react'
import api from '../utils/api'
import {
    formatDate, isOverdue, statusBadgeClass, priorityBadgeClass,
    getStatusLabel, getPriorityLabel
} from '../utils/helpers'
import TaskModal from '../components/TaskModal'
import { useToast } from '../context/ToastContext'
import { Search, Plus, Pencil, Trash2, Calendar, Check } from 'lucide-react'

const STATUSES = ['', 'todo', 'in-progress', 'done']
const PRIORITIES = ['', 'low', 'medium', 'high']

export default function TasksPage() {
    const toast = useToast()
    const [tasks, setTasks] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editTask, setEditTask] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    // Filters
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [order, setOrder] = useState('desc')
    const [page, setPage] = useState(1)

    const fetchTasks = async (opts = {}) => {
        setLoading(true)
        try {
            const params = {
                page: opts.page ?? page,
                limit: 10,
                ...(opts.status ?? statusFilter ? { status: opts.status ?? statusFilter } : {}),
                ...(opts.priority ?? priorityFilter ? { priority: opts.priority ?? priorityFilter } : {}),
                ...(opts.search ?? search ? { search: opts.search ?? search } : {}),
                sortBy: opts.sortBy ?? sortBy,
                order: opts.order ?? order,
            }
            const res = await api.get('/tasks', { params })
            setTasks(res.data.data)
            setPagination(res.data.pagination)
        } catch {
            toast.error('Failed to load tasks')
        } finally {
            setLoading(false)
        }
    }

    // re-fetch when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1)
            fetchTasks({ page: 1, search })
        }, 350)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        fetchTasks()
    }, [statusFilter, priorityFilter, sortBy, order, page])

    const handleToggleDone = async (task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done'
        try {
            await api.put(`/tasks/${task._id}`, { status: newStatus })
            setTasks((prev) => prev.map((t) => t._id === task._id ? { ...t, status: newStatus } : t))
            toast.success(newStatus === 'done' ? 'Task marked as done ✅' : 'Task reopened')
        } catch {
            toast.error('Could not update task')
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await api.delete(`/tasks/${deleteId}`)
            setTasks((prev) => prev.filter((t) => t._id !== deleteId))
            toast.success('Task deleted')
            setDeleteId(null)
        } catch {
            toast.error('Could not delete task')
        }
    }

    const handleSaved = (task, isNew) => {
        if (isNew) {
            fetchTasks() // refetch so pagination stays correct
        } else {
            setTasks((prev) => prev.map((t) => t._id === task._id ? task : t))
        }
        setModalOpen(false)
        setEditTask(null)
    }

    const openEdit = (task) => {
        setEditTask(task)
        setModalOpen(true)
    }

    const openNew = () => {
        setEditTask(null)
        setModalOpen(true)
    }

    const handleSort = (field) => {
        if (sortBy === field) {
            setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(field)
            setOrder('desc')
        }
    }

    const sortArrow = (field) => {
        if (sortBy !== field) return '↕'
        return order === 'asc' ? '↑' : '↓'
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">My Tasks</h2>
                    <p className="page-subtitle">{pagination.total} task{pagination.total !== 1 ? 's' : ''} total</p>
                </div>
                <button id="new-task-btn" className="btn btn-primary" onClick={openNew}>
                    <Plus size={16} strokeWidth={2.5} /> New Task
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-input-wrap">
                    <span className="search-icon"><Search size={16} /></span>
                    <input
                        id="task-search"
                        type="text"
                        className="form-control"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    id="filter-status"
                    className="form-control filter-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                >
                    <option value="">All Statuses</option>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
                <select
                    id="filter-priority"
                    className="form-control filter-select"
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}
                >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            {/* Sort bar */}
            <div className="sort-row">
                <span className="sort-label">Sort by:</span>
                {[
                    { key: 'createdAt', label: 'Created' },
                    { key: 'dueDate', label: 'Due Date' },
                    { key: 'priority', label: 'Priority' },
                ].map((s) => (
                    <button
                        key={s.key}
                        className={`sort-btn${sortBy === s.key ? ' active' : ''}`}
                        onClick={() => handleSort(s.key)}
                    >
                        {s.label} {sortArrow(s.key)}
                    </button>
                ))}
            </div>

            {/* Task List */}
            {loading ? (
                <div className="loading-center">
                    <div className="spinner spinner-lg" />
                    <p>Loading tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No tasks found</h3>
                    <p>Try adjusting your filters or create a new task</p>
                </div>
            ) : (
                <div className="task-list">
                    {tasks.map((task) => (
                        <div key={task._id} className={`task-card${task.status === 'done' ? ' done' : ''} priority-${task.priority}`}>
                            {/* Checkbox */}
                            <button
                                className={`task-checkbox${task.status === 'done' ? ' checked' : ''}`}
                                onClick={() => handleToggleDone(task)}
                                title={task.status === 'done' ? 'Reopen' : 'Mark as done'}
                            >
                                {task.status === 'done' && <Check size={14} strokeWidth={3} />}
                            </button>

                            {/* Content */}
                            <div>
                                <div className="task-title">{task.title}</div>
                                {task.description && (
                                    <div className="task-description">{task.description}</div>
                                )}
                                <div className="task-meta">
                                    <span className={statusBadgeClass(task.status)}>{getStatusLabel(task.status)}</span>
                                    <span className={priorityBadgeClass(task.priority)}>{getPriorityLabel(task.priority)}</span>
                                    {task.dueDate && (
                                        <span className={`due-date${isOverdue(task.dueDate, task.status) ? ' overdue' : ''}`}>
                                            <Calendar size={12} /> {formatDate(task.dueDate)}
                                            {isOverdue(task.dueDate, task.status) ? ' · Overdue' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="task-actions">
                                <button className="btn-icon" onClick={() => openEdit(task)} title="Edit">
                                    <Pencil size={14} />
                                </button>
                                <button className="btn-icon" onClick={() => setDeleteId(task._id)} title="Delete" style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
                    <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((p) => Math.abs(p - page) <= 2)
                        .map((p) => (
                            <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>
                                {p}
                            </button>
                        ))}
                    <button className="page-btn" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
                    <button className="page-btn" disabled={page === pagination.totalPages} onClick={() => setPage(pagination.totalPages)}>»</button>
                </div>
            )}

            {/* Task Modal */}
            {modalOpen && (
                <TaskModal
                    task={editTask}
                    onClose={() => { setModalOpen(false); setEditTask(null) }}
                    onSaved={handleSaved}
                />
            )}

            {/* Delete Confirm */}
            {deleteId && (
                <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
                    <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">Delete task?</span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            This action cannot be undone. The task will be permanently removed.
                        </p>
                        <div className="modal-footer">
                            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
