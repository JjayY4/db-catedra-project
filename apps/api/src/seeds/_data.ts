import type { CoverageType, BloodType } from '@project/db/src/schema/enums'

export const FIRST_NAMES = [
  'María', 'José', 'Ana', 'Luis', 'Carmen', 'Carlos', 'Sofía', 'Miguel',
  'Laura', 'Diego', 'Patricia', 'Roberto', 'Lucía', 'Andrés', 'Elena',
  'Fernando', 'Gabriela', 'Ricardo', 'Isabel', 'Javier', 'Beatriz',
  'Pablo', 'Verónica', 'Hugo', 'Adriana',
] as const

export const LAST_NAMES = [
  'García', 'Martínez', 'López', 'Rodríguez', 'Hernández', 'Pérez', 'González',
  'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz',
  'Cruz', 'Reyes', 'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ruiz',
  'Álvarez', 'Mendoza', 'Vargas', 'Castro',
] as const

export const COVERAGE_TYPES: CoverageType[] = [
  'basic', 'complete', 'dental', 'vision', 'comprehensive',
]

export const BLOOD_TYPES: BloodType[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]

export const INSURER_NAMES = [
  'Seguros Médicos del Pacífico', 'Asisa Salud', 'MAPFRE Vida', 'Sanitas Internacional',
  'BUPA Latinoamérica', 'AXA Salud', 'Allianz Care', 'Cigna Global',
  'MetLife Salud', 'Pan American Life', 'Médica Sur', 'Salud Total',
  'Coomeva EPS', 'Sura Salud', 'Colsanitas', 'Compensar EPS',
  'Famisanar', 'Nueva EPS', 'Salud Mía', 'Mutual de Seguros',
  'La Centro Americana', 'Aseguradora Popular', 'Aseguradora Suiza', 'SISA Seguros', 'ASSA Seguros',
] as const

export const DIAGNOSES = [
  { dx: 'Hipertensión arterial esencial (I10)',  tx: 'Losartán 50mg cada 24h; dieta hiposódica; control en 30 días.' },
  { dx: 'Influenza estacional (J11)',            tx: 'Reposo, hidratación, paracetamol 500mg cada 8h por 5 días.' },
  { dx: 'Diabetes mellitus tipo 2 (E11)',        tx: 'Metformina 850mg cada 12h; control glucémico semanal.' },
  { dx: 'Faringoamigdalitis aguda (J03)',        tx: 'Amoxicilina 500mg cada 8h por 7 días; ibuprofeno PRN.' },
  { dx: 'Gastroenteritis aguda (A09)',           tx: 'Suero oral; dieta blanda; loperamida si persiste >24h.' },
] as const

export const PRESENTED_SYMPTOMS = [
  'Cefalea',
  'Fiebre y malestar general',
  'Tos seca',
  'Dolor torácico leve',
  'Náuseas y vómito',
] as const

export const BOOKING_REASONS = [
  'Control rutinario',
  'Dolor abdominal persistente',
  'Renovación de receta',
  'Chequeo de presión arterial',
  'Síntomas gripales',
] as const

// 25 fixed DUIs (10-char format: 8 digits + dash + 1 digit)
export const DUIS: string[] = Array.from({ length: 25 }, (_, i) => {
  const base = String(10000000 + i * 11).padStart(8, '0')
  const checksum = String(i % 10)
  return `${base}-${checksum}`
})

// 25 user role distribution: 12 patients, 8 doctors, 5 receptionists
export const ROLE_SEQUENCE: Array<'patient' | 'doctor' | 'receptionist'> = [
  ...Array<'patient'>(12).fill('patient'),
  ...Array<'doctor'>(8).fill('doctor'),
  ...Array<'receptionist'>(5).fill('receptionist'),
]
