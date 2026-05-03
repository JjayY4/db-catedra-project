import { sql } from 'drizzle-orm'
import { db } from '@project/db/src/client'
import { Users } from '@project/db/src/schema/iam.schema'
import { Patients } from '@project/db/src/schema/patients.schema'
import { MedicalInsurances } from '@project/db/src/schema/medical-insurances.schema'
import { MedicalRecords } from '@project/db/src/schema/medical-records.schema'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { MedicalAppointments } from '@project/db/src/schema/medical-appointments.schema'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { seedUsers } from './users.seed'
import { seedMedicalInsurances } from './medical-insurances.seed'
import { seedPatients } from './patients.seed'
import { seedScheduleEvents } from './schedule-events.seed'
import { seedMedicalAppointments } from './medical-appointments.seed'
import { seedClinicalConsultations } from './clinical-consultations.seed'

async function alreadySeeded(): Promise<boolean> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(Users)
  return Number(count) > 0
}

async function reportCounts(): Promise<void> {
  const tables = [
    { name: 'MedicalInsurances',    table: MedicalInsurances },
    { name: 'Users',                table: Users },
    { name: 'Patients',             table: Patients },
    { name: 'MedicalRecords',       table: MedicalRecords },
    { name: 'ScheduleEvents',       table: ScheduleEvents },
    { name: 'MedicalAppointments',  table: MedicalAppointments },
    { name: 'ClinicalConsultations', table: ClinicalConsultations },
  ]
  console.log('\nFinal row counts:')
  for (const { name, table } of tables) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(table)
    const ok = Number(count) === 25 ? '✓' : '✗'
    console.log(`  ${ok} ${name.padEnd(22)} ${count}`)
  }
}

async function main() {
  console.log('Seeding database...\n')

  if (await alreadySeeded()) {
    console.log('Users table already populated — aborting (run `docker compose down -v` first).')
    process.exit(1)
  }

  // Phase 1: Better Auth signup (commits per user, must run outside the tx).
  const users = await seedUsers()

  // Phase 2: domain data inside one transaction.
  await db.transaction(async (tx) => {
    const insurances   = await seedMedicalInsurances(tx)
    await seedPatients(tx, users, insurances)
    const events       = await seedScheduleEvents(tx, users)
    const appointments = await seedMedicalAppointments(tx, events)
    await seedClinicalConsultations(tx, appointments)
  })

  await reportCounts()
  console.log('\n✓ Seed completed.')
  process.exit(0)
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err)
  process.exit(1)
})
