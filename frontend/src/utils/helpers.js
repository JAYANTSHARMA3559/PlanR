export const formatDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'done') return false
    return new Date(dateStr) < new Date()
}

export const getPriorityWeight = (p) => ({ high: 3, medium: 2, low: 1 }[p] || 0)

export const getStatusLabel = (s) => ({ todo: 'Todo', 'in-progress': 'In Progress', done: 'Done' }[s] || s)
export const getPriorityLabel = (p) => ({ low: 'Low', medium: 'Medium', high: 'High' }[p] || p)

export const statusBadgeClass = (s) => ({
    todo: 'badge badge-status-todo',
    'in-progress': 'badge badge-status-inprogress',
    done: 'badge badge-status-done',
}[s] || 'badge')

export const priorityBadgeClass = (p) => ({
    low: 'badge badge-priority-low',
    medium: 'badge badge-priority-medium',
    high: 'badge badge-priority-high',
}[p] || 'badge')
