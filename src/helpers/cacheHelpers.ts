import { crypto, initRedisContext, InitRedisContextParams, redisContext } from '../adapters'

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
    console.log(`Unable to get cache for ${requestedUrl}`)
    return null
  }

  const hash = generateCacheHash(userCollection, requestedUrl)
  const jsonData = await redisClient.GET(hash)
  if (!jsonData) {
    console.log('<< Get Cache [MISS]', requestedUrl, userCollection)
    return null
  }
  console.log('<< Get Cache [OK]', requestedUrl, userCollection)
  return jsonData
}

export const setCacheItem = <T>(
  userCollection: string,
  requestedUrl: string,
  paginatedDocs: T
): void => {
  const redisClient = redisContext.getRedisClient()
  if (!redisClient) {
    console.log(`Unable to set cache for ${requestedUrl}`)
    return
  }

  const hash = generateCacheHash(userCollection, requestedUrl)
  console.log('>> Set Cache Item', requestedUrl, userCollection)

  try {
    const data = JSON.stringify(paginatedDocs)
    redisClient.SET(hash, data)

    const indexesName = redisContext.getIndexesName()
    redisClient.SADD(indexesName, hash)
  } catch (e) {
    console.log(`Unable to set cache for ${requestedUrl}`)
  }
}

export const invalidateCache = async (): Promise<void> => {
  const redisClient = redisContext.getRedisClient()
  if (!redisClient) {
    console.log('Unable to invalidate cache')
    return
  }

  const indexesName = redisContext.getIndexesName()
  const indexes = await redisClient.SMEMBERS(indexesName)
  indexes.forEach((index) => {
    redisClient.DEL(index)
    redisClient.SREM(indexesName, index)
  })

  console.log('Cache Invalidated')
}

export const initCache = (params: InitRedisContextParams) => {
  initRedisContext(params)
}
