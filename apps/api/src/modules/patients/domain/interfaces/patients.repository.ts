import type { TxClient } from '@project/db/src/client'
import { IBaseRepository } from '~/common/base/base-repository.abstract'
import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { IPatient } from '../entities/patient.entity'
import type { CompleteProfileInput } from '../../application/dtos/inputs/complete-profile.input'

export abstract class IPatientsRepository extends IBaseRepository<IPatient, string> {
  abstract findByUserId: RepositoryMethod<[userId: string], IPatient | null>
  abstract create:       (input: CompleteProfileInput, userId: string, tx: TxClient) => Promise<IPatient>
  abstract linkUser:     RepositoryMethod<[dui: string, userId: string], IPatient>
}
