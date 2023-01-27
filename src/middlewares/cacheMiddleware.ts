import { NextFunction, Response } from 'express'
import { PayloadRequest } from 'payload/types'
import { getCacheItem, getCollectionName, setCacheItem } from '../adapters/cacheHelpers'
import { extractToken, getTokenPayload } from '../adapters/jwtHelpers'
import { DEFAULT_USER_COLLECTION } from '../types'

export const cacheMiddleware =
  (includedCollections: string[], includedGlobals: string[], apiBaseUrl: string) =>
  async (req: PayloadRequest, res: Response, next: NextFunction) => {
    // try to match the cache and return immediately
    const {
      originalUrl,
      headers: { cookie }
    } = req

    const entityName = getCollectionName(apiBaseUrl, originalUrl)

    // If the collection name cannot be detected or the method is not "GET" then call next()
    const useCache =
      includedCollections.includes(entityName) || !includedGlobals.includes(entityName)

    if (!entityName || !useCache || req.method !== 'GET') {
      return next()
    }

    let userCollection: string = DEFAULT_USER_COLLECTION
    // check if there is a cookie and extract data
    if (cookie) {
      const token = extractToken(cookie)
      if (token) {
        const tokenData = getTokenPayload(token)
        userCollection = tokenData.collection
      }
    }

    // TODO find a better way
    const json = res.json
    res.json = (body) => {
      res.json = json
      setCacheItem(userCollection, originalUrl, body)
      return res.json(body)
    }

    // Try to get the cached item
    const cacheData = await getCacheItem(userCollection, originalUrl)
    if (cacheData) {
      return res.setHeader('Content-Type', 'application/json').send(cacheData)
    }
    // route to controllers
    return next()
  }
