import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import styles from './IssuesTable.module.css'

const CATEGORIES = ['All', 'Kitchen', 'Bakery', 'Dry', 'Chill', 'Chiller']
const STATUSES = ['All', 'Pending', 'Resolved']

function RiskDot({ level }) {
  const cls = styles[`dot${level}`] || styles.dot2
  return (
    <span className={styles.riskDot}>
      <span className={`${styles.dot} ${cls}`} />
      Level {level}
    </span>
  )
}

export default function IssuesTable({ issues }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  const filtered = issues.filter((iss) => {
    const matchSearch =
      !search ||
      iss.issue?.toLowerCase().includes(search.toLowerCase()) ||
      iss.accountable?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || iss.category === category
    const matchStatus = status === 'All' || iss.status === status
    return matchSearch && matchCategory && matchStatus
  })

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search issue or accountable..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date Added</th>
              <th>Issue</th>
              <th>Category</th>
              <th>Status</th>
              <th>Risk Level</th>
              <th>Accountable</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📋</div>
                    <div>No issues found</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((iss) => (
                <tr key={iss.id} onClick={() => navigate(`/issues/${iss.id}`)}>
                  <td>{iss.dateAdded || '—'}</td>
                  <td>
                    <span className={styles.issueName} title={iss.issue}>
                      {iss.issue}
                    </span>
                  </td>
                  <td>
                    <span className={styles.categoryTag}>{iss.category}</span>
                  </td>
                  <td>
                    <StatusBadge status={iss.status} />
                  </td>
                  <td>
                    <RiskDot level={iss.riskLevel} />
                  </td>
                  <td>
                    <span className={styles.accountable} title={iss.accountable}>
                      {iss.accountable || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
