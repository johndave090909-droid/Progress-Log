import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getIssueById, resolveIssue, deleteIssue } from '@/firebase/issues'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ConfirmModal from '@/components/ui/ConfirmModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { hawaiiToday } from '@/utils/date'
import styles from './IssueDetailPage.module.css'

function RiskTag({ level }) {
  const cls = styles[`dot${level}`] || styles.dot2
  const label = level === '1' || level === 1 ? 'Low' : level === '2' || level === 2 ? 'Medium' : 'High'
  return (
    <span className={styles.riskTag}>
      <span className={`${styles.dot} ${cls}`} />
      Level {level} — {label}
    </span>
  )
}

export default function IssueDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showResolve, setShowResolve] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    getIssueById(id)
      .then(setIssue)
      .catch(() => setError('Issue not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const isAdmin = currentUser?.role === 'Admin'

  async function handleResolve() {
    setActionLoading(true)
    try {
      await resolveIssue(id)
      setIssue((prev) => ({
        ...prev,
        status: 'Resolved',
        dateResolved: hawaiiToday(),
      }))
      setShowResolve(false)
    } catch {
      setError('Failed to resolve issue.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      await deleteIssue(id)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Failed to delete issue.')
      setActionLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error && !issue) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        </div>
        <div style={{ color: 'var(--color-danger)' }}>{error}</div>
      </div>
    )
  }

  const allImages = [
    ...(issue.image ? [issue.image] : []),
    ...(issue.images || []),
  ].filter(Boolean)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>Issue Detail</h1>
        <div className={styles.headerActions}>
          <Link to={`/issues/${id}/edit`} className={styles.editBtn}>Edit</Link>
          {issue.status !== 'Resolved' && (
            <button className={styles.resolveBtn} onClick={() => setShowResolve(true)}>
              Mark Resolved
            </button>
          )}
          {isAdmin && (
            <button className={styles.deleteBtn} onClick={() => setShowDelete(true)}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className={styles.card}>
        {issue.status === 'Resolved' && (
          <div className={styles.resolvedBanner}>
            ✓ Resolved on {issue.dateResolved || '—'}
          </div>
        )}

        <div className={styles.metaBar}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Date Added</span>
            <span className={styles.metaValue}>{issue.dateAdded || '—'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status</span>
            <StatusBadge status={issue.status} />
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Category</span>
            <span className={styles.categoryTag}>{issue.category}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Risk Level</span>
            <RiskTag level={issue.riskLevel} />
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Accountable</span>
            <span className={styles.metaValue}>{issue.accountable || '—'}</span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Issue</span>
            <p className={styles.sectionContent}>{issue.issue}</p>
          </div>

          {issue.description && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Description</span>
              <p className={styles.sectionContent}>{issue.description}</p>
            </div>
          )}

          {issue.notes && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Resolution Notes</span>
              <p className={styles.sectionContent}>{issue.notes}</p>
            </div>
          )}

          {allImages.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Images ({allImages.length})</span>
              <div className={styles.imageGrid}>
                {allImages.map((src, i) => (
                  <div
                    key={i}
                    className={styles.imageThumb}
                    onClick={() => setLightbox(src)}
                  >
                    <img src={src} alt={`issue-img-${i}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showResolve && (
        <ConfirmModal
          title="Mark as Resolved"
          message="Are you sure you want to mark this issue as resolved? This will record today's date as the resolution date."
          confirmLabel="Mark Resolved"
          variant="primary"
          loading={actionLoading}
          onConfirm={handleResolve}
          onCancel={() => setShowResolve(false)}
        />
      )}

      {showDelete && (
        <ConfirmModal
          title="Delete Issue"
          message="Are you sure you want to permanently delete this issue? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={actionLoading}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt="full" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
