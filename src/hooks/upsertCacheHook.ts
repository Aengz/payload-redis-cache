import { CollectionAfterChangeHook } from 'payload/types'
import { invalidateCache, setCacheItem } from '../helpers'

export const upsertCacheHook: CollectionAfterChangeHook = ({ doc, req }) => {
  const { originalUrl } = req
  // invalidate cache
  invalidateCache()

  // Keep the original URL no split needed
  setCacheItem(originalUrl, doc)
}
