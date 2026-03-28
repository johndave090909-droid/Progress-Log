import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { addUser, deleteUser, updateUser } from '@/firebase/users'
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
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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

function AddUserModal({ onClose, onSaved, existingUsernames }) {
  const [form, setForm] = useState({
    username: '',
    name: '',
    password: 'Aloha123',
    role: 'Office Admin',
    mustChangePassword: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.username.trim()) { setError('Username is required.'); return }
    if (!form.password.trim()) { setError('Password is required.'); return }
    if (existingUsernames.includes(form.username.trim().toLowerCase())) {
      setError('Username already exists.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await addUser({
        username: form.username.trim(),
        name: form.name.trim() || form.username.trim(),
        password: form.password,
        role: form.role,
        mustChangePassword: form.mustChangePassword,
        createdAt: new Date().toISOString().split('T')[0],
      })
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
          <div className={styles.modalAvatar}>+</div>
          <div>
            <div className={styles.modalTitle}>Add New User</div>
            <div className={styles.modalSub}>Create a new account</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Username <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input
              className={styles.fieldInput}
              value={form.username}
              onChange={(e) => { set('username', e.target.value); setError('') }}
              placeholder="e.g. john.doe"
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Full Name <span className={styles.optional}>(Optional)</span></label>
            <input
              className={styles.fieldInput}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Password <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input
              className={styles.fieldInput}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Set a password"
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

          <div className={styles.checkRow}>
            <input
              id="addMustChange"
              type="checkbox"
              checked={form.mustChangePassword}
              onChange={(e) => set('mustChangePassword', e.target.checked)}
            />
            <label htmlFor="addMustChange">Require password change on next login</label>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ user, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onConfirm()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div className={styles.modalBody} style={{ alignItems: 'center', textAlign: 'center', gap: 'var(--space-4)' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24, color: '#c62828' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <div className={styles.modalTitle}>Delete User</div>
            <div className={styles.modalSub} style={{ marginTop: 4 }}>
              Remove <strong>{user.name || user.username}</strong>? This cannot be undone.
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={deleting}>Cancel</button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '9px var(--space-5)', background: '#c62828', color: 'white',
              border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)',
              fontWeight: 600, cursor: 'pointer', opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { users, loading, reload } = useUsers()
  const [editing, setEditing] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)

  if (loading) return <LoadingSpinner />

  const admins = users.filter((u) => u.role === 'Admin')
  const leads = users.filter((u) => u.role === 'Lead')
  const officeAdmins = users.filter((u) => u.role === 'Office Admin')
  const existingUsernames = users.map((u) => u.username.toLowerCase())

  function handleSaved() {
    setEditing(null)
    setShowAdd(false)
    reload()
  }

  async function handleDeleteConfirm() {
    await deleteUser(deletingUser.id)
    setDeletingUser(null)
    reload()
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Admin Panel</h1>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>All Users</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className={styles.count}>{users.length} total</span>
            <button
              onClick={() => setShowAdd(true)}
              className={styles.saveBtn}
              style={{ padding: '6px 14px', fontSize: 'var(--font-size-xs)' }}
            >
              + Add Person
            </button>
          </div>
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
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setDeletingUser(u)}
                      title="Delete user"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-muted)', padding: '4px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#c62828'; e.currentTarget.style.background = '#ffebee' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} onClick={(e) => e.stopPropagation()}>
                <span className={styles.editHint} onClick={() => setEditing(u)}>Edit</span>
                <button
                  onClick={() => setDeletingUser(u)}
                  title="Delete user"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#ef9a9a', padding: '4px',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
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

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
          existingUsernames={existingUsernames}
        />
      )}

      {editing && (
        <EditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
