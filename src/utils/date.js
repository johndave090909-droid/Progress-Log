// Hawaii is always UTC-10, no daylight saving time.
// Use manual offset instead of IANA name to avoid browser timezone DB issues.
const HST_MS = -10 * 60 * 60 * 1000

function nowHST() {
  return new Date(Date.now() + HST_MS)
}

/** Returns today's date in Hawaii as YYYY-MM-DD */
export function hawaiiToday() {
  const d = nowHST()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns the start of the current week (Sunday) in Hawaii as YYYY-MM-DD */
export function hawaiiWeekStart() {
  const d = nowHST()
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns current hour (0-23) in Hawaii */
export function hawaiiHour() {
  return nowHST().getUTCHours()
}

/** Formats a YYYY-MM-DD string for display (e.g. "Mar 13, 2026") */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

/** Formats today's full date for the header (e.g. "Friday, Mar 13, 2026") */
export function hawaiiFullDate() {
  const d = nowHST()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}
