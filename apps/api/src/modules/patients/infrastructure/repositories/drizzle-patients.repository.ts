import { injectable } from 'inversify'
import { asc, count, eq } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { Patients } from '@project/db/src/schema/patients.schema'
import type { MedicalInsurance } from '@project/db/src/schema/medical-insurances.schema'
import { IPatientsRepository } from '../../domain/interfaces/patients.repository'
import type { IPatient } from '../../domain/entities/patient.entity'
import type { CompleteProfileInput } from '../../application/dtos/inputs/complete-profile.input'

type PatientRow = typeof Patients.$inferSelect & {
  medicalRecord?: { id: string } | null
  insurance?:     Pick<MedicalInsurance, 'insurerName' | 'coverageType'> | null
}

function toEntity(row: PatientRow): IPatient {
  return {
    dui:               row.dui,
    userId:            row.userId,
    firstName:         row.firstName,
    lastName:          row.lastName,
    whatsappPhone:     row.whatsappPhone,
    birthDate:         row.birthDate,
    insuranceId:       row.insuranceId,
    recordId:          row.medicalRecord?.id ?? null,
    insuranceName:     row.insurance?.insurerName ?? null,
    insuranceCoverage: row.insurance?.coverageType ?? null,
  }
}

@injectable()
export class DrizzlePatientsRepository extends IPatientsRepository {
  findById = async (dui: string, tx: TxClient): Promise<IPatient | null> => {
    const row = await tx.query.Patients.findFirst({
      where: eq(Patients.dui, dui),
      with:  { insurance: true },
    })
    return row ? toEntity(row) : null
  }

  findByUserId = async (userId: string, tx: TxClient): Promise<IPatient | null> => {
    const row = await tx.query.Patients.findFirst({
      where: eq(Patients.userId, userId),
      with:  { insurance: true },
    })
    return row ? toEntity(row) : null
  }

  findAll = async (tx: TxClient): Promise<IPatient[]> => {
    const rows = await tx.query.Patients.findMany({
      with: { medicalRecord: true, insurance: true },
    })
    return rows.map(toEntity)
  }

  findPaginated = async (page: number, pageSize: number, tx: TxClient): Promise<{ items: IPatient[]; total: number }> => {
    const offset = (page - 1) * pageSize
    const [rows, [{ value: total }]] = await Promise.all([
      tx.query.Patients.findMany({
        with:    { medicalRecord: true, insurance: true },
        orderBy: (p) => [asc(p.lastName), asc(p.firstName)],
        limit:   pageSize,
        offset,
      }),
      tx.select({ value: count() }).from(Patients),
    ])
    return { items: rows.map(toEntity), total }
  }

  create = async (input: CompleteProfileInput, userId: string, tx: TxClient): Promise<IPatient> => {
    const [row] = await tx.insert(Patients).values({
      dui:           input.dui,
      userId,
      firstName:     input.firstName,
      lastName:      input.lastName,
      whatsappPhone: input.whatsapp,
      birthDate:     input.birthDate,
      insuranceId:   input.insuranceId ?? null,
    }).returning()

    const withInsurance = await tx.query.Patients.findFirst({
      where: eq(Patients.dui, row!.dui),
      with:  { insurance: true },
    })
    return toEntity(withInsurance!)
  }

  linkUser = async (dui: string, userId: string, tx: TxClient): Promise<IPatient> => {
    await tx.update(Patients).set({ userId }).where(eq(Patients.dui, dui))
    const row = await tx.query.Patients.findFirst({
      where: eq(Patients.dui, dui),
      with:  { insurance: true },
    })
    return toEntity(row!)
  }
}
