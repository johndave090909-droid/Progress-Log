const TZ = 'America/Honolulu'

/** Returns today's date in Hawaii as YYYY-MM-DD */
export function hawaiiToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Returns the start of the current week (Sunday) in Hawaii as YYYY-MM-DD */
export function hawaiiWeekStart() {
  const now = new Date()
  const day = Number(now.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'short' }) === 'Sun' ? 0 :
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(
      now.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'short' })
    ))
  const d = new Date(now.toLocaleDateString('en-CA', { timeZone: TZ }))
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

/** Returns current hour (0-23) in Hawaii */
export function hawaiiHour() {
  return Number(new Date().toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }))
}

/** Formats a YYYY-MM-DD string for display (e.g. "Mar 13, 2026") */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '—'
  // Parse as local date to avoid UTC offset shifting the day
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

/** Formats today's full date for the header (e.g. "Friday, Mar 13, 2026") */
export function hawaiiFullDate() {
  return new Date().toLocaleDateString('en-US', {
    timeZone: TZ,
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
