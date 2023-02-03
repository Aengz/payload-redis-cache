import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload/types'
import { invalidateCache } from '../adapters/cacheHelpers'

export const invalidateCacheAfterChangeHook: CollectionAfterChangeHook = ({ doc }) => {
  // invalidate cache
  invalidateCache()
  return doc
}

export const invalidateCacheAfterDeleteHook: CollectionAfterDeleteHook = ({ doc }) => {
  // invalidate cache
  invalidateCache()
  return doc
}
