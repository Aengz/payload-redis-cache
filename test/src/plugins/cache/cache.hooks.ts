import { CollectionAfterChangeHook, CollectionBeforeOperationHook } from 'payload/types'

export const upsertCache = (redisUrl: string): CollectionAfterChangeHook =>  ({ doc,
    req}) =>{

        console.log('upsert cache')
        // add adapters
}



export const getCache= (redisUrl: string): CollectionBeforeOperationHook => ({ args}) =>{
    console.log(args)
        // add adapters
}
