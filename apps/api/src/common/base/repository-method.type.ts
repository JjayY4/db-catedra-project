import type { TxClient } from '@project/db/src/client'

export type RepositoryMethod<TArgs extends unknown[], TReturn> =
  (...args: [...TArgs, tx: TxClient]) => Promise<TReturn>
