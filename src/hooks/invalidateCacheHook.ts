import { CollectionAfterDeleteHook } from 'payload/types'
import { invalidateCache } from '../adapters/cacheHelpers'

/* Explicit type as CollectionAfterChangeHook | GlobalAfterChangeHook
   can lead to a type error in the payload configuration. */
export const invalidateCacheAfterChangeHook = ({ doc }) => {
  // invalidate cache
  invalidateCache()
  return doc
}

export const invalidateCacheAfterDeleteHook: CollectionAfterDeleteHook = ({ doc }) => {
  // invalidate cache
  invalidateCache()
  return doc
}
