import { crypto, initContext, redisContext } from '../adapters'

const CACHE_INDEXES = 'payload-cache-index'

export const generateCacheHash = (userCollection: string, requestedUrl: string): string => {
  const requestUrlAndUserCollection = `${userCollection}-${requestedUrl}`
  const pathHash = crypto.createHash('sha256').update(requestUrlAndUserCollection).digest('hex')
  return `payload:${pathHash}`
}

export const getCacheItem = async (
  userCollection: string,
  requestedUrl: string
): Promise<string | null> => {
  const redisClient = redisContext.getRedisClient()
  if (redisClient) {
    const hash = generateCacheHash(userCollection, requestedUrl)
    const jsonData = await redisClient.GET(hash)
    if (!jsonData) {
      console.log('<< Get Cache [MISS]', requestedUrl, userCollection)
      return null
    }
    console.log('<< Get Cache [OK]', requestedUrl, userCollection)
    return jsonData
  }
  return null
}

export const setCacheItem = <T>(
  userCollection: string,
  requestedUrl: string,
  paginatedDocs: T
): void => {
  const redisClient = redisContext.getRedisClient()
  if (redisClient) {
    const hash = generateCacheHash(userCollection, requestedUrl)
    console.log('>> Set Cache Item', requestedUrl, userCollection)

    try {
      const data = JSON.stringify(paginatedDocs)

      redisClient.SET(hash, data)
      redisClient.SADD(CACHE_INDEXES, hash)
      return
    } catch (e) {
      //
    }
  }

  console.log(`Unable to set cache for ${requestedUrl}`)
}

export const invalidateCache = async (): Promise<void> => {
  const redisClient = redisContext.getRedisClient()
  if (redisClient) {
    const indexes = await redisClient.SMEMBERS(CACHE_INDEXES)
    indexes.forEach((index) => {
      redisClient.DEL(index)
      redisClient.SREM(CACHE_INDEXES, index)
    })
    console.log('Cache Invalidated')
    return
  }
  console.log('Unable to invalidate cache')
}

export const initRedis = (url: string) => {
  initContext(url)
}
