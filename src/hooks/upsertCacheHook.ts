import { CollectionAfterChangeHook } from 'payload/types'
import { invalidateCache, setCacheItem } from '../helpers'
import { DEFAULT_USER_COLLECTION } from '../types'

export const upsertCacheHook: CollectionAfterChangeHook = ({ doc, req }) => {
  const { originalUrl, user } = req
  const userCollection = user ? user.collection : DEFAULT_USER_COLLECTION
  // invalidate cache
  invalidateCache()

  // Keep the original URL no split needed
  setCacheItem(userCollection, originalUrl, doc)
}
