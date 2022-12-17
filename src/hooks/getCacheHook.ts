import { CollectionBeforeOperationHook, PayloadRequest } from 'payload/types'
import { getCacheItem } from '../adapters'

export const getCacheHook =
  (redisUrl: string): CollectionBeforeOperationHook =>
  ({ args, operation }) => {
    const req = args.req as PayloadRequest
    const { originalUrl } = req

    if (['read'].includes(operation)) {
      getCacheItem(redisUrl, originalUrl)
    }
  }
