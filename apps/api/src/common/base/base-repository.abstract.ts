import type { TxClient } from '@project/db/src/client'

export abstract class IBaseRepository<TEntity, TId = string> {
  abstract findById(id: TId, tx: TxClient): Promise<TEntity | null>
}
