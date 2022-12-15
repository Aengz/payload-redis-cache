import { CollectionAfterChangeHook, CollectionBeforeOperationHook } from 'payload/types'
import { setCacheItem } from './adapters'

export const upsertCache = (redisUrl: string): CollectionAfterChangeHook =>  ({ doc,
    req}) =>{
        const {originalUrl} = req
        console.log('upsert cache')
        setCacheItem(redisUrl, originalUrl, doc)
}

export const getCache= (redisUrl: string): CollectionBeforeOperationHook => ({ args, operation}) =>{
    // const {originalUrl} = args
    console.log(args)

    if (['read'].includes(operation)){
        // getCacheItem(redisUrl, originalUrl)
    }
}
