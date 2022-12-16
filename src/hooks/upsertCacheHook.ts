import { CollectionAfterChangeHook } from 'payload/types'
import { invalidateCache, setCacheItem } from '../adapters'

export const upsertCacheHook =
  (redisUrl: string): CollectionAfterChangeHook =>
  ({ doc, req }) => {
    const { originalUrl } = req
    console.log('upsert cache')

    // invalidate cache
    invalidateCache(redisUrl)
    // set new cache
    setCacheItem(redisUrl, originalUrl, doc)
  }
