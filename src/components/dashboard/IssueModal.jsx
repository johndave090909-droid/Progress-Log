import { useState, useEffect } from 'react'
import { updateIssue } from '@/firebase/issues'
import styles from './IssueModal.module.css'

const CATEGORIES = ['Kitchen', 'Bakery', 'Dry', 'Chill', 'Chiller', 'Equipment']

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

// Parse "username1/username2" → array of usernames
function parseUsernames(accountable) {
  if (!accountable) return []
  return accountable.split('/').map((p) => p.trim()).filter(Boolean)
}

export default function IssueModal({ issue, userMap = {}, users = [], onClose }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  // Reverse map: name → username (for display purposes we store usernames)
  const usernameMap = {}
  users.forEach((u) => { usernameMap[u.name] = u.username })

  useEffect(() => {
    if (issue) {
      setForm({
        category: issue.category || 'Kitchen',
        status: issue.status || 'Pending',
        riskLevel: String(issue.riskLevel || '1'),
        dateAdded: issue.dateAdded || '',
        dateResolved: issue.dateResolved || '',
        notes: issue.notes || '',
        accountableList: parseUsernames(issue.accountable),
      })
    }
  }, [issue])

  if (!issue || !form) return null

  const allImages = [
    ...(issue.image ? [issue.image] : []),
    ...(issue.images || []),
  ].filter(Boolean)

  const days = daysSince(form.dateAdded)

  function toggleAccountable(username) {
    setForm((f) => {
      const list = f.accountableList.includes(username)
        ? f.accountableList.filter((u) => u !== username)
        : [...f.accountableList, username]
      return { ...f, accountableList: list }
    })
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateIssue(issue.id, {
        category: form.category,
        status: form.status,
        riskLevel: form.riskLevel,
        dateAdded: form.dateAdded,
        dateResolved: form.dateResolved,
        notes: form.notes,
        accountable: form.accountableList.join('/'),
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

          {/* Dark header */}
          <div className={styles.header}>
            <div className={styles.headerText}>
              <span className={styles.headerTitle}>{issue.issue}</span>
              <span className={styles.headerSub}>{issue.category}</span>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>

          {/* Body */}
          <div className={styles.body}>

            {/* Row 1: Category | Status | Risk Level */}
            <div className={styles.metaGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Category</span>
                <select
                  className={styles.fieldSelect}
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Status</span>
                <span className={`${styles.statusBadge} ${form.status === 'Resolved' ? styles.statusResolved : styles.statusPending}`}>
                  {form.status}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Risk Level</span>
                <div className={styles.riskToggle}>
                  {['1','2','3'].map((lvl) => {
                    const label = lvl === '1' ? 'Low' : lvl === '2' ? 'Medium' : 'High'
                    const btnCls = lvl === '1' ? styles.riskBtnLow : lvl === '2' ? styles.riskBtnMedium : styles.riskBtnHigh
                    return (
                      <button
                        key={lvl}
                        type="button"
                        className={`${styles.riskBtn} ${btnCls} ${form.riskLevel === lvl ? styles.active : ''}`}
                        onClick={() => set('riskLevel', lvl)}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: Date Added | Date Resolved | Days Open */}
            <div className={styles.metaGrid2}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Date Added</span>
                <input
                  className={styles.fieldDate}
                  type="date"
                  value={form.dateAdded}
                  onChange={(e) => set('dateAdded', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Date Resolved</span>
                <input
                  className={styles.fieldDate}
                  type="date"
                  value={form.dateResolved}
                  onChange={(e) => set('dateResolved', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Days Open</span>
                <span className={styles.daysValue}>
                  {days !== null ? `${days} days` : '—'}
                </span>
              </div>
            </div>

            {/* Accountable — editable */}
            <div>
              <div className={styles.sectionLabel}>Accountable Person</div>
              <div className={styles.accountableField}>
                <div className={styles.namePills} style={{ marginBottom: users.length ? 'var(--space-2)' : 0 }}>
                  {form.accountableList.length > 0
                    ? form.accountableList.map((username, i) => (
                        <span
                          key={i}
                          className={`${styles.namePill} ${styles.namePillActive}`}
                          onClick={() => toggleAccountable(username)}
                          title="Click to remove"
                        >
                          {userMap[username] || username} ×
                        </span>
                      ))
                    : <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No one assigned</span>
                  }
                </div>
                {users.length > 0 && (
                  <div className={styles.userPickerRow}>
                    {users.map((u) => {
                      const selected = form.accountableList.includes(u.username)
                      return (
                        <button
                          key={u.id}
                          type="button"
                          className={`${styles.userChip} ${selected ? styles.userChipSelected : ''}`}
                          onClick={() => toggleAccountable(u.username)}
                        >
                          {u.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {issue.description && (
              <div>
                <div className={styles.sectionLabel}>Description</div>
                <div className={styles.descBox}>
                  <p className={styles.descText}>{issue.description}</p>
                </div>
              </div>
            )}

            {/* Photos */}
            {allImages.length > 0 && (
              <div className={styles.photosSection}>
                <div className={styles.sectionLabel}>Photos ({allImages.length})</div>
                <div className={styles.photoGrid}>
                  {allImages.map((src, i) => (
                    <div
                      key={i}
                      className={styles.photoThumb}
                      onClick={() => setLightbox(src)}
                    >
                      <img src={src} alt={`photo-${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div className={styles.sectionLabel}>Notes</div>
              <textarea
                className={styles.notesArea}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Add notes, updates, or follow-up actions..."
              />
            </div>

          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt="full" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
