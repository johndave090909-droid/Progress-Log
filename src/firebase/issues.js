import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './config'
import { hawaiiToday } from '@/utils/date'

const COL = 'kitchen_issues'

export function subscribeToIssues(onData, onError) {
  return onSnapshot(
    collection(db, COL),
    (snap) => {
      const issues = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''))
      onData(issues)
    },
    (err) => onError && onError(err)
  )
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
    dateAdded: hawaiiToday(),
  })
}

export async function updateIssue(id, data) {
  return updateDoc(doc(db, COL, id), data)
}

export async function resolveIssue(id) {
  return updateDoc(doc(db, COL, id), {
    status: 'Resolved',
    dateResolved: hawaiiToday(),
  })
}

export async function deleteIssue(id) {
  return deleteDoc(doc(db, COL, id))
}
