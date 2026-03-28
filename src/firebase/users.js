import { collection, doc, addDoc, getDocs, deleteDoc, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from './config'

export async function getAllUsers() {
  const q = query(collection(db, 'users'), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addUser(data) {
  await addDoc(collection(db, 'users'), data)
}

export async function deleteUser(id) {
  await deleteDoc(doc(db, 'users', id))
}

export async function updateUser(id, data) {
  await updateDoc(doc(db, 'users', id), data)
}
