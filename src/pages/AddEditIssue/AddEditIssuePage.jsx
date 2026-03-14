import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addIssue, updateIssue, getIssueById } from '@/firebase/issues'
import { useUsers } from '@/hooks/useUsers'
import ImageUploader from '@/components/forms/ImageUploader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import styles from './AddEditIssuePage.module.css'

const CATEGORIES = ['Kitchen', 'Bakery', 'Dry', 'Chill', 'Chiller', 'Equipment']

const EMPTY = {
  issue: '',
  description: '',
  category: 'Kitchen',
  riskLevel: '1',
  accountable: '',
  notes: '',
  images: [],
}

export default function AddEditIssuePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { users } = useUsers()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getIssueById(id)
      .then((data) => {
        setForm({
          issue: data.issue || '',
          description: data.description || '',
          category: data.category || 'Kitchen',
          riskLevel: String(data.riskLevel || '1'),
          accountable: data.accountable || '',
          notes: data.notes || '',
          images: [
            ...(data.image ? [data.image] : []),
            ...(data.images || []),
          ].filter(Boolean),
        })
      })
      .catch(() => setError('Failed to load issue.'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.issue.trim()) {
      setError('Issue title is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const [primary, ...rest] = form.images
      const payload = {
        issue: form.issue.trim(),
        description: form.description,
        category: form.category,
        riskLevel: form.riskLevel,
        accountable: form.accountable,
        notes: form.notes,
        image: primary || '',
        images: rest,
      }
      if (isEdit) {
        await updateIssue(id, payload)
      } else {
        await addIssue(payload)
      }
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className={styles.title}>{isEdit ? 'Edit Issue' : 'Add New Issue'}</h1>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <span className={styles.sectionDivider}>Issue Details</span>

          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Issue Title</label>
            <input
              className={styles.input}
              type="text"
              value={form.issue}
              onChange={(e) => set('issue', e.target.value)}
              placeholder="Describe the issue briefly"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional detailed description..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`}>Category</label>
              <select
                className={styles.select}
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`}>Accountable</label>
              <select
                className={styles.select}
                value={form.accountable}
                onChange={(e) => set('accountable', e.target.value)}
              >
                <option value="">— Select person —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Risk Level</label>
            <div className={styles.riskGroup}>
              {['1', '2', '3'].map((lvl) => (
                <label key={lvl} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    className={`${styles.riskOption} ${styles[`risk${lvl}`]}`}
                    type="radio"
                    name="riskLevel"
                    value={lvl}
                    checked={form.riskLevel === lvl}
                    onChange={() => set('riskLevel', lvl)}
                  />
                  <span className={styles.riskLabel}>
                    {lvl === '1' ? '🟢 Low' : lvl === '2' ? '🟡 Medium' : '🔴 High'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <span className={styles.sectionDivider}>Images</span>

          <ImageUploader
            images={form.images}
            onChange={(imgs) => set('images', imgs)}
          />

          {isEdit && (
            <>
              <span className={styles.sectionDivider}>Resolution Notes</span>
              <div className={styles.field}>
                <label className={styles.label}>Notes</label>
                <textarea
                  className={styles.textarea}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Add resolution notes..."
                />
              </div>
            </>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
