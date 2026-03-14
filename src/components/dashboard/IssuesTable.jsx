import { useState } from 'react'
import { resolveIssue, deleteIssue } from '@/firebase/issues'
import { useAuth } from '@/hooks/useAuth'
import ConfirmModal from '@/components/ui/ConfirmModal'
import IssueModal from './IssueModal'
import styles from './IssuesTable.module.css'

const CATEGORIES = ['All', 'Kitchen', 'Bakery', 'Dry', 'Chill', 'Chiller', 'Equipment']
const STATUSES = ['All', 'Pending', 'Resolved']

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function RiskPill({ level }) {
  const l = String(level)
  const cls = l === '3' ? styles.riskHigh : l === '2' ? styles.riskMedium : styles.riskLow
  const label = l === '3' ? 'High' : l === '2' ? 'Medium' : 'Low'
  return <span className={`${styles.riskPill} ${cls}`}>{label}</span>
}

function StatusBadge({ status }) {
  const cls = status === 'Resolved' ? styles.statusResolved : styles.statusPending
  return <span className={`${styles.statusBadge} ${cls}`}>{status}</span>
}

function parseNames(accountable, userMap) {
  if (!accountable) return []
  return accountable.split('/').map((p) => p.trim()).filter(Boolean).map((p) => userMap[p] || p)
}

export default function IssuesTable({ issues, users = [] }) {
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'Admin'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [confirmResolve, setConfirmResolve] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)

  // Build username → display name map
  const userMap = {}
  users.forEach((u) => { userMap[u.username] = u.name })

  const filtered = issues.filter((iss) => {
    const matchSearch =
      !search ||
      iss.issue?.toLowerCase().includes(search.toLowerCase()) ||
      iss.accountable?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || iss.category === category
    const matchStatus = status === 'All' || iss.status === status
    return matchSearch && matchCategory && matchStatus
  })

  async function handleResolve(id) {
    setActionLoading(true)
    try { await resolveIssue(id) }
    finally { setActionLoading(false); setConfirmResolve(null) }
  }

  async function handleDelete(id) {
    setActionLoading(true)
    try { await deleteIssue(id) }
    finally { setActionLoading(false); setConfirmDelete(null) }
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.filters}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search issue or accountable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Mobile card list */}
        <div className={styles.cardList}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📋</div>
              <div>No issues found</div>
            </div>
          ) : filtered.map((iss) => {
            const names = parseNames(iss.accountable, userMap)
            const days = daysSince(iss.dateAdded)
            const isResolved = iss.status === 'Resolved'
            return (
              <div key={iss.id} className={styles.issueCard} onClick={() => setSelectedIssue(iss)}>
                <div className={styles.cardThumb}>
                  {iss.image
                    ? <img src={iss.image} alt="preview" />
                    : <div className={styles.cardThumbEmpty}>🍽️</div>
                  }
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.cardTitle}>{iss.issue}</span>
                  {iss.description && <span className={styles.cardDesc}>{iss.description}</span>}
                  <div className={styles.cardMeta}>
                    <span className={styles.categoryTag}>{iss.category}</span>
                    <RiskPill level={iss.riskLevel} />
                    <StatusBadge status={iss.status} />
                    {names.map((n, i) => <span key={i} className={styles.namePill}>{n}</span>)}
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardDate}>{iss.dateAdded || '—'}</span>
                    {days !== null && (
                      <span className={`${styles.cardDays} ${isResolved ? styles.cardDaysResolved : ''}`}>
                        {days}d
                      </span>
                    )}
                    <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                      {!isResolved ? (
                        <button className={`${styles.actionBtn} ${styles.resolveBtn}`} title="Mark Resolved"
                          onClick={() => setConfirmResolve(iss.id)}>✓</button>
                      ) : (
                        <button className={`${styles.actionBtn} ${styles.resolveBtn} ${styles.done}`} disabled>✓</button>
                      )}
                      {isAdmin && (
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete"
                          onClick={() => setConfirmDelete(iss.id)}>🗑</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table */}
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Issue</th>
                <th>Category</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Opened</th>
                <th>Days</th>
                <th>Accountable</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className={styles.empty}>
                      <div className={styles.emptyIcon}>📋</div>
                      <div>No issues found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((iss) => {
                  const names = parseNames(iss.accountable, userMap)
                  const days = daysSince(iss.dateAdded)
                  const isResolved = iss.status === 'Resolved'

                  return (
                    <tr
                      key={iss.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedIssue(iss)}
                    >
                      {/* Preview */}
                      <td>
                        <div className={styles.preview}>
                          {iss.image
                            ? <img src={iss.image} alt="preview" />
                            : <div className={styles.noImage}>🍽️</div>
                          }
                        </div>
                      </td>

                      {/* Issue + description */}
                      <td>
                        <div className={styles.issueCell}>
                          <span className={styles.issueName}>{iss.issue}</span>
                          {iss.description && (
                            <span className={styles.issueDesc}>{iss.description}</span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td><span className={styles.categoryTag}>{iss.category}</span></td>

                      {/* Risk */}
                      <td><RiskPill level={iss.riskLevel} /></td>

                      {/* Status */}
                      <td><StatusBadge status={iss.status} /></td>

                      {/* Opened */}
                      <td>{iss.dateAdded || '—'}</td>

                      {/* Days */}
                      <td>
                        {days !== null
                          ? <span className={`${styles.days} ${isResolved ? styles.daysResolved : ''}`}>{days}d</span>
                          : '—'
                        }
                      </td>

                      {/* Accountable */}
                      <td>
                        <div className={styles.namePills}>
                          {names.length > 0
                            ? names.map((n, i) => <span key={i} className={styles.namePill}>{n}</span>)
                            : <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                          }
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className={styles.actions}>
                          {!isResolved ? (
                            <button
                              className={`${styles.actionBtn} ${styles.resolveBtn}`}
                              title="Mark Resolved"
                              onClick={(e) => { e.stopPropagation(); setConfirmResolve(iss.id) }}
                            >✓</button>
                          ) : (
                            <button className={`${styles.actionBtn} ${styles.resolveBtn} ${styles.done}`} disabled>✓</button>
                          )}
                          {isAdmin && (
                            <button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              title="Delete"
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete(iss.id) }}
                            >🗑</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue detail popup */}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          userMap={userMap}
          users={users}
          onClose={() => setSelectedIssue(null)}
        />
      )}

      {confirmResolve && (
        <ConfirmModal
          title="Mark as Resolved"
          message="Mark this issue as resolved? Today's date will be recorded."
          confirmLabel="Mark Resolved"
          variant="primary"
          loading={actionLoading}
          onConfirm={() => handleResolve(confirmResolve)}
          onCancel={() => setConfirmResolve(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Issue"
          message="Permanently delete this issue? This cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={actionLoading}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}
