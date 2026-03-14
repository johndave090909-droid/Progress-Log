import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

const COL = 'kitchen_issues'

export function subscribeToIssues(callback) {
  const q = query(collection(db, COL), orderBy('dateAdded', 'desc'))
  return onSnapshot(q, (snap) => {
    const issues = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(issues)
  })
}

export async function getIssueById(id) {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) throw new Error('Issue not found.')
  return { id: snap.id, ...snap.data() }
}

export async function addIssue(data) {
  return addDoc(collection(db, COL), {
    ...data,
    status: 'Pending',
    dateAdded: new Date().toISOString().slice(0, 10),
  })
}

export async function updateIssue(id, data) {
  return updateDoc(doc(db, COL, id), data)
}

export async function resolveIssue(id) {
  return updateDoc(doc(db, COL, id), {
    status: 'Resolved',
    dateResolved: new Date().toISOString().slice(0, 10),
  })
}

export async function deleteIssue(id) {
  return deleteDoc(doc(db, COL, id))
}
