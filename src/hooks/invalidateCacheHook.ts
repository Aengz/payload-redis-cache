import { CollectionAfterChangeHook } from 'payload/types'
import { invalidateCache } from '../adapters/cacheHelpers'

export const invalidateCacheHook: CollectionAfterChangeHook = ({ doc }) => {
  // invalidate cache
  invalidateCache()
  return doc
}
