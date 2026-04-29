import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { IAgendaItem } from '../entities/agenda-item.entity'

export abstract class IDoctorAgendaRepository {
  abstract getDailyAgenda: RepositoryMethod<[fecha: string], IAgendaItem[]>
}
