import { Config } from 'payload/config'
import { initCache } from './helpers'
import { invalidateCacheHook } from './hooks'
import { cacheMiddleware } from './middlewares'
import { PluginOptions } from './types'

export const cachePlugin =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const includedCollections: string[] = []
    const includedGlobals: string[] = []
    // Merge incoming plugin options with the default ones
    const {
      redisUrl,
      redisNamespace = 'payload',
      redisIndexesName = 'payload-cache-index',
      excludedCollections = [],
      excludedGlobals = []
    } = pluginOptions

    // Redis connection
    initCache({
      url: redisUrl,
      namespace: redisNamespace,
      indexesName: redisIndexesName
    })

    const collections = config.collections?.map((collection) => {
      const { hooks } = collection

      if (!excludedCollections.includes(collection.slug)) {
        includedCollections.push(collection.slug)
      }

      const afterChange = [...(hooks?.afterChange || []), invalidateCacheHook]

      return {
        ...collection,
        hooks: {
          ...hooks,
          afterChange
        }
      }
    })

    const globals = config.globals?.map((global) => {
      const { hooks } = global

      if (!excludedGlobals.includes(global.slug)) {
        includedGlobals.push(global.slug)
      }

      const afterChange = [...(hooks?.afterChange || []), invalidateCacheHook]

      return {
        ...global,
        hooks: {
          ...hooks,
          afterChange
        }
      }
    })

    return {
      ...config,
      collections,
      globals,
      express: {
        preMiddleware: [
          ...(config?.express?.preMiddleware || []),
          cacheMiddleware(includedCollections, includedGlobals, config?.routes?.api || '/api')
        ]
      }
    }
  }
