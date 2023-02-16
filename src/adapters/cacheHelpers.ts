import { crypto } from './crypto'
import { logger } from './logger'
import { redisContext } from './redis'

interface cacheBaseArgs {
  userCollection: string
  requestedUrl: string
  authorization: string
}

interface cacheExtendedArgs extends cacheBaseArgs {
  body: unknown
}

export const generateCacheHash = ({
  userCollection,
  requestedUrl,
  authorization
}: cacheBaseArgs): string => {
  const requestUrlAndUserCollection = `${userCollection}-${requestedUrl}-${authorization}`
  const pathHash = crypto.createHash('sha256').update(requestUrlAndUserCollection).digest('hex')
  const namespace = redisContext.getNamespace()
  return `${namespace}:${pathHash}`
}

interface generateCacheHashProps {
  userCollection: string
  requestedUrl: string
  authorization: string
}

export const getCacheItem = async ({
  userCollection,
  requestedUrl,
  authorization
}: cacheBaseArgs): Promise<string | null> => {
  const redisClient = redisContext.getRedisClient()
  if (!redisClient) {
    logger.info(`Unable to get cache for ${requestedUrl}`)
    return null
  }

  const hash = generateCacheHash({ userCollection, requestedUrl, authorization })
  const jsonData = await redisClient.GET(hash)
  if (!jsonData) {
    logger.info(`<< Get Cache [MISS] - URL:[${requestedUrl}] User:[${userCollection}]`)
    return null
  }
  logger.info(`<< Get Cache [OK] - URL:[${requestedUrl}] User:[${userCollection}]`)
  return jsonData
}

export const setCacheItem = ({
  userCollection,
  requestedUrl,
  authorization,
  body
}: cacheExtendedArgs): void => {
  const redisClient = redisContext.getRedisClient()
  if (!redisClient) {
    logger.info(`Unable to set cache for ${requestedUrl}`)
    return
  }

  const hash = generateCacheHash({ userCollection, requestedUrl, authorization })
  logger.info(`>> Set Cache Item - URL:[${requestedUrl}] User:[${userCollection}]`)

  try {
    const data = JSON.stringify(body)
    redisClient.SET(hash, data)

    const indexesName = redisContext.getIndexesName()
    redisClient.SADD(indexesName, hash)
  } catch (e) {
    logger.info(`Unable to set cache for ${requestedUrl}`)
  }
}

export const invalidateCache = async (): Promise<void> => {
  const redisClient = redisContext.getRedisClient()
  if (!redisClient) {
    logger.info('Unable to invalidate cache')
    return
  }

  const indexesName = redisContext.getIndexesName()
  const indexes = await redisClient.SMEMBERS(indexesName)
  indexes.forEach((index) => {
    redisClient.DEL(index)
    redisClient.SREM(indexesName, index)
  })

  logger.info('Cache Invalidated')
}
