import { crypto } from './crypto'
import { logger } from './logger'
import { redisContext } from './redis'

export const generateCacheHash = (userCollection: string, requestedUrl: string): string => {
  const requestUrlAndUserCollection = `${userCollection}-${requestedUrl}`
  const pathHash = crypto.createHash('sha256').update(requestUrlAndUserCollection).digest('hex')
  const namespace = redisContext.getNamespace()
  return `${namespace}:${pathHash}`
}

export const getCacheItem = async (
  userCollection: string,
  requestedUrl: string
): Promise<string | null> => {
  const redisClient = redisContext.getRedisClient()
  if (!redisClient) {
    logger.info(`Unable to get cache for ${requestedUrl}`)
    return null
  }

  const hash = generateCacheHash(userCollection, requestedUrl)
  const jsonData = await redisClient.GET(hash)
  if (!jsonData) {
    logger.info(`<< Get Cache [MISS] - URL:[${requestedUrl}] User:[${userCollection}]`)
    return null
  }
  logger.info(`<< Get Cache [OK] - URL:[${requestedUrl}] User:[${userCollection}]`)
  return jsonData
}

export const setCacheItem = <T>(
  userCollection: string,
  requestedUrl: string,
  paginatedDocs: T
): void => {
  const redisClient = redisContext.getRedisClient()
  if (!redisClient) {
    logger.info(`Unable to set cache for ${requestedUrl}`)
    return
  }

  const hash = generateCacheHash(userCollection, requestedUrl)
  logger.info(`>> Set Cache Item - URL:[${requestedUrl}] User:[${userCollection}]`)

  try {
    const data = JSON.stringify(paginatedDocs)
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
