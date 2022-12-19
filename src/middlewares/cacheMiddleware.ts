import { NextFunction, Response } from 'express'
import { PayloadRequest } from 'payload/types'
import { extractToken, getTokenPayload } from '../adapters'
import { getCacheItem } from '../helpers'
import { DEFAULT_USER_COLLECTION } from '../types'

export const cacheMiddleware = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  // try to match the cache and return immediately
  const {
    originalUrl,
    headers: { cookie }
  } = req

  let userCollection: string = DEFAULT_USER_COLLECTION

  // check if there is a cookie and extract data
  if (cookie) {
    const token = extractToken(cookie)
    if (token) {
      const tokenData = getTokenPayload(token)
      userCollection = tokenData.collection
    }
  }

  // Try to get the cached item
  const cacheData = await getCacheItem(userCollection, originalUrl)
  if (cacheData) {
    return res.json(cacheData)
  }

  // route to controllers
  return next()
}
