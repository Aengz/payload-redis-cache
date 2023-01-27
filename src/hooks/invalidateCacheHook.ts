import { CollectionAfterChangeHook } from 'payload/types'
import { publishInvalidateCache } from '../events'

export const invalidateCacheHook: CollectionAfterChangeHook = ({ doc }) => {
  // invalidate cache
  publishInvalidateCache({})
  return doc
}
