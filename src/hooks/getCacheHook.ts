import { Response } from 'express'
import { first } from 'lodash'
import { CollectionBeforeOperationHook, PayloadRequest } from 'payload/types'
import { IRedisContext } from '../adapters'
import { getCacheItem } from '../helpers'

export const getCacheHook =
  (redisContext: IRedisContext): CollectionBeforeOperationHook =>
  async ({ args, operation }) => {
    const req = args.req as PayloadRequest
    const res = args.res as Response
    const { originalUrl } = req

    if (['read'].includes(operation)) {
      const splitted = first(originalUrl.split('?')) // TODO check depth ecc, create fallbacks...

      const cached = await getCacheItem(redisContext, splitted)
      if (cached) {
        return res.send(cached) // TODO find another solution! There is not any res
      }
    }

    return args
  }
