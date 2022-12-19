import { first } from 'lodash'
import { CollectionAfterChangeHook } from 'payload/types'
import { IRedisContext } from '../adapters'
import { invalidateCache, setCacheItem } from '../helpers'

export const upsertCacheHook =
  (redisContext: IRedisContext): CollectionAfterChangeHook =>
  ({ doc, req }) => {
    const { originalUrl } = req
    // invalidate cache
    invalidateCache(redisContext)

    const splitted = first(originalUrl.split('?')) // TODO check depth ecc...

    // set new cache
    setCacheItem(redisContext, splitted, doc)
  }
