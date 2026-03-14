import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { updateUser } from '@/firebase/users'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import styles from './AdminPage.module.css'

const ROLES = ['Admin', 'Lead', 'Office Admin']

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function RoleBadge({ role }) {
  const cls =
    role === 'Admin' ? styles.roleAdmin
    : role === 'Lead' ? styles.roleLead
    : styles.roleOffice
  return <span className={`${styles.roleBadge} ${cls}`}>{role}</span>
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function EditModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.name || '',
    role: user.role || 'Office Admin',
    newPassword: '',
    mustChangePassword: user.mustChangePassword || false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError('')
    try {
      const data = {
        name: form.name.trim(),
        role: form.role,
        mustChangePassword: form.mustChangePassword,
      }
      if (form.newPassword.trim()) {
        data.password = form.newPassword.trim()
      }
      await updateUser(user.id, data)
      onSaved()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalAvatar}>{getInitials(form.name)}</div>
          <div>
            <div className={styles.modalTitle}>Edit User</div>
            <div className={styles.modalSub}>{user.username}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Full Name</label>
            <input
              className={styles.fieldInput}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Role</label>
            <div className={styles.roleOptions}>
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.roleOption} ${form.role === r ? styles.roleOptionActive : ''} ${
                    r === 'Admin' ? styles.roleOptionAdmin
                    : r === 'Lead' ? styles.roleOptionLead
                    : styles.roleOptionOffice
                  }`}
                  onClick={() => set('role', r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>New Password <span className={styles.optional}>(leave blank to keep current)</span></label>
            <input
              className={styles.fieldInput}
              type="password"
              placeholder="Enter new password…"
              value={form.newPassword}
              onChange={(e) => set('newPassword', e.target.value)}
            />
          </div>

          <div className={styles.checkRow}>
            <input
              id="mustChange"
              type="checkbox"
              checked={form.mustChangePassword}
              onChange={(e) => set('mustChangePassword', e.target.checked)}
            />
            <label htmlFor="mustChange">Require password change on next login</label>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { users, loading, reload } = useUsers()
  const [editing, setEditing] = useState(null)

  if (loading) return <LoadingSpinner />

  const admins = users.filter((u) => u.role === 'Admin')
  const leads = users.filter((u) => u.role === 'Lead')
  const officeAdmins = users.filter((u) => u.role === 'Office Admin')

  function handleSaved() {
    setEditing(null)
    reload()
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Admin Panel</h1>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>All Users</span>
          <span className={styles.count}>{users.length} total</span>
        </div>

        {/* Desktop table */}
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Password Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={styles.clickableRow} onClick={() => setEditing(u)}>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{getInitials(u.name)}</div>
                      <div>
                        <div className={styles.nameText}>{u.name}</div>
                        <div className={styles.emailText}>{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <span className={`${styles.pwTag} ${u.mustChangePassword ? styles.pwPending : styles.pwSet}`}>
                      {u.mustChangePassword ? 'Must Change' : 'Set'}
                    </span>
                  </td>
                  <td><span className={styles.joinDate}>{formatDate(u.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className={styles.userCards}>
          {users.map((u) => (
            <div key={u.id} className={styles.userCard} onClick={() => setEditing(u)}>
              <div className={styles.avatar}>{getInitials(u.name)}</div>
              <div className={styles.userCardBody}>
                <div className={styles.userCardName}>{u.name}</div>
                <div className={styles.userCardEmail}>{u.username}</div>
                <div className={styles.userCardMeta}>
                  <RoleBadge role={u.role} />
                  <span className={`${styles.pwTag} ${u.mustChangePassword ? styles.pwPending : styles.pwSet}`}>
                    {u.mustChangePassword ? 'Must Change PW' : 'PW Set'}
                  </span>
                </div>
              </div>
              <span className={styles.editHint}>Edit</span>
            </div>
          ))}
        </div>
      </div>

      {/* Role summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
        {[
          { label: 'Admins', count: admins.length, color: '#fce4ec', textColor: '#880e4f' },
          { label: 'Leads', count: leads.length, color: '#e3f2fd', textColor: '#0d47a1' },
          { label: 'Office Admins', count: officeAdmins.length, color: '#f3e5f5', textColor: '#4a148c' },
        ].map(({ label, count, color, textColor }) => (
          <div key={label} style={{
            background: color,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}>
            <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: textColor }}>{count}</span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: textColor, opacity: 0.8 }}>{label}</span>
          </div>
        ))}
      </div>

      {editing && (
        <EditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
