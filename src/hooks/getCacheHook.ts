import { CollectionBeforeOperationHook } from 'payload/types'

export const getCacheHook =
  (redisUrl: string): CollectionBeforeOperationHook =>
  ({ args, operation }) => {
    // const {originalUrl} = args
    console.log(args)

    if (['read'].includes(operation)) {
      // getCacheItem(redisUrl, originalUrl)
    }
  }
