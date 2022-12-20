import { CollectionAfterReadHook } from 'payload/types'
import { setCacheItem } from '../helpers'
import { DEFAULT_USER_COLLECTION } from '../types'

export const upsertCacheHook: CollectionAfterReadHook = ({ doc, req }) => {
  const { originalUrl, user } = req
  const userCollection = user ? user.collection : DEFAULT_USER_COLLECTION

  // Keep the original URL no split needed
  setCacheItem(userCollection, originalUrl, doc)

  return doc
}
