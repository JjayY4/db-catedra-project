import { IBaseRepository } from '~/common/base/base-repository.abstract'
import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { IScheduleEvent } from '../entities/schedule-event.entity'

export abstract class IScheduleEventsRepository extends IBaseRepository<IScheduleEvent> {
  abstract findAvailable: RepositoryMethod<[dateFrom: string, dateTo: string], IScheduleEvent[]>
}
