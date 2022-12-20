import { CollectionAfterChangeHook } from 'payload/types'
import { invalidateCache } from '../helpers'

export const invalidateCacheHook: CollectionAfterChangeHook = ({ doc }) => {
  // invalidate cache
  invalidateCache()
  return doc
}
