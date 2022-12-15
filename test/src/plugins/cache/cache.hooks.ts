import { CollectionAfterChangeHook, CollectionBeforeOperationHook } from 'payload/types'
import { invalidateCache, setCacheItem } from './adapters'

export const upsertCache = (redisUrl: string): CollectionAfterChangeHook =>  ({ doc,
    req}) =>{
        const {originalUrl} = req
        console.log('upsert cache')

        // invalidate cache
        invalidateCache(redisUrl)
        // set new cache
        setCacheItem(redisUrl, originalUrl, doc)
}

export const getCache= (redisUrl: string): CollectionBeforeOperationHook => ({ args, operation}) =>{
    // const {originalUrl} = args
    console.log(args)

    if (['read'].includes(operation)){
        // getCacheItem(redisUrl, originalUrl)
    }
}
