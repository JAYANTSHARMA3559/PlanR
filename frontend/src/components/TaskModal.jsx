import { useState } from 'react'
import api from '../utils/api'
import { useToast } from '../context/ToastContext'
import { X } from 'lucide-react'

const DEFAULT = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
}

export default function TaskModal({ task, onClose, onSaved }) {
    const toast = useToast()
    const isEdit = !!task

    const [form, setForm] = useState(
        isEdit
            ? {
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                // dueDate from ISO → YYYY-MM-DD for date input
                dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
            }
            : { ...DEFAULT }
    )
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const validate = () => {
        const e = {}
        if (!form.title.trim()) e.title = 'Title is required'
        if (form.dueDate && isNaN(new Date(form.dueDate).getTime())) e.dueDate = 'Invalid date'
        return e
    }

    const onChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) return setErrors(errs)

        setSaving(true)
        try {
            const payload = { ...form, dueDate: form.dueDate || null }
            let saved
            if (isEdit) {
                const res = await api.put(`/tasks/${task._id}`, payload)
                saved = res.data.data
                toast.success('Task updated')
            } else {
                const res = await api.post('/tasks', payload)
                saved = res.data.data
                toast.success('Task created 🚀')
            }
            onSaved(saved, !isEdit)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</span>
                    <button className="btn-icon" onClick={onClose} title="Close">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input
                            id="task-title-input"
                            type="text"
                            className="form-control"
                            placeholder="e.g. Design homepage wireframes"
                            value={form.title}
                            onChange={onChange('title')}
                            autoFocus
                        />
                        {errors.title && <p className="error-msg">{errors.title}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            id="task-desc-input"
                            className="form-control"
                            placeholder="Optional — add any notes or context"
                            value={form.description}
                            onChange={onChange('description')}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Status</label>
                            <select id="task-status-select" className="form-control" value={form.status} onChange={onChange('status')}>
                                <option value="todo">Todo</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Priority</label>
                            <select id="task-priority-select" className="form-control" value={form.priority} onChange={onChange('priority')}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 16 }}>
                        <label className="form-label">Due Date</label>
                        <input
                            id="task-duedate-input"
                            type="date"
                            className="form-control"
                            value={form.dueDate}
                            onChange={onChange('dueDate')}
                        />
                        {errors.dueDate && <p className="error-msg">{errors.dueDate}</p>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                            Cancel
                        </button>
                        <button id="task-save-btn" type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                            {saving && <span className="spinner" style={{ width: 14, height: 14 }} />}
                            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
