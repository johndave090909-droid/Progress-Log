import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './config'

const SESSION_KEY = 'guardiancheck_user'

export async function loginUser(username, password) {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error('Invalid username or password.')
  }

  const docSnap = snapshot.docs[0]
  const data = docSnap.data()

  if (data.password !== password) {
    throw new Error('Invalid username or password.')
  }

  const user = {
    uid: docSnap.id,
    name: data.name,
    role: data.role,
    username: data.username,
    mustChangePassword: data.mustChangePassword ?? false,
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
