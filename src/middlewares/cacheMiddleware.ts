import { NextFunction, Response } from 'express'
import { PayloadRequest } from 'payload/types'
import { getCacheItem, setCacheItem } from '../adapters/cacheHelpers'
import { extractToken, getTokenPayload } from '../adapters/jwtHelpers'
import { cacheMiddlewareArgs, DEFAULT_USER_COLLECTION } from '../types'
import { canUseCache } from './helpers'

export const cacheMiddleware =
  ({ includedCollections, includedGlobals, includedPaths, apiBaseUrl }: cacheMiddlewareArgs) =>
  async (req: PayloadRequest, res: Response, next: NextFunction) => {
    // try to match the cache and return immediately
    const {
      originalUrl,
      headers: { cookie, authorization = '' }
    } = req

    // If the collection name cannot be detected or the method is not "GET" then call next()
    const useCache = canUseCache({
      apiBaseUrl,
      originalUrl,
      includedCollections,
      includedGlobals,
      includedPaths
    })

    if (!useCache || req.method !== 'GET') {
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
      setCacheItem({
        userCollection,
        requestedUrl: originalUrl,
        body,
        authorization
      })
      return res.json(body)
    }

    // Try to get the cached item
    const cacheData = await getCacheItem({
      userCollection,
      requestedUrl: originalUrl,
      authorization
    })
    if (cacheData) {
      return res.setHeader('Content-Type', 'application/json').send(cacheData)
    }
    // route to controllers
    return next()
  }
