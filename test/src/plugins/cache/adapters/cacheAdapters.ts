import crypto from 'crypto';
import { redisContext } from './redisContext';

const CACHE_INDEXES = 'payload-cache-index'

export function generateCacheHash(
    requestedUrl: string,
): string {
    const pathHash = crypto.createHash('sha256').update(requestedUrl).digest('hex')
    return `payload:${pathHash}`
}

export async function getCacheItem<T = {}>(
    redisURL: string,
    requestedUrl: string,
): Promise<T | null> {
    const redisClient = redisContext.getRedisClient(redisURL)
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
    redisURL: string,
    requestedUrl: string,
    paginatedDocs: T
) {
    const redisClient = redisContext.getRedisClient(redisURL)
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

export async function invalidateCache( redisURL: string) {
    const redisClient = redisContext.getRedisClient(redisURL)
    const indexes = await redisClient.SMEMBERS(CACHE_INDEXES)
    indexes.forEach((index) => {
        redisClient.DEL(index)
        redisClient.SREM(CACHE_INDEXES, index)
    })
}

