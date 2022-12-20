import { CollectionAfterChangeHook } from 'payload/types'
import { invalidateCache } from '../helpers'

export const invalidateCacheHook: CollectionAfterChangeHook = ({ doc, req }) => {
  // invalidate cache
  invalidateCache()
  return doc
}
