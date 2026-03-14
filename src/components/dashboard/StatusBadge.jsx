import styles from './StatusBadge.module.css'

export default function StatusBadge({ status }) {
  const cls =
    status === 'Resolved'
      ? styles.resolved
      : status === 'Pending'
      ? styles.pending
      : styles.high

  return <span className={`${styles.badge} ${cls}`}>{status}</span>
}
