import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { setApiToken } from '../api/client.js'

const AuthContext = createContext(null)

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem('user')))

  useEffect(() => {
    setApiToken(token)
  }, [token])

  const value = useMemo(
    () => ({
      token,
      user,
      setAuth(nextToken, nextUser) {
        setToken(nextToken)
        setUser(nextUser)
        localStorage.setItem('token', nextToken)
        localStorage.setItem('user', JSON.stringify(nextUser))
      },
      clearAuth() {
        setToken('')
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
