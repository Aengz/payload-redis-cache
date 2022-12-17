import { Response } from 'express'
import { CollectionBeforeOperationHook, PayloadRequest } from 'payload/types'
import { getCacheItem } from '../adapters'

export const getCacheHook =
  (redisUrl: string): CollectionBeforeOperationHook =>
  async ({ args, operation }) => {
    const req = args.req as PayloadRequest
    const res = args.res as Response
    const { originalUrl } = req

    if (['read'].includes(operation)) {
      const cached = await getCacheItem(redisUrl, originalUrl)
      if (cached) {
        return res.send(cached)
      }
    }

    return args
  }
