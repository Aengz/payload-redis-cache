import { NextFunction, Response } from 'express'
import { PayloadRequest } from 'payload/types'
import { extractToken, getTokenPayload } from '../adapters'
import { getCacheItem } from '../helpers'
import { DEFAULT_USER_COLLECTION } from '../types'

function hasValidPath(url: string): boolean {
  return url.includes(`/api/`)
}

export const cacheMiddleware = async (req: PayloadRequest, res: Response, next: NextFunction) => {
  // try to match the cache and return immediately
  const {
    originalUrl,
    headers: { cookie }
  } = req

  if (!hasValidPath(originalUrl)) {
    return next()
  }

  let userCollection: string = DEFAULT_USER_COLLECTION
  // check if there is a cookie and extract data
  if (cookie) {
    const token = extractToken(cookie)
    if (token) {
      const tokenData = getTokenPayload(token)
      console.log(tokenData)
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
