import { useAuth } from '@/hooks/useAuth'
import { hawaiiHour, hawaiiFullDate } from '@/utils/date'
import styles from './Header.module.css'

function getGreeting() {
  const h = hawaiiHour()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Header() {
  const { currentUser } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.greeting}>
        <span className={styles.greetingMain}>
          {getGreeting()}, {currentUser?.name}
        </span>
        <span className={styles.greetingSub}>
          Welcome to your Kitchen Issue Management System
        </span>
      </div>

      <div className={styles.right}>
        <span className={styles.date}>{hawaiiFullDate()}</span>

        <button className={styles.iconBtn} title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </button>

        <span className={styles.roleTag}>{currentUser?.role}</span>

        <div className={styles.avatar} title={currentUser?.username}>
          {getInitials(currentUser?.name)}
        </div>
      </div>
    </header>
  )
}
