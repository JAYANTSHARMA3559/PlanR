import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'
import { User, Mail, Lock, ShieldCheck } from 'lucide-react'

export default function SignupPage() {
    const { login } = useAuth()
    const toast = useToast()
    const navigate = useNavigate()

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.email) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 6) e.password = 'At least 6 characters'
        if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
        return e
    }

    const handleSubmit = async (ev) => {
        ev.preventDefault()
        const e = validate()
        if (Object.keys(e).length) return setErrors(e)

        setLoading(true)
        try {
            const payload = { name: form.name, email: form.email, password: form.password }
            const res = await api.post('/auth/signup', payload)
            login(res.data.token, res.data.user)
            toast.success('Account created! Welcome 🎉')
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    const onChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>Taskify</h1>
                    <p>Create your account</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="form-field-icon-wrap">
                            <input
                                id="signup-name"
                                type="text"
                                className="form-control"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={onChange('name')}
                                autoFocus
                            />
                            <User size={16} className="form-field-icon" />
                        </div>
                        {errors.name && <p className="error-msg">{errors.name}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <div className="form-field-icon-wrap">
                            <input
                                id="signup-email"
                                type="email"
                                className="form-control"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={onChange('email')}
                            />
                            <Mail size={16} className="form-field-icon" />
                        </div>
                        {errors.email && <p className="error-msg">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="form-field-icon-wrap">
                            <input
                                id="signup-password"
                                type="password"
                                className="form-control"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={onChange('password')}
                            />
                            <Lock size={16} className="form-field-icon" />
                        </div>
                        {errors.password && <p className="error-msg">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="form-field-icon-wrap">
                            <input
                                id="signup-confirm"
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={form.confirm}
                                onChange={onChange('confirm')}
                            />
                            <ShieldCheck size={16} className="form-field-icon" />
                        </div>
                        {errors.confirm && <p className="error-msg">{errors.confirm}</p>}
                    </div>

                    <button id="signup-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading && <span className="spinner" />}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    )
}
