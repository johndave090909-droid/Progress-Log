import { createContext, useState, useCallback } from 'react'
import { loginUser as firebaseLogin, logoutUser as firebaseLogout, getStoredUser } from '@/firebase/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())

  const login = useCallback(async (username, password) => {
    const user = await firebaseLogin(username, password)
    setCurrentUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    firebaseLogout()
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
