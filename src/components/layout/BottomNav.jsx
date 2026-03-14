import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import styles from './BottomNav.module.css'

export default function BottomNav() {
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()
  const isAdmin = currentUser?.role === 'Admin'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className={styles.nav}>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
        Dashboard
      </NavLink>

      <NavLink
        to="/issues/new"
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Add Issue
      </NavLink>

      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4a3 3 0 110 6 3 3 0 010-6zm0 14c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08C16.71 17.72 14.5 19 12 19z"/>
          </svg>
          Admin
        </NavLink>
      )}

      <button className={styles.item} onClick={handleLogout}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
        Sign Out
      </button>
    </nav>
  )
}
