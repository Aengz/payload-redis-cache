import { CollectionAfterReadHook, PayloadRequest } from 'payload/types'
import { setCacheItem } from '../helpers'
import { DEFAULT_USER_COLLECTION } from '../types'

// internal user lookup has a cookie but not an user
export const isInternalLookup = (req: PayloadRequest) => {
  const {
    headers: { cookie },
    user
  } = req
  return !user && cookie
}

export const upsertCacheHook: CollectionAfterReadHook = ({ doc, req }) => {
  const { originalUrl, user } = req
  const userCollection = user ? user.collection : DEFAULT_USER_COLLECTION

  // Keep the original URL no split needed
  if (!isInternalLookup(req)) {
    setCacheItem(userCollection, originalUrl, doc)
  }
  return doc
}
