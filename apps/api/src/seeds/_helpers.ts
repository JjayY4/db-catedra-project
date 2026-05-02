export const fmtDate = (d: Date): string => d.toISOString().slice(0, 10)

export const fmtTime = (h: number, m = 0): string =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`

export const addDays = (base: Date, days: number): Date => {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

export const today = (): Date => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const SEED_PASSWORD = 'password123'

export const ROW_COUNT = 25

// Strip accents and lowercase for safe email-local-part use.
export const slug = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
