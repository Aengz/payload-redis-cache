import { NextFunction, Response } from 'express'
import { isNil } from 'lodash'
import payload from 'payload'
import { PayloadRequest } from 'payload/types'
import { extractToken, getTokenPayload } from '../adapters'
import { getCacheItem } from '../helpers'

export const cacheMiddleware =
  (collection: string) => async (req: PayloadRequest, res: Response, next: NextFunction) => {
    // try to match the cache and return immediately
    const {
      originalUrl,
      headers: { cookie }
    } = req

    // check if there is a cookie and extract data
    if (cookie) {
      const token = extractToken(cookie)
      if (token) {
        const tokenData = getTokenPayload(token)
        const { id: userId, collection: tokenCollection = '' } = tokenData

        // if collection is PUBLIC_USERS only fetch user data
        if (!isNil(tokenData) && tokenCollection === collection) {
          // TODO set the SHA1 of all flattened baged into JWT to prevent the queries below to run
          const user = await payload.findByID({
            id: userId,
            collection
          })

          if (user) {
            // Try to get the cached item, check if ACL is needed
            const cacheData = await getCacheItem(originalUrl)
            if (cacheData) {
              return res.json(cacheData)
            }
          }
        }
      }
    }

    // route to controllers
    return next()
  }
