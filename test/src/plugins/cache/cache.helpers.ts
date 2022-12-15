import crypto from 'crypto'
import { RedisClientType } from 'redis'

const CACHE_INDEXES = 'payload-cache-index'


export function generateCacheHash(
    requestedUrl: string,
): string {
    const pathHash = crypto.createHash('sha256').update(requestedUrl).digest('hex')
    return `payload:${pathHash}`
}

export async function getCacheItem<T = {}>(
    requestedUrl: string,
    redisClient: RedisClientType,
): Promise<T | null> {
    const hash = generateCacheHash(requestedUrl)
    const jsonData = await redisClient.GET(hash)
    if (!jsonData) {
        console.log('<< Get Cache [MISS]', requestedUrl)
        return null
    }
    console.log('<< Get Cache [OK]', requestedUrl)
    return JSON.parse(jsonData) as T
}

export function setCacheItem<T>(
    requestedUrl: string,
    redisClient: RedisClientType,
    paginatedDocs: T
) {
    const hash = generateCacheHash(requestedUrl)
    console.log('>> Set Cache Item', requestedUrl)

    try {
        const data = JSON.stringify(paginatedDocs)

        redisClient.SET(hash, data)
        redisClient.SADD(CACHE_INDEXES, hash)
    } catch (e) {
        console.log(`Unable to set cache for ${requestedUrl}`)
    }
}

export async function invalidateCache(redisClient: RedisClientType,) {
    const indexes = await redisClient.SMEMBERS(CACHE_INDEXES)
    indexes.forEach((index) => {
        redisClient.DEL(index)
        redisClient.SREM(CACHE_INDEXES, index)
    })
}
