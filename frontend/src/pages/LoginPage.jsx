import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
    const { login } = useAuth()
    const toast = useToast()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const validate = () => {
        const e = {}
        if (!form.email) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
        if (!form.password) e.password = 'Password is required'
        return e
    }

    const handleSubmit = async (ev) => {
        ev.preventDefault()
        const e = validate()
        if (Object.keys(e).length) return setErrors(e)

        setLoading(true)
        try {
            const res = await api.post('/auth/login', form)
            login(res.data.token, res.data.user)
            toast.success('Welcome back!')
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed')
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
                    <h1>PlanR</h1>
                    <p>Sign in to your workspace</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <div className="form-field-icon-wrap">
                            <input
                                id="login-email"
                                type="email"
                                className="form-control"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={onChange('email')}
                                autoFocus
                            />
                            <Mail size={16} className="form-field-icon" />
                        </div>
                        {errors.email && <p className="error-msg">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="form-field-icon-wrap">
                            <input
                                id="login-password"
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={onChange('password')}
                            />
                            <Lock size={16} className="form-field-icon" />
                        </div>
                        {errors.password && <p className="error-msg">{errors.password}</p>}
                    </div>

                    <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <span className="spinner" /> : null}
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="auth-switch">
                    Don't have an account?{' '}
                    <Link to="/signup">Create one</Link>
                </div>
            </div>
        </div>
    )
}
