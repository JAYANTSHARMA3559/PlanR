import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('taskify_user')) || null
        } catch {
            return null
        }
    })

    const login = (token, userData) => {
        localStorage.setItem('taskify_token', token)
        localStorage.setItem('taskify_user', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = useCallback(() => {
        localStorage.removeItem('taskify_token')
        localStorage.removeItem('taskify_user')
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
