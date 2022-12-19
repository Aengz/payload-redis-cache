import { crypto, redisContext } from '../adapters'

const CACHE_INDEXES = 'payload-cache-index'

export const generateCacheHash = (requestedUrl: string): string => {
  const pathHash = crypto.createHash('sha256').update(requestedUrl).digest('hex')
  return `payload:${pathHash}`
}

export const getCacheItem = async (requestedUrl: string): Promise<string | null> => {
  const redisClient = redisContext.getRedisClient()
  if (redisClient) {
    const hash = generateCacheHash(requestedUrl)
    const jsonData = await redisClient.GET(hash)
    if (!jsonData) {
      console.log('<< Get Cache [MISS]', requestedUrl)
      return null
    }
    console.log('<< Get Cache [OK]', requestedUrl)
    return jsonData
  }
  return null
}

export const setCacheItem = <T>(requestedUrl: string, paginatedDocs: T): void => {
  const redisClient = redisContext.getRedisClient()
  if (redisClient) {
    const hash = generateCacheHash(requestedUrl)
    console.log('>> Set Cache Item', requestedUrl)

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
    return
  }
  console.log('Unable to inva;lidate cache')
}
