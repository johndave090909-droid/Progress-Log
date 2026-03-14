import { Link } from 'react-router-dom'
import { useIssues } from '@/hooks/useIssues'
import { useUsers } from '@/hooks/useUsers'
import StatCard from '@/components/dashboard/StatCard'
import IssuesTable from '@/components/dashboard/IssuesTable'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import styles from './DashboardPage.module.css'

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().slice(0, 10)
}

export default function DashboardPage() {
  const { issues, loading } = useIssues()
  const { users } = useUsers()

  const today = getToday()
  const weekStart = getWeekStart()

  const todayCount = issues.filter((i) => i.dateAdded === today).length
  const weekCount = issues.filter((i) => i.dateAdded >= weekStart).length
  const pendingCount = issues.filter((i) => i.status === 'Pending').length
  const highRiskCount = issues.filter((i) => String(i.riskLevel) === '3').length

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.page}>
      <div>
        <h2 className={styles.sectionTitle}>Analytics Overview</h2>
        <div className={styles.statsGrid}>
          <StatCard
            label="Today's Issues"
            count={todayCount}
            sublabel="Issues"
            colorVariant="green"
          />
          <StatCard
            label="Last Week Issues"
            count={weekCount}
            sublabel="Issues"
            colorVariant="yellow"
          />
          <StatCard
            label="Pending Issues"
            count={pendingCount}
            sublabel="Issues"
            colorVariant="purple"
          />
          <StatCard
            label="High Risk Items"
            count={highRiskCount}
            sublabel="Issues"
            colorVariant="pink"
          />
        </div>
      </div>

      <div>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            Kitchen Issues List
          </h2>
          <Link to="/issues/new" className={styles.addBtn}>
            + Add Issue
          </Link>
        </div>
        <IssuesTable issues={issues} users={users} />
      </div>
    </div>
  )
}
