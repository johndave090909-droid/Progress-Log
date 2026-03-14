import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from './config'

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
