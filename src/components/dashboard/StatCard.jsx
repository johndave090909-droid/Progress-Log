import styles from './StatCard.module.css'

export default function StatCard({ label, count, sublabel, colorVariant = 'green' }) {
  const variantClass = styles[colorVariant] || styles.green

  return (
    <div className={`${styles.card} ${variantClass}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.count}>{String(count).padStart(3, '0')}</span>
      {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
    </div>
  )
}
