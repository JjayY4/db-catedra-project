import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { ISlotCandidate } from '../entities/slot-candidate.entity'

export abstract class IScheduleEventsRepository {
  abstract findOverlappingKeys: RepositoryMethod<[candidates: ISlotCandidate[]], Set<string>>
  abstract bulkInsert:          RepositoryMethod<[candidates: ISlotCandidate[], auditUserId: string], void>
}
